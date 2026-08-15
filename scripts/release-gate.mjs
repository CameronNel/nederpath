// NederPath unified release gate. Any required check failing exits non-zero.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const STEPS = [
  ["deterministic-generation", ["node", "scripts/generate_words.mjs"]],
  ["lexical-audit", ["node", "scripts/lexical_audit.mjs", "--strict"]],
  ["lexical-tests", ["node", "tests/lexical.mjs"]],
  ["lexical-orthography", ["node", "tests/lexical_orthography.mjs"]],
  ["semantic-review", ["node", "scripts/validate_lexical_semantic_review.mjs", "--strict"]],
  ["independent-acceptance", ["node", "scripts/verify_lexical_independent.mjs"]],
  ["audit", ["node", "scripts/audit.mjs"]],
  ["smoke", ["node", "tests/smoke.mjs"]],
  ["regression-srs-learning", ["node", "tests/regression.mjs"]],
  ["review-followup", ["node", "tests/review_followup.mjs"]],
  ["sentences-generate", ["node", "tests/sentence_generation.mjs"]],
  ["sentences", ["node", "tests/sentence_surface_audit.mjs"]],
  ["idioms-generate", ["node", "tests/idiom_generation.mjs"]],
  ["integrity", ["node", "tests/pr1-integrity.mjs"]],
  ["boundaries", ["node", "tests/pr1-boundaries.mjs"]],
  ["grammar", ["node", "tests/grammar_quality.mjs"]],
  ["comprehension", ["node", "tests/comprehension.mjs"]],
  ["exam-integrity", ["node", "tests/exam_integrity.mjs"]],
  ["offline-sw", ["node", "tests/offline.mjs"]],
  ["browser", ["node", "tests/browser.mjs"]],
  ["viewport", ["node", "tests/viewport.mjs"]],
  ["build", ["node", "scripts/build.mjs"]],
  ["audit-artifact", ["node", "scripts/audit-artifact.mjs"]],
  ["residue", ["node", "scripts/audit-replatform-residue.mjs"]],
  ["mobile-payload", ["node", "mobile/scripts/prepare-web.mjs"]],
  ["mobile-audit", ["node", "scripts/audit-mobile-package.mjs"]]
];

for (const [name, command] of STEPS) {
  console.log(`\n===== release-gate: ${name} =====`);
  const [bin, ...args] = command;
  const result = spawnSync(bin, args, { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) {
    console.error(`release-gate FAILED at ${name}`);
    process.exit(result.status || 1);
  }
}

console.log("\nrelease-gate: all required checks passed");
