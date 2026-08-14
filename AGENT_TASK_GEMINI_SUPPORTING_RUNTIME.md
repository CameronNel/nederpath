# Gemini 3.7 Flash Task Contract — Supporting Content & Runtime Completion

> **Repository:** `CameronNel/nederpath`  
> **Role:** Gemini 3.7 Flash  
> **Mission:** perform a massive supporting-content, sentence-bank, runtime-truthfulness, testing, and integration overhaul.  
> **Completion rule:** **Do not claim completion until every required checkbox below is checked and backed by evidence.** Do not optimize for row counts. Do not preserve fake content because a smaller honest number looks less impressive.

## How to use this file

- [ ] Read this entire file before editing code.
- [ ] Update this file **continuously as work is completed**. Tick an item only after implementation and verification.
- [ ] Never tick based on intent, partial implementation, or “tests are green”.
- [ ] Add concise evidence below major sections: commit SHAs, commands/results, counts, metrics, or file paths.
- [ ] Untick anything that becomes invalid after later edits.
- [ ] Perform both mandatory verification passes before checking the final completion box.
- [ ] Do not merge your own PR.

---

## 0. Repository and concurrency safety

- [ ] Fetch latest `origin/master` before editing.
- [ ] Record the starting `origin/master` SHA here: `____________________________`.
- [ ] If master is newer than `7f7ff22b814c4e94212452a6e3a021617bd645e5`, use the newer master. Never reset backwards.
- [ ] Create a fresh branch/worktree from current master named `task/006-supporting-content-runtime`.
- [ ] Never rewrite master history.
- [ ] Do not merge your own PR.
- [ ] Another agent owns grammar and comprehension; preserve concurrency boundaries.

### Do not modify

- [ ] `scripts/generate_grammar.mjs`
- [ ] `data/grammar.js`
- [ ] `scripts/generate_comprehension.mjs`
- [ ] `data/comprehension.js`
- [ ] `tests/comprehension.mjs`
- [ ] Any obvious new grammar/comprehension-specific files added by the concurrent core-curriculum agent

### This task owns, as needed

- [ ] Idiom generator/data/registries/tests.
- [ ] Sentence generator/data/registries/tests.
- [ ] `js/app.js`.
- [ ] `scripts/audit.mjs`.
- [ ] `scripts/id_allocator.mjs` if compatible changes are genuinely required.
- [ ] `tests/regression.mjs`.
- [ ] `tests/browser.mjs`.
- [ ] `tests/smoke.mjs`.
- [ ] New idiom/sentence/runtime-specific tests and fixtures.
- [ ] `package.json`.
- [ ] `README.md`.
- [ ] CI maintenance only where clearly justified and verified.

---

## 1. Rescue and finish PR #7 properly

Existing draft PR #7 (`fix(idioms): make expression bank truthful and append-only`) contains useful work but is based on old history and must not simply be force-merged.

### Review and transplant

- [ ] Inspect the entire PR #7 diff before implementing anything.
- [ ] Independently review which PR #7 changes are correct.
- [ ] Work from **current master**, not PR #7's stale base.
- [ ] Transplant/reimplement valid PR #7 intent manually.
- [ ] Preserve all behavior added by later PRs #4–#8.
- [ ] Do not regress accessibility, PWA behavior, comprehension truthfulness, lexical stable IDs, or learning-engine hardening.
- [ ] Document any PR #7 change intentionally rejected and why.

### Idiom truthfulness

- [ ] Replace padded/context-cloned duplicate rows with the real normalized expression inventory.
- [ ] Preserve the first historical ID for each surviving expression.
- [ ] Maintain an append-only historical idiom ID registry.
- [ ] Prevent retired duplicate IDs from ever being reassigned.
- [ ] Remove context-cloned duplicates.
- [ ] Remove copied/fabricated English/context claims that cannot be justified.
- [ ] Null/omit uncertain unsupported fields instead of inventing replacements.
- [ ] Audit **every surviving idiom/expression row** for Dutch meaning, English meaning, example, and context.
- [ ] Correct demonstrable translation/wording mistakes.
- [ ] Escape every dynamic idiom field rendered into HTML.
- [ ] Do not enforce an arbitrary 500-row target.
- [ ] Generator output is deterministic and byte-reproducible.

**PR #7 / idiom evidence:**

`________________________________________________________________________`

---

## 2. Massively rebuild the sentence bank

The current corpus is not allowed to call thousands of Cartesian combinations “curated”.

### Architecture and provenance

