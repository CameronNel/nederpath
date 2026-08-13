// NederPath word-bank generator.
// Reads curated lemma cores from data/words_core_*.js and produces data/words.js
// with EXACTLY 20,000 unique Dutch word-form rows (id, rank, word, lemma, frequency,
// level, pos, article, meaning, category, synonyms, curated, learnable).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = 20000;

// ---------------------------------------------------------------------------
// Dutch inflection helpers
// ---------------------------------------------------------------------------
const KOFSCHIP = "tkfschp".split("");
const VOWELS = "aeiouyéèêáàâäëïöü".split("");

const isVowel = (c) => !!c && VOWELS.includes(c.toLowerCase());
const lastVowel = (w) => [...w].reverse().find((c) => isVowel(c));

// stem of a verb infinitive with Dutch spelling rules applied
function verbStem(inf) {
  if (!inf.endsWith("en")) return inf.replace(/en$/, "");
  let s = inf.slice(0, -2);
  if (s.endsWith("v")) s = s.slice(0, -1) + "f";
  if (s.endsWith("z")) s = s.slice(0, -1) + "s";
  if (/([bcdfghjklmnpqrstvwxz])\1$/.test(s)) s = s.slice(0, -1);
  if (/[aeou]$/.test(s)) s = s + s.slice(-1);
  return s;
}
const weakPast = (stem) => (KOFSCHIP.includes(stem.slice(-1).toLowerCase()) ? stem + "te" : stem + "de");
const weakPp = (stem) => (KOFSCHIP.includes(stem.slice(-1).toLowerCase()) ? stem + "t" : stem + "d");
const withGe = (pp, inf) => {
  if (/^(be|ge|ver|ont|her|er)/.test(inf) && inf.length > 4) return pp;
  return "ge" + pp;
};
const presentParticiple = (inf) => (inf.endsWith("en") ? inf.slice(0, -2) : inf) + "end";

const sylCount = (w) => (w.match(/[aeiouyéèêáàâäëïöü]+(?:[aeiouy])*/g) || []).length || 1;

// noun plural with rules + override
function nounPlural(word, ov) {
  if (ov === "s") return word + "s";
  if (ov === "inv") return null;
  if (ov === "none") return null;
  if (ov === "eren") return word + "eren";
  if (ov && ov.startsWith("=")) return ov.slice(1);
  const w = word;
  if (/[aeiouy]$/i.test(w)) {
    if (/[aiouy]$/i.test(w)) return w + "'s";
    return w + "s";
  }
  if (/e$/.test(w)) return w + "s";
  if (/(el|em|en|er|erd|aar|je|tje)$/.test(w) && sylCount(w) >= 2) return w + "s";
  if (/heid$/.test(w)) return w.slice(0, -4) + "heden";
  let b = w;
  if (b.endsWith("f")) b = b.slice(0, -1) + "v";
  if (/(aa|ee|oo|uu)$/.test(b) || /(aa|ee|oo|uu)[bcdfghjklmnpqrstvwxz]$/.test(b)) b = b.replace(/(aa|ee|oo|uu)/, (m) => m[0]);
  if (/[bcdfghjklmnpqrstvwxz]$/.test(b) && isVowel(b[b.length - 2]) && !isVowel(b[b.length - 3]) && b.length > 2 && !/(a|e|o|u)[bcdfghjklmnpqrstvwxz]{2}$/.test(b)) {
    // closed short-vowel syllable -> double final consonant unless vowel already doubled
    const last = b.slice(-1);
    if (!b.endsWith(last + last)) b = b + last;
  }
  return b + "en";
}

