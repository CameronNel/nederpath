// NederPath Smoke & Unit Test Suite
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.error(`  ✗ ${name}:`, e.message);
  }
}

console.log("\n--- NederPath Unit & Smoke Tests ---\n");

// 1. Spaced Repetition Algorithm Tests
test("SRS: Initial new card state is scheduled correctly", () => {
  const dummyStore = {
    state: { srs: { cards: {} }, progress: { dailyStats: { learnedToday: 0 } }, user: { totalXp: 0 } },
    save() {},
    recordActivity() {}
  };
  
  globalThis.NederStore = dummyStore;
  const srsSrc = readFileSync(join(ROOT, "js", "srs.js"), "utf8");
  new Function(srsSrc)();
  const srsInstance = globalThis.NederSRS;

  const card = srsInstance.getCard("test-01", "vocab");
  if (card.interval !== 0 || card.easeFactor !== 2.5) throw new Error("Invalid initial card parameters");
});

test("SRS: Successful review increments repetitions and interval", () => {
  const dummyStore = {
    state: { srs: { cards: {} }, progress: { dailyStats: { learnedToday: 0 } }, user: { totalXp: 0 } },
    save() {},
    recordActivity() {}
  };
  
  globalThis.NederStore = dummyStore;
  const srsSrc = readFileSync(join(ROOT, "js", "srs.js"), "utf8");
  new Function(srsSrc)();
  const srsInstance = globalThis.NederSRS;

  srsInstance.review("test-02", 3, "vocab");
  const card = srsInstance.getCard("test-02", "vocab");
  if (card.repetitions !== 1 || card.interval < 1) throw new Error("Repetitions/interval not updated properly on review");
});

test("SRS: Failed review resets interval and records lapse", () => {
  const dummyStore = {
    state: { srs: { cards: {} }, progress: { dailyStats: { learnedToday: 0 } }, user: { totalXp: 0 } },
    save() {},
    recordActivity() {}
  };
  
  globalThis.NederStore = dummyStore;
  const srsSrc = readFileSync(join(ROOT, "js", "srs.js"), "utf8");
  new Function(srsSrc)();
  const srsInstance = globalThis.NederSRS;

  srsInstance.review("test-03", 1, "vocab");
  const card = srsInstance.getCard("test-03", "vocab");
  if (card.lapses !== 1 || card.repetitions !== 0 || card.state !== "learning") {
    throw new Error("Lapse not handled properly on failed review");
  }
});

// 2. Data Structure Smoke Tests
test("Data: Canonical word bank loads with truthful structural invariants", () => {
  const wordsSrc = readFileSync(join(ROOT, "data", "words.js"), "utf8");
  new Function(wordsSrc)();
  const words = globalThis.NP_WORDS;

  if (!Array.isArray(words) || words.length === 0) throw new Error("Word bank is missing or empty");
  const ids = new Set();
  const normalizedWords = new Set();
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const norm = String(w.word || "").toLowerCase().trim();
    if (!/^nl-\d+$/.test(w.id) || !norm || w.rank !== i + 1) throw new Error(`Invalid word structure at index ${i}`);
    if (ids.has(w.id) || normalizedWords.has(norm)) throw new Error(`Duplicate ID or normalized word at index ${i}`);
    ids.add(w.id);
    normalizedWords.add(norm);
    if (w.learnable && !w.curated) throw new Error(`Uncurated row '${w.word}' is learnable`);
    if (w.example !== null || w.exampleEn !== null || w.frequency !== null) {
      throw new Error(`Unsourced example/frequency remains on '${w.word}'`);
    }
  }
});

test("Data: Grammar curriculum contains exactly 8 sections and >= 120 rules", () => {
  const grammarSrc = readFileSync(join(ROOT, "data", "grammar.js"), "utf8");
  new Function(grammarSrc)();
  const grammar = globalThis.NP_GRAMMAR;

  if (!Array.isArray(grammar) || grammar.length < 120) throw new Error(`Grammar count is ${grammar.length}, expected >= 120`);
  const sections = new Set(grammar.map((g) => g.section));
  if (sections.size !== 8) throw new Error(`Section count is ${sections.size}, expected 8`);
});

test("Data: Idioms bank contains >= 500 entries", () => {
  const idiomsSrc = readFileSync(join(ROOT, "data", "idioms.js"), "utf8");
  new Function(idiomsSrc)();
  const idioms = globalThis.NP_IDIOMS;

  if (!Array.isArray(idioms) || idioms.length < 500) throw new Error(`Idioms count is ${idioms.length}, expected >= 500`);
});

test("Data: Comprehension passages contain >= 120 entries with questions", () => {
  const compSrc = readFileSync(join(ROOT, "data", "comprehension.js"), "utf8");
  new Function(compSrc)();
  const comp = globalThis.NP_COMPREHENSION;

  if (!Array.isArray(comp) || comp.length < 120) throw new Error(`Comprehension count is ${comp.length}, expected >= 120`);
  for (const c of comp) {
    if (!c.questions || c.questions.length === 0) throw new Error(`Passage ${c.id} has no questions`);
  }
});

test("Data: Sentence bank contains >= 5,000 entries", () => {
  const sentSrc = readFileSync(join(ROOT, "data", "sentences.js"), "utf8");
  new Function(sentSrc)();
  const sents = globalThis.NP_SENTENCES;

  if (!Array.isArray(sents) || sents.length < 5000) throw new Error(`Sentences count is ${sents.length}, expected >= 5000`);
});

console.log(`\nSmoke Tests Complete: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
