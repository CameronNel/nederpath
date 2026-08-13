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

test("Only independently authored baseline passages are published", () => {
  if (passages.length !== baselineIds.size) throw new Error(`Expected ${baselineIds.size}, found ${passages.length}`);
});

test("Published passage IDs preserve existing learner progress", () => {
  for (const passage of passages) {
    if (baselineIds.get(passage.title) !== passage.id) {
      throw new Error(`${passage.title} moved from ${baselineIds.get(passage.title)} to ${passage.id}`);
    }
  }
});

test("Passage bodies and question prompts are unique", () => {
  const bodies = passages.map((passage) => passage.paragraphs.join(" ").toLocaleLowerCase("nl-NL").replace(/\s+/g, " ").trim());
  const prompts = passages.flatMap((passage) => passage.questions.map((question) => question.question));
  if (new Set(bodies).size !== bodies.length) throw new Error("Duplicate passage body detected");
  if (new Set(prompts).size !== prompts.length) throw new Error("Duplicate question prompt detected");
});

test("Every advertised key word occurs in its passage", () => {
  for (const passage of passages) {
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

test("Topic-swapped padding fingerprints are absent from source and artifact", () => {
  const corpus = `${readFileSync(GENERATOR_PATH, "utf8")}\n${readFileSync(DATA_PATH, "utf8")}`.toLocaleLowerCase("nl-NL");
  for (const fingerprint of [
    "fascinerend facet van de maatschappelijke werkelijkheid",
    "diep geworteld pragmatisme en overleg",
    "deskundigen en waarnemers zijn het erover eens"
  ]) {
    if (corpus.includes(fingerprint)) throw new Error(`Found prohibited template: ${fingerprint}`);
  }
});

test("Quiz answer positions are varied and every question is valid", () => {
  const positions = new Set();
  for (const passage of passages) {
    for (const question of passage.questions) {
      if (question.options.length !== 4 || new Set(question.options).size !== 4) throw new Error(`Invalid options in ${passage.id}`);
      if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct > 3) throw new Error(`Invalid answer index in ${passage.id}`);
      if (!question.explanation) throw new Error(`Missing explanation in ${passage.id}`);
      positions.add(question.correct);
    }
  }
  if (positions.size !== 4) throw new Error(`Expected all four answer positions, found ${[...positions].join(", ")}`);
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
