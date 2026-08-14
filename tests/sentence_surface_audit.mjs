// Independent strict surface-target audit added during review of PR #9.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateSentenceRow } from "../scripts/sentence_norm.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(ROOT, "data", "sentences.js"), "utf8");
const sandbox = {};
new Function("globalThis", source)(sandbox);
const sentences = sandbox.NP_SENTENCES;

if (!Array.isArray(sentences)) {
  throw new Error("data/sentences.js did not expose NP_SENTENCES");
}

const failures = [];
for (const row of sentences) {
  const errors = validateSentenceRow(row);
  if (errors.length) failures.push(`${row?.id || "<no-id>"}: ${errors.join(" | ")}`);
}

if (failures.length) {
  console.error(`Strict sentence surface audit failed for ${failures.length}/${sentences.length} rows:`);
  for (const failure of failures.slice(0, 25)) console.error(` - ${failure}`);
  if (failures.length > 25) console.error(` - ... ${failures.length - 25} additional failures omitted`);
  process.exit(1);
}

console.log(`Strict sentence surface audit: ${sentences.length} rows passed.`);
