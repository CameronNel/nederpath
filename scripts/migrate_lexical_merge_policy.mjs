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

const historicalCoreCache = new Map();
function historicalCore(file) {
  if (historicalCoreCache.has(file)) return historicalCoreCache.get(file);
  const source = execFileSync("git", ["show", `${LEGACY_HEAD}:data/${file}`], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024
  });
  const moduleValue = { exports: {} };
  const exported = new Function("module", "exports", `${source}\nreturn module.exports;`)(moduleValue, moduleValue.exports);
  if (!Array.isArray(exported?.WORDS)) throw new Error(`Could not parse ${LEGACY_HEAD}:data/${file}`);
  historicalCoreCache.set(file, exported.WORDS);
  return exported.WORDS;
}

const migrated = {};
for (const [norm, legacySelector] of Object.entries(legacyPolicy.primary)) {
  const split = legacySelector.lastIndexOf(":");
  if (split < 0) throw new Error(`Legacy selector has no row index: ${legacySelector}`);
  const file = legacySelector.slice(0, split);
  const legacyIndex = Number(legacySelector.slice(split + 1));
  const currentGroup = currentRows.filter((record) => normalizeLexicalForm(record.row[0]) === norm);
  if (!currentGroup.length) throw new Error(`No current source group for policy form '${norm}'`);

  // First recover the intended row from the chosen source file. If row shifts
  // left exactly one matching form there, that is the strongest stable signal.
  let targetCandidates = currentGroup.filter((record) => record.file === file);
  let target = targetCandidates.length === 1 ? targetCandidates[0] : null;

  // When that file itself has multiple homographs (e.g. haar/zijn), use the
  // historical row only if the legacy index actually pointed at the claimed
  // lexical form. This also exposes stale indexes instead of trusting them.
  if (!target) {
    const oldRow = historicalCore(file)[legacyIndex];
    if (oldRow && normalizeLexicalForm(oldRow[0]) === norm) {
      targetCandidates = targetCandidates.filter((record) => record.row[1] === oldRow[1]);
      if (targetCandidates.length !== 1) targetCandidates = targetCandidates.filter((record) => record.row[5] === oldRow[5]);
      if (targetCandidates.length !== 1) targetCandidates = targetCandidates.filter((record) => record.row[4] === oldRow[4]);
      if (targetCandidates.length === 1) target = targetCandidates[0];
    }
  }

  if (!target) {
    const detail = currentGroup.map((record) => `${record.file}:${record.index} ${record.row[1]} ${record.row[5]} ${record.row[4]}`).join(" | ");
    throw new Error(`Could not recover intended row for '${norm}' from stale selector ${legacySelector}; candidates: ${detail}`);
  }

  const trySelector = (selector) => currentGroup.filter((record) =>
    record.file === selector.file &&
    (selector.pos === undefined || record.row[1] === selector.pos) &&
    (selector.category === undefined || record.row[5] === selector.category) &&
    (selector.meaning === undefined || record.row[4] === selector.meaning)
  );
  const selector = { file: target.file, pos: target.row[1] };
  let matches = trySelector(selector);
  if (matches.length !== 1) {
    selector.category = target.row[5];
    matches = trySelector(selector);
  }
  if (matches.length !== 1) {
    selector.meaning = target.row[4];
    matches = trySelector(selector);
  }
  if (matches.length !== 1) throw new Error(`Semantic selector remained ambiguous for '${norm}'`);
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
