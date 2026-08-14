// One-shot migration utility for replacing fragile file:index lexical merge
// selectors with semantic selectors that survive harmless source-row shifts.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadCuratedRows, normalizeLexicalForm } from "./lexical_data.mjs";

const LEGACY_HEAD = "80f757a32a13016e5953cfa7c1006c23c53c8939";
const policyPath = join(ROOT, "data", "lexical_merge_policy.json");
const legacyPolicy = JSON.parse(execFileSync(
  "git",
  ["show", `${LEGACY_HEAD}:data/lexical_merge_policy.json`],
  { cwd: ROOT, encoding: "utf8" }
));
const currentPolicy = JSON.parse(readFileSync(policyPath, "utf8"));
const { rows: currentRows } = loadCuratedRows(ROOT);

function parseHistoricalCore(file) {
  const source = execFileSync("git", ["show", `${LEGACY_HEAD}:data/${file}`], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024
  });
  const moduleValue = { exports: {} };
  const exported = new Function("module", "exports", `${source}\nreturn module.exports;`)(moduleValue, moduleValue.exports);
  if (!Array.isArray(exported?.WORDS)) throw new Error(`Historical ${file} did not expose WORDS`);
  return exported.WORDS;
}

const historicalCache = new Map();
const getHistoricalRows = (file) => {
  if (!historicalCache.has(file)) historicalCache.set(file, parseHistoricalCore(file));
  return historicalCache.get(file);
};

const migrated = {};
for (const [norm, legacySelector] of Object.entries(legacyPolicy.primary)) {
  const split = legacySelector.lastIndexOf(":");
  if (split < 0) throw new Error(`Legacy selector has no row index: ${legacySelector}`);
  const file = legacySelector.slice(0, split);
  const index = Number(legacySelector.slice(split + 1));
  const oldRow = getHistoricalRows(file)[index];
  if (!oldRow) throw new Error(`Historical selector no longer resolves in ${LEGACY_HEAD}: ${legacySelector}`);
  if (normalizeLexicalForm(oldRow[0]) !== norm) {
    throw new Error(`Historical selector mismatch: ${norm} -> ${legacySelector} resolved '${oldRow[0]}'`);
  }

  const currentGroup = currentRows.filter((record) => normalizeLexicalForm(record.row[0]) === norm);
  const trySelector = (selector) => currentGroup.filter((record) =>
    record.file === selector.file &&
    (selector.pos === undefined || record.row[1] === selector.pos) &&
    (selector.category === undefined || record.row[5] === selector.category) &&
    (selector.meaning === undefined || record.row[4] === selector.meaning)
  );

  const selector = { file, pos: oldRow[1] };
  let matches = trySelector(selector);
  if (matches.length !== 1) {
    selector.category = oldRow[5];
    matches = trySelector(selector);
  }
  if (matches.length !== 1) {
    selector.meaning = oldRow[4];
    matches = trySelector(selector);
  }
  if (matches.length !== 1) {
    const detail = currentGroup.map((record) => `${record.file}:${record.index} ${record.row[1]} ${record.row[5]} ${record.row[4]}`).join(" | ");
    throw new Error(`Could not migrate '${norm}' from ${legacySelector}; candidates: ${detail}`);
  }
  migrated[norm] = selector;
}

const result = {
  version: 1,
  description: "Explicit source-row merge policy. Repeated normalized forms remain auditable as source senses but have one generated lexical owner. Primary overrides use semantic source selectors that must resolve to exactly one row; article overrides are limited to reviewed noun conflicts.",
  primary: migrated,
  article: currentPolicy.article
};
writeFileSync(policyPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Migrated ${Object.keys(migrated).length} lexical primary selectors to stable semantic selectors.`);
for (const [norm, selector] of Object.entries(migrated)) console.log(`${norm}: ${JSON.stringify(selector)}`);
