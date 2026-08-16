import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(ROOT, "js", "exam_integrity.js"), "utf8");
const sandbox = { module: { exports: {} }, exports: {}, globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(`${source}\nthis.api = this.NederExamIntegrity || module.exports;`, sandbox);
const api = sandbox.api;

function assert(cond, name) {
  if (!cond) {
    console.error(`  ✗ [FAIL] ${name}`);
    process.exitCode = 1;
    return;
  }
  console.log(`  ✓ [PASS] ${name}`);
}

console.log("\nNederPath exam integrity\n");
assert(api.dutchExamsEnabled() === false, "Dutch formal exams remain disabled");
assert(api.examAvailability().certificationClaims === false, "No certification claims");
assert(api.createResult({ attemptId: "a1", examId: "vocab" }).ok === false, "createResult fails closed while banks are absent");

const taint = api.createTaintEvent({ controlId: "practice-override", queryGate: "__wetest", appVersion: "test" });
assert(api.validateTaintEvent(taint).length === 0, "valid taint event accepted");
const badTaint = api.createTaintEvent({ controlId: "x", queryGate: "nope", appVersion: "test" });
assert(api.validateTaintEvent(badTaint).length > 0, "invalid queryGate is rejected");

const state = {};
assert(api.appendTaintEvent(state, taint).added === true, "taint event appends");
assert(api.appendTaintEvent(state, taint).added === false, "duplicate taint ids are immutable");

// Hostile caller test: checksumOf is intentionally public for deterministic validation,
// so a caller can construct a syntactically valid record without using createResult().
// Formal records must still fail closed while no reviewed Dutch bank exists.
const forgedFormal = {
  resultSchemaVersion: api.RESULT_SCHEMA_VERSION,
  attemptId: "forged-attempt",
  examId: "forged-exam",
  attemptMode: "formal",
  status: "formal",
  submittedAt: 1770000000000,
  itemCount: 20,
  scoreSummary: { correct: 20, total: 20 },
  overrideEventIds: [],
  checksum: null
};
forgedFormal.checksum = api.checksumOf(forgedFormal);
const forgedErrors = api.validateResult(forgedFormal);
assert(forgedErrors.includes("formal results disabled"), "forged formal result is rejected while banks are disabled");
assert(api.appendResult({}, forgedFormal).added === false, "forged formal result cannot enter persisted integrity state");
assert(api.isFormalPass(forgedFormal) === false, "forged formal result can never become a formal pass");

const practiceResult = {
  resultSchemaVersion: api.RESULT_SCHEMA_VERSION,
  attemptId: "practice-attempt",
  examId: "future-exam",
  attemptMode: "practice",
  status: "practice",
  submittedAt: 1770000000000,
  itemCount: 20,
  scoreSummary: { correct: 18, total: 20 },
  overrideEventIds: [taint.taintEventId],
  checksum: null
};
practiceResult.checksum = api.checksumOf(practiceResult);
assert(api.validateResult(practiceResult).length === 0, "well-formed practice result remains structurally valid");

const normalized = api.normalizeExamIntegrityContainer({
  taintEvents: [taint, badTaint, taint],
  byAttemptId: {
    [forgedFormal.attemptId]: forgedFormal,
    [practiceResult.attemptId]: practiceResult,
    mismatchedKey: { ...practiceResult, attemptId: "different-attempt" }
  },
  migrationLog: ["legacy"]
});
assert(normalized.taintEvents.length === 1 && normalized.taintEvents[0].taintEventId === taint.taintEventId, "normalization drops invalid and duplicate taint events");
assert(!Object.prototype.hasOwnProperty.call(normalized.byAttemptId, forgedFormal.attemptId), "normalization drops forged formal results");
assert(Object.prototype.hasOwnProperty.call(normalized.byAttemptId, practiceResult.attemptId), "normalization preserves valid practice results");
assert(!Object.prototype.hasOwnProperty.call(normalized.byAttemptId, "mismatchedKey"), "normalization rejects map-key/result identity mismatch");

const malformedPractice = {
  resultSchemaVersion: 999,
  attemptId: " ",
  examId: "",
  attemptMode: "formal",
  status: "practice",
  submittedAt: -1,
  itemCount: -2,
  scoreSummary: null,
  overrideEventIds: ["taint-a", "taint-a", ""],
  checksum: null
};
malformedPractice.checksum = api.checksumOf(malformedPractice);
const malformedErrors = api.validateResult(malformedPractice);
assert(malformedErrors.includes("invalid result schema"), "result schema version is validated");
assert(malformedErrors.includes("missing or invalid attemptId") && malformedErrors.includes("missing or invalid examId"), "result identity fields must be bounded and non-empty");
assert(malformedErrors.includes("attemptMode/status mismatch"), "attempt mode must agree with result status");
assert(malformedErrors.includes("invalid submittedAt") && malformedErrors.includes("invalid itemCount"), "result timing and item count are validated");
assert(malformedErrors.includes("invalid scoreSummary"), "score summary must be an object");
assert(malformedErrors.includes("invalid overrideEventIds") && malformedErrors.includes("duplicate overrideEventIds"), "override-event identifiers are validated");

const cyclicResult = {
  resultSchemaVersion: api.RESULT_SCHEMA_VERSION,
  attemptId: "cyclic-attempt",
  examId: "future-exam",
  attemptMode: "practice",
  status: "practice",
  submittedAt: 1770000000000,
  itemCount: 1,
  scoreSummary: { correct: 1, total: 1 },
  overrideEventIds: [taint.taintEventId],
  checksum: "not-a-real-checksum"
};
cyclicResult.self = cyclicResult;
let cyclicErrors = [];
let cyclicThrew = false;
try {
  cyclicErrors = api.validateResult(cyclicResult);
} catch {
  cyclicThrew = true;
}
assert(cyclicThrew === false && cyclicErrors.includes("checksum validation failed"), "validator fails closed instead of throwing on non-JSON/cyclic input");

if (process.exitCode) {
  console.error("\nExam integrity tests failed.");
  process.exit(1);
}
console.log("\nExam integrity tests passed.\n");
void createRequire;
