// NederPath unified release gate. Any required check failing exits non-zero.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const STEPS = [
  ["words", ["npm", "run", "words"]],
  ["lexical-audit", ["node", "scripts/lexical_audit.mjs", "--strict"]],
  ["lexical-tests", ["node", "tests/lexical.mjs"]],
  ["lexical-orthography", ["node", "tests/lexical_orthography.mjs"]],
  ["semantic-review", ["node", "scripts/validate_lexical_semantic_review.mjs", "--strict"]],
  ["independent-acceptance", ["node", "scripts/verify_lexical_independent.mjs"]],
  ["test", ["npm", "test"]],
  ["build", ["npm", "run", "build"]],
  ["audit-artifact", ["npm", "run", "audit:artifact"]],
  ["residue", ["node", "scripts/audit-replatform-residue.mjs"]],
  ["mobile-payload", ["node", "mobile/scripts/prepare-web.mjs"]]
];

let failed = 0;
for (const [name, command] of STEPS) {
  console.log(`\n===== release-gate: ${name} =====`);
  const [bin, ...args] = command;
  const result = spawnSync(bin, args, { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) {
    console.error(`release-gate FAILED at ${name}`);
    failed += 1;
    process.exit(result.status || 1);
  }
}

if (failed === 0) {
  console.log("\nrelease-gate: all required checks passed");
}
