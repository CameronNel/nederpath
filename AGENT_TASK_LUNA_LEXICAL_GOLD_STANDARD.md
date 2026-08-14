# Luna Extra High Task Contract — Lexical Gold Standard & Independent QA

> **Repository:** `CameronNel/nederpath`  
> **Role:** Luna on Extra High  
> **Mission:** turn NederPath's vocabulary/lexical layer into a defensible Dutch-learning gold standard while independently stress-testing the lexical pipeline.  
> **Completion rule:** **Do not claim completion until every required checkbox below is checked and backed by evidence, followed by two separate full verification passes.** A large row count, a green test suite, or “looks plausible” is not proof.

## How to use this file

- [ ] Read this entire file before editing anything.
- [ ] Update this checklist continuously as work is completed.
- [ ] Tick a box only after implementation **and** verification.
- [ ] Add concise evidence beneath each major section: exact commands, measured counts, file paths, commit SHAs, or audit results.
- [ ] Untick any item that becomes invalid after later edits.
- [ ] Never convert uncertainty into fabricated lexical data. If something cannot be justified, remove/null/downgrade the claim.
- [ ] Perform Verification Pass 1 and then a separate hostile/fresh Verification Pass 2 before the final completion box.
- [ ] Do not merge your own PR.

---

## 0. Repository and concurrency safety

- [ ] Fetch latest `origin/master` before editing.
- [ ] Record starting `origin/master` SHA here: `____________________________`.
- [ ] Last known master when this contract was created was `c9a53b2beea33f67c96cd96ae3d972c8d45271c2`; if master is newer, use the newer master. Never reset backwards.
- [ ] Create a fresh branch/worktree from latest master named `task/007-lexical-gold-standard`.
- [ ] Never rewrite master history.
- [ ] Preserve every established historical word ID unless an explicit compatibility migration is genuinely required and documented.
- [ ] Never recycle retired word IDs.
- [ ] Do not merge your own PR.

### Other agents are concurrently working

Grok owns grammar/comprehension. Gemini owns idioms/sentences/runtime integration. Avoid their files.

### Do NOT modify unless absolutely unavoidable

- [ ] `scripts/generate_grammar.mjs`
- [ ] `data/grammar.js`
- [ ] `scripts/generate_comprehension.mjs`
- [ ] `data/comprehension.js`
- [ ] `tests/comprehension.mjs`
- [ ] Idiom files/registries/generator.
- [ ] Sentence files/registries/generator.
- [ ] `js/app.js`.
- [ ] `js/srs.js`.
- [ ] `js/store.js`.
- [ ] `scripts/audit.mjs`.
- [ ] `tests/browser.mjs`.
- [ ] `tests/regression.mjs`.
- [ ] `README.md`.
- [ ] `package.json`.
- [ ] Obvious files newly created by Grok/Gemini for their owned work.

### This task owns

- [ ] `data/words_core_*.js`.
- [ ] `scripts/generate_words.mjs`.
- [ ] `data/word_ids.json`.
- [ ] `data/words.js` generated artifact.
- [ ] New lexical-specific tests, fixtures, audit scripts, reports, and provenance docs.
- [ ] `js/learning.js` **only if a lexical helper bug cannot be fixed correctly in the lexical pipeline without touching it**; minimize overlap and document any such change prominently.

---

## 1. Establish a measured lexical baseline before editing

Do not trust existing comments or marketing descriptions. Measure the real current bank.

- [ ] Count total generated rows.
- [ ] Count curated source headwords/phrases.
- [ ] Count learnable rows.
- [ ] Count derived/reference-only rows.
- [ ] Count nouns, verbs, adjectives, adverbs, function words, phrases, numerals, and other POS categories.
- [ ] Count CEFR distribution A1/A2/B1/B2/C1.
- [ ] Count noun article distribution (`de`/`het`).
- [ ] Count entries with synonyms.
- [ ] Count entries with explicit noun morphology metadata.
- [ ] Count entries with explicit verb paradigms/separable metadata.
- [ ] Count entries with adjective comparison metadata.
- [ ] Measure duplicate normalized spellings and duplicate IDs.
- [ ] Measure duplicate/near-duplicate English glosses.
- [ ] Detect suspicious repeated gloss templates.
- [ ] Detect suspicious or malformed Dutch strings.
- [ ] Detect English glosses that contain grammatical annotations masquerading as meanings.
- [ ] Detect entries whose POS/meaning/article/meta combinations are internally inconsistent.
- [ ] Detect likely proper nouns accidentally treated as general vocabulary.
- [ ] Detect multiword lexical items incorrectly classified as single-word verbs/nouns.
- [ ] Detect obvious generated-looking source rows in `words_core_*` rather than merely in derived output.
- [ ] Store a machine-readable baseline report/fixture where useful.

