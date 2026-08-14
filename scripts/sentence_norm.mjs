// Shared normalization, validation, and quality invariants for the NederPath sentence bank.

export const ALLOWED_SENTENCE_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1"]);

export const REQUIRED_DOMAINS = [
  "daily_life",
  "relationships_social",
  "shopping",
  "public_transport",
  "driving_cycling",
  "work_meetings",
  "education",
  "healthcare",
  "government_municipalities",
  "tax_administration",
  "banking_finance",
  "culture_history",
  "technology",
  "environment",
  "media",
  "science",
  "travel",
  "food_dining",
  "formal_correspondence",
  "housing",
  "emergencies",
  "leisure"
];

export const ALLOWED_DOMAINS = new Set([
  ...REQUIRED_DOMAINS,
  // Accepted aliases for clean domain classification
  "social", "transport", "work", "finance", "governance", "culture", "food",
  "nature", "administration", "correspondence", "community", "communication"
]);

export const REQUIRED_SENTENCE_FIELDS = [
  "id", "nl", "en", "level", "tags", "category", "targetWords", "clozeEligible", "provenance", "curated"
];

/**
 * Normalized key for sentence registry: Unicode NFKC, trimmed, single whitespace,
 * lowercase nl-NL.
 */
export function normalizeSentenceKey(value) {
  return String(value ?? "").normalize("NFKC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("nl-NL");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Checks if a candidate target word/phrase occurs literally in the Dutch surface sentence.
 */
export function targetOccursInSurface(target, sentenceNl) {
  if (typeof target !== "string" || !target.trim() || typeof sentenceNl !== "string" || !sentenceNl.trim()) {
    return false;
  }
  const normSentence = sentenceNl.normalize("NFKC").toLocaleLowerCase("nl-NL");
  const normTarget = target.normalize("NFKC").trim().toLocaleLowerCase("nl-NL");
  
  // Exact substring check
  if (normSentence.includes(normTarget)) return true;

  // Boundary token regex check
  const escaped = escapeRegExp(normTarget);
  const regex = new RegExp(`(^|[^\\p{L}\\p{M}\\p{N}_])(${escaped})(?=$|[^\\p{L}\\p{M}\\p{N}_])`, "iu");
  return regex.test(normSentence);
}

/**
 * Validates an authored or generated sentence record against schema invariants.
 * Returns an array of error messages (empty when valid).
 */
export function validateSentenceRow(row) {
  const errors = [];
  if (!row || typeof row !== "object" || Array.isArray(row)) return ["row is not an object"];

  for (const field of REQUIRED_SENTENCE_FIELDS) {
    if (!(field in row)) errors.push(`missing field '${field}'`);
  }

  if (typeof row.id !== "string" || !/^snt-\d{4,}$/.test(row.id)) errors.push(`invalid sentence id '${row.id}'`);
  if (typeof row.nl !== "string" || !row.nl.trim()) errors.push("invalid Dutch sentence 'nl'");
  if (typeof row.en !== "string" || !row.en.trim()) errors.push("invalid English translation 'en'");
  if (!ALLOWED_SENTENCE_LEVELS.has(row.level)) errors.push(`invalid CEFR level '${row.level}'`);
  if (!ALLOWED_DOMAINS.has(row.category)) errors.push(`invalid category domain '${row.category}'`);
  if (!Array.isArray(row.tags) || row.tags.length === 0 || row.tags.some((t) => typeof t !== "string" || !t.trim())) {
    errors.push("tags must be a non-empty array of strings");
  }
  if (row.provenance !== "curated" && row.provenance !== "generated") {
    errors.push(`invalid provenance '${row.provenance}' (must be 'curated' or 'generated')`);
  }
  if (typeof row.curated !== "boolean") errors.push("curated must be boolean");
  if (row.provenance === "curated" && row.curated !== true) {
    errors.push("curated provenance must have curated: true");
  }
  if (row.provenance === "generated" && row.curated !== false) {
    errors.push("generated provenance must have curated: false");
  }
  if (typeof row.clozeEligible !== "boolean") errors.push("clozeEligible must be boolean");

  if (!Array.isArray(row.targetWords) || row.targetWords.length === 0) {
    errors.push("targetWords must be a non-empty array of strings");
  } else {
    for (const target of row.targetWords) {
      if (typeof target !== "string" || !target.trim()) {
        errors.push(`invalid target word in targetWords: '${target}'`);
      } else if (!targetOccursInSurface(target, row.nl)) {
        errors.push(`targetWord '${target}' does not occur in Dutch surface text: "${row.nl}"`);
      }
    }
  }

  return errors;
}

/**
 * Extracts 3-grams of content words to detect Cartesian skeleton repetition.
 */
export function extractContentTrigrams(text) {
  const tokens = String(text || "")
    .normalize("NFKC")
    .toLocaleLowerCase("nl-NL")
    .match(/[\p{L}\p{N}]+/gu) || [];
  const trigrams = [];
  for (let i = 0; i <= tokens.length - 3; i++) {
    trigrams.push(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
  }
  return trigrams;
}
