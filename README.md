# NederPath (Nederlands Leren & Meesterschap)

A calm, comprehensive, offline-first Dutch language-learning web application (PWA) designed around three core learning pillars: **Vocabulary**, **Grammar**, and **Comprehension**.

NederPath runs entirely in the browser, stores all state in local storage under the `nederpath-v1` namespace, and deploys automatically to GitHub Pages. Its Service Worker keeps the app shell and previously visited data banks available offline; a never-visited bank shows a recoverable retry state until connectivity returns.

Public Application URL: **`https://cameronnel.github.io/nederpath/`**

---

## Core Product Architecture

### 1. Exactly Three Learning Pillars

1. **Vocabulary (Woordenschat)**:
   - A deterministic Dutch word bank generated from curated core rows. The checked-in historical ID registry preserves every established word-to-ID owner while allowing conservative append-only growth.
   - **Learnability Policy**: Genuinely teachable curated lemmas and phrases are learnable (`learnable: true`); derived inflections (e.g. conjugated verb forms, derived plurals, participles, ordinals) serve as searchable dictionary reference entries (`learnable: false`).
   - Every learnable Dutch noun is taught and displayed with its gender article (**`de`** or **`het`**), e.g., `de tafel`, `het huis`.
   - Derived morphology is emitted only when the curated source row carries explicit form metadata. The generator does not guess missing noun, verb, or adjective forms. Word examples and corpus frequency remain `null` until sourced curation exists.
   - **10 Vocabulary Learning & Practice Modes**:
     1. *Flashcards (SRS)*: Tap/Space to reveal, 1–4 keyboard shortcuts, mobile touch taps, SM-2 scheduling, session completion summary. Prioritizes genuinely due SRS cards first before sampling from the curated learnable vocabulary bank.
     2. *De of Het Drill*: Fast-paced noun gender trainer with grammatical explanations and separate accuracy tracking.
     3. *Spelling & Typing*: Strict Dutch spelling and diacritic input with whitespace/capitalization normalization.
     4. *Fill in the Blank*: Sentence cloze with contextual distractors, stable per-card question model, and exact normalized grading.
     5. *Choose the Correct Word*: 4-option contextual multiple-choice practice with dynamic non-duplicate distractors.
     6. *Verb Conjugation Practice*: Present tense 'hij/zij' verb inflection drills with exact normalized validation against verified paradigm data.
     7. *Synonyms & Antonyms*: Vocabulary relationship practice with dynamic option pooling.
     8. *Plural & Diminutive Practice*: Morphology spelling rules trainer testing verified plural pairings.
     9. *Context Practice*: Situational word choice exercises.
     10. *Dictionary & Search Engine*: Search across the generated Dutch word bank, articles, English meanings, and base lemmas with filters for CEFR, Part of Speech, `de`/`het`, and Bookmarks. Clear visual badges distinguish curated lemmas, curated word groups, and derived reference forms.

2. **Grammar (Grammatica)**:
   - Exactly **120 structured grammar rules** organized across **8 CEFR sections** (A0 through C1).
   - Structural rules with syntactic highlights, breakdowns, common mistakes, and corrections.
   - **7 Interactive Exercise Types**:
     - Multiple choice questions
     - Fill-in-the-blank with hint chips
     - Typed verb conjugation and spelling
     - Sentence transformation (Active $\to$ Passive, Direct $\to$ Indirect, V2 $\to$ Subclause SOV)
     - Error correction (identifying and fixing grammatical errors)
     - Movable-token word-order reconstruction with independent duplicate-token identity
     - Article selection

3. **Comprehension (Begrijpend Lezen)**:
   - A compact, independently authored A1 reading collection covering daily routines, markets, cycling, and GP appointments. Synthetic topic-swapped padding has been removed; inventory size is not presented as a quality metric.
   - Each passage includes an English translation, key vocabulary glosses, reading time, grammar targets, and a four-question interactive quiz with explanations. Full quiz completion is required before persisting completion.

---

## 2. Supporting Content Banks

- **Idioms & Everyday Expressions ([`data/idioms.js`](data/idioms.js))**: Exactly **121** curated idioms, proverbs, and everyday conversational formulas across CEFR levels A1–B2. Each expression includes natural Dutch usage, English translations, literal glosses where applicable, communicative register, and examples. Managed via a deterministic, append-only ID registry ([`data/idiom_ids.json`](data/idiom_ids.json)).
- **Dutch Sentence Bank ([`data/sentences.js`](data/sentences.js))**: Exactly **641** genuinely authored Dutch benchmark and practice sentences covering 22 real-world domains and all 5 CEFR levels (A1 through C1 with $\ge 120$ sentences per level). Every sentence features verified Dutch surface target words, grammatical tags, English translations, and deterministic, append-only ID tracking ([`data/sentence_ids.json`](data/sentence_ids.json)).

