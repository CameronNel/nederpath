# Replatform survival map

Classification is by responsibility, not filename.

## PORT_HANA_PATTERN

- Application shell, safe-area, bottom nav, settings shortcut, detail bar
- Surface / accent / light-dark / reduced-motion design system
- Study-row / card / pill / progress-bar component language
- Hub → internal screen hierarchy
- Browser-back / history for nested screens
- Capacitor prepare-web allowlist model
- Formal exam tab as architecture, not a dump of Korean banks

## GENERALIZE_HANA

- Theme defs (accent family + appearance)
- Native payload script (remove Korean CSVs, audio, Hangul plugins)
- Exam integrity ideas (practice taint, immutable history) — shipped as disabled/incomplete for Dutch

## MIGRATE_NEDER_DOMAIN

- `data/words_core_*.js`, `data/word_ids.json`, generators, audits
- Grammar source (`scripts/grammar/`, 120 lessons)
- Comprehension source (`scripts/comprehension/`, 120 passages)
- Sentence source + `data/sentence_ids.json`
- Idiom source + `data/idiom_ids.json`
- Stable IDs, fail-closed semantic acceptance evidence

## MIGRATE_NEDER_BEHAVIOR

- `js/srs.js` scheduling
- `js/learning.js` pools, morphology, fill-blank, backup validation
- `js/store.js` `nederpath-v1` state
- `js/data-loader.js` lazy banks, timeout/retry
- `js/voice.js` Dutch Web Speech
- Network-first SW freshness (`nederpath-v4-cache`)
- Accessibility: aria-pressed, live region, skip link, 1 dag/dagen, accent-insensitive search

## REWRITE_ADAPTER

- `js/app.js` routing/render — HanaPath hub model + Dutch players
- `index.html` — three-tab shell
- Settings appearance/accent/reduceMotion mapped onto existing store

## DELETE_HANA_DOMAIN

- Hangul lessons, handwriting, jamo, Korean audio/maps
- Korean exam banks and eligibility shards
- Noto Sans KR
- `hanapath-v1` storage
- Google auth remains unused/disabled

## DELETE_NEDER_LEGACY

- Seven-tab `.app-header` / `.main-nav` / `.header-stats`
- Today hero + permanent practice-mode emoji strip
- Calm Nordic/Dutch Slate CSS
- Catalog-card as the primary word UI (study rows + retained test-facing word cards)

## HISTORICAL_ONLY

- PR #7 idiom branch
- PR #21 CSS patch (invariant kept)
- Agent task contracts

## INVESTIGATE

- Full Capacitor Android Gradle tree (scaffolded payload only in this PR; signing remains owner-controlled and fail-closed)
- Unused transplanted CSS selectors that are not Korean-named
