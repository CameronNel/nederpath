// NederPath word-bank generator.
// Reads curated lemma cores from data/words_core_*.js and produces data/words.js
// with the conservative set of Dutch word forms derived from curated cores and validated rules.
// No fabricated examples, no synthetic frequency, no target-count padding.
// Enforces schema invariants, safe learnability policies,
// and deterministic stable ID assignment with high-water mark across regeneration.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateRegistry, createIdAllocator, RegistryError } from "./id_allocator.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Allowed schema constants
const ALLOWED_POS = new Set([
  "noun", "verb", "adjective", "adverb", "pronoun", "determiner",
  "preposition", "conjunction", "interjection", "numeral", "phrase", "particle"
]);
const ALLOWED_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1"]);

// ---------------------------------------------------------------------------
// 1. Load Baseline Compatibility Map for Stable IDs (Fail-Closed)
// ---------------------------------------------------------------------------
const idRegistryPath = join(ROOT, "data", "word_ids.json");
if (!existsSync(idRegistryPath)) {
  console.error("FATAL: tracked historical ID registry data/word_ids.json is missing.");
  process.exit(1);
}

let idRegistry;
try {
  idRegistry = JSON.parse(readFileSync(idRegistryPath, "utf8"));
} catch (err) {
  console.error("FATAL: data/word_ids.json cannot be parsed:", err.message);
  process.exit(1);
}

let validatedRegistry;
try {
  validatedRegistry = validateRegistry(idRegistry);
} catch (err) {
  if (err instanceof RegistryError) {
    console.error(`FATAL: data/word_ids.json is invalid: ${err.message}`);
  } else {
    console.error("FATAL: data/word_ids.json could not be validated:", err.message);
  }
  process.exit(1);
}

const allocator = createIdAllocator(validatedRegistry);
const existingIdMap = validatedRegistry.entries;
const registryIdOwners = validatedRegistry.owners;

