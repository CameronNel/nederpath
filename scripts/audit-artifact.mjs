// NederPath Build Artifact Quality and Integrity Audit
import { existsSync, readFileSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

console.log("\n=======================================================");
console.log("            NederPath Build Artifact Audit             ");
console.log("=======================================================\n");

let passed = 0;
let failed = 0;

function check(condition, label, details = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${label}`);
  } else {
    failed++;
    console.error(`  ✗ [FAIL] ${label} ${details ? "- " + details : ""}`);
  }
}

// 1. Dist Directory Existence
check(existsSync(DIST) && statSync(DIST).isDirectory(), "dist/ directory exists and is a directory");

// 2. Required Runtime Files
const REQUIRED_FILES = [
  "index.html",
  "css/styles.css",
  "css/grammar-flow.css",
  "js/learning.js",
  "js/store.js",
  "js/srs.js",
  "js/voice.js",
  "js/exam_integrity.js",
  "js/data-loader.js",
  "js/sw-register.js",
  "js/app.js",
  "js/grammar-flow.js",
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

for (const rel of REQUIRED_FILES) {
  const full = join(DIST, rel);
  const exists = existsSync(full);
  const size = exists ? statSync(full).size : 0;
  check(exists && size > 0, `Runtime file exists & non-empty: dist/${rel}`, `(size: ${size} B)`);
}

// 3. Prohibited Files Scan (Source-only, tooling, metadata)
const PROHIBITED_ENTRIES = [
  ".git",
  "node_modules",
  "tests",
  "scripts",
  ".github",
  "package.json",
  "package-lock.json",
  "README.md",
  ".DS_Store"
];

for (const entry of PROHIBITED_ENTRIES) {
  const full = join(DIST, entry);
  check(!existsSync(full), `Prohibited non-runtime entry absent: dist/${entry}`);
}

// 4. Validate Asset References in index.html and sw.js
if (existsSync(join(DIST, "index.html"))) {
  const html = readFileSync(join(DIST, "index.html"), "utf8");
  const matches = [...html.matchAll(/(?:href|src)=["'](\.\/[^"']+)["']/g)];
  for (const [, ref] of matches) {
    const cleanRef = ref.replace(/^\.\//, "");
    const target = join(DIST, cleanRef);
    check(existsSync(target), `index.html asset reference resolves: ${ref}`);
  }
}

if (existsSync(join(DIST, "sw.js"))) {
  const sw = readFileSync(join(DIST, "sw.js"), "utf8");
  // Extract SHELL_ASSETS array
  const shellMatch = sw.match(/SHELL_ASSETS\s*=\s*\[([\s\S]*?)\];/);
  if (shellMatch) {
    const assets = shellMatch[1]
      .split(",")
      .map((s) => s.trim().replace(/['"]/g, ""))
      .filter((s) => s.length > 0 && s !== "./");

    for (const ref of assets) {
      const cleanRef = ref.replace(/^\.\//, "");
      const target = join(DIST, cleanRef);
      check(existsSync(target), `sw.js shell precache asset resolves: ${ref}`);
    }
  }
}

// 5. Validate Manifest Production Metadata
if (existsSync(join(DIST, "manifest.webmanifest"))) {
  const manifest = JSON.parse(readFileSync(join(DIST, "manifest.webmanifest"), "utf8"));
  check(manifest.id === "./", "manifest.webmanifest has project-relative id: './'");
  check(manifest.start_url === "./", "manifest.webmanifest has project-relative start_url: './'");
  check(manifest.scope === "./", "manifest.webmanifest has project-relative scope: './'");
  check(manifest.lang === "nl", "manifest.webmanifest has lang: 'nl'");
  check(Array.isArray(manifest.categories) && manifest.categories.includes("education"), "manifest.webmanifest categories includes education");
}

console.log(`\n=======================================================`);
console.log(`Artifact Audit Completed: ${passed} Passed, ${failed} Failed`);
console.log(`=======================================================\n`);

if (failed > 0) process.exit(1);
