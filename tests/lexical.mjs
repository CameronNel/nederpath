import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createIdAllocator, validateRegistry } from "../scripts/id_allocator.mjs";
import {
  ROOT, duplicateSourceGroups, loadCanonicalRows, loadCuratedRows, loadGeneratedWords,
  normalizeLexicalForm, parseAdjectiveMeta, parseNounMeta, parseVerbMeta, sourceFields
} from "../scripts/lexical_data.mjs";
import { metricReport } from "../scripts/lexical_audit.mjs";

const fixture = JSON.parse(readFileSync(new URL("./fixtures/lexical_gold.json", import.meta.url), "utf8"));
const { rows: sourceRows, files } = loadCuratedRows(ROOT);
const canonicalRows = loadCanonicalRows(ROOT).rows;
const words = loadGeneratedWords(ROOT);
const metrics = metricReport();

assert.ok(files.length >= 25, `expected all core files, inspected ${files.length}`);
assert.ok(sourceRows.length >= 6000, `source audit is unexpectedly vacuous: ${sourceRows.length}`);
assert.ok(canonicalRows.length >= 4000, `canonical audit is unexpectedly vacuous: ${canonicalRows.length}`);
assert.equal(metrics.sourceIssues.length, 0, JSON.stringify(metrics.sourceIssues.slice(0, 5), null, 2));
assert.equal(metrics.mergeDecisionCoverage.unmodeledGroups, 0);
assert.equal(metrics.generatedSourceCollisionCount, 0);
assert.equal(metrics.duplicateGeneratedForms, 0);
assert.equal(metrics.duplicateGeneratedIds, 0);
assert.equal(metrics.multiwordRows.verb || 0, 0, "multiword verbs must be phrases or split into a lemma plus phrase");
assert.ok(metrics.properNameRows >= 10, "proper-name audit did not inspect the expected place/country rows");
assert.ok(words.filter((word) => word.category === "proper-name").every((word) => !word.learnable), "proper names must not become article-bearing learner cards");
assert.ok(metrics.shadowedExplicitForms > 0, "homograph collision coverage is vacuous");

