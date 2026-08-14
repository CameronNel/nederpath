import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./lexical_data.mjs";

const LEDGER_PATH = join(ROOT, "reports", "lexical-semantic-review.jsonl");

export function appendBatchReviews(records) {
  const lines = records.map((r) => JSON.stringify(r)).join("\n") + "\n";
  appendFileSync(LEDGER_PATH, lines, "utf8");
}

export function initLedger() {
  writeFileSync(LEDGER_PATH, "", "utf8");
}