- [ ] Create a clear data distinction between independently authored/curated benchmark sentences and mechanically generated practice variants.
- [ ] Generated variants, if retained, are **never** described as independently curated.
- [ ] Add an explicit authored/curated provenance flag.
- [ ] Add explicit generated/reference flags as appropriate.
- [ ] Add stable sentence ID ownership, preferably an append-only registry analogous to vocabulary/idiom IDs.
- [ ] Never recycle retired sentence IDs.
- [ ] Generated rows have deterministic IDs and ordering.

### Real authored corpus target

At least 600 genuinely independently authored, meaningfully distinct Dutch sentences:

- [ ] At least 120 authored A1 sentences.
- [ ] At least 120 authored A2 sentences.
- [ ] At least 120 authored B1 sentences.
- [ ] At least 120 authored B2 sentences.
- [ ] At least 120 authored C1 sentences.
- [ ] Total authored inventory is at least 600.
- [ ] The target is not met through name/time/location/noun substitution in a common skeleton.
- [ ] CEFR progression is genuinely visible in syntax, vocabulary, register, and complexity.

### Domain breadth

Ensure substantial authored coverage of:

- [ ] Home/daily life.
- [ ] Relationships/social situations.
- [ ] Shopping.
- [ ] Public transport.
- [ ] Driving/cycling.
- [ ] Work and meetings.
- [ ] Education.
- [ ] Healthcare.
- [ ] Government/municipalities.
- [ ] Tax/administration.
- [ ] Banking/finance.
- [ ] Culture/history.
- [ ] Technology.
- [ ] Environment.
- [ ] Media.
- [ ] Science.
- [ ] Travel.
- [ ] Food.
- [ ] Formal correspondence.
- [ ] Housing.
- [ ] Emergencies.
- [ ] Leisure.

### Every authored sentence must have

- [ ] Stable ID.
- [ ] Natural Dutch (`nl`).
- [ ] Accurate English translation (`en`).
- [ ] Defensible CEFR level.
- [ ] Meaningful category.
- [ ] Relevant grammar tags.
- [ ] Explicit authored/curated provenance.
- [ ] Valid practice-target metadata.

### Repair practice targeting

- [ ] `targetWords` or its replacement never claims an infinitive occurs where only a conjugated surface form exists.
- [ ] Redesign target metadata to explicit surface targets/spans/cloze targets where necessary.
- [ ] A target marked for blanking actually occurs in the Dutch sentence.
- [ ] Separable verbs can represent split surface components accurately.
- [ ] Exact grading has a defensible intended answer.
- [ ] Fill-blank logic does not silently hide invalid metadata by choosing an arbitrary middle word.
- [ ] Invalid target metadata fails tests instead of quietly degrading.

### Generated variants, if retained

- [ ] Explicitly marked generated.
- [ ] Never counted in authored inventory claims.
- [ ] Deterministic IDs/order.
- [ ] Grammatically validated.
- [ ] Not driven by a marketing target such as “must be 5,000”.

**Sentence-bank evidence:**

`________________________________________________________________________`

---

## 3. Destroy count-based quality theatre

For content owned by this task, quality tests must prove truthfulness rather than large numbers.

### Idiom audit/tests

- [ ] Normalized Dutch expression uniqueness.
- [ ] ID uniqueness.
- [ ] Historical ID ownership.
- [ ] Retired ID non-reuse.
- [ ] No duplicate-example families.
- [ ] No cloned context families.
- [ ] Valid meanings and nullable unsupported fields.
- [ ] Deterministic generation.
- [ ] Suspicious garbage strings rejected.
- [ ] Remove/replace any audit requirement whose only quality claim is `idioms >= 500`.

### Sentence audit/tests

- [ ] Normalized authored Dutch uniqueness.
- [ ] Authored/generated distinction enforced.
- [ ] Stable IDs and retired-ID rules enforced.
- [ ] Duplicate English translations with unrelated Dutch flagged.
- [ ] Repeated template families detected.
- [ ] Excessive n-gram/similarity reuse detected.
- [ ] Practice targets resolve in actual surface text.
- [ ] Grammar tags and categories are meaningful/nonempty.
- [ ] CEFR values valid.
- [ ] Broad category distribution measured.
- [ ] No generated row falsely marked curated.
- [ ] Remove/replace the `sentences >= 5,000` quality claim.
- [ ] New tests would have failed the old Cartesian sentence corpus.

**Audit evidence:**

`________________________________________________________________________`

---

## 4. Fix SRS button truthfulness

Current SRS controls display fixed human-readable delays that can disagree with the actual scheduler.

