// Deterministic manual-review sample selector for the lexical bank.
// The output is a review queue; it is deliberately not a pass/fail counter.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadCuratedRows, sourceFields } from "./lexical_data.mjs";

const TARGET = 500;
const { rows } = loadCuratedRows(ROOT);
const ranked = rows.map((record) => {
  const fields = sourceFields(record);
  const key = `${record.file}:${record.index}:${fields.word}`;
  const hash = createHash("sha256").update(key, "utf8").digest("hex");
  return {
    hash,
    source: `${record.file}:${record.index}`,
    file: record.file,
    index: record.index,
    ...fields
  };
}).sort((a, b) => a.hash.localeCompare(b.hash));

const selected = new Map();
const add = (record) => selected.set(record.source, record);
for (const file of [...new Set(rows.map((record) => record.file))].sort()) {
  add(ranked.find((record) => record.file === file));
}
for (const pos of [...new Set(ranked.map((record) => record.pos))].sort()) {
  add(ranked.find((record) => record.pos === pos));
}
for (const level of ["A1", "A2", "B1", "B2", "C1"]) {
  add(ranked.find((record) => record.level === level));
}
for (const record of ranked) {
  if (selected.size >= TARGET) break;
  add(record);
}

const records = [...selected.values()].sort((a, b) => a.hash.localeCompare(b.hash));
if (records.length !== TARGET) throw new Error(`Expected ${TARGET} selected rows, got ${records.length}`);

const report = {
  methodology: "SHA-256 rank of file:index:word; one seed row per core file, POS, and CEFR level, then fill by rank to 500 raw curated rows.",
  target: TARGET,
  selected: records.length,
  sourceRowsAvailable: rows.length,
  files: [...new Set(records.map((record) => record.file))].sort(),
  posCounts: Object.fromEntries(Object.entries(Object.groupBy(records, (record) => record.pos)).map(([key, value]) => [key, value.length]).sort()),
  levelCounts: Object.fromEntries(Object.entries(Object.groupBy(records, (record) => record.level)).map(([key, value]) => [key, value.length]).sort()),
  records
};

writeFileSync(join(ROOT, "reports", "manual-sample-500.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ selected: report.selected, sourceRowsAvailable: report.sourceRowsAvailable, files: report.files.length, posCounts: report.posCounts, levelCounts: report.levelCounts }, null, 2));
