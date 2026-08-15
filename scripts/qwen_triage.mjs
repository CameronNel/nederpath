// Qwen Task 007 triage: heuristic screening of all curated source rows.
// Surfaces candidate errors for manual linguistic review. Flags are CANDIDATES,
// not verdicts: every flag is resolved by manual inspection before any fix.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT, loadCuratedRows, loadCanonicalRows, normalizeLexicalForm,
  parseNounMeta, parseVerbMeta, parseAdjectiveMeta, sourceFields, duplicateSourceGroups
} from "./lexical_data.mjs";

const { files, rows } = loadCuratedRows(ROOT);
const report = {
  generatedFor: "qwen task-007 semantic re-review triage",
  totalRows: rows.length,
  flags: {
    nounArticleSuffix: [], pluralMeta: [], diminutive: [], verbParadigm: [],
    sepParticiple: [], adjectiveComparison: [], synonymMissing: [], gloss: [],
    registerWatch: [], cefrWatch: [], properNames: [], multiword: [],
    homographMixedPos: [], duplicates: []
  }
};
const push = (key, rec) => report.flags[key].push(rec);
const at = (r) => `${r.file}:${r.index}`;

// ---------------------------------------------------------------- suffix gender
const DE_SUFFIX = ["ing", "heid", "teit", "schap", "nis", "arij", "erij", "ij", "ade", "ide", "ode", "ude", "eur", "aar", "ier", "ster"];
const HET_SUFFIX = ["isme", "um", "sel", "ment", "gram"];
const DIMINUTIVE_ENDINGS = ["tje", "pje", "kje", "etje", "je"];
function suffixExpectation(word) {
  const w = word.toLowerCase();
  for (const d of DIMINUTIVE_ENDINGS) if (w.endsWith(d) && w.length > d.length + 1) return { expect: "het", suffix: `-${d} (diminutive)` };
  for (const s of DE_SUFFIX) if (w.endsWith(s) && w.length > s.length + 1) return { expect: "de", suffix: `-${s}` };
  for (const s of HET_SUFFIX) if (w.endsWith(s) && w.length > s.length + 1) return { expect: "het", suffix: `-${s}` };
  if (w.endsWith("e")) return { expect: "de?", suffix: "-e (usually de, exceptions exist)" };
  return null;
}

