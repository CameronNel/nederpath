import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "data", "grammar.js");
const GENERATOR_PATH = join(ROOT, "scripts", "generate_grammar.mjs");

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

function loadRules(source = readFileSync(DATA_PATH, "utf8")) {
  return new Function("globalThis", `${source}\nreturn globalThis.NP_GRAMMAR;`)({});
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

function ngrams(text, n = 5) {
  const t = tokens(text);
  const out = [];
  for (let i = 0; i <= t.length - n; i++) out.push(t.slice(i, i + n).join(" "));
  return out;
}

const FINGERPRINTS = [
  "de deskundigen passen",
  "in deze officiele context",
  "in deze officiële context",
  "het is van groot belang dat men deze structuur",
  "de onderzoeker legt de regel duidelijk",
  "de studenten bestuderen",
  "vereist strikte toepassing van de nederlandse woordvolgorde",
  "morfologische concordanse",
  "aanhef / focus",
  "werkwoordelijk slotstuk"
];

console.log("\n=======================================================");
console.log("       NederPath Grammar Anti-Template Tests           ");
console.log("=======================================================\n");

const rules = loadRules();
const source = `${readFileSync(GENERATOR_PATH, "utf8")}\n${readFileSync(DATA_PATH, "utf8")}`;

test("Exactly 120 lessons with stable g-001..g-120 IDs in order", () => {
  if (rules.length !== 120) throw new Error(`expected 120, got ${rules.length}`);
  rules.forEach((rule, i) => {
    const expected = `g-${String(i + 1).padStart(3, "0")}`;
    if (rule.id !== expected) throw new Error(`index ${i} has ${rule.id}`);
    if (rule.section !== Math.floor(i / 15) + 1) throw new Error(`${rule.id} wrong section ${rule.section}`);
  });
});

test("Required pedagogical fields are present and non-vacuous", () => {
  for (const rule of rules) {
    for (const field of ["title", "titleNl", "summary", "structuralBreakdown", "commonMistake", "correction", "sectionTitle"]) {
      if (!rule[field] || String(rule[field]).trim().length < 12) {
        throw new Error(`${rule.id} empty/short ${field}`);
      }
    }
    if (!["A0", "A1", "A2", "B1", "B2", "C1"].includes(rule.level)) {
      throw new Error(`${rule.id} invalid level ${rule.level}`);
    }
    if (!Array.isArray(rule.rules) || rule.rules.length < 3) throw new Error(`${rule.id} needs >=3 rules`);
    if (rule.rules.some((r) => String(r).length < 24)) throw new Error(`${rule.id} has a stub rule`);
    if (!Array.isArray(rule.examples) || rule.examples.length < 2) throw new Error(`${rule.id} needs examples`);
    for (const ex of rule.examples) {
      if (!ex.nl || !ex.en || !ex.highlight) throw new Error(`${rule.id} incomplete example`);
    }
    if (!Array.isArray(rule.exercises) || rule.exercises.length < 4) {
      throw new Error(`${rule.id} needs >=4 exercises`);
    }
  }
});

test("No duplicate normalized summaries, rule arrays, or breakdowns", () => {
  const sums = rules.map((r) => norm(r.summary));
  const br = rules.map((r) => norm(r.structuralBreakdown));
  const ra = rules.map((r) => norm(r.rules.join(" | ")));
  if (new Set(sums).size !== sums.length) throw new Error("duplicate summary");
  if (new Set(br).size !== br.length) throw new Error("duplicate structuralBreakdown");
  if (new Set(ra).size !== ra.length) throw new Error("duplicate rules");
});

test("Mistake/correction shells are lesson-specific", () => {
  const mistakes = rules.map((r) => norm(r.commonMistake));
  const corrections = rules.map((r) => norm(r.correction));
  if (new Set(mistakes).size !== mistakes.length) throw new Error("duplicate commonMistake");
  if (new Set(corrections).size !== corrections.length) throw new Error("duplicate correction");
  for (const rule of rules) {
    if (/foutieve woordvolgorde of onjuiste verbuiging bij/.test(norm(rule.commonMistake))) {
      throw new Error(`${rule.id} uses generic mistake shell`);
    }
    if (/pas de standaardvolgorde en de relevante/.test(norm(rule.correction))) {
      throw new Error(`${rule.id} uses generic correction shell`);
    }
  }
});

test("Known title-interpolation fingerprints are absent", () => {
  const blob = source.toLocaleLowerCase("nl-NL");
  for (const fp of FINGERPRINTS) {
    if (blob.includes(fp)) throw new Error(`fingerprint: ${fp}`);
  }
});

test("No title interpolation into generic rule shells", () => {
  for (const rule of rules) {
    const joined = rule.rules.join(" ");
    if (joined.includes(rule.titleNl) && /vereist strikte toepassing/i.test(joined)) {
      throw new Error(`${rule.id} interpolates title into generic rule`);
    }
  }
});

function assertExerciseSchema(ruleId, ex, index) {
  const where = `${ruleId} exercise ${index} (${ex.type || "missing-type"})`;
  switch (ex.type) {
    case "multiple_choice":
      if (!ex.question || String(ex.question).trim().length < 8) throw new Error(`${where} missing question`);
      if (!Array.isArray(ex.options) || ex.options.length !== 4) throw new Error(`${where} needs exactly 4 options`);
      if (new Set(ex.options.map(String)).size !== 4) throw new Error(`${where} duplicate MC options`);
      if (!Number.isInteger(ex.correct) || ex.correct < 0 || ex.correct > 3) throw new Error(`${where} invalid answer index`);
      if (!ex.explanation || String(ex.explanation).trim().length < 8) throw new Error(`${where} missing explanation`);
      return ex.question;
    case "fill_in_the_blank":
      if (!ex.prompt || !ex.sentenceWithBlank || !ex.blankWord) throw new Error(`${where} needs prompt, sentenceWithBlank, blankWord`);
      if (!String(ex.sentenceWithBlank).includes("___")) throw new Error(`${where} sentenceWithBlank needs ___`);
      return ex.prompt;
    case "error_correction":
      if (!ex.sentenceWithError || !ex.correctedSentence || !ex.explanation) {
        throw new Error(`${where} needs sentenceWithError, correctedSentence, explanation`);
      }
      return ex.sentenceWithError;
    case "sentence_transformation":
      if (!ex.original || !ex.instruction || !ex.transformed) {
        throw new Error(`${where} needs original, instruction, transformed`);
      }
      return ex.instruction;
    case "word_order":
      if (!Array.isArray(ex.tokens) || ex.tokens.length < 2) throw new Error(`${where} needs a nonempty token array`);
      if (!ex.correctSentence || String(ex.correctSentence).trim().length < 3) throw new Error(`${where} missing correctSentence`);
      return ex.correctSentence;
    case "typed_conjugation":
      if (!ex.infinitive || !ex.subject || !ex.correctForm) throw new Error(`${where} needs infinitive, subject, correctForm`);
      if (!ex.targetTense) throw new Error(`${where} needs targetTense`);
      return `${ex.infinitive} ${ex.subject} ${ex.correctForm}`;
    case "article_selection":
      if (!ex.noun) throw new Error(`${where} missing noun`);
      if (!["de", "het"].includes(ex.correct)) throw new Error(`${where} correct must be de or het`);
      return `${ex.noun} ${ex.correct}`;
    default:
      throw new Error(`${where} unknown or missing exercise type`);
  }
}

test("Exercise sets and prompts are unique and schema-valid", () => {
  const sets = new Set();
  const prompts = new Set();
  for (const rule of rules) {
    const sig = JSON.stringify(rule.exercises.map((e) => e.type + ":" + (e.question || e.prompt || e.instruction || e.sentenceWithError || "")));
    if (sets.has(sig)) throw new Error(`identical exercise set: ${rule.id}`);
    sets.add(sig);
    rule.exercises.forEach((ex, index) => {
      const p = assertExerciseSchema(rule.id, ex, index);
      const key = norm(p);
      if (prompts.has(key)) throw new Error(`repeated prompt: ${p}`);
      prompts.add(key);
    });
  }
});

test("Lesson bodies are not near-duplicates", () => {
  const bodies = rules.map((r) => `${r.summary} ${r.rules.join(" ")} ${r.examples.map((e) => e.nl).join(" ")}`);
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      if (jaccard(bodies[i], bodies[j]) > 0.62) {
        throw new Error(`near-duplicate bodies ${rules[i].id} ~ ${rules[j].id}`);
      }
    }
  }
});

test("Excessive shared 5-grams are rejected", () => {
  const counts = new Map();
  for (const rule of rules) {
    const text = `${rule.summary} ${rule.rules.join(" ")} ${rule.examples.map((e) => e.nl).join(" ")} ${rule.commonMistake}`;
    for (const g of new Set(ngrams(text, 5))) {
      counts.set(g, (counts.get(g) || 0) + 1);
    }
  }
  const offenders = [...counts.entries()].filter(([, n]) => n >= 8);
  if (offenders.length) throw new Error(`repeated 5-grams: ${offenders.slice(0, 5).map(([g]) => g).join(" | ")}`);
});

test("Two generator runs are byte-identical to checkout", () => {
  const before = readFileSync(DATA_PATH, "utf8");
  for (let run = 0; run < 2; run++) {
    const result = spawnSync(process.execPath, [GENERATOR_PATH], { cwd: ROOT, encoding: "utf8" });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || `exit ${result.status}`);
    if (readFileSync(DATA_PATH, "utf8") !== before) throw new Error(`run ${run + 1} drifted`);
  }
});

console.log(`\nGrammar quality tests: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