const wordsPath = join(ROOT, "data", "words.js");
if (!existsSync(wordsPath)) {
  console.error("FATAL: tracked compatibility baseline data/words.js is missing. Restore it before generating.");
  process.exit(1);
}
{
  const wordsSrc = readFileSync(wordsPath, "utf8");
  let baselineWords;
  try {
    const fn = new Function("globalThis", wordsSrc + "\nreturn globalThis.NP_WORDS;");
    baselineWords = fn({});
  } catch (err) {
    console.error("FATAL: data/words.js exists but cannot be parsed:", err.message);
    process.exit(1);
  }
  if (!Array.isArray(baselineWords)) {
    console.error("FATAL: data/words.js parsed but NP_WORDS is not an array.");
    process.exit(1);
  }

  const seenNorm = new Map();
  const seenIds = new Map();
  for (const w of baselineWords) {
    if (!w || !w.word || !w.id) {
      console.error("FATAL: data/words.js contains a row with missing word or id:", JSON.stringify(w));
      process.exit(1);
    }
    const norm = w.word.toLowerCase().trim();
    if (seenNorm.has(norm)) {
      console.error(`FATAL: data/words.js has duplicate normalized word '${norm}' (IDs: ${seenNorm.get(norm)}, ${w.id}).`);
      process.exit(1);
    }
    seenNorm.set(norm, w.id);

    if (seenIds.has(w.id)) {
      console.error(`FATAL: data/words.js has duplicate ID '${w.id}' (words: ${seenIds.get(w.id)}, ${norm}).`);
      process.exit(1);
    }
    seenIds.set(w.id, norm);

    const m = w.id.match(/^nl-(\d+)$/);
    if (!m) {
      console.error(`FATAL: data/words.js has malformed ID '${w.id}' for word '${norm}'.`);
      process.exit(1);
    }
    const registeredId = existingIdMap.get(norm);
    const registeredOwner = registryIdOwners.get(w.id);
    if (registeredId === undefined) {
      console.error(`FATAL: data/words.js contains '${norm}' (${w.id}), which is absent from the historical registry. Restore the registry; never silently recreate IDs.`);
      process.exit(1);
    }
    if (registeredId !== w.id) {
      console.error(`FATAL: data/words.js maps '${norm}' to '${w.id}', but the registry owns '${registeredId}'.`);
      process.exit(1);
    }
    if (registeredOwner && registeredOwner !== norm) {
      console.error(`FATAL: data/words.js assigns historical ID '${w.id}' to '${norm}', owned by '${registeredOwner}'.`);
      process.exit(1);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Conservative Explicit-Form Helpers
// ---------------------------------------------------------------------------
function explicitNounForms(word, meta) {
  const [pluralSpec = "", diminutiveSpec = ""] = String(meta || "").split("|");
  let plural = null;
  if (pluralSpec === "s") plural = `${word}s`;
  else if (pluralSpec === "'s") plural = `${word}'s`;
  else if (pluralSpec === "eren") plural = `${word}eren`;
  else if (pluralSpec.startsWith("=") && pluralSpec.length > 1) plural = pluralSpec.slice(1);

  const diminutive = diminutiveSpec || null;
  const diminutivePlural = diminutive ? `${diminutive}s` : null;
  return { plural, diminutive, diminutivePlural };
}

function explicitVerbForms(meta) {
  const value = String(meta || "");
  if (value.startsWith("sep=")) {
    const participle = value.slice(4).trim();
    return participle ? [{ word: participle, kind: "past-participle", grammaticalForm: "voltooid deelwoord" }] : [];
  }
  if (!value.includes("|")) return [];
  const [ik, hij, pastSingular, pastPlural, pastParticiple] = value.split("|");
  return [
    { word: ik, kind: "ik-form", grammaticalForm: "tegenwoordige tijd (ik)" },
    { word: hij, kind: "hij-form", grammaticalForm: "tegenwoordige tijd (hij/zij)" },
    { word: pastSingular, kind: "past-singular", grammaticalForm: "verleden tijd enkelvoud" },
    { word: pastPlural, kind: "past-plural", grammaticalForm: "verleden tijd meervoud" },
    { word: pastParticiple === "-" ? "" : pastParticiple, kind: "past-participle", grammaticalForm: "voltooid deelwoord" }
  ].filter((form) => form.word);
}

function explicitAdjectiveForms(meta) {
  const value = String(meta || "");
  if (!value.includes("|")) return [];
  const [, comparative, superlative] = value.split("|");
  return [
    { word: comparative, kind: "comparative", grammaticalForm: "vergrotende trap (comparatief)" },
    { word: superlative, kind: "superlative", grammaticalForm: "overtreffende trap (superlatief)" }
  ].filter((form) => form.word);
}

// ---------------------------------------------------------------------------
// 3. Numerals (Cardinals 0..999 & Ordinals 1..999)
// ---------------------------------------------------------------------------
const UNITS = ["nul", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien", "elf", "twaalf", "dertien", "veertien", "vijftien", "zestien", "zeventien", "achttien", "negentien"];
const TENS = ["", "", "twintig", "dertig", "veertig", "vijftig", "zestig", "zeventig", "tachtig", "negentig"];
const ORD_BASE = {
  1: "eerste", 2: "tweede", 3: "derde", 4: "vierde", 5: "vijfde", 6: "zesde", 7: "zevende",
  8: "achtste", 9: "negende", 10: "tiende", 11: "elfde", 12: "twaalfde", 13: "dertiende",
  14: "veertiende", 15: "vijftiende", 16: "zestiende", 17: "zeventiende", 18: "achttiende",
  19: "negentiende", 20: "twintigste", 30: "dertigste", 40: "veertigste", 50: "vijftigste",
  60: "zestigste", 70: "zeventigste", 80: "tachtigste", 90: "negentigste", 100: "honderdste",
};

function cardinal(n) {
  if (n < 20) return UNITS[n];
  if (n < 100) {
    const u = n % 10, t = Math.floor(n / 10);
    if (u === 0) return TENS[t];
    const uName = UNITS[u];
    return uName + (uName.endsWith("e") ? "ën" : "en") + TENS[t];
  }
  const h = Math.floor(n / 100), rest = n % 100;
  const hName = h === 1 ? "honderd" : UNITS[h] + "honderd";
  return rest === 0 ? hName : hName + cardinal(rest);
}

function ordinal(n) {
  if (n < 20) return ORD_BASE[n];
  if (n < 100) {
    if (ORD_BASE[n]) return ORD_BASE[n];
    return cardinal(n) + "ste";
  }
  if (ORD_BASE[n]) return ORD_BASE[n];
  const h = Math.floor(n / 100), rest = n % 100;
  const hName = h === 1 ? "honderd" : UNITS[h] + "honderd";
  return hName + (rest === 0 ? "ste" : ordinal(rest));
}

function ordinalSuffixEn(n) {
  const last2 = n % 100;
  if (last2 >= 11 && last2 <= 13) return `${n}th`;
  const last = n % 10;
  if (last === 1) return `${n}st`;
  if (last === 2) return `${n}nd`;
  if (last === 3) return `${n}rd`;
  return `${n}th`;
}

// ---------------------------------------------------------------------------
// 4. Load & Validate Curated Cores
// ---------------------------------------------------------------------------
const cores = [];
for (const file of readdirSync(join(ROOT, "data")).filter((f) => /^words_core_.*\.js$/.test(f)).sort()) {
  const src = readFileSync(join(ROOT, "data", file), "utf8");
  const mod = { exports: {} };
  const fn = new Function("module", "exports", src + "\nreturn module.exports;");
  const ex = fn(mod, mod.exports);
  const words = ex.WORDS || [];
  for (const [idx, c] of words.entries()) {
    if (!Array.isArray(c) || c.length !== 8) {
      throw new Error(`Invalid core row in ${file} at index ${idx}: expected array of 8 elements`);
    }
    const [word, pos, level, article, meaning, category] = c;
    if (!word || typeof word !== "string" || !word.trim()) {
      throw new Error(`Empty word in ${file} at index ${idx}`);
    }
    if (!ALLOWED_POS.has(pos)) {
      throw new Error(`Invalid POS '${pos}' in ${file} at index ${idx} for word '${word}'`);
    }
    if (!ALLOWED_LEVELS.has(level)) {
      throw new Error(`Invalid CEFR level '${level}' in ${file} at index ${idx} for word '${word}'`);
    }
    if (!meaning || typeof meaning !== "string") {
      throw new Error(`Missing meaning in ${file} at index ${idx} for word '${word}'`);
    }
    if (!category || typeof category !== "string") {
      throw new Error(`Missing category in ${file} at index ${idx} for word '${word}'`);
    }
    if (word.includes(" ") && pos === "verb") {
      throw new Error(`Multiword verb phrase '${word}' in ${file} must be pos='phrase'`);
    }
    if (pos === "noun" && !["de", "het"].includes(article)) {
      throw new Error(`Noun '${word}' in ${file} must carry article='de' or article='het'`);
    }
    cores.push(c);
  }
}

// ---------------------------------------------------------------------------
// 5. Expand Lemmas & Generate Inflectional Subtypes
// ---------------------------------------------------------------------------
const rows = [];
const seen = new Map(); // normalized word -> index in rows

const addRow = (r) => {
  const norm = r.word.toLowerCase().trim();
  if (seen.has(norm)) return false;
  seen.set(norm, rows.length);
  rows.push(r);
  return true;
};

for (const c of cores) {
  const [word, pos, level, article, meaning, category, synonyms, meta = ""] = c;
  const isPhrase = pos === "phrase";

  const base = {
    word,
    pos,
    level,
    article: article || null,
    meaning: meaning || null,
    category,
    synonyms: synonyms ? (Array.isArray(synonyms) ? synonyms : synonyms.split(";").filter(Boolean)) : [],
    curated: true,
    learnable: true,
    lemma: word,
    meta,
    inflectionType: isPhrase ? "phrase" : "lemma",
    grammaticalForm: isPhrase ? "gecureerde woordgroep / frase" : "basisvorm / lemma"
  };

  addRow(base);

  // Multiword phrases never enter single-word inflection engines
  if (isPhrase) continue;

  const gen = [];

  if (pos === "noun") {
    const { plural, diminutive, diminutivePlural } = explicitNounForms(word, meta);
    if (plural) gen.push({ word: plural, kind: "plural", grammaticalForm: "meervoud (mv.)" });
    if (diminutive) gen.push({ word: diminutive, kind: "diminutive", grammaticalForm: "verkleinwoord (o.)" });
    if (diminutivePlural) gen.push({ word: diminutivePlural, kind: "diminutive-plural", grammaticalForm: "verkleinwoord meervoud" });
  } else if (pos === "verb") {
    gen.push(...explicitVerbForms(meta));
  } else if (pos === "adjective") {
    gen.push(...explicitAdjectiveForms(meta));
  }

  for (const g of gen) {
    const kindLabel = {
      plural: "plural of",
      diminutive: "diminutive of",
      "diminutive-plural": "plural of the diminutive of",
      "ik-form": "present-tense 'ik' form of",
      "hij-form": "present-tense 'hij/zij' form of",
      "past-singular": "past-tense form of",
      "past-plural": "past-tense plural form of",
      "past-participle": "past participle of",
      "attributive-participle": "attributive past participle of",
      "present-participle": "present participle of",
      "attributive-present-participle": "attributive present participle of",
      "inflected-e": "inflected form of",
      comparative: "comparative of",
      "inflected-comparative": "inflected comparative of",
      superlative: "superlative of",
      "inflected-superlative": "inflected superlative of"
    }[g.kind] || "form of";
    const art = article ? article + " " : "";

    // Strictly enforce diminutive singular het, every plural de
    const derivedArticle = pos === "noun"
      ? (g.kind === "plural" || g.kind === "diminutive-plural" ? "de" : (g.kind === "diminutive" ? "het" : article))
      : null;

    addRow({
      word: g.word,
      pos: pos === "noun" ? "noun" : pos === "verb" ? "verb" : "adjective",
      level,
      article: derivedArticle,
      meaning: meaning ? `${kindLabel} ${art}${word} (${meaning})` : null,
      category,
      synonyms: [],
      curated: false,
      learnable: false, // Generated inflections are reference-only
      lemma: word,
      meta: "",
      inflectionType: g.kind,
      grammaticalForm: g.grammaticalForm
    });
  }
}

// Add numerals 0..999 and ordinals 1..999
// All numerals are uncurated and therefore learnable: false
for (let n = 0; n <= 999; n++) {
  const name = cardinal(n);
  addRow({
    word: name,
    pos: "numeral",
    level: n <= 20 ? "A1" : n <= 100 ? "A2" : "B1",
    article: null,
    meaning: `the number ${n}`,
    category: "numbers",
    synonyms: [],
    curated: false,
    learnable: false, // Uncurated: learnable must be false
    lemma: name,
    meta: "",
    inflectionType: "cardinal",
    grammaticalForm: "hoofdtelwoord (cardinaal)",
    numVal: n
  });
  if (n >= 1) {
    const ordSuffix = ordinalSuffixEn(n);
    addRow({
      word: ordinal(n),
      pos: "numeral",
      level: n <= 20 ? "A1" : n <= 100 ? "A2" : "B1",
      article: null,
      meaning: `${ordSuffix} (${n}e)`,
      category: "numbers",
      synonyms: [],
      curated: false,
      learnable: false,
      lemma: ordinal(n),
      meta: "",
      inflectionType: "ordinal",
      grammaticalForm: "rangtelwoord (ordinaal)",
      numVal: n
    });
  }
}

// ---------------------------------------------------------------------------
// 6. Finalize Word Bank with Stable IDs
// ---------------------------------------------------------------------------
// No fabricated frequency — set to null (unknown).
// No fabricated examples — set to null.

const final = rows.map((r, i) => {
  const norm = r.word.toLowerCase().trim();
  const assignedId = allocator.assignId(norm);

  const displayWord = r.pos === "noun" && r.article ? `${r.article} ${r.word}` : r.word;

  return {
    id: assignedId,
    rank: i + 1,
    word: r.word,
    article: r.article || null,
    displayWord,
    lemma: r.lemma || r.word,
    isCuratedLemma: !!(r.curated && r.inflectionType === "lemma"),
    inflectionType: r.inflectionType,
    grammaticalForm: r.grammaticalForm,
    frequency: null, // No sourced corpus frequency available
    level: r.level || "A1",
    pos: r.pos,
    meaning: r.meaning || r.word,
    category: r.category || "general",
    synonyms: r.synonyms || [],
    example: null, // No hand-authored examples in cores
    exampleEn: null,
    curated: !!r.curated,
    learnable: r.learnable === true,
  };
});

// Invariant assertions
const ids = new Set(final.map((r) => r.id));
const finalWords = new Set(final.map((r) => r.word.toLowerCase().trim()));
if (ids.size !== final.length) throw new Error("duplicate ids in generated word bank");
if (finalWords.size !== final.length) throw new Error("duplicate normalized words in generated word bank");

// Schema and policy invariants
for (const r of final) {
  if (r.level === "phrase") throw new Error(`Prohibited level='phrase' in row ${r.id} (${r.word})`);
  if (!ALLOWED_LEVELS.has(r.level)) throw new Error(`Invalid level='${r.level}' in row ${r.id} (${r.word})`);
  if (r.word.includes(" ") && r.pos === "verb") throw new Error(`Multiword verb '${r.word}' found in final bank`);
  if (r.pos === "noun" && (r.inflectionType === "plural" || r.inflectionType === "diminutive-plural") && r.article !== "de") {
    throw new Error(`Plural noun '${r.word}' has article '${r.article}', must be 'de'`);
  }
  if (r.pos === "noun" && r.inflectionType === "diminutive" && r.article !== "het") {
    throw new Error(`Diminutive noun '${r.word}' has article '${r.article}', must be 'het'`);
  }
  // Invariant: learnable implies curated (no exceptions for cardinals or anything else)
  if (r.learnable && !r.curated) {
    throw new Error(`Invariant violation: learnable=true but curated=false for '${r.word}' (${r.id})`);
  }
  // isCuratedLemma must not be true for phrases
  if (r.isCuratedLemma && r.pos === "phrase") {
    throw new Error(`isCuratedLemma must not be true for phrase '${r.word}' (${r.id})`);
  }
}

// ---------------------------------------------------------------------------
// 7. Write words.js, Historical ID Registry & Emit Content-Integrity Report
// ---------------------------------------------------------------------------
const header = `// AUTO-GENERATED by scripts/generate_words.mjs - do not edit by hand.
// ${final.length} unique Dutch word-form rows derived from curated cores and inflection rules.
// Curated headwords and phrases are learnable; derived inflectional forms are searchable reference items.
// Frequency and example fields are null (no sourced data available).
// Source of truth: data/words_core_*.js (curated lemmas) + inflection rules.
globalThis.NP_WORDS = `;

writeFileSync(join(ROOT, "data", "words.js"), header + JSON.stringify(final) + ";\n");

// Persist all historical owners and the monotonic high-water mark.
writeFileSync(idRegistryPath, JSON.stringify(allocator.toRegistry()) + "\n");

// Content-Integrity Report
const curatedCount = final.filter((r) => r.curated).length;
const learnableCount = final.filter((r) => r.learnable).length;
const referenceCount = final.filter((r) => !r.learnable).length;

console.log("\n=======================================================");
console.log("             NederPath Word Bank Generation            ");
console.log("=======================================================");
console.log(`Total word forms generated: ${final.length}`);
console.log(`  Curated headwords / phrases: ${curatedCount}`);
console.log(`  Learnable entries:           ${learnableCount}`);
console.log(`  Derived reference-only rows: ${referenceCount}`);
console.log("\n--- Breakdown by Part of Speech ---");
const posCounts = {};
for (const r of final) posCounts[r.pos] = (posCounts[r.pos] || 0) + 1;
for (const [p, c] of Object.entries(posCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${p.padEnd(14)}: ${c}`);
}
console.log("\n--- Breakdown by CEFR Level ---");
for (const lvl of ["A1", "A2", "B1", "B2", "C1"]) {
  console.log(`  ${lvl.padEnd(14)}: ${final.filter((r) => r.level === lvl).length}`);
}
console.log("\n--- Breakdown by Inflection Subtype ---");
const inflCounts = {};
for (const r of final) inflCounts[r.inflectionType] = (inflCounts[r.inflectionType] || 0) + 1;
for (const [inf, c] of Object.entries(inflCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${inf.padEnd(30)}: ${c}`);
}
console.log("=======================================================\n");