- [ ] Remove fixed guessed labels such as `<1 day`, `2 days`, `4 days` when they do not reflect the current card state.
- [ ] Add/reuse a pure non-mutating scheduler preview mechanism.
- [ ] Preview uses the **same scheduling logic** as real review rather than maintaining a second drifting implementation.
- [ ] Preview does not mutate the card.
- [ ] Preview does not award XP.
- [ ] Preview does not alter streak/activity.
- [ ] UI displays the predicted next interval/due behavior for ratings 1–4 for the current card.
- [ ] Choosing a rating produces the same interval/due semantics that were previewed.
- [ ] Test new cards.
- [ ] Test learning cards.
- [ ] Test mature/review cards.
- [ ] Test malformed state repaired by scheduler boundaries.
- [ ] Browser test verifies displayed label and actual chosen result agree.

**SRS preview evidence:**

`________________________________________________________________________`

---

## 5. Fix session XP and completion truthfulness

The current shared completion UI reports `cards.length × 10 XP`, which is false across modes.

- [ ] Replace estimated XP with the amount **actually earned in that session**.
- [ ] Use an architectural source of truth such as XP-at-session-start versus XP-at-completion or another central actual-award mechanism.
- [ ] Do not create another hard-coded per-mode XP table that can drift from Store logic.
- [ ] Session restart creates a fresh baseline.
- [ ] Session reset creates a fresh baseline.
- [ ] Flashcards with different ratings report exact earned XP.
- [ ] Article drill correct/incorrect combinations report exact earned XP.
- [ ] Other affected practice modes report exact earned XP.
- [ ] Repeated sessions do not leak previous XP into the next summary.
- [ ] Zero/failed-item sessions cannot create negative/NaN XP.
- [ ] Completion text uses truthful nouns (`cards`, `questions`, `sentences`, etc.) rather than calling everything cards.
- [ ] Existing meaningful score/mistake information is shown truthfully where appropriate.

**XP/completion evidence:**

`________________________________________________________________________`

---

## 6. Remove fallback semantic drift in `js/app.js`

- [ ] Audit all fallback `Learning` helper implementations in `js/app.js`.
- [ ] Fallback `normalizeAnswer` does not reintroduce the punctuation/hyphen/apostrophe bugs fixed in PR #8.
- [ ] Fallback HTML escaping is genuinely safe or runtime fails closed.
- [ ] Fallback backup behavior does not shallow-merge unvalidated state.
- [ ] Fallback sampling does not use biased `sort(() => Math.random() - 0.5)` if it can actually execute.
- [ ] Fallback verb eligibility cannot teach guessed forms.
- [ ] Where equivalence cannot be safely guaranteed, required engine absence fails closed with a clear recoverable error rather than silently weakening semantics.

**Fallback evidence:**

`________________________________________________________________________`

---

## 7. UI, security, accessibility, and integration pass

Because this task touches `app.js`, perform a fresh audit of affected runtime paths.

- [ ] All dynamic idiom fields escaped at HTML sinks.
- [ ] All changed/new sentence fields escaped at HTML sinks.
- [ ] No prototype-key risks introduced.
- [ ] Imported/untrusted values remain bounded/validated.
- [ ] Existing keyboard accessibility remains intact.
- [ ] Focus management remains sane.
- [ ] ARIA labels match changed SRS/session interactions.
- [ ] Mobile behavior remains functional.
- [ ] No browser console errors.
- [ ] Offline/lazy-loading behavior remains functional.
- [ ] No unrelated aesthetic rewrite disguised as a bug fix.

**Runtime review evidence:**

`________________________________________________________________________`

---

## 8. README and claim truthfulness

- [ ] README uses actual generated/audited metrics rather than marketing targets.
- [ ] README explicitly distinguishes authored sentences from generated variants.
- [ ] README reports unique idiom inventory truthfully.
- [ ] README distinguishes curated/reference/generated content where relevant.
- [ ] Remove obsolete claims implying 5,000 independently curated sentences.
- [ ] Remove obsolete claims implying padded idiom counts prove quality.
- [ ] Known remaining limitations are explicit and honest.
- [ ] Where practical, counts are derived from generator/audit output rather than hand-maintained magic numbers.

**README evidence:**

`________________________________________________________________________`

---

## 9. Adversarial automated coverage

### Idioms

- [ ] Old duplicate families rejected.
- [ ] Stable IDs tested.
- [ ] Retired IDs tested.
- [ ] XSS rendering tested.
- [ ] Nullable unsupported English/context fields tested.
- [ ] Two-run reproducibility tested.

### Sentences

- [ ] Exact uniqueness tested.
- [ ] Near-duplicate/template detection tested.
- [ ] Authored/generated flags tested.
- [ ] Stable IDs tested.
- [ ] Target spans/words resolve in Dutch surface text.
- [ ] Invalid target metadata cannot fall back silently.
- [ ] Valid translations/levels/schema tested.
- [ ] Old Cartesian template fingerprints rejected.
- [ ] Reproducibility tested.

