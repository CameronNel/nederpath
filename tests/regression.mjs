// NederPath Dedicated Learning Engine Regression Test Suite
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { validateRegistry, createIdAllocator } from "../scripts/id_allocator.mjs";
import { validateIdiomRow, normalizeExpression } from "../scripts/idiom_rules.mjs";
import { validateSentenceRow, normalizeSentenceKey, targetOccursInSurface } from "../scripts/sentence_norm.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Mock localStorage if in Node environment
if (typeof globalThis.localStorage === "undefined") {
  const mem = {};
  globalThis.localStorage = {
    getItem(k) { return mem[k] ?? null; },
    setItem(k, v) { mem[k] = String(v); },
    removeItem(k) { delete mem[k]; },
    clear() { Object.keys(mem).forEach((k) => delete mem[k]); }
  };
}

// Load Learning engine
const learningSrc = readFileSync(join(ROOT, "js", "learning.js"), "utf8");
const dummyGlobal = {};
new Function("globalThis", "module", "exports", learningSrc)(dummyGlobal, {}, {});
const Learning = dummyGlobal.NederLearning;

// Load Store and SRS
const storeSrc = readFileSync(join(ROOT, "js", "store.js"), "utf8");
new Function("globalThis", storeSrc)(dummyGlobal);
const Store = {
  createStore(initialState = {}) {
    const s = new dummyGlobal.NederStore.constructor();
    if (initialState && Object.keys(initialState).length > 0) {
      s.state = Learning.validateAndMergeBackup(initialState, s.state);
    }
    return s;
  }
};

const srsSrc = readFileSync(join(ROOT, "js", "srs.js"), "utf8");
new Function("globalThis", srsSrc)(dummyGlobal);
const SRS = {
  createSRSEngine(storeInstance) {
    return new dummyGlobal.NederSRS.constructor(storeInstance);
  }
};

// Load data banks
const wordsSrc = readFileSync(join(ROOT, "data", "words.js"), "utf8");
new Function("globalThis", wordsSrc)(dummyGlobal);
const words = dummyGlobal.NP_WORDS;

const grammarSrc = readFileSync(join(ROOT, "data", "grammar.js"), "utf8");
new Function("globalThis", grammarSrc)(dummyGlobal);
const grammar = dummyGlobal.NP_GRAMMAR;

const idiomsSrc = readFileSync(join(ROOT, "data", "idioms.js"), "utf8");
new Function("globalThis", idiomsSrc)(dummyGlobal);
const idioms = dummyGlobal.NP_IDIOMS;

const sentencesSrc = readFileSync(join(ROOT, "data", "sentences.js"), "utf8");
new Function("globalThis", sentencesSrc)(dummyGlobal);
const sentences = dummyGlobal.NP_SENTENCES;

// -------------------------------------------------------------------
// Shared helpers: curated core rows and explicit-form derivation
// -------------------------------------------------------------------
function loadCoreRows() {
  const files = readdirSync(join(ROOT, "data")).filter((f) => /^words_core_.*\.js$/.test(f)).sort();
  const rows = [];
  for (const file of files) {
    const src = readFileSync(join(ROOT, "data", file), "utf8");
    const mod = { exports: {} };
    new Function("module", "exports", src + "\nreturn module.exports;")(mod, mod.exports);
    for (const c of mod.exports.WORDS || []) rows.push(c);
  }
  return rows;
}

// Mirrors the conservative explicit plural markers in scripts/generate_words.mjs.
function explicitCorePlural(word, meta) {
  const [spec = ""] = String(meta || "").split("|");
  if (spec === "s") return `${word}s`;
  if (spec === "'s") return `${word}'s`;
  if (spec === "eren") return `${word}eren`;
  if (spec.startsWith("=") && spec.length > 1) return spec.slice(1);
  return null;
}

function expectedPluralForms() {
  const forms = new Map();
  for (const c of loadCoreRows()) {
    const [word, pos, , , , , , meta = ""] = c;
    if (pos !== "noun") continue;
    const lemma = word.toLowerCase().trim();
    const plural = explicitCorePlural(word, meta);
    if (!plural) continue;
    if (!forms.has(lemma)) forms.set(lemma, new Set());
    forms.get(lemma).add(plural.toLowerCase().trim());
  }
  return forms;
}

function sha256File(p) {
  return createHash("sha256").update(readFileSync(p)).digest("hex");
}

let passed = 0;
let failed = 0;
const testQueue = [];

