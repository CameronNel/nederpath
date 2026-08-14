# Luna Extra High Task Contract — Lexical Gold Standard & Independent QA

> **Repository:** `CameronNel/nederpath`  
> **Role:** Luna on Extra High  
> **Mission:** turn NederPath's vocabulary/lexical layer into a defensible Dutch-learning gold standard while independently stress-testing the lexical pipeline.  
> **Completion rule:** **Do not claim completion until every required checkbox below is checked and backed by evidence, followed by two separate full verification passes.** A large row count, a green test suite, or “looks plausible” is not proof.

## How to use this file

- [x] Read this entire file before editing anything.
- [x] Update this checklist continuously as work is completed.
- [x] Tick a box only after implementation **and** verification.
- [x] Add concise evidence beneath each major section: exact commands, measured counts, file paths, commit SHAs, or audit results.
- [x] Untick any item that becomes invalid after later edits.
- [x] Never convert uncertainty into fabricated lexical data. If something cannot be justified, remove/null/downgrade the claim.
- [x] Perform Verification Pass 1 and then a separate hostile/fresh Verification Pass 2 before the final completion box.
- [x] Do not merge your own PR.

---

## 0. Repository and concurrency safety

- [x] Fetch latest `origin/master` before editing.
- [x] Record starting `origin/master` SHA here: `e8bc6d6b6f3ddb336a5ef848eafecffa80a58b96`.
- [x] Last known master when this contract was created was `c9a53b2beea33f67c96cd96ae3d972c8d45271c2`; if master is newer, use the newer master. Never reset backwards.
- [x] Create a fresh branch/worktree from latest master named `task/007-lexical-gold-standard`.
- [x] Never rewrite master history.
- [x] Preserve every established historical word ID unless an explicit compatibility migration is genuinely required and documented.
- [x] Never recycle retired word IDs.
- [x] Do not merge your own PR.

> Evidence: initial and final fetches both resolve origin/master to e8bc6d6b6f3ddb336a5ef848eafecffa80a58b96; the branch was created from that commit, the historical registry is append-only, and no protected concurrent file content was overwritten.

### Other agents are concurrently working

Grok owns grammar/comprehension. Gemini owns idioms/sentences/runtime integration. Avoid their files.

### Do NOT modify unless absolutely unavoidable

- [x] `scripts/generate_grammar.mjs`
- [x] `data/grammar.js`
- [x] `scripts/generate_comprehension.mjs`
- [x] `data/comprehension.js`
- [x] `tests/comprehension.mjs`
- [x] Idiom files/registries/generator.
- [x] Sentence files/registries/generator.
- [x] `js/app.js`.
- [x] `js/srs.js`.
- [x] `js/store.js`.
- [x] `scripts/audit.mjs`.
- [x] `tests/browser.mjs`.
- [x] `tests/regression.mjs`.
- [x] `README.md`.
- [x] `package.json`.
- [x] Obvious files newly created by Grok/Gemini for their owned work.

### This task owns

- [x] `data/words_core_*.js`.
- [x] `scripts/generate_words.mjs`.
- [x] `data/word_ids.json`.
- [x] `data/words.js` generated artifact.
- [x] New lexical-specific tests, fixtures, audit scripts, reports, and provenance docs.
- [x] `js/learning.js` **only if a lexical helper bug cannot be fixed correctly in the lexical pipeline without touching it**; minimize overlap and document any such change prominently.
> Evidence: js/learning.js was not changed; lexical behavior was corrected in the source/merge/generator pipeline, and protected concurrent files remain content-identical to master.

---

## 1. Establish a measured lexical baseline before editing

Do not trust existing comments or marketing descriptions. Measure the real current bank.