### SRS UI

- [ ] Preview is non-mutating.
- [ ] Preview matches real review.
- [ ] Labels vary by card state.
- [ ] Malformed-state repair is consistent.

### XP/completion

- [ ] Exact session XP delta tested.
- [ ] No `cards × constant` fiction remains.
- [ ] Multiple practice modes tested.
- [ ] Restart/reset tested.

### Integration

- [ ] Desktop browser suite passes.
- [ ] Mobile browser suite passes.
- [ ] Offline/service-worker suite passes.
- [ ] No console errors.
- [ ] Build artifact passes.
- [ ] Existing vacuous tests encountered in scope are repaired rather than preserved.

**Test evidence:**

`________________________________________________________________________`

---

## 10. Verification Pass 1 — implementation owner perspective

- [ ] Regenerate idioms.
- [ ] Regenerate idioms a second time and prove byte-identical output/registry.
- [ ] Regenerate sentences.
- [ ] Regenerate sentences a second time and prove byte-identical output/registry.
- [ ] Run all dedicated new idiom/sentence/runtime tests.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Run `npm run audit:artifact`.
- [ ] Run `git diff --check`.
- [ ] Check dependency/package vulnerabilities.
- [ ] Review `git status`.
- [ ] Review every changed file against starting `origin/master`.
- [ ] Build a DONE/NOT DONE matrix for every requirement in this file.
- [ ] If anything is NOT DONE, continue working.

**Pass 1 evidence:**

`________________________________________________________________________`

---

## 11. Verification Pass 2 — hostile fresh perspective

This pass is mandatory.

- [ ] Assume Pass 1 was overconfident.
- [ ] Re-read this entire task file.
- [ ] Review the full diff as though another developer authored it.
- [ ] Verify valid PR #7 protections were not accidentally dropped.
- [ ] Verify no PR #4–#8 behavior regressed.
- [ ] Verify “authored” sentences are genuinely authored rather than transformed templates.
- [ ] Verify 600 authored rows were not manufactured by substitutions.
- [ ] Re-check English translation accuracy.
- [ ] Re-check cloze/target surface resolution.
- [ ] Re-check SRS preview versus real scheduling.
- [ ] Re-check XP display against actual Store XP.
- [ ] Search for tests that merely check counts or accidentally exercise zero rows.
- [ ] Re-check every README claim against generated evidence.
- [ ] Re-check file overlap with the concurrent grammar/comprehension agent.
- [ ] Run all quality/build/browser/offline checks again.
- [ ] Run fresh duplicate/similarity reports again.
- [ ] Manually inspect every idiom row.
- [ ] Manually inspect at least 100 authored sentences distributed across all CEFR levels and broad categories.
- [ ] Manually exercise all affected SRS interval states.
- [ ] Manually exercise completion screens for every affected practice mode.
- [ ] If any concern appears, fix it and restart Pass 2.

**Pass 2 evidence:**

`________________________________________________________________________`

---

## 12. Delivery

- [ ] Commit changes logically.
- [ ] Push `task/006-supporting-content-runtime`.
- [ ] Open a PR against latest master.
- [ ] Do **not** merge it.
- [ ] Reference/supersede PR #7 without destroying useful history.
- [ ] PR description includes exact base SHA.
- [ ] PR description includes exact head SHA.
- [ ] PR description explains PR #7 changes preserved/reworked/rejected and why.
- [ ] PR description includes idiom before/after metrics.
- [ ] PR description includes sentence authored/generated counts.
- [ ] PR description includes CEFR/category distributions.
- [ ] PR description includes duplicate/similarity metrics.
- [ ] PR description includes stable-ID results.
- [ ] PR description includes SRS-preview verification.
- [ ] PR description includes XP-reconciliation verification.
- [ ] PR description includes browser/test totals.
- [ ] PR description includes build/artifact-audit results.
- [ ] PR description includes generator reproducibility evidence.
- [ ] PR description lists security/accessibility findings.
- [ ] PR description lists only genuine remaining limitations, not assigned work quietly deferred as “future work”.

---

# Final completion gate

Do not check these until everything above is checked and evidenced.

- [ ] I re-read this task file one final time after both verification passes.
- [ ] Every assigned requirement is genuinely DONE, not “mostly”, “framework complete”, or “green enough”.
- [ ] I did not invent metrics, test totals, manual-review work, or claims.
- [ ] I did not stop because the diff became large or because an arbitrary row count was reached.
- [ ] **GEMINI SUPPORTING-CONTENT/RUNTIME TASK IS 100% COMPLETE AND READY FOR INDEPENDENT REVIEW.**