**Baseline evidence:**

`________________________________________________________________________`

---

## 2. Audit EVERY curated source row for lexical truthfulness

This is the bulk of the work. Do not sample and pretend the whole source was reviewed.

For every curated source row in every `data/words_core_*.js` file:

- [ ] Dutch spelling is correct.
- [ ] Lemma/headword form is correct.
- [ ] POS is defensible.
- [ ] CEFR level is plausible and not obviously absurd.
- [ ] English meaning is accurate, concise, and actually corresponds to the Dutch item.
- [ ] Polysemous entries are not flattened into misleading single meanings where the existing gloss claims multiple senses.
- [ ] Noun article is correct.
- [ ] Compound nouns use the correct article.
- [ ] Plurale-tantum / mass / normally uncountable nouns are not given misleading ordinary plural metadata.
- [ ] Diminutive metadata is only present where the generated form is valid and useful.
- [ ] Verb separability is correctly represented.
- [ ] Irregular principal parts are correct where explicitly supplied.
- [ ] Auxiliary-sensitive verbs are not represented in a way that teaches a false simple paradigm.
- [ ] Reflexive verbs/uses are represented truthfully.
- [ ] Adjective comparison metadata is correct where supplied.
- [ ] Indeclinable/non-comparable adjectives are not forced through regular comparison.
- [ ] Synonyms are genuine useful synonyms rather than loosely related words.
- [ ] Synonyms do not point to nonexistent/garbage lexical items without reason.
- [ ] Phrases are classified as phrases rather than fed into single-word morphology.
- [ ] Register labels embedded in meanings are accurate when present.
- [ ] Vulgar, archaic, regional, formal, technical, or dated vocabulary is not presented as neutral everyday Dutch without qualification.
- [ ] False friends and easily confused items have non-misleading English glosses.
- [ ] No source row exists merely to inflate inventory size.

Where verification is needed, use authoritative or high-quality Dutch linguistic references such as Taalunie/Woordenlijst, ANS, reputable Dutch dictionaries, corpus evidence, or other serious linguistic sources. Do not copy copyrighted dictionary definitions verbatim; write original concise glosses.

If a row cannot be confidently verified:

- [ ] Do not invent certainty.
- [ ] Correct it if evidence supports a correction.
- [ ] Otherwise remove/retire it conservatively while preserving historical ID ownership.

**Full-row audit evidence:**

`________________________________________________________________________`

---

## 3. Noun article and morphology gold-standard pass

Perform a dedicated pass independent from the general row audit.

- [ ] Review every learnable noun article (`de`/`het`).
- [ ] Verify all diminutives are `het` in singular generated output.
- [ ] Verify all plurals/diminutive plurals are `de` in generated output.
- [ ] Verify explicit irregular plurals.
- [ ] Verify `-eren` plurals only where genuine.
- [ ] Verify apostrophe plurals where applicable.
- [ ] Verify plural forms with vowel/consonant spelling changes.
- [ ] Verify compounds inherit the correct article from the head noun.
- [ ] Flag nouns with meaningful article variation rather than falsely presenting one article as universally exclusive.
- [ ] Do not encode article “rules” from suffix heuristics as source truth when lexical evidence contradicts them.
- [ ] Add adversarial fixtures for historically error-prone article/morphology cases.

**Noun evidence:**

`________________________________________________________________________`

---

## 4. Verb paradigm and separability gold-standard pass

