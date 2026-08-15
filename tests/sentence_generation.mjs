import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GENERATOR = join(ROOT, "scripts", "generate_sentences.mjs");
const ARTIFACTS = [
  join(ROOT, "data", "sentences.js"),
  join(ROOT, "data", "sentence_ids.json")
];

function snapshot() {
  return ARTIFACTS.map((p) => readFileSync(p, "utf8")).join("\n/*FILE*/\n");
}

const before = snapshot();
for (let run = 1; run <= 2; run += 1) {
  const result = spawnSync(process.execPath, [GENERATOR], { cwd: ROOT, encoding: "utf8" });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout || `sentence generator exit ${result.status}`);
    process.exit(1);
  }
  if (snapshot() !== before) {
    console.error(`sentence generator run ${run} drifted from committed artifacts`);
    process.exit(1);
  }
}
console.log("Sentence generator: two runs byte-identical to checkout.");
