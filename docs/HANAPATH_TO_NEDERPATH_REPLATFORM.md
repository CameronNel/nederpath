# HanaPath → NederPath replatform

NederPath uses HanaPath’s application chassis and design system. Dutch data, generators, SRS, and backup validation come from NederPath.

## Architecture

```
Leren
  Vandaag / Leerpad / Woorden / Grammatica / Lezen / Herhalen
Examen
  architecture present, Dutch formal exams disabled
Voortgang
  XP, streak, mastery, heatmap, SRS load
```

Runtime remains a static vanilla PWA. No React/Vue/Svelte/Tailwind.

Onboarding runs once for a fresh learner, then the three-tab shell. Browser Back is consumed by in-app detail/hub navigation until Learn root.

Words, grammar, and reading lists use HanaPath level rails and study rows. Lesson/exercise players remain the validated Dutch interaction code.

## Authority

- Lexical / grammar / comprehension / sentence / idiom generators are authoritative.
- Independent lexical semantic acceptance is fail-closed (`acceptedRows: 0` / `6427`).
- SRS semantics are NederPath’s tested scheduler, not HanaPath review.
- `js/exam_integrity.js` is the provenance module. Formal results cannot be created until a reviewed Dutch bank exists. Practice taint cannot become a formal pass.

## Delivery

- Browser + installable PWA
- Service worker: `nederpath-v4-cache`, network-first, successful-response-only
- Native: `mobile/scripts/prepare-web.mjs` writes `mobile/www` without a service worker or Korean assets
- Android application id: `io.github.cameronnel.nederpath`
- CI assembles an unsigned debug APK. Upload signing is owner-controlled via `NEDERPATH_UPLOAD_*` and fail-closed when unset.

## Release

```
npm run release
```

blocks on generation, lexical gates, grammar/comprehension/sentence/SRS/exam-integrity tests, browser + viewport suites, production build, artifact audit, residue scan, and native payload audit.

## Known remaining work

- Formal Dutch exam banks do not exist and must not be fabricated
- Independent whole-corpus lexical semantic acceptance remains incomplete
- Play Store upload signing is intentionally unconfigured in this repository
