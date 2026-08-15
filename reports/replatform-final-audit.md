# Replatform final audit

Regenerated from executable state at head `d7a9003869fa0c05c2d2b878286c31dfe96b7512` plus the history/generation/residue follow-up on this working tree.

## Source

| Item | Value |
|---|---|
| Branch | `gemini/hanapath-replatform` |
| HanaPath `main` | `a219283be39a6d48fadd3495d1ec0fcba8f666cd` |
| NederPath `master` | `aa0865121abe5bf331d08d050e02a5cdc21c1fe5` |
| PR #19 head used as base | `72a91f6587cd4dcf5ea55a5f8d195f2ddd4657f5` |
| Draft PR | #23 |

## PR #19

CI failure was integration: idiom/sentence registries were validated with the word-only allocator after the master merge. Generic namespace API restored. Semantic acceptance remains fail-closed: `acceptedRows: 0`, `totalRows: 6427`, `independentAcceptance: false`, `status: INCOMPLETE`.

## Local verification

| Suite | Result |
|---|---|
| Audit | 85 passed |
| Smoke | 11 passed |
| Regression | 44 passed |
| Review follow-up | 5 passed |
| Sentence surface | 641 passed |
| PR1 integrity | 13 passed |
| PR1 boundaries | 5 passed |
| Grammar quality | 10 passed |
| Comprehension | 12 passed |
| Exam integrity | 7 passed |
| Offline / SW | 26 passed (`nederpath-v4-cache`) |
| Browser | 125 passed, including Grammar/Lezen/Herhalen `history.back()` E2Es |
| Viewport | 49 passed (360×800 through 1440×900, including `tweehonderdeenentwintigste`) |
| Production build + artifact audit | 71 passed |
| Residue audit | passed (Korean terms and old Neder shell selectors fail closed, including in CSS) |
| Native payload | 25 allowlisted files; SW excluded |

## Exact-head GitHub Actions (pre-follow-up head `d7a9003`)

- Validate Quality & Artifact Integrity: success
- Android debug assemble: success
- Pages deploy: skipped (not `master`)

Follow-up on this tree must re-run exact-head Actions after push.

## Incomplete (not defects)

- Independent lexical semantic acceptance remains `0 / 6427`
- Formal Dutch exam banks do not exist; Exam tab is disabled
- Play Store upload signing remains owner-controlled and unset
- Unused generic (non-Korean) HanaPath CSS selectors may remain in the transplanted stylesheet
