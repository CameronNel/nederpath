import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const learningSrc = readFileSync(join(ROOT, "js", "learning.js"), "utf8");
const storeSrc = readFileSync(join(ROOT, "js", "store.js"), "utf8");
const srsSrc = readFileSync(join(ROOT, "js", "srs.js"), "utf8");

const runtime = {};
new Function("globalThis", "module", "exports", learningSrc)(runtime, {}, {});
const Learning = runtime.NederLearning;

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (error) {
    failed++;
    console.error(`  ✗ [FAIL] ${name}: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertThrows(fn, message) {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) throw new Error(message);
}

function makeStorage() {
  const memory = new Map();
  return {
    getItem: (key) => memory.has(key) ? memory.get(key) : null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
}

function withStore(fn) {
  const oldStorage = globalThis.localStorage;
  globalThis.localStorage = makeStorage();
  try {
    const testGlobal = { NederLearning: Learning };
    new Function("globalThis", storeSrc)(testGlobal);
    return fn(testGlobal.NederStore);
  } finally {
    if (oldStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = oldStorage;
  }
}

function loadSrs(store) {
  const testGlobal = { NederStore: store };
  new Function("globalThis", srsSrc)(testGlobal);
  return testGlobal.NederSRS;
}

console.log("\n=======================================================");
console.log("       NederPath PR #1 Boundary Regression Tests       ");
console.log("=======================================================\n");

test("Article drill: prototype-magic noun keys cannot mutate the mistakes object prototype", () => {
  withStore((store) => {
    const beforePrototype = Object.getPrototypeOf(store.state.progress.articleStats.mistakes);
    store.recordArticleDrill("__proto__", "de", "het");
    const mistakes = store.state.progress.articleStats.mistakes;
    assert(Object.getPrototypeOf(mistakes) === beforePrototype, "articleStats.mistakes prototype changed");
    assert(!Object.prototype.hasOwnProperty.call(mistakes, "__proto__"), "unsafe __proto__ mistake key was stored");
    assert(mistakes.onbekend === 1, "unsafe noun was not redirected to a safe fallback key");
  });
});

test("SRS: prototype-magic IDs are rejected before any object mutation", () => {
  const store = { state: { srs: { cards: {} } }, recordActivity: () => undefined };
  const srs = loadSrs(store);
  const initialPrototype = Object.getPrototypeOf(store.state.srs.cards);
  for (const id of ["__proto__", "constructor", "prototype"]) {
    assertThrows(() => srs.getCard(id, "vocab", true), `unsafe SRS id ${id} was accepted`);
  }
  assert(Object.keys(store.state.srs.cards).length === 0, "unsafe SRS IDs created card entries");
  assert(Object.getPrototypeOf(store.state.srs.cards) === initialPrototype, "SRS cards object prototype changed");
});

test("SRS: missing activity dependency fails before card creation", () => {
  const store = { state: { srs: { cards: {} } } };
  const srs = loadSrs(store);
  assertThrows(() => srs.review("safe-card", 3, "vocab"), "review without recordActivity did not fail");
  assert(Object.keys(store.state.srs.cards).length === 0, "failed review created a card before dependency validation");
});

test("Date validation accepts the scheduler's maximum supported future interval", () => {
  const maxDue = new Date(Date.now() + 36500 * 24 * 60 * 60 * 1000).toISOString();
  assert(Learning.isValidISODateString(maxDue), `max SRS interval produced a date rejected by backup validation: ${maxDue}`);
});

test("Learning indexes work on frozen word-bank arrays without trying to mutate them", () => {
  const bank = Object.freeze([
    { id: "v-1", word: "werken", lemma: "werken", pos: "verb", inflectionType: "lemma", learnable: true },
    { id: "v-2", word: "werkt", lemma: "werken", pos: "verb", inflectionType: "hij-form", learnable: false }
  ]);
  const eligible = Learning.getEligibleVerbs(bank);
  assert(eligible.length === 1 && eligible[0].word === "werken", "frozen word bank could not be indexed safely");
});

console.log(`\nPR #1 Boundary Tests Complete: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
