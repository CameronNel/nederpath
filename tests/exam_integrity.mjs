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

if (process.exitCode) {
  console.error("\nExam integrity tests failed.");
  process.exit(1);
}
console.log("\nExam integrity tests passed.\n");
void createRequire;