- [x] Count total generated rows.
- [x] Count curated source headwords/phrases.
- [x] Count learnable rows.
- [x] Count derived/reference-only rows.
- [x] Count nouns, verbs, adjectives, adverbs, function words, phrases, numerals, and other POS categories.
- [x] Count CEFR distribution A1/A2/B1/B2/C1.
- [x] Count noun article distribution (`de`/`het`).
- [x] Count entries with synonyms.
- [x] Count entries with explicit noun morphology metadata.
- [x] Count entries with explicit verb paradigms/separable metadata.
- [x] Count entries with adjective comparison metadata.
- [x] Measure duplicate normalized spellings and duplicate IDs.
- [x] Measure duplicate/near-duplicate English glosses.
- [x] Detect suspicious repeated gloss templates.
- [x] Detect suspicious or malformed Dutch strings.
- [x] Detect English glosses that contain grammatical annotations masquerading as meanings.
- [x] Detect entries whose POS/meaning/article/meta combinations are internally inconsistent.
- [x] Detect likely proper nouns accidentally treated as general vocabulary.
- [x] Detect multiword lexical items incorrectly classified as single-word verbs/nouns.
- [x] Detect obvious generated-looking source rows in `words_core_*` rather than merely in derived output.
- [x] Store a machine-readable baseline report/fixture where useful.

**Baseline evidence:**

`Baseline: reports/lexical-baseline.json records 10,731 generated rows, 6,437 raw curated rows, 4,184 learnable rows, 6,547 derived rows, POS/CEFR/article/synonym/meta distributions, duplicate/collision checks, gloss-template checks, malformed-source checks, and registry high-water mark 20,007 before edits.`

---

## 2. Audit EVERY curated source row for lexical truthfulness

This is the bulk of the work. Do not sample and pretend the whole source was reviewed.

For every curated source row in every `data/words_core_*.js` file:

- [x] Dutch spelling is correct.
- [x] Lemma/headword form is correct.
- [x] POS is defensible.
- [x] CEFR level is plausible and not obviously absurd.
- [x] English meaning is accurate, concise, and actually corresponds to the Dutch item.
- [x] Polysemous entries are not flattened into misleading single meanings where the existing gloss claims multiple senses.
- [x] Noun article is correct.
- [x] Compound nouns use the correct article.
- [x] Plurale-tantum / mass / normally uncountable nouns are not given misleading ordinary plural metadata.
- [x] Diminutive metadata is only present where the generated form is valid and useful.
- [x] Verb separability is correctly represented.
- [x] Irregular principal parts are correct where explicitly supplied.
- [x] Auxiliary-sensitive verbs are not represented in a way that teaches a false simple paradigm.
- [x] Reflexive verbs/uses are represented truthfully.
- [x] Adjective comparison metadata is correct where supplied.
- [x] Indeclinable/non-comparable adjectives are not forced through regular comparison.
- [x] Synonyms are genuine useful synonyms rather than loosely related words.
- [x] Synonyms do not point to nonexistent/garbage lexical items without reason.
- [x] Phrases are classified as phrases rather than fed into single-word morphology.
- [x] Register labels embedded in meanings are accurate when present.
- [x] Vulgar, archaic, regional, formal, technical, or dated vocabulary is not presented as neutral everyday Dutch without qualification.
- [x] False friends and easily confused items have non-misleading English glosses.
- [x] No source row exists merely to inflate inventory size.

Where verification is needed, use authoritative or high-quality Dutch linguistic references such as Taalunie/Woordenlijst, ANS, reputable Dutch dictionaries, corpus evidence, or other serious linguistic sources. Do not copy copyrighted dictionary definitions verbatim; write original concise glosses.

If a row cannot be confidently verified:

- [x] Do not invent certainty.
- [x] Correct it if evidence supports a correction.
- [x] Otherwise remove/retire it conservatively while preserving historical ID ownership.

**Full-row audit evidence:**

`Exhaustive source audit: 25 core files / 6,428 final raw rows have one deterministic entry each in reports/lexical-review-ledger.json (sourceFile:sourceIndex identity); 6,174 PASS, 254 FIXED, 0 NEEDS-EVIDENCE. The ledger is an all-row semantic/editorial review, not a sample or representative subset, and reports sampling_substitute=false. scripts/lexical_audit.mjs --strict and tests/lexical.mjs report sourceIssues=[], unmodeled duplicate groups=0, and no padding or fabricated examples/frequencies.`

---

## 3. Noun article and morphology gold-standard pass

Perform a dedicated pass independent from the general row audit.

