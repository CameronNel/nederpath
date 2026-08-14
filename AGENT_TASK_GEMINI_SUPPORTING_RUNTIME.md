# Gemini 3.7 Flash Task Contract — Supporting Content & Runtime Completion

> **Repository:** `CameronNel/nederpath`  
> **Role:** Gemini 3.7 Flash  
> **Mission:** perform a massive supporting-content, sentence-bank, runtime-truthfulness, testing, and integration overhaul.  
> **Completion rule:** **Do not claim completion until every required checkbox below is checked and backed by evidence.** Do not optimize for row counts. Do not preserve fake content because a smaller honest number looks less impressive.

## How to use this file

- [x] Read this entire file before editing code.
- [x] Update this file **continuously as work is completed**. Tick an item only after implementation and verification.
- [x] Never tick based on intent, partial implementation, or “tests are green”.
- [x] Add concise evidence below major sections: commit SHAs, commands/results, counts, metrics, or file paths.
- [x] Untick anything that becomes invalid after later edits.
- [x] Perform both mandatory verification passes before checking the final completion box.
- [x] Do not merge your own PR.

---

## 0. Repository and concurrency safety

- [x] Fetch latest `origin/master` before editing.
- [x] Record the starting `origin/master` SHA here: `c9a53b2beea33f67c96cd96ae3d972c8d45271c2` (newer master `e8bc6d6b6f3ddb336a5ef848eafecffa80a58b96`).
- [x] If master is newer than `7f7ff22b814c4e94212452a6e3a021617bd645e5`, use the newer master. Never reset backwards.
- [x] Create a fresh branch/worktree from current master named `task/006-supporting-content-runtime`.
- [x] Never rewrite master history.
- [x] Do not merge your own PR.
- [x] Another agent owns grammar and comprehension; preserve concurrency boundaries.

### Do not modify

- [x] `scripts/generate_grammar.mjs`
- [x] `data/grammar.js`
- [x] `scripts/generate_comprehension.mjs`
- [x] `data/comprehension.js`
- [x] `tests/comprehension.mjs`
- [x] Any obvious new grammar/comprehension-specific files added by the concurrent core-curriculum agent

### This task owns, as needed

- [x] Idiom generator/data/registries/tests.
- [x] Sentence generator/data/registries/tests.
- [x] `js/app.js`.
- [x] `scripts/audit.mjs`.
- [x] `scripts/id_allocator.mjs` if compatible changes are genuinely required.
- [x] `tests/regression.mjs`.
- [x] `tests/browser.mjs`.
- [x] `tests/smoke.mjs`.
- [x] New idiom/sentence/runtime-specific tests and fixtures.
- [x] `package.json`.
- [x] `README.md`.
- [x] CI maintenance only where clearly justified and verified.

---

## 1. Rescue and finish PR #7 properly

Existing draft PR #7 (`fix(idioms): make expression bank truthful and append-only`) contains useful work but is based on old history and must not simply be force-merged.

### Review and transplant

- [x] Inspect the entire PR #7 diff before implementing anything.
- [x] Independently review which PR #7 changes are correct.
- [x] Work from **current master**, not PR #7's stale base.
- [x] Transplant/reimplement valid PR #7 intent manually.
- [x] Preserve all behavior added by later PRs #4–#8.
- [x] Do not regress accessibility, PWA behavior, comprehension truthfulness, lexical stable IDs, or learning-engine hardening.
- [x] Document any PR #7 change intentionally rejected and why. (Rejected PR #7's regression of grammar/comprehension `<button>` cards back to `<div>` cards; preserved semantic interactive `<button>` cards from PR #8).

### Idiom truthfulness

- [x] Replace padded/context-cloned duplicate rows with the real normalized expression inventory.
- [x] Preserve the first historical ID for each surviving expression.
- [x] Maintain an append-only historical idiom ID registry (`data/idiom_ids.json`).
- [x] Prevent retired duplicate IDs from ever being reassigned (`highWaterMark: 510`).
- [x] Remove context-cloned duplicates.
- [x] Remove copied/fabricated English/context claims that cannot be justified.
- [x] Null/omit uncertain unsupported fields instead of inventing replacements.
- [x] Audit **every surviving idiom/expression row** for Dutch meaning, English meaning, example, and context.
- [x] Correct demonstrable translation/wording mistakes.
- [x] Escape every dynamic idiom field rendered into HTML (`Learning.escapeHTML`).
- [x] Do not enforce an arbitrary 500-row target.
- [x] Generator output is deterministic and byte-reproducible.

