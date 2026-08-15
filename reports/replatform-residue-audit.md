# Residue audit

Runtime files scanned: `index.html`, `js/*`, `sw.js`, `manifest.webmanifest`, `css/styles.css`.

## Korean / HanaPath

| Finding | Classification |
|---|---|
| No Korean datasets in production payload | PASS |
| No Hangul/jamo/audio_map/korean CSV references in JS/HTML/SW | PASS |
| Noto Sans KR not packaged | PASS |
| HanaPath comments in CSS rewritten | PASS |
| Unused transplanted CSS selectors (non-Korean names) | HISTORICAL_ONLY / unused |

## Legacy Neder UI

| Finding | Classification |
|---|---|
| `.app-header` / `.main-nav` / `.header-stats` removed from HTML | PASS |
| Seven-tab primary nav removed | PASS |
| Today hero removed | PASS |
| Permanent practice emoji strip removed | PASS |

## Remaining limitations

- Transplanted HanaPath CSS still contains unused generic lesson-player selectors that are not Korean-named.
- Android debug assemble is wired in CI; upload signing is fail-closed and owner-controlled.
