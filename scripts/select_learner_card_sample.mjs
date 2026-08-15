// Deterministic fresh-perspective sample for manual review of learner-facing cards.
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadGeneratedWords, normalizeLexicalForm } from "./lexical_data.mjs";

const target = 200;
const learnerRows = loadGeneratedWords().filter((word) => word.learnable === true);
const hash = (value) => createHash("sha256").update(value).digest("hex");
const ranked = learnerRows
  .map((word) => ({ word, rank: hash(`${word.id}:${normalizeLexicalForm(word.word)}`) }))
  .sort((a, b) => a.rank.localeCompare(b.rank) || a.word.id.localeCompare(b.word.id));

const selected = new Map();
const takeFirst = (predicate) => {
  const candidate = ranked.find(({ word }) => predicate(word) && !selected.has(word.id));
  if (candidate) selected.set(candidate.word.id, candidate.word);
};

// Seed every learner-visible level, POS, and category before filling the rest.
for (const level of ["A1", "A2", "B1", "B2", "C1"]) takeFirst((word) => word.level === level);
for (const pos of [...new Set(learnerRows.map((word) => word.pos)).values()].sort()) takeFirst((word) => word.pos === pos);
for (const category of [...new Set(learnerRows.map((word) => word.category)).values()].sort()) takeFirst((word) => word.category === category);
for (const { word } of ranked) {
  if (selected.size >= target) break;
  selected.set(word.id, word);
}

if (selected.size < target) throw new Error(`Only selected ${selected.size} learner cards; expected ${target}`);

const cards = [...selected.values()]
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((word) => ({
    id: word.id,
    word: word.word,
    displayWord: word.displayWord,
    lemma: word.lemma,
    article: word.article,
    level: word.level,
    pos: word.pos,
    meaning: word.meaning,
    category: word.category,
    curated: word.curated,
    learnable: word.learnable,
    sources: (word.senses || []).map((sense) => sense.source),
    senses: (word.senses || []).map((sense) => ({ source: sense.source, pos: sense.pos, meaning: sense.meaning }))
  }));

const report = {
  selection: "sha256(id + normalized surface), seeded by level/POS/category, then filled by rank",
  generatedLearnerRows: learnerRows.length,
  selected: cards.length,
  levels: Object.fromEntries([...new Set(cards.map((card) => card.level))].sort().map((level) => [level, cards.filter((card) => card.level === level).length])),
  pos: Object.fromEntries([...new Set(cards.map((card) => card.pos))].sort().map((pos) => [pos, cards.filter((card) => card.pos === pos).length])),
  categories: Object.fromEntries([...new Set(cards.map((card) => card.category))].sort().map((category) => [category, cards.filter((card) => card.category === category).length])),
  cards
};

mkdirSync(join(ROOT, "reports"), { recursive: true });
writeFileSync(join(ROOT, "reports", "manual-learner-sample-200.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ generatedLearnerRows: learnerRows.length, selected: cards.length, levels: report.levels, pos: report.pos, categories: Object.keys(report.categories).length }, null, 2));
