# NederPath (Nederlands Leren & Meesterschap)

A calm, comprehensive, offline-first Dutch language-learning web application (PWA) designed around three core learning pillars: **Vocabulary**, **Grammar**, and **Comprehension**.

NederPath runs entirely in the browser, stores all state in local storage under the `nederpath-v1` namespace, operates 100% offline via its built-in Service Worker, and deploys automatically to GitHub Pages.

Public Application URL: **`https://cameronnel.github.io/nederpath/`**

---

## Core Product Architecture

### 1. Exactly Three Learning Pillars

1. **Vocabulary (Woordenschat)**:
   - Exactly **20,000 unique Dutch word-form rows** with frequency ranks and CEFR levels (A1–C1).
   - Every learnable Dutch noun is taught and displayed with its gender article (**`de`** or **`het`**), e.g., `de tafel`, `het huis`.
   - Comprehensive morphology: noun plurals, diminutives, verb stems, `'t kofschip` past tenses, irregular ablaut principal parts, separable prefixes (`scheidbare werkwoorden`), and adjective `-e` inflections.
   - **10 Vocabulary Learning & Practice Modes**:
     1. *Flashcards (SRS)*: Tap/Space to reveal, 1–4 keyboard shortcuts, mobile touch taps, SM-2 scheduling, session completion summary. Prioritizes genuinely due SRS cards first before sampling from the full 20,000-word bank.
     2. *De of Het Drill*: Fast-paced noun gender trainer with grammatical explanations and separate accuracy tracking.
     3. *Spelling & Typing*: Strict Dutch spelling and diacritic input with whitespace/capitalization normalization.
     4. *Fill in the Blank*: Sentence cloze with contextual distractors, stable per-card question model, and exact normalized grading.
     5. *Choose the Correct Word*: 4-option contextual multiple-choice practice with dynamic non-duplicate distractors.
     6. *Verb Conjugation Practice*: Present tense 'hij/zij' verb inflection drills with exact normalized validation against verified paradigm data.
     7. *Synonyms & Antonyms*: Vocabulary relationship practice with dynamic option pooling.
     8. *Plural & Diminutive Practice*: Morphology spelling rules trainer testing verified plural pairings.
     9. *Context Practice*: Situational word choice exercises.
     10. *20,000-Word Dictionary*: Sub-millisecond search across Dutch words, articles, English meanings, and lemmas with filters for CEFR, Part of Speech, `de`/`het`, and Bookmarks.

2. **Grammar (Grammatica)**:
   - Exactly **120 structured grammar rules** organized across **8 CEFR sections** (A0 through C1).
   - Comprehensive structural rules, authentic examples with syntactic highlights, structural breakdowns, common mistakes, and corrections.
   - **7 Interactive Exercise Types**:
     - Multiple choice questions
     - Fill-in-the-blank with hint chips
     - Typed verb conjugation and spelling
     - Sentence transformation (Active $\to$ Passive, Direct $\to$ Indirect, V2 $\to$ Subclause SOV)
     - Error correction (identifying and fixing grammatical errors)
     - Movable-token word-order reconstruction with independent duplicate-token identity
     - Article selection

3. **Comprehension (Begrijpend Lezen)**:
   - Exactly **120 progressive Dutch reading passages** systematically balanced across CEFR levels:
     - **24 A1 Passages** (Daily routines, markets, cycling, GP appointments, shopping, home life)
     - **24 A2 Passages** (King's Day, Sinterklaas, waste sorting, houseboats, healthcare system, sports clubs)
     - **24 B1 Passages** (The Polder Model, Delta Works, housing shortages, Dutch directness, circular economy, Rembrandt)
     - **24 B2 Passages** (Nitrogen crisis, childcare benefits scandal, AI in workplace, euthanasia ethics, media monopolies)
     - **24 C1 Passages** (Landscape semiotics, linguistic purism, separation of powers, postcolonial literature, Rhineland model)
   - Each passage includes side-by-side English translations, key vocabulary glosses, reading times, and 4-question interactive comprehension quizzes with explanations. Full quiz completion is required before persisting completion.

---

## 2. Supporting Content Banks

- **Idioms & Everyday Expressions ([`data/idioms.js`](data/idioms.js))**: **510 authentic Dutch idioms**, spoken formulas, greetings, workplace phrases, and proverbs with literal meanings, figurative translations, context notes, and examples.
- **Dutch Sentence Bank ([`data/sentences.js`](data/sentences.js))**: **5,050 curated Dutch sentences** across daily life, work, travel, and healthcare, tagged with CEFR levels and target grammar.

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

## Development and Testing

### Prerequisites
- Node.js (v18+)
- Google Chrome or Microsoft Edge (for automated headless browser testing)

### Commands

```powershell
# Run the complete test suite (Audit + Unit/Smoke Tests + Regression Tests + Headless Browser Tests)
npm test

# Run quality audit checks across all data banks and assets
npm run audit

# Run unit and smoke tests
npm run test:unit

# Run targeted regression tests for learning-engine integrity
npm run test:regression

# Run Puppeteer headless browser tests (desktop & mobile viewports)
npm run test:browser

# Re-generate all data banks from curated sources
npm run build:data

# Launch the local zero-dependency development server (http://localhost:3000)
npm run serve
```

---

## Quality & Compliance Verification

- **20,000 / 20,000** unique word-form rows in `data/words.js`.
- **0** learnable nouns without verified `de`/`het` article.
- **100%** of learnable nouns have `displayWord` formatted as `de [word]` or `het [word]`.
- **120** grammar lessons with 7 exercise interaction types.
- **120** comprehension reading passages (24 A1, 24 A2, 24 B1, 24 B2, 24 C1) with quizzes.
- **510** authentic Dutch idioms and conversational formulas.
- **5,050** benchmark and practice sentences.
- **47/47** audit checks passed.
- **8/8** unit and smoke tests passed.
- **34/34** headless browser end-to-end assertions passed (0 console errors).

---

## Known Limitations

- **Audio/Voice Synthesis**: Pronunciation recordings, custom voice providers, and audio file playback are explicitly omitted and left out of scope for this release.
- **Server Sync**: NederPath is an offline-first client application; synchronization between multiple physical devices relies on manual JSON progress export and import via the Settings tab.
