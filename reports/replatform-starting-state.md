# Replatform starting state

Recorded before implementation on `gemini/hanapath-replatform`.

## Source SHAs

| Repository | Branch | SHA |
|---|---|---|
| CameronNel/hanapath | main | `a219283be39a6d48fadd3495d1ec0fcba8f666cd` |
| CameronNel/nederpath | master | `aa0865121abe5bf331d08d050e02a5cdc21c1fe5` |
| CameronNel/nederpath | task/007-lexical-gold-standard (PR #19 head) | `72a91f6587cd4dcf5ea55a5f8d195f2ddd4657f5` |

Working branch: `gemini/hanapath-replatform` created from the pulled PR #19 head.

## Open NederPath PRs at start

| PR | Title | Head | Notes |
|---|---|---|---|
| #19 | feat: harden lexical pipeline and integrate reviewed corrections | `72a91f6` | CI red: generic ID allocator lost in master merge |
| #21 | fix(mobile): wrap long Dutch compound words inside flashcards | `4268fa4` | CSS patch not imported; wrap invariant reimplemented |
| #7 | fix(idioms): make expression bank truthful and append-only | `ebb0a18` | Not used; master/generator superseded it |

## PR #19 CI

Exact-head run `31846896611` failed in `Validate Quality & Artifact Integrity`.

Cause: after merging current master, `generate_idioms.mjs` / `generate_sentences.mjs` and regression tests called `validateRegistry(registry, { prefix, normalize })`, but the lexical-branch allocator still used `normalizeLexicalForm` + `nl-` only. Failures:

- `nu komt de aap uit de mouw` → `idm-0001`
- `als het morgen mooi weer is, gaan we picknicken in het vondelpark.` → `snt-05238`

Classification: integration, not a lexical-data defect.

Decision: base the replatform on the corrected #19 head (allocator API restored, lexical defaults preserved).

## Pre-existing data counts (executable)

- Lexical source rows: 6427
- Generated word forms: 10818
- Grammar lessons: 120 (`g-001`–`g-120`)
- Comprehension passages: 120 (24 per A1/A2/B1/B2/C1)
- Sentences: 641
- Idioms: 121
- Independent lexical semantic acceptance: `acceptedRows: 0`, `totalRows: 6427`, `independentAcceptance: false`, `status: INCOMPLETE`

## Identifiers

- Storage key: `nederpath-v1` (must be retained)
- Service worker cache before this work: `nederpath-v3-cache`
- PWA name: NederPath
- No Capacitor project existed on NederPath master

## Known pre-existing failures

- PR #19 exact-head CI red (allocator merge, above)
- Lexical independent semantic review remains fail-closed
- Formal Dutch exams do not exist
