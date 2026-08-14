import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "data", "comprehension.js");
const GENERATOR_PATH = join(ROOT, "scripts", "generate_comprehension.mjs");
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

function loadPassages(source = readFileSync(DATA_PATH, "utf8")) {
  return new Function("globalThis", `${source}\nreturn globalThis.NP_COMPREHENSION;`)({});
}

function norm(text) {
  return String(text || "")
    .toLocaleLowerCase("nl-NL")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text) {
  return norm(text).split(" ").filter((t) => t.length > 2);
}

function jaccard(a, b) {
  const A = new Set(tokens(a));
  const B = new Set(tokens(b));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

function ngrams(text, n = 6) {
  const t = tokens(text);
  const out = [];
  for (let i = 0; i <= t.length - n; i++) out.push(t.slice(i, i + n).join(" "));
  return out;
}

function wordCount(paragraphs) {
  return paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
}

function sentenceCount(text) {
  const matches = String(text || "").match(/[.!?](?:["'’”])?(?=\s|$)/g);
  return matches ? matches.length : 0;
}

console.log("\n=======================================================");
console.log("       NederPath Comprehension Truthfulness Tests      ");
console.log("=======================================================\n");

const passages = loadPassages();
const baselineIds = new Map([
  ["Een Ochtend in Utrecht", "comp-001"],
  ["Boodschappen Doen op de Zaterdagmarkt", "comp-002"],
  ["De Nederlandse Fietscultuur", "comp-003"],
  ["Een Afspraak bij de Huisarts", "comp-004"]
]);

const MIN_WORDS = { A1: 80, A2: 120, B1: 180, B2: 250, C1: 320 };

test("Inventory is exactly 24 passages per CEFR level (120 total)", () => {
  if (passages.length !== 120) throw new Error(`Expected 120, found ${passages.length}`);
  const counts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
  for (const p of passages) counts[p.level] = (counts[p.level] || 0) + 1;
  for (const [level, n] of Object.entries(counts)) {
    if (n !== 24) throw new Error(`${level}=${n}`);
  }
});

test("Stable IDs: baseline titles keep comp-001..004; all IDs unique and sequential", () => {
  const ids = passages.map((p) => p.id);
  if (new Set(ids).size !== ids.length) throw new Error("duplicate ids");
  for (const passage of passages) {
    if (baselineIds.has(passage.title) && baselineIds.get(passage.title) !== passage.id) {
      throw new Error(`${passage.title} moved to ${passage.id}`);
    }
  }
  for (let i = 1; i <= 120; i++) {
    const id = `comp-${String(i).padStart(3, "0")}`;
    if (!ids.includes(id)) throw new Error(`missing ${id}`);
  }
});

test("Passage bodies, openings, closings, and question sets are unique", () => {
  const bodies = passages.map((p) => norm(p.paragraphs.join(" ")));
  const openings = passages.map((p) => norm(p.paragraphs[0]));
  const closings = passages.map((p) => norm(p.paragraphs[p.paragraphs.length - 1]));
  const qsets = passages.map((p) => p.questions.map((q) => q.question).join("|"));
  if (new Set(bodies).size !== bodies.length) throw new Error("duplicate body");
  if (new Set(openings).size !== openings.length) throw new Error("duplicate opening");
  if (new Set(closings).size !== closings.length) throw new Error("duplicate closing");
  if (new Set(qsets).size !== qsets.length) throw new Error("duplicate question set");
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      if (jaccard(bodies[i], bodies[j]) > 0.45) {
        throw new Error(`near-duplicate ${passages[i].id} ~ ${passages[j].id}`);
      }
    }
  }
});

test("Recurring template fingerprints and known reviewed defects are absent", () => {
  const corpus = `${readFileSync(GENERATOR_PATH, "utf8")}\n${readFileSync(DATA_PATH, "utf8")}`.toLocaleLowerCase("nl-NL");
  for (const fingerprint of [
    "fascinerend facet van de maatschappelijke werkelijkheid",
    "diep geworteld pragmatisme en overleg",
    "deskundigen en waarnemers zijn het erover eens",
    "experts agree that this topic",
    "officiëel",
    "op de patiëntenportaal",
    "bij de receptie zou aanmelden",
    "5,5 procent, binnen de maximering van het ministerie voor 2026",
    "dat label was beter, wat de huur juist zou kunnen drukken",
    "de code vijf dagen geldig",
    "aftrek voor studiekosten ontbrak"
  ]) {
    if (corpus.includes(fingerprint)) throw new Error(`Found prohibited template/editorial/factual defect: ${fingerprint}`);
  }
});

test("Excessive shared 6-grams are rejected", () => {
  const counts = new Map();
  for (const p of passages) {
    for (const g of new Set(ngrams(p.paragraphs.join(" "), 6))) {
      counts.set(g, (counts.get(g) || 0) + 1);
    }
  }
  const bad = [...counts.entries()].filter(([, n]) => n >= 6);
  if (bad.length) throw new Error(`repeated 6-grams: ${bad.slice(0, 4).map(([g]) => g).join(" | ")}`);
});

test("Every advertised key word occurs in its passage", () => {
  for (const passage of passages) {
    if (!passage.keyVocabulary || passage.keyVocabulary.length < 6) {
      throw new Error(`${passage.id} needs >=6 key vocabulary items`);
    }
    const body = passage.paragraphs.join(" ").toLocaleLowerCase("nl-NL");
    const compactBody = body.replace(/\bte\s+/g, "").replace(/[\s-]+/g, "");
    for (const item of passage.keyVocabulary) {
      const lemma = item.word.toLocaleLowerCase("nl-NL").replace(/^(de|het)\s+/, "");
      const compactLemma = lemma.replace(/[\s-]+/g, "");
      if (!body.includes(lemma) && !compactBody.includes(compactLemma)) {
        throw new Error(`${passage.id} advertises absent key word: ${item.word}`);
      }
    }
  }
});

test("Fields, complete translations, grammar targets, and lengths are valid", () => {
  for (const passage of passages) {
    if (!passage.title || !passage.titleEn || !passage.theme) throw new Error(`${passage.id} missing titles/theme`);
    if (!passage.translation || passage.translation.length < 40) throw new Error(`${passage.id} empty translation`);
    if (!Array.isArray(passage.paragraphs) || passage.paragraphs.length < 3) throw new Error(`${passage.id} <3 paragraphs`);
    if (!passage.readingTimeMin) throw new Error(`${passage.id} missing reading time`);
    if (!passage.grammarTargets || passage.grammarTargets.length < 2) throw new Error(`${passage.id} fake/empty grammar targets`);
    if (passage.grammarTargets.some((t) => String(t).trim().length < 4)) throw new Error(`${passage.id} stub grammar target`);

    const wc = wordCount(passage.paragraphs);
    if (wc < MIN_WORDS[passage.level]) throw new Error(`${passage.id} ${passage.level} too short: ${wc}`);

    const sourceSentences = sentenceCount(passage.paragraphs.join(" "));
    const translatedSentences = sentenceCount(passage.translation);
    if (sourceSentences !== translatedSentences) {
      throw new Error(`${passage.id} translation coverage mismatch: ${sourceSentences} Dutch sentences vs ${translatedSentences} English sentences`);
    }

    const translationWords = passage.translation.split(/\s+/).filter(Boolean).length;
    const coverageRatio = translationWords / wc;
    if (coverageRatio < 0.78) {
      throw new Error(`${passage.id} translation is suspiciously abbreviated: ratio ${coverageRatio.toFixed(2)}`);
    }
  }
});

test("Quiz answer positions are varied and every question is valid", () => {
  const positions = new Set();
  const posCount = [0, 0, 0, 0];
  for (const passage of passages) {
    if (passage.questions.length !== 4) throw new Error(`${passage.id} needs 4 questions`);
    for (const question of passage.questions) {
      if (question.options.length !== 4 || new Set(question.options).size !== 4) throw new Error(`Invalid options in ${passage.id}`);
      if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct > 3) throw new Error(`Invalid answer index in ${passage.id}`);
      if (!question.explanation) throw new Error(`Missing explanation in ${passage.id}`);
      positions.add(question.correct);
      posCount[question.correct]++;
    }
  }
  if (positions.size !== 4) throw new Error(`Expected all four answer positions, found ${[...positions].join(", ")}`);
  const total = posCount.reduce((a, b) => a + b, 0);
  for (let i = 0; i < 4; i++) {
    const share = posCount[i] / total;
    if (share < 0.12 || share > 0.4) throw new Error(`answer-position bias at ${i}: ${(share * 100).toFixed(1)}%`);
  }
});

test("Declared current-fact claims have matching source passages", () => {
  const registry = JSON.parse(readFileSync(join(ROOT, "tests", "fixtures", "comprehension_current_claims.json"), "utf8"));
  const byId = new Map(passages.map((p) => [p.id, p]));
  if (!Array.isArray(registry.claims) || registry.claims.length < 1) {
    throw new Error("current-claims registry is empty");
  }
  for (const claim of registry.claims) {
    const passage = byId.get(claim.id);
    if (!passage) throw new Error(`provenance id missing from corpus: ${claim.id}`);
    const body = `${passage.paragraphs.join(" ")}\n${passage.translation}`.toLocaleLowerCase("nl-NL");
    for (const token of claim.mustInclude || []) {
      if (!body.includes(String(token).toLocaleLowerCase("nl-NL"))) {
        throw new Error(`${claim.id} missing declared current-fact token: ${token}`);
      }
    }
  }
});

test("Two real generator runs are byte-identical and checkout is canonical", () => {
  const before = readFileSync(DATA_PATH, "utf8");
  for (let run = 0; run < 2; run++) {
    const result = spawnSync(process.execPath, [GENERATOR_PATH], { cwd: ROOT, encoding: "utf8" });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || `Generator exited ${result.status}`);
    const generated = readFileSync(DATA_PATH, "utf8");
    if (generated !== before) throw new Error(`Generator run ${run + 1} changed the canonical artifact`);
  }
});

console.log(`\nComprehension Tests Complete: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
