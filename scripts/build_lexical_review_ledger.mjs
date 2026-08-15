import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT,
  duplicateSourceGroups,
  loadCanonicalRows,
  loadCuratedRows,
  loadGeneratedWords,
  normalizeLexicalForm,
  parseAdjectiveMeta,
  parseNounMeta,
  parseVerbMeta,
  sourceFields
} from "./lexical_data.mjs";

const OUT_DIR = join(ROOT, "reports");
const SOURCE_REFERENCES = {
  spelling: "https://woordenlijst.org/zoek/",
  advice: "https://taaladvies.net/",
  grammar: "https://e-ans.ivdnt.org/",
  semanticContext: "https://gtb.ivdnt.org/search/?owner=wnt",
  cefr: "https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions"
};

function parseRowsFromSource(source) {
  const moduleValue = { exports: {} };
  return new Function("module", "exports", `${source}\nreturn module.exports;`)(moduleValue, moduleValue.exports).WORDS;
}

function loadBaseRows(files) {
  const rows = [];
  for (const file of files) {
    const source = execFileSync("git", ["show", `origin/master:data/${file}`], {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024
    });
    for (const [index, row] of parseRowsFromSource(source).entries()) rows.push({ file, index, row });
  }
  return rows;
}

function rowKey(record) {
  return `${record.file}:${record.index}`;
}

function rowFingerprint(row) {
  return JSON.stringify(row);
}

function changedFields(current, baseline) {
  if (!baseline) return ["new-source-row"];
  const labels = ["headword", "pos", "cefr", "article", "meaning", "category", "synonyms", "morphology"];
  return labels.filter((label, index) => JSON.stringify(current.row[index]) !== JSON.stringify(baseline.row[index]));
}

function nearestBaseline(record, baseRows) {
  const norm = normalizeLexicalForm(record.row[0]);
  const candidates = baseRows.filter((item) =>
    item.file === record.file &&
    normalizeLexicalForm(item.row[0]) === norm &&
    item.row[1] === record.row[1]
  );
  return candidates[0] || null;
}

function checked(valid, passNote, failNote) {
  return { disposition: valid ? "PASS" : "FAIL", note: valid ? passNote : failNote };
}

function present(value, label) {
  return checked(Boolean(value), `${label} is present and structurally parseable.`, `${label} is missing.`);
}

function notApplicable(note = "Not applicable to this part of speech or lexical type.") {
  return { disposition: "NOT_APPLICABLE", note };
}

function hasProperNameCategory(fields) {
  return fields.pos === "noun" && fields.category === "proper-name";
}

function generatedOwner(words, fields) {
  return words.find((word) => normalizeLexicalForm(word.word) === normalizeLexicalForm(fields.word));
}

function generatedInflection(words, lemma, inflectionType, form) {
  return words.find((word) =>
    word.lemma === lemma &&
    word.inflectionType === inflectionType &&
    normalizeLexicalForm(word.word) === normalizeLexicalForm(form)
  );
}

function sourceSnapshot(rows) {
  const stable = rows.map((record) => ({ file: record.file, index: record.index, row: record.row }));
  return createHash("sha256").update(JSON.stringify(stable)).digest("hex");
}

const { files, rows: sourceRows } = loadCuratedRows(ROOT);
const baseRows = loadBaseRows(files);
const baseExact = new Set(baseRows.map((record) => `${record.file}:${rowFingerprint(record.row)}`));
const canonicalRows = loadCanonicalRows(ROOT).rows;
const generatedWords = loadGeneratedWords(ROOT);
const canonicalByNorm = new Map(canonicalRows.map((record) => [normalizeLexicalForm(record.row[0]), record]));
const duplicateGroups = duplicateSourceGroups(sourceRows);

