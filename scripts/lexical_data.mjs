// Shared lexical source loader and deterministic normalization helpers.
// Keep this module side-effect free so audit and allocator tests can import it.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const CORE_FILE_RE = /^words_core_.*\.js$/;
export const ALLOWED_POS = new Set([
  "noun", "verb", "adjective", "adverb", "pronoun", "determiner",
  "preposition", "conjunction", "interjection", "numeral", "phrase", "particle"
]);
export const ALLOWED_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1"]);

/**
 * Registry and source ownership use exactly this normalization function.
 * NFKC removes compatibility-form collisions; whitespace folding makes the
 * policy explicit; locale-independent lower-casing keeps CI deterministic.
 */
export function normalizeLexicalForm(raw) {
  return String(raw ?? "")
    .normalize("NFKC")
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();
}

export function parseWordCoreFile(root, file) {
  const source = readFileSync(join(root, "data", file), "utf8");
  const moduleValue = { exports: {} };
  const exported = new Function("module", "exports", `${source}\nreturn module.exports;`)(moduleValue, moduleValue.exports);
  if (!exported || !Array.isArray(exported.WORDS)) {
    throw new Error(`${file} must export { WORDS: [] }`);
  }
  return exported.WORDS;
}

export function loadCuratedRows(root = ROOT) {
  const files = readdirSync(join(root, "data")).filter((file) => CORE_FILE_RE.test(file)).sort();
  const rows = [];
  for (const file of files) {
    const words = parseWordCoreFile(root, file);
    for (const [index, row] of words.entries()) {
      rows.push({ file, index, row });
    }
  }
  return { files, rows };
}

function readMergePolicy(root) {
  const file = join(root, "data", "lexical_merge_policy.json");
  if (!existsSync(file)) return { version: 1, primary: {}, article: {} };
  const policy = JSON.parse(readFileSync(file, "utf8"));
  const isRecord = (value) => value && typeof value === "object" && !Array.isArray(value);
  if (!policy || policy.version !== 1 || !isRecord(policy.primary) || !isRecord(policy.article)) {
    throw new Error("data/lexical_merge_policy.json has an invalid schema");
  }
  return policy;
}

function sourceRecordKey(record) {
  return `${record.file}:${record.index}`;
}

function resolvePrimarySelector(records, selector) {
  if (typeof selector !== "string" || !selector) return null;
  const exact = records.find((record) => sourceRecordKey(record) === selector);
  if (exact) return exact;
  const sameFile = records.filter((record) => record.file === selector);
  return sameFile.length === 1 ? sameFile[0] : null;
}

function metaQuality(pos, meta, word) {
  if (!meta) return 0;
  try {
    if (pos === "noun") return parseNounMeta(word, meta).plural || parseNounMeta(word, meta).diminutive ? 3 : 1;
    if (pos === "verb") return meta.startsWith("sep=") ? 2 : (meta.includes("|") ? 3 : 1);
    if (pos === "adjective") return meta.startsWith("|") ? 3 : meta === "-" ? 2 : 1;
  } catch {
    return -1;
  }
  return 0;
}

/**
 * Merge repeated source rows into one lexical owner while preserving every
 * source sense in an explicit `senses` array. The learner-facing canonical
 * fields are drawn only from the selected primary POS; unrelated homograph
 * senses remain represented in `senses` and in their explicit derived forms.
 */
