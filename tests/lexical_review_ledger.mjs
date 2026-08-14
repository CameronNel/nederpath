import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadCuratedRows, normalizeLexicalForm, ROOT } from "../scripts/lexical_data.mjs";

const ledger = JSON.parse(readFileSync(new URL("../reports/lexical-review-ledger.json", import.meta.url), "utf8"));
const mergeReview = JSON.parse(readFileSync(new URL("../reports/merge-policy-review.json", import.meta.url), "utf8"));
const { rows: sourceRows, files } = loadCuratedRows(ROOT);

assert.equal(ledger.allRowsReviewed, true);
assert.equal(ledger.samplingSubstitute, false);
assert.deepEqual(ledger.sourceFiles, files);
assert.equal(ledger.sourceRowCount, sourceRows.length);
assert.equal(ledger.ledgerRowCount, sourceRows.length);
assert.equal(ledger.rows.length, sourceRows.length);
assert.equal(ledger.counts["NEEDS-EVIDENCE"], 0);
assert.equal(ledger.rows.filter((row) => row.overall === "NEEDS-EVIDENCE").length, 0);
assert.equal(new Set(ledger.rows.map((row) => row.sourceRowId)).size, sourceRows.length);

const sourceIds = new Set(sourceRows.map((row) => `${row.file}:${row.index}`));
for (const row of ledger.rows) {
  assert.ok(sourceIds.has(row.sourceRowId), `${row.sourceRowId}: ledger row is not a final source row`);
  assert.equal(row.normalizedWord, normalizeLexicalForm(row.word), `${row.sourceRowId}: normalization drift`);
  for (const field of ["headword", "pos", "cefr", "article", "meaning", "category", "register", "synonyms", "morphology", "duplicateHomograph", "generatedOwnership"]) {
    assert.ok(row.fieldReview[field]?.disposition, `${row.sourceRowId}: missing ${field} disposition`);
  }
  assert.ok(["PASS", "FIXED"].includes(row.overall), `${row.sourceRowId}: invalid overall disposition`);
}

assert.equal(mergeReview.sourceDuplicateGroupCount, 1463);
assert.equal(mergeReview.reviewedGroupCount, mergeReview.sourceDuplicateGroupCount);
assert.equal(mergeReview.mixedPOSGroupCount, 36);
assert.equal(mergeReview.mixedPOSGroupsReviewed, 36);
assert.equal(mergeReview.needsEvidence, 0);
assert.equal(mergeReview.allSelectorsUniqueAndStable, true);
assert.equal(mergeReview.allMixedPOSGroupsIsolated, true);
assert.equal(mergeReview.groups.length, mergeReview.sourceDuplicateGroupCount);

console.log(`Exhaustive lexical review ledger passed: ${ledger.ledgerRowCount} source rows, ${ledger.counts.PASS} PASS, ${ledger.counts.FIXED} FIXED, ${ledger.counts["NEEDS-EVIDENCE"]} NEEDS-EVIDENCE; ${mergeReview.reviewedGroupCount} duplicate groups and ${mergeReview.mixedPOSGroupCount} mixed-POS groups reviewed.`);
