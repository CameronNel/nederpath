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
assert(malformedErrors.includes("missing attemptId") && malformedErrors.includes("missing examId"), "result identity fields must be non-empty");
assert(malformedErrors.includes("attemptMode/status mismatch"), "attempt mode must agree with result status");
assert(malformedErrors.includes("invalid submittedAt") && malformedErrors.includes("invalid itemCount"), "result timing and item count are validated");
assert(malformedErrors.includes("invalid scoreSummary"), "score summary must be an object");
assert(malformedErrors.includes("invalid overrideEventIds") && malformedErrors.includes("duplicate overrideEventIds"), "override-event identifiers are validated");

if (process.exitCode) {
  console.error("\nExam integrity tests failed.");
  process.exit(1);
}
console.log("\nExam integrity tests passed.\n");
void createRequire;
