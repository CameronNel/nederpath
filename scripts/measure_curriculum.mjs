import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function load(name, globalKey) {
  const src = readFileSync(join(ROOT, "data", name), "utf8");
  return new Function("globalThis", `${src}\nreturn globalThis.${globalKey};`)({});
}

function norm(text) {
  return String(text || "").toLocaleLowerCase("nl-NL").replace(/\s+/g, " ").trim();
}

const grammar = load("grammar.js", "NP_GRAMMAR");
const comps = load("comprehension.js", "NP_COMPREHENSION");

const report = {
  schemaVersion: 1,
  grammar: {
    count: grammar.length,
    uniqueSummaries: new Set(grammar.map((g) => norm(g.summary))).size,
    uniqueBreakdowns: new Set(grammar.map((g) => norm(g.structuralBreakdown))).size,
    uniqueMistakes: new Set(grammar.map((g) => norm(g.commonMistake))).size,
    uniqueCorrections: new Set(grammar.map((g) => norm(g.correction))).size,
    levels: Object.fromEntries(["A1", "A2", "B1", "B2", "C1"].map((l) => [l, grammar.filter((g) => g.level === l).length])),
    sections: Object.fromEntries([...new Set(grammar.map((g) => g.section))].map((s) => [s, grammar.filter((g) => g.section === s).length])),
    exerciseTypes: grammar.reduce((acc, g) => {
      for (const e of g.exercises) acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {})
  },
  comprehension: {
    count: comps.length,
    levels: Object.fromEntries(["A1", "A2", "B1", "B2", "C1"].map((l) => [l, comps.filter((c) => c.level === l).length])),
    uniqueBodies: new Set(comps.map((c) => norm(c.paragraphs.join(" ")))).size,
    answerPositions: comps.flatMap((c) => c.questions.map((q) => q.correct)).reduce((acc, i) => {
      acc[i] = (acc[i] || 0) + 1;
      return acc;
    }, {}),
    wordCounts: Object.fromEntries(["A1", "A2", "B1", "B2", "C1"].map((l) => {
      const w = comps.filter((c) => c.level === l).map((c) => c.paragraphs.join(" ").split(/\s+/).length);
      return [l, { min: Math.min(...w), max: Math.max(...w), mean: Math.round(w.reduce((a, b) => a + b, 0) / w.length) }];
    }))
  }
};

writeFileSync(join(ROOT, "tests", "fixtures", "curriculum_audit.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