- [ ] Review every curated verb lemma.
- [ ] Review every explicit `ik` form.
- [ ] Review every explicit `hij/zij` form.
- [ ] Review every explicit OVT singular form.
- [ ] Review every explicit OVT plural form.
- [ ] Review every explicit past participle.
- [ ] Verify separable-prefix metadata.
- [ ] Verify inseparable verbs are not misclassified as separable.
- [ ] Verify participles of separable verbs contain the correct `ge` placement where appropriate.
- [ ] Verify participles of inseparable-prefix verbs correctly omit `ge` where appropriate.
- [ ] Verify strong/irregular verbs do not contain regularized invented forms.
- [ ] Verify stems involving `v/f`, `z/s`, long-vowel spelling, doubled consonants, and final `t/d` are correct.
- [ ] Verify verbs whose common learner use is reflexive or prepositional are not glossed misleadingly.
- [ ] Build a lexical gold fixture containing a substantial representative set of difficult Dutch verbs.
- [ ] Add tests that fail if those verified paradigms regress.

**Verb evidence:**

`________________________________________________________________________`

---

## 5. Adjective/adverb and comparison pass

- [ ] Review every explicit comparative.
- [ ] Review every explicit superlative.
- [ ] Verify irregular comparison (`goed`, `veel`, `weinig`, etc.) where present.
- [ ] Verify spelling adjustments in regular comparison.
- [ ] Ensure non-comparable adjectives are not assigned fabricated forms.
- [ ] Ensure words functioning primarily as adverbs are not misleadingly forced into adjective paradigms.
- [ ] Check adjective/adverb POS distinctions where English glosses obscure Dutch usage.
- [ ] Add representative gold fixtures/tests.

**Adjective/adverb evidence:**

`________________________________________________________________________`

---

## 6. Phrase, function-word, pronoun, determiner, and connector pass

These are easy to neglect and extremely important for real Dutch.

- [ ] Audit all pronouns for accurate subject/object/possessive/reflexive descriptions.
- [ ] Audit reduced/unstressed forms for truthful descriptions.
- [ ] Audit `hen`/`hun` glosses carefully.
- [ ] Audit determiners including `ons/onze`, `elk/elke`, `ieder/iedere`, demonstratives, quantifiers.
- [ ] Audit prepositions and common multi-sense glosses.
- [ ] Audit conjunctions for coordinating/subordinating function.
- [ ] Audit particles where an English one-word gloss would be misleading.
- [ ] Audit interjections/register.
- [ ] Audit multiword phrases for natural spelling and accurate meaning.
- [ ] Remove phrases that are merely sentence fragments produced to pad breadth.
- [ ] Ensure phrase entries never enter inappropriate single-word morphology.

**Function-word/phrase evidence:**

`________________________________________________________________________`

---

## 7. CEFR and learnability redesign where necessary

CEFR labels must not be decorative.

- [ ] Measure current CEFR distributions by POS/category.
- [ ] Identify obviously mis-leveled high-frequency basic words.
- [ ] Identify advanced/formal/technical words incorrectly labeled A1/A2.
- [ ] Identify extremely basic words incorrectly pushed to high levels.
- [ ] Apply conservative corrections where defensible.
- [ ] Do not pretend individual-word CEFR can always be exact; document that levels are pedagogical approximations.
- [ ] Ensure `learnable: true` means the item is genuinely suitable as a learner-facing lexical card.
- [ ] Ensure generated inflection/reference rows remain non-learnable unless explicitly curated.
- [ ] Ensure numerals/ordinals/reference expansions do not swamp learner-facing selection.
- [ ] Ensure obsolete/rare/technical items are not disproportionately surfaced as beginner material.

**CEFR/learnability evidence:**

`________________________________________________________________________`

---

## 8. English gloss quality and semantic ambiguity pass

- [ ] Find exact duplicate English glosses shared by many unrelated Dutch words and inspect them.
- [ ] Find suspicious template phrases in glosses.
- [ ] Find glosses containing malformed English.
- [ ] Find glosses that describe morphology instead of meaning.
- [ ] Find glosses that overclaim synonymy.
- [ ] Find entries where one English gloss masks a crucial Dutch distinction.
- [ ] Find Dutch homographs where a single row incorrectly merges unrelated POS/senses.
- [ ] Correct misleading punctuation/semicolon use in multi-sense glosses.
- [ ] Keep glosses concise enough for flashcards while still truthful.
- [ ] Do not fabricate usage examples merely to make the data look richer.

**Gloss evidence:**

`________________________________________________________________________`