export function loadCanonicalRows(root = ROOT) {
  const { files, rows } = loadCuratedRows(root);
  const groups = new Map();
  for (const record of rows) {
    const norm = normalizeLexicalForm(record.row[0]);
    if (!groups.has(norm)) groups.set(norm, []);
    groups.get(norm).push(record);
  }
  const policy = readMergePolicy(root);

  // Policy entries are executable editorial decisions. Prefer stable file
  // selectors; legacy file:index selectors remain accepted when still exact.
  // Any missing or ambiguous selector fails closed instead of silently falling
  // back to an inferred owner.
  for (const [norm, selector] of Object.entries(policy.primary)) {
    if (norm !== normalizeLexicalForm(norm) || typeof selector !== "string") {
      throw new Error(`Invalid primary merge-policy entry '${norm}' -> '${selector}'`);
    }
    const group = groups.get(norm);
    if (!group) throw new Error(`Primary merge-policy entry '${norm}' has no source group`);
    if (!resolvePrimarySelector(group, selector)) {
      throw new Error(`Primary merge-policy entry '${norm}' has missing or ambiguous selector '${selector}'`);
    }
  }
  for (const [norm, article] of Object.entries(policy.article)) {
    if (norm !== normalizeLexicalForm(norm) || !["de", "het"].includes(article)) {
      throw new Error(`Invalid article merge-policy entry '${norm}' -> '${article}'`);
    }
    const group = groups.get(norm);
    if (!group?.some((record) => record.row[1] === "noun")) {
      throw new Error(`Article merge-policy entry '${norm}' has no noun source sense`);
    }
  }

  const canonical = [];
  for (const [norm, records] of groups) {
    const override = policy.primary[norm];
    let primary = override ? resolvePrimarySelector(records, override) : null;
    if (!primary) {
      const posSet = new Set(records.map((record) => record.row[1]));
      const preferredPos = posSet.has("noun") ? "noun" : posSet.has("verb") ? "verb" : records[0].row[1];
      const candidates = records.filter((record) => record.row[1] === preferredPos);
      primary = candidates.slice().sort((a, b) => {
        const score = (record) => {
          const fields = sourceFields(record);
          return metaQuality(fields.pos, fields.meta, fields.word) * 10 - files.indexOf(record.file);
        };
        return score(b) - score(a) || a.file.localeCompare(b.file) || a.index - b.index;
      })[0];
    }
    const primaryFields = sourceFields(primary);
    const samePos = records.filter((record) => record.row[1] === primaryFields.pos);
    const articleCounts = new Map();
    for (const record of samePos) {
      const article = record.row[3] || "";
      articleCounts.set(article, (articleCounts.get(article) || 0) + 1);
    }
    const articleOverride = policy.article[norm];
    const mergedArticle = primaryFields.pos === "noun"
      ? articleOverride || [...articleCounts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || primaryFields.article
      : "";
    const bestMeta = samePos.slice().sort((a, b) => {
      const aFields = sourceFields(a), bFields = sourceFields(b);
      return metaQuality(bFields.pos, bFields.meta, bFields.word) - metaQuality(aFields.pos, aFields.meta, aFields.word);
    })[0];
    const mergedMeta = bestMeta ? sourceFields(bestMeta).meta : primaryFields.meta;

    // Do not leak noun/verb/adjective homograph meanings into the selected
    // learner-facing POS. Same-POS duplicate senses may still be combined.
    const meanings = [...new Set(samePos
      .flatMap((record) => String(record.row[4]).split(/\s*;\s*/u))
      .map((meaning) => meaning.trim())
      .filter(Boolean))];
    const synonyms = [...new Set(samePos.flatMap((record) => sourceFields(record).synonyms))];
    const levelRank = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
    const mergedLevel = samePos.slice().sort((a, b) => (levelRank[a.row[2]] || 99) - (levelRank[b.row[2]] || 99))[0].row[2];
    const senses = records.map((record) => {
      const fields = sourceFields(record);
      return { source: sourceRecordKey(record), ...fields };
    });
    canonical.push({
      file: primary.file,
      index: primary.index,
      row: [primaryFields.word, primaryFields.pos, mergedLevel, mergedArticle, meanings.join("; "), primaryFields.category, synonyms, mergedMeta],
      senses
    });
  }
  return { files, rows: canonical };
}

export function loadGeneratedWords(root = ROOT) {
  const source = readFileSync(join(root, "data", "words.js"), "utf8");
  const words = new Function("globalThis", `${source}\nreturn globalThis.NP_WORDS;`)({});
  if (!Array.isArray(words)) throw new Error("data/words.js must expose NP_WORDS as an array");
  return words;
}

export function asSynonymArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value ?? "").split(";").map((item) => item.trim()).filter(Boolean);
}

