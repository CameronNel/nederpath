/* NederPath staged Learn UI layer.
 * Reuses the shared component system already present in css/styles.css.
 * Keeps the existing screen/controller listeners intact while removing the
 * daily dashboard and presenting lesson catalogs as staged menus.
 */
(function () {
  "use strict";

  const SUBJECT_TABS = new Set(["grammar", "words", "comprehension"]);
  const ICONS = {
    grammar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="m8 12 2.2 2.2L16 8.5"/></svg>',
    vocabulary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4.5h6.5A2.5 2.5 0 0 1 14 7v13H7a2 2 0 0 1-2-2V4.5Zm14 0h-5M19 4.5V18a2 2 0 0 0-2-2h-3"/></svg>',
    comprehension: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5h14v10H9l-4 4V5Z"/><path d="M8 9h8M8 12h5"/></svg>'
  };

  const HOME_ITEMS = [
    { tab: "grammar", icon: ICONS.grammar, title: "Grammar", sub: "Lessons, explanations, and exercises in a clear order." },
    { tab: "words", icon: ICONS.vocabulary, title: "Vocabulary", sub: "Learn words, look them up, and practise with focus." },
    { tab: "comprehension", icon: ICONS.comprehension, title: "Reading", sub: "Curated texts with comprehension practice at each level." }
  ];

  function text(node) {
    return node ? node.textContent.trim() : "";
  }

  function makeHeader(eyebrow, title, sub) {
    const header = document.createElement("div");
    header.className = "hub-header";
    header.innerHTML = `
      <div class="eyebrow">${eyebrow}</div>
      <h2 class="screen-title" style="margin-bottom:6px;">${title}</h2>
      <div class="screen-sub" style="margin-bottom:0;">${sub}</div>
    `;
    return header;
  }

  function isolateSubjectLevelState() {
    const app = window.NederApp;
    if (!app || app.__subjectLevelIsolationInstalled || typeof app.openLearnItem !== "function") return;

    const originalOpenLearnItem = app.openLearnItem;
    app.openLearnItem = function (tab, options) {
      if (SUBJECT_TABS.has(tab) && this.currentTab !== tab) {
        this.selectedLevel = "all";
      }
      return originalOpenLearnItem.call(this, tab, options);
    };
    app.__subjectLevelIsolationInstalled = true;
  }

  function transformHome() {
    const home = document.querySelector("#screen-today .today-home");
    if (!home || home.dataset.uiStage === "home") return;

    const oldList = home.querySelector(".hub-list");
    if (!oldList) return;

    const keptButtons = HOME_ITEMS.map((item) => {
      const button = oldList.querySelector(`[data-learn-tab="${item.tab}"]`);
      if (!button) return null;
      button.className = "hub-tile";
      button.removeAttribute("aria-pressed");
      button.innerHTML = `
        <span class="hub-tile-icon">${item.icon}</span>
        <span class="hub-tile-text">
          <strong>${item.title}</strong>
          <small>${item.sub}</small>
        </span>
        <span class="hub-tile-go" aria-hidden="true">›</span>
      `;
      return button;
    }).filter(Boolean);

    if (!keptButtons.length) return;

    const tiles = document.createElement("div");
    tiles.className = "hub-tiles";
    keptButtons.forEach((button) => tiles.appendChild(button));

    home.replaceChildren(
      makeHeader("Study & practice", "What do you want to work on?", "Pick one path. Practice sits inside each subject."),
      tiles
    );
    home.className = "staged-learn-home";
    home.dataset.uiStage = "home";
  }

  function grammarLevelDescription(level) {
    const descriptions = {
      A1: "Basic sentences, verbs, articles, and simple word order.",
      A2: "More tenses, connectors, and everyday grammar patterns.",
      B1: "More independent wording with longer, more complex sentences.",
      B2: "Nuance, precision, and advanced sentence building.",
      C1: "Fine meaning differences and complex grammatical choices."
    };
    return descriptions[level] || "Grammar lessons at this level.";
  }

  function transformGrammarCatalog() {
    const catalog = document.querySelector("#screen-grammar .grammar-catalog-container");
    if (!catalog || catalog.dataset.uiStage === "grammar") return;

    const filterRail = catalog.querySelector(".level-rail");
    const rulesGrid = catalog.querySelector(".grammar-rules-grid");
    const header = catalog.querySelector(".catalog-header");
    if (!filterRail || !rulesGrid || !header) return;

    const filterButtons = [...filterRail.querySelectorAll("[data-filter-lvl]")];
    const activeButton = filterButtons.find((button) => button.classList.contains("active"));
    const activeLevel = activeButton?.dataset.filterLvl || "all";

    if (activeLevel === "all") {
      const levels = ["A1", "A2", "B1", "B2", "C1"];
      const bank = Array.isArray(window.NP_GRAMMAR) ? window.NP_GRAMMAR : [];
      const levelButtons = levels.map((level) => {
        const button = filterButtons.find((candidate) => candidate.dataset.filterLvl === level);
        if (!button) return null;
        const total = bank.filter((rule) => rule.level === level).length;
        button.className = "study-row stage-row current";
        button.innerHTML = `
          <span class="unit-dot next">${level}</span>
          <div>
            <div class="study-row-ko">${level} · Grammar</div>
            <div class="study-row-sub">${grammarLevelDescription(level)}</div>
          </div>
          <span class="pill muted">${total} lessons</span>
        `;
        return button;
      }).filter(Boolean);

      const stageCard = document.createElement("div");
      stageCard.className = "card";
      stageCard.innerHTML = `
        <div class="flex-between mb-12">
          <div>
            <div class="eyebrow">Levels</div>
            <div class="screen-sub" style="margin-bottom:0;">Open one level and work through the lessons in order.</div>
          </div>
          <span class="pill accent" style="white-space:nowrap;">${levelButtons.length} levels</span>
        </div>
      `;
      const list = document.createElement("div");
      list.className = "study-list";
      levelButtons.forEach((button) => list.appendChild(button));
      stageCard.appendChild(list);

      catalog.replaceChildren(
        makeHeader("Grammar", "Choose a level", "Choose your level first, then one lesson."),
        stageCard
      );
    } else {
      const allButton = filterButtons.find((button) => button.dataset.filterLvl === "all");
      if (allButton) {
        allButton.className = "button secondary compact";
        allButton.style.marginTop = "18px";
        allButton.textContent = "‹ All levels";
      }

      const ruleButtons = [...rulesGrid.querySelectorAll(".grammar-item-card")];
      ruleButtons.forEach((button, index) => {
        const title = text(button.querySelector(".grammar-title"));
        const nlTitle = text(button.querySelector(".grammar-nl-title"));
        const summary = text(button.querySelector(".grammar-summary"));
        const section = text(button.querySelector(".grammar-section"));
        const status = text(button.querySelector(".status-indicator"));
        const complete = /voltooid|completed|✓/i.test(status);
        const number = String(index + 1).padStart(2, "0");
        button.className = `study-row stage-row ${complete ? "complete" : "current"}`;
        button.innerHTML = `
          <span class="unit-dot ${complete ? "done" : "next"}">${complete ? "✓" : number}</span>
          <div>
            <div class="study-row-ko">${title}</div>
            <div class="study-row-sub">${[section, nlTitle, summary].filter(Boolean).join(" · ")}</div>
          </div>
          <span class="pill ${complete ? "green" : "muted"}">${complete ? "Completed" : `Lesson ${number}`}</span>
        `;
      });
      rulesGrid.className = "study-list";

      const lessonsCard = document.createElement("div");
      lessonsCard.className = "card";
      const meta = document.createElement("div");
      meta.className = "flex-between mb-12";
      meta.innerHTML = `
        <div>
          <div class="eyebrow">${activeLevel} grammar</div>
          <div class="screen-sub" style="margin-bottom:0;">Pick one lesson. Progress is saved per lesson.</div>
        </div>
        <span class="pill accent" style="white-space:nowrap;">${ruleButtons.length} lessons</span>
      `;
      lessonsCard.append(meta, rulesGrid);

      const cleanHeader = makeHeader("Grammar", `${activeLevel} · Choose a lesson`, "Work through the lessons in a clear order.");
      if (allButton) cleanHeader.appendChild(allButton);
      catalog.replaceChildren(cleanHeader, lessonsCard);
    }

    catalog.dataset.uiStage = "grammar";
  }

  function comprehensionLevelDescription(level) {
    const descriptions = {
      A1: "Short, concrete texts in familiar everyday language.",
      A2: "Simple stories, notices, and practical texts.",
      B1: "Longer texts with more context and implied information.",
      B2: "More complex arguments, style, and nuanced meaning.",
      C1: "Dense, natural texts with advanced vocabulary."
    };
    return descriptions[level] || "Reading texts at this level.";
  }

  function transformComprehensionCatalog() {
    const catalog = document.querySelector("#screen-comprehension .comprehension-catalog-container");
    if (!catalog || catalog.dataset.uiStage === "comprehension") return;

    const filterRail = catalog.querySelector(".level-rail");
    const passagesGrid = catalog.querySelector(".passages-grid");
    const header = catalog.querySelector(".catalog-header");
    if (!filterRail || !passagesGrid || !header) return;

    const filterButtons = [...filterRail.querySelectorAll("[data-filter-comp-lvl]")];
    const activeButton = filterButtons.find((button) => button.classList.contains("active"));
    const activeLevel = activeButton?.dataset.filterCompLvl || "all";

    if (activeLevel === "all") {
      const bank = Array.isArray(window.NP_COMPREHENSION) ? window.NP_COMPREHENSION : [];
      const levels = [...new Set(bank.map((passage) => passage.level).filter(Boolean))];
      const levelButtons = levels.map((level) => {
        const button = filterButtons.find((candidate) => candidate.dataset.filterCompLvl === level);
        if (!button) return null;
        const total = bank.filter((passage) => passage.level === level).length;
        button.className = "study-row stage-row current";
        button.innerHTML = `
          <span class="unit-dot next">${level}</span>
          <div>
            <div class="study-row-ko">${level} · Reading</div>
            <div class="study-row-sub">${comprehensionLevelDescription(level)}</div>
          </div>
          <span class="pill muted">${total} texts</span>
        `;
        return button;
      }).filter(Boolean);

      const stageCard = document.createElement("div");
      stageCard.className = "card";
      stageCard.innerHTML = `
        <div class="flex-between mb-12">
          <div>
            <div class="eyebrow">Levels</div>
            <div class="screen-sub" style="margin-bottom:0;">Choose your level first, then one text.</div>
          </div>
          <span class="pill accent" style="white-space:nowrap;">${levelButtons.length} levels</span>
        </div>
      `;
      const list = document.createElement("div");
      list.className = "study-list";
      levelButtons.forEach((button) => list.appendChild(button));
      stageCard.appendChild(list);

      catalog.replaceChildren(
        makeHeader("Reading", "Choose a level", "Choose your level first, then one text."),
        stageCard
      );
    } else {
      const allButton = filterButtons.find((button) => button.dataset.filterCompLvl === "all");
      if (allButton) {
        allButton.className = "button secondary compact";
        allButton.style.marginTop = "18px";
        allButton.textContent = "‹ All levels";
      }

      const passageButtons = [...passagesGrid.querySelectorAll(".passage-item-card")];
      passageButtons.forEach((button, index) => {
        const title = text(button.querySelector(".passage-title"));
        const enTitle = text(button.querySelector(".passage-en-title"));
        const time = text(button.querySelector(".reading-time"));
        const footer = text(button.querySelector(".passage-card-footer"));
        const complete = /gelezen|✓ Read|✓/i.test(footer);
        const number = String(index + 1).padStart(2, "0");
        button.className = `study-row stage-row ${complete ? "complete" : "current"}`;
        button.innerHTML = `
          <span class="unit-dot ${complete ? "done" : "next"}">${complete ? "✓" : number}</span>
          <div>
            <div class="study-row-ko">${title}</div>
            <div class="study-row-sub">${[enTitle, time].filter(Boolean).join(" · ")}</div>
          </div>
          <span class="pill ${complete ? "green" : "muted"}">${complete ? "Read" : `Text ${number}`}</span>
        `;
      });
      passagesGrid.className = "study-list";

      const lessonsCard = document.createElement("div");
      lessonsCard.className = "card";
      const meta = document.createElement("div");
      meta.className = "flex-between mb-12";
      meta.innerHTML = `
        <div>
          <div class="eyebrow">${activeLevel} reading</div>
          <div class="screen-sub" style="margin-bottom:0;">Pick one text and finish it in full.</div>
        </div>
        <span class="pill accent" style="white-space:nowrap;">${passageButtons.length} texts</span>
      `;
      lessonsCard.append(meta, passagesGrid);

      const cleanHeader = makeHeader("Reading", `${activeLevel} · Choose a text`, "Work through the texts at this level.");
      if (allButton) cleanHeader.appendChild(allButton);
      catalog.replaceChildren(cleanHeader, lessonsCard);
    }

    catalog.dataset.uiStage = "comprehension";
  }

  function removeDailySettings() {
    const settings = document.querySelector("#screen-settings");
    if (!settings) return;

    const dailyGoal = settings.querySelector("#select-daily-goal");
    if (dailyGoal) {
      const row = dailyGoal.closest(".setting-row");
      if (row) row.remove();
    }

    [...settings.querySelectorAll("h1, h2, h3")].forEach((heading) => {
      if (heading.textContent.includes("Goals & Sessions") || heading.textContent.includes("Leerdoelen & Sessies")) heading.textContent = "Sessions";
    });
  }

  function removeDailyProgressStats() {
    const progress = document.querySelector("#screen-progress .progress-container");
    if (!progress) return;

    const subtitle = progress.querySelector(".catalog-header .page-subtitle");
    if (subtitle && /streak/i.test(subtitle.textContent)) {
      subtitle.textContent = "A detailed view of your learning curve and mastered words.";
    }

    [...progress.querySelectorAll(".progress-stats-overview .stat-big-card")].forEach((card) => {
      if (/streak/i.test(card.textContent)) card.remove();
    });
  }

  function cleanCompletionCopy() {
    document.querySelectorAll("#btn-go-today").forEach((button) => {
      if (button.textContent.trim() !== "Back to Learn") button.textContent = "Back to Learn";
    });
    document.querySelectorAll(".session-complete-card .session-stat-box").forEach((box) => {
      if (/streak/i.test(box.textContent)) box.remove();
    });
  }

  function applyUi() {
    isolateSubjectLevelState();
    transformHome();
    transformGrammarCatalog();
    transformComprehensionCatalog();
    removeDailySettings();
    removeDailyProgressStats();
    cleanCompletionCopy();
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      applyUi();
    });
  }

  const start = () => {
    applyUi();
    const root = document.getElementById("app") || document.body;
    const observer = new MutationObserver(scheduleApply);
    observer.observe(root, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