---

## 9. Stable-ID and deterministic-generation hardening

- [ ] Independently audit `data/word_ids.json` ownership.
- [ ] Every current normalized lexical form has exactly one historical ID owner.
- [ ] No ID has multiple owners.
- [ ] Retired IDs cannot be reassigned.
- [ ] Regeneration cannot silently remap an existing form to another ID.
- [ ] Normalization rules used for registry ownership are explicit and deterministic.
- [ ] Unicode/case normalization cannot create hidden collisions.
- [ ] Reordering core source files does not silently change established IDs.
- [ ] Generator rejects malformed source rows before artifact emission.
- [ ] Generator rejects unsupported morphology metadata rather than guessing.
- [ ] Generator remains byte-deterministic.
- [ ] Run generation twice and prove `data/words.js` and registry are byte-identical on the second run.
- [ ] Add adversarial tests for retired-ID non-reuse and ownership collisions.

**ID/determinism evidence:**

`________________________________________________________________________`

---

## 10. Build hostile lexical-quality tooling

Create dedicated lexical tooling that would catch errors count-based audits miss.

- [ ] Add a lexical-specific audit script/report separate from the shared `scripts/audit.mjs` owned by Gemini.
- [ ] Add lexical-specific automated tests.
- [ ] Tests validate source rows, not just generated output.
- [ ] Tests validate generated artifact invariants.
- [ ] Tests validate article truth fixtures.
- [ ] Tests validate difficult verb paradigms.
- [ ] Tests validate adjective comparison fixtures.
- [ ] Tests validate phrase/multiword classification.
- [ ] Tests validate stable IDs and retired IDs.
- [ ] Tests reject duplicate normalized source forms unless an explicit, defensible sense model supports them.
- [ ] Tests detect suspicious source-level template padding.
- [ ] Tests detect malformed English glosses.
- [ ] Tests detect nonsense or forbidden Dutch forms.
- [ ] Tests check learnability/source provenance separation.
- [ ] Tests check source/core regeneration reproducibility.
- [ ] Tests fail loudly rather than silently skipping zero applicable rows.
- [ ] Each major test reports how many rows it actually inspected so vacuous passes are visible.

**Tooling evidence:**

`________________________________________________________________________`

---

## 11. Provenance and editorial documentation

Create a concise, useful lexical provenance/editorial document without pretending every row came from one source.

- [ ] Document what constitutes a curated source row.
- [ ] Document what generated/reference-only means.
- [ ] Document article verification methodology.
- [ ] Document morphology verification methodology.
- [ ] Document CEFR caveats.
- [ ] Document English-gloss editorial rules.
- [ ] Document stable-ID/retirement policy.
- [ ] List authoritative/reputable references used during review.
- [ ] Clearly distinguish sourced verification from editorial judgment.
- [ ] Do not copy dictionary definitions verbatim.
- [ ] Record genuine unresolved lexical limitations instead of burying them.

**Documentation evidence:**

`________________________________________________________________________`

---

## 12. Manual whole-bank second reading

Automated checks are not enough.

After the implementation pass:

- [ ] Re-read every changed curated row manually.
- [ ] Re-read every removed/retired row decision.
- [ ] Re-read every explicit irregular morphology row.
- [ ] Re-read every source row containing article metadata changes.
- [ ] Re-read every source row whose CEFR changed.
- [ ] Re-read every source row whose English gloss changed.
- [ ] Perform a deterministic random/sample review of at least 500 untouched curated rows distributed across all core files/POS/levels to catch systemic issues missed during changed-row review.
- [ ] Record sample methodology and findings.
- [ ] If the sample exposes a systemic issue, expand the audit to all affected rows and fix them rather than merely documenting the sample failure.

**Manual-review evidence:**

`________________________________________________________________________`

---

## 13. Integration safety against current master and concurrent work

Before delivery:

- [ ] Fetch current `origin/master` again.
- [ ] Compare your branch against current master.
- [ ] Identify files now modified by Grok/Gemini branches/PRs if visible.
- [ ] Confirm no accidental overlap with their owned grammar/comprehension/idiom/sentence/runtime files.
- [ ] If master advanced, integrate latest master without discarding any concurrent agent work.
- [ ] Re-run lexical generation and tests after integration.
- [ ] Run the repository's complete existing test suite even though most files are outside your ownership.
- [ ] Run production build.
- [ ] Run production artifact audit.
- [ ] Run `git diff --check`.
- [ ] Check working tree for unintended generated/untracked files.

