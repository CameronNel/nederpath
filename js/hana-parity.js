/* NederPath UI parity layer.
 * Reuses the HanaPath component system already present in css/styles.css.
 * Keeps NederPath's existing screen/controller listeners intact while removing
 * the daily dashboard and presenting lesson catalogs as staged Hana-style menus.
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
    { tab: "grammar", icon: ICONS.grammar, title: "Grammatica", sub: "Lessen, uitleg en oefeningen in een duidelijke volgorde." },
    { tab: "words", icon: ICONS.vocabulary, title: "Woordenschat", sub: "Woorden leren, terugvinden en gericht oefenen." },
    { tab: "comprehension", icon: ICONS.comprehension, title: "Begrijpend lezen", sub: "Gecureerde teksten met begripsoefeningen per niveau." }
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
      // The core app historically shares one selectedLevel value across Words,
      // Grammar and Comprehension. Reset it when entering a different subject so
      // choosing A1 in Grammar cannot silently pre-filter Reading or Vocabulary.
      if (SUBJECT_TABS.has(tab) && this.currentTab !== tab) {
        this.selectedLevel = "all";
      }
      return originalOpenLearnItem.call(this, tab, options);
    };
    app.__subjectLevelIsolationInstalled = true;
  }

  function transformHome() {
    const home = document.querySelector("#screen-today .today-home");
    if (!home || home.dataset.hanaParity === "home") return;

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
      makeHeader("Studie & oefening", "Waar wil je aan werken?", "Kies één leerpad. Oefeningen zitten bij elk onderwerp."),
      tiles
    );
    home.className = "hana-learn-home";
    home.dataset.hanaParity = "home";
  }

  function grammarLevelDescription(level) {
    const descriptions = {
      A1: "Basiszinnen, werkwoorden, lidwoorden en eenvoudige woordvolgorde.",
      A2: "Meer tijden, verbindingen en dagelijkse grammaticale patronen.",
      B1: "Zelfstandiger formuleren met complexere zinnen en structuren.",
      B2: "Nuance, precisie en gevorderde zinsbouw.",
      C1: "Fijne betekenisverschillen en complexe grammaticale keuzes."
    };
    return descriptions[level] || "Grammaticalessen op dit niveau.";
  }

  function transformGrammarCatalog() {
    const catalog = document.querySelector("#screen-grammar .grammar-catalog-container");
    if (!catalog || catalog.dataset.hanaParity === "grammar") return;

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
            <div class="study-row-ko">${level} · Grammatica</div>
            <div class="study-row-sub">${grammarLevelDescription(level)}</div>
          </div>
          <span class="pill muted">${total} lessen</span>
        `;
        return button;
      }).filter(Boolean);

      const stageCard = document.createElement("div");
      stageCard.className = "card";
      stageCard.innerHTML = `
        <div class="flex-between mb-12">
          <div>
            <div class="eyebrow">Niveaus</div>
            <div class="screen-sub" style="margin-bottom:0;">Open één niveau en werk de lessen in volgorde af.</div>
          </div>
          <span class="pill accent" style="white-space:nowrap;">${levelButtons.length} niveaus</span>
        </div>
      `;
      const list = document.createElement("div");
      list.className = "study-list";
      levelButtons.forEach((button) => list.appendChild(button));
      stageCard.appendChild(list);

      catalog.replaceChildren(
        makeHeader("Grammatica", "Kies een niveau", "Geen muur van 120 kaarten. Begin bij een niveau en open daarna één les."),
        stageCard
      );
    } else {
      const allButton = filterButtons.find((button) => button.dataset.filterLvl === "all");
      if (allButton) {
        allButton.className = "button secondary compact";
        allButton.textContent = "‹ Alle niveaus";
      }

      const ruleButtons = [...rulesGrid.querySelectorAll(".grammar-item-card")];
      ruleButtons.forEach((button, index) => {
        const title = text(button.querySelector(".grammar-title"));
        const nlTitle = text(button.querySelector(".grammar-nl-title"));
        const summary = text(button.querySelector(".grammar-summary"));
        const section = text(button.querySelector(".grammar-section"));
        const status = text(button.querySelector(".status-indicator"));
        const complete = /voltooid|✓/i.test(status);
        const number = String(index + 1).padStart(2, "0");
        button.className = `study-row stage-row ${complete ? "complete" : "current"}`;
        button.innerHTML = `
          <span class="unit-dot ${complete ? "done" : "next"}">${complete ? "✓" : number}</span>
          <div>
            <div class="study-row-ko">${title}</div>
            <div class="study-row-sub">${[section, nlTitle, summary].filter(Boolean).join(" · ")}</div>
          </div>
          <span class="pill ${complete ? "green" : "muted"}">${complete ? "Voltooid" : `Les ${number}`}</span>
        `;
      });
      rulesGrid.className = "study-list";

      const lessonsCard = document.createElement("div");
      lessonsCard.className = "card";
      const meta = document.createElement("div");
      meta.className = "flex-between mb-12";
      meta.innerHTML = `
        <div>
          <div class="eyebrow">${activeLevel} grammatica</div>
          <div class="screen-sub" style="margin-bottom:0;">Kies één les. Je voortgang blijft per les bewaard.</div>
        </div>
        <span class="pill accent" style="white-space:nowrap;">${ruleButtons.length} lessen</span>
      `;
      lessonsCard.append(meta, rulesGrid);

      const cleanHeader = makeHeader("Grammatica", `${activeLevel} · Kies een les`, "Compacte lessen in plaats van een eindeloze tegelwand.");
      if (allButton) cleanHeader.appendChild(allButton);
      catalog.replaceChildren(cleanHeader, lessonsCard);
    }

    catalog.dataset.hanaParity = "grammar";
  }

  function comprehensionLevelDescription(level) {
    const descriptions = {
      A1: "Korte, concrete teksten met herkenbare dagelijkse taal.",
      A2: "Eenvoudige verhalen, berichten en praktische teksten.",
      B1: "Langere teksten met meer context en impliciete informatie.",
      B2: "Complexere argumenten, stijl en genuanceerde betekenis.",
      C1: "Dichte, natuurlijke teksten met gevorderde woordenschat."
    };
    return descriptions[level] || "Leesteksten op dit niveau.";
  }

  function transformComprehensionCatalog() {
    const catalog = document.querySelector("#screen-comprehension .comprehension-catalog-container");
    if (!catalog || catalog.dataset.hanaParity === "comprehension") return;

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
            <div class="study-row-ko">${level} · Begrijpend lezen</div>
            <div class="study-row-sub">${comprehensionLevelDescription(level)}</div>
          </div>
          <span class="pill muted">${total} teksten</span>
        `;
        return button;
      }).filter(Boolean);

      const stageCard = document.createElement("div");
      stageCard.className = "card";
      stageCard.innerHTML = `
        <div class="flex-between mb-12">
          <div>
            <div class="eyebrow">Niveaus</div>
            <div class="screen-sub" style="margin-bottom:0;">Kies eerst je niveau en daarna één tekst.</div>
          </div>
          <span class="pill accent" style="white-space:nowrap;">${levelButtons.length} niveaus</span>
        </div>
      `;
      const list = document.createElement("div");
      list.className = "study-list";
      levelButtons.forEach((button) => list.appendChild(button));
      stageCard.appendChild(list);

      catalog.replaceChildren(
        makeHeader("Begrijpend lezen", "Kies een niveau", "Open één niveau tegelijk, zoals de staged Learn-secties in HanaPath."),
        stageCard
      );
    } else {
      const allButton = filterButtons.find((button) => button.dataset.filterCompLvl === "all");
      if (allButton) {
        allButton.className = "button secondary compact";
        allButton.textContent = "‹ Alle niveaus";
      }

      const passageButtons = [...passagesGrid.querySelectorAll(".passage-item-card")];
      passageButtons.forEach((button, index) => {
        const title = text(button.querySelector(".passage-title"));
        const enTitle = text(button.querySelector(".passage-en-title"));
        const time = text(button.querySelector(".reading-time"));
        const footer = text(button.querySelector(".passage-card-footer"));
        const complete = /gelezen|✓/i.test(footer);
        const number = String(index + 1).padStart(2, "0");
        button.className = `study-row stage-row ${complete ? "complete" : "current"}`;
        button.innerHTML = `
          <span class="unit-dot ${complete ? "done" : "next"}">${complete ? "✓" : number}</span>
          <div>
            <div class="study-row-ko">${title}</div>
            <div class="study-row-sub">${[enTitle, time].filter(Boolean).join(" · ")}</div>
          </div>
          <span class="pill ${complete ? "green" : "muted"}">${complete ? "Gelezen" : `Tekst ${number}`}</span>
        `;
      });
      passagesGrid.className = "study-list";

      const lessonsCard = document.createElement("div");
      lessonsCard.className = "card";
      const meta = document.createElement("div");
      meta.className = "flex-between mb-12";
      meta.innerHTML = `
        <div>
          <div class="eyebrow">${activeLevel} lezen</div>
          <div class="screen-sub" style="margin-bottom:0;">Kies één tekst en werk die volledig af.</div>
        </div>
        <span class="pill accent" style="white-space:nowrap;">${passageButtons.length} teksten</span>
      `;
      lessonsCard.append(meta, passagesGrid);

      const cleanHeader = makeHeader("Begrijpend lezen", `${activeLevel} · Kies een tekst`, "Compacte rijen met dezelfde hiërarchie als HanaPath.");
      if (allButton) cleanHeader.appendChild(allButton);
      catalog.replaceChildren(cleanHeader, lessonsCard);
    }

    catalog.dataset.hanaParity = "comprehension";
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
      if (heading.textContent.includes("Leerdoelen & Sessies")) heading.textContent = "Sessies";
    });
  }

  function cleanCompletionCopy() {
    document.querySelectorAll("#btn-go-today").forEach((button) => {
      if (button.textContent.trim() !== "Terug naar Leren") button.textContent = "Terug naar Leren";
    });
    document.querySelectorAll(".session-complete-card .session-stat-box").forEach((box) => {
      if (/streak/i.test(box.textContent)) box.remove();
    });
  }

  function applyParity() {
    transformHome();
    transformGrammarCatalog();
    transformComprehensionCatalog();
    removeDailySettings();
    cleanCompletionCopy();
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      applyParity();
    });
  }

  const start = () => {
    isolateSubjectLevelState();
    applyParity();
    const root = document.getElementById("app") || document.body;
    const observer = new MutationObserver(scheduleApply);
    observer.observe(root, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
