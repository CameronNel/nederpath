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

const legacyWordsSource = execFileSync(
  "git",
  ["show", `${LEGACY_HEAD}:data/words.js`],
  { cwd: ROOT, encoding: "utf8", maxBuffer: 100 * 1024 * 1024 }
);
const legacyWords = new Function("globalThis", `${legacyWordsSource}\nreturn globalThis.NP_WORDS;`)({});
if (!Array.isArray(legacyWords)) throw new Error(`Could not parse ${LEGACY_HEAD}:data/words.js`);
const legacyByNorm = new Map(legacyWords.map((word) => [normalizeLexicalForm(word.word), word]));

const migrated = {};
for (const [norm, legacySelector] of Object.entries(legacyPolicy.primary)) {
  const split = legacySelector.lastIndexOf(":");
  if (split < 0) throw new Error(`Legacy selector has no row index: ${legacySelector}`);
  const file = legacySelector.slice(0, split);
  const generatedOwner = legacyByNorm.get(norm);
  if (!generatedOwner?.curated) throw new Error(`No historical generated owner for policy form '${norm}'`);

  const currentGroup = currentRows.filter((record) => normalizeLexicalForm(record.row[0]) === norm);
  if (!currentGroup.length) throw new Error(`No current source group for policy form '${norm}'`);
  const sourceSenseCandidates = (generatedOwner.senses || []).filter((sense) =>
    typeof sense.source === "string" && sense.source.startsWith(`${file}:`) && sense.pos === generatedOwner.pos
  );
  const historicalSense = sourceSenseCandidates.length === 1 ? sourceSenseCandidates[0] : null;

  const trySelector = (selector) => currentGroup.filter((record) =>
    record.file === selector.file &&
    (selector.pos === undefined || record.row[1] === selector.pos) &&
    (selector.category === undefined || record.row[5] === selector.category) &&
    (selector.meaning === undefined || record.row[4] === selector.meaning)
  );

  const selector = { file, pos: generatedOwner.pos };
  let matches = trySelector(selector);
  if (matches.length !== 1) {
    selector.category = historicalSense?.category ?? generatedOwner.category;
    matches = trySelector(selector);
  }
  if (matches.length !== 1 && historicalSense?.meaning) {
    selector.meaning = historicalSense.meaning;
    matches = trySelector(selector);
  }
  if (matches.length !== 1) {
    const detail = currentGroup.map((record) => `${record.file}:${record.index} ${record.row[1]} ${record.row[5]} ${record.row[4]}`).join(" | ");
    throw new Error(`Could not migrate '${norm}' from ${legacySelector}; historical generated owner=${generatedOwner.pos}/${generatedOwner.category}; candidates: ${detail}`);
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