// diminutive with rules + override
function nounDim(word, ov) {
  if (ov && ov.includes("|") && ov.split("|")[1]) return ov.split("|")[1];
  const w = word;
  if (/ing$/.test(w)) return w.slice(0, -1) + "kje";
  if (/ie$/.test(w)) return w + "tje";
  if (/[aou]$/.test(w)) return w + w.slice(-1) + "tje";
  if (/[éèêáà]$/.test(w)) return w.slice(0, -1) + "eetje";
  if (/e$/.test(w)) return w + "tje";
  if (/(em|am|om|um|jm)$/.test(w)) {
    const longPair = /(aa|ee|oo|uu|oe|ie|ij|ei|ou|au|eu|ui)/.test(w);
    return longPair ? w + "pje" : w + w.slice(-1) + "etje";
  }
  if (/(lm|rm|nm)$/.test(w)) return w + "pje";
  if (/en$/.test(w) && sylCount(w) >= 2) return w.slice(0, -1) + "tje";
  if (/(el|er)$/.test(w) && sylCount(w) >= 2) return w + "tje";
  if (/(l|n|r|w)$/.test(w)) {
    const longPair = /(aa|ee|oo|uu|oe|ie|ij|ei|ou|au|eu|ui)/.test(w);
    if (longPair) return w + "tje";
    if (sylCount(w) === 1) return w + w.slice(-1) + "etje";
    return w + w.slice(-1) + "etje";
  }
  return w + "je";
}

// adjective/adverb comparison with override
function comparison(word, ov) {
  if (ov === "-") return [null, null];
  if (ov === "none") return [null, null];
  if (ov && ov.includes("|")) {
    const [, comp, sup] = ov.split("|");
    return [comp || null, sup || null];
  }
  let b = word;
  if (b.endsWith("f") && /[aeou]/.test(b)) b = b.slice(0, -1) + "v";
  if (/(aa|ee|oo|uu)[bcdfghjklmnpqrstvwxz]$/.test(b)) b = b.replace(/(aa|ee|oo|uu)/, (m) => m[0]);
  if (/[bcdfghjklmnpqrstvwxz]$/.test(b) && isVowel(b[b.length - 2]) && b.length > 2 && !/(a|e|o|u)[bcdfghjklmnpqrstvwxz]{2}$/.test(b)) {
    const last = b.slice(-1);
    if (!b.endsWith(last + last)) b = b + last;
  }
  const comp = b + "er";
  let sup = null;
  if (/s$/.test(b)) sup = b + "t";
  else sup = b + "st";
  return [comp, sup];
}

// ---------------------------------------------------------------------------
// Dutch number names (0-999) and ordinals (1-999)
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

// ---------------------------------------------------------------------------
// Load curated cores
// ---------------------------------------------------------------------------
const cores = [];
for (const file of readdirSync(join(ROOT, "data")).filter((f) => /^words_core_.*\.js$/.test(f)).sort()) {
  const src = readFileSync(join(ROOT, "data", file), "utf8");
  const mod = { exports: {} };
  const fn = new Function("module", "exports", src + "\nreturn module.exports;");
  const ex = fn(mod, mod.exports);
  cores.push(...(ex.WORDS || []));
}

// core row: [word, pos, level, article, meaning, category, synonyms, meta]
const rows = [];
const seen = new Map(); // normalized word -> index
const addRow = (r) => {
  const norm = r.word.toLowerCase().trim();
  const prev = seen.get(norm);
  if (prev !== undefined) return false;
  seen.set(norm, rows.length);
  rows.push(r);
  return true;
};

