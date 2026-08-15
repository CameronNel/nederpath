# HanaPath → NederPath replatform

NederPath now uses HanaPath’s application chassis and design system. Dutch data, generators, SRS, and backup validation come from NederPath.

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

## Authority

- Lexical / grammar / comprehension / sentence / idiom generators are authoritative.
- Independent lexical semantic acceptance is fail-closed (`acceptedRows: 0` / `6427`).
- SRS semantics are NederPath’s tested scheduler, not HanaPath review.

## Delivery

- Browser + installable PWA
- Service worker: `nederpath-v4-cache`, network-first, successful-response-only
- Native: `mobile/scripts/prepare-web.mjs` writes `mobile/www` without a service worker or Korean assets
- Android application id: `io.github.cameronnel.nederpath`
- Signing credentials are owner-controlled and not present in this repository

## Release

```
npm run release
```

blocks on generation, lexical gates, tests, production build, artifact audit, residue scan, and native payload generation.

## Known remaining work

- Full Android Gradle project / CI assemble is not yet a copy of HanaPath’s signed Play pipeline
- Formal Dutch exam banks do not exist and must not be fabricated
- Independent whole-corpus lexical semantic acceptance remains incomplete
