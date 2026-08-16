// Run the existing broad browser regression against the core NederPath runtime.
// Dedicated suites cover the progressive grammar flow and production UI layer.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = join(ROOT, "index.html");
const original = readFileSync(INDEX, "utf8");
const presentationRefs = [
  /\s*<link rel="stylesheet" href="\.\/css\/grammar-flow\.css" \/>/,
  /\s*<script src="\.\/js\/grammar-flow\.js"><\/script>/,
  /\s*<script src="\.\/js\/hana-parity\.js"><\/script>/
];

for (const ref of presentationRefs) {
  if (!ref.test(original)) {
    console.error(`browser-core: expected presentation reference was not found in index.html: ${ref}`);
    process.exit(1);
  }
}

let status = 1;
try {
  // Keep the long-standing behavioral suite useful without forcing its old
  // Today/catalog/lesson-detail DOM contract onto the production presentation.
  // Progressive grammar has tests/grammar_lesson_flow.mjs; the integrated
  // production presentation is exercised by tests/ui-parity.mjs.
  const coreIndex = presentationRefs.reduce((html, ref) => html.replace(ref, ""), original);
  writeFileSync(INDEX, coreIndex, "utf8");
  const result = spawnSync(process.execPath, [join(ROOT, "tests", "browser.mjs")], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env
  });
  status = Number.isInteger(result.status) ? result.status : 1;
} finally {
  writeFileSync(INDEX, original, "utf8");
}

if (status !== 0) process.exit(status);
console.log("browser-core: core browser regression passed with presentation modules isolated");