const ledgerRows = sourceRows.map((record) => {
  const fields = sourceFields(record);
  const baseline = nearestBaseline(record, baseRows);
  const changes = baseExact.has(`${record.file}:${rowFingerprint(record.row)}`) ? [] : changedFields(record, baseline);
  const owner = generatedOwner(generatedWords, fields);
  const canonical = canonicalByNorm.get(normalizeLexicalForm(fields.word));
  const duplicate = duplicateGroups.get(normalizeLexicalForm(fields.word)) || [];
  const mixedPos = new Set(duplicate.map((item) => sourceFields(item).pos)).size > 1;

  let nounMeta = null;
  let verbMeta = null;
  let adjectiveMeta = null;
  if (fields.pos === "noun") nounMeta = parseNounMeta(fields.word, fields.meta);
  if (fields.pos === "verb") verbMeta = parseVerbMeta(fields.meta);
  if (fields.pos === "adjective") adjectiveMeta = parseAdjectiveMeta(fields.meta);

  const articleApplicable = fields.pos === "noun";
  const articleValid = !articleApplicable || hasProperNameCategory(fields) || fields.article === "de" || fields.article === "het";
  const ownerValid = Boolean(owner && owner.curated && owner.pos === canonical?.row[1]);
  const morphologyValid = fields.pos === "noun"
    ? Boolean(nounMeta && (nounMeta.plural === null || generatedInflection(generatedWords, fields.word, "plural", nounMeta.plural) || owner?.shadowedForms?.some((item) => item.word === nounMeta.plural)))
    : fields.pos === "verb"
      ? Boolean(verbMeta && verbMeta.forms.every((form) => generatedInflection(generatedWords, fields.word, form.kind, form.word) || owner?.shadowedForms?.some((item) => item.word === form.word)))
      : fields.pos === "adjective"
        ? Boolean(adjectiveMeta && adjectiveMeta.forms.every((form) => generatedInflection(generatedWords, fields.word, form.kind, form.word) || owner?.shadowedForms?.some((item) => item.word === form.word)))
        : true;
  const morphologyMarkerInSynonyms = fields.synonyms.some((synonym) => /^(?:s|inv|n|'s|pl|es|=.+)$/u.test(synonym));

  const fieldReview = {
    headword: present(fields.word, "Headword"),
    pos: present(fields.pos, "POS"),
    cefr: present(fields.level, "CEFR label"),
    article: articleApplicable
      ? checked(articleValid, "Article has an allowed structural value for this noun type.", "Article has an invalid structural value for this noun type.")
      : notApplicable(),
    meaning: present(fields.meaning, "English gloss"),
    category: present(fields.category, "Category"),
    register: { disposition: "UNVERIFIED_SEMANTICALLY", note: "Automation cannot establish whether register/usage labeling is linguistically accurate." },
    synonyms: checked(!morphologyMarkerInSynonyms, "No morphology marker appears in the synonym slot.", "A morphology marker appears in the synonym slot."),
    morphology: checked(morphologyValid, "Explicit morphology reconciles structurally with generated output.", "Explicit morphology does not reconcile with generated output."),
    plural: fields.pos === "noun" && nounMeta?.plural
      ? checked(Boolean(generatedInflection(generatedWords, fields.word, "plural", nounMeta.plural) || owner?.shadowedForms?.some((item) => item.word === nounMeta.plural)), "Explicit plural is retained in generated output.", "Explicit plural is missing from generated output.")
      : notApplicable("No ordinary explicit plural is asserted for this source row."),
    diminutive: fields.pos === "noun" && nounMeta?.diminutive
      ? { disposition: "UNVERIFIED_SEMANTICALLY", note: "Generated-form consistency is checked elsewhere; linguistic correctness still requires lexical evidence." }
      : notApplicable("No diminutive metadata is asserted."),
    verbParadigm: fields.pos === "verb" && verbMeta?.forms.length
      ? { disposition: morphologyValid ? "PASS" : "FAIL", note: morphologyValid ? "Supplied verb forms reconcile structurally with generated output." : "One or more supplied verb forms fail generated-output reconciliation." }
      : notApplicable("No explicit verb paradigm is asserted."),
    separability: fields.pos === "verb"
      ? { disposition: "UNVERIFIED_SEMANTICALLY", note: "Metadata shape can be parsed, but correct Dutch separability requires semantic/lexical review." }
      : notApplicable(),
    adjectiveComparison: fields.pos === "adjective" && adjectiveMeta?.forms.length
      ? { disposition: morphologyValid ? "PASS" : "FAIL", note: morphologyValid ? "Comparison forms reconcile structurally with generated output." : "Comparison forms fail generated-output reconciliation." }
      : notApplicable("No adjective comparison metadata is asserted."),
    phraseClassification: fields.pos === "phrase"
      ? { disposition: "UNVERIFIED_SEMANTICALLY", note: "The row is typed as a phrase; naturalness and lexical value require semantic review." }
      : notApplicable(),
    properName: hasProperNameCategory(fields)
      ? { disposition: "UNVERIFIED_SEMANTICALLY", note: "The structural proper-name treatment is visible; appropriateness requires semantic review." }
      : notApplicable(),
    orthography: { disposition: "UNVERIFIED_SEMANTICALLY", note: "Normalization and generated-form checks cannot prove Dutch orthographic correctness." },
    duplicateHomograph: duplicate.length > 1
      ? { disposition: "UNVERIFIED_SEMANTICALLY", note: mixedPos ? "Mixed-POS isolation is structurally checked; primary-sense choice still requires semantic review." : "Same-POS merge determinism is checked; sense quality still requires semantic review." }
      : notApplicable("No duplicate normalized source spelling."),
    generatedOwnership: checked(ownerValid, "Generated canonical owner and source provenance reconcile.", "Generated owner could not be reconciled.")
  };

  const structuralFailure = Object.values(fieldReview).some((item) => item.disposition === "FAIL");
  return {
    sourceRowId: rowKey(record),
    sourceFile: record.file,
    sourceIndex: record.index,
    normalizedWord: normalizeLexicalForm(fields.word),
    word: fields.word,
    pos: fields.pos,
    cefr: fields.level,
    article: fields.article || null,
    meaning: fields.meaning,
    category: fields.category,
    synonyms: fields.synonyms,
    morphologyMetadata: fields.meta,
    duplicateGroupSize: duplicate.length || 1,
    mixedPosDuplicate: mixedPos,
    canonicalPrimaryPos: canonical?.row[1] || null,
    baselineComparison: changes.length
      ? { disposition: "CHANGED_FROM_BASE", changedFields: changes }
      : { disposition: "UNCHANGED", changedFields: [] },
    fieldReview,
    structuralStatus: structuralFailure ? "FAIL" : "PASS",
    semanticReview: {
      disposition: "NEEDS-EVIDENCE",
      note: "No row-specific independent semantic/linguistic review evidence is encoded for this row. Automated consistency checks are not a substitute."
    },
    overall: "NEEDS-EVIDENCE"
  };
});

const structuralFailures = ledgerRows.filter((row) => row.structuralStatus === "FAIL");
if (ledgerRows.length !== sourceRows.length) throw new Error(`Ledger/source row mismatch: ${ledgerRows.length} != ${sourceRows.length}`);
if (structuralFailures.length) throw new Error(`Automated lexical consistency ledger contains ${structuralFailures.length} structural failures`);
if (new Set(ledgerRows.map((row) => row.sourceRowId)).size !== ledgerRows.length) throw new Error("Ledger source identities are not unique");

const counts = {
  PASS: 0,
  FIXED: 0,
  "NEEDS-EVIDENCE": ledgerRows.length
};

const ledger = {
  schemaVersion: 2,
  reviewType: "automated lexical consistency coverage",
  reviewer: "automation",
  generatedAt: "2026-08-14",
  allRowsStructurallyChecked: true,
  allRowsReviewed: false,
  semanticReviewComplete: false,
  samplingSubstitute: false,
  identityRule: "sourceFile:sourceIndex over final data/words_core_*.js rows",
  sourceFiles: files,
  sourceRowCount: sourceRows.length,
  ledgerRowCount: ledgerRows.length,
  structuralFailureCount: structuralFailures.length,
  counts,
  sourceSnapshotSha256: sourceSnapshot(sourceRows),
  authoritativeReferenceSet: SOURCE_REFERENCES,
  evidenceBoundary: [
    "This artifact proves exhaustive row coverage for automated structural and generation-consistency checks.",
    "It does not prove Dutch spelling, article choice, meaning, CEFR placement, register, synonymy, separability, or morphology truthfulness.",
    "Rows that differ from origin/master are recorded as CHANGED_FROM_BASE; that must not be interpreted as a correction made by this review pass.",
    "A separate row-specific semantic review artifact is required before Task 007 can claim exhaustive lexical truth review."
  ],
  rows: ledgerRows
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "lexical-review-ledger.json"), `${JSON.stringify(ledger, null, 2)}\n`);
console.log(JSON.stringify({
  sourceRowCount: sourceRows.length,
  ledgerRowCount: ledgerRows.length,
  structuralFailures: structuralFailures.length,
  semanticNeedsEvidence: ledgerRows.length,
  mixedPosRows: ledgerRows.filter((row) => row.mixedPosDuplicate).length,
  snapshot: ledger.sourceSnapshotSha256
}, null, 2));