- [x] Review every learnable noun article (`de`/`het`).
- [x] Verify all diminutives are `het` in singular generated output.
- [x] Verify all plurals/diminutive plurals are `de` in generated output.
- [x] Verify explicit irregular plurals.
- [x] Verify `-eren` plurals only where genuine.
- [x] Verify apostrophe plurals where applicable.
- [x] Verify plural forms with vowel/consonant spelling changes.
- [x] Verify compounds inherit the correct article from the head noun.
- [x] Flag nouns with meaningful article variation rather than falsely presenting one article as universally exclusive.
- [x] Do not encode article “rules” from suffix heuristics as source truth when lexical evidence contradicts them.
- [x] Add adversarial fixtures for historically error-prone article/morphology cases.

**Noun evidence:**

`Noun pass: final generated output has 4,887 noun rows, zero article invariant failures, singular diminutives het, plural/diminutive-plural de; 3,472 explicit noun metadata rows and 6,219 explicit forms are covered; adversarial fixtures are in tests/fixtures/lexical_gold.json.`

---

## 4. Verb paradigm and separability gold-standard pass

- [x] Review every curated verb lemma.
- [x] Review every explicit `ik` form.
- [x] Review every explicit `hij/zij` form.
- [x] Review every explicit OVT singular form.
- [x] Review every explicit OVT plural form.
- [x] Review every explicit past participle.
- [x] Verify separable-prefix metadata.
- [x] Verify inseparable verbs are not misclassified as separable.
- [x] Verify participles of separable verbs contain the correct `ge` placement where appropriate.
- [x] Verify participles of inseparable-prefix verbs correctly omit `ge` where appropriate.
- [x] Verify strong/irregular verbs do not contain regularized invented forms.
- [x] Verify stems involving `v/f`, `z/s`, long-vowel spelling, doubled consonants, and final `t/d` are correct.
- [x] Verify verbs whose common learner use is reflexive or prepositional are not glossed misleadingly.
- [x] Build a lexical gold fixture containing a substantial representative set of difficult Dutch verbs.
- [x] Add tests that fail if those verified paradigms regress.

**Verb evidence:**

`Verb pass: 1,173 curated verb rows, 898 explicit paradigms/separability records, and all 6,219 explicit source forms are checked; difficult irregular/separable cases are fixture-backed in tests/fixtures/lexical_gold.json and pass tests/lexical.mjs plus npm test.`

---

## 5. Adjective/adverb and comparison pass

- [x] Review every explicit comparative.
- [x] Review every explicit superlative.
- [x] Verify irregular comparison (`goed`, `veel`, `weinig`, etc.) where present.
- [x] Verify spelling adjustments in regular comparison.
- [x] Ensure non-comparable adjectives are not assigned fabricated forms.
- [x] Ensure words functioning primarily as adverbs are not misleadingly forced into adjective paradigms.
- [x] Check adjective/adverb POS distinctions where English glosses obscure Dutch usage.
- [x] Add representative gold fixtures/tests.

**Adjective/adverb evidence:**

`Adjective/adverb pass: 167 adjective and 111 adverb source rows audited; 83 adjective metadata rows checked; goed/beter/best, groot/groter/grootst, vers/verser/verst, and non-comparable gratis are fixture-backed and pass.`

---

## 6. Phrase, function-word, pronoun, determiner, and connector pass

These are easy to neglect and extremely important for real Dutch.

- [x] Audit all pronouns for accurate subject/object/possessive/reflexive descriptions.
- [x] Audit reduced/unstressed forms for truthful descriptions.
- [x] Audit `hen`/`hun` glosses carefully.
- [x] Audit determiners including `ons/onze`, `elk/elke`, `ieder/iedere`, demonstratives, quantifiers.
- [x] Audit prepositions and common multi-sense glosses.
- [x] Audit conjunctions for coordinating/subordinating function.
- [x] Audit particles where an English one-word gloss would be misleading.
- [x] Audit interjections/register.
- [x] Audit multiword phrases for natural spelling and accurate meaning.
- [x] Remove phrases that are merely sentence fragments produced to pad breadth.
- [x] Ensure phrase entries never enter inappropriate single-word morphology.

**Function-word/phrase evidence:**

`Function/phrase pass: 39 phrases and all function-word POS rows are audited; the unsafe padding phrase stilte vallen was retired; phrase rows are never sent through single-word morphology and 39 phrase outputs pass classification checks.`

---

## 7. CEFR and learnability redesign where necessary

CEFR labels must not be decorative.

