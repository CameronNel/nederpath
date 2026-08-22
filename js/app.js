// NederPath Main SPA Controller & Interactive Learning Runtime
(function (global) {
  "use strict";

  const Learning = global.NederLearning || {
    escapeHTML: (s) =>
      (typeof s === "string"
        ? s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
        : ""),
    getLocalISODate: (d = new Date()) => {
      const date = d instanceof Date ? d : new Date(d);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    },
    shuffleArray: (arr) => {
      if (!Array.isArray(arr)) return [];
      const res = arr.slice();
      for (let i = res.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = res[i];
        res[i] = res[j];
        res[j] = temp;
      }
      return res;
    },
    sampleArray: (arr, count = 10) => {
      if (!Array.isArray(arr)) return [];
      const n = Math.max(0, Math.min(arr.length, Number.isFinite(count) ? Math.floor(count) : 10));
      const res = arr.slice();
      for (let i = res.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = res[i];
        res[i] = res[j];
        res[j] = temp;
      }
      return res.slice(0, n);
    },
    normalizeAnswer: (str) => {
      if (typeof str !== "string") return "";
      return str
        .normalize("NFKC")
        .trim()
        .toLowerCase()
        .replace(/^[¿¡"«»“”‘’]+/u, "")
        .replace(/[.,!?;:…"«»“”‘’]+$/u, "")
        .replace(/\s+/gu, " ");
    },
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
      this.hub = "learn";
      this.currentTab = "today";
      this.practiceMode = null;
      this.selectedLevel = "all";
      this.searchQuery = "";
      this.selectedPos = "all";
      this.selectedArticle = "all";
      this.showOnlyBookmarked = false;
      this.navToken = 0;

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
      this.focusIntention = null;

      this.init();
    }

    init() {
      this.focusIntention = "heading";
      this.bindNav();
      this.bindGlobalKeyboard();
      this.bindHistory();
      this.applyTheme();
      this.store.subscribe(() => this.applyTheme());
      if (this.shouldShowOnboarding()) {
        this.renderOnboarding();
        return;
      }
      this.render();
    }

    shouldShowOnboarding() {
      const user = this.store.state.user || {};
      if (user.onboardingCompleted === true) return false;
      if ((user.totalXp || 0) > 0 || (user.streak || 0) > 0) return false;
      const srs = this.store.state.srs && this.store.state.srs.cards;
      if (srs && Object.keys(srs).length > 0) return false;
      return true;
    }

    renderOnboarding() {
      const host = document.getElementById("onboarding");
      const app = document.getElementById("app");
      if (app) app.hidden = true;
      if (!host) {
        this.render();
        return;
      }
      host.hidden = false;
      host.innerHTML = `
        <div class="ob-card">
          <div class="ob-logo">NederPath</div>
          <p class="ob-tagline">Learn Dutch at your own pace</p>
          <h1 class="ob-question">Ready to begin?</h1>
          <p class="ob-note">Your progress stays on this device. There are no formal exams or certificates.</p>
          <div class="ob-actions">
            <button type="button" class="btn btn-primary" id="ob-finish">Start learning</button>
          </div>
        </div>
      `;
      const finish = document.getElementById("ob-finish");
      if (finish) {
        finish.addEventListener("click", () => {
          this.store.state.user.onboardingCompleted = true;
          this.store.save();
          host.hidden = true;
          host.innerHTML = "";
          if (app) app.hidden = false;
          this.render();
        });
      }
    }

    announce(message, priority = "polite") {
      const el = document.getElementById("live-announcer");
      if (el && message) {
        el.setAttribute("aria-live", priority);
        el.textContent = message;
      }
    }

    /* ── SENSORY LAYER ────────────────────────────────────────────────
       Haptics + celebration effects. Every path is capability-guarded and
       reduced-motion aware: the app must feel alive without ever being
       noisy, and must degrade to silence on unsupported platforms. */

    prefersReducedMotion() {
      // The OS preference and the in-app "Reduce motion" setting are OR-ed:
      // either one alone must silence every motion effect this app owns.
      if (typeof global.matchMedia === "function" && global.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return true;
      }
      const settings = this.store && this.store.state && this.store.state.settings;
      return !!(settings && settings.reduceMotion === true);
    }

    haptic(pattern) {
      const settings = this.store && this.store.state && this.store.state.settings;
      if (settings && settings.hapticFeedback === false) return;
      try {
        if (global.navigator && typeof global.navigator.vibrate === "function") {
          global.navigator.vibrate(pattern);
        }
      } catch (_) { /* haptics are never worth an exception */ }
    }

    afterPaint() {
      const feedback = document.querySelector(".exercise-feedback.feedback-correct, .exercise-feedback.feedback-wrong, .drill-feedback.feedback-correct, .drill-feedback.feedback-wrong");
      if (feedback) {
        // The signature must advance on every NEW graded answer, including
        // repeated verdicts within grammar lessons and reading quizzes, or
        // consecutive identical outcomes would lose their haptic tick.
        const signature = [
          this.currentTab,
          this.practiceMode || "",
          this.activeGrammarRule && this.activeGrammarRule.id,
          this.activeGrammarExIndex,
          Object.keys(this.activePassageAnswers || {}).length,
          this.session.currentIndex,
          feedback.className
        ].join("|");
        if (this._lastFeedbackSignature !== signature) {
          this._lastFeedbackSignature = signature;
          this.haptic(feedback.classList.contains("feedback-correct") ? 14 : [12, 50, 22]);
        }
      } else {
        this._lastFeedbackSignature = null;
      }

      const completed = document.querySelector(".session-complete-card");
      if (completed && !this._celebrationShown) {
        this._celebrationShown = true;
        this.launchConfetti(completed);
      } else if (!completed) {
        this._celebrationShown = false;
      }
    }

    launchConfetti(anchor) {
      if (!anchor || this.prefersReducedMotion() || typeof document.createElement("canvas").getContext !== "function") return;
      const host = anchor.closest(".screen-pane") || anchor.parentElement || document.body;
      const rect = anchor.getBoundingClientRect();
      const canvas = document.createElement("canvas");
      canvas.className = "np-confetti-canvas";
      canvas.width = Math.max(1, Math.round(rect.width));
      canvas.height = 220;
      canvas.setAttribute("aria-hidden", "true");
      host.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      if (!ctx) { canvas.remove(); return; }

      const styles = getComputedStyle(document.documentElement);
      const palette = ["--accent", "--accent-3", "--good", "--warn", "--accent-4"]
        .map((v) => styles.getPropertyValue(v).trim())
        .filter(Boolean);
      const originX = canvas.width / 2;
      const gravity = 0.16;
      const drag = 0.985;

      const particles = Array.from({ length: 90 }, (_, i) => {
        const angle = (Math.PI * (0.08 + 0.84 * (i / 90))) + (Math.random() - 0.5) * 0.34;
        const speed = 5.2 + Math.random() * 5.6;
        return {
          x: originX,
          y: 24,
          vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1) * 0.72,
          vy: -Math.abs(Math.sin(angle)) * speed,
          w: 5 + Math.random() * 5,
          h: 8 + Math.random() * 7,
          color: palette[i % Math.max(1, palette.length)] || "#a78bfa",
          rotation: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.28,
          wobble: Math.random() * Math.PI * 2
        };
      });

      // Single idempotent teardown: whichever fires first (natural finish,
      // lifetime cap, or pagehide) cancels the frame loop, clears the cap,
      // detaches the listener, and removes the canvas. Nothing survives it.
      let settled = false;
      let raf = 0;
      let expiry = 0;
      const settle = () => {
        if (settled) return;
        settled = true;
        cancelAnimationFrame(raf);
        clearTimeout(expiry);
        window.removeEventListener("pagehide", settle);
        canvas.remove();
      };
      const tick = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        for (const p of particles) {
          p.vy = p.vy * drag + gravity;
          p.vx *= drag;
          p.x += p.vx + Math.sin(p.wobble += 0.09) * 0.5;
          p.y += p.vy;
          p.rotation += p.spin;
          if (p.y < canvas.height + 24) alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(1, Math.cos(p.wobble * 1.4));
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
        if (alive) {
          raf = requestAnimationFrame(tick);
        } else {
          settle();
        }
      };
      expiry = setTimeout(settle, 4200);
      window.addEventListener("pagehide", settle);
      raf = requestAnimationFrame(tick);
    }

    showInlineStatus(message, type = "info") {
      const banner = document.getElementById("settings-status-banner") || document.querySelector(".status-banner");
      if (banner) {
        banner.className = `status-banner status-${type} animate-fade`;
        banner.textContent = message;
        banner.style.display = "block";
      }
      this.announce(message, type === "error" ? "assertive" : "polite");
    }

    applyTheme() {
      const settings = this.store.state.settings || {};
      const appearance = ["system", "light", "dark"].includes(settings.appearance)
        ? settings.appearance
        : (settings.theme === "light" ? "light" : "dark");
      const accent = ["violet", "graphite", "blue", "red", "yellow", "green", "orange", "gold"].includes(settings.accent)
        ? settings.accent
        : "violet";
      const reduceMotion = settings.reduceMotion === true;
      let colorMode = appearance;
      if (appearance === "system") {
        colorMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      }
      document.documentElement.setAttribute("data-theme", accent);
      document.documentElement.setAttribute("data-color-mode", colorMode);
      document.documentElement.style.colorScheme = colorMode;
      document.documentElement.classList.toggle("app-reduced-motion", reduceMotion);
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) themeMeta.setAttribute("content", colorMode === "light" ? "#ffffff" : "#000000");
    }

    bindNav() {
      document.querySelectorAll(".bottom-nav .nav-btn").forEach((btn) => {
        btn.addEventListener("click", () => this.goHub(btn.dataset.nav));
      });
      const settingsBtn = document.getElementById("app-settings-button");
      if (settingsBtn) {
        settingsBtn.addEventListener("click", () => this.openSettings());
      }
    }

    bindHistory() {
      window.addEventListener("popstate", (event) => {
        const route = event.state && event.state.route;
        if (route) {
          this.applyRoute(route);
          this.focusIntention = "heading";
          this.render();
        } else {
          this.goHub("learn", { replace: true });
        }
      });
      this.replaceRoute();
    }

    currentRoute() {
      return {
        hub: this.hub,
        tab: this.currentTab,
        practiceMode: this.practiceMode || null,
        grammarRuleId: this.activeGrammarRule && this.activeGrammarRule.id ? this.activeGrammarRule.id : null,
        passageId: this.activePassage && this.activePassage.id ? this.activePassage.id : null
      };
    }

    applyRoute(route) {
      const next = route && typeof route === "object" ? route : {};
      this.hub = next.hub === "exam" || next.hub === "progress" ? next.hub : "learn";
      this.currentTab = next.tab || (this.hub === "exam" ? "exam" : this.hub === "progress" ? "progress" : "today");
      this.practiceMode = next.practiceMode || null;
      this.pendingGrammarRuleId = next.grammarRuleId || null;
      this.pendingPassageId = next.passageId || null;
      if (!this.pendingGrammarRuleId) {
        this.activeGrammarRule = null;
        this.activeGrammarExIndex = 0;
        this.tokenReconstructionPlaced = [];
        this.activeGrammarAnswers = {};
      }
      if (!this.pendingPassageId) {
        this.activePassage = null;
        this.activePassageAnswers = {};
      }
    }

    resolveRoutedDetails() {
      if (this.pendingGrammarRuleId && global.NP_GRAMMAR) {
        const rule = global.NP_GRAMMAR.find((r) => r.id === this.pendingGrammarRuleId);
        if (rule && (!this.activeGrammarRule || this.activeGrammarRule.id !== rule.id)) {
          this.activeGrammarRule = rule;
          this.activeGrammarExIndex = 0;
          this.tokenReconstructionPlaced = [];
          this.activeGrammarAnswers = {};
        } else if (rule) {
          this.activeGrammarRule = rule;
        }
        this.pendingGrammarRuleId = null;
      }
      if (this.pendingPassageId && global.NP_COMPREHENSION) {
        const passage = global.NP_COMPREHENSION.find((p) => p.id === this.pendingPassageId);
        if (passage && (!this.activePassage || this.activePassage.id !== passage.id)) {
          this.activePassage = passage;
          this.activePassageAnswers = {};
        } else if (passage) {
          this.activePassage = passage;
        }
        this.pendingPassageId = null;
      }
    }

    pushRoute() {
      const state = Object.assign({}, history.state || {}, { route: this.currentRoute() });
      history.pushState(state, "", location.href);
    }

    replaceRoute() {
      const state = Object.assign({}, history.state || {}, { route: this.currentRoute() });
      history.replaceState(state, "", location.href);
    }

    goBack() {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      this.goHub(this.hub === "exam" || this.hub === "progress" ? this.hub : "learn", { replace: true });
    }

    setNavActive(hub) {
      document.querySelectorAll(".bottom-nav .nav-btn").forEach((b) => {
        const isActive = b.dataset.nav === hub;
        b.classList.toggle("active", isActive);
        if (isActive) b.setAttribute("aria-current", "page");
        else b.removeAttribute("aria-current");
      });
    }

    showDetailBar(label, onBack) {
      const bar = document.getElementById("detail-bar");
      if (!bar) return;
      bar.hidden = false;
      bar.innerHTML = `<button class="back-btn" type="button" id="btn-detail-back">‹ ${Learning.escapeHTML(label)}</button>`;
      const back = document.getElementById("btn-detail-back");
      if (back) back.addEventListener("click", onBack);
      const settingsBtn = document.getElementById("app-settings-button");
      if (settingsBtn) settingsBtn.hidden = true;
    }

    hideDetailBar() {
      const bar = document.getElementById("detail-bar");
      if (bar) {
        bar.hidden = true;
        bar.innerHTML = "";
      }
      const settingsBtn = document.getElementById("app-settings-button");
      if (settingsBtn) settingsBtn.hidden = false;
    }

    goHub(hub, { replace = false } = {}) {
      this.hub = hub === "exam" || hub === "progress" ? hub : "learn";
      this.practiceMode = null;
      this.activeGrammarRule = null;
      this.activePassage = null;
      this.currentTab = this.hub === "exam" ? "exam" : this.hub === "progress" ? "progress" : "today";
      this.focusIntention = "heading";
      if (!replace) this.pushRoute();
      this.render();
      this.scrollToTop();
    }

    openLearnItem(tab, { practiceMode = null } = {}) {
      this.hub = "learn";
      this.currentTab = tab;
      this.practiceMode = practiceMode;
      this.activeGrammarRule = null;
      this.activePassage = null;
      this.pendingGrammarRuleId = null;
      this.pendingPassageId = null;
      this.activeGrammarExIndex = 0;
      this.tokenReconstructionPlaced = [];
      this.activeGrammarAnswers = {};
      this.activePassageAnswers = {};
      this.focusIntention = "heading";
      this.pushRoute();
      this.render();
      this.scrollToTop();
    }

    openSettings() {
      this.currentTab = "settings";
      this.focusIntention = "heading";
      this.pushRoute();
      this.render();
      this.scrollToTop();
    }

    scrollToTop() {
      if (typeof window === "undefined") return;

      // The app shell is position:fixed; the real scroller is #app-main, not
      // the window. Instant jump so Next never leaves the learner stranded
      // at the previous step's bottom.
      const apply = () => {
        const instant = { top: 0, left: 0, behavior: "auto" };
        const scroller = document.getElementById("app-main");
        if (scroller) {
          scroller.scrollTop = 0;
          if (typeof scroller.scrollTo === "function") scroller.scrollTo(instant);
        }
        window.scrollTo(instant);
        if (document.documentElement) document.documentElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;
      };

      apply();
      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(() => window.requestAnimationFrame(apply));
      }
    }

    switchTab(tab) {
      if (tab === "exam" || tab === "progress" || tab === "settings") {
        if (tab === "settings") this.openSettings();
        else this.goHub(tab);
        return;
      }
      if (tab === "practice") {
        this.openLearnItem("review");
        return;
      }
      this.openLearnItem(tab);
    }

    bindGlobalKeyboard() {
      window.addEventListener("keydown", (e) => {
        const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
        const isFormField =
          tag === "input" ||
          tag === "textarea" ||
          tag === "select" ||
          (e.target && e.target.isContentEditable);

        // 1, 2, 3, 4 shortcuts for SRS ratings when cards are revealed and not in a text field
        if ((this.currentTab === "practice" || this.currentTab === "review") && this.practiceMode === "flashcards" && this.session.revealed) {
          if (!isFormField && ["1", "2", "3", "4"].includes(e.key)) {
            e.preventDefault();
            this.handleSRSRating(parseInt(e.key, 10));
          }
        }
      });
    }

    getStreakNoun(streak) {
      return Number(streak) === 1 ? "day" : "days";
    }

    updateHeaderStats() {}

    getRequiredBanksForCurrentView() {
      switch (this.currentTab) {
        case "today":
          return ["grammar", "idioms"];
        case "words":
          return ["words"];
        case "grammar":
        case "path":
          return ["grammar"];
        case "comprehension":
          return ["comprehension"];
        case "review":
        case "practice": {
          switch (this.practiceMode) {
            case "fill_blank":
              return ["sentences", "words"];
            case "context":
              return ["sentences"];
            case "flashcards":
            case "article_drill":
            case "spelling":
            case "choose_word":
            case "verbs":
            case "synonyms":
            case "morphology":
              return ["words"];
            default:
              return [];
          }
        }
        case "exam":
        case "progress":
        case "settings":
        default:
          return [];
      }
    }

    visibleScreenId() {
      if (this.currentTab === "settings") return "screen-settings";
      if (this.currentTab === "exam") return "screen-exam";
      if (this.currentTab === "progress") return "screen-progress";
      if (this.currentTab === "review" || this.currentTab === "practice") return "screen-review";
      if (this.currentTab === "comprehension") return "screen-comprehension";
      if (this.currentTab === "grammar") return "screen-grammar";
      if (this.currentTab === "words") return "screen-words";
      if (this.currentTab === "path") return "screen-path";
      return "screen-today";
    }

    async render() {
      const app = document.getElementById("app");
      if (app) app.hidden = false;
      const onboard = document.getElementById("onboarding");
      if (onboard && !this.shouldShowOnboarding()) {
        onboard.hidden = true;
      }
      const main = document.getElementById("app-main");
      if (!main) return;
      this.setNavActive(this.hub === "exam" || this.hub === "progress" ? this.hub : "learn");
      const showBack = this.currentTab !== "today" && this.currentTab !== "exam" && this.currentTab !== "progress";
      if (showBack) {
        const backLabel = this.hub === "learn" ? "Learn" : this.hub === "exam" ? "Exam" : "Progress";
        this.showDetailBar(backLabel, () => this.goBack());
      } else {
        this.hideDetailBar();
      }

      const currentToken = ++this.navToken;
      const requiredBanks = this.getRequiredBanksForCurrentView();
      const targetId = this.visibleScreenId();
      const target = document.getElementById(targetId) || main;
      document.querySelectorAll(".screen-pane").forEach((pane) => {
        const active = pane.id === targetId;
        pane.hidden = !active;
        if (!active) pane.innerHTML = "";
      });

      const isAlreadyLoaded = requiredBanks.every((b) =>
        global.NederDataLoader ? global.NederDataLoader.isBankLoaded(b) : true
      );

      if (!isAlreadyLoaded && global.NederDataLoader) {
        target.innerHTML = `
          <div class="card loading-state" role="status" aria-live="polite">
            <div class="spinner" aria-hidden="true"></div>
            <p>Loading data...</p>
          </div>
        `;
        main.setAttribute("aria-busy", "true");

        try {
          await global.NederDataLoader.loadBanks(requiredBanks);
        } catch (err) {
          if (this.navToken !== currentToken) return;
          main.removeAttribute("aria-busy");
          target.innerHTML = `
            <div class="card error-state" role="alert">
              <h2>Data could not be loaded</h2>
              <p>${Learning.escapeHTML(err.message || "Something went wrong while loading the data.")}</p>
              <button class="btn btn-primary" id="btn-retry-load" type="button">Try again</button>
            </div>
          `;
          const retryBtn = document.getElementById("btn-retry-load");
          if (retryBtn) {
            retryBtn.addEventListener("click", () => {
              requiredBanks.forEach((b) => {
                if (global.NederDataLoader && !global.NederDataLoader.isBankLoaded(b)) {
                  global.NederDataLoader.resetBank(b);
                }
              });
              this.render();
            });
          }
          return;
        }
      }

      if (this.navToken !== currentToken) return;
      main.removeAttribute("aria-busy");
      this.resolveRoutedDetails();
      this.sanitizeLoadedWordReferences();

      switch (this.currentTab) {
        case "today":
          target.innerHTML = this.renderTodayView();
          this.attachTodayListeners();
          break;
        case "path":
          target.innerHTML = this.renderPathView();
          this.attachPathListeners();
          break;
        case "review":
        case "practice":
          target.innerHTML = this.renderPracticeView();
          this.attachPracticeListeners();
          break;
        case "grammar":
          target.innerHTML = this.renderGrammarView();
          this.attachGrammarListeners();
          break;
        case "comprehension":
          target.innerHTML = this.renderComprehensionView();
          this.attachComprehensionListeners();
          break;
        case "words":
          target.innerHTML = this.renderWordsView();
          this.attachWordsListeners();
          break;
        case "progress":
          target.innerHTML = this.renderProgressView();
          this.attachProgressListeners();
          break;
        case "settings":
          target.innerHTML = this.renderSettingsView();
          this.attachSettingsListeners();
          break;
        case "exam":
          target.innerHTML = this.renderExamView();
          break;
        default:
          target.innerHTML = this.renderTodayView();
          this.attachTodayListeners();
      }

      this.afterPaint();

      // Manage focus only on explicit primary view transitions or intended control, never steal focus to heading during internal updates
      if (this.focusIntention === "heading") {
        this.focusIntention = null;
        const pageHeading = main.querySelector("h1, h2");
        if (pageHeading) {
          pageHeading.setAttribute("tabindex", "-1");
          pageHeading.focus({ preventScroll: true });
        }
      } else if (typeof this.focusIntention === "string" && this.focusIntention.startsWith("#")) {
        const targetEl = document.querySelector(this.focusIntention);
        this.focusIntention = null;
        if (targetEl) {
          targetEl.focus({ preventScroll: true });
        }
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
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 0);
      const dayOfYear = Math.floor((now - startOfYear) / 1000 / 60 / 60 / 24);
      const spotlightRule = grammarRules[dayOfYear % (grammarRules.length || 1)] || grammarRules[0];
      const todayIdiom = idioms[dayOfYear % (idioms.length || 1)] || idioms[0];

      const learnItems = [
        { id: "today", tab: "today", title: "Today", sub: "Next action and daily progress", current: true },
        { id: "path", tab: "path", title: "Learning path", sub: "8 grammar sections in order" },
        { id: "words", tab: "words", title: "Words", sub: "Dictionary, articles, and search" },
        { id: "grammar", tab: "grammar", title: "Grammar", sub: "120 lessons with exercises" },
        { id: "comprehension", tab: "comprehension", title: "Reading", sub: "120 curated texts" },
        { id: "review", tab: "review", title: "Review", sub: `${deckStats.due} cards ready for review` }
      ];

      return `
        <div class="today-home">
          <p class="eyebrow">Learn</p>
          <h1 class="page-title">What do you want to do now?</h1>
          <p class="today-subtitle page-subtitle">Your streak is <strong>${user.streak} ${this.getStreakNoun(user.streak)}</strong>.</p>
          <div class="card" style="margin-bottom: 14px;">
            <div class="progress-info" style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span>Today</span>
              <span><strong>${dailyStats.learnedToday}</strong> / ${targetGoal}</span>
            </div>
            <div class="progress-bar-track" aria-hidden="true"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="hub-list">
            ${learnItems.map((item) => `
              <button type="button" class="study-row ${item.current ? "active" : ""}" id="nav-${item.id}" data-learn-tab="${item.tab}">
                <div>
                  <div class="study-row-title">${item.title}</div>
                  <div class="study-row-sub">${item.sub}</div>
                </div>
              </button>
            `).join("")}
          </div>
          ${spotlightRule ? `
            <div class="card" style="margin-top:16px;">
              <p class="eyebrow">Next grammar</p>
              <h2 class="spotlight-title">${Learning.escapeHTML(spotlightRule.title)}</h2>
              <p>${Learning.escapeHTML(spotlightRule.summary)}</p>
              <button class="btn btn-secondary" id="btn-open-spotlight-grammar" data-rule-id="${Learning.escapeHTML(spotlightRule.id)}" type="button">Open lesson</button>
            </div>
          ` : ""}
          ${todayIdiom ? `
            <div class="card" style="margin-top:12px;">
              <p class="eyebrow">Expression of the day</p>
              <h2 class="idiom-dutch">“${Learning.escapeHTML(todayIdiom.dutch)}”</h2>
              <p>${Learning.escapeHTML(todayIdiom.meaning)}</p>
            </div>
          ` : ""}
        </div>
      `;
    }

    attachTodayListeners() {
      document.querySelectorAll("[data-learn-tab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const tab = btn.dataset.learnTab;
          if (tab && tab !== "today") this.openLearnItem(tab);
        });
      });
      const spotGrammarBtn = document.getElementById("btn-open-spotlight-grammar");
      if (spotGrammarBtn) {
        spotGrammarBtn.addEventListener("click", () => {
          this.openGrammarRule(spotGrammarBtn.dataset.ruleId);
        });
      }
    }

    /* ==========================================================================
       2. CURRICULUM PATH VIEW (8 Distinct Sections)
       ========================================================================== */
    renderPathView() {
      const grammarRules = global.NP_GRAMMAR || [];
      const sections = [
        { num: 1, title: "Fundamentals & sounds", level: "A0–A1", desc: "Pronunciation, spelling, articles (de/het), finite verbs, and negation.", icon: "🌱" },
        { num: 2, title: "Core grammar & sentence building", level: "A1–A2", desc: "Separable verbs, modal auxiliaries, adjectives, and diminutives.", icon: "🧱" },
        { num: 3, title: "Verb systems & tenses", level: "A2", desc: "'t kofschip, simple past (OVT), present perfect (VTT), and continuity.", icon: "⏳" },
        { num: 4, title: "Complex sentences & conjunctions", level: "A2–B1", desc: "Subordinate clauses (SOV order), relative clauses, om...te constructions, and 'er'.", icon: "🔗" },
        { num: 5, title: "Intermediate depth", level: "B1", desc: "Passives, conditionals (zou/zouden), and modal particles.", icon: "🌊" },
        { num: 6, title: "Advanced syntax & mood", level: "B1–B2", desc: "Reported speech, verb clusters (red/green order), and Infinitivus pro Participio (IPP).", icon: "🏛️" },
        { num: 7, title: "Style, register & pragmatics", level: "B2", desc: "Formal versus informal register, cleft sentences, stylistic inversion, and cohesion.", icon: "💎" },
        { num: 8, title: "Mastery & nuance", level: "C1", desc: "Complex nominalisations, archaic constructions, rhetoric, and idiomatic precision.", icon: "👑" }
      ];

      return `
        <div class="path-container animate-fade">
          <div class="catalog-header">
            <div>
              <h1 class="page-title">NederPath learning path</h1>
              <p class="page-subtitle">A structured path toward fluency through 8 thematic level sections.</p>
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
                        <span class="section-num">SECTION ${sec.num}</span>
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
                    <span class="section-progress-txt">${completedCount} / ${secRules.length} rules (${pct}%)</span>
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
        { id: "flashcards", name: "SRS flashcards", desc: "Due-first review with Again/Hard/Good/Easy" },
        { id: "article_drill", name: "De or het", desc: "Article drill on curated nouns" },
        { id: "spelling", name: "Spelling", desc: "Type the Dutch word" },
        { id: "fill_blank", name: "Fill in the blank", desc: "Choose the missing word" },
        { id: "choose_word", name: "Choose the word", desc: "Multiple choice from the meaning" },
        { id: "verbs", name: "Verbs", desc: "Hij/zij present tense" },
        { id: "synonyms", name: "Synonyms", desc: "Only where the source has synonyms" },
        { id: "morphology", name: "Plurals", desc: "Only verified plural forms" },
        { id: "context", name: "Sentence context", desc: "Authored example sentences" }
      ];

      if (!this.practiceMode) {
        return `
          <div class="review-hub">
            <p class="eyebrow">Review</p>
            <h1 class="page-title">Choose a practice</h1>
            <p class="page-subtitle">Practice lives here, not as a permanent toolbar.</p>
            <div class="hub-list">
              ${modes.map((m) => `
                <button type="button" class="study-row" data-mode="${m.id}" aria-pressed="false">
                  <div>
                    <div class="study-row-title">${m.name}</div>
                    <div class="study-row-sub">${m.desc}</div>
                  </div>
                </button>
              `).join("")}
            </div>
          </div>
        `;
      }

      return `
        <div class="practice-container">
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
          this.session.startXp = (this.store && this.store.state && this.store.state.user && this.store.state.user.totalXp) || 0;
          this.pushRoute();
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
          this.session.startXp = (this.store && this.store.state && this.store.state.user && this.store.state.user.totalXp) || 0;
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

    // --- Mode 1: Flashcards (SRS Due Prioritized, Unseen Fillers, Full Learnable Bank) ---
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
        this.session.itemNoun = "cards";
        this.session.startXp = (this.store && this.store.state && this.store.state.user && this.store.state.user.totalXp) || 0;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const card = this.session.cards[this.session.currentIndex];
      const preview = this.srs.previewRatings(card.id, "vocab");
      const isNoun = card.pos === "noun" && card.article;
      const displayDutch = isNoun
        ? `<span class="word-article article-${Learning.escapeHTML(card.article)}">${Learning.escapeHTML(card.article)}</span> ${Learning.escapeHTML(card.word)}`
        : Learning.escapeHTML(card.word);

      return `
        <div class="flashcard-wrapper animate-fade">
          <div class="flashcard-header-bar">
            <span>Card ${this.session.currentIndex + 1} of ${this.session.cards.length}</span>
            <span class="word-level-badge badge-${Learning.escapeHTML(card.level.toLowerCase())}">${Learning.escapeHTML(card.level)}</span>
          </div>

          <button type="button" class="card flashcard flashcard-interactive ${this.session.revealed ? 'revealed' : ''}" id="interactive-flashcard" aria-expanded="${this.session.revealed ? 'true' : 'false'}" aria-label="Flashcard for ${Learning.escapeHTML(card.word)}. ${this.session.revealed ? 'Meaning: ' + Learning.escapeHTML(card.meaning || card.word) : 'Press Space or Enter to reveal the meaning'}">
            <span class="flashcard-front">
              <span class="flashcard-pos">${Learning.escapeHTML(card.pos.toUpperCase())}</span>
              <span class="flashcard-dutch long-compound">${displayDutch}</span>
              ${card.example ? `<span class="flashcard-example">“${Learning.escapeHTML(card.example)}”</span>` : ""}
              <span class="flashcard-hint">Tap the card or press [Space/Enter] to see the answer</span>
            </span>

            ${this.session.revealed ? `
              <span class="flashcard-back animate-fade">
                <span class="flashcard-meaning">${Learning.escapeHTML(card.meaning || card.word)}</span>
                ${card.exampleEn ? `<span class="flashcard-example-en">${Learning.escapeHTML(card.exampleEn)}</span>` : ""}
                ${card.synonyms && card.synonyms.length > 0 ? `<span class="flashcard-synonyms"><strong>Synonyms:</strong> ${card.synonyms.map((s) => Learning.escapeHTML(s)).join(", ")}</span>` : ""}
                <span class="flashcard-category">Category: ${Learning.escapeHTML(card.category)}</span>
              </span>
            ` : ""}
          </button>

          ${this.session.revealed ? `
            <div class="srs-controls animate-fade">
              <button type="button" class="btn btn-srs btn-again" id="btn-srs-again" data-rating="1">
                <span>1</span> Again<small>(${preview[1].formattedDutch || preview[1].formattedInterval})</small>
              </button>
              <button type="button" class="btn btn-srs btn-hard" id="btn-srs-hard" data-rating="2">
                <span>2</span> Hard<small>(${preview[2].formattedDutch || preview[2].formattedInterval})</small>
              </button>
              <button type="button" class="btn btn-srs btn-good" id="btn-srs-good" data-rating="3">
                <span>3</span> Good<small>(${preview[3].formattedDutch || preview[3].formattedInterval})</small>
              </button>
              <button type="button" class="btn btn-srs btn-easy" id="btn-srs-easy" data-rating="4">
                <span>4</span> Easy<small>(${preview[4].formattedDutch || preview[4].formattedInterval})</small>
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
      if (this.session.revealed && this.session.cards[this.session.currentIndex]) {
        const c = this.session.cards[this.session.currentIndex];
        this.announce(`Card revealed: ${c.word}. Meaning: ${c.meaning || c.en || ""}. Rate with 1 to 4.`);
      }
      this.focusIntention = "#interactive-flashcard";
      this.render();
    }

    handleSRSRating(rating) {
      const card = this.session.cards[this.session.currentIndex];
      this.haptic(rating >= 3 ? 14 : [12, 50, 22]);
      this.srs.review(card.id, rating, "vocab");
      this.session.currentIndex += 1;
      this.session.revealed = false;
      if (this.session.currentIndex >= this.session.cards.length) {
        this.announce(`Session complete! ${this.session.cards.length} cards practised.`);
        this.focusIntention = "#btn-restart-session";
      } else {
        const nextCard = this.session.cards[this.session.currentIndex];
        this.announce(`Rating saved. Next card: ${nextCard.word}`);
        this.focusIntention = "#interactive-flashcard";
      }
      this.render();
      this.scrollToTop();
    }

    renderSessionCompleteScreen() {
      const startXp = typeof this.session.startXp === "number" ? this.session.startXp : ((this.store && this.store.state && this.store.state.user && this.store.state.user.totalXp) || 0);
      const currentXp = (this.store && this.store.state && this.store.state.user && this.store.state.user.totalXp) || 0;
      const earnedXp = Math.max(0, currentXp - startXp);
      const noun = this.session.itemNoun || "cards";
      const count = this.session.cards ? this.session.cards.length : 0;

      return `
        <div class="card session-complete-card animate-fade">
          <div class="complete-icon">🎉</div>
          <h2>Great work!</h2>
          <p>You finished this practice session of ${count} ${noun}.</p>
          <div class="session-stats-row">
            <div class="session-stat-box">
              <span class="stat-num">+${earnedXp}</span>
              <span class="stat-label">XP earned</span>
            </div>
            <div class="session-stat-box">
              <span class="stat-num">${(this.store && this.store.state && this.store.state.user && this.store.state.user.streak) || 0}</span>
              <span class="stat-label">Streak</span>
            </div>
          </div>
          <div class="complete-actions">
            <button type="button" class="btn btn-primary" id="btn-restart-session">🔄 Another session</button>
            <button type="button" class="btn btn-outline" id="btn-go-today">Back to Learn</button>
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
        this.session.itemNoun = "questions";
        this.session.startXp = (this.store && this.store.state && this.store.state.user && this.store.state.user.totalXp) || 0;
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
            <span>Question ${this.session.currentIndex + 1} / ${this.session.cards.length}</span>
            <span>Overall article score: <strong>${acc}%</strong> (${stats.correct}/${stats.totalDrilled})</span>
          </div>

          <div class="card drill-card">
            <span class="drill-sub">Choose the correct article for:</span>
            <div class="drill-noun">${Learning.escapeHTML(item.word)}</div>
            <div class="drill-meaning">${Learning.escapeHTML(item.meaning || "")}</div>

            <div class="drill-options">
              <button type="button" class="btn btn-drill btn-de" data-choice="de" ${this.session.feedback ? 'disabled' : ''}>de</button>
              <button type="button" class="btn btn-drill btn-het" data-choice="het" ${this.session.feedback ? 'disabled' : ''}>het</button>
            </div>

            ${this.session.feedback ? `
              <div class="drill-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? '✓ Excellent!' : '✗ Not quite.'}
                It is <strong>${Learning.escapeHTML(item.article)} ${Learning.escapeHTML(item.word)}</strong>.
                ${item.word.endsWith("je") ? "<br><small>Tip: All diminutives take 'het'!</small>" : ""}
              </div>
              <button type="button" class="btn btn-primary btn-block" id="btn-next-drill" style="margin-top: 1rem;">Next question →</button>
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
          this.announce(isCorrect ? `Correct! It is ${item.article} ${item.word}.` : `Not quite. It is ${item.article} ${item.word}.`);
          this.render();
        });
      });

      const nextBtn = document.getElementById("btn-next-drill");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
          this.scrollToTop();
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
        this.session.itemNoun = "words";
        this.session.startXp = (this.store && this.store.state && this.store.state.user && this.store.state.user.totalXp) || 0;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];

      return `
        <div class="spelling-wrapper animate-fade">
          <div class="card typing-card">
            <span class="card-tag">Type the correct Dutch word</span>
            <div class="drill-meaning" style="font-size: 1.4rem; font-weight: 700; margin: 1.5rem 0;">
              “${Learning.escapeHTML(item.meaning || item.word)}”
            </div>
            ${item.exampleEn ? `<p class="context-hint">Context: ${Learning.escapeHTML(item.exampleEn)}</p>` : ""}

            <form id="spelling-form" class="spelling-form">
              <label for="spelling-input" class="sr-only">Dutch spelling</label>
              <input type="text" id="spelling-input" class="form-input" placeholder="Type here in Dutch..." autocomplete="off" autofocus ${this.session.feedback ? 'disabled' : ''} />
              <button type="submit" class="btn btn-primary" style="margin-top: 1rem;" ${this.session.feedback ? 'disabled' : ''}>Check answer</button>
            </form>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? '✓ Spelled perfectly!' : `✗ Not quite. The correct answer is: <strong>${Learning.escapeHTML(item.word)}</strong>`}
              </div>
              <button type="button" class="btn btn-secondary btn-block" id="btn-next-spelling" style="margin-top: 1rem;">Next word →</button>
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
          this.announce(isCorrect ? `Spelled perfectly: ${item.word}!` : `Not quite. The correct answer is: ${item.word}.`);
          this.render();
        });
      }

      const nextBtn = document.getElementById("btn-next-spelling");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
          this.scrollToTop();
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
        this.session.itemNoun = "sentences";
        this.session.startXp = (this.store && this.store.state && this.store.state.user && this.store.state.user.totalXp) || 0;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];

      return `
        <div class="fill-blank-wrapper animate-fade">
          <div class="card drill-card">
            <span class="card-tag">Fill in the missing word</span>
            <div class="drill-noun" style="font-size: 1.4rem; line-height: 1.6; margin: 1.5rem 0;">
              ${Learning.escapeHTML(item.maskedSentence)}
            </div>
            <div class="drill-meaning">“${Learning.escapeHTML(item.translation)}”</div>

            <div class="options-grid">
              ${(item.options || []).map((opt) => {
                const isSelected = this.session.feedback && this.session.feedback.chosen === opt;
                return `
                  <button type="button" class="btn btn-outline btn-option ${isSelected ? (this.session.feedback.isCorrect ? 'btn-success' : 'btn-wrong') : ''}" data-option="${Learning.escapeHTML(opt)}" ${this.session.feedback ? 'disabled' : ''}>
                    ${Learning.escapeHTML(opt)}
                  </button>
                `;
              }).join("")}
            </div>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? '✓ Correct!' : `✗ Not quite. The correct word was: <strong>${Learning.escapeHTML(item.targetWord)}</strong>`}
              </div>
              <button type="button" class="btn btn-primary btn-block" id="btn-next-fill-blank" style="margin-top: 1rem;">Next sentence →</button>
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
          this.announce(isCorrect ? `Correct! "${chosen}" fits the sentence.` : `Not quite. The correct word was "${item.targetWord}".`);
          this.render();
        });
      });

      const nextBtn = document.getElementById("btn-next-fill-blank");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
          this.scrollToTop();
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
        this.session.itemNoun = "questions";
        this.session.startXp = (this.store && this.store.state && this.store.state.user && this.store.state.user.totalXp) || 0;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];

      return `
        <div class="choose-word-wrapper animate-fade">
          <div class="card drill-card">
            <span class="card-tag">Choose the correct Dutch word for:</span>
            <div class="drill-meaning" style="font-size: 1.6rem; font-weight: 800; margin: 1.5rem 0;">
              “${Learning.escapeHTML(item.meaning || item.word)}”
            </div>

            <div class="options-grid">
              ${(item.options || []).map((opt) => {
                const isSelected = this.session.feedback && this.session.feedback.chosenId === opt.id;
                return `
                  <button type="button" class="btn btn-outline btn-choice-word ${isSelected ? (this.session.feedback.isCorrect ? 'btn-success' : 'btn-wrong') : ''}" data-word-id="${Learning.escapeHTML(opt.id)}" ${this.session.feedback ? 'disabled' : ''}>
                    ${Learning.escapeHTML(opt.displayWord || opt.word)}
                  </button>
                `;
              }).join("")}
            </div>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? '✓ Excellent!' : `✗ Not quite. The correct word is: <strong>${Learning.escapeHTML(item.displayWord || item.word)}</strong>`}
              </div>
              <button type="button" class="btn btn-primary btn-block" id="btn-next-choose" style="margin-top: 1rem;">Next word →</button>
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
          this.announce(isCorrect ? `Correct! "${item.displayWord || item.word}" is the right word.` : `Not quite. The correct word was "${item.displayWord || item.word}".`);
          this.render();
        });
      });

      const nextBtn = document.getElementById("btn-next-choose");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
          this.scrollToTop();
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
        this.session.itemNoun = "verbs";
        this.session.startXp = (this.store && this.store.state && this.store.state.user && this.store.state.user.totalXp) || 0;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];

      return `
        <div class="verbs-wrapper animate-fade">
          <div class="card drill-card">
            <span class="card-tag">Verb conjugation</span>
            <div class="drill-noun" style="margin: 1rem 0;">${Learning.escapeHTML(item.word)}</div>
            <div class="drill-meaning">“${Learning.escapeHTML(item.meaning || '')}”</div>

            <p style="margin: 1.5rem 0 0.5rem; color: var(--text-secondary);">Type the present tense for 'hij/zij':</p>
            <form id="verb-form" class="verb-form">
              <label for="verb-input" class="sr-only">Hij/zij verb conjugation</label>
              <input type="text" id="verb-input" class="form-input" placeholder="e.g. werkt, loopt..." autocomplete="off" autofocus ${this.session.feedback ? 'disabled' : ''} />
              <button type="submit" class="btn btn-primary" style="margin-top: 1rem;" ${this.session.feedback ? 'disabled' : ''}>Check form</button>
            </form>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? `✓ Correct conjugation: '${Learning.escapeHTML(item.expectedHij)}'!` : `✗ Not quite. The correct 'hij/zij' form is: <strong>${Learning.escapeHTML(item.expectedHij)}</strong>`}
              </div>
              <button type="button" class="btn btn-secondary btn-block" id="btn-next-verb" style="margin-top: 1rem;">Next verb →</button>
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
          this.announce(isCorrect ? `Correct conjugation: hij/zij ${item.expectedHij}!` : `Not quite. The correct form is: hij/zij ${item.expectedHij}.`);
          this.render();
        });
      }

      const nextBtn = document.getElementById("btn-next-verb");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
          this.scrollToTop();
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
        this.session.itemNoun = "words";
        this.session.startXp = (this.store && this.store.state && this.store.state.user && this.store.state.user.totalXp) || 0;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];

      return `
        <div class="synonyms-wrapper animate-fade">
          <div class="card drill-card">
            <span class="card-tag">Synonyms & related meaning</span>
            <div class="drill-noun" style="font-size: 1.8rem; margin: 1.5rem 0;">${Learning.escapeHTML(item.displayWord || item.word)}</div>
            <div class="drill-meaning">“${Learning.escapeHTML(item.meaning || '')}”</div>
            <p style="color: var(--text-secondary); margin-top: 1rem;">Choose the correct synonym for this word:</p>

            <div class="options-grid" style="margin-top: 1rem;">
              ${(item.options || []).map((opt) => {
                const isSelected = this.session.feedback && this.session.feedback.chosen === opt;
                return `
                  <button type="button" class="btn btn-outline btn-syn-opt ${isSelected ? (this.session.feedback.isCorrect ? 'btn-success' : 'btn-wrong') : ''}" data-syn="${Learning.escapeHTML(opt)}" ${this.session.feedback ? 'disabled' : ''}>
                    ${Learning.escapeHTML(opt)}
                  </button>
                `;
              }).join("")}
            </div>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? '✓ Correct synonym!' : `✗ Not quite. A synonym of '${Learning.escapeHTML(item.word)}' is: <strong>${Learning.escapeHTML(item.correctSyn)}</strong>.`}
              </div>
              <button type="button" class="btn btn-primary btn-block" id="btn-next-syn" style="margin-top: 1rem;">Next question →</button>
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
          this.announce(isCorrect ? `Correct! "${chosen}" is a synonym of "${item.word}".` : `Not quite. The correct synonym was "${item.correctSyn}".`);
          this.render();
        });
      });

      const nextBtn = document.getElementById("btn-next-syn");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
          this.scrollToTop();
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
        this.session.itemNoun = "words";
        this.session.startXp = (this.store && this.store.state && this.store.state.user && this.store.state.user.totalXp) || 0;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];

      return `
        <div class="morphology-wrapper animate-fade">
          <div class="card drill-card">
            <span class="card-tag">Plurals & diminutives</span>
            <div class="drill-noun" style="margin: 1.5rem 0;">${Learning.escapeHTML(item.displayWord || item.word)}</div>
            <div class="drill-meaning">“${Learning.escapeHTML(item.meaning || '')}”</div>

            <p style="color: var(--text-secondary); margin-top: 1rem;">Type the plural of this noun:</p>
            <form id="morphology-form" style="margin-top: 1rem;">
              <label for="morphology-input" class="sr-only">Plural form</label>
              <input type="text" id="morphology-input" class="form-input" placeholder="Type the plural..." autocomplete="off" autofocus ${this.session.feedback ? 'disabled' : ''} />
              <button type="submit" class="btn btn-primary" style="margin-top: 1rem;" ${this.session.feedback ? 'disabled' : ''}>Check plural</button>
            </form>

            ${this.session.feedback ? `
              <div class="exercise-feedback ${this.session.feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'} animate-fade">
                ${this.session.feedback.isCorrect ? `✓ Correct plural: '${Learning.escapeHTML(item.expectedPlural)}'!` : `✗ Not quite. The correct plural is: <strong>${Learning.escapeHTML(item.expectedPlural)}</strong>`}
              </div>
              <button type="button" class="btn btn-secondary btn-block" id="btn-next-morph" style="margin-top: 1rem;">Next noun →</button>
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
          this.announce(isCorrect ? `Correct form: ${item.expectedPlural}!` : `Not quite. The correct form is: ${item.expectedPlural}.`);
          this.render();
        });
      }

      const nextBtn = document.getElementById("btn-next-morph");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.session.currentIndex += 1;
          this.session.feedback = null;
          this.render();
          this.scrollToTop();
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
        this.session.itemNoun = "sentences";
        this.session.startXp = (this.store && this.store.state && this.store.state.user && this.store.state.user.totalXp) || 0;
      }

      if (this.session.currentIndex >= this.session.cards.length) {
        return this.renderSessionCompleteScreen();
      }

      const item = this.session.cards[this.session.currentIndex];

      return `
        <div class="context-wrapper animate-fade">
          <div class="card drill-card">
            <span class="card-tag">Context & sentence use</span>
            <div class="drill-noun" style="font-size: 1.3rem; line-height: 1.6; margin: 1.5rem 0;">${Learning.escapeHTML(item.nl)}</div>
            <div class="drill-meaning">“${Learning.escapeHTML(item.en)}”</div>
            <div style="margin-top: 1rem; font-size: 0.88rem; color: var(--text-secondary);">
              Grammar level: <span class="badge-${Learning.escapeHTML(item.level.toLowerCase())}">${Learning.escapeHTML(item.level)}</span>
            </div>

            <button type="button" class="btn btn-primary btn-block" id="btn-next-ctx" style="margin-top: 1.5rem;">Got it · Next sentence →</button>
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
          this.scrollToTop();
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
              <h1 class="page-title">Dutch grammar</h1>
              <p class="page-subtitle">120 in-depth rules, structural formulas, examples, and interactive exercises.</p>
            </div>
            
            <div class="level-rail filter-pills" role="tablist" aria-label="CEFR levels">
              ${["all", "A1", "A2", "B1", "B2", "C1"].map((lvl) => `
                <button type="button" class="level-chip btn btn-sm ${this.selectedLevel === lvl ? 'btn-primary active' : 'btn-outline'}" data-filter-lvl="${lvl}">
                  ${lvl === 'all' ? 'All levels' : lvl}
                </button>
              `).join("")}
            </div>
          </div>

          <div class="grammar-rules-grid study-list">
            ${filtered.map((rule) => {
              const isCompleted = !!this.store.state.progress.grammarCompleted[rule.id];
              return `
                <button type="button" class="study-row catalog-card-button grammar-item-card" data-rule-id="${rule.id}" aria-label="Open grammar lesson: ${rule.title}">
                  <div class="grammar-card-top">
                    <span class="grammar-level badge-${rule.level.toLowerCase()}">${rule.level}</span>
                    <span class="grammar-section">Section ${rule.section}</span>
                  </div>
                  <h3 class="grammar-title">${rule.title}</h3>
                  <div class="grammar-nl-title">${rule.titleNl}</div>
                  <p class="grammar-summary">${rule.summary}</p>
                  <div class="grammar-card-footer">
                    <span>${rule.exercises ? rule.exercises.length : 3} exercises</span>
                    <span class="status-indicator">${isCompleted ? '✓ Completed' : 'Not started →'}</span>
                  </div>
                </button>
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
          <button class="btn btn-outline btn-sm" id="btn-back-grammar">← Back to grammar overview</button>

          <div class="card grammar-lesson-card" style="margin-top: 1.5rem;">
            <div class="lesson-header">
              <span class="grammar-level badge-${rule.level.toLowerCase()}">${rule.level}</span>
              <h1 class="lesson-title">${rule.title}</h1>
              <div class="lesson-nl-title">${rule.titleNl}</div>
            </div>

            <div class="lesson-summary-box">
              <h3>Summary</h3>
              <p>${rule.summary}</p>
            </div>

            <div class="lesson-rules-section">
              <h3>Grammar rules</h3>
              <ul class="rules-bullet-list">
                ${(rule.rules || []).map((r) => `<li>${r}</li>`).join("")}
              </ul>
            </div>

            <div class="lesson-structure-box">
              <h3>Structural sentence pattern (syntax)</h3>
              <div class="syntax-formula">${rule.structuralBreakdown || "[Subject] + [Finite verb (V2)] + [Time/Manner/Place] + [Verb cluster]"}</div>
            </div>

            <div class="lesson-examples-section">
              <h3>Authentic examples</h3>
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
              <h3>⚠️ Common mistake</h3>
              <div class="mistake-wrong">✗ ${rule.commonMistake || "Incorrect word order."}</div>
              <div class="mistake-correct">✓ ${rule.correction || "Use the standard word order."}</div>
            </div>

            <!-- Interactive Exercise Runner with Multi-Exercise Stepper -->
            <div class="exercise-runner-box" id="grammar-exercise-runner">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0;">Interactive exercise (${this.activeGrammarExIndex + 1}/${exercises.length})</h3>
                <div class="exercise-stepper-btns">
                  <button class="btn btn-sm btn-outline" id="btn-prev-grammar-ex" ${this.activeGrammarExIndex === 0 ? 'disabled' : ''}>← Previous</button>
                  <button class="btn btn-sm btn-outline" id="btn-next-grammar-ex" ${this.activeGrammarExIndex >= exercises.length - 1 ? 'disabled' : ''}>Next →</button>
                </div>
              </div>

              ${allDone ? `
                <div class="card session-complete-card animate-fade" style="margin-top: 1rem; text-align: center;">
                  <div class="complete-icon">🌟</div>
                  <h3>All exercises for this rule are complete!</h3>
                  <p>Progress saved.</p>
                </div>
              ` : ""}

              ${this.renderGrammarExercise(currentEx)}
            </div>
          </div>
        </div>
      `;
    }

    renderGrammarExercise(ex) {
      if (!ex) return "<p>No exercises available.</p>";
      const answeredState = this.activeGrammarAnswers[this.activeGrammarExIndex];

      switch (ex.type) {
        case "multiple_choice":
          return `
            <div class="exercise-mc animate-fade">
              <p class="exercise-question">${ex.question}</p>
              <div class="options-grid">
                ${(ex.options || []).map((opt, i) => {
                  const isSelected = Boolean(answeredState && answeredState.userAttempt === i);
                  return `
                    <button type="button" class="btn btn-outline btn-grammar-opt ${isSelected ? (answeredState.isCorrect ? 'btn-success' : 'btn-wrong') : ''}" data-opt-idx="${i}" ${answeredState ? 'disabled' : ''} aria-pressed="${isSelected ? 'true' : 'false'}">
                      ${opt}
                    </button>
                  `;
                }).join("")}
              </div>
              <div id="grammar-ex-feedback" class="exercise-feedback ${answeredState ? (answeredState.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${answeredState ? 'display: block;' : 'display: none;'}" role="alert">
                ${answeredState ? (answeredState.isCorrect ? `✓ Excellent! ${ex.explanation}` : `✗ Not quite. ${ex.explanation}`) : ''}
              </div>
            </div>
          `;
        case "word_order":
        case "token_reconstruction":
          return `
            <div class="exercise-token-order animate-fade">
              <p class="exercise-question">Put the words in the correct order:</p>
              <div class="exercise-translation">“${ex.translation || ex.sentence || ''}”</div>
              
              <div class="tokens-assembled-box" id="tokens-placed-zone" role="region" aria-label="Assembled sentence">
                ${this.tokenReconstructionPlaced.map((p, idx) => `
                  <button type="button" class="chip-token chip-placed" data-placed-idx="${idx}" aria-label="Remove '${p.text}' from position ${idx + 1}">${p.text} ✕</button>
                `).join("")}
              </div>

              <div class="tokens-pool" id="tokens-pool-zone" role="region" aria-label="Available words">
                ${(ex.tokens || []).map((token, idx) => {
                  const isUsed = this.tokenReconstructionPlaced.some((p) => p.poolIndex === idx);
                  return `<button type="button" class="chip-token ${isUsed ? 'token-used' : ''}" data-pool-idx="${idx}" aria-label="Add '${token}'" aria-disabled="${isUsed || answeredState ? 'true' : 'false'}" ${isUsed || answeredState ? 'disabled' : ''}>${token}</button>`;
                }).join("")}
              </div>

              <button type="button" class="btn btn-primary" id="btn-check-tokens" style="margin-top: 1rem;" ${answeredState ? 'disabled' : ''}>Check word order</button>
              <div id="grammar-ex-feedback" class="exercise-feedback ${answeredState ? (answeredState.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${answeredState ? 'display: block;' : 'display: none;'}" role="alert">
                ${answeredState ? (answeredState.isCorrect ? `✓ Perfect word order!` : `✗ Not quite. Correct order: “${ex.correctSentence}”`) : ''}
              </div>
            </div>
          `;
        case "fill_in_the_blank": {
          // Option-style exercises offer the blankWord among hint chips; tip-style
          // exercises carry hints as study tips only, so a typed input is required.
          const isOptionStyle =
            Array.isArray(ex.hints) &&
            ex.hints.some((h) => Learning.normalizeAnswer(h) === Learning.normalizeAnswer(ex.blankWord));
          const hintTips = Array.isArray(ex.hints) ? ex.hints : [];
          return `
            <div class="exercise-fill animate-fade">
              <p class="exercise-question">${ex.prompt || "Fill in the correct word:"}</p>
              <div class="exercise-sentence" style="font-size: 1.2rem; font-weight: 700; margin: 1rem 0;">${ex.sentenceWithBlank}</div>
              ${isOptionStyle ? `
                <div class="hint-chips-pool" role="group" aria-label="Word options">
                  ${hintTips.map((h) => {
                    const isSelected = Boolean(answeredState && answeredState.userAttempt === h);
                    return `
                      <button type="button" class="chip-token btn-hint-opt ${isSelected ? (answeredState.isCorrect ? 'btn-success' : 'btn-wrong') : ''}" data-hint="${h}" ${answeredState ? 'disabled' : ''} aria-pressed="${isSelected ? 'true' : 'false'}">
                        ${h}
                      </button>
                    `;
                  }).join("")}
                </div>
              ` : `
                <form id="form-grammar-fill" style="margin-top: 1rem;">
                  <label for="input-grammar-fill" class="sr-only">Word to fill in</label>
                  <input type="text" id="input-grammar-fill" class="form-input" placeholder="Type the correct word..." autocomplete="off" ${answeredState ? 'disabled' : ''} />
                  ${hintTips.length > 0 ? `<div class="hint-tips" style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Tip: ${hintTips.join(" ")}</div>` : ""}
                  <button type="submit" class="btn btn-primary" style="margin-top: 0.75rem;" ${answeredState ? 'disabled' : ''}>Check answer</button>
                </form>
              `}
              <div id="grammar-ex-feedback" class="exercise-feedback ${answeredState ? (answeredState.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${answeredState ? 'display: block;' : 'display: none;'}" role="alert">
                ${answeredState ? (answeredState.isCorrect ? `✓ Filled in correctly!` : `✗ Not quite. The correct word was: <strong>${ex.blankWord}</strong>`) : ''}
              </div>
            </div>
          `;
        }
        case "typed_conjugation":
          return `
            <div class="exercise-typed-conj animate-fade">
              <p class="exercise-question">Conjugate the verb '<strong>${ex.infinitive}</strong>' for '<strong>${ex.subject}</strong>' (${ex.targetTense}):</p>
              <form id="form-grammar-conj" style="margin-top: 1rem;">
                <label for="input-grammar-conj" class="sr-only">Grammar conjugation</label>
                <input type="text" id="input-grammar-conj" class="form-input" placeholder="Type the correct conjugation..." autocomplete="off" ${answeredState ? 'disabled' : ''} />
                <button type="submit" class="btn btn-primary" style="margin-top: 0.75rem;" ${answeredState ? 'disabled' : ''}>Check conjugation</button>
              </form>
              <div id="grammar-ex-feedback" class="exercise-feedback ${answeredState ? (answeredState.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${answeredState ? 'display: block;' : 'display: none;'}" role="alert">
                ${answeredState ? (answeredState.isCorrect ? `✓ Excellent conjugation! ${ex.explanation}` : `✗ Not quite. The correct form is '<strong>${ex.correctForm}</strong>'. ${ex.explanation}`) : ''}
              </div>
            </div>
          `;
        case "sentence_transformation":
          return `
            <div class="exercise-transform animate-fade">
              <p class="exercise-question">${ex.instruction || "Rewrite the sentence:"}</p>
              <div class="original-sentence-box" style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-sm); margin: 0.75rem 0;">
                “${ex.original}”
              </div>
              <form id="form-grammar-transform" style="margin-top: 1rem;">
                <label for="input-grammar-transform" class="sr-only">Transformed sentence</label>
                <input type="text" id="input-grammar-transform" class="form-input" placeholder="Type the transformed sentence..." autocomplete="off" ${answeredState ? 'disabled' : ''} />
                <button type="submit" class="btn btn-primary" style="margin-top: 0.75rem;" ${answeredState ? 'disabled' : ''}>Check transformation</button>
              </form>
              <div id="grammar-ex-feedback" class="exercise-feedback ${answeredState ? (answeredState.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${answeredState ? 'display: block;' : 'display: none;'}" role="alert">
                ${answeredState ? (answeredState.isCorrect ? `✓ Perfect transformation!` : `✗ Not quite. Model sentence: “<strong>${ex.transformed}</strong>”`) : ''}
              </div>
            </div>
          `;
        case "error_correction":
          return `
            <div class="exercise-error-corr animate-fade">
              <p class="exercise-question">Find the mistake in the sentence and correct it:</p>
              <div class="original-sentence-box" style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-sm); margin: 0.75rem 0;">
                “${ex.sentenceWithError}”
              </div>
              <form id="form-grammar-error" style="margin-top: 1rem;">
                <label for="input-grammar-error" class="sr-only">Corrected sentence</label>
                <input type="text" id="input-grammar-error" class="form-input" placeholder="Type the corrected sentence..." autocomplete="off" ${answeredState ? 'disabled' : ''} />
                <button type="submit" class="btn btn-primary" style="margin-top: 0.75rem;" ${answeredState ? 'disabled' : ''}>Check correction</button>
              </form>
              <div id="grammar-ex-feedback" class="exercise-feedback ${answeredState ? (answeredState.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${answeredState ? 'display: block;' : 'display: none;'}" role="alert">
                ${answeredState ? (answeredState.isCorrect ? `✓ Corrected perfectly! ${ex.explanation}` : `✗ Not quite. Correct sentence: “<strong>${ex.correctedSentence}</strong>”. ${ex.explanation}`) : ''}
              </div>
            </div>
          `;
        case "article_selection":
          return `
            <div class="exercise-article-select animate-fade">
              <p class="exercise-question">Choose the correct article for: <strong>${ex.noun}</strong> <em>(${ex.meaning})</em></p>
              <div class="options-grid" style="grid-template-columns: 1fr 1fr; margin-top: 1rem;">
                <button type="button" class="btn btn-drill btn-de btn-grammar-art ${answeredState && answeredState.userAttempt === 'de' ? (answeredState.isCorrect ? 'btn-success' : 'btn-wrong') : ''}" data-art="de" ${answeredState ? 'disabled' : ''} aria-pressed="${Boolean(answeredState && answeredState.userAttempt === 'de') ? 'true' : 'false'}">de</button>
                <button type="button" class="btn btn-drill btn-het btn-grammar-art ${answeredState && answeredState.userAttempt === 'het' ? (answeredState.isCorrect ? 'btn-success' : 'btn-wrong') : ''}" data-art="het" ${answeredState ? 'disabled' : ''} aria-pressed="${Boolean(answeredState && answeredState.userAttempt === 'het') ? 'true' : 'false'}">het</button>
              </div>
              <div id="grammar-ex-feedback" class="exercise-feedback ${answeredState ? (answeredState.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}" style="${answeredState ? 'display: block;' : 'display: none;'}" role="alert">
                ${answeredState ? (answeredState.isCorrect ? `✓ Correct! It is <strong>${ex.correct} ${ex.noun}</strong>. ${ex.explanation || ''}` : `✗ Not quite. It is <strong>${ex.correct} ${ex.noun}</strong>. ${ex.explanation || ''}`) : ''}
              </div>
            </div>
          `;
        default:
          return `
            <div class="exercise-default animate-fade">
              <p class="exercise-question">${ex.question || ex.prompt || "Answer the question:"}</p>
              <button type="button" class="btn btn-primary" id="btn-complete-simple-ex" ${answeredState ? 'disabled' : ''}>Got it · Finish ✓</button>
            </div>
          `;
      }
    }

    recordGrammarExerciseAnswer(isCorrect, userAttempt) {
      if (!this.activeGrammarRule) return;
      if (this.activeGrammarAnswers[this.activeGrammarExIndex]) return; // Already recorded

      this.activeGrammarAnswers[this.activeGrammarExIndex] = { isCorrect, userAttempt };
      const exercises = this.activeGrammarRule.exercises || [];

      if (isCorrect) {
        this.announce("Correct!");
      } else {
        this.announce("Not quite.");
      }

      // Check if all exercises completed
      if (Object.keys(this.activeGrammarAnswers).length === exercises.length) {
        const numCorrect = Object.values(this.activeGrammarAnswers).filter((a) => a.isCorrect).length;
        const score = Math.round((numCorrect / exercises.length) * 100);
        this.store.completeGrammarRule(this.activeGrammarRule.id, score);
        this.announce(`All exercises for this rule are complete! Score: ${score}%.`);
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
            this.scrollToTop();
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
            this.scrollToTop();
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

      // Word Order Pool Tokens (supports duplicate tokens via unique pool indices and keyboard operability)
      document.querySelectorAll(".chip-token:not(.chip-placed)").forEach((btn) => {
        btn.addEventListener("click", () => {
          const poolIdx = parseInt(btn.dataset.poolIdx, 10);
          const exercises = this.activeGrammarRule ? this.activeGrammarRule.exercises || [] : [];
          const currentEx = exercises[this.activeGrammarExIndex];
          if (!isNaN(poolIdx) && currentEx && currentEx.tokens && currentEx.tokens[poolIdx]) {
            const alreadyPlaced = this.tokenReconstructionPlaced.some((p) => p.poolIndex === poolIdx);
            if (!alreadyPlaced) {
              const text = currentEx.tokens[poolIdx];
              this.tokenReconstructionPlaced.push({
                poolIndex: poolIdx,
                text
              });
              this.announce(`Added '${text}'.`);
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
            const removed = this.tokenReconstructionPlaced.splice(placedIdx, 1)[0];
            if (removed) {
              this.announce(`Removed '${removed.text}'.`);
            }
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

      const formFill = document.getElementById("form-grammar-fill");
      if (formFill) {
        formFill.addEventListener("submit", (e) => {
          e.preventDefault();
          const inp = document.getElementById("input-grammar-fill");
          const val = (inp ? inp.value : "").trim();
          const exercises = this.activeGrammarRule.exercises || [];
          const currentEx = exercises[this.activeGrammarExIndex];
          const isCorrect = Learning.normalizeAnswer(val) === Learning.normalizeAnswer(currentEx.blankWord);
          this.recordGrammarExerciseAnswer(isCorrect, val);
        });
      }

      const completeSimpleBtn = document.getElementById("btn-complete-simple-ex");
      if (completeSimpleBtn) {
        completeSimpleBtn.addEventListener("click", () => {
          this.recordGrammarExerciseAnswer(true, "completed");
        });
      }

      const backBtn = document.getElementById("btn-back-grammar");
      if (backBtn) {
        backBtn.addEventListener("click", () => this.goBack());
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
      this.pendingGrammarRuleId = this.activeGrammarRule ? this.activeGrammarRule.id : null;
      this.hub = "learn";
      this.currentTab = "grammar";
      this.focusIntention = "heading";
      this.pushRoute();
      this.render();
      this.scrollToTop();
    }

    /* ==========================================================================
       5. COMPREHENSION VIEW (Progressive Passages & Quiz Runner)
       ========================================================================== */
    renderComprehensionView() {
      const passages = global.NP_COMPREHENSION || [];
      const availableLevels = [...new Set(passages.map((passage) => passage.level))];
      const selectedLevel = availableLevels.includes(this.selectedLevel) ? this.selectedLevel : "all";

      if (this.activePassage) {
        return this.renderPassageDetail(this.activePassage);
      }

      const filtered = selectedLevel === "all" ? passages : passages.filter((p) => p.level === selectedLevel);

      return `
        <div class="comprehension-catalog-container animate-fade">
          <div class="catalog-header">
            <div>
              <h1 class="page-title">Reading (${passages.length} texts)</h1>
              <p class="page-subtitle">Curated Dutch reading texts with vocabulary and comprehension questions.</p>
            </div>

            <div class="level-rail filter-pills" role="tablist" aria-label="CEFR levels">
              ${["all", ...availableLevels].map((lvl) => `
                <button type="button" class="level-chip btn btn-sm ${selectedLevel === lvl ? 'btn-primary active' : 'btn-outline'}" data-filter-comp-lvl="${lvl}">
                  ${lvl === 'all' ? 'All levels' : lvl}
                </button>
              `).join("")}
            </div>
          </div>

          <div class="passages-grid study-list">
            ${filtered.map((passage) => {
              const isCompleted = !!this.store.state.progress.comprehensionCompleted[passage.id];
              return `
                <button type="button" class="study-row catalog-card-button passage-item-card" data-passage-id="${passage.id}" aria-label="Open reading text: ${passage.title}">
                  <div class="passage-card-top">
                    <span class="grammar-level badge-${passage.level.toLowerCase()}">${passage.level}</span>
                    <span class="reading-time">⏱️ ${passage.readingTimeMin || 4} min</span>
                  </div>
                  <h3 class="passage-title">${passage.title}</h3>
                  <div class="passage-en-title">${passage.titleEn}</div>
                  <p class="passage-snippet">${passage.paragraphs[0]}</p>
                  <div class="passage-card-footer">
                    <span>${passage.questions ? passage.questions.length : 4} questions</span>
                    <span class="status-indicator">${isCompleted ? '✓ Read' : 'Start reading →'}</span>
                  </div>
                </button>
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
          <button class="btn btn-outline btn-sm" id="btn-back-comprehension">← Back to texts</button>

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
              <summary>📖 Show English translation</summary>
              <div class="translation-content">${passage.translation}</div>
            </details>

            ${passage.keyVocabulary && passage.keyVocabulary.length > 0 ? `
              <div class="passage-vocab-box">
                <h3>Key words from the text</h3>
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
                <h3 style="margin: 0;">Comprehension questions (${answeredCount}/${totalQuestions})</h3>
                ${allAnswered ? `
                  <span class="status-indicator">Score: <strong>${pctScore}%</strong> (${numCorrect}/${totalQuestions} correct)</span>
                ` : ""}
              </div>

              ${allAnswered ? `
                <div class="card session-complete-card animate-fade" style="margin-bottom: 1.5rem; text-align: center;">
                  <div class="complete-icon">🎉</div>
                  <h3>Text and quiz complete!</h3>
                  <p>You answered <strong>${numCorrect} of ${totalQuestions}</strong> questions correctly (${pctScore}%).</p>
                </div>
              ` : ""}

              ${(passage.questions || []).map((q, qIdx) => {
                const ans = this.activePassageAnswers[qIdx];
                return `
                  <div class="quiz-question-card" data-q-idx="${qIdx}">
                    <p class="q-title"><strong>Question ${qIdx + 1}:</strong> ${q.question}</p>
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
                      ${ans ? (ans.isCorrect ? `✓ Correct! ${q.explanation}` : `✗ Not quite. ${q.explanation}`) : ''}
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
        backBtn.addEventListener("click", () => this.goBack());
      }

      document.querySelectorAll(".passage-item-card").forEach((card) => {
        card.addEventListener("click", () => {
          const passageId = card.dataset.passageId;
          const passages = global.NP_COMPREHENSION || [];
          this.activePassage = passages.find((p) => p.id === passageId) || passages[0];
          this.activePassageAnswers = {};
          this.pendingPassageId = this.activePassage ? this.activePassage.id : null;
          this.focusIntention = "heading";
          this.pushRoute();
          this.render();
          this.scrollToTop();
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
            this.announce(`Reading quiz complete! Score: ${score}%.`);
          } else {
            this.store.recordActivity(isCorrect ? 5 : 1);
            this.announce(isCorrect ? `Question ${qIdx + 1}: Correct!` : `Question ${qIdx + 1}: Not quite.`);
          }

          this.render();
        });
      });
    }

    sanitizeLoadedWordReferences() {
      const words = global.NP_WORDS;
      if (!this._wordsSanitized && Array.isArray(words) && words.length > 0) {
        this.store.sanitizeStaleWordReferences(new Set(words.map((w) => w.id)));
        this._wordsSanitized = true;
      }
    }

    /* ==========================================================================
       6. WORDS VIEW (Dictionary & Search Engine)
       ========================================================================== */
    renderWordsView() {
      const words = global.NP_WORDS || [];

      const q = (this.searchQuery || "").toLowerCase().trim();
      const accentFold = (v) =>
        typeof v === "string" ? v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
      const qFolded = accentFold(q);
      const totalLearnableCount = words.filter((w) => w.learnable).length;

      let filtered = words;
      if (q) {
        filtered = filtered.filter((w) => {
          if (accentFold(w.word).includes(qFolded)) return true;
          if (w.displayWord && accentFold(w.displayWord).includes(qFolded)) return true;
          if (w.meaning && accentFold(w.meaning).includes(qFolded)) return true;
          if (w.lemma && accentFold(w.lemma).includes(qFolded)) return true;
          return false;
        });
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
      const filteredLearnableCount = filtered.filter((w) => w.learnable).length;

      return `
        <div class="words-container animate-fade">
          <div class="card words-search-card">
            <h1 class="page-title">Dutch dictionary (${words.length.toLocaleString("en-US")} forms)</h1>
            <p class="page-subtitle">Search ${words.length.toLocaleString("en-US")} Dutch word forms, including ${totalLearnableCount.toLocaleString("en-US")} curated learnable words and phrases with articles and inflections.</p>

            <div class="search-input-wrap">
              <label for="words-search-input" class="sr-only">Dictionary search</label>
              <input type="text" id="words-search-input" class="form-input search-input" placeholder="Search by Dutch word, article, or English meaning..." value="${Learning.escapeHTML(this.searchQuery)}" />
              ${this.searchQuery ? `<button type="button" class="btn-clear" id="btn-clear-search" aria-label="Clear search">✕</button>` : ""}
            </div>

            <div class="level-rail" role="tablist" aria-label="CEFR levels">
              ${["all", "A1", "A2", "B1", "B2", "C1"].map((lvl) => `
                <button type="button" class="level-chip ${this.selectedLevel === lvl ? "active" : ""}" data-rail-level="${lvl}">${lvl === "all" ? "All" : lvl}</button>
              `).join("")}
            </div>
            <div class="filter-row">
              <div class="filter-group">
                <label for="select-filter-level">Level:</label>
                <select id="select-filter-level" class="form-select">
                  <option value="all" ${this.selectedLevel === 'all' ? 'selected' : ''}>All levels</option>
                  <option value="A1" ${this.selectedLevel === 'A1' ? 'selected' : ''}>A1</option>
                  <option value="A2" ${this.selectedLevel === 'A2' ? 'selected' : ''}>A2</option>
                  <option value="B1" ${this.selectedLevel === 'B1' ? 'selected' : ''}>B1</option>
                  <option value="B2" ${this.selectedLevel === 'B2' ? 'selected' : ''}>B2</option>
                  <option value="C1" ${this.selectedLevel === 'C1' ? 'selected' : ''}>C1</option>
                </select>
              </div>

              <div class="filter-group">
                <label for="select-filter-pos">Part of speech:</label>
                <select id="select-filter-pos" class="form-select">
                  <option value="all" ${this.selectedPos === 'all' ? 'selected' : ''}>All types</option>
                  <option value="noun" ${this.selectedPos === 'noun' ? 'selected' : ''}>Noun (de/het)</option>
                  <option value="verb" ${this.selectedPos === 'verb' ? 'selected' : ''}>Verb</option>
                  <option value="adjective" ${this.selectedPos === 'adjective' ? 'selected' : ''}>Adjective</option>
                  <option value="numeral" ${this.selectedPos === 'numeral' ? 'selected' : ''}>Numeral</option>
                  <option value="phrase" ${this.selectedPos === 'phrase' ? 'selected' : ''}>Curated phrase</option>
                </select>
              </div>

              <div class="filter-group">
                <label for="select-filter-article">Article:</label>
                <select id="select-filter-article" class="form-select">
                  <option value="all" ${this.selectedArticle === 'all' ? 'selected' : ''}>All</option>
                  <option value="de" ${this.selectedArticle === 'de' ? 'selected' : ''}>de words</option>
                  <option value="het" ${this.selectedArticle === 'het' ? 'selected' : ''}>het words</option>
                </select>
              </div>

              <div class="filter-group">
                <label for="check-bookmarked">
                  <input type="checkbox" id="check-bookmarked" ${this.showOnlyBookmarked ? 'checked' : ''} /> ⭐ Favourites only
                </label>
              </div>
            </div>
          </div>

          <div class="words-results-meta">
            <span>Found: <strong>${filtered.length}</strong> word forms (${filteredLearnableCount} learnable) ${filtered.length > 60 ? "(showing first 60)" : ""}</span>
          </div>

          <div class="study-list words-results-grid">
            ${displayList.map((w) => {
              const isNoun = w.pos === "noun" && w.article;
              const isStarred = this.store.isBookmarked(w.id);
              const displayTitle = isNoun ? `<span class="badge-${Learning.escapeHTML(w.article)}">${Learning.escapeHTML(w.article)}</span> ${Learning.escapeHTML(w.word)}` : Learning.escapeHTML(w.word);

              const isPhrase = w.curated === true && w.pos === "phrase" && w.inflectionType === "phrase";
              const isLemma = w.isCuratedLemma === true;
              const badgeType = isPhrase ? `<span class="badge-tag badge-phrase">Curated phrase</span>` : (isLemma ? `<span class="badge-tag badge-lemma">Lemma</span>` : `<span class="badge-tag badge-reference">Derived form / reference</span>`);
              const hasLemmaLink = w.lemma && w.lemma.toLowerCase().trim() !== w.word.toLowerCase().trim();

              return `
                <article class="study-row word-item-card">
                  <div>
                    <div class="word-card-top">
                      <div class="word-card-badges">
                        <span class="word-level-badge badge-${Learning.escapeHTML(w.level.toLowerCase())}">${Learning.escapeHTML(w.level)}</span>
                        ${badgeType}
                      </div>
                      <button class="btn-star ${isStarred ? 'starred' : ''}" data-star-id="${Learning.escapeHTML(w.id)}" title="${isStarred ? 'Remove favourite' : 'Save favourite'}" aria-pressed="${isStarred ? 'true' : 'false'}" aria-label="Favourite">
                        ${isStarred ? '★' : '☆'}
                      </button>
                    </div>
                    <h3 class="word-title study-row-title long-compound">${displayTitle}</h3>
                    ${w.grammaticalForm ? `<span class="word-gram-form">${Learning.escapeHTML(w.grammaticalForm)}</span>` : ""}
                    ${hasLemmaLink ? `<div class="word-lemma-link">Base lemma: <strong>${Learning.escapeHTML(w.lemma)}</strong></div>` : ""}
                    <div class="word-meaning study-row-sub">${Learning.escapeHTML(w.meaning || w.word)}</div>
                    ${w.example ? `<div class="word-example">“${Learning.escapeHTML(w.example)}”</div>` : ""}
                    <div class="word-footer">
                      <span>${Learning.escapeHTML(w.pos)}</span>
                      <span>#${Learning.escapeHTML(String(w.rank))}</span>
                    </div>
                  </div>
                </article>
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
      document.querySelectorAll("[data-rail-level]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.selectedLevel = btn.dataset.railLevel;
          this.render();
        });
      });

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

    renderExamView() {
      const availability = global.NederExamIntegrity && typeof global.NederExamIntegrity.examAvailability === "function"
        ? global.NederExamIntegrity.examAvailability()
        : { enabled: false, reason: "Exam integrity module unavailable.", certificationClaims: false };
      return `
        <div class="exam-hub">
          <p class="eyebrow">Exam</p>
          <h1 class="page-title">Formal tests</h1>
          <div class="card exam-incomplete">
            <p>${Learning.escapeHTML(availability.reason)}</p>
            <p>Practice taint can never count as a formal result. Results are immutable once a bank exists.</p>
            <p>NederPath ${availability.certificationClaims ? "makes" : "makes no"} certification claims and does not invent exam questions.</p>
            <p>Use <strong>Review</strong> for practice.</p>
          </div>
        </div>
      `;
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
              <h1 class="page-title">Progress & statistics</h1>
              <p class="page-subtitle">A detailed view of your learning curve, mastered words, and streak.</p>
            </div>
            <button class="btn btn-outline btn-sm" id="btn-open-settings">⚙️ Settings & data</button>
          </div>

          <div class="progress-stats-overview stats-grid">
            <div class="card stat-big-card">
              <span class="stat-big-icon">🔥</span>
              <div class="stat-big-num">${user.streak}</div>
              <div class="stat-big-lbl">Streak</div>
            </div>
            <div class="card stat-big-card">
              <span class="stat-big-icon">🏆</span>
              <div class="stat-big-num">${user.totalXp}</div>
              <div class="stat-big-lbl">Total XP</div>
            </div>
            <div class="card stat-big-card">
              <span class="stat-big-icon">🧠</span>
              <div class="stat-big-num">${deckStats.mastered}</div>
              <div class="stat-big-lbl">Mastered words</div>
            </div>
            <div class="card stat-big-card">
              <span class="stat-big-icon">⚡</span>
              <div class="stat-big-num">${artAcc}%</div>
              <div class="stat-big-lbl">Article accuracy</div>
            </div>
          </div>

          <div class="progress-grid">
            <div class="card">
              <h3>30-day activity</h3>
              <p style="font-size: 0.88rem; color: var(--text-secondary);">Each block represents your daily practice intensity.</p>
              <div class="heatmap-grid">
                ${days.map((d) => {
                  const level = d.count === 0 ? 'heat-0' : d.count < 5 ? 'heat-1' : d.count < 15 ? 'heat-2' : 'heat-3';
                  return `<div class="heatmap-cell ${level}" title="${d.iso}: ${d.count} items"></div>`;
                }).join("")}
              </div>
            </div>

            <div class="card">
              <h3>Spaced repetition (SRS) status</h3>
              <ul class="srs-stats-list" style="margin-top: 1rem; list-style: none;">
                <li style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <span>Due today:</span> <strong>${deckStats.due}</strong>
                </li>
                <li style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <span>In learning:</span> <strong>${deckStats.learning}</strong>
                </li>
                <li style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <span>Total active cards:</span> <strong>${deckStats.total}</strong>
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
              <h1 class="page-title">Settings & backup</h1>
              <p class="page-subtitle">Manage your goals, theme, and export or import your progress.</p>
            </div>
          </div>

          <div id="settings-status-banner" class="status-banner" style="display: none;" role="status" aria-live="polite"></div>

          <div class="card settings-card" style="margin-bottom: 1.5rem;">
            <h3>Appearance</h3>
            <div class="setting-row" style="margin-top: 1rem;">
              <span id="label-appearance">Display:</span>
              <div class="theme-select-pills" role="group" aria-labelledby="label-appearance">
                <button type="button" class="btn btn-sm ${(settings.appearance || settings.theme) === 'dark' ? 'btn-primary' : 'btn-outline'}" id="btn-theme-dark">Dark</button>
                <button type="button" class="btn btn-sm ${(settings.appearance || settings.theme) === 'light' ? 'btn-primary' : 'btn-outline'}" id="btn-theme-light">Light</button>
                <button type="button" class="btn btn-sm ${settings.appearance === 'system' ? 'btn-primary' : 'btn-outline'}" id="btn-theme-system">System</button>
              </div>
            </div>
            <div class="setting-row" style="margin-top: 1rem;">
              <span id="label-accent">Accent:</span>
              <div class="accent-pills" role="group" aria-labelledby="label-accent">
                ${["violet", "graphite", "blue", "red", "yellow", "green", "orange", "gold"].map((id) => `
                  <button type="button" class="btn btn-sm ${(settings.accent || "violet") === id ? "btn-primary" : "btn-outline"}" data-accent="${id}">${id}</button>
                `).join("")}
              </div>
            </div>
            <div class="setting-row" style="margin-top: 1rem;">
              <label for="check-reduce-motion">
                <input type="checkbox" id="check-reduce-motion" ${settings.reduceMotion ? "checked" : ""} /> Reduce motion
              </label>
            </div>
          </div>

          <div class="card settings-card" style="margin-bottom: 1.5rem;">
            <h3>Goals & Sessions</h3>
            <div class="setting-row" style="margin-top: 1rem;">
              <label for="select-daily-goal">Daily goal (items per day):</label>
              <select id="select-daily-goal" class="form-select" style="max-width: 200px;">
                <option value="10" ${settings.dailyGoal === 10 ? 'selected' : ''}>10 items</option>
                <option value="15" ${settings.dailyGoal === 15 ? 'selected' : ''}>15 items (Recommended)</option>
                <option value="25" ${settings.dailyGoal === 25 ? 'selected' : ''}>25 items</option>
                <option value="50" ${settings.dailyGoal === 50 ? 'selected' : ''}>50 items</option>
              </select>
            </div>

            <div class="setting-row" style="margin-top: 1rem;">
              <label for="select-session-size">Cards per practice session:</label>
              <select id="select-session-size" class="form-select" style="max-width: 200px;">
                <option value="5" ${settings.sessionSize === 5 ? 'selected' : ''}>5 cards</option>
                <option value="10" ${settings.sessionSize === 10 ? 'selected' : ''}>10 cards</option>
                <option value="15" ${settings.sessionSize === 15 ? 'selected' : ''}>15 cards</option>
                <option value="20" ${settings.sessionSize === 20 ? 'selected' : ''}>20 cards</option>
              </select>
            </div>
          </div>

          <div class="card settings-card" style="margin-bottom: 1.5rem;">
            <h3>Data & backup</h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1rem;">
              All progress is stored locally in your browser under the <code>nederpath-v1</code> namespace.
            </p>
            <div class="backup-actions-row" style="display: flex; gap: 1rem;">
              <button type="button" class="btn btn-secondary" id="btn-export-json">💾 Export progress (JSON)</button>
              <label class="btn btn-outline" style="cursor: pointer;">
                📂 Import backup (JSON)
                <input type="file" id="file-import-json" accept=".json" style="display: none;" />
              </label>
            </div>
          </div>

          <div class="card settings-card danger-card" style="border-color: rgba(239, 68, 68, 0.4);">
            <h3 style="color: var(--color-danger);">Danger zone</h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1rem;">
              Erase all locally stored progress, SRS history, and statistics.
            </p>
            <button type="button" class="btn btn-danger" id="btn-reset-all">⚠️ Reset all progress</button>
          </div>
        </div>
      `;
    }

    attachSettingsListeners() {
      const setAppearance = (appearance) => {
        this.store.state.settings.appearance = appearance;
        this.store.state.settings.theme = appearance === "light" ? "light" : "dark";
        this.store.save();
        this.applyTheme();
        this.showInlineStatus(appearance === "light" ? "Theme set to Light." : appearance === "dark" ? "Theme set to Dark." : "Display follows the system.", "success");
        this.render();
      };
      const darkBtn = document.getElementById("btn-theme-dark");
      if (darkBtn) darkBtn.addEventListener("click", () => setAppearance("dark"));
      const lightBtn = document.getElementById("btn-theme-light");
      if (lightBtn) lightBtn.addEventListener("click", () => setAppearance("light"));
      const systemBtn = document.getElementById("btn-theme-system");
      if (systemBtn) systemBtn.addEventListener("click", () => setAppearance("system"));
      document.querySelectorAll("[data-accent]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.store.state.settings.accent = btn.dataset.accent;
          this.store.save();
          this.applyTheme();
          this.render();
        });
      });
      const reduceMotion = document.getElementById("check-reduce-motion");
      if (reduceMotion) {
        reduceMotion.addEventListener("change", () => {
          this.store.state.settings.reduceMotion = reduceMotion.checked;
          this.store.save();
          this.applyTheme();
        });
      }

      const goalSelect = document.getElementById("select-daily-goal");
      if (goalSelect) {
        goalSelect.addEventListener("change", (e) => {
          this.store.state.settings.dailyGoal = parseInt(e.target.value, 10);
          this.store.save();
          this.showInlineStatus("Daily goal updated.", "success");
        });
      }

      const sessionSelect = document.getElementById("select-session-size");
      if (sessionSelect) {
        sessionSelect.addEventListener("change", (e) => {
          this.store.state.settings.sessionSize = parseInt(e.target.value, 10);
          this.store.save();
          this.showInlineStatus("Session size updated.", "success");
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
          this.showInlineStatus("Backup file generated and downloaded.", "success");
        });
      }

      const importInput = document.getElementById("file-import-json");
      if (importInput) {
        importInput.addEventListener("change", (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;

          const MAX_BACKUP_SIZE = 5 * 1024 * 1024; // 5 MB limit
          if (file.size > MAX_BACKUP_SIZE) {
            this.showInlineStatus("File is too large (maximum 5 MB allowed).", "error");
            return;
          }

          const reader = new FileReader();
          reader.onload = (evt) => {
            const success = this.store.importJSON(evt.target.result);
            if (success) {
              this.showInlineStatus("Progress imported successfully!", "success");
              this.render();
            } else {
              this.showInlineStatus("Import failed: invalid or damaged JSON format.", "error");
            }
          };
          reader.onerror = () => {
            this.showInlineStatus("Could not read the file.", "error");
          };
          reader.readAsText(file);
        });
      }

      const resetBtn = document.getElementById("btn-reset-all");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          if (confirm("Are you sure you want to erase all progress? This cannot be undone.")) {
            this.store.resetAllData();
            this.showInlineStatus("All progress and settings have been erased.", "info");
            this.switchTab("today");
          }
        });
      }
    }
  }

  // Initialize App on DOM Ready or immediately if already loaded
  function bootApp() {
    const skipLink = document.querySelector(".skip-link");
    if (skipLink) {
      skipLink.addEventListener("click", () => {
        const main = document.getElementById("app-main");
        if (main) main.focus();
      });
    }
    if (!global.NederApp) {
      global.NederApp = new NederPathApp();
    }
  }

  if (typeof window !== "undefined") {
    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", bootApp);
    } else {
      bootApp();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