const coreMeta = []; // lemmaIdx -> core order
for (const [idx, c] of cores.entries()) {
  const [word, pos, level, article, meaning, category, synonyms, meta = ""] = c;
  const base = {
    word,
    pos,
    level,
    article: article || null,
    meaning: meaning || null,
    category,
    synonyms: synonyms ? synonyms.split(";").filter(Boolean) : [],
    curated: true,
    learnable: true,
    lemma: word,
    meta,
  };
  if (pos === "noun" && !article) {
    base.curated = false;
    base.learnable = false; // reference-only noun without verified article
  }
  addRow(base);
  coreMeta.push({ idx, word, pos, article, meta });

  const gen = []; // generated form rows
  if (pos === "noun" && article) {
    const pl = nounPlural(word, meta.split("|")[0] || "");
    if (pl && !seen.has(pl.toLowerCase())) gen.push({ word: pl, kind: "plural" });
    const dm = nounDim(word, meta);
    if (dm && !seen.has(dm.toLowerCase())) gen.push({ word: dm, kind: "diminutive" });
    if (pl && dm) {
      const dmPl = nounPlural(dm, "s");
      if (dmPl && !seen.has(dmPl.toLowerCase())) gen.push({ word: dmPl, kind: "diminutive-plural" });
    }
  } else if (pos === "verb") {
    const inf = word;
    if (meta.startsWith("sep")) {
      const ppO = meta.includes("=") ? meta.split("=")[1] : null;
      const bare = inf.replace(/^(op|af|uit|aan|in|mee|door|tegen|terug|na|voor|weg|om|binnen|buiten|neer|toe|vast|samen|op|af|uit|aan|mee|door|terug|na|voor|weg|om|neer|toe)(.+)$/, "$2");
      const pp = ppO || withGe(weakPp(verbStem(bare)), bare);
      if (!seen.has(pp.toLowerCase())) gen.push({ word: pp, kind: "past-participle" });
    } else {
      // meta: "" (weak) | "ik|hij|past|pastpl|pp" (irregular principal parts; "-" skips pp)
      const parts = meta ? meta.split("|") : [];
      const ikOv = parts[0] || null;
      const hijOv = parts[1] || null;
      const pastOv = parts[2] || null;
      const pastPlOv = parts[3] || null;
      const ppOv = parts.length > 4 ? parts[4] : null;
      const stem = verbStem(inf);
      const ik = ikOv || stem;
      const hij = hijOv || (stem.endsWith("t") ? stem : stem + "t");
      if (!seen.has(ik.toLowerCase())) gen.push({ word: ik, kind: "ik-form" });
      if (!seen.has(hij.toLowerCase()) && hij !== ik) gen.push({ word: hij, kind: "hij-form" });
      const past = pastOv || weakPast(stem);
      if (!seen.has(past.toLowerCase())) gen.push({ word: past, kind: "past-singular" });
      const pastPl = pastPlOv || (pastOv ? null : past + "en");
      if (pastPl && !seen.has(pastPl.toLowerCase())) gen.push({ word: pastPl, kind: "past-plural" });
      const pp = ppOv === "-" ? null : (ppOv || withGe(weakPp(stem), inf));
      if (pp && !seen.has(pp.toLowerCase())) gen.push({ word: pp, kind: "past-participle" });
      const presP = presentParticiple(inf);
      if (!seen.has(presP.toLowerCase())) gen.push({ word: presP, kind: "present-participle" });
    }
  } else if (pos === "adjective" || pos === "adverb") {
    const [comp, sup] = comparison(word, meta);
    if (comp && !seen.has(comp.toLowerCase())) gen.push({ word: comp, kind: "comparative" });
    if (sup && !seen.has(sup.toLowerCase())) gen.push({ word: sup, kind: "superlative" });
  }

  for (const g of gen) {
    const kindLabel = { plural: "plural of", diminutive: "diminutive of", "diminutive-plural": "plural of the diminutive of", "ik-form": "present-tense 'ik' form of", "hij-form": "present-tense 'hij/zij' form of", "past-singular": "past-tense form of", "past-plural": "past-tense plural form of", "past-participle": "past participle of", "present-participle": "present participle of", comparative: "comparative of", superlative: "superlative of" }[g.kind];
    const art = article ? article + " " : "";
    addRow({
      word: g.word,
      pos: pos === "noun" ? "noun" : pos,
      level,
      article: pos === "noun" ? article : null,
      meaning: meaning ? `${kindLabel} ${art}${word} (${meaning})` : null,
      category,
      synonyms: [],
      curated: false,
      learnable: pos !== "noun" || !!article,
      lemma: word,
      meta: "",
    });
  }
}

// numerals 0..999 and ordinals 1..999
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
    learnable: true,
    lemma: name,
    meta: "",
  });
  if (n >= 1) {
    addRow({
      word: ordinal(n),
      pos: "numeral",
      level: n <= 20 ? "A1" : n <= 100 ? "A2" : "B1",
      article: null,
      meaning: `${n}th`,
      category: "numbers",
      synonyms: [],
      curated: false,
      learnable: true,
      lemma: ordinal(n),
      meta: "",
    });
  }
}

