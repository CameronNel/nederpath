import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const www = join(ROOT, "mobile", "www");
const android = join(ROOT, "mobile", "android");

function fail(msg) {
  console.error(`  ✗ [FAIL] ${msg}`);
  process.exitCode = 1;
}
function pass(msg) {
  console.log(`  ✓ [PASS] ${msg}`);
}

console.log("\nNederPath native payload audit\n");
if (!existsSync(join(www, ".nederpath-generated"))) {
  fail("mobile/www is not marked generated — run prepare-web first");
} else pass("generated marker present");

if (existsSync(join(www, "sw.js"))) fail("service worker must not be packaged natively");
else pass("sw.js excluded from native payload");

const forbidden = /hanapath|hangul|jamo|korean_5000|korean_supplementary|audio_map/i;
function walk(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) walk(p);
    else if (forbidden.test(name.name)) fail(`forbidden payload file ${p}`);
  }
}
walk(www);

const gradle = readFileSync(join(android, "app", "build.gradle"), "utf8");
if (!gradle.includes("io.github.cameronnel.nederpath")) fail("applicationId not renamed");
else pass("applicationId is io.github.cameronnel.nederpath");
if (gradle.includes("HANAPATH_UPLOAD") || gradle.includes("hanapath")) fail("HanaPath signing identifiers remain");
else pass("signing identifiers are NederPath-prefixed and fail-closed");

const strings = readFileSync(join(android, "app", "src", "main", "res", "values", "strings.xml"), "utf8");
if (!strings.includes(">NederPath<")) fail("Android app name not renamed");
else pass("Android label is NederPath");

if (process.exitCode) process.exit(1);
console.log("\nNative payload audit passed.\n");
