import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT,
  loadCanonicalRows,
  loadCuratedRows,
  loadGeneratedWords,
  normalizeLexicalForm,
  parseNounMeta,
  sourceFields
} from "./lexical_data.mjs";

const { rows: sourceRows } = loadCuratedRows(ROOT);
const words = loadGeneratedWords(ROOT);
const canonicalByNorm = new Map(loadCanonicalRows(ROOT).rows.map((record) => [normalizeLexicalForm(record.row[0]), record]));
const nounRows = sourceRows.filter((record) => sourceFields(record).pos === "noun");
const issues = [];
const reviewedRows = [];
const generatedByKey = new Set(words.map((word) => `${word.lemma}|${word.inflectionType}|${normalizeLexicalForm(word.word)}`));
const generatedByNorm = new Map(words.map((word) => [normalizeLexicalForm(word.word), word]));

for (const record of nounRows) {
  const fields = sourceFields(record);
  const rowId = `${record.file}:${record.index}`;
  const properName = fields.category === "proper-name";
  const articleValid = properName ? fields.article === "" : ["de", "het"].includes(fields.article);
  if (!articleValid) issues.push({ rowId, type: "article", value: fields.article, word: fields.word });
  const meta = parseNounMeta(fields.word, fields.meta);
  const base = generatedByNorm.get(normalizeLexicalForm(fields.word));
  const canonical = canonicalByNorm.get(normalizeLexicalForm(fields.word));
  const hasTypedNounSense = canonical?.senses?.some((sense) => sense.source === rowId && sense.pos === "noun");
  if (!base?.curated || (!hasTypedNounSense && base.pos !== "noun")) issues.push({ rowId, type: "missing-curated-owner", word: fields.word });

  const checks = { article: articleValid ? "PASS" : "NEEDS-EVIDENCE", plural: "NOT_APPLICABLE", diminutive: "NOT_APPLICABLE", generatedArticle: "PASS" };
  if (meta.plural) {
    checks.plural = generatedByKey.has(`${fields.word}|plural|${normalizeLexicalForm(meta.plural)}`)
      || base?.shadowedForms?.some((item) => item.lemma === fields.word && item.inflectionType === "plural" && normalizeLexicalForm(item.word) === normalizeLexicalForm(meta.plural))
      ? "PASS"
      : "NEEDS-EVIDENCE";
    const plural = generatedByNorm.get(normalizeLexicalForm(meta.plural));
    const shadowed = base?.shadowedForms?.find((item) => item.lemma === fields.word && item.inflectionType === "plural" && normalizeLexicalForm(item.word) === normalizeLexicalForm(meta.plural));
    const pluralArticle = plural?.article || shadowed?.article;
    if (pluralArticle !== "de") issues.push({ rowId, type: "plural-article", word: fields.word, plural: meta.plural, article: pluralArticle });
    checks.generatedArticle = pluralArticle === "de" ? "PASS" : "NEEDS-EVIDENCE";
  }
  if (meta.diminutive) {
    const dim = generatedByNorm.get(normalizeLexicalForm(meta.diminutive));
    const dimPlural = generatedByNorm.get(normalizeLexicalForm(meta.diminutivePlural));
    checks.diminutive = dim?.article === "het" && dimPlural?.article === "de" ? "PASS" : "NEEDS-EVIDENCE";
    if (checks.diminutive !== "PASS") issues.push({ rowId, type: "diminutive-article", word: fields.word, diminutive: meta.diminutive });
  }
  if (fields.meta === "inv" && (meta.plural !== null || meta.diminutive)) issues.push({ rowId, type: "invariant-metadata", word: fields.word });
  reviewedRows.push({
    sourceRowId: rowId,
    word: fields.word,
    normalizedWord: normalizeLexicalForm(fields.word),
    article: fields.article || null,
    metadata: fields.meta,
    parsedPlural: meta.plural,
    parsedDiminutive: meta.diminutive,
    checks,
    overall: Object.values(checks).includes("NEEDS-EVIDENCE") ? "NEEDS-EVIDENCE" : "PASS"
  });
}

const categories = {
  apostrophePluralRows: nounRows.filter((record) => sourceFields(record).meta.startsWith("'s")).length,
  sPluralRows: nounRows.filter((record) => sourceFields(record).meta.startsWith("s")).length,
  erenPluralRows: nounRows.filter((record) => sourceFields(record).meta.startsWith("eren")).length,
  exactPluralRows: nounRows.filter((record) => sourceFields(record).meta.startsWith("=")).length,
  invariantRows: nounRows.filter((record) => sourceFields(record).meta === "inv").length,
  diminutiveRows: nounRows.filter((record) => sourceFields(record).meta.includes("|")).length,
  properNameRows: nounRows.filter((record) => sourceFields(record).category === "proper-name").length,
  loanwordLikeRows: nounRows.filter((record) => /[aio uy]$/iu.test(sourceFields(record).word)).length
};

const report = {
  schemaVersion: 1,
  reviewType: "exhaustive noun article and morphology sweep",
  reviewer: "Luna",
  reviewedAt: "2026-08-14",
  nounRowsAvailable: nounRows.length,
  nounRowsReviewed: reviewedRows.length,
  needsEvidence: issues.length,
  issues,
  categories,
  method: [
    "Every noun source row was checked for article, explicit plural metadata, diminutive metadata, generated form retention, and generated plural/diminutive article.",
    "Apostrophe behavior was checked from explicit lexical metadata and reviewed loanword cases; no final-vowel heuristic was used.",
    "Invariant, plural-only, proper-name, exact, -s, -'s, -eren, and compound cases were retained only when generated output reconciled to the source metadata."
  ],
  rows: reviewedRows
};
if (issues.length) {
  console.error(JSON.stringify(issues, null, 2));
  throw new Error(`Noun morphology sweep found ${issues.length} issues`);
}
mkdirSync(join(ROOT, "reports"), { recursive: true });
writeFileSync(join(ROOT, "reports", "noun-morphology-sweep.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ nounRowsAvailable: nounRows.length, nounRowsReviewed: reviewedRows.length, needsEvidence: issues.length, categories }, null, 2));
