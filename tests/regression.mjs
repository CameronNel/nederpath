// NederPath Dedicated Learning Engine Regression Test Suite
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Load Learning engine
const learningSrc = readFileSync(join(ROOT, "js", "learning.js"), "utf8");
const dummyGlobal = {};
new Function("globalThis", "module", "exports", learningSrc)(dummyGlobal, {}, {});
const Learning = dummyGlobal.NederLearning;

// Load Store and SRS
const storeSrc = readFileSync(join(ROOT, "js", "store.js"), "utf8");
const srsSrc = readFileSync(join(ROOT, "js", "srs.js"), "utf8");

// Load data banks
const wordsSrc = readFileSync(join(ROOT, "data", "words.js"), "utf8");
new Function("globalThis", wordsSrc)(dummyGlobal);
const words = dummyGlobal.NP_WORDS;

const grammarSrc = readFileSync(join(ROOT, "data", "grammar.js"), "utf8");
new Function("globalThis", grammarSrc)(dummyGlobal);
const grammar = dummyGlobal.NP_GRAMMAR;

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ [FAIL] ${name}:`, err.message);
  }
}

console.log("\n=======================================================");
console.log("       NederPath Learning Engine Regression Tests      ");
console.log("=======================================================\n");

// -------------------------------------------------------------------
// 1. Non-Mutating Sampling & Shuffling Tests
// -------------------------------------------------------------------
test("Sampling: sampleArray and shuffleArray do not mutate source array", () => {
  const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const copyBefore = original.slice();

  const sampled = Learning.sampleArray(original, 5);
  const shuffled = Learning.shuffleArray(original);

  if (original.length !== 10) throw new Error("Original array length changed");
  for (let i = 0; i < original.length; i++) {
    if (original[i] !== copyBefore[i]) throw new Error("Original array elements were mutated in place");
  }
  if (sampled.length !== 5) throw new Error(`Sampled length was ${sampled.length}, expected 5`);
  if (shuffled.length !== 10) throw new Error(`Shuffled length was ${shuffled.length}, expected 10`);
});

test("Sampling: Full 20,000-word bank is accessible (no first-100 bias)", () => {
  const sample = Learning.sampleArray(words, 20);
  if (sample.length !== 20) throw new Error("Expected 20 sampled items");

  const maxRank = Math.max(...sample.map((w) => w.rank || 0));
  if (maxRank <= 100) {
    throw new Error(`Sampled words appear biased to first 100 (maxRank was ${maxRank})`);
  }
});

// -------------------------------------------------------------------
// 2. Verb Source Integrity (Lemma Infinitive Enforcement)
// -------------------------------------------------------------------
test("Verb Source Integrity: getEligibleVerbs admits ONLY lemma infinitives from 20k bank", () => {
  const eligible = Learning.getEligibleVerbs(words);
  if (!Array.isArray(eligible) || eligible.length === 0) {
    throw new Error("getEligibleVerbs returned empty array");
  }

  // 1. Every candidate must be a lemma infinitive
  for (const v of eligible) {
    if (v.pos !== "verb") {
      throw new Error(`Non-verb found in eligible verbs: ${v.word} (${v.pos})`);
    }
    if (v.inflectionType !== "lemma") {
      throw new Error(`Non-lemma found in eligible verbs: ${v.word} (${v.inflectionType})`);
    }
    if (v.learnable === false) {
      throw new Error(`Non-learnable word found in eligible verbs: ${v.word}`);
    }
  }

  // 2. Representative non-lemma forms (past tenses, participles, plurals) MUST be excluded
  const forbiddenNonLemmas = [
    "waren",
    "hadden",
    "konden",
    "liepen",
    "gezien",
    "gelopen",
    "gewerkt",
    "gemaakt",
    "moesten",
    "zaten",
    "dachten",
    "brachten"
  ];

  const eligibleWordSet = new Set(eligible.map((v) => v.word.toLowerCase()));
  for (const nonLemma of forbiddenNonLemmas) {
    if (eligibleWordSet.has(nonLemma)) {
      throw new Error(`Forbidden non-lemma '${nonLemma}' was admitted as an eligible verb question!`);
    }
  }

  // 3. Genuine lemma infinitives MUST be included
  const expectedLemmas = ["werken", "lopen", "maken", "lezen", "hebben", "kunnen", "wonen"];
  for (const lem of expectedLemmas) {
    if (!eligibleWordSet.has(lem)) {
      throw new Error(`Expected lemma '${lem}' was missing from eligible verbs`);
    }
  }
});

test("Verbs: getVerbHijConjugation resolves regular and irregular verbs correctly", () => {
  if (Learning.getVerbHijConjugation("werken", words) !== "werkt") throw new Error("werken -> werkt failed");
  if (Learning.getVerbHijConjugation("maken", words) !== "maakt") throw new Error("maken -> maakt failed");
  if (Learning.getVerbHijConjugation("lopen", words) !== "loopt") throw new Error("lopen -> loopt failed");
  if (Learning.getVerbHijConjugation("leven", words) !== "leeft") throw new Error("leven -> leeft failed");
  if (Learning.getVerbHijConjugation("eten", words) !== "eet") throw new Error("eten -> eet failed");
  if (Learning.getVerbHijConjugation("zitten", words) !== "zit") throw new Error("zitten -> zit failed");
  if (Learning.getVerbHijConjugation("zijn", words) !== "is") throw new Error("zijn -> is failed");
  if (Learning.getVerbHijConjugation("hebben", words) !== "heeft") throw new Error("hebben -> heeft failed");
  if (Learning.getVerbHijConjugation("kunnen", words) !== "kan") throw new Error("kunnen -> kan failed");
});

test("Verbs: Strict grading rejects arbitrary strings (length > 1 false positives)", () => {
  const expectedHij = Learning.getVerbHijConjugation("werken", words); // "werkt"

  const arbitraryWrongInputs = ["ab", "xyz", "werk", "werken", "werkte", "wrong"];
  for (const wrong of arbitraryWrongInputs) {
    const isCorrect = Learning.normalizeAnswer(wrong) === Learning.normalizeAnswer(expectedHij);
    if (isCorrect) throw new Error(`Input '${wrong}' was falsely graded as correct for verb 'werken'`);
  }

  const correctInput = "werkt";
  const isCorrect = Learning.normalizeAnswer(correctInput) === Learning.normalizeAnswer(expectedHij);
  if (!isCorrect) throw new Error("Correct input 'werkt' was not accepted");
});

// -------------------------------------------------------------------
// 3. Flashcard SRS Semantics (Due Cards First, Unseen Fillers, No Future Cards)
// -------------------------------------------------------------------
test("Flashcard SRS: generateFlashcardSession places due cards first and fills with unseen cards only", () => {
  const mockBank = [
    { id: "due-1", word: "tafel", pos: "noun", learnable: true },
    { id: "due-2", word: "stoel", pos: "noun", learnable: true },
    { id: "future-1", word: "boek", pos: "noun", learnable: true },
    { id: "future-2", word: "pen", pos: "noun", learnable: true },
    { id: "unseen-1", word: "huis", pos: "noun", learnable: true },
    { id: "unseen-2", word: "deur", pos: "noun", learnable: true },
    { id: "unseen-3", word: "raam", pos: "noun", learnable: true },
    { id: "unseen-4", word: "straat", pos: "noun", learnable: true },
    { id: "unseen-5", word: "stad", pos: "noun", learnable: true }
  ];

  const mockSrsCards = {
    "due-1": { id: "due-1", dueDate: new Date(Date.now() - 3600000).toISOString() },
    "due-2": { id: "due-2", dueDate: new Date(Date.now() - 7200000).toISOString() },
    "future-1": { id: "future-1", dueDate: new Date(Date.now() + 86400000).toISOString() },
    "future-2": { id: "future-2", dueDate: new Date(Date.now() + 172800000).toISOString() }
  };

  const dueList = [mockSrsCards["due-1"], mockSrsCards["due-2"]];

  const session = Learning.generateFlashcardSession({
    wordsBank: mockBank,
    srsCards: mockSrsCards,
    dueCards: dueList,
    sessionSize: 5
  });

  if (session.length !== 5) {
    throw new Error(`Expected session length 5, got ${session.length}`);
  }

  // First 2 cards MUST be due cards
  if (session[0].id !== "due-1" || session[1].id !== "due-2") {
    throw new Error(`Due cards were not placed first: [${session[0].id}, ${session[1].id}]`);
  }

  // Future-scheduled cards MUST NOT be present in filler slots
  const sessionIds = session.map((c) => c.id);
  if (sessionIds.includes("future-1") || sessionIds.includes("future-2")) {
    throw new Error("Future-scheduled cards were improperly reintroduced as session fillers!");
  }

  // Remaining 3 cards MUST be unseen cards
  const fillerIds = sessionIds.slice(2);
  for (const fId of fillerIds) {
    if (!fId.startsWith("unseen-")) {
      throw new Error(`Expected unseen filler card, got: ${fId}`);
    }
  }
});

test("Flashcard SRS: Fallback operates cleanly when unseen cards are exhausted", () => {
  const smallBank = [
    { id: "c-1", word: "een", learnable: true },
    { id: "c-2", word: "twee", learnable: true },
    { id: "c-3", word: "drie", learnable: true }
  ];
  const allReviewedSrs = {
    "c-1": { id: "c-1", dueDate: new Date(Date.now() + 86400000).toISOString() },
    "c-2": { id: "c-2", dueDate: new Date(Date.now() + 86400000).toISOString() },
    "c-3": { id: "c-3", dueDate: new Date(Date.now() + 86400000).toISOString() }
  };

  // 0 due cards, 0 unseen cards, requesting session size 2
  const session = Learning.generateFlashcardSession({
    wordsBank: smallBank,
    srsCards: allReviewedSrs,
    dueCards: [],
    sessionSize: 2
  });

  if (session.length !== 2) {
    throw new Error(`Expected fallback session length 2, got ${session.length}`);
  }
});

// -------------------------------------------------------------------
// 4. Fill-in-the-Blank Target Equality (Preventing .includes() bug)
// -------------------------------------------------------------------
test("Fill-in-the-Blank: Target equality rejects sentence words that are not the blank", () => {
  const sentenceItem = {
    id: "snt-test",
    nl: "Ik koop verse groenten op de markt.",
    en: "I buy fresh vegetables at the market.",
    targetWords: ["groenten"]
  };

  const card = Learning.createFillBlankCard(sentenceItem, words);
  if (!card) throw new Error("Failed to create fill-blank card");
  if (card.targetWord.toLowerCase() !== "groenten") throw new Error(`Expected targetWord 'groenten', got '${card.targetWord}'`);

  const isMarktCorrect = Learning.normalizeAnswer("markt") === Learning.normalizeAnswer(card.targetWord);
  if (isMarktCorrect) throw new Error("Incorrect distractor 'markt' was falsely graded as correct");

  const isGroentenCorrect = Learning.normalizeAnswer("groenten") === Learning.normalizeAnswer(card.targetWord);
  if (!isGroentenCorrect) throw new Error("Target word 'groenten' was not graded as correct");
});

// -------------------------------------------------------------------
// 5. Plural Morphology Exact Grading & Oracle Equivalence
// -------------------------------------------------------------------
test("Morphology: getNounPlural resolves direct plurals and never falls back to diminutive plurals", () => {
  const directPluralPairs = {
    oor: "oren",       // not oortjes
    tand: "tanden",   // not tandjes
    lip: "lippen",     // not lipjes
    boek: "boeken",   // not boekjes
    kind: "kinderen", // not kindjes
    stad: "steden"    // not stadjes
  };

  for (const [lemma, expectedPlural] of Object.entries(directPluralPairs)) {
    const actual = Learning.getNounPlural(lemma, words);
    if (actual !== expectedPlural) {
      throw new Error(`getNounPlural('${lemma}') returned '${actual}', expected direct plural '${expectedPlural}'`);
    }
  }
});

test("Morphology: Indexed lookup matches independent direct-plural oracle across all noun lemmas", () => {
  const nounLemmas = words.filter((w) => w.pos === "noun" && w.inflectionType === "lemma");
  if (nounLemmas.length === 0) throw new Error("No noun lemmas found in words bank");

  function oraclePlural(lemmaStr) {
    const l = lemmaStr.toLowerCase().replace(/^(de|het)\s+/, "").trim();
    const row = words.find((w) => {
      if (w.pos !== "noun" || !w.lemma) return false;
      if (w.lemma.toLowerCase() !== l) return false;
      const m = (w.meaning || "").toLowerCase();
      if (m.includes("diminutive")) return false;
      return w.inflectionType === "plural" || m.startsWith("plural of") || m.includes("(plural of");
    });
    return row && row.word ? row.word.toLowerCase().trim() : null;
  }

  for (const n of nounLemmas) {
    const cleanLemma = n.word.toLowerCase().replace(/^(de|het)\s+/, "").trim();
    const indexedResult = Learning.getNounPlural(cleanLemma, words);
    const oracleResult = oraclePlural(cleanLemma);

    if (indexedResult !== oracleResult) {
      throw new Error(`Indexed getNounPlural mismatch for '${cleanLemma}': indexed '${indexedResult}' vs oracle '${oracleResult}'`);
    }
  }
});

test("Morphology: getNounPlural resolves verified plurals from data bank", () => {
  const tafelPlural = Learning.getNounPlural("tafel", words);
  if (tafelPlural !== "tafels") throw new Error(`Expected 'tafels', got '${tafelPlural}'`);

  const kindPlural = Learning.getNounPlural("kind", words);
  if (kindPlural !== "kinderen") throw new Error(`Expected 'kinderen', got '${kindPlural}'`);

  const stadPlural = Learning.getNounPlural("stad", words);
  if (stadPlural !== "steden") throw new Error(`Expected 'steden', got '${stadPlural}'`);
});

test("Morphology: Strict grading rejects false plurals ending in -en or -s", () => {
  const expectedPlural = Learning.getNounPlural("kind", words); // "kinderen"

  const falsePlurals = ["kinden", "kinds", "kindje", "kind", "blabla-en"];
  for (const falsePl of falsePlurals) {
    const isCorrect = Learning.normalizeAnswer(falsePl) === Learning.normalizeAnswer(expectedPlural);
    if (isCorrect) throw new Error(`False plural '${falsePl}' was falsely graded as correct for 'kind'`);
  }

  const isKinderenCorrect = Learning.normalizeAnswer("kinderen") === Learning.normalizeAnswer(expectedPlural);
  if (!isKinderenCorrect) throw new Error("Correct plural 'kinderen' was not accepted");
});

// -------------------------------------------------------------------
// 6. Grammar Word Order Duplicate Token Identity
// -------------------------------------------------------------------
test("Word Order: Duplicate tokens have distinct pool indices and can be placed independently", () => {
  const exercise = {
    type: "word_order",
    tokens: ["Jan", "geeft", "de", "man", "de", "sleutel"],
    correctSentence: "Jan geeft de man de sleutel",
    translation: "Jan gives the man the key."
  };

  const placed = [];

  // Place first "de" (poolIndex: 2)
  placed.push({ poolIndex: 2, text: exercise.tokens[2] });

  // Second "de" (poolIndex: 4) must NOT be marked used by poolIndex: 2
  const isSecondDeUsed = placed.some((p) => p.poolIndex === 4);
  if (isSecondDeUsed) throw new Error("Second 'de' was prematurely marked as used");

  // Place remaining tokens
  placed.unshift({ poolIndex: 1, text: exercise.tokens[1] }); // "geeft"
  placed.unshift({ poolIndex: 0, text: exercise.tokens[0] }); // "Jan"
  placed.push({ poolIndex: 3, text: exercise.tokens[3] }); // "man"
  placed.push({ poolIndex: 4, text: exercise.tokens[4] }); // "de"
  placed.push({ poolIndex: 5, text: exercise.tokens[5] }); // "sleutel"

  const assembled = placed.map((p) => p.text).join(" ");
  const isCorrect = Learning.normalizeAnswer(assembled) === Learning.normalizeAnswer(exercise.correctSentence);
  if (!isCorrect) throw new Error(`Assembled sentence '${assembled}' did not match '${exercise.correctSentence}'`);
});

// -------------------------------------------------------------------
// 7. Local Calendar Date Formatting
// -------------------------------------------------------------------
test("Dates: getLocalISODate formats local calendar date around late local time without UTC shifting", () => {
  const lateEvening = new Date(2026, 7, 13, 23, 30); // 13 August 2026, 23:30 local time
  const isoLate = Learning.getLocalISODate(lateEvening);
  if (isoLate !== "2026-08-13") throw new Error(`Expected '2026-08-13', got '${isoLate}'`);

  const earlyMorning = new Date(2026, 0, 1, 0, 15); // 1 January 2026, 00:15 local time
  const isoEarly = Learning.getLocalISODate(earlyMorning);
  if (isoEarly !== "2026-01-01") throw new Error(`Expected '2026-01-01', got '${isoEarly}'`);
});

// -------------------------------------------------------------------
// 8. Strict Calendar and Leap-Year Date Validation
// -------------------------------------------------------------------
test("Dates: isValidISODateString enforces strict calendar dates and leap-year correctness", () => {
  // Invalid calendar dates must return false
  if (Learning.isValidISODateString("2026-02-30") !== false) {
    throw new Error("2026-02-30 was falsely validated as a valid date");
  }
  if (Learning.isValidISODateString("2025-02-29") !== false) {
    throw new Error("2025-02-29 (non-leap year) was falsely validated as a valid date");
  }
  if (Learning.isValidISODateString("2026-04-31") !== false) {
    throw new Error("2026-04-31 (April only has 30 days) was falsely validated as a valid date");
  }
  if (Learning.isValidISODateString("invalid-date") !== false) {
    throw new Error("'invalid-date' was falsely validated as a valid date");
  }

  // Valid calendar dates must return true
  if (Learning.isValidISODateString("2024-02-29") !== true) {
    throw new Error("2024-02-29 (leap year) was rejected");
  }
  if (Learning.isValidISODateString("2026-08-13") !== true) {
    throw new Error("2026-08-13 was rejected");
  }
  if (Learning.isValidISODateString("2026-08-13T22:04:44.123Z") !== true) {
    throw new Error("2026-08-13T22:04:44.123Z was rejected");
  }
});

// -------------------------------------------------------------------
// 9. Complete Valid Backup Merge & Schema Preservation
// -------------------------------------------------------------------
test("Backup: Complete valid backup merges allowed fields and preserves defaults for missing fields", () => {
  const defaultState = {
    version: 1,
    user: { name: "Learner", level: "A1", dailyGoal: 15, sessionSize: 10, streak: 0, totalXp: 0, lastActiveDate: null },
    settings: { theme: "dark", sessionSize: 10, dailyGoal: 15, autoAdvance: true, hapticFeedback: true },
    srs: { cards: {} },
    progress: {
      grammarCompleted: {},
      comprehensionCompleted: {},
      wordsBookmarked: {},
      studyDays: {},
      articleStats: { totalDrilled: 0, correct: 0, mistakes: {} },
      dailyStats: { date: "2026-08-13", learnedToday: 0 }
    }
  };

  const completeBackup = {
    user: {
      name: "Cameron",
      level: "B1",
      dailyGoal: 25,
      sessionSize: 15,
      streak: 12,
      totalXp: 1850,
      lastActiveDate: "2026-08-13"
    },
    settings: {
      theme: "light",
      autoAdvance: false
    },
    progress: {
      wordsBookmarked: { "nl-00001": true, "nl-00002": true },
      grammarCompleted: { "g-001": { score: 100, attempts: 2, completedAt: "2026-08-13T10:00:00Z" } },
      comprehensionCompleted: { "comp-001": { score: 100, totalQuestions: 4, completedAt: "2026-08-13T10:30:00Z" } },
      studyDays: { "2026-08-13": 25 },
      articleStats: { totalDrilled: 30, correct: 28, mistakes: { tafel: 2 } },
      dailyStats: { date: "2026-08-13", learnedToday: 25 }
    },
    srs: {
      cards: {
        "nl-00001": { id: "nl-00001", type: "vocab", interval: 4, repetitions: 2, easeFactor: 2.5, lapses: 0, dueDate: "2026-08-17T10:00:00Z", state: "review" }
      }
    }
  };

  const merged = Learning.validateAndMergeBackup(completeBackup, defaultState);

  // Assert user fields merged
  if (merged.user.name !== "Cameron") throw new Error("user.name failed to merge");
  if (merged.user.level !== "B1") throw new Error("user.level failed to merge");
  if (merged.user.dailyGoal !== 25) throw new Error("user.dailyGoal failed to merge");
  if (merged.user.sessionSize !== 15) throw new Error("user.sessionSize failed to merge");
  if (merged.user.streak !== 12) throw new Error("user.streak failed to merge");
  if (merged.user.totalXp !== 1850) throw new Error("user.totalXp failed to merge");
  if (merged.user.lastActiveDate !== "2026-08-13") throw new Error("user.lastActiveDate failed to merge");

  // Assert settings fields merged
  if (merged.settings.theme !== "light") throw new Error("settings.theme failed to merge");
  if (merged.settings.autoAdvance !== false) throw new Error("settings.autoAdvance failed to merge");
  // Missing settings field retained default
  if (merged.settings.hapticFeedback !== true) throw new Error("settings.hapticFeedback default was lost");

  // Assert progress merged
  if (!merged.progress.wordsBookmarked["nl-00001"] || !merged.progress.wordsBookmarked["nl-00002"]) {
    throw new Error("progress.wordsBookmarked failed to merge");
  }
  if (!merged.progress.grammarCompleted["g-001"] || merged.progress.grammarCompleted["g-001"].score !== 100) {
    throw new Error("progress.grammarCompleted failed to merge");
  }
  if (!merged.progress.comprehensionCompleted["comp-001"]) {
    throw new Error("progress.comprehensionCompleted failed to merge");
  }
  if (merged.progress.studyDays["2026-08-13"] !== 25) {
    throw new Error("progress.studyDays failed to merge");
  }
  if (merged.progress.articleStats.totalDrilled !== 30 || merged.progress.articleStats.correct !== 28) {
    throw new Error("progress.articleStats failed to merge");
  }

  // Assert SRS merged
  if (!merged.srs.cards["nl-00001"] || merged.srs.cards["nl-00001"].interval !== 4) {
    throw new Error("srs.cards failed to merge");
  }
});

// -------------------------------------------------------------------
// 10. Security: Recursive Prototype Pollution, International Unicode, Bounds
// -------------------------------------------------------------------
test("Security: Recursive prototype-pollution injection is rejected and Object.prototype is pristine", () => {
  const defaultState = {
    version: 1,
    user: { name: "Learner", level: "A1", dailyGoal: 15, sessionSize: 10, streak: 0, totalXp: 0 },
    settings: { theme: "dark", sessionSize: 10, dailyGoal: 15, autoAdvance: true, hapticFeedback: true },
    srs: { cards: {} },
    progress: { grammarCompleted: {}, comprehensionCompleted: {}, wordsBookmarked: {}, studyDays: {}, articleStats: { totalDrilled: 0, correct: 0, mistakes: {} }, dailyStats: { date: "2026-08-13", learnedToday: 0 } }
  };

  // 1. Nested in progress.grammarCompleted.__proto__
  const nestedAttack1 = JSON.parse('{"progress": {"grammarCompleted": {"__proto__": {"polluted1": "yes"}}}}');
  let caught = false;
  try {
    Learning.validateAndMergeBackup(nestedAttack1, defaultState);
  } catch {
    caught = true;
  }
  if (!caught) throw new Error("Failed to reject nested __proto__ attack in grammarCompleted");
  if (({}).polluted1 !== undefined) throw new Error("Object.prototype was polluted with polluted1!");

  // 2. Nested in srs.cards.constructor
  const nestedAttack2 = JSON.parse('{"srs": {"cards": {"constructor": {"prototype": {"polluted2": "yes"}}}}}');
  caught = false;
  try {
    Learning.validateAndMergeBackup(nestedAttack2, defaultState);
  } catch {
    caught = true;
  }
  if (!caught) throw new Error("Failed to reject nested constructor attack in srs.cards");
  if (({}).polluted2 !== undefined) throw new Error("Object.prototype was polluted with polluted2!");

  // 3. Nested in articleStats.mistakes.prototype
  const nestedAttack3 = JSON.parse('{"progress": {"articleStats": {"mistakes": {"prototype": {"polluted3": "yes"}}}}}');
  caught = false;
  try {
    Learning.validateAndMergeBackup(nestedAttack3, defaultState);
  } catch {
    caught = true;
  }
  if (!caught) throw new Error("Failed to reject nested prototype attack in articleStats.mistakes");
  if (({}).polluted3 !== undefined) throw new Error("Object.prototype was polluted with polluted3!");
});

test("Security: International Unicode names (Søren 李) are preserved while HTML/XSS sinks are sanitized and escaped", () => {
  const defaultState = {
    version: 1,
    user: { name: "Learner", level: "A1", dailyGoal: 15, sessionSize: 10, streak: 0, totalXp: 0 },
    settings: { theme: "dark", sessionSize: 10, dailyGoal: 15, autoAdvance: true, hapticFeedback: true },
    srs: { cards: {} },
    progress: { grammarCompleted: {}, comprehensionCompleted: {}, wordsBookmarked: {}, studyDays: {}, articleStats: { totalDrilled: 0, correct: 0, mistakes: {} }, dailyStats: { date: "2026-08-13", learnedToday: 0 } }
  };

  // International Unicode name with tags stripped
  const unicodeBackup = {
    user: { name: "<script>alert(1)</script> Søren 李" }
  };
  const mergedUnicode = Learning.validateAndMergeBackup(unicodeBackup, defaultState);
  if (!mergedUnicode.user.name.includes("Søren 李")) {
    throw new Error(`International Unicode name was not preserved: '${mergedUnicode.user.name}'`);
  }
  if (mergedUnicode.user.name.includes("<script>") || mergedUnicode.user.name.includes("</script>")) {
    throw new Error(`Unsanitized script tags found in user.name: '${mergedUnicode.user.name}'`);
  }

  // HTML injection with img tag
  const xssBackup = {
    user: { name: "<img src=x onerror=alert('pwned')> Cameron" }
  };
  const mergedXSS = Learning.validateAndMergeBackup(xssBackup, defaultState);
  if (mergedXSS.user.name.includes("<") || mergedXSS.user.name.includes(">")) {
    throw new Error(`Unsanitized HTML tag characters found in merged user.name: '${mergedXSS.user.name}'`);
  }
  if (!mergedXSS.user.name.includes("Cameron")) {
    throw new Error(`Name Cameron was lost: '${mergedXSS.user.name}'`);
  }

  // escapeHTML escapes all dangerous HTML characters
  const escaped = Learning.escapeHTML("<script>alert('pwned') & \"quotes\"</script>");
  if (escaped !== "&lt;script&gt;alert(&#39;pwned&#39;) &amp; &quot;quotes&quot;&lt;/script&gt;") {
    throw new Error(`escapeHTML failed: '${escaped}'`);
  }
});

test("Security: Invalid dates, absurd numeric counters, and oversized collections are bounded", () => {
  const defaultState = {
    version: 1,
    user: { name: "Learner", level: "A1", dailyGoal: 15, sessionSize: 10, streak: 0, totalXp: 0 },
    settings: { theme: "dark", sessionSize: 10, dailyGoal: 15, autoAdvance: true, hapticFeedback: true },
    srs: { cards: {} },
    progress: { grammarCompleted: {}, comprehensionCompleted: {}, wordsBookmarked: {}, studyDays: {}, articleStats: { totalDrilled: 0, correct: 0, mistakes: {} }, dailyStats: { date: "2026-08-13", learnedToday: 0 } }
  };

  const pathologicalBackup = {
    user: {
      totalXp: 99999999999999, // Absurd XP
      streak: -50,              // Negative streak
      lastActiveDate: "2026-02-30" // Impossible date
    },
    settings: {
      dailyGoal: 99999999       // Absurd goal
    },
    progress: {
      studyDays: {
        "9999-99-99": 5,        // Invalid date key
        "2026-08-13": 25
      },
      grammarCompleted: {}
    }
  };

  // Add 1,000 keys to grammarCompleted to test capping
  for (let i = 0; i < 1000; i++) {
    pathologicalBackup.progress.grammarCompleted[`rule-${i}`] = { score: 100 };
  }

  const merged = Learning.validateAndMergeBackup(pathologicalBackup, defaultState);

  if (merged.user.totalXp > 10000000) throw new Error(`totalXp was not capped: ${merged.user.totalXp}`);
  if (merged.user.streak < 0) throw new Error(`Negative streak was admitted: ${merged.user.streak}`);
  if (merged.user.lastActiveDate === "2026-02-30") throw new Error("Impossible calendar date 2026-02-30 was admitted into lastActiveDate");
  if (merged.settings.dailyGoal > 500) throw new Error(`dailyGoal was not capped: ${merged.settings.dailyGoal}`);
  if (merged.progress.studyDays["9999-99-99"] !== undefined) throw new Error("Invalid date key in studyDays was admitted");
  if (Object.keys(merged.progress.grammarCompleted).length > 500) throw new Error("grammarCompleted collection was not capped to safe limit");
});

// -------------------------------------------------------------------
// 11. Spaced Repetition Due Card Filtering
// -------------------------------------------------------------------
test("SRS: getDueCards accurately identifies cards with past due dates", () => {
  const dummyStore = {
    state: {
      srs: {
        cards: {
          "c-1": { id: "c-1", type: "vocab", dueDate: new Date(Date.now() - 3600000).toISOString() }, // 1 hour ago (due)
          "c-2": { id: "c-2", type: "vocab", dueDate: new Date(Date.now() + 86400000).toISOString() } // tomorrow (not due)
        }
      }
    }
  };

  const dummyGlobalSRS = { NederStore: dummyStore };
  new Function("globalThis", srsSrc)(dummyGlobalSRS);
  const srs = dummyGlobalSRS.NederSRS;

  const due = srs.getDueCards("vocab");
  if (due.length !== 1 || due[0].id !== "c-1") {
    throw new Error(`Expected 1 due card ('c-1'), got ${due.length}`);
  }
});

console.log(`\n=======================================================`);
console.log(`Regression Tests Complete: ${passed} Passed, ${failed} Failed`);
console.log(`=======================================================\n`);

if (failed > 0) process.exit(1);
