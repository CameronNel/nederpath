// One-shot correction for noun metadata that generated orthographically invalid
// plain -s plurals after a final long vowel. The list is deliberately explicit:
// every entry was reviewed against the Dutch apostrophe rule before inclusion.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, CORE_FILE_RE } from "./lexical_data.mjs";

const lemmas = [
  "auto", "opa", "oma", "collega", "pyjama", "paraplu", "foto", "radio",
  "diploma", "metro", "euro", "lesauto", "zebra", "agenda", "tandpasta",
  "baby", "opera", "pinda", "vla", "tosti", "pasta", "menu", "cola",
  "cappuccino", "espresso", "whisky", "sla", "paprika", "kiwi", "mango",
  "avocado"
];

const files = readdirSync(join(ROOT, "data")).filter((file) => CORE_FILE_RE.test(file)).sort();
const counts = new Map(lemmas.map((lemma) => [lemma, 0]));
for (const file of files) {
  const path = join(ROOT, "data", file);
  const lines = readFileSync(path, "utf8").split("\n");
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    for (const lemma of lemmas) {
      if (!lines[i].includes(`N("${lemma}"`)) continue;
      const replaced = lines[i].replace(/,"s"\),?\s*$/u, (suffix) => suffix.replace('"s"', '"\'s"'));
      if (replaced !== lines[i]) {
        lines[i] = replaced;
        counts.set(lemma, counts.get(lemma) + 1);
        changed = true;
      }
    }
  }
  if (changed) writeFileSync(path, lines.join("\n"));
}

const missing = [...counts].filter(([, count]) => count === 0).map(([lemma]) => lemma);
if (missing.length) throw new Error(`No plain-s noun metadata found for reviewed lemmas: ${missing.join(", ")}`);
console.log(`Corrected ${[...counts.values()].reduce((a, b) => a + b, 0)} source rows across ${lemmas.length} reviewed long-vowel lemmas.`);
for (const [lemma, count] of counts) console.log(`${lemma}: ${count}`);
