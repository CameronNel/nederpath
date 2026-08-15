// Lexical-quality audit. This is intentionally independent from scripts/audit.mjs.
// It reports source-level issues as well as generated-artifact invariants.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT, ALLOWED_LEVELS, ALLOWED_POS, duplicateSourceGroups, loadCanonicalRows, loadCuratedRows,
  loadGeneratedWords, normalizeLexicalForm, parseAdjectiveMeta, parseNounMeta,
  parseVerbMeta, sourceFields
} from "./lexical_data.mjs";
import { validateRegistry, RegistryError } from "./id_allocator.mjs";

const countBy = (items, selector) => {
  const result = {};
  for (const item of items) {
    const key = selector(item);
    result[key] = (result[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(result).sort((a, b) => a[0].localeCompare(b[0])));
};

function glossGroups(rows) {
  const groups = new Map();
  for (const record of rows) {
    const meaning = String(record.row[4]).trim().toLowerCase();
    if (!groups.has(meaning)) groups.set(meaning, []);
    groups.get(meaning).push({ file: record.file, index: record.index, word: record.row[0] });
  }
  return [...groups]
    .filter(([, records]) => records.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([meaning, records]) => ({ meaning, count: records.length, records }));
}

function metricReport() {
  const { files, rows } = loadCuratedRows(ROOT);
  const canonicalRows = loadCanonicalRows(ROOT).rows;
  const generated = loadGeneratedWords(ROOT);
  const duplicateGroups = duplicateSourceGroups(rows);
  const duplicateGenerated = new Map();
  const duplicateIds = new Map();
  for (const word of generated) {
    const norm = normalizeLexicalForm(word.word);
    if (!duplicateGenerated.has(norm)) duplicateGenerated.set(norm, []);
    duplicateGenerated.get(norm).push(word.id);
    if (!duplicateIds.has(word.id)) duplicateIds.set(word.id, []);
    duplicateIds.get(word.id).push(norm);
  }

  const sourceIssues = [];
  for (const record of rows) {
    const { word, pos, level, article, meaning, category, meta } = sourceFields(record);
    if (!Array.isArray(record.row) || record.row.length !== 8) sourceIssues.push({ type: "schema", ...record });
    if (!word || word !== word.trim() || /[\u0000-\u001f\u007f]/u.test(word)) sourceIssues.push({ type: "malformed-word", ...record });
    if (!ALLOWED_POS.has(pos)) sourceIssues.push({ type: "pos", ...record });
    if (!ALLOWED_LEVELS.has(level)) sourceIssues.push({ type: "level", ...record });
    if (!meaning || !category) sourceIssues.push({ type: "missing-text", ...record });
    if (pos === "noun" && !["de", "het"].includes(article) && !(article === "" && category === "proper-name")) sourceIssues.push({ type: "noun-article", ...record });
    if (pos !== "noun" && article) sourceIssues.push({ type: "non-noun-article", ...record });
    if (pos === "verb" && word.includes(" ")) sourceIssues.push({ type: "multiword-verb", ...record });
    if (pos === "phrase" && !word.includes(" ")) sourceIssues.push({ type: "single-word-phrase", ...record });
    if (pos === "noun") {
      try { parseNounMeta(word, meta); } catch (error) { sourceIssues.push({ type: "noun-meta", message: error.message, ...record }); }
    } else if (pos === "verb") {
      try { parseVerbMeta(meta); } catch (error) { sourceIssues.push({ type: "verb-meta", message: error.message, ...record }); }
    } else if (pos === "adjective") {
      try { parseAdjectiveMeta(meta); } catch (error) { sourceIssues.push({ type: "adjective-meta", message: error.message, ...record }); }
    } else if (meta) {
      sourceIssues.push({ type: "unsupported-meta", message: `meta is not supported for ${pos}`, ...record });
    }
    if (/\b(?:plural of|past participle of|comparative of|superlative of|present-tense)\b/i.test(meaning)) {
      sourceIssues.push({ type: "generated-meaning-template", ...record });
    }
  }

  const sourceNorms = new Map();
  for (const record of rows) {
    const norm = normalizeLexicalForm(record.row[0]);
    if (!sourceNorms.has(norm)) sourceNorms.set(norm, record);
  }
  const nounRows = rows.filter((record) => record.row[1] === "noun");
  const generatedNouns = generated.filter((word) => word.pos === "noun" && word.article);
  const registryPath = join(ROOT, "data", "word_ids.json");
  let registry = null;
  let registryError = null;
  try {
    registry = JSON.parse(readFileSync(registryPath, "utf8"));
    validateRegistry(registry);
  } catch (error) {
    registryError = error instanceof RegistryError ? error.message : String(error.message || error);
  }

  const duplicateGlosses = glossGroups(rows);
  const repeatedTemplates = {};
  for (const pattern of [/^to /i, /^the number /i, /^plural of /i, /^past participle of /i, /^present-tense /i, /^comparative of /i, /^superlative of /i]) {
    repeatedTemplates[pattern.source] = rows.filter((record) => pattern.test(String(record.row[4]))).length;
  }

  const sourceFieldRows = rows.map((record) => ({ record, fields: sourceFields(record) }));
  const properNameRows = sourceFieldRows.filter(({ fields }) => fields.category === "proper-name");
  const capitalizedNonProperNames = sourceFieldRows.filter(({ fields }) =>
    /^[A-ZÀ-ÖØ-Þ]/u.test(fields.word) && fields.category !== "proper-name"
  );
  const multiwordRows = sourceFieldRows.filter(({ fields }) => fields.word.includes(" "));
  const pluralLikeInvariantRows = sourceFieldRows.filter(({ fields }) =>
    fields.pos === "noun" && fields.meta === "inv" && /(?:en|s|eren|jes)$/u.test(fields.word)
  );
  const shadowedExplicitForms = generated.reduce((sum, word) => sum + (word.shadowedForms?.length || 0), 0);

  return {
    generatedRows: generated.length,
    curatedSourceRows: rows.length,
    uniqueCuratedSourceForms: sourceNorms.size,
    learnableRows: generated.filter((word) => word.learnable).length,
    derivedReferenceRows: generated.filter((word) => !word.learnable).length,
    curatedGeneratedRows: generated.filter((word) => word.curated).length,
    sourceFiles: files,
    sourcePos: countBy(rows, (record) => record.row[1]),
    generatedPos: countBy(generated, (word) => word.pos),
    sourceCefr: countBy(rows, (record) => record.row[2]),
    generatedCefr: countBy(generated, (word) => word.level),
    sourceNounArticles: countBy(nounRows, (record) => record.row[3]),
    generatedNounArticles: countBy(generatedNouns, (word) => word.article),
    sourceSynonymRows: rows.filter((record) => record.row[6] && (Array.isArray(record.row[6]) ? record.row[6].length : String(record.row[6]).trim())).length,
    sourceExplicitNounMeta: nounRows.filter((record) => String(record.row[7] ?? "").trim()).length,
    sourceExplicitVerbMeta: rows.filter((record) => record.row[1] === "verb" && String(record.row[7] ?? "").trim()).length,
    sourceExplicitAdjectiveMeta: rows.filter((record) => record.row[1] === "adjective" && String(record.row[7] ?? "").trim()).length,
    duplicateSourceGroups: duplicateGroups.size,
    duplicateSourceOccurrences: [...duplicateGroups.values()].reduce((sum, records) => sum + records.length - 1, 0),
    mergeDecisionCoverage: {
      rawDuplicateGroups: duplicateGroups.size,
      canonicalForms: canonicalRows.length,
      unmodeledGroups: [...duplicateGroups.keys()].filter((norm) => !canonicalRows.some((record) => normalizeLexicalForm(record.row[0]) === norm)).length
    },
    duplicateGeneratedForms: [...duplicateGenerated.values()].filter((ids) => ids.length > 1).length,
    duplicateGeneratedIds: [...duplicateIds.values()].filter((norms) => norms.length > 1).length,
    duplicateEnglishGlosses: duplicateGlosses,
    repeatedGlossTemplates: repeatedTemplates,
    properNameRows: properNameRows.length,
    capitalizedNonProperNameRows: capitalizedNonProperNames.length,
    multiwordRows: countBy(multiwordRows, ({ fields }) => fields.pos),
    pluralLikeInvariantRows: pluralLikeInvariantRows.length,
    shadowedExplicitForms,
    sourceIssues,
    registry: registry ? { highWaterMark: registry.highWaterMark, entries: Object.keys(registry.entries).length, error: null } : { error: registryError },
    articleInvariantFailures: generated.filter((word) => word.pos === "noun" && ((word.inflectionType === "diminutive" && word.article !== "het") || ((word.inflectionType === "plural" || word.inflectionType === "diminutive-plural") && word.article !== "de"))),
    generatedSourceCollisionCount: [...sourceNorms.keys()].filter((norm) => !generated.some((word) => normalizeLexicalForm(word.word) === norm && word.curated)).length
  };
}

const report = metricReport();
const writeIndex = process.argv.indexOf("--write");
if (writeIndex >= 0 && process.argv[writeIndex + 1]) {
  const target = join(ROOT, process.argv[writeIndex + 1]);
  writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`);
}
console.log(JSON.stringify(report, null, 2));

if (process.argv.includes("--strict")) {
  const failures = [];
  if (report.sourceIssues.length) failures.push(`${report.sourceIssues.length} source issues`);
  if (report.mergeDecisionCoverage.unmodeledGroups) failures.push(`${report.mergeDecisionCoverage.unmodeledGroups} unmodeled duplicate source groups`);
  if (report.duplicateGeneratedForms) failures.push(`${report.duplicateGeneratedForms} generated duplicate forms`);
  if (report.duplicateGeneratedIds) failures.push(`${report.duplicateGeneratedIds} generated duplicate IDs`);
  if (report.registry.error) failures.push(`registry: ${report.registry.error}`);
  if (report.articleInvariantFailures.length) failures.push(`${report.articleInvariantFailures.length} article invariant failures`);
  if (failures.length) {
    console.error(`Lexical audit failed: ${failures.join(", ")}`);
    process.exitCode = 1;
  }
}

export { metricReport };
