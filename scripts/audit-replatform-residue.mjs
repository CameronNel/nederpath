// Scan production runtime files for leftover Korean / legacy Neder UI residue.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RUNTIME = [
  "index.html",
  "css/styles.css",
  "css/grammar-flow.css",
  "js/app.js",
  "js/grammar-flow.js",
  "js/store.js",
  "js/srs.js",
  "js/learning.js",
  "js/voice.js",
  "js/exam_integrity.js",
  "js/experience-contract.js",
  "js/data-loader.js",
  "js/sw-register.js",
  "sw.js",
  "manifest.webmanifest",
];

const FORBIDDEN = [
  /\bhanapath\b/i,
  /\bhangul\b/i,
  /\bjamo\b/i,
  /\bkorean\b/i,
  /\bromani[sz]ation\b/i,
  /\.app-header\b/,
  /\.main-nav\b/,
  /\.header-stats\b/,
  /\.stat-pill-sm\b/,
  /Calm Nordic/i,
  /\.today-hero\b/,
  /\.practice-nav-bar\b/
];

const ALLOWED_CONTEXT = [
  /nederpath-v1/,
  /nederpath-v4-cache/,
  /nederpath-v5-cache/
];

let failed = 0;
for (const file of RUNTIME) {
  const path = join(ROOT, file);
  if (!existsSync(path)) {
    console.error(`missing runtime file ${file}`);
    failed += 1;
    continue;
  }
  const text = readFileSync(path, "utf8");
  for (const pattern of FORBIDDEN) {
    const match = text.match(pattern);
    if (!match) continue;
    if (ALLOWED_CONTEXT.some((ok) => ok.test(match[0]))) continue;
    const isKorean = /hangul|jamo|korean|hanapath/i.test(match[0]);
    const isOldNederShell = /\.app-header|\.main-nav|\.header-stats|\.stat-pill-sm|Calm Nordic|\.today-hero|\.practice-nav-bar/.test(match[0]);
    if (file === "css/styles.css" && !isKorean && !isOldNederShell) {
      continue;
    }
    console.error(`  [FAIL] ${file} contains forbidden residue: ${match[0]}`);
    failed += 1;
  }
}

if (failed) {
  console.error(`residue audit failed: ${failed} finding(s)`);
  process.exit(1);
}
console.log("residue audit passed for required runtime files");