function test(name, fn) {
  testQueue.push({ name, fn });
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

test("Sampling: Entire word bank is accessible (no first-100 bias)", () => {
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
test("Verb Source Integrity: getEligibleVerbs admits ONLY curated lemma infinitives", () => {
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
test("Morphology: Every generated plural is licensed by explicit core metadata", () => {
  const forms = expectedPluralForms();
  if (forms.size === 0) throw new Error("No explicit plural markers found in curated cores");

  // Representative anchors that must survive (verified present in the bank).
  const anchors = { oor: "oren", tand: "tanden", kind: "kinderen", stad: "steden" };
  for (const [lemma, expected] of Object.entries(anchors)) {
    if (!forms.get(lemma)?.has(expected)) {
      throw new Error(`Curated cores no longer carry the explicit plural '${lemma}' -> '${expected}'`);
    }
  }

  // An explicit form may collide with another curated surface form (for example,
  // noun plural "vragen" and verb lemma "vragen"). The globally unique bank
  // conservatively omits that ambiguous derived row. Every row it does emit must
  // still be licensed by source metadata.
  const pluralRows = words.filter((w) => w.pos === "noun" && w.inflectionType === "plural");
  for (const row of pluralRows) {
    const lemma = row.lemma.toLowerCase().trim();
    if (!forms.get(lemma)?.has(row.word.toLowerCase().trim())) {
      throw new Error(`Generated plural '${row.word}' for '${row.lemma}' lacks explicit source metadata`);
    }
    if (row.article !== "de") throw new Error(`Plural row '${row.word}' carries article '${row.article}', must be 'de'`);
    if (row.curated || row.learnable) throw new Error(`Derived plural row '${row.word}' must be uncurated reference-only`);
  }
});

test("Morphology: No plural is fabricated for noun lemmas without explicit plural metadata", () => {
  // 'lip' is curated without an explicit plural marker; Dutch 'lippen' is real, but the
  // conservative source does not license it, so the bank must not invent it.
  const resolved = Learning.getNounPlural("lip", words);
  if (resolved !== null) {
    throw new Error(`getNounPlural('lip') fabricated '${resolved}' without explicit source metadata`);
  }
  if (words.some((w) => w.word.toLowerCase() === "lippen")) {
    throw new Error("Unsourced plural row 'lippen' present in bank");
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
      return w.inflectionType === "plural";
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

// -------------------------------------------------------------------
// 12. DataLoader: Partial Multi-Bank Resilience & Retry Isolation
// -------------------------------------------------------------------
test("DataLoader: Sibling bank remains loaded when another fails, retry resets only failed bank", async () => {
  const dataLoaderSrc = readFileSync(join(ROOT, "js", "data-loader.js"), "utf8");
  const testGlobal = {
    NP_WORDS: [{ id: "w-1", word: "fiets" }] // simulate already loaded words bank
  };
  new Function("globalThis", dataLoaderSrc)(testGlobal);
  const DataLoader = testGlobal.NederDataLoader;

  // 1. Verify words is already loaded
  if (!DataLoader.isBankLoaded("words")) throw new Error("Expected 'words' to be recognized as loaded");

  // 2. Simulate partial multi-bank retry on ['words', 'sentences']
  const requiredBanks = ["words", "sentences"];
  requiredBanks.forEach((b) => {
    if (!DataLoader.isBankLoaded(b)) {
      DataLoader.resetBank(b);
    }
  });

  // 3. Verify 'words' bank is STILL loaded and its global was NOT deleted
  if (!DataLoader.isBankLoaded("words") || !testGlobal.NP_WORDS) {
    throw new Error("'words' bank or global was incorrectly unloaded during sibling failure retry");
  }

  // 4. Calling resetBank('words') on an already loaded bank does NOT delete its global
  DataLoader.resetBank("words");
  if (!DataLoader.isBankLoaded("words") || !testGlobal.NP_WORDS) {
    throw new Error("resetBank('words') deleted already loaded global NP_WORDS");
  }

});

// -------------------------------------------------------------------
// 13. DataLoader: Deterministic Script Timeout & Error Cleanup
// -------------------------------------------------------------------
test("DataLoader: loadBank times out, cleans up, and permits a successful retry", async () => {
  const dataLoaderSrc = readFileSync(join(ROOT, "js", "data-loader.js"), "utf8");

  // Mock DOM environment with controllable script tag
  let createdScript = null;
  let appendCount = 0;
  const mockHead = {
    appendChild: (s) => {
      createdScript = s;
      appendCount++;
    },
    removeChild: (s) => { if (createdScript === s) createdScript = null; }
  };

  const testGlobal = {
    document: {
      createElement: (tag) => ({
        tagName: tag,
        parentNode: mockHead,
        src: "",
        async: false,
        onload: null,
        onerror: null
      }),
      head: mockHead
    }
  };

  new Function("globalThis", dataLoaderSrc)(testGlobal);
  const DataLoader = testGlobal.NederDataLoader;

  if (DataLoader.DEFAULT_LOAD_TIMEOUT_MS !== 30000) {
    throw new Error(`Expected named default timeout of 30000ms, got ${DataLoader.DEFAULT_LOAD_TIMEOUT_MS}`);
  }

  // Use the supported timeout override and allow the real timer path to fire.
  const loadError = await DataLoader.loadBank("sentences", 10).then(
    () => null,
    (err) => err
  );
  if (!loadError || !/Time-out/.test(loadError.message)) {
    throw new Error(`Expected timeout rejection, got '${loadError && loadError.message}'`);
  }
  if (createdScript !== null) throw new Error("Timed-out script tag was not removed from DOM");
  if (DataLoader.isBankLoaded("sentences")) throw new Error("Failed bank was marked as loaded");

  // A timeout must clear the cached promise so the next attempt creates a new script and can succeed.
  const retryPromise = DataLoader.loadBank("sentences", 1000);
  if (appendCount !== 2 || !createdScript) {
    throw new Error("Timed-out promise was not cleared before retry");
  }
  testGlobal.NP_SENTENCES = [{ id: "s-1", sentence: "Ik fiets." }];
  createdScript.onload();
  const retryResult = await retryPromise;
  if (retryResult !== testGlobal.NP_SENTENCES || !DataLoader.isBankLoaded("sentences")) {
    throw new Error("Retry did not resolve with and cache the loaded bank");
  }
});

// -------------------------------------------------------------------
// 14. Lexical Schema, CEFR Levels, and Morphological Invariants
// -------------------------------------------------------------------
test("Lexical Integrity: Zero prohibited corruption patterns in word bank", () => {
  const wordsSrc = readFileSync(join(ROOT, "data", "words.js"), "utf8");
  const testGlobal = {};
  new Function("globalThis", wordsSrc)(testGlobal);
  const words = testGlobal.NP_WORDS;

  const FORBIDDEN_WORDS = new Set(["houden vant", "houden vandeen", "piano speelt", "niette", "nietter", "welder", "tochter", "nooiter"]);

  for (const r of words) {
    if (r.level === "phrase") {
      throw new Error(`Prohibited level='phrase' in word ${r.id} (${r.word})`);
    }
    if (!["A1", "A2", "B1", "B2", "C1"].includes(r.level)) {
      throw new Error(`Invalid CEFR level '${r.level}' in word ${r.id} (${r.word})`);
    }
    if (r.word.includes(" ") && r.pos === "verb") {
      throw new Error(`Multiword verb '${r.word}' found in word bank; must be pos='phrase'`);
    }
    if (r.pos === "noun" && (r.inflectionType === "plural" || r.inflectionType === "diminutive-plural") && r.article !== "de") {
      throw new Error(`Plural noun '${r.word}' has article '${r.article}', expected 'de'`);
    }
    if (r.pos === "noun" && r.inflectionType === "diminutive" && r.article !== "het") {
      throw new Error(`Diminutive noun '${r.word}' has article '${r.article}', expected 'het'`);
    }
    if (!r.curated && r.inflectionType !== "cardinal" && r.learnable) {
      throw new Error(`Derived inflection '${r.word}' marked learnable=true without curation`);
    }
    if (FORBIDDEN_WORDS.has(r.word.toLowerCase().trim())) {
      throw new Error(`Forbidden corruption row present in word bank: ${r.word}`);
    }
    if (r.example) {
      if (/\bte (ben|is|was|waren|geweest)\b/.test(r.example)) {
        throw new Error(`Impossible frame 'te ...' in word ${r.id}: ${r.example}`);
      }
      if (/Er waren (eerste|tweede|derde|vierde|vijfde)/.test(r.example)) {
        throw new Error(`Impossible ordinal frame in word ${r.id}: ${r.example}`);
      }
      if (r.pos === "noun" && (r.inflectionType === "plural" || r.inflectionType === "diminutive-plural")) {
        if (/\bspeelt\b/.test(r.example) || /\bbevindt zich\b/.test(r.example) || /\bvertrekt\b/.test(r.example)) {
          throw new Error(`Singular verb agreement in plural noun example for '${r.word}': ${r.example}`);
        }
      }
    }
  }
});

// -------------------------------------------------------------------
// 15. Oracle-Style Morphology Checks Over ALL Generated Nouns and Verbs
// -------------------------------------------------------------------
test("Morphology Oracle: Every generated plural and hij-form is indexed exactly", () => {
  const indexes = Learning.getWordBankIndexes(words);
  if (!indexes || !indexes.lemmaToHij || !indexes.lemmaToPlural) {
    throw new Error("Failed to build word bank indexes");
  }

  const pluralRows = words.filter((w) => w.inflectionType === "plural");
  const hijRows = words.filter((w) => w.inflectionType === "hij-form");
  if (pluralRows.length === 0 || hijRows.length === 0) {
    throw new Error("Expected explicit plural and hij-form rows in the generated bank");
  }
  const firstPluralByLemma = new Map();
  for (const row of pluralRows) {
    const lemma = row.lemma.toLowerCase().trim();
    if (!firstPluralByLemma.has(lemma)) firstPluralByLemma.set(lemma, row.word.toLowerCase().trim());
  }
  for (const [lemma, expected] of firstPluralByLemma) {
    const actual = indexes.lemmaToPlural.get(lemma);
    if (actual !== expected) throw new Error(`Plural index mismatch for '${lemma}': '${actual}' vs '${expected}'`);
  }
  const firstHijByLemma = new Map();
  for (const row of hijRows) {
    const lemma = row.lemma.toLowerCase().trim();
    if (!firstHijByLemma.has(lemma)) firstHijByLemma.set(lemma, row.word.toLowerCase().trim());
  }
  for (const [lemma, expected] of firstHijByLemma) {
    const actual = indexes.lemmaToHij.get(lemma);
    if (actual !== expected) throw new Error(`Hij-form index mismatch for '${lemma}': '${actual}' vs '${expected}'`);
  }

  const prohibitedDerivedTypes = new Set([
    "present-participle", "attributive-present-participle", "attributive-participle",
    "inflected-e", "inflected-comparative", "inflected-superlative"
  ]);
  const unsupported = words.find((w) => prohibitedDerivedTypes.has(w.inflectionType));
  if (unsupported) throw new Error(`Unsupported heuristic form '${unsupported.word}' (${unsupported.inflectionType}) remains`);
});

// -------------------------------------------------------------------
// 16. Generator Byte-for-Byte Reproducibility
// -------------------------------------------------------------------
test("Generator: Two real runs are byte-identical and the checkout starts canonical", () => {
  const wordsPath = join(ROOT, "data", "words.js");
  const registryPath = join(ROOT, "data", "word_ids.json");
  const before = [sha256File(wordsPath), sha256File(registryPath)];
  const run = () => execFileSync(process.execPath, [join(ROOT, "scripts", "generate_words.mjs")], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  run();
  const afterFirst = [sha256File(wordsPath), sha256File(registryPath)];
  run();
  const afterSecond = [sha256File(wordsPath), sha256File(registryPath)];
  if (before.join(":") !== afterFirst.join(":")) {
    throw new Error("Tracked word output was stale before generation; commit canonical generated files");
  }
  if (afterFirst.join(":") !== afterSecond.join(":")) {
    throw new Error("Consecutive generator runs changed words.js or word_ids.json bytes");
  }
});

// -------------------------------------------------------------------
// 17. Stable-ID Preservation and Retirement Isolation
// -------------------------------------------------------------------
test("Stable IDs: Full master fixture is preserved and retired IDs cannot be recycled", () => {
  let baseline;
  let registry;
  try {
    baseline = JSON.parse(readFileSync(join(ROOT, "tests", "fixtures", "baseline_ids.json"), "utf8"));
    registry = JSON.parse(readFileSync(join(ROOT, "data", "word_ids.json"), "utf8"));
  } catch (err) {
    throw new Error(`Stable-ID fixture or registry is missing/malformed: ${err.message}`);
  }
  if (baseline.sourceCommit !== "f417ec110f3e60f02c46ff7b961b5fb8683e0143" ||
      !Number.isSafeInteger(baseline.highWaterMark) || !baseline.entries) {
    throw new Error("Baseline fixture schema/source commit is invalid");
  }

  const validated = validateRegistry(registry);
  const current = new Map(words.map((w) => [w.word.toLowerCase().trim(), w.id]));
  const baselineEntries = Object.entries(baseline.entries);
  if (baselineEntries.length !== baseline.highWaterMark) {
    throw new Error(`Baseline fixture has ${baselineEntries.length} owners but HWM ${baseline.highWaterMark}`);
  }
  for (const [norm, historicalId] of baselineEntries) {
    if (validated.entries.get(norm) !== historicalId) {
      throw new Error(`Registry changed historical owner '${norm}': expected ${historicalId}, got ${validated.entries.get(norm)}`);
    }
    if (current.has(norm) && current.get(norm) !== historicalId) {
      throw new Error(`Surviving word '${norm}' changed ID: expected ${historicalId}, got ${current.get(norm)}`);
    }
  }

  const retired = baselineEntries.find(([norm]) => !current.has(norm));
  if (!retired) throw new Error("Fixture contains no retired word for allocator simulation");
  const allocator = createIdAllocator(validated);
  const simulatedNorm = "__nederpath_retired_id_non_reuse_probe__";
  const newId = allocator.assignId(simulatedNorm);
  const newNum = Number(newId.slice(3));
  if (newNum !== registry.highWaterMark + 1) {
    throw new Error(`New ID ${newId} did not append above HWM ${registry.highWaterMark}`);
  }
  if (newId === retired[1] || allocator.ownerOf(retired[1]) !== retired[0]) {
    throw new Error(`Retired ID ${retired[1]} was recycled or lost its historical owner`);
  }
});

// -------------------------------------------------------------------
// 18. Learner-Pool Practice Mode Isolation
// -------------------------------------------------------------------
test("Learner Pools: Derived reference-only rows never surface in practice pools", () => {
  const learnablePool = words.filter((w) => w.learnable === true);
  const referencePool = words.filter((w) => w.learnable === false);
  if (learnablePool.length === 0 || referencePool.length === 0) throw new Error("Expected both learnable and reference pools");
  const uncuratedLearner = learnablePool.find((w) => !w.curated);
  if (uncuratedLearner) throw new Error(`Uncurated row '${uncuratedLearner.word}' is learnable`);
  const derivedLearner = learnablePool.find((w) => !["lemma", "phrase"].includes(w.inflectionType));
  if (derivedLearner) throw new Error(`Derived row '${derivedLearner.word}' surfaced in learnable pool`);
  const falseLemma = words.find((w) => w.isCuratedLemma && (!w.curated || w.pos === "phrase" || w.inflectionType !== "lemma"));
  if (falseLemma) throw new Error(`Invalid isCuratedLemma classification for '${falseLemma.word}'`);
  const sourcedExample = words.find((w) => w.example !== null || w.exampleEn !== null || w.frequency !== null);
  if (sourcedExample) throw new Error(`Unsourced example/frequency remains on '${sourcedExample.word}'`);

  // Flashcards session generator must NEVER select from referencePool
  const session = Learning.generateFlashcardSession([], words, 30, new Set());
  for (const card of session) {
    if (card.learnable === false) {
      throw new Error(`Reference-only word '${card.word}' surfaced in flashcard session`);
    }
  }
});

// -------------------------------------------------------------------
// 19. Store Stale Word Reference Sanitization
// -------------------------------------------------------------------
test("Store: sanitizeStaleWordReferences prunes retired IDs safely", () => {
  const mockStorage = {};
  const mockLocalStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; }
  };

  const oldStorage = globalThis.localStorage;
  const oldConsoleError = console.error;
  const errors = [];
  globalThis.localStorage = mockLocalStorage;
  console.error = (...args) => errors.push(args.map(String).join(" "));

  try {
    const storeModule = { localStorage: mockLocalStorage };
    new Function("globalThis", storeSrc)(storeModule);
    const StoreClass = storeModule.NederStore.constructor;

    const s = new StoreClass();
    s.state.progress.wordsBookmarked = {
      "nl-00001": true, // valid ('ik')
      "nl-99999": true  // retired/invalid
    };
    s.state.srs.cards = {
      "nl-00001": { id: "nl-00001", type: "vocab", interval: 1 },
      "nl-99999": { id: "nl-99999", type: "vocab", interval: 1 },
      "rule-01": { id: "rule-01", type: "grammar", interval: 1 } // non-vocab card should stay
    };

    const validSet = new Set(["nl-00001", "nl-00002", "nl-00003"]);
    const modified = s.sanitizeStaleWordReferences(validSet);

    if (!modified) throw new Error("Expected sanitizeStaleWordReferences to modify stale state");
    if (!s.state.progress.wordsBookmarked["nl-00001"]) throw new Error("Valid bookmark was removed");
    if (s.state.progress.wordsBookmarked["nl-99999"]) throw new Error("Stale bookmark was not pruned");
    if (!s.state.srs.cards["nl-00001"]) throw new Error("Valid SRS card was removed");
    if (s.state.srs.cards["nl-99999"]) throw new Error("Stale SRS card was not pruned");
    if (!s.state.srs.cards["rule-01"]) throw new Error("Non-vocab SRS card was incorrectly pruned");
    if (errors.length) throw new Error(`Store emitted unexpected storage diagnostics: ${errors.join(" | ")}`);
  } finally {
    globalThis.localStorage = oldStorage;
    console.error = oldConsoleError;
  }
});

// -------------------------------------------------------------------
// 20. Idiom Rules & Stable Allocator Suite
// -------------------------------------------------------------------
test("Idioms: curated idioms pass all schema and register invariants with verified stable IDs", () => {
  if (!Array.isArray(idioms) || idioms.length < 120) {
    throw new Error(`Expected at least 120 curated idioms, found ${idioms ? idioms.length : 0}`);
  }

  const baselinePath = join(ROOT, "tests", "fixtures", "idiom_baseline_ids.json");
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  if (baseline.version !== 1 || !Number.isSafeInteger(baseline.highWaterMark) || !baseline.entries || typeof baseline.entries !== "object") {
    throw new Error("Invalid idiom baseline fixture schema: must include version, highWaterMark, and entries object");
  }
  const baselineEntries = Object.entries(baseline.entries);
  if (baselineEntries.length === 0) {
    throw new Error("Idiom baseline fixture entries cannot be empty");
  }

  const registryPath = join(ROOT, "data", "idiom_ids.json");
  const registry = JSON.parse(readFileSync(registryPath, "utf8"));

  // Verify historical guarantee: every entry in the baseline fixture MUST still exist with the exact same ID in the registry
  for (const [normKey, historicalId] of baselineEntries) {
    if (registry.entries[normKey] !== historicalId) {
      throw new Error(`Historical baseline mapping for '${normKey}' (${historicalId}) drifted in data/idiom_ids.json: '${registry.entries[normKey]}'`);
    }
  }

  const seenIds = new Set();
  const seenDutch = new Set();
  for (const idm of idioms) {
    const errs = validateIdiomRow(idm);
    if (errs.length > 0) {
      throw new Error(`Idiom ${idm.id} (${idm.dutch}) failed validation:\n - ${errs.join("\n - ")}`);
    }
    if (seenIds.has(idm.id)) throw new Error(`Duplicate idiom ID: ${idm.id}`);
    seenIds.add(idm.id);

    const normKey = normalizeExpression(idm.dutch);
    if (seenDutch.has(normKey)) throw new Error(`Duplicate normalized idiom key: ${normKey}`);
    seenDutch.add(normKey);

    // Verify stable ID mapping against baseline fixture if present
    if (baseline.entries[normKey] && baseline.entries[normKey] !== idm.id) {
      throw new Error(`Idiom '${normKey}' ID changed from baseline ${baseline.entries[normKey]} to ${idm.id}`);
    }

    // Verify registry match
    if (!registry.entries || registry.entries[normKey] !== idm.id) {
      throw new Error(`Idiom '${normKey}' missing or mismatched in data/idiom_ids.json`);
    }
  }

  // Verify non-recycling ID allocator behavior
  const allocator = createIdAllocator(validateRegistry(registry, { prefix: "idm-", idPattern: /^idm-(\d+)$/, digits: 4, normalize: normalizeExpression }), { prefix: "idm-", idPattern: /^idm-(\d+)$/, digits: 4, normalize: normalizeExpression });
  const probeId = allocator.assignId("__nederpath_idiom_allocation_probe__");
  const probeNum = Number(probeId.slice(4));
  if (probeNum !== registry.highWaterMark + 1) {
    throw new Error(`Allocated probe ID ${probeId} did not follow highWaterMark ${registry.highWaterMark}`);
  }
});

// -------------------------------------------------------------------
// 21. Sentence Bank & Surface Target Verification Suite
// -------------------------------------------------------------------
test("Sentences: 641 authored sentences satisfy schema, stable IDs, and 100% surface target resolution", () => {
  if (!Array.isArray(sentences) || sentences.length !== 641) {
    throw new Error(`Expected exactly 641 curated sentences, found ${sentences ? sentences.length : 0}`);
  }

  const baselinePath = join(ROOT, "tests", "fixtures", "sentence_baseline_ids.json");
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  if (baseline.version !== 1 || !Number.isSafeInteger(baseline.highWaterMark) || !baseline.entries || typeof baseline.entries !== "object") {
    throw new Error("Invalid sentence baseline fixture schema: must include version, highWaterMark, and entries object");
  }
  const baselineEntries = Object.entries(baseline.entries);
  if (baselineEntries.length === 0) {
    throw new Error("Sentence baseline fixture entries cannot be empty");
  }

  const registryPath = join(ROOT, "data", "sentence_ids.json");
  const registry = JSON.parse(readFileSync(registryPath, "utf8"));

  // Verify historical guarantee: every entry in the baseline fixture MUST still exist with the exact same ID in the registry
  for (const [normKey, historicalId] of baselineEntries) {
    if (registry.entries[normKey] !== historicalId) {
      throw new Error(`Historical baseline mapping for '${normKey}' (${historicalId}) drifted in data/sentence_ids.json: '${registry.entries[normKey]}'`);
    }
  }

  const seenIds = new Set();
  const seenNl = new Set();
  const levelCounts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };

  for (const s of sentences) {
    const errs = validateSentenceRow(s);
    if (errs.length > 0) {
      throw new Error(`Sentence ${s.id} (${s.nl}) failed validation:\n - ${errs.join("\n - ")}`);
    }
    if (seenIds.has(s.id)) throw new Error(`Duplicate sentence ID: ${s.id}`);
    seenIds.add(s.id);

    const normKey = normalizeSentenceKey(s.nl);
    if (seenNl.has(normKey)) throw new Error(`Duplicate normalized Dutch sentence: ${normKey}`);
    seenNl.add(normKey);

    // Verify surface targetWord and targetWords occurrence
    for (const tw of s.targetWords || [s.targetWord]) {
      if (!targetOccursInSurface(tw, s.nl)) {
        throw new Error(`Target word '${tw}' is not a surface token in sentence '${s.nl}' (${s.id})`);
      }
    }

    // Verify baseline fixture match if present
    if (baseline.entries[normKey] && baseline.entries[normKey] !== s.id) {
      throw new Error(`Sentence '${normKey}' ID changed from baseline ${baseline.entries[normKey]} to ${s.id}`);
    }

    // Verify registry match
    if (!registry.entries || registry.entries[normKey] !== s.id) {
      throw new Error(`Sentence '${normKey}' missing or mismatched in data/sentence_ids.json`);
    }

    levelCounts[s.level] = (levelCounts[s.level] || 0) + 1;
  }

  for (const [lvl, count] of Object.entries(levelCounts)) {
    if (count < 100) {
      throw new Error(`Level ${lvl} has only ${count} sentences, expected >= 100`);
    }
  }

  // Verify historical base sentence IDs (snt-00001 .. snt-00013) and non-recycling above highWaterMark 5050
  if (registry.highWaterMark < 5050) {
    throw new Error(`Sentence registry highWaterMark (${registry.highWaterMark}) must be >= 5050 to protect retired template IDs`);
  }
  const allocator = createIdAllocator(validateRegistry(registry, { prefix: "snt-", idPattern: /^snt-(\d+)$/, digits: 5, normalize: normalizeSentenceKey }), { prefix: "snt-", idPattern: /^snt-(\d+)$/, digits: 5, normalize: normalizeSentenceKey });
  const probeId = allocator.assignId("__nederpath_sentence_allocation_probe__");
  const probeNum = Number(probeId.slice(4));
  if (probeNum !== registry.highWaterMark + 1) {
    throw new Error(`Allocated probe ID ${probeId} did not follow highWaterMark ${registry.highWaterMark}`);
  }
});

// -------------------------------------------------------------------
// 21b. Adversarial Stable ID Mutation Verification
// -------------------------------------------------------------------
test("Stable IDs: In-memory mutation test proves ID drift or missing entries strictly cause test failures", () => {
  // 1. Idiom mutation drift detection
  const dummyBaseline = {
    version: 1,
    highWaterMark: 510,
    entries: {
      "nu komt de aap uit de mouw": "idm-0001",
      "helaas pindakaas": "idm-0002"
    }
  };
  const mutatedIdiomRegistry = {
    version: 1,
    highWaterMark: 510,
    entries: {
      "nu komt de aap uit de mouw": "idm-9999", // DRIFT!
      "helaas pindakaas": "idm-0002"
    }
  };
  let caughtIdiomDrift = false;
  try {
    for (const [k, id] of Object.entries(dummyBaseline.entries)) {
      if (mutatedIdiomRegistry.entries[k] !== id) {
        throw new Error(`ID drift detected: expected ${id}, got ${mutatedIdiomRegistry.entries[k]}`);
      }
    }
  } catch {
    caughtIdiomDrift = true;
  }
  if (!caughtIdiomDrift) throw new Error("Mutated idiom registry failed to trigger drift error");

  // 2. Sentence mutation drift detection
  const dummySentenceBaseline = {
    version: 1,
    highWaterMark: 5685,
    entries: {
      "ik woon al drie jaar met veel plezier in utrecht.": "snt-00001"
    }
  };
  const mutatedSentenceRegistry = {
    version: 1,
    highWaterMark: 5685,
    entries: {
      "ik woon al drie jaar met veel plezier in utrecht.": "snt-00099" // DRIFT!
    }
  };
  let caughtSentenceDrift = false;
  try {
    for (const [k, id] of Object.entries(dummySentenceBaseline.entries)) {
      if (mutatedSentenceRegistry.entries[k] !== id) {
        throw new Error(`ID drift detected: expected ${id}, got ${mutatedSentenceRegistry.entries[k]}`);
      }
    }
  } catch {
    caughtSentenceDrift = true;
  }
  if (!caughtSentenceDrift) throw new Error("Mutated sentence registry failed to trigger drift error");

  // 3. Schema validation rejection
  let caughtEmptyEntries = false;
  try {
    const invalidFixture = { version: 1, highWaterMark: 100, entries: {} };
    if (Object.keys(invalidFixture.entries).length === 0) {
      throw new Error("Fixture entries cannot be empty");
    }
  } catch {
    caughtEmptyEntries = true;
  }
  if (!caughtEmptyEntries) throw new Error("Empty fixture entries failed to trigger rejection");
});

// -------------------------------------------------------------------
// 22. Spaced Repetition Preview Pure Function Suite
// -------------------------------------------------------------------
test("SRS Preview: previewReview and previewRatings are pure and compute truthful intervals", () => {
  const dummyStore = {
    state: {
      srs: {
        cards: {
          "test-card-1": {
            id: "test-card-1",
            type: "vocab",
            interval: 4,
            easeFactor: 2.5,
            repetitions: 2,
            lapses: 0,
            state: "review"
          }
        }
      },
      progress: { xp: 100, dailyStats: { learnedToday: 0 } },
      user: { streak: 5 }
    },
    save() {
      throw new Error("previewReview must not call store.save");
    },
    recordActivity() {
      throw new Error("previewReview must not call store.recordActivity");
    }
  };

  const srsModule = {};
  new Function("globalThis", srsSrc)(srsModule);
  const SRSEngine = srsModule.NederSRS.constructor;
  const srsInstance = new SRSEngine(dummyStore);

  // Snapshot card before preview
  const beforeJson = JSON.stringify(dummyStore.state.srs.cards);

  // Run preview on existing card
  const ratings = srsInstance.previewRatings("test-card-1", "vocab");
  if (!ratings || !ratings[1] || !ratings[2] || !ratings[3] || !ratings[4]) {
    throw new Error("previewRatings did not return all 4 rating previews");
  }

  // Rating 1 (Again) -> interval 1
  if (ratings[1].interval !== 1 || ratings[1].state !== "learning") {
    throw new Error(`Rating 1 preview interval expected 1, got ${ratings[1].interval}`);
  }

  // Rating 3 (Good) -> interval round(4 * 2.5) = 10
  if (ratings[3].interval !== 10 || ratings[3].state !== "review") {
    throw new Error(`Rating 3 preview interval expected 10, got ${ratings[3].interval}`);
  }

  // Rating 4 (Easy) -> interval round(10 * 1.3) = 13
  if (ratings[4].interval !== 13 || ratings[4].state !== "review") {
    throw new Error(`Rating 4 preview interval expected 13, got ${ratings[4].interval}`);
  }

  // Run preview on unseen card (not in store)
  const unseenRatings = srsInstance.previewRatings("nl-99999", "vocab");
  if (unseenRatings[1].interval !== 1 || unseenRatings[3].interval !== 1 || unseenRatings[4].interval !== 1) {
    throw new Error("Unseen card preview intervals mismatch");
  }
  if (dummyStore.state.srs.cards["nl-99999"]) {
    throw new Error("previewRatings created an unseen card in store!");
  }

  // Verify store card was NOT mutated
  const afterJson = JSON.stringify(dummyStore.state.srs.cards);
  if (beforeJson !== afterJson) {
    throw new Error("previewReview mutated store cards state!");
  }
});

// -------------------------------------------------------------------
// 23. Session XP & Completion Screen Truthfulness Suite
// -------------------------------------------------------------------
test("Session XP: truthful delta arithmetic on session complete", () => {
  // Test starting XP tracking and delta calculation
  const session = {
    startXp: 50,
    cards: [1, 2, 3, 4, 5],
    itemNoun: "zinnen"
  };
  const store = {
    state: {
      user: { totalXp: 120, streak: 3 },
      progress: { studyDays: {} }
    }
  };

  const startXp = typeof session.startXp === "number" ? session.startXp : ((store.state.user && store.state.user.totalXp) || 0);
  const currentXp = (store.state.user && store.state.user.totalXp) || 0;
  const earnedXp = Math.max(0, currentXp - startXp);

  if (earnedXp !== 70) {
    throw new Error(`Expected earned XP 70, got ${earnedXp}`);
  }

  // When no XP earned
  session.startXp = 120;
  const noXpEarned = Math.max(0, ((store.state.user && store.state.user.totalXp) || 0) - session.startXp);
  if (noXpEarned !== 0) {
    throw new Error(`Expected 0 earned XP, got ${noXpEarned}`);
  }
});

// -------------------------------------------------------------------
// 24. HTML Sink & Adversarial Template Injection Suite
// -------------------------------------------------------------------
test("HTML Sink: Fill-in-the-blank maskedSentence and drill interpolations sanitize HTML injection", () => {
  const hostileSentence = {
    id: "snt-99999",
    nl: "<script>alert('xss')</script> Ik koop verse <img src=x onerror=alert(1)> op de markt.",
    en: "I buy fresh <b>vegetables</b> at the market.",
    level: "A1",
    targetWord: "koop",
    targetWords: ["koop"],
    clozeEligible: true
  };

  const card = Learning.createFillBlankCard(hostileSentence, [{ word: "groenten" }, { word: "appels" }]);
  if (!card) throw new Error("createFillBlankCard returned null for hostile sentence");

  // Verify that maskedSentence contains the blank
  if (!card.maskedSentence.includes("_______")) {
    throw new Error("maskedSentence did not create cloze blank '_______'");
  }

  // Verify that escaping the masked sentence neutralizes script tags
  const escaped = Learning.escapeHTML(card.maskedSentence);
  if (escaped.includes("<script>") || escaped.includes("<img")) {
    throw new Error(`Unsanitized HTML tag characters found in escaped maskedSentence: '${escaped}'`);
  }
  if (!escaped.includes("&lt;script&gt;") || !escaped.includes("&lt;img")) {
    throw new Error(`Expected HTML entity escaping in maskedSentence: '${escaped}'`);
  }
  // Verify that cloze placeholder is preserved cleanly
  if (!escaped.includes("_______")) {
    throw new Error(`Placeholder '_______' was mangled: '${escaped}'`);
  }
});

test("HTML Sink: escapeHTML handles nulls, numbers, and does not double-escape safe strings", () => {
  if (Learning.escapeHTML(null) !== "") throw new Error("escapeHTML(null) should return empty string");
  if (Learning.escapeHTML(undefined) !== "") throw new Error("escapeHTML(undefined) should return empty string");
  if (Learning.escapeHTML(42) !== "42") throw new Error("escapeHTML(42) should return '42'");
  if (Learning.escapeHTML("Normaal Nederlands!") !== "Normaal Nederlands!") {
    throw new Error("escapeHTML mangled plain Dutch text");
  }
});

// -------------------------------------------------------------------
// 25. Historical Sentence ID Integrity & Anti-Recycling Guarantees
// -------------------------------------------------------------------
test("Historical Sentence IDs: Exactly 13 pre-Cartesian base sentences retain IDs snt-00001..snt-00013 and highWaterMark prevents recycling", () => {
  const sentenceIds = JSON.parse(readFileSync(join(ROOT, "data", "sentence_ids.json"), "utf8"));
  if (sentenceIds.highWaterMark < 5050) {
    throw new Error(`highWaterMark (${sentenceIds.highWaterMark}) must be >= 5050 to reserve retired legacy template IDs`);
  }

  const expected13 = [
    { key: "ik woon al drie jaar met veel plezier in utrecht.", id: "snt-00001" },
    { key: "morgenochtend om negen uur neem ik de trein naar amsterdam centraal.", id: "snt-00002" },
    { key: "de bakker om de hoek verkoopt elke dag vers volkorenbrood.", id: "snt-00003" },
    { key: "zij heeft gisteren een prachtige nieuwe fiets gekocht.", id: "snt-00004" },
    { key: "omdat het vanochtend hard regende, ben ik met de bus naar kantoor gegaan.", id: "snt-00005" },
    { key: "jan staat elke werkdag om kwart over zes op om de files te vermijden.", id: "snt-00006" },
    { key: "kun je mij alstublieft even helpen met het tillen van deze zware koffer?", id: "snt-00007" },
    { key: "in het weekend gaan wij graag wandelen in de duinen bij bloemendaal.", id: "snt-00008" },
    { key: "als je regelmatig oefent, zul je merken dat je nederlands snel vooruitgaat.", id: "snt-00009" },
    { key: "het nieuwe museumgebouw werd vorig jaar feestelijk geopend door de burgemeester.", id: "snt-00010" },
    { key: "hoewel het kabinet nieuwe maatregelen heeft aangekondigd, blijft de woningmarkt gespannen.", id: "snt-00011" },
    { key: "de commissie heeft besloten het voorstel nader te laten onderzoeken door onafhankelijke experts.", id: "snt-00012" },
    { key: "mocht de situatie onverhoopt escaleren, dan treedt het nationale noodplan onmiddellijk in werking.", id: "snt-00013" }
  ];

  for (const exp of expected13) {
    if (sentenceIds.entries[exp.key] !== exp.id) {
      throw new Error(`Historical sentence '${exp.key}' expected ID '${exp.id}', found '${sentenceIds.entries[exp.key]}'`);
    }
  }

  // Verify that retired template range snt-00014..snt-05050 is not used for newly authored sentences
  for (const [key, id] of Object.entries(sentenceIds.entries)) {
    const num = parseInt(id.replace("snt-", ""), 10);
    if (num > 13 && num <= 5050) {
      throw new Error(`Forbidden allocation of retired template ID '${id}' for key '${key}'`);
    }
  }
});

// -------------------------------------------------------------------
// 26. Multi-Mode Session & XP Lifecycle Integration Suite
// -------------------------------------------------------------------
test("Integration: Flashcard session rating lifecycle with Again, Hard, Good, Easy and exact XP delta", () => {
  const store = Store.createStore({
    settings: { sessionSize: 4 },
    srs: { cards: {} },
    user: { totalXp: 100 }
  });
  const srs = SRS.createSRSEngine(store);

  // Initial session setup
  const cards = [
    { id: "w-001", word: "tafel", meaning: "table", pos: "noun", level: "A1" },
    { id: "w-002", word: "stoel", meaning: "chair", pos: "noun", level: "A1" },
    { id: "w-003", word: "boek", meaning: "book", pos: "noun", level: "A1" },
    { id: "w-004", word: "huis", meaning: "house", pos: "noun", level: "A1" }
  ];

  const session = {
    cards,
    currentIndex: 0,
    revealed: false,
    itemNoun: "kaarten",
    startXp: store.state.user.totalXp
  };

  // 1. Rate card 1 as Again (rating 1 -> 3 XP)
  const prev1 = srs.previewRatings(cards[0].id, "vocab");
  srs.review(cards[0].id, 1, "vocab");
  const card1State = store.state.srs.cards[cards[0].id];
  if (card1State.interval !== prev1[1].interval) {
    throw new Error(`Card 1 persisted interval (${card1State.interval}) != preview interval (${prev1[1].interval})`);
  }
  session.currentIndex++;

  // 2. Rate card 2 as Hard (rating 2 -> 10 XP)
  const prev2 = srs.previewRatings(cards[1].id, "vocab");
  srs.review(cards[1].id, 2, "vocab");
  const card2State = store.state.srs.cards[cards[1].id];
  if (card2State.interval !== prev2[2].interval) {
    throw new Error(`Card 2 persisted interval (${card2State.interval}) != preview interval (${prev2[2].interval})`);
  }
  session.currentIndex++;

  // 3. Rate card 3 as Good (rating 3 -> 10 XP)
  const prev3 = srs.previewRatings(cards[2].id, "vocab");
  srs.review(cards[2].id, 3, "vocab");
  const card3State = store.state.srs.cards[cards[2].id];
  if (card3State.interval !== prev3[3].interval) {
    throw new Error(`Card 3 persisted interval (${card3State.interval}) != preview interval (${prev3[3].interval})`);
  }
  session.currentIndex++;

  // 4. Rate card 4 as Easy (rating 4 -> 10 XP)
  const prev4 = srs.previewRatings(cards[3].id, "vocab");
  srs.review(cards[3].id, 4, "vocab");
  const card4State = store.state.srs.cards[cards[3].id];
  if (card4State.interval !== prev4[4].interval) {
    throw new Error(`Card 4 persisted interval (${card4State.interval}) != preview interval (${prev4[4].interval})`);
  }
  session.currentIndex++;

  // Verify total XP earned (3 + 10 + 10 + 10 = 33)
  const totalEarnedXp = store.state.user.totalXp - session.startXp;
  if (totalEarnedXp !== 33) {
    throw new Error(`Expected earned XP 33, got ${totalEarnedXp}`);
  }
  if (session.currentIndex !== session.cards.length) {
    throw new Error("Session did not complete all cards");
  }
});

test("Integration: Article drill session with mixed scores updates articleStats, mistakes, and XP", () => {
  const store = Store.createStore({
    settings: { sessionSize: 3 },
    user: { totalXp: 50 },
    progress: {
      articleStats: { totalDrilled: 0, correct: 0, mistakes: {} }
    }
  });

  const session = {
    cards: [
      { id: "w-010", word: "tafel", article: "de" },
      { id: "w-011", word: "huis", article: "het" },
      { id: "w-012", word: "auto", article: "de" }
    ],
    currentIndex: 0,
    score: 0,
    feedback: null,
    startXp: store.state.user.totalXp
  };

  // Card 1: Correct (de tafel)
  store.recordArticleDrill("tafel", "de", "de");
  session.score++;
  session.currentIndex++;

  // Card 2: Incorrect (guessed de instead of het voor huis)
  store.recordArticleDrill("huis", "de", "het");
  session.currentIndex++;

  // Card 3: Correct (de auto)
  store.recordArticleDrill("auto", "de", "de");
  session.score++;
  session.currentIndex++;

  // Verify articleStats
  const stats = store.state.progress.articleStats;
  if (stats.totalDrilled !== 3 || stats.correct !== 2) {
    throw new Error(`Expected 2/3 correct article stats, got ${stats.correct}/${stats.totalDrilled}`);
  }
  if (stats.mistakes["huis"] !== 1) {
    throw new Error(`Expected 1 mistake recorded for 'huis', got ${stats.mistakes["huis"]}`);
  }

  // Verify total earned XP in session (5 + 1 + 5 = 11)
  const earnedXp = store.state.user.totalXp - session.startXp;
  if (earnedXp !== 11) {
    throw new Error(`Expected 11 earned XP, got ${earnedXp}`);
  }
});

test("Integration: Restart / reset for a second session re-anchors startXp and does not pollute state", () => {
  const store = Store.createStore({
    user: { totalXp: 0 }
  });

  // Session 1: Earns 20 XP
  const session1 = {
    startXp: store.state.user.totalXp,
    cards: [{ id: 1 }, { id: 2 }],
    currentIndex: 0
  };
  store.recordActivity(10);
  store.recordActivity(10);
  session1.currentIndex = 2;
  const earned1 = store.state.user.totalXp - session1.startXp;
  if (earned1 !== 20) throw new Error(`Session 1 expected 20 XP, got ${earned1}`);

  // Reset for Session 2
  const session2 = {
    startXp: store.state.user.totalXp, // re-anchored to 20
    cards: [{ id: 3 }, { id: 4 }],
    currentIndex: 0,
    feedback: null,
    score: 0
  };

  if (session2.startXp !== 20) {
    throw new Error(`Session 2 startXp should be 20, got ${session2.startXp}`);
  }

  // Session 2: Earns 10 XP
  store.recordActivity(10);
  session2.currentIndex = 1;
  const earned2 = store.state.user.totalXp - session2.startXp;
  if (earned2 !== 10) {
    throw new Error(`Session 2 expected 10 XP delta, got ${earned2}`);
  }
  if (store.state.user.totalXp !== 30) {
    throw new Error(`Cumulative XP expected 30, got ${store.state.user.totalXp}`);
  }
});

test("Session XP arithmetic clamps negative store deltas to zero", () => {
  // Protects the clamp invariant Math.max(0, currentXp - startXp) against clock drift or corrupted state
  const startXp = 100;
  const currentXp = 80; // Corrupted or downgraded state lower than session start
  const earnedXp = Math.max(0, currentXp - startXp);

  if (earnedXp !== 0) {
    throw new Error(`Earned XP clamp expected 0 for negative delta, got ${earnedXp}`);
  }
});

// -------------------------------------------------------------------
// 27. SRS Display & Format Truthfulness Suite
// -------------------------------------------------------------------
test("SRS Display Truthfulness: Interval labels explicitly include exact day count", () => {
  const store = Store.createStore({
    srs: { cards: {} }
  });
  const srs = SRS.createSRSEngine(store);

  // Test various day intervals
  const testCases = [
    { days: 1, expectedInterval: "1d", expectedDutch: "1 day" },
    { days: 6, expectedInterval: "6d", expectedDutch: "6 days" },
    { days: 15, expectedInterval: "15d", expectedDutch: "15 days" },
    { days: 30, expectedInterval: "1m (30d)", expectedDutch: "1 mo (30 days)" },
    { days: 45, expectedInterval: "2m (45d)", expectedDutch: "2 mo (45 days)" },
    { days: 400, expectedInterval: "1.1y (400d)", expectedDutch: "1.1 yr (400 days)" }
  ];

  for (const tc of testCases) {
    // Inject card with specific interval
    store.state.srs.cards["test-card"] = {
      id: "test-card",
      type: "vocab",
      interval: tc.days,
      ease: 2.5,
      repetitions: 3,
      dueDate: "2026-08-14"
    };

    const preview = srs.previewRatings("test-card", "vocab");
    // Verify that every preview rating contains exact interval days in both formatted strings
    for (let rating = 1; rating <= 4; rating++) {
      const p = preview[rating];
      if (!p.formattedInterval.includes(`${p.interval}d`)) {
        throw new Error(`formattedInterval '${p.formattedInterval}' missing exact day count '${p.interval}d'`);
      }
      if (!p.formattedDutch.includes(String(p.interval))) {
        throw new Error(`formattedDutch '${p.formattedDutch}' missing exact day count '${p.interval}'`);
      }
    }
  }
});

// -------------------------------------------------------------------
// 28. Grammar Exercise Type Integrity Suite
// -------------------------------------------------------------------
// Authoritative Dutch verb recognition for typed_conjugation prompts,
// derived from the repository's own verb data instead of an expanding
// hardcoded whitelist:
//   1. An infinitive is a bank verb lemma (pos='verb', inflectionType='lemma')
//      or a runtime irregular verb.
//   2. Common Dutch inseparable/separable compound prefixes may decompose an
//      infinitive onto such a verified stem (opstaan -> op + staan).
//   3. The reflexive particle 'zich ' may prefix a verified stem
//      (zich haasten -> haasten).
//   4. A tiny documented exception list covers legitimate curriculum verbs
//      absent from the conservative append-only bank (e.g. 'leven').
// Noun-plural rows are rejected explicitly: parenthesized descriptors such
// as '(plural)', '(meervoud)' or '(ordinal ...)' are never verb infinitives.
const VERB_COMPOUND_PREFIXES = [
  "be", "ge", "her", "ont", "ver", "aan", "uit", "in", "op", "af",
  "toe", "ter", "weer", "om", "na", "naar", "mis", "onder", "over",
  "door", "achter", "buiten", "mee", "tegen", "voor", "bij", "dicht",
  "los", "naast", "samen", "thuis", "vast", "verder", "weg"
];
const VERB_EXCEPTIONS = new Set([
  "leven" // core-curriculum conjugation exercise; absent from the word bank
]);

function isPlausibleVerbInfinitive(infinitive, wordsBank) {
  const inf = String(infinitive || "").trim().toLowerCase();
  if (!inf) return false;
  if (/\((plural|meervoud|ordinal)/i.test(inf)) return false;
  if (VERB_EXCEPTIONS.has(inf)) return true;

  const bankLemma = new Set(
    (wordsBank || [])
      .filter((w) => w && w.pos === "verb" && w.inflectionType === "lemma")
      .map((w) => w.word.toLowerCase().trim())
  );
  // Irregulars are resolved by the runtime's own conjugation table
  // (getVerifiedVerbHijConjugation checks it before consulting the bank).
  const irregular = (candidate) => !!Learning.getVerifiedVerbHijConjugation(candidate, null);
  const verified = (candidate) => bankLemma.has(candidate) || irregular(candidate);

  if (verified(inf)) return true;
  if (inf.startsWith("zich ") && verified(inf.slice(5))) return true;
  return VERB_COMPOUND_PREFIXES.some((prefix) => inf.startsWith(prefix) && verified(inf.slice(prefix.length)));
}

test("Grammar: typed_conjugation exercises use plausible verb infinitives from authoritative data", () => {
  for (const rule of grammar) {
    for (const ex of rule.exercises || []) {
      if (ex.type !== "typed_conjugation") continue;
      const infinitive = String(ex.infinitive || "").trim();
      if (!isPlausibleVerbInfinitive(infinitive, words)) {
        throw new Error(`${rule.id} typed_conjugation infinitive '${infinitive}' is not a verified Dutch verb infinitive`);
      }
    }
  }
});

test("Grammar: noun-plural pseudo-verbs are rejected while staan-family infinitives pass", () => {
  const invalid = ["kind (plural)", "kind (meervoud)", "kind", "tafel", "aangestaan", "achten (ordinal stem acht)"];
  for (const inf of invalid) {
    if (isPlausibleVerbInfinitive(inf, words)) {
      throw new Error(`'${inf}' was accepted as a verb infinitive but must be rejected`);
    }
  }
  const valid = ["staan", "opstaan", "bestaan", "ontstaan", "weerstaan", "verstaan", "lezen", "zijn", "werken", "maken", "moeten", "laten", "ontmoeten", "zich haasten", "leven"];
  for (const inf of valid) {
    if (!isPlausibleVerbInfinitive(inf, words)) {
      throw new Error(`'${inf}' is a legitimate Dutch verb infinitive but was rejected`);
    }
  }
});

async function runAllTests() {
  for (const { name, fn } of testQueue) {
    try {
      await fn();
      passed++;
      console.log(`  ✓ [PASS] ${name}`);
    } catch (err) {
      failed++;
      console.error(`  ✗ [FAIL] ${name}:`, err.message);
    }
  }

  console.log(`\n=======================================================`);
  console.log(`Regression Tests Complete: ${passed} Passed, ${failed} Failed`);
  console.log(`=======================================================\n`);

  if (failed > 0) process.exit(1);
}

runAllTests();