// ---------------------------------------------------------------- verb oracle
const VOICELESS_KOFSCHIP = new Set(["t", "k", "f", "s", "p"]); // ch handled separately
function kofschipDe(inf) {
  // decision based on the infinitive's final consonant BEFORE -en (voicing underlying)
  const body = inf.replace(/e?n$/u, "");
  const last = body[body.length - 1];
  if (!last) return true;
  if (/[aeiou]/u.test(last)) return true;
  if (VOICELESS_KOFSCHIP.has(last)) return false;
  if (last === "g" || last === "v" || last === "z" || last === "d" || last === "b" || last === "r" || last === "l" || last === "m" || last === "n" || /[jw]/u.test(last)) return true;
  if (last === "c" || last === "x" || last === "h" || last === "q") return false;
  return true;
}
const IRREGULAR_NO_ORACLE = new Set([
  "zijn", "hebben", "zullen", "kunnen", "mogen", "moeten", "willen", "weten",
  "worden", "staan", "doen", "gaan", "slaan", "zien", "vrijen"
]);
function deriveStem(inf) {
  let s = inf;
  const notes = [];
  if (s.endsWith("iëren")) { s = s.slice(0, -5) + "ieer"; notes.push("-iëren: stem -ieer"); }
  else if (s.endsWith("ën")) s = s.slice(0, -2);
  else if (/[bcdfghjklmnpqrstvwxz](ien|oen)$/.test(s)) { s = s.slice(0, -1); notes.push("-ien/-oen infinitive: only -n dropped"); }
  else if (s.endsWith("en")) s = s.slice(0, -2);
  else return { stem: null, notes: ["infinitive does not end in -en"] };
  let short = false;
  // simplify doubled final consonant (short vowel marker)
  if (s.length > 2 && s[s.length - 1] === s[s.length - 2] && /[bcdfghjklmnpqrst]/.test(s[s.length - 1])) {
    s = s.slice(0, -1);
    notes.push("short-vowel: final doubled consonant simplified");
    short = true;
  }
  // final voicing alternation v->f, z->s
  if (s.endsWith("v")) { s = s.slice(0, -1) + "f"; notes.push("v->f devoicing"); }
  if (s.endsWith("z")) { s = s.slice(0, -1) + "s"; notes.push("z->s devoicing"); }
  if (!short) {
    // long-vowel doubling: final SINGLE vowel letter (preceded by a consonant)
    // + single consonant. Digraphs (oe/ie/ui/ei/ou/au/eu/aa/ee/oo/uu) never double.
    const m = s.match(/^(.*[^aeiouë])([aeiou])([bcdfghjklmnpqrstvwxz])$/u);
    if (m) {
      const [, pre, vowel, cons] = m;
      // schwa ending (-em/-en/-el/-er with another vowel earlier) blocks doubling
      const schwaEnding = /[mnrl]$/.test(s) && s.replace(/[^aeiou]/gu, "").length >= 2 && vowel === "e";
      // -ig suffix vowel is never doubled (nodig, eindig)
      const igEnding = s.endsWith("ig");
      // doubled consonant before the vowel marks a short vowel (grinnik, hinnik)
      const shortByDoubleCons = pre.length >= 2 && pre[pre.length - 1] === pre[pre.length - 2] && /[bcdfghjklmnpqrst]/.test(pre[pre.length - 1]);
      // uw is a closed-diphthong spelling (duw, waarschuw)
      const uwEnding = vowel === "u" && cons === "w";
      if (!schwaEnding && !igEnding && !shortByDoubleCons && !uwEnding) {
        s = pre + vowel + vowel + cons;
        notes.push("long-vowel doubling");
      }
    }
  }
  return { stem: s, notes };
}
// -eren verbs with final stress: studeren -> studeer (stem variant)
function ikCandidates(stem) {
  const cands = new Set([stem]);
  if (/er$/.test(stem)) cands.add(stem.slice(0, -2) + "eer");
  return [...cands];
}
// 't kofschip voicing must be judged on the INFINITIVE final consonant (v/z stay voiced underlyingly)
function expectedWeakPP(ik, inf) {
  const voiced = kofschipDe(inf);
  if (!voiced && ik.endsWith("t")) return ik;
  if (voiced && ik.endsWith("d")) return ik;
  return ik + (voiced ? "d" : "t");
}
function expectedWeakOvt(ik, inf, plural) {
  const voiced = kofschipDe(inf);
  const suffix = voiced ? (plural ? "den" : "de") : (plural ? "ten" : "te");
  return ik + suffix;
}
const SEP_PREFIXES = ["terug", "samen", "tegen", "onder", "over", "voor", "door", "vast", "vol", "weg", "aan", "af", "bij", "in", "mee", "na", "om", "op", "uit", "toe", "hard", "los", "neer", "schoon", "deel", "thuis", "wit", "zwart", "omhoog", "omlaag", "vooraf"];
function splitSepParticiple(word, pp) {
  // pp like 'uitgenodigd' -> prefix 'uit' + rest 'genodigd'; only if pp carries ge after prefix
  const m = pp.match(/^([a-z]+?)(ge(?:[a-zë]*))$/u);
  if (!m) return null;
  const prefix = m[1];
  if (!SEP_PREFIXES.includes(prefix)) return null;
  if (!word.startsWith(prefix)) return null;
  return { prefix, restInf: word.slice(prefix.length) };
}
const INSEP_PREFIX = ["be", "ver", "ont", "her", "er", "mis", "weer", "vol"]; // ge- verbs KEEP ge- in pp (gegeven)
// prefixes that can be separable OR inseparable depending on stress/meaning
const AMBIG_PREFIX = ["onder", "over", "door", "voor", "om", "achter"];
function isInseparable(inf) {
  return INSEP_PREFIX.some((p) => inf.startsWith(p) && inf.length - p.length >= 4);
}
function isAmbigPrefix(inf) {
  return AMBIG_PREFIX.some((p) => inf.startsWith(p) && inf.length - p.length >= 4);
}
// ge- root verbs (geven, geloven, gebruiken, gebaren) already begin with ge-
function startsWithGe(inf) {
  return inf.startsWith("ge") && inf.length >= 5;
}
function hijFromIk(ik) {
  if (ik.endsWith("t")) return ik;
  if (ik.endsWith("a")) return ik + "at"; // ga -> gaat
  if (ik.endsWith("o")) return ik + "ot"; // (rare)
  if (ik.endsWith("i")) return ik.slice(0, -1) + "iet"; // ski -> skiet
  return ik + "t";
}
function protectLongVowel(form, ik) {
  // ik 'ski' -> suffix forms need 'ie' (skiede, geskied)
  if (ik.endsWith("i") && !ik.endsWith("ei") && !ik.endsWith("ij")) {
    return form.replace(/i(?=[dt])/u, "ie");
  }
  return form;
}
function expectedWeakPast(inf, stem, plural) {
  const suffix = kofschipDe(inf) ? (plural ? "ten" : "te") : (plural ? "den" : "de");
  return stem + suffix;
}

