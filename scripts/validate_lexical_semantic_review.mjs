import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCuratedRows, normalizeLexicalForm, ROOT, sourceFields } from "./lexical_data.mjs";

const LEDGER_PATH = join(ROOT, "reports", "lexical-semantic-review.jsonl");
const ALLOWED_STATUSES = new Set(["PASS_THIS_REVIEW", "FIXED_THIS_REVIEW", "NEEDS_EVIDENCE"]);

export function validateSemanticLedger({ requireComplete = false } = {}) {
  if (!existsSync(LEDGER_PATH)) {
    throw new Error(`Semantic review ledger not found at ${LEDGER_PATH}`);
  }

  const content = readFileSync(LEDGER_PATH, "utf8");
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const { rows: sourceRows } = loadCuratedRows(ROOT);

  const seenKeys = new Set();
  const ledgerRows = [];
  const statusCounts = {
    PASS_THIS_REVIEW: 0,
    FIXED_THIS_REVIEW: 0,
    NEEDS_EVIDENCE: 0
  };

  for (let i = 0; i < lines.length; i++) {
    let record;
    try {
      record = JSON.parse(lines[i]);
    } catch (err) {
      throw new Error(`Line ${i + 1} of semantic review ledger is not valid JSON: ${err.message}`);
    }

    const {
      sourceFile,
      sourceIndex,
      word,
      pos,
      semanticStatus,
      spellingJudgment,
      posJudgment,
      articleJudgment,
      meaningJudgment,
      cefrJudgment,
      synonymJudgment,
      morphologyJudgment,
      registerJudgment,
      homographJudgment,
      reviewNote
    } = record;

    if (!sourceFile || typeof sourceIndex !== "number" || !word || !pos || !semanticStatus) {
      throw new Error(`Line ${i + 1} missing required core identifiers (sourceFile, sourceIndex, word, pos, semanticStatus)`);
    }

    if (!ALLOWED_STATUSES.has(semanticStatus)) {
      throw new Error(`Line ${i + 1} has invalid semanticStatus: '${semanticStatus}'`);
    }

    statusCounts[semanticStatus]++;

    const key = `${sourceFile}:${sourceIndex}`;
    if (seenKeys.has(key)) {
      throw new Error(`Duplicate entry for ${key} at line ${i + 1}`);
    }
    seenKeys.add(key);

    if (i < sourceRows.length) {
      const expectedSource = sourceRows[i];
      const expectedFields = sourceFields(expectedSource);
      if (expectedSource.file !== sourceFile || expectedSource.index !== sourceIndex) {
        throw new Error(
          `Sequence mismatch at line ${i + 1}: ledger has ${sourceFile}:${sourceIndex}, but source sequence has ${expectedSource.file}:${expectedSource.index}`
        );
      }
      if (normalizeLexicalForm(expectedFields.word) !== normalizeLexicalForm(word)) {
        throw new Error(
          `Word mismatch at ${key}: ledger has '${word}', but source has '${expectedFields.word}'`
        );
      }
    }

    const requiredJudgments = [
      spellingJudgment,
      posJudgment,
      articleJudgment,
      meaningJudgment,
      cefrJudgment,
      synonymJudgment,
      morphologyJudgment,
      registerJudgment,
      homographJudgment,
      reviewNote
    ];

    for (const j of requiredJudgments) {
      if (typeof j !== "string" || !j.trim()) {
        throw new Error(`Line ${i + 1} (${key}) has missing or blank required judgment field`);
      }
    }

    if (semanticStatus === "FIXED_THIS_REVIEW") {
      if (!record.corrections && (!reviewNote || !reviewNote.toLowerCase().includes("fix") && !reviewNote.toLowerCase().includes("correct"))) {
        throw new Error(`Line ${i + 1} (${key}) is marked FIXED_THIS_REVIEW but lacks clear documented correction rationale in reviewNote or corrections`);
      }
    }

    ledgerRows.push(record);
  }

  if (requireComplete) {
    if (ledgerRows.length !== sourceRows.length) {
      throw new Error(
        `Semantic ledger is incomplete: contains ${ledgerRows.length} rows, expected ${sourceRows.length} source rows`
      );
    }
    if (statusCounts.NEEDS_EVIDENCE > 0) {
      throw new Error(
        `Semantic ledger cannot contain NEEDS_EVIDENCE for complete review (${statusCounts.NEEDS_EVIDENCE} remaining)`
      );
    }
  }

  return {
    totalChecked: ledgerRows.length,
    totalSource: sourceRows.length,
    statusCounts,
    complete: ledgerRows.length === sourceRows.length && statusCounts.NEEDS_EVIDENCE === 0
  };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  const requireComplete = process.argv.includes("--complete") || process.argv.includes("--strict");
  const result = validateSemanticLedger({ requireComplete });
  console.log(JSON.stringify(result, null, 2));
}
