// NederPath Main Application Controller and View Engine
(function (global) {
  "use strict";

  const store = global.NederStore;
  const srs = global.NederSRS;
  const voice = global.NederVoice;

  class NederPathApp {
    constructor() {
      this.currentTab = "today";
      this.currentPracticeSubTab = "vocab";
      this.activeExercise = null;
      this.vocabDeck = [];
      this.vocabIndex = 0;
      this.activeGrammarRule = null;
      this.activeComprehension = null;
      this.searchQuery = "";
      this.searchFilters = { level: "all", pos: "all", article: "all", bookmarked: false };
      this.searchResults = [];

      this.init();
    }

    init() {
      // Check onboarding
      if (!store.state.user.onboardingCompleted) {
        this.showOnboarding();
      }

      this.bindGlobalEvents();
      this.applyTheme(store.state.settings.theme);
      this.render();

      // Subscribe to store updates
      store.subscribe(() => {
        this.updateHeaderStats();
      });
    }

    applyTheme(theme) {
      if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
      } else {
        document.documentElement.setAttribute("data-theme", theme || "dark");
      }
    }

    bindGlobalEvents() {
      // Main navigation
      document.querySelectorAll(".nav-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const tab = btn.dataset.tab;
          this.switchTab(tab);
        });
      });

      // Keyboard shortcuts
      window.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key === "1") this.switchTab("today");
        if (e.key === "2") this.switchTab("path");
        if (e.key === "3") this.switchTab("practice");
        if (e.key === "4") this.switchTab("words");
        if (e.key === "5") this.switchTab("progress");
        if (e.key === " " && this.activeExercise && this.activeExercise.type === "flashcard") {
          e.preventDefault();
          this.flipFlashcard();
        }
      });
    }

    switchTab(tab) {
      this.currentTab = tab;
      document.querySelectorAll(".nav-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.tab === tab);
      });
      this.render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    updateHeaderStats() {
      const streakEl = document.getElementById("header-streak");
      const xpEl = document.getElementById("header-xp");
      const goalEl = document.getElementById("header-goal");

      if (streakEl) streakEl.textContent = store.state.user.streak || 0;
      if (xpEl) xpEl.textContent = `${store.state.user.totalXp || 0} XP`;
      if (goalEl) {
        const learned = store.state.progress.dailyStats.learnedToday || 0;
        const target = store.state.user.dailyGoal || 15;
        goalEl.textContent = `${learned}/${target}`;
      }
    }

    render() {
      this.updateHeaderStats();
      const container = document.getElementById("app-main");
      if (!container) return;

      switch (this.currentTab) {
        case "today":
          this.renderTodayView(container);
          break;
        case "path":
          this.renderPathView(container);
          break;
        case "practice":
          this.renderPracticeView(container);
          break;
        case "words":
          this.renderWordsView(container);
          break;
        case "progress":
          this.renderProgressView(container);
          break;
        case "settings":
          this.renderSettingsView(container);
          break;
        default:
          this.renderTodayView(container);
      }
    }

    // -------------------------------------------------------------------------
    // 1. TODAY VIEW
    // -------------------------------------------------------------------------
    renderTodayView(container) {
      const learned = store.state.progress.dailyStats.learnedToday || 0;
      const goal = store.state.user.dailyGoal || 15;
      const pct = Math.min(100, Math.round((learned / goal) * 100));
      const dueCards = srs.getDueCards();
      const randomIdiom = (global.NP_IDIOMS && global.NP_IDIOMS[Math.floor(Math.random() * global.NP_IDIOMS.length)]) || {
        dutch: "Nu komt de aap uit de mouw",
        literal: "Now the monkey comes out of the sleeve",
        meaning: "The truth comes out / the hidden motive is revealed",
        example: "Hij leek vriendelijk, maar nu komt de aap uit de mouw.",
        exampleEn: "He seemed friendly, but now the true motive is revealed."
      };
      const dailyGrammar = (global.NP_GRAMMAR && global.NP_GRAMMAR[0]) || {
        title: "The Dutch V2 Word Order",
        titleNl: "De V2-Regel",
        summary: "In a standard Dutch main declarative sentence, the finite verb must occupy the 2nd position."
      };

      container.innerHTML = `
        <div class="view-today animate-fade">
          <header class="today-hero card">
            <div class="today-hero-content">
              <div class="greeting-badge">Welkom terug!</div>
              <h1 class="today-title">Vandaag leren</h1>
              <p class="today-subtitle">Daily Dutch Mastery: Vocabulary, Grammar & Comprehension</p>
              
              <div class="daily-progress-box">
                <div class="progress-info">
                  <span>Dagdoel: <strong>${learned} / ${goal}</strong> voltooid</span>
                  <span><strong>${pct}%</strong></span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill" style="width: ${pct}%"></div>
                </div>
              </div>

              <div class="hero-actions">
                <button class="btn btn-primary btn-lg" id="btn-today-start-vocab">
                  <span class="btn-icon">⚡</span> Woordenschat oefenen
                </button>
                <button class="btn btn-secondary btn-lg" id="btn-today-start-grammar">
                  <span class="btn-icon">📖</span> Grammatica les
                </button>
              </div>
            </div>

            <div class="today-hero-stats">
              <div class="stat-pill">
                <span class="stat-icon">🔥</span>
                <div class="stat-meta">
                  <div class="stat-val">${store.state.user.streak} dagen</div>
                  <div class="stat-lbl">Streak</div>
                </div>
              </div>
              <div class="stat-pill">
                <span class="stat-icon">📚</span>
                <div class="stat-meta">
                  <div class="stat-val">${dueCards.length}</div>
                  <div class="stat-lbl">Due SRS Cards</div>
                </div>
              </div>
              <div class="stat-pill">
                <span class="stat-icon">🏆</span>
                <div class="stat-meta">
                  <div class="stat-val">${store.state.user.totalXp || 0}</div>
                  <div class="stat-lbl">Totaal XP</div>
                </div>
              </div>
            </div>
          </header>

          <div class="today-grid">
            <!-- Daily Grammar Card -->
            <div class="card spotlight-card">
              <div class="card-tag">Grammatica van de Dag</div>
              <h3 class="spotlight-title">${dailyGrammar.title}</h3>
              <p class="spotlight-nl">${dailyGrammar.titleNl}</p>
              <p class="spotlight-desc">${dailyGrammar.summary}</p>
              <button class="btn btn-outline" id="btn-spotlight-grammar" data-id="${dailyGrammar.id}">
                Les openen & oefenen &rarr;
              </button>
            </div>

            <!-- Daily Idiom Card -->
            <div class="card spotlight-card idiom-card">
              <div class="card-tag">Uitdrukking van de Dag</div>
              <div class="idiom-header">
                <h3 class="idiom-dutch">"${randomIdiom.dutch}"</h3>
                <button class="btn-speak" title="Uitspraak" id="btn-speak-idiom" data-text="${randomIdiom.dutch}">🔊</button>
              </div>
              <p class="idiom-literal"><em>Letterlijk:</em> ${randomIdiom.literal}</p>
              <p class="idiom-meaning"><strong>Betekenis:</strong> ${randomIdiom.meaning}</p>
              <div class="idiom-example-box">
                <p class="idiom-example-nl">${randomIdiom.example}</p>
                <p class="idiom-example-en">${randomIdiom.exampleEn}</p>
              </div>
            </div>
          </div>
        </div>
      `;

      // Event listeners
      document.getElementById("btn-today-start-vocab")?.addEventListener("click", () => {
        this.currentTab = "practice";
        this.currentPracticeSubTab = "vocab";
        this.render();
      });
      document.getElementById("btn-today-start-grammar")?.addEventListener("click", () => {
        this.currentTab = "practice";
        this.currentPracticeSubTab = "grammar";
        this.render();
      });
      document.getElementById("btn-spotlight-grammar")?.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        this.openGrammarRule(id);
      });
      document.getElementById("btn-speak-idiom")?.addEventListener("click", (e) => {
        const txt = e.currentTarget.dataset.text;
        voice.speak(txt);
      });
    }

    // -------------------------------------------------------------------------
    // 2. PATH VIEW (8 CEFR Sections)
    // -------------------------------------------------------------------------
    renderPathView(container) {
      const grammar = global.NP_GRAMMAR || [];
      const sections = [
        { num: 1, name: "A0–A1 Fundamentals", level: "A1", desc: "Alphabet, Pronouns, V2 Word Order, de/het Articles, Plurals, Negation" },
        { num: 2, name: "A1–A2 Core Grammar", level: "A2", desc: "Separable Verbs, Modals, Adjective Endings, Diminutives, Reflexives" },
        { num: 3, name: "A2 Verb Systems & Tenses", level: "A2", desc: "'t kofschip, Simple Past (OVT), Present Perfect (VTT), Continuous Aspect" },
        { num: 4, name: "A2–B1 Sentence Structure & Clauses", level: "B1", desc: "Subordinate Clauses (SOV), Relative Clauses, om...te, Pronominal er" },
        { num: 5, name: "B1 Intermediate Expansion", level: "B1", desc: "Passive Voice (worden/zijn), Impersonal Passives, Conditionals (zou), Particles" },
        { num: 6, name: "B1–B2 Complex Syntax & Modality", level: "B2", desc: "Reported Speech, Verb Clusters (Red/Green), Infinitivus pro Participio (IPP)" },
        { num: 7, name: "B2 Advanced Register & Nuance", level: "B2", desc: "Formal/Informal Register, Cleft Sentences, Stylistic Inversion, Pragmatics" },
        { num: 8, name: "C1 Mastery & Stylistics", level: "C1", desc: "Archaic Syntactic Structures, Dense Nominalization, Nested Clauses, Rhetoric" }
      ];

      const completed = store.state.progress.grammarCompleted || {};

      let html = `
        <div class="view-path animate-fade">
          <div class="section-header">
            <h1>Nederlands Leerpad</h1>
            <p class="subtitle">Structured 8-stage mastery curriculum from absolute beginner to C1 proficiency.</p>
          </div>
          <div class="path-timeline">
      `;

      for (const sec of sections) {
        const secRules = grammar.filter((r) => r.section === sec.num);
        const doneCount = secRules.filter((r) => completed[r.id]).length;
        const total = secRules.length || 15;
        const isDone = doneCount >= total && total > 0;

        html += `
          <div class="path-section-card card ${isDone ? "section-completed" : ""}">
            <div class="path-section-header">
              <div class="section-badge badge-${sec.level.toLowerCase()}">${sec.level} &bull; Deel ${sec.num}</div>
              <div class="section-progress-pill">${doneCount} / ${total} voltooid</div>
            </div>
            <h2 class="section-title">${sec.name}</h2>
            <p class="section-desc">${sec.desc}</p>
            
            <div class="rules-chips-grid">
              ${secRules
                .map((r) => {
                  const ruleDone = !!completed[r.id];
                  return `
                  <button class="rule-chip ${ruleDone ? "rule-chip-done" : ""}" data-id="${r.id}">
                    <span class="chip-status">${ruleDone ? "✓" : "•"}</span>
                    <span class="chip-title">${r.title}</span>
                  </button>
                `;
                })
                .join("")}
            </div>
          </div>
        `;
      }

      html += `</div></div>`;
      container.innerHTML = html;

      // Event listeners for rule chips
      container.querySelectorAll(".rule-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          this.openGrammarRule(chip.dataset.id);
        });
      });
    }

    // -------------------------------------------------------------------------
    // 3. PRACTICE VIEW (3 Core Pillars: Vocab, Grammar, Comprehension)
    // -------------------------------------------------------------------------
    renderPracticeView(container) {
      container.innerHTML = `
        <div class="view-practice animate-fade">
          <div class="practice-tab-nav">
            <button class="practice-nav-btn ${this.currentPracticeSubTab === "vocab" ? "active" : ""}" data-sub="vocab">
              📖 Woordenschat (Vocabulary)
            </button>
            <button class="practice-nav-btn ${this.currentPracticeSubTab === "grammar" ? "active" : ""}" data-sub="grammar">
              📐 Grammatica (Grammar)
            </button>
            <button class="practice-nav-btn ${this.currentPracticeSubTab === "comp" ? "active" : ""}" data-sub="comp">
              📰 Begrijpend Lezen (Comprehension)
            </button>
          </div>

          <div id="practice-subtab-container" class="practice-content-area"></div>
        </div>
      `;

      container.querySelectorAll(".practice-nav-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.currentPracticeSubTab = btn.dataset.sub;
          container.querySelectorAll(".practice-nav-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.renderPracticeSubTab();
        });
      });

      this.renderPracticeSubTab();
    }

    renderPracticeSubTab() {
      const subContainer = document.getElementById("practice-subtab-container");
      if (!subContainer) return;

      if (this.currentPracticeSubTab === "vocab") {
        this.renderVocabPractice(subContainer);
      } else if (this.currentPracticeSubTab === "grammar") {
        this.renderGrammarPractice(subContainer);
      } else if (this.currentPracticeSubTab === "comp") {
        this.renderComprehensionPractice(subContainer);
      }
    }

    // --- SubTab A: VOCABULARY PRACTICE ---
    renderVocabPractice(container) {
      const words = global.NP_WORDS || [];
      if (this.vocabDeck.length === 0) {
        // Build interactive study deck from words
        this.vocabDeck = words.slice(0, 30);
        this.vocabIndex = 0;
      }

      const word = this.vocabDeck[this.vocabIndex] || words[0];
      if (!word) {
        container.innerHTML = `<div class="card empty-state">Geen woorden beschikbaar om te oefenen.</div>`;
        return;
      }

      const isNoun = word.pos === "noun" && word.article;
      const articleDisplay = isNoun ? `<span class="word-article article-${word.article}">${word.article}</span> ` : "";

      container.innerHTML = `
        <div class="vocab-practice-arena">
          <div class="practice-modes-bar">
            <button class="btn btn-sm btn-outline active" id="mode-flashcard">Kaarten (Flashcard)</button>
            <button class="btn btn-sm btn-outline" id="mode-article-drill">de / het Drill</button>
            <button class="btn btn-sm btn-outline" id="mode-typing">Typen (Spelling)</button>
          </div>

          <div class="flashcard-container" id="flashcard-box">
            <div class="flashcard card" id="flashcard-inner">
              <div class="flashcard-front">
                <div class="flashcard-level-badge badge-${(word.level || "A1").toLowerCase()}">${word.level || "A1"} &bull; ${word.pos}</div>
                <div class="flashcard-dutch">
                  ${articleDisplay}<span class="main-word">${word.word}</span>
                </div>
                <button class="btn-speak" id="btn-speak-word" data-text="${(word.article ? word.article + " " : "") + word.word}">🔊</button>
                <div class="flashcard-hint">Klik of druk op Spatie om te draaien</div>
              </div>
              <div class="flashcard-back" style="display: none;">
                <div class="flashcard-meaning">${word.meaning || "Betekenis"}</div>
                ${word.synonyms && word.synonyms.length ? `<div class="flashcard-synonyms">Synoniemen: ${word.synonyms.join(", ")}</div>` : ""}
                <div class="flashcard-category">Categorie: ${word.category || "Algemeen"}</div>
              </div>
            </div>
          </div>

          <!-- SRS Rating Controls (shown after flip) -->
          <div class="srs-controls" id="srs-controls" style="display: none;">
            <button class="btn btn-srs btn-again" data-rating="1">1: Opnieuw (Again)</button>
            <button class="btn btn-srs btn-hard" data-rating="2">2: Moeilijk (Hard)</button>
            <button class="btn btn-srs btn-good" data-rating="3">3: Goed (Good)</button>
            <button class="btn btn-srs btn-easy" data-rating="4">4: Makkelijk (Easy)</button>
          </div>
        </div>
      `;

      const cardBox = document.getElementById("flashcard-box");
      const cardBack = document.querySelector(".flashcard-back");
      const srsControls = document.getElementById("srs-controls");

      cardBox?.addEventListener("click", () => {
        this.flipFlashcard();
      });

      document.getElementById("btn-speak-word")?.addEventListener("click", (e) => {
        e.stopPropagation();
        voice.speak(e.currentTarget.dataset.text);
      });

      container.querySelectorAll(".btn-srs").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const rating = parseInt(e.currentTarget.dataset.rating, 10);
          srs.review(word.id, rating, "vocab");
          this.vocabIndex = (this.vocabIndex + 1) % this.vocabDeck.length;
          this.renderVocabPractice(container);
        });
      });

      // Mode switchers
      document.getElementById("mode-article-drill")?.addEventListener("click", () => {
        this.renderArticleDrill(container);
      });
      document.getElementById("mode-typing")?.addEventListener("click", () => {
        this.renderTypingPractice(container);
      });
    }

    flipFlashcard() {
      const back = document.querySelector(".flashcard-back");
      const srsControls = document.getElementById("srs-controls");
      if (back && back.style.display === "none") {
        back.style.display = "block";
        if (srsControls) srsControls.style.display = "flex";
      }
    }

    renderArticleDrill(container) {
      const words = (global.NP_WORDS || []).filter((w) => w.pos === "noun" && w.article);
      const randomWord = words[Math.floor(Math.random() * words.length)] || { word: "huis", article: "het", meaning: "house" };

      container.innerHTML = `
        <div class="article-drill-arena animate-fade">
          <div class="practice-modes-bar">
            <button class="btn btn-sm btn-outline" id="mode-flashcard-back">Kaarten (Flashcard)</button>
            <button class="btn btn-sm btn-outline active">de / het Drill</button>
            <button class="btn btn-sm btn-outline" id="mode-typing-back">Typen (Spelling)</button>
          </div>

          <div class="drill-card card">
            <div class="drill-tag">Kies het juiste lidwoord</div>
            <div class="drill-noun">${randomWord.word}</div>
            <div class="drill-meaning">(${randomWord.meaning})</div>

            <div class="drill-options">
              <button class="btn btn-drill btn-de" data-choice="de">de</button>
              <button class="btn btn-drill btn-het" data-choice="het">het</button>
            </div>

            <div id="drill-feedback" class="drill-feedback" style="display: none;"></div>
          </div>
        </div>
      `;

      container.querySelectorAll(".btn-drill").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const choice = e.currentTarget.dataset.choice;
          const fb = document.getElementById("drill-feedback");
          const correct = choice === randomWord.article;

          if (fb) {
            fb.style.display = "block";
            fb.className = `drill-feedback ${correct ? "feedback-correct" : "feedback-wrong"}`;
            fb.innerHTML = correct
              ? `<strong>Heel goed!</strong> Het is <em>${randomWord.article} ${randomWord.word}</em>.`
              : `<strong>Helaas!</strong> Het juiste lidwoord is <em>${randomWord.article} ${randomWord.word}</em>.`;
          }

          store.recordActivity(correct ? 8 : 2);
          voice.speak(`${randomWord.article} ${randomWord.word}`);

          setTimeout(() => {
            this.renderArticleDrill(container);
          }, 1400);
        });
      });

      document.getElementById("mode-flashcard-back")?.addEventListener("click", () => this.renderVocabPractice(container));
      document.getElementById("mode-typing-back")?.addEventListener("click", () => this.renderTypingPractice(container));
    }

    renderTypingPractice(container) {
      const words = global.NP_WORDS || [];
      const word = words[Math.floor(Math.random() * 200)] || { word: "fiets", article: "de", meaning: "bicycle" };
      const targetDutch = (word.article ? word.article + " " : "") + word.word;

      container.innerHTML = `
        <div class="typing-practice-arena animate-fade">
          <div class="practice-modes-bar">
            <button class="btn btn-sm btn-outline" id="mode-flashcard-back2">Kaarten (Flashcard)</button>
            <button class="btn btn-sm btn-outline" id="mode-article-back2">de / het Drill</button>
            <button class="btn btn-sm btn-outline active">Typen (Spelling)</button>
          </div>

          <div class="typing-card card">
            <div class="drill-tag">Vertaal naar het Nederlands</div>
            <div class="typing-prompt">${word.meaning}</div>
            <div class="typing-meta">${word.pos}${word.article ? ` (${word.article}-woord)` : ""}</div>

            <form id="form-typing" class="typing-form">
              <input type="text" id="input-dutch" class="form-input text-center" placeholder="Typ het Nederlandse woord..." autofocus autocomplete="off" />
              <button type="submit" class="btn btn-primary btn-block">Controleren</button>
            </form>

            <div id="typing-feedback" class="drill-feedback" style="display: none;"></div>
          </div>
        </div>
      `;

      const form = document.getElementById("form-typing");
      form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("input-dutch")?.value.trim().toLowerCase();
        const targetNorm = targetDutch.toLowerCase();
        const wordOnly = word.word.toLowerCase();
        const fb = document.getElementById("typing-feedback");
        const isCorrect = input === targetNorm || input === wordOnly;

        if (fb) {
          fb.style.display = "block";
          fb.className = `drill-feedback ${isCorrect ? "feedback-correct" : "feedback-wrong"}`;
          fb.innerHTML = isCorrect
            ? `<strong>Uitstekend!</strong> "${targetDutch}" is helemaal juist.`
            : `<strong>Bijna!</strong> Het juiste antwoord is: <em>${targetDutch}</em>`;
        }

        store.recordActivity(isCorrect ? 10 : 2);
        voice.speak(targetDutch);

        setTimeout(() => {
          this.renderTypingPractice(container);
        }, 1600);
      });

      document.getElementById("mode-flashcard-back2")?.addEventListener("click", () => this.renderVocabPractice(container));
      document.getElementById("mode-article-back2")?.addEventListener("click", () => this.renderArticleDrill(container));
    }

    // --- SubTab B: GRAMMAR PRACTICE ---
    renderGrammarPractice(container) {
      const grammar = global.NP_GRAMMAR || [];

      container.innerHTML = `
        <div class="grammar-explorer animate-fade">
          <div class="grammar-list-header">
            <h2>Grammatica Curriculum (120 Regels)</h2>
            <p>Select a rule to view clear explanations, examples, and interactive exercises.</p>
          </div>

          <div class="grammar-rule-cards-list">
            ${grammar
              .map((g) => {
                const isDone = !!store.state.progress.grammarCompleted[g.id];
                return `
                <div class="card grammar-item-card ${isDone ? "item-done" : ""}" data-id="${g.id}">
                  <div class="grammar-card-header">
                    <span class="grammar-level badge-${g.level.toLowerCase()}">${g.level}</span>
                    <span class="grammar-section-badge">Deel ${g.section}</span>
                    ${isDone ? '<span class="grammar-check">✓ Voltooid</span>' : ""}
                  </div>
                  <h3 class="grammar-card-title">${g.title}</h3>
                  <p class="grammar-card-nl">${g.titleNl}</p>
                  <p class="grammar-card-summary">${g.summary}</p>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      `;

      container.querySelectorAll(".grammar-item-card").forEach((card) => {
        card.addEventListener("click", () => {
          this.openGrammarRule(card.dataset.id);
        });
      });
    }

    openGrammarRule(ruleId) {
      const grammar = global.NP_GRAMMAR || [];
      const rule = grammar.find((r) => r.id === ruleId) || grammar[0];
      if (!rule) return;

      this.activeGrammarRule = rule;
      const container = document.getElementById("app-main");
      if (!container) return;

      container.innerHTML = `
        <div class="grammar-rule-view animate-fade">
          <button class="btn btn-sm btn-outline back-btn" id="btn-back-to-path">&larr; Terug naar overzicht</button>

          <header class="rule-view-header card">
            <div class="rule-view-badges">
              <span class="section-badge badge-${rule.level.toLowerCase()}">${rule.level} &bull; Deel ${rule.section}</span>
            </div>
            <h1 class="rule-view-title">${rule.title}</h1>
            <h2 class="rule-view-title-nl">${rule.titleNl}</h2>
            <p class="rule-view-summary">${rule.summary}</p>
          </header>

          <div class="rule-rules-box card">
            <h3>Belangrijkste Grammaticaregels</h3>
            <ul class="rule-bullet-list">
              ${rule.rules.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </div>

          <div class="rule-examples-box card">
            <h3>Voorbeelden in Context</h3>
            <div class="examples-grid">
              ${rule.examples
                .map(
                  (ex) => `
                <div class="example-item">
                  <div class="example-nl-row">
                    <span class="example-nl">${ex.nl}</span>
                    <button class="btn-speak" data-text="${ex.nl}">🔊</button>
                  </div>
                  <div class="example-en">${ex.en}</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>

          <div class="rule-exercises-section">
            <h2>Oefeningen (Exercises)</h2>
            <div id="rule-exercises-container"></div>
          </div>
        </div>
      `;

      document.getElementById("btn-back-to-path")?.addEventListener("click", () => {
        this.render();
      });

      container.querySelectorAll(".btn-speak").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          voice.speak(e.currentTarget.dataset.text);
        });
      });

      this.renderRuleExercises(document.getElementById("rule-exercises-container"), rule);
    }

    renderRuleExercises(container, rule) {
      if (!container || !rule.exercises) return;

      let html = "";
      for (const [idx, ex] of rule.exercises.entries()) {
        html += `<div class="card exercise-card" data-idx="${idx}">`;
        html += `<div class="exercise-type-tag">Oefening ${idx + 1}: ${this.formatExerciseType(ex.type)}</div>`;

        if (ex.type === "multiple_choice") {
          html += `
            <p class="exercise-question"><strong>${ex.question}</strong></p>
            <div class="mc-options-list">
              ${ex.options
                .map(
                  (opt, optIdx) => `
                <button class="btn btn-outline btn-block mc-option-btn" data-opt="${optIdx}">
                  ${opt}
                </button>
              `
                )
                .join("")}
            </div>
            <div class="exercise-feedback" style="display:none;"></div>
          `;
        } else if (ex.type === "fill_in_the_blank") {
          html += `
            <p class="exercise-prompt">${ex.prompt}</p>
            <p class="exercise-sentence">${ex.sentenceWithBlank}</p>
            <div class="hints-box">
              <span>Keuzes: </span>
              ${ex.hints.map((h) => `<span class="hint-tag">${h}</span>`).join(" ")}
            </div>
            <div class="fill-form-row">
              <input type="text" class="form-input fill-input" placeholder="Vul in..." />
              <button class="btn btn-primary btn-fill-check">Controleren</button>
            </div>
            <div class="exercise-feedback" style="display:none;"></div>
          `;
        } else if (ex.type === "word_order") {
          // Shuffle tokens
          const shuffled = [...ex.tokens].sort(() => 0.5 - Math.random());
          html += `
            <p class="exercise-prompt"><em>Bouw de juiste Nederlandse zin (V2 / SOV):</em></p>
            <p class="exercise-translation">"${ex.translation}"</p>
            <div class="tokens-assembled-box drop-target">
              <span class="placeholder-text">Klik op de blokken om de zin te bouwen...</span>
            </div>
            <div class="tokens-pool">
              ${shuffled.map((tok) => `<button class="chip-token">${tok}</button>`).join("")}
            </div>
            <div class="token-actions">
              <button class="btn btn-sm btn-secondary btn-token-reset">Herstellen</button>
              <button class="btn btn-sm btn-primary btn-token-check">Controleren</button>
            </div>
            <div class="exercise-feedback" style="display:none;"></div>
          `;
        } else if (ex.type === "typed_conjugation") {
          html += `
            <p class="exercise-prompt">Vervoeg <strong>${ex.infinitive}</strong> voor <strong>${ex.subject}</strong> (${ex.targetTense}):</p>
            <div class="fill-form-row">
              <input type="text" class="form-input conj-input" placeholder="Typ vervoeging..." />
              <button class="btn btn-primary btn-conj-check">Controleren</button>
            </div>
            <div class="exercise-feedback" style="display:none;"></div>
          `;
        } else if (ex.type === "sentence_transformation") {
          html += `
            <p class="exercise-prompt"><strong>Origineel:</strong> "${ex.original}"</p>
            <p class="exercise-instruction"><em>${ex.instruction}</em></p>
            <div class="fill-form-row">
              <input type="text" class="form-input transform-input" placeholder="Typ getransformeerde zin..." />
              <button class="btn btn-primary btn-transform-check">Controleren</button>
            </div>
            <div class="exercise-feedback" style="display:none;"></div>
          `;
        } else if (ex.type === "error_correction") {
          html += `
            <p class="exercise-prompt"><strong>Zin met grammaticafout:</strong></p>
            <p class="exercise-error-sentence">"${ex.sentenceWithError}"</p>
            <p class="exercise-instruction">Verbeter de zin in correct Nederlands:</p>
            <div class="fill-form-row">
              <input type="text" class="form-input error-correct-input" placeholder="Typ gecorrigeerde zin..." />
              <button class="btn btn-primary btn-error-correct-check">Controleren</button>
            </div>
            <div class="exercise-feedback" style="display:none;"></div>
          `;
        }

        html += `</div>`;
      }

      container.innerHTML = html;

      // Bind interactive exercise handlers
      rule.exercises.forEach((ex, idx) => {
        const card = container.querySelector(`[data-idx="${idx}"]`);
        if (!card) return;

        if (ex.type === "multiple_choice") {
          card.querySelectorAll(".mc-option-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              const opt = parseInt(btn.dataset.opt, 10);
              const fb = card.querySelector(".exercise-feedback");
              const isCorrect = opt === ex.correct;

              card.querySelectorAll(".mc-option-btn").forEach((b, i) => {
                if (i === ex.correct) b.classList.add("btn-success");
                else if (i === opt && !isCorrect) b.classList.add("btn-danger");
              });

              if (fb) {
                fb.style.display = "block";
                fb.className = `exercise-feedback ${isCorrect ? "feedback-correct" : "feedback-wrong"}`;
                fb.innerHTML = isCorrect ? `<strong>Heel goed!</strong> ${ex.explanation}` : `<strong>Onjuist.</strong> ${ex.explanation}`;
              }

              if (isCorrect) store.completeGrammarRule(rule.id, 100);
            });
          });
        } else if (ex.type === "word_order") {
          const pool = card.querySelector(".tokens-pool");
          const assembled = card.querySelector(".tokens-assembled-box");
          const btnReset = card.querySelector(".btn-token-reset");
          const btnCheck = card.querySelector(".btn-token-check");
          const fb = card.querySelector(".exercise-feedback");

          pool.querySelectorAll(".chip-token").forEach((tokBtn) => {
            tokBtn.addEventListener("click", () => {
              const placeholder = assembled.querySelector(".placeholder-text");
              if (placeholder) placeholder.remove();

              tokBtn.classList.add("token-used");
              const clone = document.createElement("button");
              clone.className = "chip-token chip-placed";
              clone.textContent = tokBtn.textContent;
              clone.addEventListener("click", () => {
                clone.remove();
                tokBtn.classList.remove("token-used");
                if (assembled.children.length === 0) {
                  assembled.innerHTML = '<span class="placeholder-text">Klik op de blokken om de zin te bouwen...</span>';
                }
              });
              assembled.appendChild(clone);
            });
          });

          btnReset?.addEventListener("click", () => {
            assembled.innerHTML = '<span class="placeholder-text">Klik op de blokken om de zin te bouwen...</span>';
            pool.querySelectorAll(".chip-token").forEach((b) => b.classList.remove("token-used"));
            if (fb) fb.style.display = "none";
          });

          btnCheck?.addEventListener("click", () => {
            const built = Array.from(assembled.querySelectorAll(".chip-token"))
              .map((c) => c.textContent)
              .join(" ");
            const isCorrect = built.trim().toLowerCase() === ex.correctSentence.trim().toLowerCase();

            if (fb) {
              fb.style.display = "block";
              fb.className = `exercise-feedback ${isCorrect ? "feedback-correct" : "feedback-wrong"}`;
              fb.innerHTML = isCorrect
                ? `<strong>Uitstekend!</strong> "${ex.correctSentence}" is grammaticaal perfect.`
                : `<strong>Niet helemaal:</strong> De juiste volgorde is: "<em>${ex.correctSentence}</em>".`;
            }

            if (isCorrect) {
              store.completeGrammarRule(rule.id, 100);
              voice.speak(ex.correctSentence);
            }
          });
        } else if (ex.type === "fill_in_the_blank") {
          const input = card.querySelector(".fill-input");
          const btn = card.querySelector(".btn-fill-check");
          const fb = card.querySelector(".exercise-feedback");

          const check = () => {
            const val = input.value.trim().toLowerCase();
            const isCorrect = val === ex.blankWord.toLowerCase();
            if (fb) {
              fb.style.display = "block";
              fb.className = `exercise-feedback ${isCorrect ? "feedback-correct" : "feedback-wrong"}`;
              fb.innerHTML = isCorrect ? `<strong>Correct!</strong>` : `<strong>Onjuist:</strong> Het antwoord is: <em>${ex.blankWord}</em>.`;
            }
            if (isCorrect) store.completeGrammarRule(rule.id, 100);
          };

          btn?.addEventListener("click", check);
        } else if (ex.type === "typed_conjugation") {
          const input = card.querySelector(".conj-input");
          const btn = card.querySelector(".btn-conj-check");
          const fb = card.querySelector(".exercise-feedback");

          btn?.addEventListener("click", () => {
            const val = input.value.trim().toLowerCase();
            const isCorrect = val === ex.correctForm.toLowerCase();
            if (fb) {
              fb.style.display = "block";
              fb.className = `exercise-feedback ${isCorrect ? "feedback-correct" : "feedback-wrong"}`;
              fb.innerHTML = isCorrect
                ? `<strong>Geweldig!</strong> "${ex.correctForm}" klopt helemaal. ${ex.explanation || ""}`
                : `<strong>Onjuist:</strong> De juiste vorm is: <em>${ex.correctForm}</em>. ${ex.explanation || ""}`;
            }
            if (isCorrect) store.completeGrammarRule(rule.id, 100);
          });
        } else if (ex.type === "sentence_transformation" || ex.type === "error_correction") {
          const input = card.querySelector("input");
          const btn = card.querySelector("button");
          const fb = card.querySelector(".exercise-feedback");
          const target = ex.transformed || ex.correctedSentence;

          btn?.addEventListener("click", () => {
            const val = input.value.trim().toLowerCase().replace(/[.!?]/g, "");
            const targetNorm = target.trim().toLowerCase().replace(/[.!?]/g, "");
            const isCorrect = val === targetNorm;

            if (fb) {
              fb.style.display = "block";
              fb.className = `exercise-feedback ${isCorrect ? "feedback-correct" : "feedback-wrong"}`;
              fb.innerHTML = isCorrect ? `<strong>Heel goed gedaan!</strong>` : `<strong>Juiste zin:</strong> "<em>${target}</em>"`;
            }
            if (isCorrect) store.completeGrammarRule(rule.id, 100);
          });
        }
      });
    }

    formatExerciseType(type) {
      const map = {
        multiple_choice: "Meerkeuzevraag (Multiple Choice)",
        fill_in_the_blank: "Invuloefening (Fill-in-the-Blank)",
        word_order: "Zinsbouw & Woordvolgorde (Word Order)",
        typed_conjugation: "Vervoeging & Spelling (Conjugation)",
        sentence_transformation: "Zinstransformatie (Transformation)",
        error_correction: "Foutencorrectie (Error Spotter)"
      };
      return map[type] || "Oefening";
    }

    // --- SubTab C: COMPREHENSION PRACTICE ---
    renderComprehensionPractice(container) {
      const passages = global.NP_COMPREHENSION || [];

      container.innerHTML = `
        <div class="comprehension-explorer animate-fade">
          <div class="comp-list-header">
            <h2>Begrijpend Lezen & Leesvaardigheid (12 Teksten)</h2>
            <p>Authentic Dutch reading texts across A1 to C1 with vocabulary tooltips and comprehension quizzes.</p>
          </div>

          <div class="comp-passages-grid">
            ${passages
              .map((p) => {
                const isDone = !!store.state.progress.comprehensionCompleted[p.id];
                return `
                <div class="card comp-passage-card ${isDone ? "passage-done" : ""}" data-id="${p.id}">
                  <div class="comp-card-top">
                    <span class="section-badge badge-${p.level.toLowerCase()}">${p.level}</span>
                    <span class="comp-topic">${p.topic}</span>
                    ${isDone ? '<span class="grammar-check">✓ Gelezen</span>' : ""}
                  </div>
                  <h3 class="comp-card-title">${p.title}</h3>
                  <p class="comp-card-title-en">${p.titleEn}</p>
                  <p class="comp-card-summary">${p.summary}</p>
                  <button class="btn btn-outline btn-block btn-read-passage">Lees tekst & maak toets &rarr;</button>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      `;

      container.querySelectorAll(".comp-passage-card").forEach((card) => {
        card.addEventListener("click", () => {
          this.openComprehensionPassage(card.dataset.id);
        });
      });
    }

    openComprehensionPassage(passageId) {
      const passages = global.NP_COMPREHENSION || [];
      const p = passages.find((x) => x.id === passageId) || passages[0];
      if (!p) return;

      const container = document.getElementById("app-main");
      if (!container) return;

      container.innerHTML = `
        <div class="passage-detail-view animate-fade">
          <button class="btn btn-sm btn-outline back-btn" id="btn-back-to-comp">&larr; Terug naar teksten</button>

          <header class="passage-header card">
            <div class="passage-badges">
              <span class="section-badge badge-${p.level.toLowerCase()}">${p.level}</span>
              <span class="comp-topic">${p.topic}</span>
            </div>
            <h1 class="passage-title">${p.title}</h1>
            <h2 class="passage-title-en">${p.titleEn}</h2>
            
            <div class="passage-audio-bar">
              <button class="btn btn-secondary btn-sm" id="btn-play-passage">
                <span>🔊</span> Tekst beluisteren
              </button>
              <button class="btn btn-outline btn-sm" id="btn-toggle-translation">
                <span>🌐</span> Toon Engelse vertaling
              </button>
            </div>
          </header>

          <div class="passage-body-grid">
            <div class="passage-text-card card">
              ${p.paragraphs
                .map((para, i) => `
                <div class="paragraph-block">
                  <p class="para-nl">${para}</p>
                  <p class="para-en translation-hidden">${p.translations[i] || ""}</p>
                </div>
              `).join("")}
            </div>

            <div class="passage-vocab-card card">
              <h3>Kernwoorden (Vocabulary)</h3>
              <div class="vocab-gloss-list">
                ${p.vocabulary
                  .map(
                    (v) => `
                  <div class="vocab-gloss-item">
                    <span class="gloss-dutch">${v.dutch}</span>
                    <span class="gloss-arrow">&rarr;</span>
                    <span class="gloss-meaning">${v.meaning}</span>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <div class="passage-quiz-section card">
            <h2>Begripsvragen (Comprehension Questions)</h2>
            <div class="questions-list">
              ${p.questions
                .map(
                  (q, qIdx) => `
                <div class="card comp-q-box" data-qidx="${qIdx}">
                  <p class="comp-q-text"><strong>Vraag ${qIdx + 1}:</strong> ${q.question}</p>
                  <div class="mc-options-list">
                    ${q.options
                      .map(
                        (opt, oIdx) => `
                      <button class="btn btn-outline btn-block comp-opt-btn" data-oidx="${oIdx}">${opt}</button>
                    `
                      )
                      .join("")}
                  </div>
                  <div class="exercise-feedback" style="display:none;"></div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      `;

      document.getElementById("btn-back-to-comp")?.addEventListener("click", () => {
        this.render();
      });

      document.getElementById("btn-play-passage")?.addEventListener("click", () => {
        voice.speak(p.paragraphs.join(" "));
      });

      document.getElementById("btn-toggle-translation")?.addEventListener("click", () => {
        document.querySelectorAll(".para-en").forEach((el) => {
          el.classList.toggle("translation-hidden");
        });
      });

      // Quiz options handling
      let correctAnswers = 0;
      container.querySelectorAll(".comp-q-box").forEach((qBox) => {
        const qIdx = parseInt(qBox.dataset.qidx, 10);
        const qData = p.questions[qIdx];

        qBox.querySelectorAll(".comp-opt-btn").forEach((optBtn) => {
          optBtn.addEventListener("click", () => {
            const oIdx = parseInt(optBtn.dataset.oidx, 10);
            const isCorrect = oIdx === qData.correct;
            const fb = qBox.querySelector(".exercise-feedback");

            qBox.querySelectorAll(".comp-opt-btn").forEach((b, i) => {
              if (i === qData.correct) b.classList.add("btn-success");
              else if (i === oIdx && !isCorrect) b.classList.add("btn-danger");
            });

            if (fb) {
              fb.style.display = "block";
              fb.className = `exercise-feedback ${isCorrect ? "feedback-correct" : "feedback-wrong"}`;
              fb.innerHTML = isCorrect ? `<strong>Correct!</strong> ${qData.explanation}` : `<strong>Onjuist:</strong> ${qData.explanation}`;
            }

            if (isCorrect) {
              correctAnswers++;
              if (correctAnswers >= p.questions.length) {
                store.completeComprehension(p.id, correctAnswers, p.questions.length);
              }
            }
          });
        });
      });
    }

    // -------------------------------------------------------------------------
    // 4. WORDS VIEW (20,000 Word Dictionary & Browser)
    // -------------------------------------------------------------------------
    renderWordsView(container) {
      const words = global.NP_WORDS || [];

      container.innerHTML = `
        <div class="view-words animate-fade">
          <div class="words-header">
            <h1>Woordenbank (20.000 Woorden)</h1>
            <p class="subtitle">Complete Dutch dictionary with verified de/het articles and CEFR frequency ranks.</p>
          </div>

          <div class="words-search-card card">
            <div class="search-input-wrap">
              <input type="text" id="words-search-input" class="form-input search-input" placeholder="Zoek in 20.000 woorden (Nederlands of Engels)..." value="${this.searchQuery}" />
              ${this.searchQuery ? '<button id="btn-clear-search" class="btn-clear">✕</button>' : ""}
            </div>

            <div class="filter-row">
              <div class="filter-group">
                <label>Niveau:</label>
                <select id="filter-level" class="form-select">
                  <option value="all">Alle niveaus</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Woordsoort:</label>
                <select id="filter-pos" class="form-select">
                  <option value="all">Alle woordsoorten</option>
                  <option value="noun">Zelfst. naamwoord (Noun)</option>
                  <option value="verb">Werkwoord (Verb)</option>
                  <option value="adjective">Bijvoeglijk (Adjective)</option>
                  <option value="adverb">Bijwoord (Adverb)</option>
                  <option value="numeral">Telwoord (Numeral)</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Lidwoord:</label>
                <select id="filter-article" class="form-select">
                  <option value="all">de & het</option>
                  <option value="de">de-woorden</option>
                  <option value="het">het-woorden</option>
                </select>
              </div>

              <div class="filter-group filter-checkbox">
                <label>
                  <input type="checkbox" id="filter-bookmarked" ${this.searchFilters.bookmarked ? "checked" : ""} />
                  <span>★ Alleen favorieten</span>
                </label>
              </div>
            </div>
          </div>

          <div class="words-meta-bar">
            <span id="words-count-label">Resultaten laden...</span>
          </div>

          <div id="words-results-list" class="words-results-grid"></div>
        </div>
      `;

      // Set filter select values
      document.getElementById("filter-level").value = this.searchFilters.level;
      document.getElementById("filter-pos").value = this.searchFilters.pos;
      document.getElementById("filter-article").value = this.searchFilters.article;

      // Bind search & filter events
      const searchInput = document.getElementById("words-search-input");
      searchInput?.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.filterWords();
      });

      document.getElementById("btn-clear-search")?.addEventListener("click", () => {
        this.searchQuery = "";
        this.filterWords();
        this.render();
      });

      document.getElementById("filter-level")?.addEventListener("change", (e) => {
        this.searchFilters.level = e.target.value;
        this.filterWords();
      });
      document.getElementById("filter-pos")?.addEventListener("change", (e) => {
        this.searchFilters.pos = e.target.value;
        this.filterWords();
      });
      document.getElementById("filter-article")?.addEventListener("change", (e) => {
        this.searchFilters.article = e.target.value;
        this.filterWords();
      });
      document.getElementById("filter-bookmarked")?.addEventListener("change", (e) => {
        this.searchFilters.bookmarked = e.target.checked;
        this.filterWords();
      });

      this.filterWords();
    }

    filterWords() {
      const allWords = global.NP_WORDS || [];
      const query = this.searchQuery.trim().toLowerCase();
      const { level, pos, article, bookmarked } = this.searchFilters;

      let filtered = allWords;

      if (level !== "all") {
        filtered = filtered.filter((w) => w.level === level);
      }
      if (pos !== "all") {
        filtered = filtered.filter((w) => w.pos === pos);
      }
      if (article !== "all") {
        filtered = filtered.filter((w) => w.article === article);
      }
      if (bookmarked) {
        filtered = filtered.filter((w) => store.isBookmarked(w.id));
      }

      if (query) {
        filtered = filtered.filter(
          (w) =>
            w.word.toLowerCase().includes(query) ||
            (w.lemma && w.lemma.toLowerCase().includes(query)) ||
            (w.meaning && w.meaning.toLowerCase().includes(query)) ||
            (w.category && w.category.toLowerCase().includes(query))
        );
      }

      this.searchResults = filtered;
      this.renderWordsResults();
    }

    renderWordsResults() {
      const countEl = document.getElementById("words-count-label");
      const listEl = document.getElementById("words-results-list");
      if (!listEl) return;

      const total = this.searchResults.length;
      if (countEl) countEl.textContent = `Totaal: ${total.toLocaleString()} woorden gevonden (toont eerste 100)`;

      const displayed = this.searchResults.slice(0, 100);

      if (displayed.length === 0) {
        listEl.innerHTML = `<div class="card empty-state">Geen woorden gevonden voor deze zoekopdracht.</div>`;
        return;
      }

      listEl.innerHTML = displayed
        .map((w) => {
          const isStar = store.isBookmarked(w.id);
          const isNoun = w.pos === "noun" && w.article;
          const artTag = isNoun ? `<span class="article-badge badge-${w.article}">${w.article}</span> ` : "";

          return `
          <div class="card word-item-card">
            <div class="word-card-top">
              <span class="word-level-badge badge-${(w.level || "A1").toLowerCase()}">${w.level || "A1"}</span>
              <span class="word-pos">${w.pos}</span>
              <button class="btn-star ${isStar ? "starred" : ""}" data-id="${w.id}" title="Favoriet">★</button>
            </div>
            <div class="word-card-main">
              <h3 class="word-title">${artTag}${w.word}</h3>
              <button class="btn-speak-inline" data-text="${(w.article ? w.article + " " : "") + w.word}">🔊</button>
            </div>
            <p class="word-meaning">${w.meaning || ""}</p>
            <div class="word-footer">
              <span class="word-category">#${w.category || "algemeen"}</span>
              <span class="word-rank">#${w.rank || w.id}</span>
            </div>
          </div>
        `;
        })
        .join("");

      listEl.querySelectorAll(".btn-star").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          const starred = store.toggleBookmark(id);
          btn.classList.toggle("starred", starred);
        });
      });

      listEl.querySelectorAll(".btn-speak-inline").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          voice.speak(btn.dataset.text);
        });
      });
    }

    // -------------------------------------------------------------------------
    // 5. PROGRESS VIEW (Analytics & Heatmap)
    // -------------------------------------------------------------------------
    renderProgressView(container) {
      const stats = srs.getDeckStats();
      const grammarTotal = (global.NP_GRAMMAR || []).length || 120;
      const grammarDone = Object.keys(store.state.progress.grammarCompleted || {}).length;
      const compTotal = (global.NP_COMPREHENSION || []).length || 12;
      const compDone = Object.keys(store.state.progress.comprehensionCompleted || {}).length;
      const studyDays = store.state.progress.studyDays || {};

      container.innerHTML = `
        <div class="view-progress animate-fade">
          <div class="progress-header">
            <h1>Jouw Voortgang & Statistieken</h1>
            <p class="subtitle">Comprehensive Dutch learning analytics and SRS retention tracking.</p>
          </div>

          <div class="progress-stats-overview">
            <div class="stat-card card">
              <span class="stat-big-icon">🏆</span>
              <div class="stat-big-num">${store.state.user.totalXp || 0}</div>
              <div class="stat-big-lbl">Totaal XP</div>
            </div>
            <div class="stat-card card">
              <span class="stat-big-icon">🔥</span>
              <div class="stat-big-num">${store.state.user.streak || 0}</div>
              <div class="stat-big-lbl">Dagen Streak</div>
            </div>
            <div class="stat-card card">
              <span class="stat-big-icon">📖</span>
              <div class="stat-big-num">${stats.mastered}</div>
              <div class="stat-big-lbl">Mastered SRS Words</div>
            </div>
            <div class="stat-card card">
              <span class="stat-big-icon">📐</span>
              <div class="stat-big-num">${grammarDone} / ${grammarTotal}</div>
              <div class="stat-big-lbl">Grammatica Regels</div>
            </div>
          </div>

          <div class="progress-grid">
            <!-- Learning Pillars Progress -->
            <div class="card progress-pillar-card">
              <h3>Drie Leerpijlers Voortgang</h3>
              
              <div class="pillar-row">
                <div class="pillar-meta">
                  <span>1. Woordenschat (SRS Spaced Repetition)</span>
                  <span>${stats.total} kaarten actief</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill fill-blue" style="width: ${Math.min(100, Math.round((stats.mastered / 100) * 100))}%"></div>
                </div>
              </div>

              <div class="pillar-row">
                <div class="pillar-meta">
                  <span>2. Grammatica (120 Regels A0..C1)</span>
                  <span>${Math.round((grammarDone / grammarTotal) * 100)}%</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill fill-green" style="width: ${(grammarDone / grammarTotal) * 100}%"></div>
                </div>
              </div>

              <div class="pillar-row">
                <div class="pillar-meta">
                  <span>3. Begrijpend Lezen (Comprehension)</span>
                  <span>${compDone} / ${compTotal} gelezen</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill fill-purple" style="width: ${(compDone / compTotal) * 100}%"></div>
                </div>
              </div>
            </div>

            <!-- Heatmap Calendar -->
            <div class="card progress-heatmap-card">
              <h3>Studie-activiteit Laatste 30 Dagen</h3>
              <div class="heatmap-grid" id="heatmap-container"></div>
            </div>
          </div>

          <div class="card progress-backup-card">
            <h3>Gegevensbeheer (Backup & Reset)</h3>
            <p>Export or restore your study progress and SRS schedules.</p>
            <div class="backup-actions">
              <button class="btn btn-outline" id="btn-export-data">📥 Gegevens Exporteren (JSON)</button>
              <button class="btn btn-outline" id="btn-import-data">📤 Gegevens Importeren</button>
              <button class="btn btn-danger" id="btn-reset-data">⚠️ Alles Resetten</button>
            </div>
          </div>
        </div>
      `;

      // Render 30 day heatmap
      const heatmap = document.getElementById("heatmap-container");
      if (heatmap) {
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
          const key = d.toISOString().split("T")[0];
          const count = studyDays[key] || 0;
          const level = count === 0 ? 0 : count < 5 ? 1 : count < 15 ? 2 : 3;

          const cell = document.createElement("div");
          cell.className = `heatmap-cell heat-${level}`;
          cell.title = `${key}: ${count} activiteiten`;
          heatmap.appendChild(cell);
        }
      }

      // Backup handlers
      document.getElementById("btn-export-data")?.addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.state, null, 2));
        const a = document.createElement("a");
        a.href = dataStr;
        a.download = `nederpath-backup-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
      });

      document.getElementById("btn-reset-data")?.addEventListener("click", () => {
        if (confirm("Weet je zeker dat je alle voortgang en SRS-gegevens wilt resetten?")) {
          store.resetAllData();
          this.render();
        }
      });
    }

    // -------------------------------------------------------------------------
    // 6. ONBOARDING
    // -------------------------------------------------------------------------
    showOnboarding() {
      const modal = document.createElement("div");
      modal.className = "modal-overlay animate-fade";
      modal.id = "onboarding-modal";
      modal.innerHTML = `
        <div class="modal-card card">
          <div class="modal-header">
            <span class="greeting-badge">Welkom bij NederPath</span>
            <h2>Welkom bij NederPath</h2>
            <p>Jouw complete offline-first Nederlandse taalcursus.</p>
          </div>
          
          <div class="onboarding-step">
            <p><strong>1. Wat is jouw huidige niveau Nederlands?</strong></p>
            <div class="level-select-grid">
              <button class="btn btn-outline level-btn active" data-lvl="A1">A1 &bull; Beginner</button>
              <button class="btn btn-outline level-btn" data-lvl="A2">A2 &bull; Basis</button>
              <button class="btn btn-outline level-btn" data-lvl="B1">B1 &bull; Gevorderd</button>
              <button class="btn btn-outline level-btn" data-lvl="B2">B2 &bull; Vloeiend</button>
            </div>
          </div>

          <div class="onboarding-step">
            <p><strong>2. Wat is jouw dagelijkse leerdoel?</strong></p>
            <div class="goal-select-grid">
              <button class="btn btn-outline goal-btn" data-goal="10">Rustig (10/dag)</button>
              <button class="btn btn-outline goal-btn active" data-goal="15">Regulier (15/dag)</button>
              <button class="btn btn-outline goal-btn" data-goal="25">Intensief (25/dag)</button>
            </div>
          </div>

          <button class="btn btn-primary btn-block btn-lg" id="btn-finish-onboarding">
            Start met Leren &rarr;
          </button>
        </div>
      `;

      document.body.appendChild(modal);

      modal.querySelectorAll(".level-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          modal.querySelectorAll(".level-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          store.state.user.level = btn.dataset.lvl;
        });
      });

      modal.querySelectorAll(".goal-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          modal.querySelectorAll(".goal-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          store.state.user.dailyGoal = parseInt(btn.dataset.goal, 10);
        });
      });

      document.getElementById("btn-finish-onboarding")?.addEventListener("click", () => {
        store.state.user.onboardingCompleted = true;
        store.save();
        modal.remove();
        this.render();
      });
    }
  }

  // Boot app when DOM is ready
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      global.NederApp = new NederPathApp();
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
