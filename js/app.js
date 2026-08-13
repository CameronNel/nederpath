// NederPath Main SPA Controller & Interactive Learning Runtime
(function (global) {
  "use strict";

  const Learning = global.NederLearning || {
    escapeHTML: (s) => (typeof s === "string" ? s.replace(/[&<>"']/g, "") : ""),
    getLocalISODate: (d = new Date()) => {
      const date = d instanceof Date ? d : new Date(d);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    },
    shuffleArray: (arr) => (Array.isArray(arr) ? arr.slice().sort(() => Math.random() - 0.5) : []),
    sampleArray: (arr, count = 10) => (Array.isArray(arr) ? arr.slice().sort(() => Math.random() - 0.5).slice(0, count) : []),
    normalizeAnswer: (str) => (typeof str === "string" ? str.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "") : ""),
    getDutchVerbStem: () => "",
    getVerbHijConjugation: () => null,
    getEligibleVerbs: () => [],
    getNounPlural: () => null,
    generateFlashcardSession: ({ wordsBank = [], sessionSize = 10 } = {}) => (Array.isArray(wordsBank) ? wordsBank.slice(0, sessionSize) : []),
    createFillBlankCard: () => null,
    validateAndMergeBackup: (p, d) => Object.assign({}, d, p)
  };

  class NederPathApp {
    constructor() {
      this.store = global.NederStore;
      this.srs = global.NederSRS;
      this.currentTab = "today";
      this.practiceMode = "flashcards"; // 'flashcards' | 'article_drill' | 'fill_blank' | 'choose_word' | 'spelling' | 'synonyms' | 'morphology' | 'verbs' | 'context'
      this.selectedLevel = "all";
      this.searchQuery = "";
      this.selectedPos = "all";
      this.selectedArticle = "all";
      this.showOnlyBookmarked = false;

      // Active interactive session state
      this.session = {
        cards: [],
        currentIndex: 0,
        revealed: false,
        score: 0,
        mistakes: [],
        type: "vocab",
        feedback: null
      };

      // Grammar & Comprehension active views
      this.activeGrammarRule = null;
      this.activePassage = null;
      this.activeGrammarExIndex = 0;
      this.tokenReconstructionPlaced = []; // Array of { poolIndex: number, text: string }
      this.activeGrammarAnswers = {}; // exIndex -> { isCorrect, userAttempt }
      this.activePassageAnswers = {}; // qIdx -> { chosenOptIdx, isCorrect }

      this.init();
    }

    init() {
      this.bindNav();
      this.bindGlobalKeyboard();
      this.applyTheme(this.store.state.settings.theme || "dark");
      this.store.subscribe(() => this.updateHeaderStats());
      this.updateHeaderStats();
      this.render();
    }

    applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
    }

    bindNav() {
      const navBtns = document.querySelectorAll(".nav-btn");
      navBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const tab = btn.dataset.tab;
          this.switchTab(tab);
        });
      });

      const brandLink = document.getElementById("brand-link");
      if (brandLink) {
        brandLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.switchTab("today");
        });
      }
    }

    switchTab(tab) {
      this.currentTab = tab;
      document.querySelectorAll(".nav-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.tab === tab);
      });
      this.render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    bindGlobalKeyboard() {
      window.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;

        // Space or Enter to reveal card
        if ((e.code === "Space" || e.code === "Enter") && this.currentTab === "practice" && this.practiceMode === "flashcards") {
          e.preventDefault();
          this.toggleCardReveal();
        }

        // 1, 2, 3, 4 for SRS buttons when revealed
        if (this.currentTab === "practice" && this.practiceMode === "flashcards" && this.session.revealed) {
          if (e.key === "1") this.handleSRSRating(1);
          if (e.key === "2") this.handleSRSRating(2);
          if (e.key === "3") this.handleSRSRating(3);
          if (e.key === "4") this.handleSRSRating(4);
        }
      });
    }

    updateHeaderStats() {
      const streakEl = document.getElementById("header-streak");
      const xpEl = document.getElementById("header-xp");
      const goalEl = document.getElementById("header-goal");

      if (streakEl) streakEl.textContent = this.store.state.user.streak || 0;
      if (xpEl) xpEl.textContent = (this.store.state.user.totalXp || 0) + " XP";
      if (goalEl) {
        const learned = this.store.state.progress.dailyStats ? this.store.state.progress.dailyStats.learnedToday || 0 : 0;
        const target = this.store.state.settings.dailyGoal || 15;
        goalEl.textContent = `${learned}/${target}`;
      }
    }

    render() {
      const main = document.getElementById("app-main");
      if (!main) return;

      switch (this.currentTab) {
        case "today":
          main.innerHTML = this.renderTodayView();
          this.attachTodayListeners();
          break;
        case "path":
          main.innerHTML = this.renderPathView();
          this.attachPathListeners();
          break;
        case "practice":
          main.innerHTML = this.renderPracticeView();
          this.attachPracticeListeners();
          break;
        case "grammar":
          main.innerHTML = this.renderGrammarView();
          this.attachGrammarListeners();
          break;
        case "comprehension":
          main.innerHTML = this.renderComprehensionView();
          this.attachComprehensionListeners();
          break;
        case "words":
          main.innerHTML = this.renderWordsView();
          this.attachWordsListeners();
          break;
        case "progress":
          main.innerHTML = this.renderProgressView();
          this.attachProgressListeners();
          break;
        case "settings":
          main.innerHTML = this.renderSettingsView();
          this.attachSettingsListeners();
          break;
        default:
          main.innerHTML = this.renderTodayView();
          this.attachTodayListeners();
      }
    }

    /* ==========================================================================
       1. TODAY VIEW
       ========================================================================== */
    renderTodayView() {
      const user = this.store.state.user;
      const dailyStats = this.store.state.progress.dailyStats || { learnedToday: 0 };
      const targetGoal = this.store.state.settings.dailyGoal || 15;
      const pct = Math.min(100, Math.round((dailyStats.learnedToday / targetGoal) * 100));

      const deckStats = this.srs.getDeckStats();
      const grammarRules = global.NP_GRAMMAR || [];
      const idioms = global.NP_IDIOMS || [];

      // Spotlight rule & idiom of the day based on local day of year
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 0);
      const dayOfYear = Math.floor((now - startOfYear) / 1000 / 60 / 60 / 24);
      const spotlightRule = grammarRules[dayOfYear % (grammarRules.length || 1)] || grammarRules[0];
      const todayIdiom = idioms[dayOfYear % (idioms.length || 1)] || idioms[0];

      return `
        <div class="today-container animate-fade">
          <div class="card today-hero">
            <div class="today-hero-left">
              <span class="greeting-badge">Welkom terug, ${Learning.escapeHTML(user.name)}!</span>
              <h1 class="today-title">Klaar voor je dagelijkse portie Nederlands?</h1>
              <p class="today-subtitle">Je streak staat op <strong>${user.streak} dagen</strong>. Blijf consistent om vloeiend te worden!</p>
              
              <div class="daily-progress-box">
                <div class="progress-info">
                  <span>Dagdoel Voortgang</span>
                  <span><strong>${dailyStats.learnedToday}</strong> van de ${targetGoal} items (${pct}%)</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill" style="width: ${pct}%"></div>
                </div>
              </div>

              <div class="hero-actions">
                <button class="btn btn-primary btn-lg" id="btn-start-daily-review">⚡ Start Dagelijkse Oefening</button>
                <button class="btn btn-outline btn-lg" id="btn-explore-path">🗺️ Bekijk Leerpad</button>
              </div>
            </div>

            <div class="today-hero-stats">
              <div class="stat-pill">
                <span class="stat-icon">📚</span>
                <div>
                  <div class="stat-val">${deckStats.due} ${deckStats.due === 1 ? 'Kaart' : 'Kaarten'}</div>
                  <div class="stat-lbl">Klaar voor herhaling</div>
                </div>
              </div>
              <div class="stat-pill">
                <span class="stat-icon">🏆</span>
                <div>
                  <div class="stat-val">${user.totalXp || 0} XP</div>
                  <div class="stat-lbl">Totaal verdiend</div>
                </div>
              </div>
              <div class="stat-pill">
                <span class="stat-icon">🎯</span>
                <div>
                  <div class="stat-val">${deckStats.mastered || 0} Woorden</div>
                  <div class="stat-lbl">Volledig beheerst</div>
                </div>
              </div>
            </div>
          </div>

          <div class="today-grid">
            <!-- Grammar Spotlight Card -->
            ${spotlightRule ? `
              <div class="card spotlight-card">
                <div class="card-tag">Uitgelichte Grammaticaregel</div>
                <h3 class="spotlight-title">${spotlightRule.title}</h3>
                <div class="spotlight-nl">${spotlightRule.titleNl}</div>
                <p class="spotlight-desc">${spotlightRule.summary}</p>
                <button class="btn btn-secondary btn-sm" id="btn-open-spotlight-grammar" data-rule-id="${spotlightRule.id}">Bekijk Regel & Oefeningen →</button>
              </div>
            ` : ""}

            <!-- Idiom of the Day -->
            ${todayIdiom ? `
              <div class="card idiom-card">
                <div class="idiom-header">
                  <span class="card-tag">Uitdrukking van de Dag</span>
                  <span class="grammar-level badge-${todayIdiom.level.toLowerCase()}">${todayIdiom.level}</span>
                </div>
                <h3 class="idiom-dutch">“${todayIdiom.dutch}”</h3>
                ${todayIdiom.literal ? `<div class="idiom-literal"><strong>Letterlijk:</strong> <em>${todayIdiom.literal}</em></div>` : ""}
                <div class="idiom-meaning"><strong>Betekenis:</strong> ${todayIdiom.meaning}</div>
                <div class="idiom-example-box">
                  <div class="idiom-example-nl">“${todayIdiom.example}”</div>
                  <div class="idiom-example-en">${todayIdiom.exampleEn}</div>
                </div>
              </div>
            ` : ""}
          </div>
        </div>
      `;
    }

    attachTodayListeners() {
      const startBtn = document.getElementById("btn-start-daily-review");
      if (startBtn) {
        startBtn.addEventListener("click", () => {
          this.switchTab("practice");
        });
      }

      const pathBtn = document.getElementById("btn-explore-path");
      if (pathBtn) {
        pathBtn.addEventListener("click", () => {
          this.switchTab("path");
        });
      }

      const spotGrammarBtn = document.getElementById("btn-open-spotlight-grammar");
      if (spotGrammarBtn) {
        spotGrammarBtn.addEventListener("click", () => {
          const ruleId = spotGrammarBtn.dataset.ruleId;
          this.openGrammarRule(ruleId);
        });
      }
    }

    /* ==========================================================================
       2. CURRICULUM PATH VIEW (8 Distinct Sections)
       ========================================================================== */
    renderPathView() {
      const grammarRules = global.NP_GRAMMAR || [];
      const sections = [
        { num: 1, title: "Fundamentals & Klankleer", level: "A0–A1", desc: "Uitspraak, spelling, lidwoorden (de/het), persoonsvorm en ontkenning.", icon: "🌱" },
        { num: 2, title: "Basisgrammatica & Zinsbouw", level: "A1–A2", desc: "Scheidbare werkwoorden, modale hulpwoorden, bijvoeglijke naamwoorden en verkleinwoorden.", icon: "🧱" },
        { num: 3, title: "Werkwoordsystemen & Tijden", level: "A2", desc: "'t kofschip, OVT (verleden tijd), VTT (voltooid tegenwoordige tijd) en continuïteit.", icon: "⏳" },
        { num: 4, title: "Complexe Zinnen & Voegwoorden", level: "A2–B1", desc: "Bijzinnen (SOV-volgorde), relatieve bijzinnen, om...te constructies en het woordje 'er'.", icon: "🔗" },
        { num: 5, title: "Middelniveau Verdieping", level: "B1", desc: "Lijdende vorm (passief), voorwaardelijke zinnen (zou/zouden) en modale partikels.", icon: "🌊" },
        { num: 6, title: "Gevorderde Syntaxis & Modus", level: "B1–B2", desc: "Indirecte rede, werkwoordclusters (rode/groene volgorde) en Infinitivus pro Participio (IPP).", icon: "🏛️" },
        { num: 7, title: "Stijl, Register & Pragmatiek", level: "B2", desc: "Formeel versus informeel register, cleft-zinnen, stilistische inversie en tekstsamenhang.", icon: "💎" },
        { num: 8, title: "Meesterschap & Nuance", level: "C1", desc: "Complexe nominalisaties, archaïsche constructies, retoriek en idiomatische precisie.", icon: "👑" }
      ];

      return `
        <div class="path-container animate-fade">
          <div class="catalog-header">
            <div>
              <h1 class="page-title">NederPath Leerpad</h1>
              <p class="page-subtitle">Een gestructureerde weg naar vloeiendheid via 8 thematische niveausecties.</p>
            </div>
          </div>

          <div class="sections-list">
            ${sections.map((sec) => {
              const secRules = grammarRules.filter(r => r.section === sec.num);
              const completedCount = secRules.filter(r => this.store.state.progress.grammarCompleted[r.id]).length;
              const pct = secRules.length > 0 ? Math.round((completedCount / secRules.length) * 100) : 0;

              return `
                <div class="card section-card">
                  <div class="section-card-header">
                    <div class="section-badge-wrap">
                      <span class="section-icon">${sec.icon}</span>
                      <div>
                        <span class="section-num">SECTIE ${sec.num}</span>
                        <h2 class="section-title">${sec.title}</h2>
                      </div>
                    </div>
                    <span class="section-level-badge">${sec.level}</span>
                  </div>

                  <p class="section-desc">${sec.desc}</p>

                  <div class="section-progress-row">
                    <div class="progress-bar-track">
                      <div class="progress-bar-fill" style="width: ${pct}%"></div>
                    </div>
                    <span class="section-progress-txt">${completedCount} / ${secRules.length} Regels (${pct}%)</span>
                  </div>

                  <div class="section-rules-subgrid">
                    ${secRules.map(r => {
                      const isDone = !!this.store.state.progress.grammarCompleted[r.id];
                      return `
                        <button class="rule-chip-btn ${isDone ? 'done' : ''}" data-rule-id="${r.id}">
                          <span>${isDone ? '✓' : '○'}</span> ${r.title}
                        </button>
                      `;
                    }).join("")}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    attachPathListeners() {
      document.querySelectorAll(".rule-chip-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const ruleId = btn.dataset.ruleId;
          this.openGrammarRule(ruleId);
        });
      });
    }

    /* ==========================================================================
       3. PRACTICE HUB & 10 INTERACTIVE MODES
       ========================================================================== */
    renderPracticeView() {
      const modes = [
        { id: "flashcards", name: "SRS Flitskaarten", icon: "🃏", desc: "Spaced repetition geheugentraining" },
        { id: "article_drill", name: "De of Het Drill", icon: "🎯", desc: "Bliksemsnelle lidwoord training" },
        { id: "spelling", name: "Spelling & Typen", icon: "✍️", desc: "Actieve woordproductie en spelling" },
        { id: "fill_blank", name: "Zin Aanvullen", icon: "📝", desc: "Contextuele woordkeuze in voorbeeldzinnen" },
        { id: "choose_word", name: "Woord Kiezen", icon: "🔤", desc: "Meerkeuze betekenisassociatie" },
        { id: "verbs", name: "Werkwoorden", icon: "⚙️", desc: "Tegenwoordige tijd en stam+t vervoegingen" },
        { id: "synonyms", name: "Synoniemen", icon: "🔄", desc: "Woordenschat uitbreiding & verwantschap" },
        { id: "morphology", name: "Meervoud & Verklein", icon: "📐", desc: "Zelfstandige naamwoorden transformaties" },
        { id: "context", name: "Zinscontext", icon: "💬", desc: "Authentieke zinnen en voorbeeldgebruik" }
      ];

      return `
        <div class="practice-container animate-fade">
          <!-- Practice Mode Selector Bar -->
          <div class="practice-nav-bar">
            ${modes.map((m) => `
              <button class="btn btn-sm ${this.practiceMode === m.id ? 'btn-primary' : 'btn-outline'}" data-mode="${m.id}">
                ${m.icon} ${m.name}
              </button>
            `).join("")}
          </div>

          <!-- Active Practice Mode Container -->
          <div class="practice-active-zone" id="practice-zone">
            ${this.renderActivePracticeMode()}
          </div>
        </div>
      `;
    }

    renderActivePracticeMode() {
      switch (this.practiceMode) {
        case "flashcards":
          return this.renderFlashcardsMode();
        case "article_drill":
          return this.renderArticleDrillMode();
        case "spelling":
          return this.renderSpellingMode();
        case "fill_blank":
          return this.renderFillBlankMode();
        case "choose_word":
          return this.renderChooseWordMode();
        case "verbs":
          return this.renderVerbsMode();
        case "synonyms":
          return this.renderSynonymsMode();
        case "morphology":
          return this.renderMorphologyMode();
        case "context":
          return this.renderContextMode();
        default:
          return this.renderFlashcardsMode();
      }
    }

    attachPracticeListeners() {
      document.querySelectorAll("[data-mode]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.practiceMode = btn.dataset.mode;
          this.session.cards = [];
          this.session.currentIndex = 0;
          this.session.revealed = false;
          this.session.feedback = null;
          this.render();
        });
      });

      const restartBtn = document.getElementById("btn-restart-session");
      if (restartBtn) {
        restartBtn.addEventListener("click", () => {
          this.session.cards = [];
          this.session.currentIndex = 0;
          this.session.revealed = false;
          this.session.feedback = null;
          this.render();
        });
      }

      const goTodayBtn = document.getElementById("btn-go-today");
      if (goTodayBtn) {
        goTodayBtn.addEventListener("click", () => {
          this.switchTab("today");
        });
      }

      // Mode-specific listeners
      switch (this.practiceMode) {
        case "flashcards":
          this.attachFlashcardListeners();
          break;
        case "article_drill":
          this.attachArticleDrillListeners();
          break;
        case "spelling":
          this.attachSpellingListeners();
          break;
        case "fill_blank":
          this.attachFillBlankListeners();
          break;
        case "choose_word":
          this.attachChooseWordListeners();
          break;
        case "verbs":
          this.attachVerbsListeners();
          break;
        case "synonyms":
          this.attachSynonymsListeners();
          break;
        case "morphology":
          this.attachMorphologyListeners();
          break;
        case "context":
          this.attachContextListeners();
          break;
      }
    }

    // --- Mode 1: Flashcards (SRS Due Prioritized, Unseen Fillers, Full 20,000 Word Bank) ---
    renderFlashcardsMode() {
      const words = global.NP_WORDS || [];
      const sessionSize = this.store.state.settings.sessionSize || 10;

      if (!this.session.cards || this.session.cards.length === 0) {
        const dueSrs = this.srs.getDueCards("vocab");
        const srsCards = this.store.state.srs ? this.store.state.srs.cards : {};
        this.session.cards = Learning.generateFlashcardSession({
          wordsBank: words,
          srsCards,
          dueCards: dueSrs,
          sessionSize
        });
        this.session.currentIndex = 0;
        this.session.revealed = false;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const card = this.session.cards[this.session.currentIndex];
      const isNoun = card.pos === "noun" && card.article;
      const displayDutch = isNoun ? `<span class="word-article article-${card.article}">${card.article}</span> ${card.word}` : card.word;

      return `
        <div class="flashcard-wrapper animate-fade">
          <div class="flashcard-header-bar">
            <span>Kaart ${this.session.currentIndex + 1} van ${this.session.cards.length}</span>
            <span class="word-level-badge badge-${card.level.toLowerCase()}">${card.level}</span>
          </div>

          <div class="flashcard-container" id="interactive-flashcard">
            <div class="card flashcard ${this.session.revealed ? 'revealed' : ''}">
              <div class="flashcard-front">
                <span class="flashcard-pos">${card.pos.toUpperCase()}</span>
                <div class="flashcard-dutch">${displayDutch}</div>
                ${card.example ? `<div class="flashcard-example">“${card.example}”</div>` : ""}
                <div class="flashcard-hint">Tik op de kaart of druk op [Spatie] om het antwoord te zien</div>
              </div>

              ${this.session.revealed ? `
                <div class="flashcard-back animate-fade">
                  <div class="flashcard-meaning">${card.meaning || card.word}</div>
                  ${card.exampleEn ? `<div class="flashcard-example-en">${card.exampleEn}</div>` : ""}
                  ${card.synonyms && card.synonyms.length > 0 ? `<div class="flashcard-synonyms"><strong>Synoniemen:</strong> ${card.synonyms.join(", ")}</div>` : ""}
                  <div class="flashcard-category">Categorie: ${card.category}</div>
                </div>
              ` : ""}
            </div>
          </div>

          ${this.session.revealed ? `
            <div class="srs-controls animate-fade">
              <button class="btn btn-srs btn-again" id="btn-srs-again" data-rating="1">
                <span>1</span> Opnieuw<small>(&lt; 1 dag)</small>
              </button>
              <button class="btn btn-srs btn-hard" id="btn-srs-hard" data-rating="2">
                <span>2</span> Moeilijk<small>(2 dagen)</small>
              </button>
              <button class="btn btn-srs btn-good" id="btn-srs-good" data-rating="3">
                <span>3</span> Goed<small>(4 dagen)</small>
              </button>
              <button class="btn btn-srs btn-easy" id="btn-srs-easy" data-rating="4">
                <span>4</span> Makkelijk<small>(7 dagen)</small>
              </button>
            </div>
          ` : ""}
        </div>
      `;
    }

    attachFlashcardListeners() {
      const cardEl = document.getElementById("interactive-flashcard");
      if (cardEl) {
        cardEl.addEventListener("click", () => this.toggleCardReveal());
      }

      document.querySelectorAll(".btn-srs").forEach((btn) => {
        btn.addEventListener("click", () => {
          const rating = parseInt(btn.dataset.rating, 10);
          this.handleSRSRating(rating);
        });
      });
    }

    toggleCardReveal() {
      this.session.revealed = !this.session.revealed;
      this.render();
    }

    handleSRSRating(rating) {
      const card = this.session.cards[this.session.currentIndex];
      this.srs.review(card.id, rating, "vocab");
      this.session.currentIndex += 1;
      this.session.revealed = false;
      this.render();
    }

    renderSessionCompleteScreen() {
      return `
        <div class="card session-complete-card animate-fade">
          <div class="complete-icon">🎉</div>
          <h2>Geweldig gedaan!</h2>
          <p>Je hebt deze oefensessie van ${this.session.cards.length} kaarten succesvol afgerond.</p>
          <div class="session-stats-row">
            <div class="session-stat-box">
              <span class="stat-num">+${this.session.cards.length * 10}</span>
              <span class="stat-label">XP Verdiend</span>
            </div>
            <div class="session-stat-box">
              <span class="stat-num">${this.store.state.user.streak}</span>
              <span class="stat-label">Dagen Streak</span>
            </div>
          </div>
          <div class="complete-actions">
            <button class="btn btn-primary" id="btn-restart-session">🔄 Nog een Sessie</button>
            <button class="btn btn-outline" id="btn-go-today">Terug naar Vandaag</button>
          </div>
        </div>
      `;
    }

    // --- Mode 2: Article Drill ---
    renderArticleDrillMode() {
      const words = global.NP_WORDS || [];
      const sessionSize = this.store.state.settings.sessionSize || 10;
      const nouns = words.filter((w) => w.pos === "noun" && w.article && w.learnable !== false);

      if (!this.session.cards || this.session.cards.length === 0) {
        this.session.cards = Learning.sampleArray(nouns, sessionSize);
        this.session.currentIndex = 0;
        this.session.score = 0;
        this.session.feedback = null;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];
      const stats = this.store.state.progress.articleStats;
      const acc = stats.totalDrilled > 0 ? Math.round((stats.correct / stats.totalDrilled) * 100) : 100;

      return `
        <div class="drill-wrapper animate-fade">
          <div class="drill-stats-header">
            <span>Vraag ${this.session.currentIndex + 1} / ${this.session.cards.length}</span>
            <span>Totale Lidwoord Score: <strong>${acc}%</strong> (${stats.correct}/${stats.totalDrilled})</span>
          </div>

          <div class="card drill-card">
            <span class="drill-sub">Kies het juiste lidwoord voor:</span>
            <div class="drill-noun">${item.word}</div>
            <div class="drill-meaning">${item.meaning || ""}</div>

            <div class="drill-options">
              <button class="btn btn-drill btn-de" data-choice="de" ${this.session.feedback ? 'disabled' : ''}>de</button>
              <button class="btn btn-drill btn-het" data-choice="het" ${this.session.feedback ? 'disabled' : ''}>het</button>
            </div>

            ${this.session.feedback ? `
              <div class="drill-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? '✓ Uitstekend!' : '✗ Helaas niet juist.'}
                Het is <strong>${item.article} ${item.word}</strong>.
                ${item.word.endsWith("je") ? "<br><small>Tip: Alle verkleinwoorden krijgen 'het'!</small>" : ""}
              </div>
              <button class="btn btn-primary btn-block" id="btn-next-drill" style="margin-top: 1rem;">Volgende Vraag →</button>
            ` : ""}
          </div>
        </div>
      `;
    }

    attachArticleDrillListeners() {
      document.querySelectorAll(".btn-drill").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (this.session.feedback) return;
          const choice = btn.dataset.choice;
          const item = this.session.cards[this.session.currentIndex];
          const isCorrect = choice === item.article;

          this.store.recordArticleDrill(item.word, choice, item.article);
          this.session.feedback = { isCorrect, choice, correct: item.article };
          this.render();
        });
      });

      const nextBtn = document.getElementById("btn-next-drill");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
        });
      }
    }

    // --- Mode 3: Spelling ---
    renderSpellingMode() {
      const words = global.NP_WORDS || [];
      const sessionSize = this.store.state.settings.sessionSize || 10;
      const eligible = words.filter((w) => w.learnable !== false);

      if (!this.session.cards || this.session.cards.length === 0) {
        this.session.cards = Learning.sampleArray(eligible, sessionSize);
        this.session.currentIndex = 0;
        this.session.feedback = null;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];

      return `
        <div class="spelling-wrapper animate-fade">
          <div class="card typing-card">
            <span class="card-tag">Typ het juiste Nederlandse woord</span>
            <div class="drill-meaning" style="font-size: 1.4rem; font-weight: 700; margin: 1.5rem 0;">
              “${item.meaning || item.word}”
            </div>
            ${item.exampleEn ? `<p class="context-hint">Context: ${item.exampleEn}</p>` : ""}

            <form id="spelling-form" class="spelling-form">
              <input type="text" id="spelling-input" class="form-input" placeholder="Typ hier in het Nederlands..." autocomplete="off" autofocus ${this.session.feedback ? 'disabled' : ''} />
              <button type="submit" class="btn btn-primary" style="margin-top: 1rem;" ${this.session.feedback ? 'disabled' : ''}>Controleer Antwoord</button>
            </form>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? '✓ Helemaal goed gespeld!' : `✗ Niet helemaal juist. Het juiste antwoord is: <strong>${item.word}</strong>`}
              </div>
              <button class="btn btn-secondary btn-block" id="btn-next-spelling" style="margin-top: 1rem;">Volgend Woord →</button>
            ` : ""}
          </div>
        </div>
      `;
    }

    attachSpellingListeners() {
      const form = document.getElementById("spelling-form");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          if (this.session.feedback) return;
          const input = document.getElementById("spelling-input");
          const userText = (input ? input.value : "").trim();
          const item = this.session.cards[this.session.currentIndex];
          const isCorrect = Learning.normalizeAnswer(userText) === Learning.normalizeAnswer(item.word);

          this.store.recordActivity(isCorrect ? 10 : 2);
          this.session.feedback = { isCorrect, userText };
          this.render();
        });
      }

      const nextBtn = document.getElementById("btn-next-spelling");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
        });
      }
    }

    // --- Mode 4: Fill in the Blank (Exact Normalized Grading & Stable Target) ---
    renderFillBlankMode() {
      const sentences = global.NP_SENTENCES || [];
      const words = global.NP_WORDS || [];
      const sessionSize = this.store.state.settings.sessionSize || 10;

      if (!this.session.cards || this.session.cards.length === 0) {
        const sampledSentences = Learning.sampleArray(sentences, sessionSize);
        this.session.cards = sampledSentences
          .map((s) => Learning.createFillBlankCard(s, words))
          .filter(Boolean);
        this.session.currentIndex = 0;
        this.session.feedback = null;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];

      return `
        <div class="fill-blank-wrapper animate-fade">
          <div class="card drill-card">
            <span class="card-tag">Vul het ontbrekende woord in</span>
            <div class="drill-noun" style="font-size: 1.4rem; line-height: 1.6; margin: 1.5rem 0;">
              ${item.maskedSentence}
            </div>
            <div class="drill-meaning">“${item.translation}”</div>

            <div class="options-grid">
              ${(item.options || []).map((opt) => {
                const isSelected = this.session.feedback && this.session.feedback.chosen === opt;
                return `
                  <button class="btn btn-outline btn-option ${isSelected ? (this.session.feedback.isCorrect ? 'btn-success' : 'btn-wrong') : ''}" data-option="${opt}" ${this.session.feedback ? 'disabled' : ''}>
                    ${opt}
                  </button>
                `;
              }).join("")}
            </div>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? '✓ Juist gekozen!' : `✗ Helaas. Het juiste woord was: <strong>${item.targetWord}</strong>`}
              </div>
              <button class="btn btn-primary btn-block" id="btn-next-fill-blank" style="margin-top: 1rem;">Volgende Zin →</button>
            ` : ""}
          </div>
        </div>
      `;
    }

    attachFillBlankListeners() {
      document.querySelectorAll(".btn-option").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (this.session.feedback) return;
          const chosen = btn.dataset.option;
          const item = this.session.cards[this.session.currentIndex];
          const isCorrect = Learning.normalizeAnswer(chosen) === Learning.normalizeAnswer(item.targetWord);

          this.store.recordActivity(isCorrect ? 10 : 2);
          this.session.feedback = { isCorrect, chosen };
          this.render();
        });
      });

      const nextBtn = document.getElementById("btn-next-fill-blank");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
        });
      }
    }

    // --- Mode 5: Choose Word (Dynamic Non-Duplicate Distractors) ---
    renderChooseWordMode() {
      const words = (global.NP_WORDS || []).filter((w) => w.learnable !== false);
      const sessionSize = this.store.state.settings.sessionSize || 10;

      if (!this.session.cards || this.session.cards.length === 0) {
        const sampledWords = Learning.sampleArray(words, sessionSize);
        this.session.cards = sampledWords.map((item) => {
          const sameCategory = words.filter((w) => w.id !== item.id && w.category === item.category);
          const otherWords = words.filter((w) => w.id !== item.id);
          const distractorPool = sameCategory.length >= 3 ? sameCategory : otherWords;
          const sampledDistractors = Learning.sampleArray(distractorPool, 3);
          const options = Learning.shuffleArray([item, ...sampledDistractors]);
          return Object.assign({}, item, { options });
        });
        this.session.currentIndex = 0;
        this.session.feedback = null;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];

      return `
        <div class="choose-word-wrapper animate-fade">
          <div class="card drill-card">
            <span class="card-tag">Kies het juiste Nederlandse woord voor:</span>
            <div class="drill-meaning" style="font-size: 1.6rem; font-weight: 800; margin: 1.5rem 0;">
              “${item.meaning || item.word}”
            </div>

            <div class="options-grid">
              ${(item.options || []).map((opt) => {
                const isSelected = this.session.feedback && this.session.feedback.chosenId === opt.id;
                return `
                  <button class="btn btn-outline btn-choice-word ${isSelected ? (this.session.feedback.isCorrect ? 'btn-success' : 'btn-wrong') : ''}" data-word-id="${opt.id}" ${this.session.feedback ? 'disabled' : ''}>
                    ${opt.displayWord || opt.word}
                  </button>
                `;
              }).join("")}
            </div>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? '✓ Uitstekend!' : `✗ Helaas. Het juiste woord is: <strong>${item.displayWord || item.word}</strong>`}
              </div>
              <button class="btn btn-primary btn-block" id="btn-next-choose" style="margin-top: 1rem;">Volgend Woord →</button>
            ` : ""}
          </div>
        </div>
      `;
    }

    attachChooseWordListeners() {
      document.querySelectorAll(".btn-choice-word").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (this.session.feedback) return;
          const chosenId = btn.dataset.wordId;
          const item = this.session.cards[this.session.currentIndex];
          const isCorrect = chosenId === item.id;

          this.store.recordActivity(isCorrect ? 10 : 2);
          this.session.feedback = { isCorrect, chosenId };
          this.render();
        });
      });

      const nextBtn = document.getElementById("btn-next-choose");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
        });
      }
    }

    // --- Mode 6: Verbs (Exact Hij/Zij Present Tense Grading from Trusted Lemma Infinitives) ---
    renderVerbsMode() {
      const words = global.NP_WORDS || [];
      const sessionSize = this.store.state.settings.sessionSize || 10;

      if (!this.session.cards || this.session.cards.length === 0) {
        const eligibleVerbs = Learning.getEligibleVerbs(words);
        const sampled = Learning.sampleArray(eligibleVerbs, sessionSize);
        this.session.cards = sampled.map((v) => {
          const expectedHij = Learning.getVerbHijConjugation(v.word, words);
          return Object.assign({}, v, { expectedHij });
        });
        this.session.currentIndex = 0;
        this.session.feedback = null;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];

      return `
        <div class="verbs-wrapper animate-fade">
          <div class="card drill-card">
            <span class="card-tag">Werkwoord Vervoeging</span>
            <div class="drill-noun" style="margin: 1rem 0;">${item.word}</div>
            <div class="drill-meaning">“${item.meaning || ''}”</div>

            <p style="margin: 1.5rem 0 0.5rem; color: var(--text-secondary);">Typ de tegenwoordige tijd voor 'hij/zij':</p>
            <form id="verb-form" class="verb-form">
              <input type="text" id="verb-input" class="form-input" placeholder="bijv. werkt, loopt..." autocomplete="off" autofocus ${this.session.feedback ? 'disabled' : ''} />
              <button type="submit" class="btn btn-primary" style="margin-top: 1rem;" ${this.session.feedback ? 'disabled' : ''}>Controleer Vorm</button>
            </form>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? `✓ Juist vervoegd: '${item.expectedHij}'!` : `✗ Helaas. De juiste 'hij/zij' vorm is: <strong>${item.expectedHij}</strong>`}
              </div>
              <button class="btn btn-secondary btn-block" id="btn-next-verb" style="margin-top: 1rem;">Volgend Werkwoord →</button>
            ` : ""}
          </div>
        </div>
      `;
    }

    attachVerbsListeners() {
      const form = document.getElementById("verb-form");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          if (this.session.feedback) return;
          const input = document.getElementById("verb-input");
          const text = (input ? input.value : "").trim();
          const item = this.session.cards[this.session.currentIndex];
          const isCorrect = Learning.normalizeAnswer(text) === Learning.normalizeAnswer(item.expectedHij);

          this.store.recordActivity(isCorrect ? 10 : 2);
          this.session.feedback = { isCorrect, text };
          this.render();
        });
      }

      const nextBtn = document.getElementById("btn-next-verb");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
        });
      }
    }

    // --- Mode 7: Synonyms ---
    renderSynonymsMode() {
      const words = (global.NP_WORDS || []).filter((w) => w.synonyms && w.synonyms.length > 0);
      const sessionSize = this.store.state.settings.sessionSize || 10;

      if (!this.session.cards || this.session.cards.length === 0) {
        const sampledWords = Learning.sampleArray(words, sessionSize);
        this.session.cards = sampledWords.map((item) => {
          const correctSyn = item.synonyms[0];
          const otherSyns = words.filter((w) => w.id !== item.id && w.synonyms && w.synonyms.length > 0);
          const sampledDistractors = Learning.sampleArray(otherSyns, 3).map((w) => w.synonyms[0]);
          const options = Learning.shuffleArray([correctSyn, ...sampledDistractors]);
          return Object.assign({}, item, { correctSyn, options });
        });
        this.session.currentIndex = 0;
        this.session.feedback = null;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];

      return `
        <div class="synonyms-wrapper animate-fade">
          <div class="card drill-card">
            <span class="card-tag">Synoniemen & Betekenisverwantschap</span>
            <div class="drill-noun" style="font-size: 1.8rem; margin: 1.5rem 0;">${item.displayWord || item.word}</div>
            <div class="drill-meaning">“${item.meaning || ''}”</div>
            <p style="color: var(--text-secondary); margin-top: 1rem;">Kies het juiste synoniem voor dit woord:</p>

            <div class="options-grid" style="margin-top: 1rem;">
              ${(item.options || []).map((opt) => {
                const isSelected = this.session.feedback && this.session.feedback.chosen === opt;
                return `
                  <button class="btn btn-outline btn-syn-opt ${isSelected ? (this.session.feedback.isCorrect ? 'btn-success' : 'btn-wrong') : ''}" data-syn="${opt}" ${this.session.feedback ? 'disabled' : ''}>
                    ${opt}
                  </button>
                `;
              }).join("")}
            </div>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? '✓ Juist synoniem gekozen!' : `✗ Niet juist. Een synoniem van '${item.word}' is: <strong>${item.correctSyn}</strong>.`}
              </div>
              <button class="btn btn-primary btn-block" id="btn-next-syn" style="margin-top: 1rem;">Volgende Vraag →</button>
            ` : ""}
          </div>
        </div>
      `;
    }

    attachSynonymsListeners() {
      document.querySelectorAll(".btn-syn-opt").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (this.session.feedback) return;
          const chosen = btn.dataset.syn;
          const item = this.session.cards[this.session.currentIndex];
          const isCorrect = (item.synonyms || []).some((s) => Learning.normalizeAnswer(s) === Learning.normalizeAnswer(chosen));

          this.store.recordActivity(isCorrect ? 10 : 2);
          this.session.feedback = { isCorrect, chosen };
          this.render();
        });
      });

      const nextBtn = document.getElementById("btn-next-syn");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
        });
      }
    }

    // --- Mode 8: Plural Morphology (Exact Verified Plural Equality) ---
    renderMorphologyMode() {
      const words = global.NP_WORDS || [];
      const sessionSize = this.store.state.settings.sessionSize || 10;

      if (!this.session.cards || this.session.cards.length === 0) {
        const candidateNouns = words.filter((w) => w.pos === "noun" && w.article);
        const validNouns = [];

        for (const n of candidateNouns) {
          const expectedPlural = Learning.getNounPlural(n.word, words);
          if (expectedPlural) {
            validNouns.push(Object.assign({}, n, { expectedPlural }));
          }
        }

        this.session.cards = Learning.sampleArray(validNouns, sessionSize);
        this.session.currentIndex = 0;
        this.session.feedback = null;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];

      return `
        <div class="morphology-wrapper animate-fade">
          <div class="card drill-card">
            <span class="card-tag">Meervoud & Verkleinwoorden</span>
            <div class="drill-noun" style="margin: 1.5rem 0;">${item.displayWord || item.word}</div>
            <div class="drill-meaning">“${item.meaning || ''}”</div>

            <p style="color: var(--text-secondary); margin-top: 1rem;">Typ het meervoud (plural) van dit zelfstandig naamwoord:</p>
            <form id="morphology-form" style="margin-top: 1rem;">
              <input type="text" id="morphology-input" class="form-input" placeholder="Typ het meervoud..." autocomplete="off" autofocus ${this.session.feedback ? 'disabled' : ''} />
              <button type="submit" class="btn btn-primary" style="margin-top: 1rem;" ${this.session.feedback ? 'disabled' : ''}>Controleer Meervoud</button>
            </form>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? `✓ Juiste meervoudsvorm: '${item.expectedPlural}'!` : `✗ Helaas. Het juiste meervoud is: <strong>${item.expectedPlural}</strong>`}
              </div>
              <button class="btn btn-secondary btn-block" id="btn-next-morph" style="margin-top: 1rem;">Volgend Zelfstandig Naamwoord →</button>
            ` : ""}
          </div>
        </div>
      `;
    }

    attachMorphologyListeners() {
      const form = document.getElementById("morphology-form");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          if (this.session.feedback) return;
          const input = document.getElementById("morphology-input");
          const val = (input ? input.value : "").trim();
          const item = this.session.cards[this.session.currentIndex];
          const isCorrect = Learning.normalizeAnswer(val) === Learning.normalizeAnswer(item.expectedPlural);

          this.store.recordActivity(isCorrect ? 10 : 2);
          this.session.feedback = { isCorrect, val };
          this.render();
        });
      }

      const nextBtn = document.getElementById("btn-next-morph");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
        });
      }
    }

    // --- Mode 9: Context Practice ---
    renderContextMode() {
      const sentences = global.NP_SENTENCES || [];
      const sessionSize = this.store.state.settings.sessionSize || 10;

      if (!this.session.cards || this.session.cards.length === 0) {
        this.session.cards = Learning.sampleArray(sentences, sessionSize);
        this.session.currentIndex = 0;
        this.session.feedback = null;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];

      return `
        <div class="context-wrapper animate-fade">
          <div class="card drill-card">
            <span class="card-tag">Context & Zinsgebruik</span>
            <div class="drill-noun" style="font-size: 1.3rem; line-height: 1.6; margin: 1.5rem 0;">${item.nl}</div>
            <div class="drill-meaning">“${item.en}”</div>
            <div style="margin-top: 1rem; font-size: 0.88rem; color: var(--text-secondary);">
              Grammaticaal niveau: <span class="badge-${item.level.toLowerCase()}">${item.level}</span>
            </div>

            <button class="btn btn-primary btn-block" id="btn-next-ctx" style="margin-top: 1.5rem;">Begrepen & Volgende Zin →</button>
          </div>
        </div>
      `;
    }

    attachContextListeners() {
      const nextBtn = document.getElementById("btn-next-ctx");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.store.recordActivity(10);
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
        });
      }
    }

    /* ==========================================================================
       4. GRAMMAR VIEW (Catalog & Interactive 7-Exercise Lesson Viewer)
       ========================================================================== */
    renderGrammarView() {
      const grammarRules = global.NP_GRAMMAR || [];

      if (this.activeGrammarRule) {
        return this.renderGrammarRuleDetail(this.activeGrammarRule);
      }

      // Catalog view
      const filtered = this.selectedLevel === "all" ? grammarRules : grammarRules.filter((r) => r.level === this.selectedLevel);

      return `
        <div class="grammar-catalog-container animate-fade">
          <div class="catalog-header">
            <div>
              <h1 class="page-title">Nederlandse Grammatica</h1>
              <p class="page-subtitle">120 diepgaande regels, structurele formules, voorbeelden en interactieve oefeningen.</p>
            </div>
            
            <div class="filter-pills">
              ${["all", "A1", "A2", "B1", "B2", "C1"].map((lvl) => `
                <button class="btn btn-sm ${this.selectedLevel === lvl ? 'btn-primary' : 'btn-outline'}" data-filter-lvl="${lvl}">
                  ${lvl === 'all' ? 'Alle Niveaus' : lvl}
                </button>
              `).join("")}
            </div>
          </div>

          <div class="grammar-rules-grid">
            ${filtered.map((rule) => {
              const isCompleted = !!this.store.state.progress.grammarCompleted[rule.id];
              return `
                <div class="card grammar-item-card" data-rule-id="${rule.id}">
                  <div class="grammar-card-top">
                    <span class="grammar-level badge-${rule.level.toLowerCase()}">${rule.level}</span>
                    <span class="grammar-section">Sectie ${rule.section}</span>
                  </div>
                  <h3 class="grammar-title">${rule.title}</h3>
                  <div class="grammar-nl-title">${rule.titleNl}</div>
                  <p class="grammar-summary">${rule.summary}</p>
                  <div class="grammar-card-footer">
                    <span>${rule.exercises ? rule.exercises.length : 3} Oefeningen</span>
                    <span class="status-indicator">${isCompleted ? '✓ Voltooid' : 'Nog te doen →'}</span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    renderGrammarRuleDetail(rule) {
      const exercises = rule.exercises || [];
      const currentEx = exercises[this.activeGrammarExIndex] || exercises[0];
      const completedExercisesCount = Object.keys(this.activeGrammarAnswers).length;
      const allDone = completedExercisesCount >= exercises.length;

      return `
        <div class="grammar-detail-container animate-fade">
          <button class="btn btn-outline btn-sm" id="btn-back-grammar">← Terug naar Grammatica Overzicht</button>

          <div class="card grammar-lesson-card" style="margin-top: 1.5rem;">
            <div class="lesson-header">
              <span class="grammar-level badge-${rule.level.toLowerCase()}">${rule.level}</span>
              <h1 class="lesson-title">${rule.title}</h1>
              <div class="lesson-nl-title">${rule.titleNl}</div>
            </div>

            <div class="lesson-summary-box">
              <h3>Samenvatting</h3>
              <p>${rule.summary}</p>
            </div>

            <div class="lesson-rules-section">
              <h3>Grammaticale Regels</h3>
              <ul class="rules-bullet-list">
                ${(rule.rules || []).map((r) => `<li>${r}</li>`).join("")}
              </ul>
            </div>

            <div class="lesson-structure-box">
              <h3>Structurele Zinsopbouw (Syntaxis)</h3>
              <div class="syntax-formula">${rule.structuralBreakdown || "[Onderwerp] + [Persoonsvorm (V2)] + [Tijd/Wijze/Plaats] + [Werkwoordcluster]"}</div>
            </div>

            <div class="lesson-examples-section">
              <h3>Authentieke Voorbeelden</h3>
              <div class="examples-grid">
                ${(rule.examples || []).map((ex) => `
                  <div class="example-item">
                    <div class="example-nl">“${ex.nl}”</div>
                    <div class="example-en">${ex.en}</div>
                  </div>
                `).join("")}
              </div>
            </div>

            <div class="lesson-mistake-box">
              <h3>⚠️ Veelgemaakte Fout</h3>
              <div class="mistake-wrong">✗ ${rule.commonMistake || "Foutieve woordvolgorde."}</div>
              <div class="mistake-correct">✓ ${rule.correction || "Gebruik de juiste standaardvolgorde."}</div>
            </div>

            <!-- Interactive Exercise Runner with Multi-Exercise Stepper -->
            <div class="exercise-runner-box" id="grammar-exercise-runner">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0;">Interactieve Oefening (${this.activeGrammarExIndex + 1}/${exercises.length})</h3>
                <div class="exercise-stepper-btns">
                  <button class="btn btn-sm btn-outline" id="btn-prev-grammar-ex" ${this.activeGrammarExIndex === 0 ? 'disabled' : ''}>← Vorige</button>
                  <button class="btn btn-sm btn-outline" id="btn-next-grammar-ex" ${this.activeGrammarExIndex >= exercises.length - 1 ? 'disabled' : ''}>Volgende →</button>
                </div>
              </div>

              ${allDone ? `
                <div class="card session-complete-card animate-fade" style="margin-top: 1rem; text-align: center;">
                  <div class="complete-icon">🌟</div>
                  <h3>Alle oefeningen voor deze regel voltooid!</h3>
                  <p>Voortgang succesvol opgeslagen.</p>
                </div>
              ` : ""}

              ${this.renderGrammarExercise(currentEx)}
            </div>
          </div>
        </div>
      `;
    }

    renderGrammarExercise(ex) {
      if (!ex) return "<p>Geen oefeningen beschikbaar.</p>";
      const answeredState = this.activeGrammarAnswers[this.activeGrammarExIndex];

      switch (ex.type) {
        case "multiple_choice":
          return `
            <div class="exercise-mc animate-fade">
              <p class="exercise-question">${ex.question}</p>
              <div class="options-grid">
                ${(ex.options || []).map((opt, i) => {
                  const isSelected = answeredState && answeredState.userAttempt === i;
                  return `
                    <button class="btn btn-outline btn-grammar-opt ${isSelected ? (answeredState.isCorrect ? 'btn-success' : 'btn-wrong') : ''}" data-opt-idx="${i}" ${answeredState ? 'disabled' : ''}>
                      ${opt}
                    </button>
                  `;
                }).join("")}
              </div>
              <div id="grammar-ex-feedback" class="exercise-feedback ${answeredState ? (answeredState.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${answeredState ? 'display: block;' : 'display: none;'}">
                ${answeredState ? (answeredState.isCorrect ? `✓ Uitstekend! ${ex.explanation}` : `✗ Helaas niet juist. ${ex.explanation}`) : ''}
              </div>
            </div>
          `;
        case "word_order":
          return `
            <div class="exercise-token-order animate-fade">
              <p class="exercise-question">Zet de woorden in de juiste volgorde:</p>
              <div class="exercise-translation">“${ex.translation}”</div>
              
              <div class="tokens-assembled-box" id="tokens-placed-zone">
                ${this.tokenReconstructionPlaced.map((p, idx) => `
                  <span class="chip-token chip-placed" data-placed-idx="${idx}">${p.text} ✕</span>
                `).join("")}
              </div>

              <div class="tokens-pool" id="tokens-pool-zone">
                ${(ex.tokens || []).map((token, idx) => {
                  const isUsed = this.tokenReconstructionPlaced.some((p) => p.poolIndex === idx);
                  return `<button class="chip-token ${isUsed ? 'token-used' : ''}" data-pool-idx="${idx}" ${isUsed || answeredState ? 'disabled' : ''}>${token}</button>`;
                }).join("")}
              </div>

              <button class="btn btn-primary" id="btn-check-tokens" style="margin-top: 1rem;" ${answeredState ? 'disabled' : ''}>Controleer Woordvolgorde</button>
              <div id="grammar-ex-feedback" class="exercise-feedback ${answeredState ? (answeredState.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${answeredState ? 'display: block;' : 'display: none;'}">
                ${answeredState ? (answeredState.isCorrect ? `✓ Perfecte woordvolgorde!` : `✗ Niet juist. Correcte volgorde: “${ex.correctSentence}”`) : ''}
              </div>
            </div>
          `;
        case "fill_in_the_blank":
          return `
            <div class="exercise-fill animate-fade">
              <p class="exercise-question">${ex.prompt || "Vul het juiste woord in:"}</p>
              <div class="exercise-sentence" style="font-size: 1.2rem; font-weight: 700; margin: 1rem 0;">${ex.sentenceWithBlank}</div>
              <div class="hint-chips-pool">
                ${(ex.hints || []).map((h) => {
                  const isSelected = answeredState && answeredState.userAttempt === h;
                  return `
                    <button class="chip-token btn-hint-opt ${isSelected ? (answeredState.isCorrect ? 'btn-success' : 'btn-wrong') : ''}" data-hint="${h}" ${answeredState ? 'disabled' : ''}>
                      ${h}
                    </button>
                  `;
                }).join("")}
              </div>
              <div id="grammar-ex-feedback" class="exercise-feedback ${answeredState ? (answeredState.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${answeredState ? 'display: block;' : 'display: none;'}">
                ${answeredState ? (answeredState.isCorrect ? `✓ Helemaal juist ingevuld!` : `✗ Niet juist. Het juiste woord was: <strong>${ex.blankWord}</strong>`) : ''}
              </div>
            </div>
          `;
        case "typed_conjugation":
          return `
            <div class="exercise-typed-conj animate-fade">
              <p class="exercise-question">Vervoeg het werkwoord '<strong>${ex.infinitive}</strong>' voor '<strong>${ex.subject}</strong>' (${ex.targetTense}):</p>
              <form id="form-grammar-conj" style="margin-top: 1rem;">
                <input type="text" id="input-grammar-conj" class="form-input" placeholder="Typ de juiste vervoeging..." autocomplete="off" ${answeredState ? 'disabled' : ''} />
                <button type="submit" class="btn btn-primary" style="margin-top: 0.75rem;" ${answeredState ? 'disabled' : ''}>Controleer Vervoeging</button>
              </form>
              <div id="grammar-ex-feedback" class="exercise-feedback ${answeredState ? (answeredState.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${answeredState ? 'display: block;' : 'display: none;'}">
                ${answeredState ? (answeredState.isCorrect ? `✓ Uitstekend vervoegd! ${ex.explanation}` : `✗ Niet juist. De juiste vorm is '<strong>${ex.correctForm}</strong>'. ${ex.explanation}`) : ''}
              </div>
            </div>
          `;
        case "sentence_transformation":
          return `
            <div class="exercise-transform animate-fade">
              <p class="exercise-question">${ex.instruction || "Herschrijf de zin:"}</p>
              <div class="original-sentence-box" style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-sm); margin: 0.75rem 0;">
                “${ex.original}”
              </div>
              <form id="form-grammar-transform" style="margin-top: 1rem;">
                <input type="text" id="input-grammar-transform" class="form-input" placeholder="Typ de getransformeerde zin..." autocomplete="off" ${answeredState ? 'disabled' : ''} />
                <button type="submit" class="btn btn-primary" style="margin-top: 0.75rem;" ${answeredState ? 'disabled' : ''}>Controleer Transformatie</button>
              </form>
              <div id="grammar-ex-feedback" class="exercise-feedback ${answeredState ? (answeredState.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${answeredState ? 'display: block;' : 'display: none;'}">
                ${answeredState ? (answeredState.isCorrect ? `✓ Perfecte transformatie!` : `✗ Niet helemaal juist. Modelzin: “<strong>${ex.transformed}</strong>”`) : ''}
              </div>
            </div>
          `;
        case "error_correction":
          return `
            <div class="exercise-error-corr animate-fade">
              <p class="exercise-question">Zoek de fout in de zin en corrigeer deze:</p>
              <div class="original-sentence-box" style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-sm); margin: 0.75rem 0;">
                “${ex.sentenceWithError}”
              </div>
              <form id="form-grammar-error" style="margin-top: 1rem;">
                <input type="text" id="input-grammar-error" class="form-input" placeholder="Typ de gecorrigeerde zin..." autocomplete="off" ${answeredState ? 'disabled' : ''} />
                <button type="submit" class="btn btn-primary" style="margin-top: 0.75rem;" ${answeredState ? 'disabled' : ''}>Controleer Correctie</button>
              </form>
              <div id="grammar-ex-feedback" class="exercise-feedback ${answeredState ? (answeredState.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${answeredState ? 'display: block;' : 'display: none;'}">
                ${answeredState ? (answeredState.isCorrect ? `✓ Foutloos gecorrigeerd! ${ex.explanation}` : `✗ Niet helemaal juist. Correcte zin: “<strong>${ex.correctedSentence}</strong>”. ${ex.explanation}`) : ''}
              </div>
            </div>
          `;
        case "article_selection":
          return `
            <div class="exercise-article-select animate-fade">
              <p class="exercise-question">Kies het juiste lidwoord voor: <strong>${ex.noun}</strong> <em>(${ex.meaning})</em></p>
              <div class="options-grid" style="grid-template-columns: 1fr 1fr; margin-top: 1rem;">
                <button class="btn btn-drill btn-de btn-grammar-art ${answeredState && answeredState.userAttempt === 'de' ? (answeredState.isCorrect ? 'btn-success' : 'btn-wrong') : ''}" data-art="de" ${answeredState ? 'disabled' : ''}>de</button>
                <button class="btn btn-drill btn-het btn-grammar-art ${answeredState && answeredState.userAttempt === 'het' ? (answeredState.isCorrect ? 'btn-success' : 'btn-wrong') : ''}" data-art="het" ${answeredState ? 'disabled' : ''}>het</button>
              </div>
              <div id="grammar-ex-feedback" class="exercise-feedback ${answeredState ? (answeredState.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${answeredState ? 'display: block;' : 'display: none;'}">
                ${answeredState ? (answeredState.isCorrect ? `✓ Juist! Het is <strong>${ex.correct} ${ex.noun}</strong>. ${ex.explanation || ''}` : `✗ Niet juist. Het is <strong>${ex.correct} ${ex.noun}</strong>. ${ex.explanation || ''}`) : ''}
              </div>
            </div>
          `;
        default:
          return `
            <div class="exercise-default animate-fade">
              <p class="exercise-question">${ex.question || ex.prompt || "Beantwoord de vraag:"}</p>
              <button class="btn btn-primary" id="btn-complete-simple-ex" ${answeredState ? 'disabled' : ''}>Begrepen & Afronden ✓</button>
            </div>
          `;
      }
    }

    recordGrammarExerciseAnswer(isCorrect, userAttempt) {
      if (!this.activeGrammarRule) return;
      if (this.activeGrammarAnswers[this.activeGrammarExIndex]) return; // Already recorded

      this.activeGrammarAnswers[this.activeGrammarExIndex] = { isCorrect, userAttempt };
      const exercises = this.activeGrammarRule.exercises || [];

      // Check if all exercises completed
      if (Object.keys(this.activeGrammarAnswers).length === exercises.length) {
        const numCorrect = Object.values(this.activeGrammarAnswers).filter((a) => a.isCorrect).length;
        const score = Math.round((numCorrect / exercises.length) * 100);
        this.store.completeGrammarRule(this.activeGrammarRule.id, score);
      } else {
        this.store.recordActivity(isCorrect ? 5 : 1);
      }
      this.render();
    }

    attachGrammarListeners() {
      const prevExBtn = document.getElementById("btn-prev-grammar-ex");
      if (prevExBtn) {
        prevExBtn.addEventListener("click", () => {
          if (this.activeGrammarExIndex > 0) {
            this.activeGrammarExIndex -= 1;
            this.tokenReconstructionPlaced = [];
            this.render();
          }
        });
      }

      const nextExBtn = document.getElementById("btn-next-grammar-ex");
      if (nextExBtn) {
        nextExBtn.addEventListener("click", () => {
          const exercises = this.activeGrammarRule ? this.activeGrammarRule.exercises || [] : [];
          if (this.activeGrammarExIndex < exercises.length - 1) {
            this.activeGrammarExIndex += 1;
            this.tokenReconstructionPlaced = [];
            this.render();
          }
        });
      }

      document.querySelectorAll(".btn-grammar-opt").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.optIdx, 10);
          const exercises = this.activeGrammarRule.exercises || [];
          const currentEx = exercises[this.activeGrammarExIndex];
          const isCorrect = idx === currentEx.correct;
          this.recordGrammarExerciseAnswer(isCorrect, idx);
        });
      });

      document.querySelectorAll(".btn-grammar-art").forEach((btn) => {
        btn.addEventListener("click", () => {
          const chosen = btn.dataset.art;
          const exercises = this.activeGrammarRule.exercises || [];
          const currentEx = exercises[this.activeGrammarExIndex];
          const isCorrect = chosen.toLowerCase() === currentEx.correct.toLowerCase();
          this.recordGrammarExerciseAnswer(isCorrect, chosen);
        });
      });

      const formConj = document.getElementById("form-grammar-conj");
      if (formConj) {
        formConj.addEventListener("submit", (e) => {
          e.preventDefault();
          const inp = document.getElementById("input-grammar-conj");
          const val = (inp ? inp.value : "").trim();
          const exercises = this.activeGrammarRule.exercises || [];
          const currentEx = exercises[this.activeGrammarExIndex];
          const isCorrect = Learning.normalizeAnswer(val) === Learning.normalizeAnswer(currentEx.correctForm);
          this.recordGrammarExerciseAnswer(isCorrect, val);
        });
      }

      const formTransform = document.getElementById("form-grammar-transform");
      if (formTransform) {
        formTransform.addEventListener("submit", (e) => {
          e.preventDefault();
          const inp = document.getElementById("input-grammar-transform");
          const val = (inp ? inp.value : "").trim();
          const exercises = this.activeGrammarRule.exercises || [];
          const currentEx = exercises[this.activeGrammarExIndex];
          const isCorrect = Learning.normalizeAnswer(val) === Learning.normalizeAnswer(currentEx.transformed);
          this.recordGrammarExerciseAnswer(isCorrect, val);
        });
      }

      const formError = document.getElementById("form-grammar-error");
      if (formError) {
        formError.addEventListener("submit", (e) => {
          e.preventDefault();
          const inp = document.getElementById("input-grammar-error");
          const val = (inp ? inp.value : "").trim();
          const exercises = this.activeGrammarRule.exercises || [];
          const currentEx = exercises[this.activeGrammarExIndex];
          const isCorrect = Learning.normalizeAnswer(val) === Learning.normalizeAnswer(currentEx.correctedSentence);
          this.recordGrammarExerciseAnswer(isCorrect, val);
        });
      }

      // Word Order Pool Tokens (supports duplicate tokens via unique pool indices)
      document.querySelectorAll(".chip-token:not(.chip-placed)").forEach((btn) => {
        btn.addEventListener("click", () => {
          const poolIdx = parseInt(btn.dataset.poolIdx, 10);
          const exercises = this.activeGrammarRule ? this.activeGrammarRule.exercises || [] : [];
          const currentEx = exercises[this.activeGrammarExIndex];
          if (!isNaN(poolIdx) && currentEx && currentEx.tokens && currentEx.tokens[poolIdx]) {
            const alreadyPlaced = this.tokenReconstructionPlaced.some((p) => p.poolIndex === poolIdx);
            if (!alreadyPlaced) {
              this.tokenReconstructionPlaced.push({
                poolIndex: poolIdx,
                text: currentEx.tokens[poolIdx]
              });
              this.render();
            }
          }
        });
      });

      // Placed Word Order Tokens
      document.querySelectorAll(".chip-placed").forEach((chip) => {
        chip.addEventListener("click", () => {
          const placedIdx = parseInt(chip.dataset.placedIdx, 10);
          if (!isNaN(placedIdx) && placedIdx >= 0 && placedIdx < this.tokenReconstructionPlaced.length) {
            this.tokenReconstructionPlaced.splice(placedIdx, 1);
            this.render();
          }
        });
      });

      const checkTokensBtn = document.getElementById("btn-check-tokens");
      if (checkTokensBtn) {
        checkTokensBtn.addEventListener("click", () => {
          const exercises = this.activeGrammarRule.exercises || [];
          const currentEx = exercises[this.activeGrammarExIndex];
          const assembled = this.tokenReconstructionPlaced.map((p) => p.text).join(" ").trim();
          const isCorrect = Learning.normalizeAnswer(assembled) === Learning.normalizeAnswer(currentEx.correctSentence);
          this.recordGrammarExerciseAnswer(isCorrect, assembled);
        });
      }

      document.querySelectorAll(".btn-hint-opt").forEach((btn) => {
        btn.addEventListener("click", () => {
          const hint = btn.dataset.hint;
          const exercises = this.activeGrammarRule.exercises || [];
          const currentEx = exercises[this.activeGrammarExIndex];
          const isCorrect = Learning.normalizeAnswer(hint) === Learning.normalizeAnswer(currentEx.blankWord);
          this.recordGrammarExerciseAnswer(isCorrect, hint);
        });
      });

      const completeSimpleBtn = document.getElementById("btn-complete-simple-ex");
      if (completeSimpleBtn) {
        completeSimpleBtn.addEventListener("click", () => {
          this.recordGrammarExerciseAnswer(true, "completed");
        });
      }

      const backBtn = document.getElementById("btn-back-grammar");
      if (backBtn) {
        backBtn.addEventListener("click", () => {
          this.activeGrammarRule = null;
          this.activeGrammarAnswers = {};
          this.tokenReconstructionPlaced = [];
          this.render();
        });
      }

      document.querySelectorAll(".grammar-item-card").forEach((card) => {
        card.addEventListener("click", () => {
          const ruleId = card.dataset.ruleId;
          this.openGrammarRule(ruleId);
        });
      });

      document.querySelectorAll("[data-filter-lvl]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.selectedLevel = btn.dataset.filterLvl;
          this.render();
        });
      });
    }

    openGrammarRule(ruleId) {
      const rules = global.NP_GRAMMAR || [];
      this.activeGrammarRule = rules.find((r) => r.id === ruleId) || rules[0];
      this.activeGrammarExIndex = 0;
      this.tokenReconstructionPlaced = [];
      this.activeGrammarAnswers = {};
      this.currentTab = "grammar";
      this.render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /* ==========================================================================
       5. COMPREHENSION VIEW (Progressive Passages & Quiz Runner)
       ========================================================================== */
    renderComprehensionView() {
      const passages = global.NP_COMPREHENSION || [];

      if (this.activePassage) {
        return this.renderPassageDetail(this.activePassage);
      }

      const filtered = this.selectedLevel === "all" ? passages : passages.filter((p) => p.level === this.selectedLevel);

      return `
        <div class="comprehension-catalog-container animate-fade">
          <div class="catalog-header">
            <div>
              <h1 class="page-title">Begrijpend Lezen (${passages.length} Teksten)</h1>
              <p class="page-subtitle">Progressieve Nederlandse leesvaardigheid van A1 tot C1 met woordenschat en begripsvragen.</p>
            </div>

            <div class="filter-pills">
              ${["all", "A1", "A2", "B1", "B2", "C1"].map((lvl) => `
                <button class="btn btn-sm ${this.selectedLevel === lvl ? 'btn-primary' : 'btn-outline'}" data-filter-comp-lvl="${lvl}">
                  ${lvl === 'all' ? 'Alle Niveaus' : lvl}
                </button>
              `).join("")}
            </div>
          </div>

          <div class="passages-grid">
            ${filtered.map((passage) => {
              const isCompleted = !!this.store.state.progress.comprehensionCompleted[passage.id];
              return `
                <div class="card passage-item-card" data-passage-id="${passage.id}">
                  <div class="passage-card-top">
                    <span class="grammar-level badge-${passage.level.toLowerCase()}">${passage.level}</span>
                    <span class="reading-time">⏱️ ${passage.readingTimeMin || 4} min</span>
                  </div>
                  <h3 class="passage-title">${passage.title}</h3>
                  <div class="passage-en-title">${passage.titleEn}</div>
                  <p class="passage-snippet">${passage.paragraphs[0]}</p>
                  <div class="passage-card-footer">
                    <span>${passage.questions ? passage.questions.length : 4} Begripsvragen</span>
                    <span class="status-indicator">${isCompleted ? '✓ Gelezen' : 'Start Lezen →'}</span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    renderPassageDetail(passage) {
      const answeredCount = Object.keys(this.activePassageAnswers).length;
      const totalQuestions = passage.questions ? passage.questions.length : 0;
      const allAnswered = totalQuestions > 0 && answeredCount >= totalQuestions;
      const numCorrect = Object.values(this.activePassageAnswers).filter((a) => a.isCorrect).length;
      const pctScore = totalQuestions > 0 ? Math.round((numCorrect / totalQuestions) * 100) : 0;

      return `
        <div class="passage-detail-container animate-fade">
          <button class="btn btn-outline btn-sm" id="btn-back-comprehension">← Terug naar Teksten Overzicht</button>

          <div class="card passage-reader-card" style="margin-top: 1.5rem;">
            <div class="passage-header">
              <span class="grammar-level badge-${passage.level.toLowerCase()}">${passage.level}</span>
              <h1 class="passage-title">${passage.title}</h1>
              <div class="passage-en-title">${passage.titleEn}</div>
            </div>

            <div class="passage-paragraphs">
              ${passage.paragraphs.map((p) => `<p class="passage-p">${p}</p>`).join("")}
            </div>

            <details class="passage-translation-accordion">
              <summary>📖 Bekijk Engelse Vertaling</summary>
              <div class="translation-content">${passage.translation}</div>
            </details>

            ${passage.keyVocabulary && passage.keyVocabulary.length > 0 ? `
              <div class="passage-vocab-box">
                <h3>Sleutelwoorden uit de Tekst</h3>
                <div class="vocab-chips-grid">
                  ${passage.keyVocabulary.map((v) => `
                    <div class="vocab-chip">
                      <strong>${v.word}</strong> <span class="vocab-chip-en">(${v.en})</span>
                    </div>
                  `).join("")}
                </div>
              </div>
            ` : ""}

            <div class="passage-quiz-box">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0;">Begripsvragen (${answeredCount}/${totalQuestions})</h3>
                ${allAnswered ? `
                  <span class="status-indicator">Score: <strong>${pctScore}%</strong> (${numCorrect}/${totalQuestions} juist)</span>
                ` : ""}
              </div>

              ${allAnswered ? `
                <div class="card session-complete-card animate-fade" style="margin-bottom: 1.5rem; text-align: center;">
                  <div class="complete-icon">🎉</div>
                  <h3>Tekst & Quiz Voltooid!</h3>
                  <p>Je hebt <strong>${numCorrect} van de ${totalQuestions}</strong> vragen juist beantwoord (${pctScore}%).</p>
                </div>
              ` : ""}

              ${(passage.questions || []).map((q, qIdx) => {
                const ans = this.activePassageAnswers[qIdx];
                return `
                  <div class="quiz-question-card" data-q-idx="${qIdx}">
                    <p class="q-title"><strong>Vraag ${qIdx + 1}:</strong> ${q.question}</p>
                    <div class="options-grid">
                      ${(q.options || []).map((opt, oIdx) => {
                        const isChosen = ans && ans.chosenOptIdx === oIdx;
                        const isCorrectOption = ans && oIdx === q.correct;
                        let btnClass = "btn-outline";
                        if (ans) {
                          if (isChosen) {
                            btnClass = ans.isCorrect ? "btn-success" : "btn-wrong";
                          } else if (isCorrectOption) {
                            btnClass = "btn-success";
                          }
                        }
                        return `
                          <button class="btn ${btnClass} btn-passage-opt" data-q-idx="${qIdx}" data-opt-idx="${oIdx}" ${ans ? 'disabled' : ''}>
                            ${opt}
                          </button>
                        `;
                      }).join("")}
                    </div>
                    <div class="exercise-feedback q-feedback-${qIdx} ${ans ? (ans.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${ans ? 'display: block;' : 'display: none;'}">
                      ${ans ? (ans.isCorrect ? `✓ Juist! ${q.explanation}` : `✗ Helaas. ${q.explanation}`) : ''}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      `;
    }

    attachComprehensionListeners() {
      const backBtn = document.getElementById("btn-back-comprehension");
      if (backBtn) {
        backBtn.addEventListener("click", () => {
          this.activePassage = null;
          this.activePassageAnswers = {};
          this.render();
        });
      }

      document.querySelectorAll(".passage-item-card").forEach((card) => {
        card.addEventListener("click", () => {
          const passageId = card.dataset.passageId;
          const passages = global.NP_COMPREHENSION || [];
          this.activePassage = passages.find((p) => p.id === passageId) || passages[0];
          this.activePassageAnswers = {};
          this.render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });

      document.querySelectorAll("[data-filter-comp-lvl]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.selectedLevel = btn.dataset.filterCompLvl;
          this.render();
        });
      });

      document.querySelectorAll(".btn-passage-opt").forEach((btn) => {
        btn.addEventListener("click", () => {
          const qIdx = parseInt(btn.dataset.qIdx, 10);
          const optIdx = parseInt(btn.dataset.optIdx, 10);
          if (!this.activePassage || !this.activePassage.questions) return;
          if (this.activePassageAnswers[qIdx]) return; // Question already answered

          const q = this.activePassage.questions[qIdx];
          const isCorrect = optIdx === q.correct;
          this.activePassageAnswers[qIdx] = { chosenOptIdx: optIdx, isCorrect };

          const totalQuestions = this.activePassage.questions.length;
          const answeredCount = Object.keys(this.activePassageAnswers).length;

          if (answeredCount === totalQuestions) {
            const numCorrect = Object.values(this.activePassageAnswers).filter((a) => a.isCorrect).length;
            const score = Math.round((numCorrect / totalQuestions) * 100);
            this.store.completeComprehension(this.activePassage.id, score, totalQuestions);
          } else {
            this.store.recordActivity(isCorrect ? 5 : 1);
          }

          this.render();
        });
      });
    }

    /* ==========================================================================
       6. WORDS VIEW (20,000-Word Dictionary & Search Engine)
       ========================================================================== */
    renderWordsView() {
      const words = global.NP_WORDS || [];
      const q = (this.searchQuery || "").toLowerCase().trim();

      let filtered = words;
      if (q) {
        filtered = filtered.filter(
          (w) =>
            w.word.toLowerCase().includes(q) ||
            (w.meaning && w.meaning.toLowerCase().includes(q)) ||
            (w.lemma && w.lemma.toLowerCase().includes(q))
        );
      }
      if (this.selectedPos !== "all") {
        filtered = filtered.filter((w) => w.pos === this.selectedPos);
      }
      if (this.selectedLevel !== "all") {
        filtered = filtered.filter((w) => w.level === this.selectedLevel);
      }
      if (this.selectedArticle !== "all") {
        filtered = filtered.filter((w) => w.article === this.selectedArticle);
      }
      if (this.showOnlyBookmarked) {
        filtered = filtered.filter((w) => this.store.isBookmarked(w.id));
      }

      const displayList = filtered.slice(0, 60);

      return `
        <div class="words-container animate-fade">
          <div class="card words-search-card">
            <h1 class="page-title">Nederlands Woordenboek (20.000 Woorden)</h1>
            <p class="page-subtitle">Doorzoek de complete woordenschat met lidwoorden, vervoegingen en voorbeelden.</p>

            <div class="search-input-wrap">
              <input type="text" id="words-search-input" class="form-input search-input" placeholder="Zoek op Nederlands woord, lidwoord of Engelse betekenis..." value="${this.searchQuery}" />
              ${this.searchQuery ? `<button class="btn-clear" id="btn-clear-search">✕</button>` : ""}
            </div>

            <div class="filter-row">
              <div class="filter-group">
                <label>Niveau:</label>
                <select id="select-filter-level" class="form-select">
                  <option value="all" ${this.selectedLevel === 'all' ? 'selected' : ''}>Alle niveaus</option>
                  <option value="A1" ${this.selectedLevel === 'A1' ? 'selected' : ''}>A1</option>
                  <option value="A2" ${this.selectedLevel === 'A2' ? 'selected' : ''}>A2</option>
                  <option value="B1" ${this.selectedLevel === 'B1' ? 'selected' : ''}>B1</option>
                  <option value="B2" ${this.selectedLevel === 'B2' ? 'selected' : ''}>B2</option>
                  <option value="C1" ${this.selectedLevel === 'C1' ? 'selected' : ''}>C1</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Woordsoort:</label>
                <select id="select-filter-pos" class="form-select">
                  <option value="all" ${this.selectedPos === 'all' ? 'selected' : ''}>Alle soorten</option>
                  <option value="noun" ${this.selectedPos === 'noun' ? 'selected' : ''}>Zelfstandig n.w. (de/het)</option>
                  <option value="verb" ${this.selectedPos === 'verb' ? 'selected' : ''}>Werkwoord</option>
                  <option value="adjective" ${this.selectedPos === 'adjective' ? 'selected' : ''}>Bijvoeglijk n.w.</option>
                  <option value="numeral" ${this.selectedPos === 'numeral' ? 'selected' : ''}>Telwoord</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Lidwoord:</label>
                <select id="select-filter-article" class="form-select">
                  <option value="all" ${this.selectedArticle === 'all' ? 'selected' : ''}>Alles</option>
                  <option value="de" ${this.selectedArticle === 'de' ? 'selected' : ''}>de-woorden</option>
                  <option value="het" ${this.selectedArticle === 'het' ? 'selected' : ''}>het-woorden</option>
                </select>
              </div>

              <div class="filter-group">
                <label>
                  <input type="checkbox" id="check-bookmarked" ${this.showOnlyBookmarked ? 'checked' : ''} /> ⭐ Alleen favorieten
                </label>
              </div>
            </div>
          </div>

          <div class="words-results-meta">
            <span>Gevonden: <strong>${filtered.length}</strong> woorden ${filtered.length > 60 ? '(toont eerste 60)' : ''}</span>
          </div>

          <div class="words-results-grid">
            ${displayList.map((w) => {
              const isNoun = w.pos === "noun" && w.article;
              const isStarred = this.store.isBookmarked(w.id);
              const displayTitle = isNoun ? `<span class="badge-${w.article}">${w.article}</span> ${w.word}` : w.word;

              return `
                <div class="card word-item-card">
                  <div class="word-card-top">
                    <span class="word-level-badge badge-${w.level.toLowerCase()}">${w.level}</span>
                    <button class="btn-star ${isStarred ? 'starred' : ''}" data-star-id="${w.id}" title="Favoriet opslaan">
                      ${isStarred ? '★' : '☆'}
                    </button>
                  </div>
                  <div class="word-card-main">
                    <h3 class="word-title">${displayTitle}</h3>
                  </div>
                  <div class="word-meaning">${w.meaning || w.word}</div>
                  ${w.example ? `<div class="word-example" style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">“${w.example}”</div>` : ""}
                  <div class="word-footer">
                    <span>${w.pos}</span>
                    <span>#${w.rank}</span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    attachWordsListeners() {
      const searchInput = document.getElementById("words-search-input");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          this.searchQuery = e.target.value;
          this.render();
          const newInp = document.getElementById("words-search-input");
          if (newInp) {
            newInp.focus();
            newInp.setSelectionRange(newInp.value.length, newInp.value.length);
          }
        });
      }

      const clearBtn = document.getElementById("btn-clear-search");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          this.searchQuery = "";
          this.render();
        });
      }

      const lvlSelect = document.getElementById("select-filter-level");
      if (lvlSelect) {
        lvlSelect.addEventListener("change", (e) => {
          this.selectedLevel = e.target.value;
          this.render();
        });
      }

      const posSelect = document.getElementById("select-filter-pos");
      if (posSelect) {
        posSelect.addEventListener("change", (e) => {
          this.selectedPos = e.target.value;
          this.render();
        });
      }

      const artSelect = document.getElementById("select-filter-article");
      if (artSelect) {
        artSelect.addEventListener("change", (e) => {
          this.selectedArticle = e.target.value;
          this.render();
        });
      }

      const starCheck = document.getElementById("check-bookmarked");
      if (starCheck) {
        starCheck.addEventListener("change", (e) => {
          this.showOnlyBookmarked = e.target.checked;
          this.render();
        });
      }

      document.querySelectorAll(".btn-star").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const wordId = btn.dataset.starId;
          this.store.toggleBookmark(wordId);
          this.render();
        });
      });
    }

    /* ==========================================================================
       7. PROGRESS VIEW (Analytics, 30-Day Heatmap, SRS Stats)
       ========================================================================== */
    renderProgressView() {
      const user = this.store.state.user;
      const progress = this.store.state.progress;
      const deckStats = this.srs.getDeckStats();
      const articleStats = progress.articleStats || { totalDrilled: 0, correct: 0 };
      const artAcc = articleStats.totalDrilled > 0 ? Math.round((articleStats.correct / articleStats.totalDrilled) * 100) : 100;

      // 30-day activity heatmap using local date
      const days = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const iso = Learning.getLocalISODate(d);
        const count = progress.studyDays ? progress.studyDays[iso] || 0 : 0;
        days.push({ iso, count });
      }

      return `
        <div class="progress-container animate-fade">
          <div class="catalog-header">
            <div>
              <h1 class="page-title">Voortgang & Statistieken</h1>
              <p class="page-subtitle">Gedetailleerd overzicht van je leercurve, beheerste woorden en streak.</p>
            </div>
            <button class="btn btn-outline btn-sm" id="btn-open-settings">⚙️ Instellingen & Gegevens</button>
          </div>

          <div class="progress-stats-overview">
            <div class="card stat-big-card">
              <span class="stat-big-icon">🔥</span>
              <div class="stat-big-num">${user.streak}</div>
              <div class="stat-big-lbl">Dagen Streak</div>
            </div>
            <div class="card stat-big-card">
              <span class="stat-big-icon">🏆</span>
              <div class="stat-big-num">${user.totalXp}</div>
              <div class="stat-big-lbl">Totale XP</div>
            </div>
            <div class="card stat-big-card">
              <span class="stat-big-icon">🧠</span>
              <div class="stat-big-num">${deckStats.mastered}</div>
              <div class="stat-big-lbl">Beheerste Woorden</div>
            </div>
            <div class="card stat-big-card">
              <span class="stat-big-icon">⚡</span>
              <div class="stat-big-num">${artAcc}%</div>
              <div class="stat-big-lbl">Lidwoord Nauwkeurigheid</div>
            </div>
          </div>

          <div class="progress-grid">
            <div class="card">
              <h3>30-Dagen Activiteit</h3>
              <p style="font-size: 0.88rem; color: var(--text-secondary);">Elk blokje vertegenwoordigt je dagelijkse oefenintensiteit.</p>
              <div class="heatmap-grid">
                ${days.map((d) => {
                  const level = d.count === 0 ? 'heat-0' : d.count < 5 ? 'heat-1' : d.count < 15 ? 'heat-2' : 'heat-3';
                  return `<div class="heatmap-cell ${level}" title="${d.iso}: ${d.count} items"></div>`;
                }).join("")}
              </div>
            </div>

            <div class="card">
              <h3>Spaced Repetition (SRS) Status</h3>
              <ul class="srs-stats-list" style="margin-top: 1rem; list-style: none;">
                <li style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <span>Te herhalen vandaag:</span> <strong>${deckStats.due}</strong>
                </li>
                <li style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <span>In leerfase:</span> <strong>${deckStats.learning}</strong>
                </li>
                <li style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <span>Totaal geactiveerde kaarten:</span> <strong>${deckStats.total}</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    attachProgressListeners() {
      const settingsBtn = document.getElementById("btn-open-settings");
      if (settingsBtn) {
        settingsBtn.addEventListener("click", () => this.switchTab("settings"));
      }
    }

    /* ==========================================================================
       8. SETTINGS VIEW (Themes, Goals, Backup Export/Import, Reset)
       ========================================================================== */
    renderSettingsView() {
      const settings = this.store.state.settings;

      return `
        <div class="settings-container animate-fade">
          <div class="catalog-header">
            <div>
              <h1 class="page-title">Instellingen & Back-up</h1>
              <p class="page-subtitle">Beheer je leerdoelen, thema en exporteer of importeer je voortgang.</p>
            </div>
          </div>

          <div class="card settings-card" style="margin-bottom: 1.5rem;">
            <h3>Uiterlijk & Thema</h3>
            <div class="setting-row" style="margin-top: 1rem;">
              <label>Thema:</label>
              <div class="theme-select-pills">
                <button class="btn btn-sm ${settings.theme === 'dark' ? 'btn-primary' : 'btn-outline'}" id="btn-theme-dark">Donker (Dark)</button>
                <button class="btn btn-sm ${settings.theme === 'light' ? 'btn-primary' : 'btn-outline'}" id="btn-theme-light">Licht (Light)</button>
              </div>
            </div>
          </div>

          <div class="card settings-card" style="margin-bottom: 1.5rem;">
            <h3>Leerdoelen & Sessies</h3>
            <div class="setting-row" style="margin-top: 1rem;">
              <label>Dagelijks doel (items per dag):</label>
              <select id="select-daily-goal" class="form-select" style="max-width: 200px;">
                <option value="10" ${settings.dailyGoal === 10 ? 'selected' : ''}>10 items</option>
                <option value="15" ${settings.dailyGoal === 15 ? 'selected' : ''}>15 items (Aanbevolen)</option>
                <option value="25" ${settings.dailyGoal === 25 ? 'selected' : ''}>25 items</option>
                <option value="50" ${settings.dailyGoal === 50 ? 'selected' : ''}>50 items</option>
              </select>
            </div>

            <div class="setting-row" style="margin-top: 1rem;">
              <label>Sessiegrootte per oefensessie:</label>
              <select id="select-session-size" class="form-select" style="max-width: 200px;">
                <option value="5" ${settings.sessionSize === 5 ? 'selected' : ''}>5 kaarten</option>
                <option value="10" ${settings.sessionSize === 10 ? 'selected' : ''}>10 kaarten</option>
                <option value="15" ${settings.sessionSize === 15 ? 'selected' : ''}>15 kaarten</option>
                <option value="20" ${settings.sessionSize === 20 ? 'selected' : ''}>20 kaarten</option>
              </select>
            </div>
          </div>

          <div class="card settings-card" style="margin-bottom: 1.5rem;">
            <h3>Gegevensbeheer & Back-up</h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1rem;">
              Alle voortgang wordt lokaal in je browser opgeslagen onder de <code>nederpath-v1</code> namespace.
            </p>
            <div class="backup-actions-row" style="display: flex; gap: 1rem;">
              <button class="btn btn-secondary" id="btn-export-json">💾 Exporteer Voortgang (JSON)</button>
              <label class="btn btn-outline" style="cursor: pointer;">
                📂 Importeer Back-up (JSON)
                <input type="file" id="file-import-json" accept=".json" style="display: none;" />
              </label>
            </div>
          </div>

          <div class="card settings-card danger-card" style="border-color: rgba(239, 68, 68, 0.4);">
            <h3 style="color: var(--color-danger);">Gevaarlijke Zone</h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1rem;">
              Wis alle lokale opgeslagen voortgang, SRS-geschiedenis en statistieken.
            </p>
            <button class="btn btn-danger" id="btn-reset-all">⚠️ Reset Alle Voortgang</button>
          </div>
        </div>
      `;
    }

    attachSettingsListeners() {
      const darkBtn = document.getElementById("btn-theme-dark");
      if (darkBtn) {
        darkBtn.addEventListener("click", () => {
          this.store.state.settings.theme = "dark";
          this.store.save();
          this.applyTheme("dark");
          this.render();
        });
      }

      const lightBtn = document.getElementById("btn-theme-light");
      if (lightBtn) {
        lightBtn.addEventListener("click", () => {
          this.store.state.settings.theme = "light";
          this.store.save();
          this.applyTheme("light");
          this.render();
        });
      }

      const goalSelect = document.getElementById("select-daily-goal");
      if (goalSelect) {
        goalSelect.addEventListener("change", (e) => {
          this.store.state.settings.dailyGoal = parseInt(e.target.value, 10);
          this.store.save();
        });
      }

      const sessionSelect = document.getElementById("select-session-size");
      if (sessionSelect) {
        sessionSelect.addEventListener("change", (e) => {
          this.store.state.settings.sessionSize = parseInt(e.target.value, 10);
          this.store.save();
        });
      }

      const exportBtn = document.getElementById("btn-export-json");
      if (exportBtn) {
        exportBtn.addEventListener("click", () => {
          const json = this.store.exportJSON();
          const blob = new Blob([json], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `nederpath-backup-${Learning.getLocalISODate()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        });
      }

      const importInput = document.getElementById("file-import-json");
      if (importInput) {
        importInput.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            const success = this.store.importJSON(evt.target.result);
            if (success) {
              alert("Voortgang succesvol geïmporteerd!");
              this.render();
            } else {
              alert("Fout bij het importeren van het bestand. Ongeldig JSON-formaat.");
            }
          };
          reader.readAsText(file);
        });
      }

      const resetBtn = document.getElementById("btn-reset-all");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          if (confirm("Weet je zeker dat je alle voortgang wilt wissen? Dit kan niet ongedaan worden gemaakt.")) {
            this.store.resetAllData();
            alert("Alle gegevens zijn gewist.");
            this.switchTab("today");
          }
        });
      }
    }
  }

  // Initialize App on DOM Ready
  if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", () => {
      global.NederApp = new NederPathApp();
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
