// NederPath Comprehensive Quality Audit Script (35+ checks)
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let passed = 0;
let failed = 0;

function assert(condition, name, details = "") {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${name}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${name} ${details ? "- " + details : ""}`);
  }
}

console.log("\n=======================================================");
console.log("             NederPath Full Quality Audit              ");
console.log("=======================================================\n");

// 1. Files existence checks
console.log("--- 1. File Structure & Assets ---");
const requiredFiles = [
  "index.html",
  "css/styles.css",
  "js/store.js",
  "js/srs.js",
  "js/voice.js",
  "js/app.js",
  "data/words.js",
  "data/grammar.js",
  "data/sentences.js",
  "data/idioms.js",
  "data/comprehension.js",
  "manifest.webmanifest",
  "sw.js",
  ".github/workflows/deploy.yml",
  "icons/favicon-32.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png"
];

for (const file of requiredFiles) {
  assert(existsSync(join(ROOT, file)), `File exists: ${file}`);
}

// 2. Data Bank: Words (20,000 words)
console.log("\n--- 2. Word Bank Validation (data/words.js) ---");
const wordsSrc = readFileSync(join(ROOT, "data", "words.js"), "utf8");
const dummyGlobal = {};
const fnWords = new Function("globalThis", wordsSrc + "\nreturn globalThis.NP_WORDS;");
const words = fnWords(dummyGlobal);

assert(Array.isArray(words), "NP_WORDS is an array");
assert(words.length === 20000, `NP_WORDS count is exactly 20,000 (actual: ${words.length})`);

// Check unique IDs & words
const ids = new Set();
const normWords = new Set();
let dupIds = 0;
let dupWords = 0;
let uncuratedNounsWithoutArticle = 0;
let nounsWithoutDisplayArticle = 0;

for (const w of words) {
  if (ids.has(w.id)) dupIds++;
  ids.add(w.id);

  const norm = w.word.toLowerCase().trim();
  if (normWords.has(norm)) dupWords++;
  normWords.add(norm);

  if (w.pos === "noun" && w.learnable && !w.article) {
    uncuratedNounsWithoutArticle++;
  }
  if (w.pos === "noun" && w.article && (!w.displayWord || !w.displayWord.startsWith(w.article))) {
    nounsWithoutDisplayArticle++;
  }
}

assert(dupIds === 0, "All word IDs are unique");
assert(dupWords === 0, "All normalized Dutch word forms are unique");
assert(uncuratedNounsWithoutArticle === 0, "All learnable Dutch nouns carry a verified de/het article");
assert(nounsWithoutDisplayArticle === 0, "All learnable Dutch nouns have displayWord with article (e.g. 'de tafel', 'het huis')");

// 3. Grammar Curriculum (data/grammar.js)
console.log("\n--- 3. Grammar Curriculum Validation (data/grammar.js) ---");
const grammarSrc = readFileSync(join(ROOT, "data", "grammar.js"), "utf8");
const fnGrammar = new Function("globalThis", grammarSrc + "\nreturn globalThis.NP_GRAMMAR;");
const grammar = fnGrammar(dummyGlobal);

assert(Array.isArray(grammar), "NP_GRAMMAR is an array");
assert(grammar.length >= 120, `NP_GRAMMAR has >= 120 rules (actual: ${grammar.length})`);

const sectionsCovered = new Set(grammar.map((g) => g.section));
assert(sectionsCovered.size === 8, `Grammar covers all 8 CEFR sections (actual: ${sectionsCovered.size})`);

let invalidExercises = 0;
for (const g of grammar) {
  if (!g.title || !g.titleNl || !g.summary || !Array.isArray(g.rules) || !Array.isArray(g.examples)) {
    invalidExercises++;
  }
  if (!Array.isArray(g.exercises) || g.exercises.length === 0) {
    invalidExercises++;
  }
}
assert(invalidExercises === 0, "All grammar rules have valid structures, examples, and exercises");

// 4. Idioms Bank (data/idioms.js)
console.log("\n--- 4. Idioms Bank Validation (data/idioms.js) ---");
const idiomsSrc = readFileSync(join(ROOT, "data", "idioms.js"), "utf8");
const fnIdioms = new Function("globalThis", idiomsSrc + "\nreturn globalThis.NP_IDIOMS;");
const idioms = fnIdioms(dummyGlobal);

assert(Array.isArray(idioms), "NP_IDIOMS is an array");
assert(idioms.length >= 500, `NP_IDIOMS count >= 500 (actual: ${idioms.length})`);

let invalidIdioms = 0;
for (const idm of idioms) {
  if (!idm.dutch || !idm.meaning || !idm.example) {
    invalidIdioms++;
  }
}
assert(invalidIdioms === 0, "All idioms carry Dutch, meaning, and example sentences");

// 5. Comprehension Bank (data/comprehension.js)
console.log("\n--- 5. Comprehension Passages Validation (data/comprehension.js) ---");
const compSrc = readFileSync(join(ROOT, "data", "comprehension.js"), "utf8");
const fnComp = new Function("globalThis", compSrc + "\nreturn globalThis.NP_COMPREHENSION;");
const comp = fnComp(dummyGlobal);

assert(Array.isArray(comp), "NP_COMPREHENSION is an array");
assert(comp.length >= 100, `NP_COMPREHENSION count >= 100 (actual: ${comp.length})`);

const compLevelCounts = {};
for (const p of comp) {
  compLevelCounts[p.level] = (compLevelCounts[p.level] || 0) + 1;
}
assert(compLevelCounts["A1"] >= 20, `A1 passages >= 20 (actual: ${compLevelCounts["A1"]})`);
assert(compLevelCounts["A2"] >= 20, `A2 passages >= 20 (actual: ${compLevelCounts["A2"]})`);
assert(compLevelCounts["B1"] >= 20, `B1 passages >= 20 (actual: ${compLevelCounts["B1"]})`);
assert(compLevelCounts["B2"] >= 20, `B2 passages >= 20 (actual: ${compLevelCounts["B2"]})`);
assert(compLevelCounts["C1"] >= 20, `C1 passages >= 20 (actual: ${compLevelCounts["C1"]})`);

// 6. Sentence Bank (data/sentences.js)
console.log("\n--- 6. Sentence Bank Validation (data/sentences.js) ---");
const sentSrc = readFileSync(join(ROOT, "data", "sentences.js"), "utf8");
const fnSent = new Function("globalThis", sentSrc + "\nreturn globalThis.NP_SENTENCES;");
const sentences = fnSent(dummyGlobal);

assert(Array.isArray(sentences), "NP_SENTENCES is an array");
assert(sentences.length >= 5000, `NP_SENTENCES count >= 5,000 (actual: ${sentences.length})`);

// Summary
console.log("\n=======================================================");
console.log(`Audit Completed: ${passed} Passed, ${failed} Failed`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