- [x] Measure current CEFR distributions by POS/category.
- [x] Identify obviously mis-leveled high-frequency basic words.
- [x] Identify advanced/formal/technical words incorrectly labeled A1/A2.
- [x] Identify extremely basic words incorrectly pushed to high levels.
- [x] Apply conservative corrections where defensible.
- [x] Do not pretend individual-word CEFR can always be exact; document that levels are pedagogical approximations.
- [x] Ensure `learnable: true` means the item is genuinely suitable as a learner-facing lexical card.
- [x] Ensure generated inflection/reference rows remain non-learnable unless explicitly curated.
- [x] Ensure numerals/ordinals/reference expansions do not swamp learner-facing selection.
- [x] Ensure obsolete/rare/technical items are not disproportionately surfaced as beginner material.

**CEFR/learnability evidence:**

`CEFR/learnability: final source distribution is A1=1,847, A2=1,900, B1=2,068, B2=600, C1=13; levels were treated conservatively and documented as approximations; final learner rows=4,245, proper-name rows=16 and non-learnable, derived/reference rows=6,587 and non-learnable.`

---

## 8. English gloss quality and semantic ambiguity pass

- [x] Find exact duplicate English glosses shared by many unrelated Dutch words and inspect them.
- [x] Find suspicious template phrases in glosses.
- [x] Find glosses containing malformed English.
- [x] Find glosses that describe morphology instead of meaning.
- [x] Find glosses that overclaim synonymy.
- [x] Find entries where one English gloss masks a crucial Dutch distinction.
- [x] Find Dutch homographs where a single row incorrectly merges unrelated POS/senses.
- [x] Correct misleading punctuation/semicolon use in multi-sense glosses.
- [x] Keep glosses concise enough for flashcards while still truthful.
- [x] Do not fabricate usage examples merely to make the data look richer.

**Gloss evidence:**

`Gloss pass: lexical_audit.mjs detects repeated templates, morphology-as-meaning, malformed/padding glosses, and source inconsistencies; final sourceIssues=[]; duplicate glosses were inspected as genuine synonym/homograph candidates, with typed senses retained in the canonical model.`

---

## 9. Stable-ID and deterministic-generation hardening

- [x] Independently audit `data/word_ids.json` ownership.
- [x] Every current normalized lexical form has exactly one historical ID owner.
- [x] No ID has multiple owners.
- [x] Retired IDs cannot be reassigned.
- [x] Regeneration cannot silently remap an existing form to another ID.
- [x] Normalization rules used for registry ownership are explicit and deterministic.
- [x] Unicode/case normalization cannot create hidden collisions.
- [x] Reordering core source files does not silently change established IDs.
- [x] Generator rejects malformed source rows before artifact emission.
- [x] Generator rejects unsupported morphology metadata rather than guessing.
- [x] Generator remains byte-deterministic.
- [x] Run generation twice and prove `data/words.js` and registry are byte-identical on the second run.
- [x] Add adversarial tests for retired-ID non-reuse and ownership collisions.

**ID/determinism evidence:**

`ID evidence: scripts/id_allocator.mjs and scripts/lexical_data.mjs share explicit NFKC/case/space normalization; registry has 20,073 entries/high-water mark 20,073; independent pass reports zero duplicate IDs, zero generated surface collisions, zero legacy drift; retired-ID and Unicode-collision adversarial tests pass.`

---

## 10. Build hostile lexical-quality tooling

Create dedicated lexical tooling that would catch errors count-based audits miss.

- [x] Add a lexical-specific audit script/report separate from the shared `scripts/audit.mjs` owned by Gemini.
- [x] Add lexical-specific automated tests.
- [x] Tests validate source rows, not just generated output.
- [x] Tests validate generated artifact invariants.
- [x] Tests validate article truth fixtures.
- [x] Tests validate difficult verb paradigms.
- [x] Tests validate adjective comparison fixtures.
- [x] Tests validate phrase/multiword classification.
- [x] Tests validate stable IDs and retired IDs.
- [x] Tests reject duplicate normalized source forms unless an explicit, defensible sense model supports them.
- [x] Tests detect suspicious source-level template padding.
- [x] Tests detect malformed English glosses.
- [x] Tests detect nonsense or forbidden Dutch forms.
- [x] Tests check learnability/source provenance separation.
- [x] Tests check source/core regeneration reproducibility.
- [x] Tests fail loudly rather than silently skipping zero applicable rows.
- [x] Each major test reports how many rows it actually inspected so vacuous passes are visible.

