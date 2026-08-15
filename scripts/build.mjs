// NederPath Deterministic Production Build Script
import { existsSync, rmSync, mkdirSync, cpSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

console.log("\n=======================================================");
console.log("             NederPath Production Build                ");
console.log("=======================================================\n");

// 1. Clean dist directory
if (existsSync(DIST)) {
  console.log("Cleaning previous dist/ directory...");
  rmSync(DIST, { recursive: true, force: true });
}
mkdirSync(DIST, { recursive: true });

// 2. Define explicit runtime asset manifest to copy
const RUNTIME_ASSETS = [
  "index.html",
  "css/styles.css",
  "fonts/fonts.css",
  "fonts/OFL-Outfit.txt",
  "fonts/files/QGYvz_MVcBeNP4NJuktqQ4E.woff2",
  "fonts/files/QGYvz_MVcBeNP4NJtEtq.woff2",
  "js/learning.js",
  "js/store.js",
  "js/srs.js",
  "js/voice.js",
  "js/exam_integrity.js",
  "js/data-loader.js",
  "js/sw-register.js",
  "js/app.js",
  "js/experience-contract.js",
  "data/words.js",
  "data/grammar.js",
  "data/sentences.js",
  "data/idioms.js",
  "data/comprehension.js",
  "icons/favicon-32.png",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "manifest.webmanifest",
  "sw.js",
  ".nojekyll"
];

let copiedCount = 0;
for (const relPath of RUNTIME_ASSETS) {
  const src = join(ROOT, relPath);
  const dest = join(DIST, relPath);

  if (!existsSync(src)) {
    console.error(`  ✗ [ERROR] Source file missing: ${relPath}`);
    process.exit(1);
  }

  const destDir = dirname(dest);
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  cpSync(src, dest);
  const size = statSync(dest).size;
  console.log(`  ✓ Copied: ${relPath} (${(size / 1024).toFixed(1)} KB)`);
  copiedCount++;
}

console.log(`\nBuild successfully completed: ${copiedCount} runtime assets written to dist/.`);
console.log("=======================================================\n");