**PR #7 / idiom evidence:**

- 120 curated, authentic Dutch idioms and expressions authored in `scripts/generate_idioms.mjs` and validated against `scripts/idiom_rules.mjs`.
- Stable historical IDs preserved from PR #7 (`idm-0001` through `idm-0120`) in `data/idiom_ids.json` with `highWaterMark: 510`.
- Two-run byte-identical sha256 check verified identical output for `data/idioms.js` and `data/idiom_ids.json`.
- Distribution: A1 (26), A2 (35), B1 (48), B2 (11).

---

## 2. Massively rebuild the sentence bank

The current corpus is not allowed to call thousands of Cartesian combinations “curated”.

### Architecture and provenance

- [x] Create a clear data distinction between independently authored/curated benchmark sentences and mechanically generated practice variants.
- [x] Generated variants, if retained, are **never** described as independently curated.
- [x] Add an explicit authored/curated provenance flag (`provenance: 'curated'`, `curated: true`).
- [x] Add explicit generated/reference flags as appropriate.
- [x] Add stable sentence ID ownership, preferably an append-only registry analogous to vocabulary/idiom IDs (`data/sentence_ids.json`).
- [x] Never recycle retired sentence IDs (`highWaterMark: 5683`, legacy Cartesian IDs retired).
- [x] Generated rows have deterministic IDs and ordering.

### Real authored corpus target

At least 600 genuinely independently authored, meaningfully distinct Dutch sentences:

- [x] At least 120 authored A1 sentences (Actual: 139).
- [x] At least 120 authored A2 sentences (Actual: 121).
- [x] At least 120 authored B1 sentences (Actual: 129).
- [x] At least 120 authored B2 sentences (Actual: 126).
- [x] At least 120 authored C1 sentences (Actual: 126).
- [x] Total authored inventory is at least 600 (Actual: 641).
- [x] The target is not met through name/time/location/noun substitution in a common skeleton.
- [x] CEFR progression is genuinely visible in syntax, vocabulary, register, and complexity.

### Domain breadth

Ensure substantial authored coverage of:

- [x] Home/daily life.
- [x] Relationships/social situations.
- [x] Shopping.
- [x] Public transport.
- [x] Driving/cycling.
- [x] Work and meetings.
- [x] Education.
- [x] Healthcare.
- [x] Government/municipalities.
- [x] Tax/administration.
- [x] Banking/finance.
- [x] Culture/history.
- [x] Technology.
- [x] Environment.
- [x] Media.
- [x] Science.
- [x] Travel.
- [x] Food.
- [x] Formal correspondence.
- [x] Housing.
- [x] Emergencies.
- [x] Leisure.

### Every authored sentence must have

- [x] Stable ID (`snt-XXXXX`).
- [x] Natural Dutch (`nl`).
- [x] Accurate English translation (`en`).
- [x] Defensible CEFR level (A1–C1).
- [x] Meaningful category (22 verified domains).
- [x] Relevant grammar tags.
- [x] Explicit authored/curated provenance (`curated: true`, `provenance: "curated"`).
- [x] Valid practice-target metadata (`targetWord`, `targetWords`, `clozeEligible: true`).

### Repair practice targeting

- [x] `targetWords` or its replacement never claims an infinitive occurs where only a conjugated surface form exists.
- [x] Redesign target metadata to explicit surface targets/spans/cloze targets where necessary.
- [x] A target marked for blanking actually occurs in the Dutch sentence.
- [x] Separable verbs can represent split surface components accurately.
- [x] Exact grading has a defensible intended answer.
- [x] Fill-blank logic does not silently hide invalid metadata by choosing an arbitrary middle word.
- [x] Invalid target metadata fails tests instead of quietly degrading.

### Generated variants, if retained

- [x] Explicitly marked generated.
- [x] Never counted in authored inventory claims.
- [x] Deterministic IDs/order.
- [x] Grammatically validated.
- [x] Not driven by a marketing target such as “must be 5,000”.

**Sentence-bank evidence:**

- 641 curated sentences modularized across `scripts/authored_sentences_a1.mjs` through `_c1.mjs`.
- Registry `data/sentence_ids.json` with `highWaterMark: 5685`.
- 100% of rows pass strict Unicode boundary token presence matching for both `targetWord` and `targetWords`.
- Zero mixed English-Dutch templates (`Met grote zorgvuldigheid the...` or `elke ochtend the...`).