// ---------------------------------------------------------------- register watchlist
const REGISTER_WATCH = new Set([
  "indien", "mits", "tenzij", "aangezien", "dewelke", "hetgeen", "alwaar", "thans",
  "gaarne", "der", "des", "deszelfs", "diens", "enerzijds", "anderzijds", "daarentegen",
  "niettemin", "desondanks", "evenwel", "zodoende", "aldus", "doch", "zulks", "zulk",
  "welk", "welke", "wijlen", "gaarne", "nimmer", "thans", "gaarne", "sedert", "gaarne",
  "daar", "waar", "naardien", "voorwaar", "bij dezen", "ingevolge", "krachtens", "wegens",
  "ter zake", "terzake", "omtrent", "inzake", "blijkens", "gaarne", "vervolgens", "derhalve",
  "halverwege", "bovendien", "eveneens", "immer", "ooit", "geenszins", "volstrekt", "hoegenaamd",
  "doorgaans", "destijds", "indertijd", "toenmaals", "zolang", "zodra", "zodat", "opdat", "ten einde",
  "teneinde", "alvorens", "voorafgaand", "nadien", "voorheen", "weleer", "eertijds", "gaarne",
  "mits", "behoudens", "onverminderd", "ondergetekende", "dezer", "dezes"
]);

const allNorms = new Set(rows.map((r) => normalizeLexicalForm(r.row[0])));

