# NederPath (Nederlands Leren & Meesterschap)

A calm, comprehensive, offline-first Dutch language-learning web app (PWA) designed around three core learning pillars: **Vocabulary**, **Grammar**, and **Comprehension**.

NederPath runs completely in the browser, stores all state in local storage namespace (`nederpath-v1`), and operates 100% offline via its built-in Service Worker.

---

## Key Features

### 1. Exactly Three Learning Pillars
- **Vocabulary (Woordenschat)**:
  - Exactly **20,000 unique Dutch word-form rows** with frequency ranks and CEFR levels (A1–C1).
  - Every learnable Dutch noun is paired with its verified **`de`** or **`het`** gender article.
  - Inflection coverage: noun plurals, diminutives, verb stems, `'t kofschip` past tenses, irregular ablaut principal parts, separable prefixes (`scheidbare werkwoorden`), and adjective comparisons.
  - Interactive Flashcards (with SM-2 Spaced Repetition), `de`/`het` Article Drill, and Typed Spelling Practice.
- **Grammar (Grammatica)**:
  - **120 comprehensive grammar rules** structured across **8 CEFR sections** (A0 through C1).
  - Detailed structural rules, authentic Dutch examples with English translations, and 7 interactive exercise engines:
    1. Rule Card & Structural Breakdown
    2. Multiple Choice Questions
    3. Fill-in-the-Blank with Hint Chips
    4. Typed Verb Conjugation & Spelling
    5. Sentence Transformation (Active $\to$ Passive, Direct $\to$ Indirect, V2 $\to$ Subclause SOV)
    6. Error Correction (Spot and fix Dutch grammatical bugs)
    7. Movable-Token Word-Order Reconstruction (Interactive chip builder for V2 / subclause order)
- **Comprehension (Begrijpend Lezen)**:
  - **12 progressive Dutch reading passages** spanning levels A1 to C1 (e.g. *Een ochtend in Utrecht*, *De Nederlandse fietscultuur*, *Wonen op het water*, *De Elfstedentocht*, *De Deltawerken*, *Het Poldermodel*, *Rembrandt en het licht*, *Circulaire economie*, *Spinoza en de Verlichting*, *Ruimte voor de Rivier*, *Evolutie van het Nederlands*, *Directheid en etiquette*).
  - Side-by-side English translations, key vocabulary glosses, and multi-question comprehension quizzes.

### 2. Supporting Content Banks
- **Idioms & Expressions**: **105 authentic everyday Dutch idioms** (*Nu komt de aap uit de mouw*, *Helaas pindakaas*, *Voor een appel en een ei*, *Met de gebakken peren zitten*, etc.) with literal meanings, figurative meanings, examples, and CEFR levels.
- **Sentence Bank**: 25+ curated benchmark sentences with English translations and target grammar tags.

### 3. Application Runtime & Navigation
- Primary Navigation: **Today**, **Path**, **Practice**, **Words**, and **Progress**.
- **Spaced Repetition System (SRS)**: SuperMemo-2 / Leitner hybrid tracking card intervals, ease factors, repetitions, lapses, and due queues.
- **Daily Goals & Streak Tracking**: Daily target progress ring, streak counter, 30-day activity heatmap, and XP tracking.
- **20,000-Word Dictionary**: Live search by Dutch word, lemma, or English definition, with filters for Level, Part of Speech, `de`/`het` articles, and Bookmarks.
- **Speech Synthesis (Voice)**: Optional provider-agnostic `nl-NL` male/default voice hook via the Web Speech API with adjustable speech rate.
- **Offline / PWA**: Web App Manifest (`manifest.webmanifest`), multi-resolution icons, and Service Worker (`sw.js`).

---

## 8-Stage Learning Path

| Section | CEFR Level | Focus Areas | Rules |
| :--- | :--- | :--- | :---: |
| **1. Fundamentals** | A0–A1 | Alphabet, Pronouns, V2 Word Order, `de`/`het`, Plurals, Negation, `zijn`/`hebben` | 15 |
| **2. Core Grammar** | A1–A2 | Separable Verbs, Modals, Adjective `-e` rule, Diminutives, Reflexives, Imperatives | 15 |
| **3. Verb Systems & Tenses** | A2 | `'t kofschip`, Past (OVT), Perfect (VTT) with `hebben`/`zijn`, Continuous Aspect | 15 |
| **4. Sentence Structure & Clauses** | A2–B1 | Subordinate Clauses (SOV), Relative Clauses, `om...te`, Pronominal `er` | 15 |
| **5. Intermediate Expansion** | B1 | Passives (`worden`/`zijn`), Impersonal Passives, Conditionals (`zou`), Particles | 15 |
| **6. Complex Syntax & Modality** | B1–B2 | Reported Speech, Verb Clusters (Red/Green), Infinitivus pro Participio (IPP) | 15 |
| **7. Advanced Register & Nuance** | B2 | Formal vs Informal Register, Cleft Sentences, Stylistic Inversion, Pragmatics | 15 |
| **8. Mastery & Stylistics** | C1 | Archaic/Formal Syntax, Dense Nominalization, Nested Clauses, Rhetoric | 15 |
| **Total** | | | **120** |

---

## Commands & Development

```powershell
# Run the local zero-dependency development server (http://localhost:3000)
npm run serve

# Run the complete test suite (Audit + Smoke Tests)
npm test

# Run the 25+ check quality audit
npm run audit

# Re-generate data files
npm run build:data
```

---

## Quality & Compliance Verification
- Exactly **20,000** unique rows in `data/words.js`.
- **0** learnable nouns without verified article.
- Exactly **120** grammar rules across **8** sections with 7 interactive exercise types.
- **105** idioms in `data/idioms.js`.
- **12** comprehension passages with validated quizzes.
- **35/35** audit checks passed.
- **7/7** unit and smoke tests passed.
