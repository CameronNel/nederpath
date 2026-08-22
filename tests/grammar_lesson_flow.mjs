import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const grammarSource = readFileSync(join(ROOT, "data/grammar.js"), "utf8");
const flowSource = readFileSync(join(ROOT, "js/grammar-flow.js"), "utf8");

const context = vm.createContext({
  console,
  globalThis: {},
});
context.globalThis = context;
context.NederLearning = {
  escapeHTML: (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
};

vm.runInContext(grammarSource, context, { filename: "data/grammar.js" });
vm.runInContext(flowSource, context, { filename: "js/grammar-flow.js" });

const lessons = context.NP_GRAMMAR;
const flow = context.NederGrammarFlow;
assert.ok(Array.isArray(lessons), "grammar bank loads");
assert.equal(lessons.length, 120, "grammar bank still contains 120 lessons");
assert.ok(flow && typeof flow.install === "function", "grammar flow API loads");

for (const lesson of lessons) {
  const steps = flow.buildTeachingSteps(lesson);
  const test = flow.getTestExercises(lesson);
  const minutes = flow.estimateMinutes(lesson);

  assert.ok(steps.length >= 1 && steps.length <= 7, `${lesson.id}: bounded teaching steps`);
  assert.ok(test.length >= 1 && test.length <= 5, `${lesson.id}: short test`);
  assert.equal(test.length, 4, `${lesson.id}: current four-question curriculum retained`);
  assert.ok(minutes >= 2 && minutes <= 8, `${lesson.id}: bounded duration estimate`);
  for (const step of steps) {
    assert.ok(step.body && step.body.trim().length > 0, `${lesson.id}: teaching step has content`);
    assert.ok(step.body.length < 650, `${lesson.id}: teaching step remains bite-sized`);
  }
}

const first = lessons.find((lesson) => lesson.id === "g-001");
assert.ok(first, "representative A1 lesson exists");
const firstSteps = flow.buildTeachingSteps(first);
assert.equal(firstSteps[0].body, first.rules[0], "legacy curriculum is staged one authored rule at a time");
assert.notEqual(firstSteps[0].body, first.rules.join(" "), "first teaching screen is not the old full rule dump");

let completedScore = null;
const fakeApp = {
  activeGrammarRule: first,
  activeGrammarExIndex: 0,
  tokenReconstructionPlaced: [],
  activeGrammarAnswers: {},
  currentTab: "grammar",
  store: {
    completeGrammarRule: (_id, score) => { completedScore = score; },
    recordActivity: () => {}
  },
  announce: () => {},
  render: () => {},
  scrollToTop: () => {},
  openLearnItem: () => {},
  resolveRoutedDetails: () => {},
  openGrammarRule: () => {},
  renderGrammarView: () => '<p>120 in-depth rules, structural formulas, examples, and interactive exercises.</p>',
  renderGrammarExercise: (exercise) => `<div data-test-exercise>${exercise.type}</div>`,
  attachGrammarListeners: () => {}
};

assert.equal(flow.install(fakeApp), true, "flow installs on existing app instance");

fakeApp.activeGrammarPhase = "intro";
let html = fakeApp.renderGrammarRuleDetail(first);
assert.match(html, /btn-start-grammar-lesson/, "lesson opens on a dedicated start screen");
assert.match(html, /First you get the core idea in small pieces/, "intro explains the short flow");
assert.doesNotMatch(html, /Grammaticale Regels/, "intro does not show the old full rules section");
assert.doesNotMatch(html, /Structurele Zinsopbouw/, "intro does not show the old syntax dump");

fakeApp.activeGrammarPhase = "teach";
fakeApp.activeGrammarTeachIndex = 0;
html = fakeApp.renderGrammarRuleDetail(first);
assert.ok(html.includes(first.rules[0]), "teaching screen shows the current rule");
assert.ok(!html.includes(first.rules[1]), "teaching screen does not expose the next rule early");
assert.match(html, /Example/, "teaching screen includes a compact example");

fakeApp.activeGrammarPhase = "test";
fakeApp.activeGrammarExIndex = 0;
html = fakeApp.renderGrammarRuleDetail(first);
assert.match(html, /Short test/, "test phase is explicitly short");
assert.match(html, /data-test-exercise/, "test reuses the existing exercise renderer");
assert.match(html, /id="btn-next-grammar-ex" disabled/, "learner must answer before advancing");

fakeApp.activeGrammarAnswers = Object.fromEntries(first.exercises.map((_, index) => [index, { isCorrect: true, userAttempt: "ok" }]));
fakeApp.activeGrammarPhase = "complete";
html = fakeApp.renderGrammarRuleDetail(first);
assert.match(html, /100%/, "result phase reports test score");
assert.match(html, /Lesson complete/, "result phase has a distinct completion screen");

fakeApp.activeGrammarAnswers = {};
fakeApp.activeGrammarExIndex = 0;
fakeApp.recordGrammarExerciseAnswer(true, "ok");
assert.equal(completedScore, null, "lesson is not completed after one test answer");
for (let index = 1; index < first.exercises.length; index += 1) {
  fakeApp.activeGrammarExIndex = index;
  fakeApp.recordGrammarExerciseAnswer(true, "ok");
}
assert.equal(completedScore, 100, "existing grammar completion is preserved after the short test");

const catalog = fakeApp.renderGrammarView();
assert.match(catalog, /120 short, interactive lessons/, "catalog copy reflects progressive lessons");

console.log(`Grammar lesson flow: PASS (${lessons.length} lessons; intro -> micro-teaching -> 4-question test -> result)`);
