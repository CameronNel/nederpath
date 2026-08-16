// Run the existing broad browser regression against the core NederPath runtime.
// The separate ui-parity suite tests the production presentation layer itself.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = join(ROOT, "index.html");
const original = readFileSync(INDEX, "utf8");
const parityScript = /\s*<script src="\.\/js\/hana-parity\.js"><\/script>/;

if (!parityScript.test(original)) {
  console.error("browser-core: expected UI parity script reference was not found in index.html");
  process.exit(1);
}

let status = 1;
try {
  // Keep the long-standing behavioral suite useful without forcing its old
  // Today/catalog DOM contract onto the production UI. The production parity
  // layer is covered immediately afterwards by tests/ui-parity.mjs.
  writeFileSync(INDEX, original.replace(parityScript, ""), "utf8");
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
console.log("browser-core: core browser regression passed with production UI overlay isolated");
