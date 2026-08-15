# NederPath lexical provenance and editorial policy

## What is curated

Each row in `data/words_core_*.js` is a curated source item: a Dutch lemma, fixed phrase, or intentionally invariant lexical item with a POS, approximate CEFR band, learner-facing English meaning, category, optional synonyms, and optional morphology metadata. Source rows are the only rows eligible for `curated: true`; proper-name source rows remain curated and searchable but are `learnable: false` because country and city names do not take a general `de`/`het` article.

Repeated source spellings are not silently counted as new vocabulary. `scripts/lexical_data.mjs` preserves every raw source record in a `senses` array, selects one canonical learner-facing record deterministically, merges compatible levels/meanings/synonyms, and applies only the explicit decisions in `data/lexical_merge_policy.json` for ambiguous homographs. Mixed-POS spellings remain visibly typed in `senses`; the generator records derived forms that collide with another surface owner in `shadowedForms` instead of dropping them.

## Generated and reference-only data

`data/words.js` is generated from canonical curated rows, explicit morphology, and the bounded numeral expansion. Inflected forms, numerals, and ordinals are searchable reference rows with `learnable: false` unless the corresponding source item is itself curated. They have no invented frequency, example sentence, or usage claim. A collision between two legitimate analyses of one spelling shares the surface ID but retains the losing analysis as typed collision metadata on its lemma.

Phrases are source rows with `pos: "phrase"`; they are emitted once and never passed through the noun, verb, or adjective inflection engines. Multiword nouns are retained only when the source treats them as lexical nominal items and supplies a defensible invariant or exact plural policy.

## Spelling, articles, and morphology

Spelling and lexical form checks use the official Dutch spelling resource, the Woordenlijst Nederlandse Taal. Article decisions are lexical decisions, not suffix heuristics: compounds inherit the article of their Dutch head only when the compound and head analysis support that result; exceptions and proper names are recorded explicitly. Singular diminutives are `het`; plural and diminutive-plural rows are `de`. `inv` means that the source item is treated as invariant, mass, or plural-only for this learner bank; it is not a claim that no contextual variation exists.

Noun metadata accepts only `s`, `'s`, `eren`, `n`, an exact `=PLURAL`, optional `|DIMINUTIVE`, or `inv`. Verb metadata accepts either a complete five-slot paradigm (`ik|hij/zij|OVT singular|OVT plural|past participle`) or an explicit `sep=PP`. Adjectives use `|comparative|superlative` or `-` for non-comparable items. Unsupported or partial markers fail the lexical audit rather than being guessed. The source helper normalization for legacy six-argument noun calls is confined to the five affected core helpers and produces the same canonical eight-field row shape before auditing.

The morphology model is conservative: supplied forms are preserved, regular forms are not invented for verbs with no supplied paradigm, and separable prefixes are represented only through explicit `sep=...` metadata. The ANS is used for grammatical and phrase-level checks; it is not copied into learner glosses.

## CEFR and learnability

The source A1–C1 labels are pedagogical approximations for individual lexical cards, not CEFR proficiency claims. They are reviewed for obvious level errors, register, and learner suitability, but the CEFR describes communicative ability across activities rather than a universal single-word frequency scale. Derived forms remain reference-only, and rare/formal/technical words are not promoted to beginner cards merely to increase breadth.

## English glosses and editorial judgment

Glosses are concise, learner-oriented paraphrases. They may contain multiple senses when a Dutch item is genuinely polysemous, separated with semicolons where useful. Morphology descriptions belong in generated reference rows, never in curated source meanings. Synonyms are optional teaching aids, not exhaustive thesaurus output; they must be genuine, useful Dutch alternatives and may point outside the current bank when that is linguistically justified. No examples or frequencies are added without a source.

Dictionary/spelling evidence and grammar evidence are distinct from editorial judgment. The former supports spelling, article, inflection, POS, register, and usage decisions; the latter covers concise English wording, level approximation, card suitability, and whether a polysemy is useful to teach in one entry. When evidence is insufficient, the item is kept invariant, downgraded, or retired rather than given a fabricated form or meaning.

## Stable IDs and retirement

`data/word_ids.json` is an append-only ownership registry keyed by NFKC-normalized, trimmed, lower-case surface form with collapsed internal whitespace. Existing owners retain their IDs across regeneration; retired owners stay in the registry and their IDs are never recycled. New IDs are allocated above the high-water mark. The generator fails closed on malformed registries, missing historical owners, duplicate IDs, normalized collisions, unsupported metadata, and nondeterministic output.

## References used

- [Woordenlijst Nederlandse Taal](https://woordenlijst.org/zoek/) — official Dutch spelling and lexical spelling resource maintained by the Instituut voor de Nederlandse Taal for the Taalunie.
- [Algemene Nederlandse Spraakkunst (e-ANS)](https://e-ans.ivdnt.org/) — Dutch grammar, word-class, phrase, and usage reference.
- [Geïntegreerde Taalbank / WNT](https://gtb.ivdnt.org/search/?owner=wnt) — reputable historical and semantic context for marked or less-common vocabulary; not used to turn archaic forms into neutral beginner items.
- [Council of Europe CEFR level descriptions](https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions) and the [CEFR Companion Volume](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions) — framework for the caveat that CEFR bands describe proficiency, not an exact per-word frequency ranking.

## Remaining limitations

The bank has no single corpus-frequency source, dialect/register tag schema, or sense-specific CEFR dataset. Accordingly, frequency remains `null`, CEFR remains approximate, and some words share a surface row with typed senses. These are documented modeling limits, not deferred assigned lexical review: the current source rows, explicit morphology, duplicate decisions, changed-row reread, and 500-row untouched sample are reviewed and audited.
