# Replatform final audit

## Branch and source

- Branch: `gemini/hanapath-replatform`
- Base: PR #19 head `72a91f6587cd4dcf5ea55a5f8d195f2ddd4657f5` after `git pull`
- HanaPath main: `a219283be39a6d48fadd3495d1ec0fcba8f666cd`
- NederPath master: `aa0865121abe5bf331d08d050e02a5cdc21c1fe5`

## PR #19

CI failure was integration: idiom/sentence registries validated with the lexical-only allocator after the master merge. The generic allocator API is restored; word-bank defaults remain `nl-` + `normalizeLexicalForm`. Semantic acceptance remains fail-closed.

## Local verification (this machine)

- Audit: 83 passed
- Smoke: 11 passed
- Regression: 44 passed (including idioms + sentences)
- Review follow-up: 5 passed
- Sentence surface: 641 passed
- PR1 integrity: 13 passed
- PR1 boundaries: 5 passed
- Grammar quality: 10 passed
- Comprehension: 12 passed
- Offline/SW: 26 passed (`nederpath-v4-cache`)
- Browser: 122 passed, 0 failed (1280×800 and 375×667)
- Production build + artifact audit: 65 passed
- Residue audit: passed
- `mobile/scripts/prepare-web.mjs`: wrote 23 files, no SW, no Korean assets

## Incomplete (do not overclaim)

- Full Android Gradle/CI assemble and owner-controlled signing are not installed as a Play replica
- Formal Dutch exam banks do not exist; Exam tab is disabled/incomplete
- Independent lexical semantic acceptance remains `0 / 6427`
- Exact-head GitHub Actions on this branch must still run after push
