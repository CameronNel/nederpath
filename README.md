# NederPath

A calm, offline-first Dutch language-learning web app (vocabulary, grammar, comprehension).
NederPath is a separate product from HanaPath — its own runtime, data, storage namespace
(`nederpath-v1`) and repository.

## Status: work in progress (parked)

This repository is a mid-build snapshot. What exists and works:

- `scripts/generate_words.mjs` — Dutch word-bank generator with a rule-based inflection
  engine (verb stems, `'t kofschip` past tense, noun plurals/diminutives, adjective
  comparison, Dutch number names 0–999 + ordinals). Deterministic, exactly-20,000-row
  target with priority-based trimming.
- `data/words_core_1.js`, `data/words_core_2.js`, `data/words_core_3a.js` — curated Dutch
  lemma cores (function words, pronouns, top irregular verbs, ~750 everyday nouns).
  ~1,150 curated lemmas so far.
- `data/words.js` — generated output (partial preview at the moment).
- `scripts/generate_icons.mjs` + `icons/` — dependency-free PNG icon generator (calm dark
  tile with lime "N" monogram).
- `scripts/cleanup_dups.mjs` — one-off core-file cleanup utility.

Current generator output: **9,832 rows** of the required 20,000.

## Still to do

1. Author remaining curated cores (`words_core_3b.js`, `words_core_4.js`, `words_core_5.js`,
   `words_core_6a.js`, `words_core_6b.js`) to reach the 20,000-row target:
   - ~1,300 more nouns (body/health/clothing/transport/city/food/kitchen/shopping/B1–C1 abstract)
   - ~900 adjectives, ~250 adverbs, misc particles/phrases
   - format: `N(word, article, level, meaning, category, synonyms, pluralMeta)` with
     plural overrides (`"s"`, `"inv"`, `"=FULLPLURAL"`); verbs `V(word, level, meaning,
     category, "ik|hij|past|pastpl|pp")`; adjectives/adverbs `A()/D()` with comparison meta.
2. Sentence bank (5,000+), idioms (100+), grammar curriculum (120+ rules in 8 sections),
   comprehension passages (10+).
3. App runtime: `index.html`, `styles.css`, `js/` (store/SRS with `nederpath-v1`,
   vocabulary/grammar/comprehension tabs, onboarding, Today/Path/Words/Progress),
   `manifest.webmanifest`, `sw.js`.
4. `scripts/audit.mjs` (22 checks) and smoke tests.
5. Push to `github.com/CameronNel/nederpath` (repo does not exist yet; no GitHub auth on
   the machine that produced this snapshot).

## Commands

```powershell
node scripts/generate_icons.mjs   # icons
node scripts/generate_words.mjs   # data/words.js (needs 20k rows)
node --check scripts/*.mjs        # syntax
```

Voice/audio is intentionally deferred: no audio files, no speech provider, no microphone
access. A future provider-agnostic `nl-NL` voice integration point is planned (`js/voice.js`).