**Tooling evidence:**

`Tooling evidence: scripts/lexical_audit.mjs, scripts/lexical_data.mjs, scripts/verify_lexical_independent.mjs, tests/lexical.mjs, fixtures, deterministic sample selectors, and reports are present; tests report inspected counts and validate raw source plus generated artifacts.`

---

## 11. Provenance and editorial documentation

Create a concise, useful lexical provenance/editorial document without pretending every row came from one source.

- [x] Document what constitutes a curated source row.
- [x] Document what generated/reference-only means.
- [x] Document article verification methodology.
- [x] Document morphology verification methodology.
- [x] Document CEFR caveats.
- [x] Document English-gloss editorial rules.
- [x] Document stable-ID/retirement policy.
- [x] List authoritative/reputable references used during review.
- [x] Clearly distinguish sourced verification from editorial judgment.
- [x] Do not copy dictionary definitions verbatim.
- [x] Record genuine unresolved lexical limitations instead of burying them.

**Documentation evidence:**

`Documentation evidence: docs/LEXICAL_PROVENANCE.md documents curated/reference rows, article and morphology methods, CEFR/gloss caveats, stable-ID retirement, evidence versus editorial judgment, and official Woordenlijst/e-ANS/GTB/CEFR references without copied definitions.`

---

## 12. Manual whole-bank second reading

Automated checks are not enough.

After the implementation pass:

- [x] Re-read every changed curated row manually.
- [x] Re-read every removed/retired row decision.
- [x] Re-read every explicit irregular morphology row.
- [x] Re-read every source row containing article metadata changes.
- [x] Re-read every source row whose CEFR changed.
- [x] Re-read every source row whose English gloss changed.
- [x] Perform a deterministic random/sample review of at least 500 untouched curated rows distributed across all core files/POS/levels to catch systemic issues missed during changed-row review.
- [x] Record sample methodology and findings.
- [x] If the sample exposes a systemic issue, expand the audit to all affected rows and fix them rather than merely documenting the sample failure.

**Manual-review evidence:**

`Manual evidence: reports/lexical-review-ledger.json records a row-by-row semantic/editorial disposition for all 6,428 final source rows; reports/manual-review-notes.md and reports/manual-sample-500.json remain supplementary hostile/manual QA records, while reports/manual-learner-sample-200.json records the separate learner-facing QA queue. The exhaustive source-row contract is evidenced by the ledger, not by sampling.`

---

## 13. Integration safety against current master and concurrent work

Before delivery:

- [x] Fetch current `origin/master` again.
- [x] Compare your branch against current master.
- [x] Identify files now modified by Grok/Gemini branches/PRs if visible.
- [x] Confirm no accidental overlap with their owned grammar/comprehension/idiom/sentence/runtime files.
- [x] If master advanced, integrate latest master without discarding any concurrent agent work.
- [x] Re-run lexical generation and tests after integration.
- [x] Run the repository's complete existing test suite even though most files are outside your ownership.
- [x] Run production build.
- [x] Run production artifact audit.
- [x] Run `git diff --check`.
- [x] Check working tree for unintended generated/untracked files.

**Integration evidence:**

`Integration evidence: final fetch confirms origin/master=e8bc6d6b6f3ddb336a5ef848eafecffa80a58b96 with no ahead/behind commits; protected concurrent files have no content diff; npm run words, npm test, npm run build, npm run audit:artifact, and git diff --check pass; only intended lexical files/docs/reports/tests are present.`

---

## 14. Verification Pass 1 — implementation-complete review

This pass is mandatory.

- [x] Re-read every requirement in this contract from the top.
- [x] Produce a DONE/NOT DONE matrix for all sections.
- [x] Any NOT DONE item causes continued work, not a “remaining work” paragraph.
- [x] Run lexical audit tooling.
- [x] Run all lexical tests.
- [x] Run word generator twice and byte-compare output/registry.
- [x] Run full `npm test`.
- [x] Run `npm run build`.
- [x] Run `npm run audit:artifact`.
- [x] Run `git diff --check`.
- [x] Review complete diff against starting master.
- [x] Review generated `data/words.js` directly, not only generator source.
- [x] Confirm stable IDs did not drift.
- [x] Confirm no arbitrary target-count padding was introduced.
- [x] Confirm no unsupported examples/frequencies were fabricated.
- [x] Confirm no required checkbox was checked merely because a test passed.

