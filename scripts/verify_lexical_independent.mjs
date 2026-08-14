// Fresh, independent lexical verification path used for Verification Pass 2.
// It deliberately does not import metricReport() or the lexical test module.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT, ALLOWED_LEVELS, ALLOWED_POS, loadCanonicalRows, loadCuratedRows,
  loadGeneratedWords, normalizeLexicalForm, parseAdjectiveMeta, parseNounMeta,
  parseVerbMeta, sourceFields
} from "./lexical_data.mjs";
import { createIdAllocator, validateRegistry } from "./id_allocator.mjs";

const fail = [];
const check = (condition, message) => { if (!condition) fail.push(message); };
const countBy = (items, selector) => Object.fromEntries(
  [...items.reduce((map, item) => {
    const key = selector(item);
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map())].sort((a, b) => a[0].localeCompare(b[0]))
);

const { files, rows: rawRows } = loadCuratedRows(ROOT);
const canonicalRows = loadCanonicalRows(ROOT).rows;
const generated = loadGeneratedWords(ROOT);
const registry = JSON.parse(readFileSync(join(ROOT, "data", "word_ids.json"), "utf8"));
const validated = validateRegistry(registry);
const sourceByNorm = new Map();
const duplicateGroups = new Map();
const sourceIssues = [];
const explicit = [];

for (const record of rawRows) {
  const fields = sourceFields(record);
  const location = `${record.file}:${record.index}`;
  const norm = normalizeLexicalForm(fields.word);
  sourceByNorm.set(norm, (sourceByNorm.get(norm) || 0) + 1);
  if (!duplicateGroups.has(norm)) duplicateGroups.set(norm, []);
  duplicateGroups.get(norm).push(record);
  check(Array.isArray(record.row) && record.row.length === 8, `${location}: row shape`);
  check(ALLOWED_POS.has(fields.pos), `${location}: unsupported POS`);
  check(ALLOWED_LEVELS.has(fields.level), `${location}: unsupported level`);
  check(Boolean(fields.word && fields.meaning && fields.category), `${location}: missing lexical text`);
  check(!/[\u0000-\u001f\u007f]/u.test(fields.word), `${location}: control character in Dutch form`);
  check(!/\b(?:dup guard|placeholder|dummy|generated row|test word)\b/i.test(fields.meaning), `${location}: padding gloss`);
  check(!/\b(?:plural of|past participle of|comparative of|superlative of|present-tense)\b/i.test(fields.meaning), `${location}: morphology masquerading as meaning`);
  check(fields.pos === "noun" ? ["de", "het"].includes(fields.article) || (fields.article === "" && fields.category === "proper-name") : !fields.article, `${location}: article invariant`);
  check(fields.pos !== "verb" || !fields.word.includes(" "), `${location}: multiword verb`);
  check(fields.pos !== "phrase" || fields.word.includes(" "), `${location}: single-word phrase`);
  try {
    if (fields.pos === "noun") {
      const forms = parseNounMeta(fields.word, fields.meta);
      for (const [word, kind] of [[forms.plural, "plural"], [forms.diminutive, "diminutive"], [forms.diminutivePlural, "diminutive-plural"]].filter(([word]) => word)) explicit.push({ record, fields, word, kind });
    }
    if (fields.pos === "verb") for (const form of parseVerbMeta(fields.meta).forms) explicit.push({ record, fields, word: form.word, kind: form.kind });
    if (fields.pos === "adjective") for (const form of parseAdjectiveMeta(fields.meta).forms) explicit.push({ record, fields, word: form.word, kind: form.kind });
    if (!["noun", "verb", "adjective", "adverb"].includes(fields.pos)) check(!fields.meta, `${location}: unsupported metadata`);
  } catch (error) {
    sourceIssues.push({ location, message: error.message });
  }
}

const duplicateList = [...duplicateGroups].filter(([, group]) => group.length > 1);
for (const [norm, group] of duplicateList) {
  const canonical = canonicalRows.find((record) => normalizeLexicalForm(record.row[0]) === norm);
  check(canonical && canonical.senses?.length === group.length, `${norm}: duplicate sense model lost a source row`);
}

const generatedByNorm = new Map();
const generatedById = new Map();
const generatedByKey = new Set();
for (const word of generated) {
  const norm = normalizeLexicalForm(word.word);
  if (!generatedByNorm.has(norm)) generatedByNorm.set(norm, []);
  generatedByNorm.get(norm).push(word);
  if (!generatedById.has(word.id)) generatedById.set(word.id, []);
  generatedById.get(word.id).push(norm);
  generatedByKey.add(`${norm}|${word.lemma}|${word.pos}|${word.inflectionType}`);
  check(validated.entries.get(norm) === word.id, `${word.word}: registry owner mismatch`);
  check(validated.owners.get(word.id) === norm, `${word.id}: reverse registry owner mismatch`);
  check(!word.learnable || word.curated, `${word.word}: uncurated learner card`);
  check(word.frequency === null && word.example === null && word.exampleEn === null, `${word.word}: unsupported fabricated learner data`);
  if (word.inflectionType === "plural" || word.inflectionType === "diminutive-plural") check(word.article === "de", `${word.word}: plural article`);
  if (word.inflectionType === "diminutive") check(word.article === "het", `${word.word}: diminutive article`);
  for (const collision of word.shadowedForms || []) check(collision.representedBy && collision.lemma && collision.pos && collision.inflectionType, `${word.word}: malformed shadow metadata`);
}

for (const item of explicit) {
  const norm = normalizeLexicalForm(item.word);
  const base = generated.find((word) => normalizeLexicalForm(word.word) === normalizeLexicalForm(item.fields.word));
  const key = `${norm}|${item.fields.word}|${item.fields.pos}|${item.kind}`;
  const shadowed = (base?.shadowedForms || []).some((candidate) => `${normalizeLexicalForm(candidate.word)}|${candidate.lemma}|${candidate.pos}|${candidate.inflectionType}` === key);
  check(generatedByKey.has(key) || shadowed, `${item.record.file}:${item.record.index}: explicit ${item.word} not retained`);
}

// Stable compatibility check against the fetched starting master artifact.
let baselineWords = [];
try {
  const baselineSource = execFileSync("git", ["show", "origin/master:data/words.js"], { cwd: ROOT, encoding: "utf8", maxBuffer: 80 * 1024 * 1024 });
  baselineWords = new Function("globalThis", `${baselineSource}\nreturn globalThis.NP_WORDS;`)({});
} catch (error) {
  fail.push(`could not read origin/master:data/words.js: ${error.message}`);
}
for (const oldWord of baselineWords) {
  check(validated.entries.get(normalizeLexicalForm(oldWord.word)) === oldWord.id, `${oldWord.word}: historical ID drift`);
}

// Hostile registry and normalization probes.
const synthetic = validateRegistry({ version: 1, highWaterMark: 3, entries: { alpha: "nl-00001", retired: "nl-00003" } });
const allocator = createIdAllocator(synthetic);
check(allocator.assignId(" ALPHA ") === "nl-00001", "normalized ownership failed");
check(allocator.assignId("beta") === "nl-00004", "new ID allocation failed");
check(allocator.ownerOf("nl-00003") === "retired", "retired ID was recycled");
check(normalizeLexicalForm("e\u0301") === normalizeLexicalForm("é"), "composed/decomposed Unicode normalization failed");
check(normalizeLexicalForm(" Ｂｅｔａ  ") === "beta", "compatibility normalization failed");

const articleFailures = generated.filter((word) => word.pos === "noun" && (
  (word.inflectionType === "diminutive" && word.article !== "het") ||
  ((word.inflectionType === "plural" || word.inflectionType === "diminutive-plural") && word.article !== "de")
));
const mixedPosGroups = duplicateList.filter(([, group]) => new Set(group.map((record) => record.row[1])).size > 1);
const current = {
  files: files.length,
  rawSourceRows: rawRows.length,
  uniqueSourceForms: sourceByNorm.size,
  canonicalForms: canonicalRows.length,
  generatedRows: generated.length,
  learnableRows: generated.filter((word) => word.learnable).length,
  derivedRows: generated.filter((word) => !word.learnable).length,
  sourcePos: countBy(rawRows, (record) => record.row[1]),
  sourceLevels: countBy(rawRows, (record) => record.row[2]),
  generatedPos: countBy(generated, (word) => word.pos),
  generatedLevels: countBy(generated, (word) => word.level),
  duplicateSourceGroups: duplicateList.length,
  mixedPosDuplicateGroups: mixedPosGroups.length,
  generatedDuplicateForms: [...generatedByNorm.values()].filter((group) => group.length > 1).length,
  generatedDuplicateIds: [...generatedById.values()].filter((group) => group.length > 1).length,
  explicitFormsChecked: explicit.length,
  articleFailures: articleFailures.length,
  properNameRows: rawRows.filter((record) => sourceFields(record).category === "proper-name").length,
  multiwordNounRows: rawRows.filter((record) => sourceFields(record).pos === "noun" && sourceFields(record).word.includes(" ")).length,
  phraseRows: rawRows.filter((record) => sourceFields(record).pos === "phrase").length,
  baselineRows: baselineWords.length,
  baselineIdDrift: fail.filter((message) => message.includes("historical ID drift")).length,
  registryHighWaterMark: registry.highWaterMark,
  registryEntries: Object.keys(registry.entries).length,
  sourceIssues,
  failures: fail
};

mkdirSync(join(ROOT, "reports"), { recursive: true });
writeFileSync(join(ROOT, "reports", "verification-pass-2.json"), `${JSON.stringify(current, null, 2)}\n`);
console.log(JSON.stringify(current, null, 2));
if (fail.length || sourceIssues.length || articleFailures.length || current.generatedDuplicateForms || current.generatedDuplicateIds) process.exitCode = 1;
