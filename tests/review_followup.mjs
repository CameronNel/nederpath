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

if (process.exitCode) {
  console.error(`\nReview follow-up regressions failed after ${passed} passing test(s).`);
} else {
  console.log(`\nReview follow-up regressions: ${passed} passed, 0 failed.`);
}