for (const rec of rows) {
  const f = sourceFields(rec);
  const { word, pos, level, article, meaning, category, synonyms, meta } = f;
  const norm = normalizeLexicalForm(word);

  // ---------------- nouns
  if (pos === "noun") {
    const exp = suffixExpectation(word);
    if (exp && article && exp.expect !== "de?" && article !== exp.expect) {
      push("nounArticleSuffix", { at: at(rec), word, article, expect: exp.expect, suffix: exp.suffix, meaning });
    }
    if (exp && exp.expect === "de?" && article === "het") {
      push("nounArticleSuffix", { at: at(rec), word, article, expect: "de (usually)", suffix: "-e ending het needs verification", meaning });
    }
    try {
      const nm = parseNounMeta(word, meta);
      if (nm.plural) {
        const pl = nm.plural;
        if (meta.startsWith("s")) {
          // bare s plural: suspicious after long a/o/u/i/y in final open syllable
          if (/[aoiuy]$/.test(word)) push("pluralMeta", { at: at(rec), word, plural: pl, meta, issue: "bare -s after final a/o/i/u/y usually needs apostrophe ('s)" });
          if (/eeu[w]?$|ieuw$|oo$|aa$|uu$/u.test(word)) push("pluralMeta", { at: at(rec), word, plural: pl, meta, issue: "bare -s after long vowel/diphthong ending needs check" });
        } else if (meta.startsWith("'s")) {
          if (!/[aoiuy]$/.test(word)) push("pluralMeta", { at: at(rec), word, plural: pl, meta, issue: "'s plural without final a/o/i/u/y vowel" });
        } else if (meta === "eren") {
          const KNOWN_EREN = new Set(["kind", "ei", "goed", "blad", "gemoed", "hoen", "kalf", "rund", "lam", "been", "gild", "volk"]);
          if (!KNOWN_EREN.has(norm)) push("pluralMeta", { at: at(rec), word, plural: pl, meta, issue: "-eren plural not in canonical set, verify" });
        } else if (meta.startsWith("=")) {
          if (pl === `${word}en`) {
            // explicit but equal to default: informational only, skip
          } else {
            push("pluralMeta", { at: at(rec), word, plural: pl, meta, issue: "explicit irregular plural, manual verify" });
          }
        }
      } else if (meta === "inv" || (meta && meta.split("|")[0] === "inv")) {
        push("pluralMeta", { at: at(rec), word, meta, issue: "invariant plural claim, verify mass/plurale-tantum", meaning });
      }
      if (nm.diminutive) {
        const d = nm.diminutive;
        let expectSuffix = null;
        if (word.endsWith("m")) expectSuffix = "pje";
        else if (/[ptkf]$/.test(word) || word.endsWith("s") || word.endsWith("ch") || word.endsWith("g")) expectSuffix = "je";
        else if (/[aeiou]$/.test(word)) expectSuffix = "tje";
        else if (/[lnr]$/.test(word)) expectSuffix = /[aeiou][bcdfghjklmnpqrst]$/.test(word.slice(0, -1)) ? "etje?" : "tje";
        push("diminutive", { at: at(rec), word, diminutive: d, meta, meaning, hint: expectSuffix ? `typical suffix -${expectSuffix}` : "check manually" });
      }
    } catch (err) {
      push("pluralMeta", { at: at(rec), word, meta, issue: `meta parse error: ${err.message}` });
    }
  }

  // ---------------- verbs
  if (pos === "verb") {
    if (meta.startsWith("sep=")) {
      const pp = meta.slice(4);
      if (INSEP_PREFIX.some((p) => word.startsWith(p) && word.length - p.length >= 4)) {
        push("sepParticiple", { at: at(rec), word, meta, issue: "inseparable-prefix verb marked separable", meaning });
      } else {
        const sep = splitSepParticiple(word, pp);
        if (!sep) {
          push("sepParticiple", { at: at(rec), word, meta, issue: "separable participle has no recognizable prefix+ge shape", meaning });
        } else {
          const { stem } = deriveStem(sep.restInf);
          if (stem) {
            const weakPP = sep.prefix + "ge" + expectedWeakPP(ikCandidates(stem)[0], sep.restInf);
            if (pp !== weakPP && !pp.endsWith("en") && !pp.includes("ge" + ikCandidates(stem)[0])) {
              push("sepParticiple", { at: at(rec), word, meta, issue: `pp differs from weak expectation '${weakPP}' -> strong or error`, stem, meaning });
            }
          }
        }
      }
    } else if (meta && meta.includes("|")) {
      try {
        const parts = meta.split("|");
        const [ik, hij, ovtS, ovtP, pp] = parts;
        if (IRREGULAR_NO_ORACLE.has(norm)) {
          push("verbParadigm", { at: at(rec), word, meta, issues: ["IRREGULAR AUX/MODAL/STEM: manual verification only"], meaning, level });
        } else {
        const issues = [];
        const sep = pp && pp !== "-" ? splitSepParticiple(word, pp) : null;
        const infForStem = sep ? sep.restInf : word;
        const { stem, notes } = deriveStem(infForStem);
        if (stem) {
          const ikOk = ikCandidates(stem);
          if (!ikOk.includes(ik)) issues.push(`ik '${ik}' vs derived stem(s) ${ikOk.map((c) => `'${c}'`).join("/")}`);
          const hijExp = hijFromIk(ik);
          if (hij !== hijExp) issues.push(`hij '${hij}' vs expected '${hijExp}' (from ik '${ik}')`);
          const wS = protectLongVowel(expectedWeakOvt(ik, infForStem, false), ik);
          const wP = protectLongVowel(expectedWeakOvt(ik, infForStem, true), ik);
          if (ovtS !== wS || ovtP !== wP) {
            issues.push(`OVT '${ovtS}'/'${ovtP}' differs from weak '${wS}'/'${wP}' -> strong/irregular or error`);
          }
          if (pp && pp !== "-") {
            let weakPP = expectedWeakPP(ik, infForStem);
            if (ik.endsWith("o") && !/[aeiou]o$/.test(ik)) weakPP = ik + "o" + (kofschipDe(infForStem) ? "d" : "t"); // kano -> gekanood
            weakPP = protectLongVowel(weakPP, ik);
            const fullWeakPP = sep ? sep.prefix + "ge" + weakPP : ((isInseparable(word) || startsWithGe(word)) ? weakPP : "ge" + weakPP);
            if (pp !== fullWeakPP && !pp.endsWith("en")) issues.push(`pp '${pp}' differs from weak '${fullWeakPP}' -> strong or error`);
            if (!sep && !isInseparable(word) && !startsWithGe(word) && !isAmbigPrefix(word) && !pp.startsWith("ge")) issues.push(`pp '${pp}' lacks ge- (verb not inseparable-prefix, no separable prefix detected)`);
            if (!sep && isInseparable(word) && pp.startsWith("ge")) issues.push(`MANUAL: inseparable-prefix verb but pp '${pp}' has ge- (loanword like genereren or root like bellen?)`);
            if (sep && !word.startsWith(sep.prefix)) issues.push(`prefix '${sep.prefix}' from pp not at start of lemma`);
          }
        }
        if (issues.length) push("verbParadigm", { at: at(rec), word, meta, stem, notes, sep: sep?.prefix || null, issues, meaning, level });
        }
      } catch (err) {
        push("verbParadigm", { at: at(rec), word, meta, issues: [`parse error: ${err.message}`] });
      }
    }
  }

  // ---------------- adjectives
  if (pos === "adjective" && meta.startsWith("|")) {
    try {
      const am = parseAdjectiveMeta(meta);
      const comp = am.forms.find((x) => x.kind === "comparative")?.word;
      const sup = am.forms.find((x) => x.kind === "superlative")?.word;
      const issues = [];
      const regComp = word.endsWith("r") ? word + "der" : word + "er";
      const regSup = word.endsWith("s") ? word + "t" : word + "st";
      if (comp !== regComp) issues.push(`comp '${comp}' vs regular '${regComp}'`);
      if (sup !== regSup && sup !== word + "st") issues.push(`sup '${sup}' vs regular '${regSup}'`);
      if (issues.length) push("adjectiveComparison", { at: at(rec), word, meta, issues, meaning });
    } catch (err) {
      push("adjectiveComparison", { at: at(rec), word, meta, issues: [`parse error: ${err.message}`] });
    }
  }

  // ---------------- synonyms
  for (const syn of synonyms) {
    const synNorm = normalizeLexicalForm(syn);
    if (!allNorms.has(synNorm)) push("synonymMissing", { at: at(rec), word, synonym: syn, meaning });
  }

  // ---------------- gloss sanity
  const gloss = String(meaning || "");
  if (/^(plural|past|comparative|superlative|diminutive|present-tense) /iu.test(gloss)) push("gloss", { at: at(rec), word, pos, gloss, issue: "morphology-as-meaning in source gloss" });
  if (pos !== "verb" && /^to [a-z]/u.test(gloss)) push("gloss", { at: at(rec), word, pos, gloss, issue: "infinitive-style gloss on non-verb" });
  if (gloss.includes("(") && /\b(plural|past|sing|pl)\b/iu.test(gloss)) push("gloss", { at: at(rec), word, pos, gloss, issue: "grammatical annotation inside gloss" });
  if (normalizeLexicalForm(gloss) === norm) push("gloss", { at: at(rec), word, pos, gloss, issue: "gloss echoes the Dutch word" });

  // ---------------- register / CEFR watch
  if (REGISTER_WATCH.has(norm)) push("registerWatch", { at: at(rec), word, pos, level, meaning });
  if (level === "C1") push("cefrWatch", { at: at(rec), word, pos, level, meaning });

  // ---------------- proper names / capitalization / multiword
  if (category === "proper-name" || /^[A-ZÀ-Þ]/u.test(word)) push("properNames", { at: at(rec), word, pos, category, article, meaning, level });
  if (word.includes(" ")) push("multiword", { at: at(rec), word, pos, meaning, level });
}

// ---------------- homographs & duplicates
const { rows: canonical } = loadCanonicalRows(ROOT);
const groups = duplicateSourceGroups(rows);
for (const [norm, records] of groups) {
  const posSet = new Set(records.map((r) => r.row[1]));
  if (posSet.size > 1) {
    push("homographMixedPos", {
      norm,
      members: records.map((r) => ({ at: at(r), pos: r.row[1], article: r.row[3] || null, meaning: r.row[4], level: r.row[2] }))
    });
  }
  const artSet = new Set(records.filter((r) => r.row[1] === "noun").map((r) => r.row[3]).filter(Boolean));
  if (artSet.size > 1) {
    push("duplicates", { norm, issue: "article conflict within noun senses", members: records.map((r) => `${at(r)} ${r.row[3] || "-"}`) });
  }
}

// ---------------- counts summary
report.summary = Object.fromEntries(Object.entries(report.flags).map(([k, v]) => [k, v.length]));
writeFileSync(join(ROOT, "reports", "qwen-triage.json"), JSON.stringify(report, null, 2) + "\n");
console.log("Triage flag counts:");
for (const [k, v] of Object.entries(report.summary)) console.log(`  ${k.padEnd(20)} ${v}`);
