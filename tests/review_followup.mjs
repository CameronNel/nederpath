// Focused regressions added during independent review of PR #9.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { targetOccursInSurface, validateSentenceRow } from "../scripts/sentence_norm.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const learningSrc = readFileSync(join(ROOT, "js", "learning.js"), "utf8");
const dummyGlobal = {};
new Function("globalThis", "module", "exports", learningSrc)(dummyGlobal, {}, {});
const Learning = dummyGlobal.NederLearning;

const srsSrc = readFileSync(join(ROOT, "js", "srs.js"), "utf8");
const srsGlobal = {};
new Function("globalThis", srsSrc)(srsGlobal);
const SRSEngine = srsGlobal.NederSRS.constructor;

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

test("Sentence targets require complete Unicode token/span boundaries", () => {
  if (!targetOccursInSurface("Nederlands", "Ik leer Nederlands.")) {
    throw new Error("Exact surface token was rejected");
  }
  if (!targetOccursInSurface("openbaar vervoer", "Ik reis vaak met het openbaar vervoer.")) {
    throw new Error("Exact multiword surface span was rejected");
  }
  if (targetOccursInSurface("land", "Ik leer Nederlands.")) {
    throw new Error("Substring inside a larger word was falsely accepted");
  }
  if (targetOccursInSurface("de", "Nederlandse lessen zijn nuttig.")) {
    throw new Error("Function-word substring inside a larger word was falsely accepted");
  }
});

test("Sentence row validator rejects substring-only target metadata", () => {
  const row = {
    id: "snt-99999",
    nl: "Ik leer Nederlands.",
    en: "I am learning Dutch.",
    level: "A1",
    tags: ["present_tense"],
    category: "education",
    targetWord: "land",
    targetWords: ["land"],
    clozeEligible: true,
    provenance: "curated",
    curated: true
  };
  const errors = validateSentenceRow(row);
  if (!errors.some((e) => e.includes("complete Dutch surface token/span"))) {
    throw new Error(`Expected boundary validation error, got: ${errors.join(" | ")}`);
  }
});

test("Fill-blank fails closed when target metadata is absent or invalid", () => {
  const base = {
    id: "snt-test",
    nl: "Ik koop verse groenten op de markt.",
    en: "I buy fresh vegetables at the market.",
    level: "A1",
    category: "shopping",
    clozeEligible: true
  };

  if (Learning.createFillBlankCard(base, []) !== null) {
    throw new Error("Missing target metadata silently produced a card");
  }
  if (Learning.createFillBlankCard({ ...base, targetWords: ["groente"] }, []) !== null) {
    throw new Error("Substring/non-surface target silently produced a card");
  }
  if (Learning.createFillBlankCard({ ...base, targetWords: ["bestaatniet"] }, []) !== null) {
    throw new Error("Absent target silently produced a card");
  }
  if (Learning.createFillBlankCard({ ...base, targetWords: ["groenten"], clozeEligible: false }, []) !== null) {
    throw new Error("clozeEligible=false still produced a card");
  }
});

test("Fill-blank uses explicit targetWord/targetWords and masks the exact surface token", () => {
  const sentence = {
    id: "snt-test-2",
    nl: "Ik koop verse groenten op de markt.",
    en: "I buy fresh vegetables at the market.",
    level: "A1",
    category: "shopping",
    clozeEligible: true,
    targetWord: "groenten",
    targetWords: ["groenten", "markt"]
  };
  const card = Learning.createFillBlankCard(sentence, []);
  if (!card) throw new Error("Valid explicit target did not produce a card");
  if (card.targetWord !== "groenten") throw new Error(`Expected 'groenten', got '${card.targetWord}'`);
  if (card.maskedSentence !== "Ik koop verse _______ op de markt.") {
    throw new Error(`Unexpected mask: '${card.maskedSentence}'`);
  }
});

test("SRS preview is non-mutating and exactly matches real review across card states", () => {
  const scenarios = [
    null,
    { id: "card", type: "vocab", interval: 0, easeFactor: 2.5, repetitions: 0, lapses: 0, state: "new" },
    { id: "card", type: "vocab", interval: 3, easeFactor: 2.3, repetitions: 1, lapses: 1, state: "learning" },
    { id: "card", type: "vocab", interval: 47, easeFactor: 2.65, repetitions: 6, lapses: 2, state: "review" },
    { id: "card", type: "vocab", interval: -99, easeFactor: 99, repetitions: -4, lapses: -8, state: "corrupt" }
  ];

  function makeStore(card) {
    return {
      state: { srs: { cards: card ? { card: structuredClone(card) } : {} } },
      awardedXp: 0,
      recordActivity(xp) { this.awardedXp += xp; }
    };
  }

  for (const scenario of scenarios) {
    for (const rating of [1, 2, 3, 4]) {
      const previewStore = makeStore(scenario);
      const reviewStore = makeStore(scenario);
      const previewEngine = new SRSEngine(previewStore);
      const reviewEngine = new SRSEngine(reviewStore);
      const beforePreview = JSON.stringify(previewStore.state.srs.cards);

      const preview = previewEngine.previewReview("card", rating, "vocab");
      const actual = reviewEngine.review("card", rating, "vocab");

      if (JSON.stringify(previewStore.state.srs.cards) !== beforePreview) {
        throw new Error(`Preview mutated state for rating ${rating}`);
      }
      if (previewStore.awardedXp !== 0) {
        throw new Error(`Preview awarded XP for rating ${rating}`);
      }

      for (const field of ["id", "type", "interval", "easeFactor", "repetitions", "lapses", "state"]) {
        if (preview[field] !== actual[field]) {
          throw new Error(`Preview/review drift for ${field}, rating ${rating}: ${preview[field]} vs ${actual[field]}`);
        }
      }
    }
  }
});

if (process.exitCode) {
  console.error(`\nReview follow-up regressions failed after ${passed} passing test(s).`);
} else {
  console.log(`\nReview follow-up regressions: ${passed} passed, 0 failed.`);
}
