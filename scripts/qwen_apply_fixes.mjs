// Qwen Task 007: applies authored corrections from reports/qwen-review-fixes.json
// to data/words_core_*.js source rows. Usage:
//   node scripts/qwen_apply_fixes.mjs --file words_core_2.js [--range 150-299] [--delete]
// Only entries whose (file, index) fall inside the given post-edit range are applied,
// so each batch commit carries exactly its own corrections. --delete applies the
// file's declared row deletions (done before range application so indices line up).
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, parseWordCoreFile } from "./lexical_data.mjs";

const args = process.argv.slice(2);
const getFile = () => args[args.indexOf("--file") + 1];
const getRange = () => {
  const i = args.indexOf("--range");
  if (i < 0) return null;
  const [a, b] = args[i + 1].split("-").map(Number);
  return [a, b];
};
const doDelete = args.includes("--delete");
const file = getFile();
if (!file) {
  console.error("Usage: node scripts/qwen_apply_fixes.mjs --file words_core_N.js [--range a-b] [--delete]");
  process.exit(1);
}
const fixes = JSON.parse(readFileSync(join(ROOT, "reports", "qwen-review-fixes.json"), "utf8"));
const path = join(ROOT, "data", file);
const source = readFileSync(path, "utf8");
const lines = source.split("\n");