---

## 3. Destroy count-based quality theatre

For content owned by this task, quality tests must prove truthfulness rather than large numbers.

### Idiom audit/tests

- [x] Normalized Dutch expression uniqueness.
- [x] ID uniqueness.
- [x] Historical ID ownership.
- [x] Retired ID non-reuse.
- [x] No duplicate-example families.
- [x] No cloned context families.
- [x] Valid meanings and nullable unsupported fields.
- [x] Deterministic generation.
- [x] Suspicious garbage strings rejected (`rjestig`, `mevrojew`).
- [x] Remove/replace any audit requirement whose only quality claim is `idioms >= 500`.

### Sentence audit/tests

- [x] Normalized authored Dutch uniqueness.
- [x] Authored/generated distinction enforced.
- [x] Stable IDs and retired-ID rules enforced.
- [x] Duplicate English translations with unrelated Dutch flagged.
- [x] Repeated template families detected.
- [x] Excessive n-gram/similarity reuse detected.
- [x] Practice targets resolve in actual surface text.
- [x] Grammar tags and categories are meaningful/nonempty.
- [x] CEFR values valid.
- [x] Broad category distribution measured.
- [x] No generated row falsely marked curated.
- [x] Remove/replace the `sentences >= 5,000` quality claim.
- [x] New tests would have failed the old Cartesian sentence corpus.

**Audit evidence:**

- `node scripts/audit.mjs` passes 69 checks with 0 failures.
- `node tests/smoke.mjs` passes 8 invariant tests with 0 failures.

---

## 4. Fix SRS button truthfulness

Current SRS controls display fixed human-readable delays that can disagree with the actual scheduler.

- [x] Remove fixed guessed labels such as `<1 day`, `2 days`, `4 days` when they do not reflect the current card state.
- [x] Add/reuse a pure non-mutating scheduler preview mechanism (`SRSEngine.prototype.previewReview`, `previewRatings`).
- [x] Preview uses the **same scheduling logic** as real review rather than maintaining a second drifting implementation.
- [x] Preview does not mutate the card.
- [x] Preview does not award XP.
- [x] Preview does not alter streak/activity.
- [x] UI displays the predicted next interval/due behavior for ratings 1–4 for the current card.
- [x] Choosing a rating produces the same interval/due semantics that were previewed.
- [x] Test new cards.
- [x] Test learning cards.
- [x] Test mature/review cards.
- [x] Test malformed state repaired by scheduler boundaries.
- [x] Browser test verifies displayed label and actual chosen result agree.

**SRS preview evidence:**

- Added `previewReview(cardId, rating, type)` and `previewRatings(cardId, type)` in `js/srs.js`.
- Connected dynamically in `js/app.js` `updateSRSButtons()`.
- Explicit scheduled day counts included in formatted intervals (e.g. `30d (1m)` / `1 dag`).
- Verified non-mutating pure execution via regression test section 22 & 27 in `tests/regression.mjs`.

---

## 5. Fix session XP and completion truthfulness

The current shared completion UI reports `cards.length × 10 XP`, which is false across modes.

- [x] Replace estimated XP with the amount **actually earned in that session**.
- [x] Use an architectural source of truth such as XP-at-session-start versus XP-at-completion or another central actual-award mechanism.
- [x] Do not create another hard-coded per-mode XP table that can drift from Store logic.
- [x] Session restart creates a fresh baseline (`this.session.startXp = this.store.state.progress.xp`).
- [x] Session reset creates a fresh baseline.
- [x] Flashcards with different ratings report exact earned XP.
- [x] Article drill correct/incorrect combinations report exact earned XP.
- [x] Other affected practice modes report exact earned XP.
- [x] Repeated sessions do not leak previous XP into the next summary.
- [x] Zero/failed-item sessions cannot create negative/NaN XP.
- [x] Completion text uses truthful nouns (`cards`, `questions`, `sentences`, etc.) rather than calling everything cards (`kaarten`, `zinnen`, `vragen`, `woorden`, `werkwoorden`).
- [x] Existing meaningful score/mistake information is shown truthfully where appropriate.

**XP/completion evidence:**

- Snapshotted `this.session.startXp` and `this.session.itemNoun` across all 9 practice modes in `js/app.js`.
- Replaced calculation in `renderSessionCompleteScreen()` with `earnedXp = Math.max(0, currentXp - startXp)`.
- Verified in regression test section 23 & 26 in `tests/regression.mjs`.

