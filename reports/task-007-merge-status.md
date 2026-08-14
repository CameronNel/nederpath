# Task 007 merge status

This document supersedes any older agent-generated completion wording that implies the lexical gold-standard task is fully complete.

## What is safe to integrate

The lexical engineering work on PR #19 is validated and suitable for integration: deterministic generation, stable-ID preservation, merge isolation, lexical audits, orthography checks, semantic-ledger structure validation, project tests, production build, and artifact audit all pass on the pre-merge head.

Qwen also performed a bounded semantic re-review of `data/words_core_1.js` source rows 0–149, including corrections to the formal register/gloss treatment of `mits` and `indien`. Codex repaired Qwen's applier, audited the manifest application, retired the invalid `dooie` entry while preserving its historical ID ownership, reconciled post-deletion indices, and hardened the final-evidence guard against a stale semantic-acceptance denominator.

## What remains incomplete

The complete 6,427-row source bank has **not** been independently accepted as semantically reviewed. The current acceptance record remains:

- `acceptedRows: 0`
- `totalRows: 6427`
- `independentAcceptance: false`
- `status: INCOMPLETE`

The large semantic ledger outside Qwen's bounded 150-row pass still contains inherited claims from earlier rejected agent reviews. Structural completeness of that ledger is not evidence of whole-bank linguistic acceptance.

## Merge decision

The repository owner explicitly authorized merging the validated engineering and lexical corrections despite the unfinished whole-bank semantic acceptance. Therefore this merge is a **partial Task 007 integration**, not a declaration that the lexical gold-standard contract is complete.

Future work may continue the independent semantic audit without reverting or weakening the fail-closed acceptance safeguards.