// ---- locate WORDS entry lines (single-line tuples only)
const entryLines = [];
for (let i = 0; i < lines.length; i++) {
  if (/^\s*[NVADOP]\(/.test(lines[i])) entryLines.push(i);
}
const parsed = parseWordCoreFile(ROOT, file);
if (parsed.length !== entryLines.length) {
  throw new Error(`Row parse mismatch in ${file}: ${parsed.length} rows vs ${entryLines.length} entry lines`);
}

function tokenizeArgs(text) {
  // text is the content between the outer parens of N(...)/O(...)
  const out = [];
  let cur = "", inStr = false, esc = false;
  for (const ch of text) {
    if (inStr) {
      if (esc) { cur += ch; esc = false; continue; }
      if (ch === "\\") { cur += ch; esc = true; continue; }
      if (ch === '"') { out.push(JSON.parse(`"${cur}"`)); cur = ""; inStr = false; continue; }
      cur += ch;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
  }
  return out;
}
function parseEntryLine(line) {
  const m = line.match(/^(\s*)([NVADOP])\((.*)\),?\s*$/);
  if (!m) throw new Error(`Unparseable entry line: ${line}`);
  return { indent: m[1], helper: m[2], values: tokenizeArgs(m[3]), trailingComma: /,\s*$/.test(line) };
}
function serialize(entry) {
  const enc = (v) => JSON.stringify(v);
  return `${entry.indent}${entry.helper}(${entry.values.map(enc).join(",")}),`;
}
// argument positions per helper
// N(w,a,l,m,c,s,p) V/A/D(w,l,m,c,p) O(w,p,l,m,c,s) P(w,l,m,c,s)
const MEANING_ARG = { N: 3, V: 2, A: 2, D: 2, O: 3, P: 2 };
const ARTICLE_ARG = { N: 1 };
const META_ARG = { N: 6, V: 4, A: 4, D: 4 };
const SYN_ARG = { N: 5, O: 5, V: null, A: 4, D: 4, P: 4 }; // A/D/P store synonyms in the trailing slot

const entries = entryLines.map((li) => ({ lineIndex: li, entry: parseEntryLine(lines[li]) }));

// Manifest indexes identify the pre-edit source rows.  Keep the mapping
// explicit when a deletion is applied in the same invocation; otherwise every
// later operation in that file would address the row immediately after its
// intended target.
const manifestDeletions = fixes.deletedRows
  .filter((d) => d.file === file)
  .map((d) => d.preEditIndex)
  .sort((a, b) => a - b);
const postDeleteIndex = (preEditIndex) =>
  preEditIndex - manifestDeletions.filter((i) => i < preEditIndex).length;

// sanity: current words at indices
const wordAt = (idx) => entries[idx].entry.values[0];

const log = [];

// ---- deletions first (pre-edit indices)
if (doDelete) {
  for (const del of fixes.deletedRows.filter((d) => d.file === file).sort((a, b) => b.preEditIndex - a.preEditIndex)) {
    const row = entries[del.preEditIndex];
    if (!row) throw new Error(`Deletion index out of range at ${file}:${del.preEditIndex}`);
    const { entry } = row;
    if (entry.values[0] !== del.word) {
      if (!entries.some((e) => e.entry.values[0] === del.word)) {
        log.push(`SKIP (already deleted) ${file} '${del.word}'`);
        continue;
      }
      throw new Error(`Deletion mismatch at ${file}:${del.preEditIndex}: found '${entry.values[0]}', expected '${del.word}'`);
    }
    lines[row.lineIndex] = null;
    console.error(`DEBUG-DELETE: set lines[${row.lineIndex}]=null; check=${lines[row.lineIndex] === null}`);
    log.push(`DELETED ${file}:${del.preEditIndex} '${del.word}' — ${del.reason}`);
  }
  // rebuild entries array after deletions
  for (let i = entries.length - 1; i >= 0; i--) {
    if (lines[entries[i].lineIndex] === null) entries.splice(i, 1);
  }
  console.error(`DEBUG-REBUILD: entries=${entries.length} nulls=${lines.filter((l) => l === null).length}`);
}

// ---- range-bound corrections
const range = getRange();
const inRange = (idx) => !range || (idx >= range[0] && idx <= range[1]);

for (const fix of fixes.appliedFixes.filter((f) => f.file === file)) {
  if (!inRange(fix.index)) continue;
  const currentIndex = doDelete ? postDeleteIndex(fix.index) : fix.index;
  const row = entries[currentIndex];
  if (!row) throw new Error(`Fix index out of range at ${file}:${fix.index} (mapped ${currentIndex})`);
  const { entry } = row;
  const vals = entry.values;
  const fieldOf = (kind) => kind === "word" ? 0 : kind === "meaning" ? MEANING_ARG[entry.helper] : kind === "article" ? ARTICLE_ARG[entry.helper] : META_ARG[entry.helper];
  const a = fieldOf(fix.kind);
  if (vals[a] === fix.to) {
    log.push(`SKIP (already applied) ${file}:${fix.index} '${wordAt(fix.index)}' ${fix.kind}`);
    continue;
  }
  if (vals[a] !== fix.from) throw new Error(`${fix.kind} fix mismatch at ${file}:${fix.index}: '${vals[a]}' != '${fix.from}'`);
  vals[a] = fix.to;
  lines[row.lineIndex] = serialize(entry);
  log.push(`FIXED ${file}:${fix.index} '${wordAt(fix.index)}' ${fix.kind}: '${fix.from}' -> '${fix.to}'`);
}

for (const rem of fixes.removedSynonyms.filter((r) => r.file === file)) {
  if (!inRange(rem.index)) continue;
  const currentIndex = doDelete ? postDeleteIndex(rem.index) : rem.index;
  const row = entries[currentIndex];
  if (!row) throw new Error(`Synonym index out of range at ${file}:${rem.index} (mapped ${currentIndex})`);
  const { entry } = row;
  const a = SYN_ARG[entry.helper];
  if (a === null || a === undefined) throw new Error(`No synonym slot for ${entry.helper} at ${file}:${rem.index}`);
  const current = String(entry.values[a] ?? "");
  const parts = current.split(";").map((s) => s.trim()).filter(Boolean);
  if (!parts.includes(rem.synonym)) {
    log.push(`SKIP (already applied) ${file}:${rem.index} '${wordAt(rem.index)}': '${rem.synonym}' already absent`);
    continue;
  }
  const next = parts.filter((p) => p !== rem.synonym);
  entry.values[a] = next.join("; ");
  lines[row.lineIndex] = serialize(entry);
  log.push(`SYNONYM-REMOVED ${file}:${rem.index} '${wordAt(rem.index)}': dropped '${rem.synonym}' — ${rem.reason}`);
}

console.log(`Applying ${log.length} operation(s) to ${file}:`);
for (const l of log) console.log("  " + l);
const nullCount = lines.filter((l) => l === null).length;
console.log(`DEBUG: entries=${entries.length} nullLines=${nullCount} totalLines=${lines.length} writePath=${path}`);
writeFileSync(path, lines.filter((l) => l !== null).join("\n"));

// ---- verify the file still parses and rows shifted as expected
const reparsed = parseWordCoreFile(ROOT, file);
const expectedRows = parsed.length - (doDelete ? fixes.deletedRows.filter((d) => d.file === file).length : 0);
console.log(`DEBUG: reparsed=${reparsed.length} expected=${expectedRows}`);
if (reparsed.length !== expectedRows) throw new Error(`Post-edit row count ${reparsed.length} != expected ${expectedRows}`);