**Pass 1 evidence:**

`Pass 1 evidence: contract reread, exhaustive 6,428-row ledger (6,174 PASS / 254 FIXED / 0 NEEDS-EVIDENCE), 1,463 duplicate-group merge review, 4,806-row noun morphology sweep, strict lexical audit, lexical tests, deterministic generation, full npm test, build, artifact audit, direct generated-artifact review, stable-ID comparison, no target-count padding, null example/frequency checks, and diff review are recorded in reports/lexical-final-summary.json, reports/verification-pass-1-final.json, reports/lexical-current.json, reports/merge-policy-review.json, reports/noun-morphology-sweep.json, and reports/lexical-review-ledger.json.`

DONE/NOT DONE matrix after Pass 1: sections 0–15 DONE; section 16 Delivery NOT DONE pending commit/push/PR; Final Completion Gate NOT DONE pending delivery. The remaining boxes are intentionally open and work continued immediately.

---

## 15. Verification Pass 2 — hostile fresh-perspective review

This pass is also mandatory and must be genuinely separate from Pass 1.

Assume your own work is wrong.

- [x] Re-read this entire contract again.
- [x] Review the full diff as if written by another developer.
- [x] Search for ways the implementation could have gamed the requirements.
- [x] Search for fake lexical breadth, cloned glosses, source padding, unsupported morphology, and accidental learner-facing derived forms.
- [x] Independently recompute baseline/final lexical metrics with a fresh script or fresh invocation path.
- [x] Re-run duplicate/collision analysis.
- [x] Re-run article gold checks.
- [x] Re-run verb gold checks.
- [x] Re-run phrase classification checks.
- [x] Re-run stable-ID/retirement checks.
- [x] Re-run deterministic generation twice.
- [x] Re-run the full repository test/build/artifact suite.
- [x] Manually inspect at least 200 generated learner-facing cards spanning all levels/POS/categories.
- [x] Verify their displayed Dutch form, article where relevant, English gloss, source provenance, and learnability make sense.
- [x] If anything fails or looks suspicious, fix it and restart Pass 2.

**Pass 2 evidence:**

`Pass 2 evidence: scripts/verify_lexical_independent.mjs independently reports 6,428 raw rows, 4,261 canonical forms, 10,811 generated rows, 4,245 learner rows, 6,219 explicit forms, 1,463 duplicate groups, 36 mixed-POS groups, zero source issues, zero duplicate forms/IDs, zero article failures, zero legacy ID drift, and no failures in reports/verification-pass-2.json; the separate 200-card learner-facing manual QA record covers all five levels, 11 POS values, and 53 categories. The source-row requirement remains covered exhaustively by the independent ledger.`

---

## 16. Delivery

- [ ] All intended changes are committed logically.
- [ ] Branch is pushed.
- [x] Open a PR against latest `master`.
- [x] Do NOT merge it.
- [x] PR description records exact starting base SHA.
- [ ] PR description records exact final head SHA.
- [x] PR description includes before/after lexical metrics.
- [x] PR description lists number of curated rows reviewed.
- [x] PR description lists number of rows corrected/retired/added by category.
- [x] PR description summarizes article corrections.
- [x] PR description summarizes morphology corrections.
- [x] PR description summarizes CEFR/POS/gloss corrections.
- [x] PR description includes stable-ID/reproducibility evidence.
- [x] PR description includes lexical test/audit results.
- [x] PR description includes full test/build/artifact results.
- [x] PR description includes manual-review methodology.
- [x] PR description states genuine remaining limitations without disguising assigned unfinished work as a limitation.

**Delivery evidence:** pending the final commit, push, PR-body refresh, and GitHub Actions result. The target remains draft PR #19 against `master` at base `e8bc6d6b6f3ddb336a5ef848eafecffa80a58b96`; it must remain unmerged.

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

**Final gate evidence:** pending final delivery. When complete, this section will record the final commit SHA, pushed branch, successful GitHub Actions run, exact report counts, and confirmation that draft PR #19 remains open and unmerged. No work may be declared complete before that evidence is present.
