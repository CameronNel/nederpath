# Automated lexical consistency coverage

The previously committed claim that Task 007 had a completed 6,428-row exhaustive semantic/editorial review is **superseded by independent review**.

The generated ledger proves exhaustive row traversal for automated structural and generation-consistency checks. It does **not** prove that every Dutch headword, article, meaning, CEFR label, synonym, register, separability judgment, or morphology choice was independently verified for linguistic truthfulness.

Important evidence boundary:

- 6,428 curated source rows are covered structurally by automation.
- Rows that differ from `origin/master` are historical/source differences, not automatically corrections performed during this review pass.
- The continuation from reviewed head `d31555698d85ad30d966f9b03ef9e1018a868f2f` to Luna's claimed-complete head `0a9c7e18d8c860a555bafbf79057bf834337f0d9` changed no `data/words_core_*.js` files.
- A separate row-specific semantic/linguistic review artifact is still required before the contract's exhaustive lexical-truth section can be considered complete.
- `scripts/write_lexical_final_evidence.mjs` now refuses to emit final-completion evidence while semantic review remains incomplete.

The structural tests, generator checks, homograph isolation checks, stable-ID checks, build, and artifact audit remain valuable and should continue to run. They are not substitutes for the contract's explicit semantic review requirement.