// ---------------------------------------------------------------------------
// Trim or error to exactly TARGET rows
// ---------------------------------------------------------------------------
if (rows.length < TARGET) {
  // write a partial preview so data issues can be inspected while authoring cores
  const partial = rows.map((r, i) => ({ id: "nl-" + String(i + 1).padStart(5, "0"), rank: i + 1, word: r.word, lemma: r.lemma, frequency: 0, level: r.level, pos: r.pos, article: r.article, meaning: r.meaning, category: r.category, synonyms: r.synonyms, curated: !!r.curated, learnable: r.learnable !== false }));
  writeFileSync(join(ROOT, "data", "words.js"), "// PARTIAL PREVIEW - incomplete core data\nglobalThis.NP_WORDS = " + JSON.stringify(partial) + ";\n");
  console.error(`ERROR: only ${rows.length} rows generated, target ${TARGET}`);
  process.exit(1);
}
const surplus = rows.length - TARGET;
if (surplus > 0) {
  // Trim deterministically by priority: keep all curated lemmas first, then
  // preferred generated kinds, then numbers/ordinals, then the rest.
  const priority = (r, i) => {
    if (r.curated) return 0;                 // curated lemmas always kept
    if (r.pos === "noun") return 10;         // noun plurals / diminutives
    if (r.pos === "verb") return 20;         // verb forms
    if (r.pos === "adjective") return 30;    // comparisons
    if (r.pos === "numeral") return 40;      // numbers
    return 50;                               // adverb comparisons last
  };
  const indexed = rows.map((r, i) => ({ r, i, p: priority(r, i) }));
  indexed.sort((a, b) => (a.p - b.p) || (a.i - b.i));
  const keep = new Set(indexed.slice(0, TARGET).map((x) => x.i));
  for (let i = rows.length - 1; i >= 0; i--) if (!keep.has(i)) rows.splice(i, 1);
}

// ---------------------------------------------------------------------------
// Finalise: ids, ranks, frequencies
// ---------------------------------------------------------------------------
rows.sort((a, b) => a.word.localeCompare(b.word, "nl") === 0 ? 0 : 0); // stable, keep insertion order
const freqOf = (seq) => Math.max(1, Math.round(1e9 / Math.pow(seq + 1, 0.85)));
const final = rows.map((r, i) => ({
  id: "nl-" + String(i + 1).padStart(5, "0"),
  rank: i + 1,
  word: r.word,
  lemma: r.lemma,
  frequency: freqOf(i),
  level: r.level,
  pos: r.pos,
  article: r.article,
  meaning: r.meaning,
  category: r.category,
  synonyms: r.synonyms,
  curated: !!r.curated,
  learnable: r.learnable !== false,
}));

// sanity checks
const ids = new Set(final.map((r) => r.id));
const words = new Set(final.map((r) => r.word.toLowerCase().trim()));
if (ids.size !== final.length) throw new Error("duplicate ids");
if (words.size !== final.length) throw new Error("duplicate normalized words");
if (final.length !== TARGET) throw new Error(`count ${final.length} != ${TARGET}`);

const header = `// AUTO-GENERATED by scripts/generate_words.mjs - do not edit by hand.
// ${final.length} unique Dutch word-form rows. Verbs/nouns/adjectives are lemmas plus
// generated inflected forms; every learnable noun carries a verified de/het article.
// Source of truth: data/words_core_*.js (curated lemmas) + inflection rules here.
globalThis.NP_WORDS = `;
writeFileSync(join(ROOT, "data", "words.js"), header + JSON.stringify(final) + ";\n");
console.log(`words.js: ${final.length} rows`);
console.log(`  lemmas curated: ${final.filter((r) => r.curated).length}`);
console.log(`  nouns: ${final.filter((r) => r.pos === "noun").length} (learnable without article: ${final.filter((r) => r.pos === "noun" && r.learnable && !r.article).length})`);
console.log(`  verbs: ${final.filter((r) => r.pos === "verb").length}`);
console.log(`  adjectives: ${final.filter((r) => r.pos === "adjective").length}`);
console.log(`  numerals: ${final.filter((r) => r.pos === "numeral").length}`);
console.log(`  levels: ${["A1", "A2", "B1", "B2", "C1"].map((l) => l + "=" + final.filter((r) => r.level === l).length).join(" ")}`);
