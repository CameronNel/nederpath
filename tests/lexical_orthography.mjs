import assert from "node:assert/strict";
import { loadCuratedRows, loadGeneratedWords, normalizeLexicalForm, sourceFields } from "../scripts/lexical_data.mjs";

const apostrophePluralLemmas = [
  "auto", "opa", "oma", "collega", "pyjama", "paraplu", "foto", "radio",
  "diploma", "metro", "euro", "lesauto", "zebra", "agenda", "tandpasta",
  "baby", "opera", "pinda", "vla", "tosti", "pasta", "menu", "cola",
  "cappuccino", "espresso", "whisky", "sla", "paprika", "kiwi", "mango",
  "avocado"
];

const { rows: sourceRows } = loadCuratedRows();
const words = loadGeneratedWords();
for (const lemma of apostrophePluralLemmas) {
  const relevantSources = sourceRows.filter((record) => {
    const fields = sourceFields(record);
    return fields.pos === "noun" && normalizeLexicalForm(fields.word) === normalizeLexicalForm(lemma);
  });
  assert.ok(relevantSources.length > 0, `${lemma}: apostrophe fixture has no source noun`);
  assert.ok(relevantSources.every((record) => sourceFields(record).meta !== "s"), `${lemma}: plain-s source metadata survived`);

  const expected = `${lemma}'s`;
  const good = words.find((word) => word.lemma === lemma && word.pos === "noun" && word.inflectionType === "plural" && word.word === expected);
  const bad = words.find((word) => word.lemma === lemma && word.pos === "noun" && word.inflectionType === "plural" && word.word === `${lemma}s`);
  assert.ok(good, `${lemma}: missing correct plural ${expected}`);
  assert.equal(bad, undefined, `${lemma}: invalid plain-s plural ${lemma}s is still generated`);
}

console.log(`Lexical orthography tests passed: ${apostrophePluralLemmas.length} reviewed long-vowel noun plurals.`);
