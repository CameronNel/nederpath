import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const learningSrc = readFileSync(join(ROOT, "js", "learning.js"), "utf8");
const wordsSrc = readFileSync(join(ROOT, "data", "words.js"), "utf8");
const srsSrc = readFileSync(join(ROOT, "js", "srs.js"), "utf8");
const storeSrc = readFileSync(join(ROOT, "js", "store.js"), "utf8");

const runtime = {};
new Function("globalThis", "module", "exports", learningSrc)(runtime, {}, {});
new Function("globalThis", wordsSrc)(runtime);
const Learning = runtime.NederLearning;
const words = runtime.NP_WORDS;

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (error) {
    failed++;
    console.error(`  ✗ [FAIL] ${name}: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertThrows(fn, message) {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) throw new Error(message);
}

function defaultState() {
  return {
    version: 1,
    user: {
      name: "Learner",
      level: "A1",
      dailyGoal: 15,
      sessionSize: 10,
      onboardingCompleted: true,
      streak: 0,
      lastActiveDate: null,
      totalXp: 0,
      createdAt: "2026-08-14T00:00:00.000Z"
    },
    settings: {
      theme: "dark",
      sessionSize: 10,
      dailyGoal: 15,
      autoAdvance: true,
      hapticFeedback: true
    },
    srs: { cards: {} },
    progress: {
      grammarCompleted: {},
      comprehensionCompleted: {},
      wordsBookmarked: {},
      studyDays: {},
      articleStats: { totalDrilled: 0, correct: 0, mistakes: {} },
      dailyStats: { date: "2026-08-14", learnedToday: 0 }
    }
  };
}

function loadSrs(store) {
  const testGlobal = { NederStore: store };
  new Function("globalThis", srsSrc)(testGlobal);
  return testGlobal.NederSRS;
}

function isoWithOffset(instantMs, offsetMinutes) {
  const wall = new Date(instantMs + offsetMinutes * 60 * 1000);
  const local = wall.toISOString().slice(0, 19);
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const minutes = String(absolute % 60).padStart(2, "0");
  return `${local}${sign}${hours}:${minutes}`;
}

console.log("\n=======================================================");
console.log("        NederPath PR #1 Integrity Audit Tests          ");
console.log("=======================================================\n");

test("Grading: Dutch apostrophes and hyphens remain orthographically significant", () => {
  assert(Learning.normalizeAnswer("E-mail") === "e-mail", "Case normalization failed for e-mail");
  assert(Learning.normalizeAnswer("e-mail") !== Learning.normalizeAnswer("email"), "Hyphen was incorrectly ignored");
  assert(Learning.normalizeAnswer("auto's") !== Learning.normalizeAnswer("autos"), "Apostrophe was incorrectly ignored");
  assert(Learning.normalizeAnswer("auto’s") === Learning.normalizeAnswer("auto's"), "Typographic apostrophe was not normalized");
  assert(Learning.normalizeAnswer("Ik werk.") === Learning.normalizeAnswer("ik werk"), "Sentence-final punctuation should remain ignorable");
});

test("Grading: Unicode NFC normalization accepts canonically equivalent Dutch text", () => {
  const composed = "café";
  const decomposed = "cafe\u0301";
  assert(Learning.normalizeAnswer(composed) === Learning.normalizeAnswer(decomposed), "Composed/decomposed Unicode forms differed");
});

test("Verb practice: every real eligible verb has an authoritative hij/zij form", () => {
  const eligible = Learning.getEligibleVerbs(words);
  assert(eligible.length > 0, "Eligible verb pool became empty");
  for (const verb of eligible) {
    const verified = Learning.getVerifiedVerbHijConjugation(verb.word, words);
    assert(typeof verified === "string" && verified.length > 0, `Unverified verb entered practice: ${verb.word}`);
  }
  const eligibleWords = new Set(eligible.map((verb) => verb.word));
  assert(eligibleWords.has("werken"), "Known verified simple verb 'werken' disappeared from practice");
});

test("Verb practice: guessed and likely separable one-token paradigms are excluded", () => {
  const synthetic = [
    { id: "v-open", word: "openen", lemma: "openen", pos: "verb", inflectionType: "lemma", learnable: true },
    { id: "v-work", word: "werken", lemma: "werken", pos: "verb", inflectionType: "lemma", learnable: true },
    { id: "v-work-hij", word: "werkt", lemma: "werken", pos: "verb", inflectionType: "hij-form", learnable: false },
    { id: "v-hard", word: "hardlopen", lemma: "hardlopen", pos: "verb", inflectionType: "lemma", learnable: true },
    { id: "v-hard-hij", word: "hardloopt", lemma: "hardlopen", pos: "verb", inflectionType: "hij-form", learnable: false },
    { id: "v-hard-pp", word: "hardgelopen", lemma: "hardlopen", pos: "verb", inflectionType: "past-participle", learnable: false }
  ];

  const eligible = new Set(Learning.getEligibleVerbs(synthetic).map((verb) => verb.word));
  assert(eligible.has("werken"), "Explicit simple paradigm was excluded");
  assert(!eligible.has("openen"), "Unsupported guessed paradigm 'openen' entered practice");
  assert(!eligible.has("hardlopen"), "Likely separable verb 'hardlopen' entered one-token hij/zij practice");
  assert(Learning.getVerbHijConjugation("openen", synthetic) === null, "Bank-backed conjugation guessed an unsupported answer");
});

test("Flashcards: correct API call proves derived reference rows cannot enter learner sessions", () => {
  const session = Learning.generateFlashcardSession({
    wordsBank: words,
    srsCards: {},
    dueCards: [],
    sessionSize: 30
  });
  assert(session.length === 30, `Expected 30 real flashcards, found ${session.length}`);
  for (const card of session) {
    assert(card.learnable === true, `Reference-only row entered flashcards: ${card.id} (${card.word})`);
  }
});

test("Flashcards: non-finite session sizes are bounded instead of leaking into array operations", () => {
  const nanSession = Learning.generateFlashcardSession({ wordsBank: words, sessionSize: Number.NaN });
  const infSession = Learning.generateFlashcardSession({ wordsBank: words, sessionSize: Infinity });
  assert(nanSession.length === 10, `NaN session size did not fall back to 10 (got ${nanSession.length})`);
  assert(infSession.length === 10, `Infinity session size did not fall back to 10 (got ${infSession.length})`);
});

test("Fill blank: punctuation-bearing targets are literal, regex-safe, and deterministically identified", () => {
  const sentence = {
    nl: "Ik stuur een e-mail naar mijn collega.",
    en: "I send an email to my colleague.",
    targetWords: ["e-mail"],
    category: "work",
    level: "A1"
  };
  const first = Learning.createFillBlankCard(sentence, words);
  const second = Learning.createFillBlankCard(sentence, words);
  assert(first && first.targetWord.toLowerCase() === "e-mail", `Expected literal target e-mail, got ${first?.targetWord}`);
  assert(first.maskedSentence.includes("_______"), "Target was not masked");
  assert(first.id === second.id, "Sentence without explicit ID received a random unstable card ID");
});

test("Backup: SRS map key is authoritative and timestamps canonicalize to UTC", () => {
  const dueOffset = "2026-08-14T10:00:00+02:00";
  const merged = Learning.validateAndMergeBackup({
    srs: {
      cards: {
        "nl-00001": {
          id: "nl-00002",
          type: "vocab",
          interval: 3,
          easeFactor: 2.5,
          repetitions: 2,
          lapses: 0,
          dueDate: dueOffset,
          state: "review",
          lastReview: "2026-08-13T22:00:00+02:00"
        }
      }
    }
  }, defaultState());

  const card = merged.srs.cards["nl-00001"];
  assert(card.id === "nl-00001", `Nested card.id redirected authoritative key to ${card.id}`);
  assert(card.dueDate === "2026-08-14T08:00:00.000Z", `Offset dueDate was not canonicalized: ${card.dueDate}`);
  assert(card.lastReview === "2026-08-13T20:00:00.000Z", `Offset lastReview was not canonicalized: ${card.lastReview}`);
});

test("Backup: invalid entries do not consume bounded collection capacity", () => {
  const grammarCompleted = {};
  for (let i = 0; i < 500; i++) {
    grammarCompleted[`invalid.${i}`] = { score: 100, attempts: 1 };
  }
  grammarCompleted["g-001"] = { score: 91, attempts: 2, completedAt: "2026-08-14T08:00:00Z" };

  const merged = Learning.validateAndMergeBackup({ progress: { grammarCompleted } }, defaultState());
  assert(merged.progress.grammarCompleted["g-001"]?.score === 91, "Valid entry after invalid noise was dropped by collection cap");
});

test("Backup: article accuracy cannot exceed the number of drills", () => {
  const merged = Learning.validateAndMergeBackup({
    progress: { articleStats: { totalDrilled: 3, correct: 99, mistakes: {} } }
  }, defaultState());
  assert(merged.progress.articleStats.totalDrilled === 3, "totalDrilled changed unexpectedly");
  assert(merged.progress.articleStats.correct === 3, `correct exceeded totalDrilled: ${merged.progress.articleStats.correct}`);
});

test("SRS: invalid ratings and prototype-like IDs are rejected before state mutation", () => {
  let activityCalls = 0;
  const store = {
    state: { srs: { cards: {} } },
    recordActivity: () => { activityCalls++; }
  };
  const srs = loadSrs(store);

  for (const rating of [0, 5, Number.NaN, 2.5, "3"]) {
    assertThrows(() => srs.review("card-1", rating, "vocab"), `Invalid rating ${String(rating)} did not throw`);
  }
  assertThrows(() => srs.getCard("__proto__", "vocab", true), "Prototype-like SRS ID was accepted");
  assert(Object.keys(store.state.srs.cards).length === 0, "Invalid SRS calls mutated card state");
  assert(activityCalls === 0, "Invalid SRS calls recorded learning activity");
});

test("SRS: timezone-offset due dates are compared chronologically, not lexicographically", () => {
  const now = Date.now();
  const store = {
    state: {
      srs: {
        cards: {
          "older": { id: "older", type: "vocab", dueDate: isoWithOffset(now - 120000, 14 * 60), repetitions: 0, interval: 0, state: "new" },
          "recent": { id: "recent", type: "vocab", dueDate: isoWithOffset(now - 60000, 14 * 60), repetitions: 0, interval: 0, state: "new" },
          "future": { id: "future", type: "vocab", dueDate: isoWithOffset(now + 60000, -12 * 60), repetitions: 0, interval: 0, state: "new" }
        }
      }
    },
    recordActivity: () => undefined
  };
  const srs = loadSrs(store);
  const due = srs.getDueCards("vocab");
  assert(due.length === 2, `Expected 2 chronological due cards, found ${due.length}`);
  assert(due[0].id === "older" && due[1].id === "recent", `Due cards were not sorted oldest-first: ${due.map((c) => c.id).join(", ")}`);
  assert(!due.some((card) => card.id === "future"), "Future offset card was falsely classified as due");
  assert(srs.getDeckStats().due === 2, "Deck stats used different due-time semantics from getDueCards");
});

test("Store: runtime IDs and completion values are bounded at the mutation boundary", () => {
  const memory = new Map();
  const mockLocalStorage = {
    getItem: (key) => memory.has(key) ? memory.get(key) : null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };

  const previousLocalStorage = globalThis.localStorage;
  globalThis.localStorage = mockLocalStorage;
  try {
    const testGlobal = { NederLearning: Learning };
    new Function("globalThis", storeSrc)(testGlobal);
    const store = testGlobal.NederStore;

    assert(store.toggleBookmark("__proto__") === false, "Unsafe bookmark ID was accepted");
    assert(store.completeGrammarRule("g-test", 999) === true, "Valid grammar completion failed");
    assert(store.state.progress.grammarCompleted["g-test"].score === 100, "Grammar score was not clamped to 100");
    assert(store.completeGrammarRule("g-test", Number.NaN) === true, "Second grammar attempt failed");
    assert(store.state.progress.grammarCompleted["g-test"].score === 100, "NaN grammar score corrupted best score");
    assert(store.state.progress.grammarCompleted["g-test"].attempts === 2, "Grammar attempts did not increment safely");

    assert(store.completeComprehension("comp-test", 1000, 0) === true, "Valid comprehension completion failed");
    assert(store.state.progress.comprehensionCompleted["comp-test"].score === 100, "Comprehension score was not clamped");
    assert(store.state.progress.comprehensionCompleted["comp-test"].totalQuestions === 1, "Question count was not bounded");

    store.recordActivity(Number.NaN);
    assert(Number.isFinite(store.state.user.totalXp), "NaN activity corrupted total XP");
  } finally {
    if (previousLocalStorage === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = previousLocalStorage;
    }
  }
});

console.log(`\nPR #1 Integrity Tests Complete: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