**Integration evidence:**

`________________________________________________________________________`

---

## 14. Verification Pass 1 — implementation-complete review

This pass is mandatory.

- [ ] Re-read every requirement in this contract from the top.
- [ ] Produce a DONE/NOT DONE matrix for all sections.
- [ ] Any NOT DONE item causes continued work, not a “remaining work” paragraph.
- [ ] Run lexical audit tooling.
- [ ] Run all lexical tests.
- [ ] Run word generator twice and byte-compare output/registry.
- [ ] Run full `npm test`.
- [ ] Run `npm run build`.
- [ ] Run `npm run audit:artifact`.
- [ ] Run `git diff --check`.
- [ ] Review complete diff against starting master.
- [ ] Review generated `data/words.js` directly, not only generator source.
- [ ] Confirm stable IDs did not drift.
- [ ] Confirm no arbitrary target-count padding was introduced.
- [ ] Confirm no unsupported examples/frequencies were fabricated.
- [ ] Confirm no required checkbox was checked merely because a test passed.

**Pass 1 evidence:**

`________________________________________________________________________`

---

## 15. Verification Pass 2 — hostile fresh-perspective review

This pass is also mandatory and must be genuinely separate from Pass 1.

Assume your own work is wrong.

- [ ] Re-read this entire contract again.
- [ ] Review the full diff as if written by another developer.
- [ ] Search for ways the implementation could have gamed the requirements.
- [ ] Search for fake lexical breadth, cloned glosses, source padding, unsupported morphology, and accidental learner-facing derived forms.
- [ ] Independently recompute baseline/final lexical metrics with a fresh script or fresh invocation path.
- [ ] Re-run duplicate/collision analysis.
- [ ] Re-run article gold checks.
- [ ] Re-run verb gold checks.
- [ ] Re-run phrase classification checks.
- [ ] Re-run stable-ID/retirement checks.
- [ ] Re-run deterministic generation twice.
- [ ] Re-run the full repository test/build/artifact suite.
- [ ] Manually inspect at least 200 generated learner-facing cards spanning all levels/POS/categories.
- [ ] Verify their displayed Dutch form, article where relevant, English gloss, source provenance, and learnability make sense.
- [ ] If anything fails or looks suspicious, fix it and restart Pass 2.

**Pass 2 evidence:**

`________________________________________________________________________`

---

## 16. Delivery

- [ ] All intended changes are committed logically.
- [ ] Branch is pushed.
- [ ] Open a PR against latest `master`.
- [ ] Do NOT merge it.
- [ ] PR description records exact starting base SHA.
- [ ] PR description records exact final head SHA.
- [ ] PR description includes before/after lexical metrics.
- [ ] PR description lists number of curated rows reviewed.
- [ ] PR description lists number of rows corrected/retired/added by category.
- [ ] PR description summarizes article corrections.
- [ ] PR description summarizes morphology corrections.
- [ ] PR description summarizes CEFR/POS/gloss corrections.
- [ ] PR description includes stable-ID/reproducibility evidence.
- [ ] PR description includes lexical test/audit results.
- [ ] PR description includes full test/build/artifact results.
- [ ] PR description includes manual-review methodology.
- [ ] PR description states genuine remaining limitations without disguising assigned unfinished work as a limitation.

---

# FINAL COMPLETION GATE

Do not check these until everything above is genuinely true.

- [ ] Every required item in this file is checked and evidenced.
- [ ] Verification Pass 1 is completely clean.
- [ ] Verification Pass 2 is completely clean after any fixes it uncovered.
- [ ] No assigned requirement was deferred as future work.
- [ ] No invented metrics or unrun checks are reported.
- [ ] No fake content quantity was used as a substitute for lexical quality.
- [ ] Stable learner progress/IDs are preserved.
- [ ] Concurrent Grok/Gemini work is not overwritten.
- [ ] PR is open and ready for independent review.
- [ ] **LUNA TASK IS 100% COMPLETE ACCORDING TO THIS CONTRACT.**