export function sourceFields(record) {
  const [word, pos, level, article, meaning, category, synonyms, meta = ""] = record.row;
  let normalizedSynonyms = asSynonymArray(synonyms);
  let normalizedMeta = String(meta ?? "");
  // The compact A/D helpers historically used their final argument for
  // synonyms, while noun/verb helpers use it for morphology. Normalize that
  // legacy encoding at the single source boundary so it cannot be silently
  // dropped by the generator.
  if (pos === "adverb" && !normalizedSynonyms.length && normalizedMeta) {
    normalizedSynonyms = asSynonymArray(normalizedMeta);
    normalizedMeta = "";
  }
  if (pos === "adjective" && !normalizedSynonyms.length && normalizedMeta && normalizedMeta !== "-" && !normalizedMeta.startsWith("|")) {
    normalizedSynonyms = asSynonymArray(normalizedMeta);
    normalizedMeta = "";
  }
  return { word, pos, level, article, meaning, category, synonyms: normalizedSynonyms, meta: normalizedMeta };
}

export function duplicateSourceGroups(rows) {
  const groups = new Map();
  for (const record of rows) {
    const norm = normalizeLexicalForm(record.row[0]);
    if (!groups.has(norm)) groups.set(norm, []);
    groups.get(norm).push(record);
  }
  return new Map([...groups].filter(([, records]) => records.length > 1));
}

export function parseNounMeta(word, rawMeta) {
  const meta = String(rawMeta ?? "");
  const parts = meta.split("|");
  if (parts.length > 2) throw new Error(`Noun metadata has too many fields: '${meta}' for '${word}'`);
  const [pluralSpec = "", diminutiveSpec = ""] = parts;
  let plural = null;
  if (pluralSpec === "s") plural = `${word}s`;
  else if (pluralSpec === "'s") plural = `${word}'s`;
  else if (pluralSpec === "eren") plural = `${word}eren`;
  else if (pluralSpec.startsWith("=") && pluralSpec.length > 1) plural = pluralSpec.slice(1);
  else if (pluralSpec === "" || pluralSpec === "inv") plural = null;
  else throw new Error(`Unsupported noun metadata '${meta}' for '${word}'`);

  const diminutive = diminutiveSpec || null;
  return {
    plural,
    diminutive,
    diminutivePlural: diminutive ? `${diminutive}s` : null
  };
}

export function parseVerbMeta(rawMeta) {
  const meta = String(rawMeta ?? "");
  if (!meta) return { kind: "none", forms: [] };
  if (meta === "sep") throw new Error("'sep' is incomplete; supply sep=<past participle>");
  if (meta.startsWith("sep=")) {
    const participle = meta.slice(4).trim();
    if (!participle || /\s/u.test(participle)) throw new Error(`Invalid separable participle metadata '${meta}'`);
    return { kind: "separable-participle", forms: [{ word: participle, kind: "past-participle" }] };
  }
  const parts = meta.split("|");
  if (parts.length !== 5 || parts.some((part) => !part || /\s/u.test(part))) {
    throw new Error(`Verb metadata must contain five compact forms: '${meta}'`);
  }
  return {
    kind: "paradigm",
    forms: [
      { word: parts[0], kind: "ik-form" },
      { word: parts[1], kind: "hij-form" },
      { word: parts[2], kind: "past-singular" },
      { word: parts[3], kind: "past-plural" },
      ...(parts[4] === "-" ? [] : [{ word: parts[4], kind: "past-participle" }])
    ]
  };
}

export function parseAdjectiveMeta(rawMeta) {
  const meta = String(rawMeta ?? "");
  if (!meta || meta === "-") return { kind: meta === "-" ? "non-comparable" : "none", forms: [] };
  if (!meta.startsWith("|")) throw new Error(`Unsupported adjective metadata '${meta}'`);
  const parts = meta.split("|");
  if (parts.length !== 3 || !parts[1] || !parts[2]) throw new Error(`Adjective metadata must be |comparative|superlative: '${meta}'`);
  return { kind: "comparison", forms: [{ word: parts[1], kind: "comparative" }, { word: parts[2], kind: "superlative" }] };
}