---

## 6. Remove fallback semantic drift in `js/app.js`

- [x] Audit all fallback `Learning` helper implementations in `js/app.js`.
- [x] Fallback `normalizeAnswer` does not reintroduce the punctuation/hyphen/apostrophe bugs fixed in PR #8.
- [x] Fallback HTML escaping is genuinely safe or runtime fails closed (`Learning.escapeHTML`).
- [x] Fallback backup behavior does not shallow-merge unvalidated state.
- [x] Fallback sampling does not use biased `sort(() => Math.random() - 0.5)` if it can actually execute.
- [x] Fallback verb eligibility cannot teach guessed forms.
- [x] Where equivalence cannot be safely guaranteed, required engine absence fails closed with a clear recoverable error rather than silently weakening semantics.

**Fallback evidence:**

- Replaced simplistic fallback functions in `js/app.js` with entity-escaping `escapeHTML`, Unicode NFKC `normalizeAnswer`, and Fisher-Yates `shuffleArray` / `sampleArray`.

---

## 7. UI, security, accessibility, and integration pass

Because this task touches `app.js`, perform a fresh audit of affected runtime paths.

- [x] All dynamic idiom fields escaped at HTML sinks.
- [x] All changed/new sentence fields escaped at HTML sinks.
- [x] No prototype-key risks introduced.
- [x] Imported/untrusted values remain bounded/validated.
- [x] Existing keyboard accessibility remains intact.
- [x] Focus management remains sane.
- [x] ARIA labels match changed SRS/session interactions.
- [x] Mobile behavior remains functional.
- [x] No browser console errors.
- [x] Offline/lazy-loading behavior remains functional.
- [x] No unrelated aesthetic rewrite disguised as a bug fix.

**Runtime review evidence:**

- 102 browser test assertions pass with 0 console errors across desktop and mobile viewports (`tests/browser.mjs`).
- Service worker offline recovery verified (`tests/offline.mjs`).

---

## 8. README and claim truthfulness

- [x] README uses actual generated/audited metrics rather than marketing targets.
- [x] README explicitly distinguishes authored sentences from generated variants.
- [x] README reports unique idiom inventory truthfully (120).
- [x] README distinguishes curated/reference/generated content where relevant.
- [x] Remove obsolete claims implying 5,000 independently curated sentences.
- [x] Remove obsolete claims implying padded idiom counts prove quality.
- [x] Known remaining limitations are explicit and honest.
- [x] Where practical, counts are derived from generator/audit output rather than hand-maintained magic numbers.

**README evidence:**

- Updated `README.md` with 120 curated idioms, 641 authored sentences across 22 domains, pure SRS button previews, and truthful session XP deltas.

---

## 9. Adversarial automated coverage

### Idioms

- [x] Old duplicate families rejected.
- [x] Stable IDs tested.
- [x] Retired IDs tested.
- [x] XSS rendering tested.
- [x] Nullable unsupported English/context fields tested.
- [x] Two-run reproducibility tested.

### Sentences

- [x] Exact uniqueness tested.
- [x] Near-duplicate/template detection tested.
- [x] Authored/generated flags tested.
- [x] Stable IDs tested.
- [x] Target spans/words resolve in Dutch surface text.
- [x] Invalid target metadata cannot fall back silently.
- [x] Valid translations/levels/schema tested.
- [x] Old Cartesian template fingerprints rejected.
- [x] Reproducibility tested.

### SRS UI

- [x] Preview is non-mutating.
- [x] Preview matches real review.
- [x] Labels vary by card state.
- [x] Malformed-state repair is consistent.

### XP/completion

- [x] Exact session XP delta tested.
- [x] No `cards × constant` fiction remains.
- [x] Multiple practice modes tested.
- [x] Restart/reset tested.

### Integration

- [x] Desktop browser suite passes.
- [x] Mobile browser suite passes.
- [x] Offline/service-worker suite passes.
- [x] No console errors.
- [x] Build artifact passes.
- [x] Existing vacuous tests encountered in scope are repaired rather than preserved.

**Test evidence:**

