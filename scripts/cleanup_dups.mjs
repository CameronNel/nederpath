// One-off cleanup: removes accidental "dup guard" entries whose word ends in a digit,
// and reports them for review. Reads core files, rewrites them without such rows.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
for (const file of ["words_core_1.js", "words_core_2.js", "words_core_3.js", "words_core_4.js", "words_core_5.js", "words_core_6.js"]) {
  const path = join(ROOT, "data", file);
  let src = readFileSync(path, "utf8");
  const lines = src.split(/\r?\n/);
  const out = [];
  let removed = 0;
  for (const line of lines) {
    // matches tuple first element like O("x2",...) N("y3",...) V("z2",...)
    const m = line.match(/^\s*[NVADO]\("([^"]+)"/);
    if (m && /\d$/.test(m[1])) {
      console.log(`  ${file}: removing ${m[1]}`);
      removed++;
      continue;
    }
    out.push(line);
  }
  if (removed) writeFileSync(path, out.join("\n"), "utf8");
  console.log(`${file}: removed ${removed} digit-suffixed entries`);
}
