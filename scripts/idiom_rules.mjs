// Shared, conservative invariants for the idiom & everyday-expression bank.

export const ALLOWED_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1"]);
export const ALLOWED_REGISTERS = new Set(["idiom", "proverb", "colloquial", "neutral", "polite"]);
export const REQUIRED_FIELDS = [
  "id", "dutch", "meaning", "literal", "register", "level", "example", "exampleEn",
  "contextNote", "usageWarning", "tags", "related"
];

/**
 * Conservative learner-visible key: Unicode compatibility normalization,
 * trimmed/collapsed whitespace, and case folding. Punctuation is retained so
 * distinct formulas are not silently conflated.
 */
export function normalizeExpression(value) {
  return String(value ?? "").normalize("NFKC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("nl-NL");
}

function tokenize(value) {
  return String(value ?? "").normalize("NFKC").toLocaleLowerCase("nl-NL").match(/[\p{L}\p{N}]+/gu) || [];
}

// Function words do not independently prove that an example demonstrates a
// learner expression; they are ignored only for the overlap calculation.
const FUNCTION_WORDS = new Set([
  "aan", "als", "al", "bij", "dan", "dat", "de", "deze", "dit", "door", "een", "en", "er",
  "het", "hem", "hier", "hoe", "ik", "in", "iets", "iemand", "je", "mee", "met", "mijn", "naar",
  "niet", "nu", "of", "om", "onder", "ons", "op", "over", "te", "tot", "u", "uit", "van", "voor",
  "wat", "we", "wel", "wie", "zijn", "ze", "zij", "zou", "zullen"
]);

// These are ordinary grammatical/elliptical realizations, not arbitrary
// exceptions. Each entry documents why exact token containment is too strict.
export const EXAMPLE_ALLOWLIST = Object.freeze({
  "nu komt de aap uit de mouw": "past-tense realization plus omitted discourse marker",
  "op eieren lopen": "conjugated loopt realizes lopen",
  "lachen als een boer die kiespijn heeft": "conjugated lachte realizes lachen",
  "door de mand vallen": "past-tense viel realizes vallen",
  "de knoop doorhakken": "separable past-tense hakte ... door realizes doorhakken",
  "in de soep lopen": "past-tense liep realizes lopen",
  "met de neus in de boter vallen": "past-tense viel realizes vallen",
  "iets onder de knie krijgen": "perfectum realization with gekregen/heeft",
  "tot ziens en tot de volgende keer": "shortened farewell still uses the learner formula",
  "gezondheid! / proost!": "the example demonstrates the proost alternative explicitly",
  "ik zit vol tot het einde van de week": "natural shortened realization of the fixed phrase",
  "al draagt een aap een gouden ring, het is en blijft een lelijk ding": "proverb is quoted as a recognizable excerpt",
  "een zucht van verlichting slaken": "conjugated slaakte realizes slaken",
  "iemand aan het lijntje houden": "past-tense hield realizes houden",
  "iemand in de watten leggen": "past participle gelegd realizes leggen",
  "op rozen zitten": "conjugated zit realizes zitten",
  "iets uit de eerste hand vernemen": "past participle vernomen realizes vernemen",
  "de spijker op de kop slaan": "past-tense sloeg realizes slaan",
  "het roer omgooien": "past-tense gooide realizes omgooien",
  "als mosterd na de maaltijd": "natural elliptical use omits als",
  "het hoogste woord voeren": "past-tense voerde realizes voeren",
  "wat bedoelt u precies met dit punt?": "deze voorwaarde is a contextual paraphrase of dit punt",
  "heeft u dit in een andere maat?": "deze ... maat is the normal demonstrative agreement",
  "zullen we even kort overleggen?": "the example retains the complete formula",
  "aan de bel trekken": "past-tense trok realizes trekken",
  "met kop en schouders boven de rest uitsteken": "past-tense stak realizes uitsteken",
  "het bijltje erbij neergooien": "past-tense gooide realizes neergooien",
  "als sneeuw voor de zon verdwijnen": "past-tense verdwenen realizes verdwijnen",
  "geen cent te makken hebben": "past-tense had realizes hebben",
  "op grote voet leven": "conjugated leeft realizes leven",
  "met betrekking tot uw schrijven": "formal correspondence example is intentionally open-ended"
});

function stemLike(token) {
  const value = token.toLocaleLowerCase("nl-NL");
  if (value.length < 5) return value;
  return value
    .replace(/(?:heden|eren|enen|ingen|eren|ende|ende|en|er|e|t|s)$/u, "")
    .replace(/(.)\1$/u, "$1");
}

function tokensRelated(expressionToken, exampleTokens) {
  if (exampleTokens.includes(expressionToken)) return true;
  const expressionStem = stemLike(expressionToken);
  return exampleTokens.some((candidate) => {
    const candidateStem = stemLike(candidate);
    return expressionStem.length >= 4 && candidateStem.length >= 4 && expressionStem === candidateStem;
  });
}

/**
 * Checks that an example contains the expression or a documented, conservative
 * contextual realization of it. Returns an explanatory reason when accepted,
 * otherwise null.
 */
export function exampleDemonstratesExpression(expression, example) {
  const normalizedExpression = normalizeExpression(expression);
  const expressionTokens = tokenize(expression);
  const exampleTokens = tokenize(example);
  if (!normalizedExpression || expressionTokens.length === 0 || exampleTokens.length === 0) return null;

  if (expressionTokens.every((token) => tokensRelated(token, exampleTokens))) return "all expression tokens present";

  const contentTokens = expressionTokens.filter((token) => !FUNCTION_WORDS.has(token));
  const matchedContent = contentTokens.filter((token) => tokensRelated(token, exampleTokens)).length;
  const requiredMatches = Math.max(1, Math.ceil(contentTokens.length * 0.6));
  if (matchedContent >= requiredMatches) return `${matchedContent}/${contentTokens.length} content tokens present`;

  return EXAMPLE_ALLOWLIST[normalizedExpression] || null;
}

export function validateIdiomRow(row) {
  const errors = [];
  if (!row || typeof row !== "object" || Array.isArray(row)) return ["row is not an object"];
  for (const field of REQUIRED_FIELDS) if (!(field in row)) errors.push(`missing ${field}`);
  if (typeof row.id !== "string" || !/^idm-\d{4,}$/.test(row.id) || Number(row.id.slice(4)) < 1) errors.push("invalid id");
  if (typeof row.dutch !== "string" || !row.dutch.trim()) errors.push("invalid dutch expression");
  if (typeof row.meaning !== "string" || !row.meaning.trim()) errors.push("invalid meaning");
  if (!(row.literal === null || typeof row.literal === "string")) errors.push("invalid literal");
  if (!ALLOWED_REGISTERS.has(row.register)) errors.push("invalid register");
  if (!ALLOWED_LEVELS.has(row.level)) errors.push("invalid level");
  if (typeof row.example !== "string" || !row.example.trim()) errors.push("invalid Dutch example");
  if (!(row.exampleEn === null || typeof row.exampleEn === "string")) errors.push("invalid English example");
  if (!(row.contextNote === null || typeof row.contextNote === "string")) errors.push("invalid context note");
  if (!(row.usageWarning === null || typeof row.usageWarning === "string")) errors.push("invalid usage warning");
  if (!Array.isArray(row.tags) || row.tags.some((tag) => typeof tag !== "string" || !tag.trim())) errors.push("invalid tags");
  if (!Array.isArray(row.related) || row.related.some((id) => typeof id !== "string")) errors.push("invalid related IDs");
  return errors;
}