---

## 3. 8-Section Learning Curriculum

| Section | Level | Topics Covered | Rules |
| :--- | :--- | :--- | :---: |
| **1. Fundamentals** | A0–A1 | Sounds & Spelling Rules, Pronouns, V2 Word Order, `de`/`het`, Plurals, Negation, `zijn`/`hebben` | 15 |
| **2. Core Grammar** | A1–A2 | Separable Verbs, Modals, Adjective `-e` rule, Diminutives, Reflexives, Imperatives, TMP Order | 15 |
| **3. Verb Systems & Tenses** | A2 | `'t kofschip`, Past (OVT), Perfect (VTT) with `hebben`/`zijn`, Continuous Aspect, Future | 15 |
| **4. Sentence Structure & Clauses** | A2–B1 | Subordinate Clauses (SOV), Relative Clauses, `om...te`, Pronominal `er` | 15 |
| **5. Intermediate Expansion** | B1 | Passives (`worden`/`zijn`), Impersonal Passives, Conditionals (`zou`), Particles | 15 |
| **6. Complex Syntax & Modality** | B1–B2 | Reported Speech, Verb Clusters (Red/Green), Infinitivus pro Participio (IPP) | 15 |
| **7. Advanced Register & Nuance** | B2 | Formal vs Informal Register, Cleft Sentences, Stylistic Inversion, Pragmatics | 15 |
| **8. Mastery & Stylistics** | C1 | Archaic/Formal Syntax, Dense Nominalization, Nested Clauses, Rhetoric | 15 |
| **Total** | | | **120** |

---

## Development, Build, and Testing

### Prerequisites
- Node.js (v24 recommended; v22.12+ required for puppeteer-core)
- Google Chrome, Chromium, or Microsoft Edge (cross-platform discovery for headless browser testing)

### Commands

```powershell
# Run the complete test suite (Audit + Unit/Smoke + Regression + Offline/SW + Headless Browser Tests)
npm test

# Build production distribution bundle into dist/ (runtime assets only)
npm run build

# Audit the production dist/ artifact for integrity and prohibited file exclusion
npm run audit:artifact

# Run quality audit checks across all data banks and assets
npm run audit

# Run unit and smoke tests
npm run test:unit

# Run targeted regression tests for learning-engine, idioms, sentences, and morphology integrity
npm run test:regression

# Run authoritative Service Worker and offline caching tests in VM sandbox
npm run test:offline

# Run Puppeteer headless browser tests (desktop & mobile viewports)
npm run test:browser

# Re-generate all data banks from curated sources
npm run build:data

# Launch the local zero-dependency development server (http://localhost:3000)
npm run serve
```

---

## Quality & Compliance Verification

- The checked-in word bank is non-empty, normalized, deterministic, and byte-reproducible from its curated cores and historical ID registry; tests derive inventory counts from the generated artifact rather than enforcing a marketing target.
- **0** learnable nouns without verified `de`/`het` article.
- **100%** of learnable nouns have `displayWord` formatted as `de [word]` or `het [word]`.
- **100%** of plural nouns and diminutive plurals carry article `de`.
- **120** grammar lessons with 7 exercise interaction types.
- **120** curated idioms with stable IDs, register classifications, and deterministic generation.
- **641** authored sentences with 100% surface target word validation across 22 domains and 5 CEFR levels (A1–C1).
- **Pure Spaced Repetition Previews**: Flashcard rating buttons (1–4) compute and display truthful predicted intervals (`1d`, `3d`, `6d`, etc.) dynamically via non-mutating SM-2 scheduler arithmetic.
- **Truthful Session XP**: Practice session completion screens display exact XP earned from active store deltas and use context-appropriate nouns (`kaarten`, `zinnen`, `vragen`, `woorden`, `werkwoorden`).
- **4** independently authored A1 comprehension passages with stable IDs and passage-specific quizzes.
- Automated audit, smoke, regression, offline, browser, build, and artifact checks run on every pull request.
- **Initial Runtime Transfer Budget**: ~718 KB uncompressed on Today view (target <= 1.5 MB); large curriculum banks are promise-cached and loaded only when needed.

---

## Deployment & Verification

- **Automated Workflow**: `.github/workflows/deploy.yml` validates pull requests (Audit, Smoke, Regression, Offline, Browser tests, Build, Artifact Audit) and builds a minimal `./dist` artifact deployed to GitHub Pages on `master` pushes with self-enabling `enablement: true`.
- **Deployment Status**: Production deployment executes automatically upon merge to `master`. Pull requests run validation only.

---

## Known Limitations

- **Audio/Voice Synthesis**: Pronunciation recordings, custom voice providers, and audio file playback are explicitly omitted and left out of scope for this release.
- **Server Sync**: NederPath is an offline-first client application; synchronization between multiple physical devices relies on manual JSON progress export and import via the Settings tab.
