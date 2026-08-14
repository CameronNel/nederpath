import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadCuratedRows, normalizeLexicalForm, ROOT } from "../scripts/lexical_data.mjs";

const ledger = JSON.parse(readFileSync(new URL("../reports/lexical-review-ledger.json", import.meta.url), "utf8"));
const mergeReview = JSON.parse(readFileSync(new URL("../reports/merge-policy-review.json", import.meta.url), "utf8"));
const { rows: sourceRows, files } = loadCuratedRows(ROOT);

assert.equal(ledger.schemaVersion, 2);
assert.equal(ledger.reviewType, "automated lexical consistency coverage");
assert.equal(ledger.allRowsStructurallyChecked, true);
assert.equal(ledger.allRowsReviewed, false);
assert.equal(ledger.semanticReviewComplete, false);
assert.equal(ledger.samplingSubstitute, false);
assert.deepEqual(ledger.sourceFiles, files);
assert.equal(ledger.sourceRowCount, sourceRows.length);
assert.equal(ledger.ledgerRowCount, sourceRows.length);
assert.equal(ledger.rows.length, sourceRows.length);
assert.equal(ledger.structuralFailureCount, 0);
assert.equal(ledger.counts["NEEDS-EVIDENCE"], sourceRows.length);
assert.equal(new Set(ledger.rows.map((row) => row.sourceRowId)).size, sourceRows.length);

const sourceIds = new Set(sourceRows.map((row) => `${row.file}:${row.index}`));
for (const row of ledger.rows) {
  assert.ok(sourceIds.has(row.sourceRowId), `${row.sourceRowId}: ledger row is not a final source row`);
  assert.equal(row.normalizedWord, normalizeLexicalForm(row.word), `${row.sourceRowId}: normalization drift`);
  assert.equal(row.structuralStatus, "PASS", `${row.sourceRowId}: structural consistency failure`);
  assert.equal(row.semanticReview.disposition, "NEEDS-EVIDENCE", `${row.sourceRowId}: semantic evidence must not be inferred from automation`);
  assert.equal(row.overall, "NEEDS-EVIDENCE", `${row.sourceRowId}: overall status must remain fail-closed pending semantic review`);
  for (const field of ["headword", "pos", "cefr", "article", "meaning", "category", "register", "synonyms", "morphology", "duplicateHomograph", "generatedOwnership"]) {
    assert.ok(row.fieldReview[field]?.disposition, `${row.sourceRowId}: missing ${field} automated disposition`);
  }
  assert.ok(["UNCHANGED", "CHANGED_FROM_BASE"].includes(row.baselineComparison.disposition), `${row.sourceRowId}: invalid baseline comparison`);
}

assert.equal(mergeReview.sourceDuplicateGroupCount, 1463);
assert.equal(mergeReview.reviewedGroupCount, mergeReview.sourceDuplicateGroupCount);
assert.equal(mergeReview.mixedPOSGroupCount, 36);
assert.equal(mergeReview.mixedPOSGroupsReviewed, 36);
assert.equal(mergeReview.needsEvidence, 0);
assert.equal(mergeReview.allSelectorsUniqueAndStable, true);
assert.equal(mergeReview.allMixedPOSGroupsIsolated, true);
assert.equal(mergeReview.groups.length, mergeReview.sourceDuplicateGroupCount);

console.log(`Automated lexical consistency coverage passed: ${ledger.ledgerRowCount} source rows, 0 structural failures; ${ledger.counts["NEEDS-EVIDENCE"]} rows still require independent semantic evidence.`);
