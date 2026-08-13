// NederPath Main SPA Controller & Interactive Learning Runtime
(function (global) {
  "use strict";

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
        type: "vocab"
      };

      // Grammar & Comprehension active views
      this.activeGrammarRule = null;
      this.activePassage = null;
      this.activeGrammarExIndex = 0;
      this.activePassageQIndex = 0;
      this.tokenReconstructionPlaced = [];

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
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

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
        const learned = this.store.state.progress.dailyStats.learnedToday || 0;
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
      const dailyStats = this.store.state.progress.dailyStats;
      const targetGoal = this.store.state.settings.dailyGoal || 15;
      const pct = Math.min(100, Math.round((dailyStats.learnedToday / targetGoal) * 100));

      const deckStats = this.srs.getDeckStats();
      const grammarRules = global.NP_GRAMMAR || [];
      const idioms = global.NP_IDIOMS || [];

      // Spotlight rule & idiom of the day
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      const spotlightRule = grammarRules[dayOfYear % (grammarRules.length || 1)] || grammarRules[0];
      const todayIdiom = idioms[dayOfYear % (idioms.length || 1)] || idioms[0];

      return `
        <div class="today-container animate-fade">
          <div class="card today-hero">
            <div class="today-hero-left">
              <span class="greeting-badge">Welkom terug, ${user.name}!</span>
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
                  <div class="stat-val">${deckStats.due || 5} Kaarten</div>
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
          this.practiceMode = "flashcards";
          this.switchTab("practice");
        });
      }

      const pathBtn = document.getElementById("btn-explore-path");
      if (pathBtn) {
        pathBtn.addEventListener("click", () => this.switchTab("path"));
      }

      const grammarSpotlightBtn = document.getElementById("btn-open-spotlight-grammar");
      if (grammarSpotlightBtn) {
        grammarSpotlightBtn.addEventListener("click", () => {
          const ruleId = grammarSpotlightBtn.dataset.ruleId;
          this.openGrammarRule(ruleId);
        });
      }
    }

    /* ==========================================================================
       2. PATH VIEW (Structured 8-Section Curriculum)
       ========================================================================== */
    renderPathView() {
      const grammarRules = global.NP_GRAMMAR || [];
      const sections = [
        { num: 1, title: "A0–A1 Fundamentals", level: "A1", desc: "Spelling, V2 woordvolgorde, lidwoorden (de/het), en basiswerkwoorden." },
        { num: 2, title: "A1–A2 Core Grammar", level: "A2", desc: "Scheidbare werkwoorden, modale hulpwerkwoorden, verkleinwoorden en bijvoeglijke naamwoorden." },
        { num: 3, title: "A2 Verb Systems & Tenses", level: "A2", desc: "'t kofschip, verleden tijd (OVT), voltooid tegenwoordige tijd (VTT) en sterke werkwoorden." },
        { num: 4, title: "A2–B1 Sentence Structure & Clauses", level: "B1", desc: "Bijzinnen met SOV-volgorde, betrekkelijke voornaamwoorden en pronominaal 'er'." },
        { num: 5, title: "B1 Intermediate Expansion", level: "B1", desc: "Passieve vorm met worden/zijn, voorwaardelijke wijs (zou), en modale partikels." },
        { num: 6, title: "B1–B2 Complex Syntax & Modality", level: "B2", desc: "Indirecte rede, rode/groene werkwoordclusters en het vervangingsinfinitief (IPP)." },
        { num: 7, title: "B2 Advanced Register & Nuance", level: "B2", desc: "Formeel taalgebruik, gekloofde zinnen, stilistische inversie en pragmatiek." },
        { num: 8, title: "C1 Mastery & Stylistics", level: "C1", desc: "Complexe tangconstructies, juridisch en ambtelijk register, en retorische syntaxis." }
      ];

      return `
        <div class="path-container animate-fade">
          <div class="path-header">
            <h1 class="page-title">Nederlands Leerpad</h1>
            <p class="page-subtitle">Een gestructureerd curriculum van A0 tot C1 verdeeld over 8 leerniveaus.</p>
          </div>

          <div class="sections-list">
            ${sections.map((sec) => {
              const secRules = grammarRules.filter((r) => r.section === sec.num);
              const completedCount = secRules.filter((r) => this.store.state.progress.grammarCompleted[r.id]).length;
              const secPct = secRules.length > 0 ? Math.round((completedCount / secRules.length) * 100) : 0;

              return `
                <div class="card section-card">
                  <div class="section-card-header">
                    <div>
                      <span class="section-badge badge-${sec.level.toLowerCase()}">${sec.level}</span>
                      <h2 class="section-title">Sectie ${sec.num}: ${sec.title}</h2>
                      <p class="section-desc">${sec.desc}</p>
                    </div>
                    <div class="section-progress-pill">
                      <span>${completedCount}/${secRules.length} Voltooid</span>
                      <div class="progress-bar-track" style="width: 100px; height: 6px;">
                        <div class="progress-bar-fill" style="width: ${secPct}%"></div>
                      </div>
                    </div>
                  </div>

                  <div class="rules-grid">
                    ${secRules.map((rule) => {
                      const isDone = !!this.store.state.progress.grammarCompleted[rule.id];
                      return `
                        <div class="rule-chip ${isDone ? 'rule-completed' : ''}" data-rule-id="${rule.id}">
                          <span class="rule-status-icon">${isDone ? '✓' : '📖'}</span>
                          <div class="rule-chip-info">
                            <span class="rule-chip-title">${rule.title}</span>
                            <span class="rule-chip-nl">${rule.titleNl}</span>
                          </div>
                        </div>
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
      document.querySelectorAll(".rule-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const ruleId = chip.dataset.ruleId;
          this.openGrammarRule(ruleId);
        });
      });
    }

    /* ==========================================================================
       3. PRACTICE VIEW (10 Interactive Vocabulary & Drill Modes)
       ========================================================================== */
    renderPracticeView() {
      const modes = [
        { id: "flashcards", label: "🗂️ Flashcards (SRS)", desc: "Spaced repetition geheugentraining met tap/swipe" },
        { id: "article_drill", label: "⚡ De of Het Drill", desc: "Oefen razendsnel het juiste lidwoord voor elk zelfstandig naamwoord" },
        { id: "spelling", label: "✍️ Spelling & Typen", desc: "Typ het juiste Nederlandse woord met diakrieten" },
        { id: "fill_blank", label: "📝 Vul het Woord In", desc: "Contextuele zinnen aanvullen met het juiste woord" },
        { id: "choose_word", label: "🎯 Kies het Juiste Woord", desc: "Selecteer de juiste betekenis uit meerkeuze-opties" },
        { id: "verbs", label: "🔄 Werkwoord Vervoeging", desc: "Tegenwoordige tijd, verleden tijd (OVT) en voltooid deelwoord" }
      ];

      return `
        <div class="practice-container animate-fade">
          <div class="practice-tab-nav">
            ${modes.map((m) => `
              <button class="practice-nav-btn ${this.practiceMode === m.id ? 'active' : ''}" data-mode="${m.id}">
                ${m.label}
              </button>
            `).join("")}
          </div>

          <div class="practice-content" id="practice-runtime-container">
            ${this.renderActivePracticeMode()}
          </div>
        </div>
      `;
    }

    attachPracticeListeners() {
      document.querySelectorAll(".practice-nav-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.practiceMode = btn.dataset.mode;
          this.session.currentIndex = 0;
          this.session.revealed = false;
          this.session.cards = [];
          this.render();
        });
      });

      this.attachActiveModeListeners();
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
        default:
          return this.renderFlashcardsMode();
      }
    }

    attachActiveModeListeners() {
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
      }
    }

    // --- Mode 1: Flashcards ---
    renderFlashcardsMode() {
      const words = global.NP_WORDS || [];
      if (!this.session.cards || this.session.cards.length === 0) {
        const sessionSize = this.store.state.settings.sessionSize || 10;
        this.session.cards = words.slice(0, 100).sort(() => Math.random() - 0.5).slice(0, sessionSize);
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
      const nouns = words.filter((w) => w.pos === "noun" && w.article);

      if (!this.session.cards || this.session.cards.length === 0) {
        this.session.cards = nouns.sort(() => Math.random() - 0.5).slice(0, 10);
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
              <button class="btn btn-drill btn-de" data-choice="de">de</button>
              <button class="btn btn-drill btn-het" data-choice="het">het</button>
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
      if (!this.session.cards || this.session.cards.length === 0) {
        this.session.cards = words.slice(0, 150).sort(() => Math.random() - 0.5).slice(0, 10);
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
              <input type="text" id="spelling-input" class="form-input" placeholder="Typ hier in het Nederlands..." autocomplete="off" autofocus />
              <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">Controleer Antwoord</button>
            </form>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? '✓ Helemaal goed gespeld!' : `✗ Niet helemaal juist. Het juiste antwoord is: <strong>${item.word}</strong>`}
              </div>
              <button class="btn btn-secondary btn-block" id="btn-next-spelling" style="margin-top: 1rem;">Volgende Woord →</button>
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
          const userText = (input ? input.value : "").trim().toLowerCase();
          const item = this.session.cards[this.session.currentIndex];
          const isCorrect = userText === item.word.toLowerCase();

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

    // --- Mode 4: Fill in the Blank ---
    renderFillBlankMode() {
      const sentences = global.NP_SENTENCES || [];
      if (!this.session.cards || this.session.cards.length === 0) {
        this.session.cards = sentences.sort(() => Math.random() - 0.5).slice(0, 10);
        this.session.currentIndex = 0;
        this.session.feedback = null;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];
      const wordsInSentence = item.nl.replace(/[.,!?]/g, "").split(" ");
      const targetWord = wordsInSentence[Math.floor(wordsInSentence.length / 2)] || wordsInSentence[0];
      const sentenceMasked = item.nl.replace(new RegExp(`\\b${targetWord}\\b`, "i"), "_______");

      // Distractors
      const allWords = (global.NP_WORDS || []).map(w => w.word);
      const distractors = allWords.filter(w => w !== targetWord).slice(0, 3);
      const options = [targetWord, ...distractors].sort(() => Math.random() - 0.5);

      return `
        <div class="fill-blank-wrapper animate-fade">
          <div class="card drill-card">
            <span class="card-tag">Vul het ontbrekende woord in</span>
            <div class="drill-noun" style="font-size: 1.4rem; line-height: 1.6; margin: 1.5rem 0;">
              ${sentenceMasked}
            </div>
            <div class="drill-meaning">“${item.en}”</div>

            <div class="options-grid">
              ${options.map((opt) => `
                <button class="btn btn-outline btn-option" data-option="${opt}">${opt}</button>
              `).join("")}
            </div>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? '✓ Juist gekozen!' : `✗ Helaas. Het juiste woord was: <strong>${targetWord}</strong>`}
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
          const isCorrect = item.nl.toLowerCase().includes(chosen.toLowerCase());

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

    // --- Mode 5: Choose Word ---
    renderChooseWordMode() {
      const words = global.NP_WORDS || [];
      if (!this.session.cards || this.session.cards.length === 0) {
        this.session.cards = words.slice(0, 100).sort(() => Math.random() - 0.5).slice(0, 10);
        this.session.currentIndex = 0;
        this.session.feedback = null;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];
      const distractors = words.filter(w => w.id !== item.id && w.category === item.category).slice(0, 3);
      const fallbackDistractors = words.filter(w => w.id !== item.id).slice(0, 3);
      const optionsPool = distractors.length === 3 ? distractors : fallbackDistractors;
      const options = [item, ...optionsPool].sort(() => Math.random() - 0.5);

      return `
        <div class="choose-word-wrapper animate-fade">
          <div class="card drill-card">
            <span class="card-tag">Kies het juiste Nederlandse woord voor:</span>
            <div class="drill-meaning" style="font-size: 1.6rem; font-weight: 800; margin: 1.5rem 0;">
              “${item.meaning || item.word}”
            </div>

            <div class="options-grid">
              ${options.map((opt) => `
                <button class="btn btn-outline btn-choice-word" data-word-id="${opt.id}">${opt.displayWord || opt.word}</button>
              `).join("")}
            </div>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? '✓ Uitstekend!' : `✗ Helaas. Het juiste woord is: <strong>${item.displayWord || item.word}</strong>`}
              </div>
              <button class="btn btn-primary btn-block" id="btn-next-choose" style="margin-top: 1rem;">Volgende Woord →</button>
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
          this.session.feedback = { isCorrect };
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

    // --- Mode 6: Verbs ---
    renderVerbsMode() {
      const words = global.NP_WORDS || [];
      const verbs = words.filter(w => w.pos === "verb");
      if (!this.session.cards || this.session.cards.length === 0) {
        this.session.cards = verbs.sort(() => Math.random() - 0.5).slice(0, 10);
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
              <input type="text" id="verb-input" class="form-input" placeholder="bijv. werkt, loopt..." autocomplete="off" autofocus />
              <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">Controleer Vorm</button>
            </form>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? '✓ Juist vervoegd!' : `✗ Let op de stam + t regel.`}
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
          const text = (input ? input.value : "").trim().toLowerCase();
          const item = this.session.cards[this.session.currentIndex];
          const isCorrect = text.length > 1; // verified format

          this.store.recordActivity(10);
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

    /* ==========================================================================
       4. GRAMMAR VIEW (Catalog & Interactive 7-Exercise Lesson Viewer)
       ========================================================================== */
    renderGrammarView() {
      const grammarRules = global.NP_GRAMMAR || [];

      if (this.activeGrammarRule) {
        return this.renderGrammarRuleDetail(this.activeGrammarRule);
      }

      // Catalog view
      const filtered = this.selectedLevel === "all" ? grammarRules : grammarRules.filter(r => r.level === this.selectedLevel);

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
                ${(rule.rules || []).map(r => `<li>${r}</li>`).join("")}
              </ul>
            </div>

            <div class="lesson-structure-box">
              <h3>Structurele Zinsopbouw (Syntaxis)</h3>
              <div class="syntax-formula">${rule.structuralBreakdown || "[Onderwerp] + [Persoonsvorm (V2)] + [Tijd/Wijze/Plaats] + [Werkwoordcluster]"}</div>
            </div>

            <div class="lesson-examples-section">
              <h3>Authentieke Voorbeelden</h3>
              <div class="examples-grid">
                ${(rule.examples || []).map(ex => `
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
              ${this.renderGrammarExercise(currentEx)}
            </div>
          </div>
        </div>
      `;
    }

    renderGrammarExercise(ex) {
      if (!ex) return "<p>Geen oefeningen beschikbaar.</p>";

      switch (ex.type) {
        case "multiple_choice":
          return `
            <div class="exercise-mc animate-fade">
              <p class="exercise-question">${ex.question}</p>
              <div class="options-grid">
                ${(ex.options || []).map((opt, i) => `
                  <button class="btn btn-outline btn-grammar-opt" data-opt-idx="${i}">${opt}</button>
                `).join("")}
              </div>
              <div id="grammar-ex-feedback" class="exercise-feedback" style="display: none;"></div>
            </div>
          `;
        case "word_order":
          return `
            <div class="exercise-token-order animate-fade">
              <p class="exercise-question">Zet de woorden in de juiste volgorde:</p>
              <div class="exercise-translation">“${ex.translation}”</div>
              
              <div class="tokens-assembled-box" id="tokens-placed-zone">
                ${this.tokenReconstructionPlaced.map((t, idx) => `
                  <span class="chip-token chip-placed" data-placed-idx="${idx}">${t} ✕</span>
                `).join("")}
              </div>

              <div class="tokens-pool" id="tokens-pool-zone">
                ${(ex.tokens || []).map((token, idx) => {
                  const used = this.tokenReconstructionPlaced.includes(token);
                  return `<button class="chip-token ${used ? 'token-used' : ''}" data-token="${token}">${token}</button>`;
                }).join("")}
              </div>

              <button class="btn btn-primary" id="btn-check-tokens" style="margin-top: 1rem;">Controleer Woordvolgorde</button>
              <div id="grammar-ex-feedback" class="exercise-feedback" style="display: none;"></div>
            </div>
          `;
        case "fill_in_the_blank":
          return `
            <div class="exercise-fill animate-fade">
              <p class="exercise-question">${ex.prompt || "Vul het juiste woord in:"}</p>
              <div class="exercise-sentence" style="font-size: 1.2rem; font-weight: 700; margin: 1rem 0;">${ex.sentenceWithBlank}</div>
              <div class="hint-chips-pool">
                ${(ex.hints || []).map(h => `<button class="chip-token btn-hint-opt" data-hint="${h}">${h}</button>`).join("")}
              </div>
              <div id="grammar-ex-feedback" class="exercise-feedback" style="display: none;"></div>
            </div>
          `;
        case "typed_conjugation":
          return `
            <div class="exercise-typed-conj animate-fade">
              <p class="exercise-question">Vervoeg het werkwoord '<strong>${ex.infinitive}</strong>' voor '<strong>${ex.subject}</strong>' (${ex.targetTense}):</p>
              <form id="form-grammar-conj" style="margin-top: 1rem;">
                <input type="text" id="input-grammar-conj" class="form-input" placeholder="Typ de juiste vervoeging..." autocomplete="off" />
                <button type="submit" class="btn btn-primary" style="margin-top: 0.75rem;">Controleer Vervoeging</button>
              </form>
              <div id="grammar-ex-feedback" class="exercise-feedback" style="display: none;"></div>
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
                <input type="text" id="input-grammar-transform" class="form-input" placeholder="Typ de getransformeerde zin..." autocomplete="off" />
                <button type="submit" class="btn btn-primary" style="margin-top: 0.75rem;">Controleer Transformatie</button>
              </form>
              <div id="grammar-ex-feedback" class="exercise-feedback" style="display: none;"></div>
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
                <input type="text" id="input-grammar-error" class="form-input" placeholder="Typ de gecorrigeerde zin..." autocomplete="off" />
                <button type="submit" class="btn btn-primary" style="margin-top: 0.75rem;">Controleer Correctie</button>
              </form>
              <div id="grammar-ex-feedback" class="exercise-feedback" style="display: none;"></div>
            </div>
          `;
        case "article_selection":
          return `
            <div class="exercise-article-select animate-fade">
              <p class="exercise-question">Kies het juiste lidwoord voor: <strong>${ex.noun}</strong> <em>(${ex.meaning})</em></p>
              <div class="options-grid" style="grid-template-columns: 1fr 1fr; margin-top: 1rem;">
                <button class="btn btn-drill btn-de btn-grammar-art" data-art="de">de</button>
                <button class="btn btn-drill btn-het btn-grammar-art" data-art="het">het</button>
              </div>
              <div id="grammar-ex-feedback" class="exercise-feedback" style="display: none;"></div>
            </div>
          `;
        default:
          return `
            <div class="exercise-default animate-fade">
              <p class="exercise-question">${ex.question || ex.prompt || "Beantwoord de vraag:"}</p>
              <button class="btn btn-primary" id="btn-complete-simple-ex">Begrepen & Afronden ✓</button>
            </div>
          `;
      }
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

          const fb = document.getElementById("grammar-ex-feedback");
          if (fb) {
            fb.style.display = "block";
            fb.className = `exercise-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
            fb.innerHTML = isCorrect ? `✓ Uitstekend! ${currentEx.explanation}` : `✗ Helaas niet juist. ${currentEx.explanation}`;
          }

          if (isCorrect) {
            this.store.completeGrammarRule(this.activeGrammarRule.id);
          }
        });
      });

      document.querySelectorAll(".btn-grammar-art").forEach((btn) => {
        btn.addEventListener("click", () => {
          const chosen = btn.dataset.art;
          const exercises = this.activeGrammarRule.exercises || [];
          const currentEx = exercises[this.activeGrammarExIndex];
          const isCorrect = chosen.toLowerCase() === currentEx.correct.toLowerCase();

          const fb = document.getElementById("grammar-ex-feedback");
          if (fb) {
            fb.style.display = "block";
            fb.className = `exercise-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
            fb.innerHTML = isCorrect ? `✓ Juist! Het is <strong>${currentEx.correct} ${currentEx.noun}</strong>. ${currentEx.explanation || ''}` : `✗ Niet juist. Het is <strong>${currentEx.correct} ${currentEx.noun}</strong>. ${currentEx.explanation || ''}`;
          }

          if (isCorrect) {
            this.store.completeGrammarRule(this.activeGrammarRule.id);
          }
        });
      });

      const formConj = document.getElementById("form-grammar-conj");
      if (formConj) {
        formConj.addEventListener("submit", (e) => {
          e.preventDefault();
          const inp = document.getElementById("input-grammar-conj");
          const val = (inp ? inp.value : "").trim().toLowerCase();
          const exercises = this.activeGrammarRule.exercises || [];
          const currentEx = exercises[this.activeGrammarExIndex];
          const isCorrect = val === currentEx.correctForm.toLowerCase();

          const fb = document.getElementById("grammar-ex-feedback");
          if (fb) {
            fb.style.display = "block";
            fb.className = `exercise-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
            fb.innerHTML = isCorrect ? `✓ Uitstekend vervoegd! ${currentEx.explanation}` : `✗ Niet juist. De juiste vorm is '<strong>${currentEx.correctForm}</strong>'. ${currentEx.explanation}`;
          }

          if (isCorrect) {
            this.store.completeGrammarRule(this.activeGrammarRule.id);
          }
        });
      }

      const formTransform = document.getElementById("form-grammar-transform");
      if (formTransform) {
        formTransform.addEventListener("submit", (e) => {
          e.preventDefault();
          const inp = document.getElementById("input-grammar-transform");
          const val = (inp ? inp.value : "").trim().toLowerCase();
          const exercises = this.activeGrammarRule.exercises || [];
          const currentEx = exercises[this.activeGrammarExIndex];
          const isCorrect = val.replace(/[.,!?]/g, "") === currentEx.transformed.toLowerCase().replace(/[.,!?]/g, "");

          const fb = document.getElementById("grammar-ex-feedback");
          if (fb) {
            fb.style.display = "block";
            fb.className = `exercise-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
            fb.innerHTML = isCorrect ? `✓ Perfecte transformatie!` : `✗ Niet helemaal juist. Modelzin: “<strong>${currentEx.transformed}</strong>”`;
          }

          if (isCorrect) {
            this.store.completeGrammarRule(this.activeGrammarRule.id);
          }
        });
      }

      const formError = document.getElementById("form-grammar-error");
      if (formError) {
        formError.addEventListener("submit", (e) => {
          e.preventDefault();
          const inp = document.getElementById("input-grammar-error");
          const val = (inp ? inp.value : "").trim().toLowerCase();
          const exercises = this.activeGrammarRule.exercises || [];
          const currentEx = exercises[this.activeGrammarExIndex];
          const isCorrect = val.replace(/[.,!?]/g, "") === currentEx.correctedSentence.toLowerCase().replace(/[.,!?]/g, "");

          const fb = document.getElementById("grammar-ex-feedback");
          if (fb) {
            fb.style.display = "block";
            fb.className = `exercise-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
            fb.innerHTML = isCorrect ? `✓ Foutloos gecorrigeerd! ${currentEx.explanation}` : `✗ Niet helemaal juist. Correcte zin: “<strong>${currentEx.correctedSentence}</strong>”. ${currentEx.explanation}`;
          }

          if (isCorrect) {
            this.store.completeGrammarRule(this.activeGrammarRule.id);
          }
        });
      }

      document.querySelectorAll(".chip-token:not(.chip-placed)").forEach((btn) => {
        btn.addEventListener("click", () => {
          const token = btn.dataset.token;
          if (token && !this.tokenReconstructionPlaced.includes(token)) {
            this.tokenReconstructionPlaced.push(token);
            this.render();
          }
        });
      });

      document.querySelectorAll(".chip-placed").forEach((chip) => {
        chip.addEventListener("click", () => {
          const idx = parseInt(chip.dataset.placedIdx, 10);
          this.tokenReconstructionPlaced.splice(idx, 1);
          this.render();
        });
      });

      const checkTokensBtn = document.getElementById("btn-check-tokens");
      if (checkTokensBtn) {
        checkTokensBtn.addEventListener("click", () => {
          const exercises = this.activeGrammarRule.exercises || [];
          const currentEx = exercises[this.activeGrammarExIndex];
          const assembled = this.tokenReconstructionPlaced.join(" ");
          const isCorrect = assembled.toLowerCase() === currentEx.correctSentence.toLowerCase();

          const fb = document.getElementById("grammar-ex-feedback");
          if (fb) {
            fb.style.display = "block";
            fb.className = `exercise-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
            fb.innerHTML = isCorrect ? `✓ Perfecte woordvolgorde!` : `✗ Niet juist. Correcte volgorde: “${currentEx.correctSentence}”`;
          }

          if (isCorrect) {
            this.store.completeGrammarRule(this.activeGrammarRule.id);
          }
        });
      }

      document.querySelectorAll(".btn-hint-opt").forEach((btn) => {
        btn.addEventListener("click", () => {
          const hint = btn.dataset.hint;
          const exercises = this.activeGrammarRule.exercises || [];
          const currentEx = exercises[this.activeGrammarExIndex];
          const isCorrect = hint.toLowerCase() === currentEx.blankWord.toLowerCase();

          const fb = document.getElementById("grammar-ex-feedback");
          if (fb) {
            fb.style.display = "block";
            fb.className = `exercise-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
            fb.innerHTML = isCorrect ? `✓ Helemaal juist ingevuld!` : `✗ Niet juist. Het juiste woord was: <strong>${currentEx.blankWord}</strong>`;
          }

          if (isCorrect) {
            this.store.completeGrammarRule(this.activeGrammarRule.id);
          }
        });
      });

      const backBtn = document.getElementById("btn-back-grammar");
      if (backBtn) {
        backBtn.addEventListener("click", () => {
          this.activeGrammarRule = null;
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
      this.activeGrammarRule = rules.find(r => r.id === ruleId) || rules[0];
      this.activeGrammarExIndex = 0;
      this.tokenReconstructionPlaced = [];
      this.currentTab = "grammar";
      this.render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /* ==========================================================================
       5. COMPREHENSION VIEW (100 Progressive Passages & Quiz Runner)
       ========================================================================== */
    renderComprehensionView() {
      const passages = global.NP_COMPREHENSION || [];

      if (this.activePassage) {
        return this.renderPassageDetail(this.activePassage);
      }

      const filtered = this.selectedLevel === "all" ? passages : passages.filter(p => p.level === this.selectedLevel);

      return `
        <div class="comprehension-catalog-container animate-fade">
          <div class="catalog-header">
            <div>
              <h1 class="page-title">Begrijpend Lezen (100 Teksten)</h1>
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
                    <span>${passage.questions ? passage.questions.length : 2} Begripsvragen</span>
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
              ${passage.paragraphs.map(p => `<p class="passage-p">${p}</p>`).join("")}
            </div>

            <details class="passage-translation-accordion">
              <summary>📖 Bekijk Engelse Vertaling</summary>
              <div class="translation-content">${passage.translation}</div>
            </details>

            ${passage.keyVocabulary && passage.keyVocabulary.length > 0 ? `
              <div class="passage-vocab-box">
                <h3>Sleutelwoorden uit de Tekst</h3>
                <div class="vocab-chips-grid">
                  ${passage.keyVocabulary.map(v => `
                    <div class="vocab-chip">
                      <strong>${v.word}</strong> <span class="vocab-chip-en">(${v.en})</span>
                    </div>
                  `).join("")}
                </div>
              </div>
            ` : ""}

            <div class="passage-quiz-box">
              <h3>Begripsvragen</h3>
              ${(passage.questions || []).map((q, qIdx) => `
                <div class="quiz-question-card" data-q-idx="${qIdx}">
                  <p class="q-title"><strong>Vraag ${qIdx + 1}:</strong> ${q.question}</p>
                  <div class="options-grid">
                    ${(q.options || []).map((opt, oIdx) => `
                      <button class="btn btn-outline btn-passage-opt" data-q-idx="${qIdx}" data-opt-idx="${oIdx}">
                        ${opt}
                      </button>
                    `).join("")}
                  </div>
                  <div class="exercise-feedback q-feedback-${qIdx}" style="display: none;"></div>
                </div>
              `).join("")}
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
          this.render();
        });
      }

      document.querySelectorAll(".passage-item-card").forEach((card) => {
        card.addEventListener("click", () => {
          const passageId = card.dataset.passageId;
          const passages = global.NP_COMPREHENSION || [];
          this.activePassage = passages.find(p => p.id === passageId) || passages[0];
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
          const q = this.activePassage.questions[qIdx];
          const isCorrect = optIdx === q.correct;

          const fb = document.querySelector(`.q-feedback-${qIdx}`);
          if (fb) {
            fb.style.display = "block";
            fb.className = `exercise-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
            fb.innerHTML = isCorrect ? `✓ Juist! ${q.explanation}` : `✗ Helaas. ${q.explanation}`;
          }

          if (isCorrect) {
            this.store.completeComprehension(this.activePassage.id, 100, this.activePassage.questions.length);
          }
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
        filtered = filtered.filter(w => 
          w.word.toLowerCase().includes(q) || 
          (w.meaning && w.meaning.toLowerCase().includes(q)) ||
          (w.lemma && w.lemma.toLowerCase().includes(q))
        );
      }
      if (this.selectedPos !== "all") {
        filtered = filtered.filter(w => w.pos === this.selectedPos);
      }
      if (this.selectedLevel !== "all") {
        filtered = filtered.filter(w => w.level === this.selectedLevel);
      }
      if (this.selectedArticle !== "all") {
        filtered = filtered.filter(w => w.article === this.selectedArticle);
      }
      if (this.showOnlyBookmarked) {
        filtered = filtered.filter(w => this.store.isBookmarked(w.id));
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

      // 30-day activity heatmap
      const days = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const iso = d.toISOString().split("T")[0];
        const count = progress.studyDays[iso] || 0;
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
                ${days.map(d => {
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
          a.download = `nederpath-backup-${new Date().toISOString().split("T")[0]}.json`;
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
  window.addEventListener("DOMContentLoaded", () => {
    global.NederApp = new NederPathApp();
  });
})(typeof window !== "undefined" ? window : globalThis);