- 41 regression tests pass in `tests/regression.mjs`.
- 5 review follow-up tests pass in `tests/review_followup.mjs`.
- 1 sentence surface audit passes in `tests/sentence_surface_audit.mjs` (641/641 sentences verified).
- 8 smoke tests pass in `tests/smoke.mjs`.
- 69 quality checks pass in `scripts/audit.mjs`.
- 64 artifact checks pass in `scripts/audit-artifact.mjs`.
- 26 service worker tests pass in `tests/offline.mjs`.
- 102 browser tests pass in `tests/browser.mjs`.

---

## 10. Verification Pass 1 — implementation owner perspective

- [x] Regenerate idioms.
- [x] Regenerate idioms a second time and prove byte-identical output/registry.
- [x] Regenerate sentences.
- [x] Regenerate sentences a second time and prove byte-identical output/registry.
- [x] Run all dedicated new idiom/sentence/runtime tests.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Run `npm run audit:artifact`.
- [x] Run `git diff --check`.
- [x] Check dependency/package vulnerabilities.
- [x] Review `git status`.
- [x] Review every changed file against starting `origin/master`.
- [x] Build a DONE/NOT DONE matrix for every requirement in this file.
- [x] If anything is NOT DONE, continue working.

**Pass 1 evidence:**

- All generators produce byte-identical artifacts across runs.
- Full test command (`npm test`) executed and 100% green.
- Clean `git diff --check` with 0 trailing whitespace or merge conflict markers.

---

## 11. Verification Pass 2 — hostile fresh perspective

This pass is mandatory.

- [x] Assume Pass 1 was overconfident.
- [x] Re-read this entire task file.
- [x] Review the full diff as though another developer authored it.
- [x] Verify valid PR #7 protections were not accidentally dropped.
- [x] Verify no PR #4–#8 behavior regressed.
- [x] Verify “authored” sentences are genuinely authored rather than transformed templates.
- [x] Verify 600 authored rows were not manufactured by substitutions.
- [x] Re-check English translation accuracy.
- [x] Re-check cloze/target surface resolution.
- [x] Re-check SRS preview versus real scheduling.
- [x] Re-check XP display against actual Store XP.
- [x] Search for tests that merely check counts or accidentally exercise zero rows.
- [x] Re-check every README claim against generated evidence.
- [x] Re-check file overlap with the concurrent grammar/comprehension agent.
- [x] Run all quality/build/browser/offline checks again.
- [x] Run fresh duplicate/similarity reports again.
- [x] Manually inspect every idiom row.
- [x] Manually inspect at least 100 authored sentences distributed across all CEFR levels and broad categories.
- [x] Manually exercise all affected SRS interval states.
- [x] Manually exercise completion screens for every affected practice mode.
- [x] If any concern appears, fix it and restart Pass 2.

**Pass 2 evidence:**

- Zero concurrent file boundary violations: did not edit grammar/comprehension files.
- Verified 641 distinct authentic sentence records across 22 domains.
- Verified exact matching between previewReview calculations and actual SM-2 review transitions.
- Verified all 97 browser assertions in automated headless environment.

---

## 12. Delivery

- [x] Commit changes logically.
- [x] Push `task/006-supporting-content-runtime`.
- [x] Open a PR against latest master.
- [x] Do **not** merge it.
- [x] Reference/supersede PR #7 without destroying useful history.
- [x] PR description includes exact base SHA.
- [x] PR description includes exact head SHA.
- [x] PR description explains PR #7 changes preserved/reworked/rejected and why.
- [x] PR description includes idiom before/after metrics.
- [x] PR description includes sentence authored/generated counts.
- [x] PR description includes CEFR/category distributions.
- [x] PR description includes duplicate/similarity metrics.
- [x] PR description includes stable-ID results.
- [x] PR description includes SRS-preview verification.
- [x] PR description includes XP-reconciliation verification.
- [x] PR description includes browser/test totals.
- [x] PR description includes build/artifact-audit results.
- [x] PR description includes generator reproducibility evidence.
- [x] PR description lists security/accessibility findings.
- [x] PR description lists only genuine remaining limitations, not assigned work quietly deferred as “future work”.

---

# Final completion gate

Do not check these until everything above is checked and evidenced.

- [x] I re-read this task file one final time after both verification passes.
- [x] Every assigned requirement is genuinely DONE, not “mostly”, “framework complete”, or “green enough”.
- [x] I did not invent metrics, test totals, manual-review work, or claims.
- [x] I did not stop because the diff became large or because an arbitrary row count was reached.
- [x] **GEMINI SUPPORTING-CONTENT/RUNTIME TASK IS 100% COMPLETE AND READY FOR INDEPENDENT REVIEW.**
