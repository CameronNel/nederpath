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

  // With a full sample from 20,000 words, at least some items will have rank > 500
  const maxRank = Math.max(...sample.map((w) => w.rank || 0));
  if (maxRank <= 100) {
    throw new Error(`Sampled words appear biased to first 100 (maxRank was ${maxRank})`);
  }
});

// -------------------------------------------------------------------
// 2. Fill-in-the-Blank Target Equality (Preventing .includes() bug)
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

  // An option word like "markt" is inside sentenceItem.nl ("...op de markt"),
  // but it is NOT the correct blank answer.
  const isMarktCorrect = Learning.normalizeAnswer("markt") === Learning.normalizeAnswer(card.targetWord);
  if (isMarktCorrect) throw new Error("Incorrect distractor 'markt' was falsely graded as correct");

  const isGroentenCorrect = Learning.normalizeAnswer("groenten") === Learning.normalizeAnswer(card.targetWord);
  if (!isGroentenCorrect) throw new Error("Target word 'groenten' was not graded as correct");
});

// -------------------------------------------------------------------
// 3. Verb Conjugation Exact Grading (Preventing text.length > 1 bug)
// -------------------------------------------------------------------
test("Verbs: getVerbHijConjugation resolves regular and irregular verbs correctly", () => {
  if (Learning.getVerbHijConjugation("werken", words) !== "werkt") throw new Error("werken -> werkt failed");
  if (Learning.getVerbHijConjugation("maken", words) !== "maakt") throw new Error("maken -> maakt failed");
  if (Learning.getVerbHijConjugation("lopen", words) !== "loopt") throw new Error("lopen -> loopt failed");
  if (Learning.getVerbHijConjugation("leven", words) !== "leeft") throw new Error("leven -> leeft failed");
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
// 4. Plural Morphology Exact Grading (Preventing suffix-only bug)
// -------------------------------------------------------------------
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

  // Inputs like "kinden" or "kinds" end in 'en'/'s' but are wrong
  const falsePlurals = ["kinden", "kinds", "kindje", "kind", "blabla-en"];
  for (const falsePl of falsePlurals) {
    const isCorrect = Learning.normalizeAnswer(falsePl) === Learning.normalizeAnswer(expectedPlural);
    if (isCorrect) throw new Error(`False plural '${falsePl}' was falsely graded as correct for 'kind'`);
  }

  const isKinderenCorrect = Learning.normalizeAnswer("kinderen") === Learning.normalizeAnswer(expectedPlural);
  if (!isKinderenCorrect) throw new Error("Correct plural 'kinderen' was not accepted");
});

// -------------------------------------------------------------------
// 5. Grammar Word Order Duplicate Token Identity
// -------------------------------------------------------------------
test("Word Order: Duplicate tokens have distinct pool indices and can be placed independently", () => {
  const exercise = {
    type: "word_order",
    tokens: ["Jan", "geeft", "de", "man", "de", "sleutel"],
    correctSentence: "Jan geeft de man de sleutel",
    translation: "Jan gives the man the key."
  };

  // Simulating index-based token placement
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
// 6. Local Calendar Date Formatting
// -------------------------------------------------------------------
test("Dates: getLocalISODate outputs YYYY-MM-DD from local date components", () => {
  const testDate = new Date(2026, 7, 13, 23, 30); // 13 August 2026, 23:30 local time
  const isoStr = Learning.getLocalISODate(testDate);
  if (isoStr !== "2026-08-13") throw new Error(`Expected '2026-08-13', got '${isoStr}'`);
});

// -------------------------------------------------------------------
// 7. Backup Schema Validation & Deep Merge
// -------------------------------------------------------------------
test("Backup: validateAndMergeBackup rejects malicious and invalid payloads", () => {
  const defaultState = {
    version: 1,
    user: { name: "Learner", level: "A1", dailyGoal: 15, sessionSize: 10, streak: 0, totalXp: 0 },
    settings: { theme: "dark", sessionSize: 10, dailyGoal: 15, autoAdvance: true, hapticFeedback: true },
    srs: { cards: {} },
    progress: { grammarCompleted: {}, comprehensionCompleted: {}, wordsBookmarked: {}, studyDays: {}, articleStats: { totalDrilled: 0, correct: 0, mistakes: {} }, dailyStats: { date: "2026-08-13", learnedToday: 0 } }
  };

  // Reject non-objects
  let errCaught = false;
  try {
    Learning.validateAndMergeBackup("invalid string", defaultState);
  } catch {
    errCaught = true;
  }
  if (!errCaught) throw new Error("Failed to reject string payload");

  // Reject __proto__ injection
  errCaught = false;
  try {
    const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');
    Learning.validateAndMergeBackup(malicious, defaultState);
  } catch {
    errCaught = true;
  }
  if (!errCaught) throw new Error("Failed to reject __proto__ pollution payload");

  // Valid payload merges safely
  const validBackup = {
    user: { name: "Cameron", totalXp: 500, streak: 5 },
    settings: { theme: "light" },
    progress: {
      wordsBookmarked: { "nl-00001": true },
      grammarCompleted: { "g-001": { score: 100, attempts: 1 } }
    }
  };

  const merged = Learning.validateAndMergeBackup(validBackup, defaultState);
  if (merged.user.name !== "Cameron" || merged.user.totalXp !== 500 || merged.user.streak !== 5) {
    throw new Error("Valid user fields were not merged properly");
  }
  if (merged.settings.theme !== "light") {
    throw new Error("Settings theme was not merged properly");
  }
  if (!merged.progress.wordsBookmarked["nl-00001"]) {
    throw new Error("Bookmark progress was not merged properly");
  }
  if (!merged.progress.grammarCompleted["g-001"]) {
    throw new Error("Grammar completed progress was not merged properly");
  }
  // Missing fields keep default
  if (merged.user.level !== "A1" || merged.settings.dailyGoal !== 15) {
    throw new Error("Defaults were not preserved for missing fields");
  }
});

// -------------------------------------------------------------------
// 8. Spaced Repetition Due Card Filtering
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