const sourceNorms = new Map();
for (const record of sourceRows) {
  const fields = sourceFields(record);
  assert.equal(record.row.length, 8, `${record.file}:${record.index} schema`);
  assert.ok(fields.word && fields.meaning && fields.category, `${record.file}:${record.index} missing lexical text`);
  assert.ok(!/\b(?:dup guard|placeholder|dummy|generated row|test word)\b/i.test(fields.meaning), `${record.file}:${record.index} has padding gloss`);
  assert.ok(!/\b(?:plural of|past participle of|comparative of|superlative of|present-tense)\b/i.test(fields.meaning), `${record.file}:${record.index} has a morphology annotation as meaning`);
  assert.ok(!fields.synonyms.some((synonym) => /^(?:s|inv|n|'s|pl|es|=.+)$/u.test(synonym)), `${record.file}:${record.index} has legacy morphology in synonym slot`);
  if (fields.pos === "noun") parseNounMeta(fields.word, fields.meta);
  if (fields.pos === "verb") parseVerbMeta(fields.meta);
  if (fields.pos === "adjective") parseAdjectiveMeta(fields.meta);
  const norm = normalizeLexicalForm(fields.word);
  sourceNorms.set(norm, (sourceNorms.get(norm) || 0) + 1);
}

const canonicalNorms = new Set(canonicalRows.map((record) => normalizeLexicalForm(record.row[0])));
assert.equal(canonicalNorms.size, canonicalRows.length);
assert.equal(canonicalRows.length, words.filter((word) => word.curated).length);
assert.equal(sourceNorms.size, canonicalRows.length);

const idRegistry = JSON.parse(readFileSync(new URL("../data/word_ids.json", import.meta.url), "utf8"));
const validated = validateRegistry(idRegistry);
const byWord = new Map(words.map((word) => [normalizeLexicalForm(word.word), word]));
const generatedFormKeys = new Set(words.map((word) => `${normalizeLexicalForm(word.word)}|${word.lemma}|${word.pos}|${word.inflectionType}`));
for (const word of words) {
  const norm = normalizeLexicalForm(word.word);
  assert.equal(validated.entries.get(norm), word.id, `registry ownership drift for ${word.word}`);
  assert.equal(validated.owners.get(word.id), norm, `ID owner drift for ${word.id}`);
  assert.ok(!word.learnable || word.curated, `derived row became learnable: ${word.word}`);
  if (word.inflectionType === "plural" || word.inflectionType === "diminutive-plural") assert.equal(word.article, "de", word.word);
  if (word.inflectionType === "diminutive") assert.equal(word.article, "het", word.word);
  assert.equal(word.frequency, null, `unsupported frequency for ${word.word}`);
  assert.equal(word.example, null, `unsupported example for ${word.word}`);
  assert.equal(word.exampleEn, null, `unsupported translated example for ${word.word}`);
  for (const collision of word.shadowedForms || []) {
    assert.ok(collision.word && collision.lemma && collision.pos && collision.inflectionType && collision.representedBy, `malformed shadowed form on ${word.word}`);
  }
}

for (const [word, expectedId] of Object.entries(fixture.stableIds)) assert.equal(byWord.get(word)?.id, expectedId, `historical ID changed for ${word}`);

let nounChecks = 0;
for (const fixtureRow of fixture.nouns) {
  const base = byWord.get(fixtureRow.lemma);
  assert.ok(base?.learnable && base.pos === "noun", `missing noun fixture ${fixtureRow.lemma}`);
  assert.equal(base.article, fixtureRow.article, fixtureRow.lemma);
  if (!fixtureRow.plural) {
    nounChecks++;
    continue;
  }
  const plural = [...byWord.values()].find((word) => word.lemma === fixtureRow.lemma && word.inflectionType === "plural" && word.word === fixtureRow.plural);
  const shadowedPlural = base.shadowedForms?.find((form) => form.lemma === fixtureRow.lemma && form.inflectionType === "plural" && form.word === fixtureRow.plural);
  assert.ok((plural && !plural.learnable && plural.article === "de") || (shadowedPlural && shadowedPlural.article === "de"), `bad plural fixture ${fixtureRow.lemma} -> ${fixtureRow.plural}`);
  nounChecks++;
}

let verbChecks = 0;
for (const fixtureRow of fixture.verbs) {
  const base = byWord.get(fixtureRow.lemma);
  assert.ok(base?.learnable && base.pos === "verb", `missing verb fixture ${fixtureRow.lemma}`);
  for (const [kind, form] of Object.entries(fixtureRow.forms)) {
    const row = [...byWord.values()].find((word) => word.lemma === fixtureRow.lemma && word.inflectionType === kind && word.word === form);
    const shadowed = base.shadowedForms?.find((candidate) => candidate.lemma === fixtureRow.lemma && candidate.inflectionType === kind && candidate.word === form);
    assert.ok((row && !row.learnable && row.pos === "verb") || (shadowed && shadowed.pos === "verb"), `bad verb fixture ${fixtureRow.lemma} ${kind} -> ${form}`);
  }
  verbChecks++;
}

// Every explicit source paradigm form must remain represented. A surface form
// can be shared by another curated lemma (for example noun "was" versus the
// past tense of "zijn"); those cases are retained in shadowedForms instead of
// being silently discarded by the unique-surface word bank.
let explicitFormsChecked = 0;
for (const record of sourceRows) {
  const fields = sourceFields(record);
  const forms = fields.pos === "noun"
    ? (() => { const parsed = parseNounMeta(fields.word, fields.meta); return [
      parsed.plural && [parsed.plural, "plural"],
      parsed.diminutive && [parsed.diminutive, "diminutive"],
      parsed.diminutive && [parsed.diminutive + "s", "diminutive-plural"]
    ].filter(Boolean); })()
    : fields.pos === "verb"
      ? parseVerbMeta(fields.meta).forms.map((form) => [form.word, form.kind])
      : fields.pos === "adjective"
        ? parseAdjectiveMeta(fields.meta).forms.map((form) => [form.word, form.kind])
        : [];
  for (const [form, kind] of forms) {
    const key = `${normalizeLexicalForm(form)}|${fields.word}|${fields.pos}|${kind}`;
    const base = byWord.get(normalizeLexicalForm(fields.word));
    const retained = generatedFormKeys.has(key) || base?.shadowedForms?.some((candidate) =>
      `${normalizeLexicalForm(candidate.word)}|${candidate.lemma}|${candidate.pos}|${candidate.inflectionType}` === key);
    assert.ok(retained, `explicit form was lost: ${record.file}:${record.index} ${fields.word} -> ${form} (${kind})`);
    explicitFormsChecked++;
  }
}

let adjectiveChecks = 0;
for (const fixtureRow of fixture.adjectives) {
  const base = byWord.get(fixtureRow.lemma);
  assert.ok(base?.learnable && base.pos === "adjective", `missing adjective fixture ${fixtureRow.lemma}`);
  for (const [kind, form] of Object.entries(fixtureRow.forms)) {
    const row = [...byWord.values()].find((word) => word.lemma === fixtureRow.lemma && word.inflectionType === kind && word.word === form);
    assert.ok(row && !row.learnable && row.pos === "adjective", `bad adjective fixture ${fixtureRow.lemma} ${kind} -> ${form}`);
  }
  adjectiveChecks++;
}

let phraseChecks = 0;
for (const phrase of fixture.phrases) {
  const row = byWord.get(normalizeLexicalForm(phrase));
  assert.ok(row?.pos === "phrase" && row.inflectionType === "phrase" && row.learnable, `phrase classification failed for ${phrase}`);
  assert.equal([...byWord.values()].filter((word) => word.lemma === phrase).length, 1, `phrase entered morphology: ${phrase}`);
  phraseChecks++;
}

// Synthetic allocator adversarial checks: a retired ID remains owned and is
// never reused, while normalization collisions resolve to one owner.
const synthetic = validateRegistry({ version: 1, highWaterMark: 3, entries: { alpha: "nl-00001", retired: "nl-00003" } });
const allocator = createIdAllocator(synthetic);
assert.equal(allocator.assignId(" ALPHA "), "nl-00001");
assert.equal(allocator.assignId("beta"), "nl-00004");
assert.equal(allocator.ownerOf("nl-00003"), "retired");
assert.equal(normalizeLexicalForm(" Ｂｅｔａ  "), "beta");

const duplicateGroups = duplicateSourceGroups(sourceRows);
assert.ok(duplicateGroups.size >= 1000, "duplicate-source audit did not inspect the expected bank");
for (const [norm, records] of duplicateGroups) {
  const canonical = canonicalRows.find((record) => normalizeLexicalForm(record.row[0]) === norm);
  assert.ok(canonical?.senses?.length === records.length, `merged sense model lost rows for ${norm}`);
}

console.log(`Lexical tests passed: ${sourceRows.length} raw source rows, ${canonicalRows.length} canonical forms, ${words.length} generated rows, ${duplicateGroups.size} modeled duplicate groups, ${explicitFormsChecked} explicit forms retained, ${nounChecks} noun fixtures, ${verbChecks} verb fixtures, ${adjectiveChecks} adjective fixtures, ${phraseChecks} phrase fixtures.`);
