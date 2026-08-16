// NederPath temporary tile concept lab.
// Adds a fourth Learn-home tile with numbered visual concepts so one can be
// chosen before the winning tile language is applied across the product.
(function () {
  "use strict";

  const STORAGE_KEY = "nederpath-tile-concept-choice";
  const CONCEPTS = [
    { id: "01", name: "Airy Soft", note: "Veel ruimte, zachte hoeken, metadata onder de titel." },
    { id: "02", name: "Soft Capsule", note: "Rondere kaarten met compacte capsules voor status en nummer." },
    { id: "03", name: "Number Rail", note: "Duidelijke nummerkolom links en rustige inhoud rechts." },
    { id: "04", name: "Editorial", note: "Minder kleurvlak, grotere typografie en meer witruimte." },
    { id: "05", name: "Bento", note: "Titel en metadata in een nette twee-zone indeling." },
    { id: "06", name: "Floating", note: "Lichtere rand, zachte schaduw en een zwevende statusbadge." },
    { id: "07", name: "Layered", note: "Een rustige buitenkaart met een subtiele binnenlaag voor inhoud." },
    { id: "08", name: "Minimal Outline", note: "Bijna vlak: dunne rand, ruime padding, weinig visuele ruis." },
    { id: "09", name: "Accent Edge", note: "Donkere kaart met één heldere accentlijn als navigatiehulp." },
    { id: "10", name: "Poster", note: "Groot lesnummer als grafisch element, titel krijgt maximale ruimte." }
  ];

  const LAB_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 9h8M8 13h5M16.5 15.5h.01"/></svg>';

  function ensureStyles() {
    if (document.getElementById("tile-lab-styles")) return;
    const style = document.createElement("style");
    style.id = "tile-lab-styles";
    style.textContent = `
      /* Baseline fix requested from the live mobile screenshots. */
      :root {
        --radius: 18px;
        --radius-sm: 14px;
        --radius-xs: 12px;
      }
      .card,
      .hub-tile,
      .study-row,
      .word-tile,
      .lesson-option,
      .option,
      .stat-box,
      .stat-big-card,
      .session-stat-box {
        border-radius: 16px;
      }
      .card { border-radius: 20px; }
      .hub-tiles { gap: 16px; }
      .study-list { gap: 10px; }
      .study-row {
        gap: 16px;
        min-height: 88px;
        padding: 20px 18px;
      }
      .study-row-sub {
        margin-top: 7px;
        line-height: 1.5;
      }

      .tile-lab-home-tile {
        border-style: dashed;
        border-color: rgba(var(--accent-rgb), .34);
      }
      .tile-lab-home-tile .hub-tile-icon {
        background: rgba(var(--accent-rgb), .10);
      }
      .tile-lab-screen {
        width: min(100%, 860px);
        margin: 0 auto;
        padding-bottom: 30px;
      }
      .tile-lab-head {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 20px;
      }
      .tile-lab-back {
        align-self: flex-start;
        margin-bottom: 8px;
      }
      .tile-lab-tabs {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 3px 2px 10px;
        margin: 0 -2px 18px;
        scrollbar-width: thin;
      }
      .tile-lab-tab {
        flex: 0 0 auto;
        min-width: 54px;
        min-height: 46px;
        padding: 0 14px;
        border: 1px solid var(--line);
        border-radius: 15px;
        background: var(--panel);
        color: var(--muted);
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }
      .tile-lab-tab[aria-selected="true"] {
        border-color: rgba(var(--accent-rgb), .48);
        background: rgba(var(--accent-rgb), .12);
        color: var(--accent);
        box-shadow: 0 0 0 1px rgba(var(--accent-rgb), .10);
      }
      .tile-lab-tab.is-choice::after {
        content: "•";
        margin-left: 5px;
        color: var(--good);
      }
      .tile-lab-stage {
        padding: clamp(16px, 4vw, 24px);
        border: 1px solid var(--line);
        border-radius: 24px;
        background: var(--panel);
      }
      .tile-lab-stage-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 18px;
      }
      .tile-lab-stage-title {
        margin: 0;
        font-size: 1.35rem;
        line-height: 1.15;
      }
      .tile-lab-stage-note {
        margin: 6px 0 0;
        color: var(--muted);
        font-size: .9rem;
        line-height: 1.5;
      }
      .tile-lab-concept-id {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 48px;
        height: 36px;
        padding: 0 10px;
        border-radius: 999px;
        background: rgba(var(--accent-rgb), .12);
        color: var(--accent);
        font-weight: 900;
      }
      .tile-lab-preview {
        display: flex;
        flex-direction: column;
        gap: 13px;
      }
      .tile-lab-sample {
        position: relative;
        min-width: 0;
        color: var(--text);
        overflow: hidden;
      }
      .tile-lab-sample button { font: inherit; }
      .tile-lab-copy { min-width: 0; }
      .tile-lab-kicker {
        color: var(--muted-2);
        font-size: .72rem;
        font-weight: 850;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .tile-lab-title {
        margin-top: 5px;
        color: var(--text);
        font-size: 1.04rem;
        font-weight: 850;
        line-height: 1.28;
      }
      .tile-lab-sub {
        margin-top: 6px;
        color: var(--muted);
        font-size: .84rem;
        line-height: 1.5;
      }
      .tile-lab-index,
      .tile-lab-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        border: 1px solid var(--line);
        color: var(--muted);
        font-weight: 800;
      }
      .tile-lab-index { width: 46px; height: 46px; border-radius: 15px; }
      .tile-lab-status { min-height: 34px; padding: 0 12px; border-radius: 999px; font-size: .78rem; }
      .tile-lab-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
      }
      .tile-lab-choice-note {
        margin-top: 12px;
        color: var(--muted-2);
        font-size: .82rem;
        line-height: 1.45;
      }

      /* 01 - Airy Soft */
      .tile-concept-01 .tile-lab-sample {
        display: grid;
        grid-template-columns: 48px minmax(0,1fr);
        gap: 14px 18px;
        padding: 24px;
        border: 1px solid rgba(var(--accent-rgb), .28);
        border-radius: 24px;
        background: rgba(var(--accent-rgb), .07);
      }
      .tile-concept-01 .tile-lab-status { grid-column: 2; justify-self: start; }

      /* 02 - Soft Capsule */
      .tile-concept-02 .tile-lab-sample {
        display: grid;
        grid-template-columns: 54px minmax(0,1fr);
        gap: 14px;
        padding: 22px;
        border: 1px solid rgba(var(--accent-rgb), .25);
        border-radius: 30px;
        background: linear-gradient(145deg, rgba(var(--accent-rgb), .11), rgba(var(--accent-rgb), .045));
      }
      .tile-concept-02 .tile-lab-index { border-radius: 999px; background: rgba(255,255,255,.045); }
      .tile-concept-02 .tile-lab-status { grid-column: 1 / -1; justify-self: start; margin-left: 68px; }

      /* 03 - Number Rail */
      .tile-concept-03 .tile-lab-sample {
        display: grid;
        grid-template-columns: 58px minmax(0,1fr) auto;
        gap: 16px;
        align-items: center;
        padding: 22px 20px 22px 16px;
        border: 1px solid var(--line);
        border-left: 4px solid var(--accent);
        border-radius: 20px;
        background: var(--panel-strong);
      }
      .tile-concept-03 .tile-lab-index { border: 0; background: rgba(var(--accent-rgb), .10); color: var(--accent); }

      /* 04 - Editorial */
      .tile-concept-04 .tile-lab-sample {
        display: grid;
        grid-template-columns: minmax(0,1fr) auto;
        gap: 16px;
        padding: 26px 24px;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: transparent;
      }
      .tile-concept-04 .tile-lab-index { display: none; }
      .tile-concept-04 .tile-lab-title { font-size: 1.18rem; }
      .tile-concept-04 .tile-lab-status { align-self: end; }

      /* 05 - Bento */
      .tile-concept-05 .tile-lab-sample {
        display: grid;
        grid-template-columns: minmax(0,1fr) 92px;
        gap: 12px;
        padding: 16px;
        border: 1px solid rgba(var(--accent-rgb), .25);
        border-radius: 22px;
        background: rgba(255,255,255,.025);
      }
      .tile-concept-05 .tile-lab-copy { padding: 6px 4px 8px 6px; }
      .tile-concept-05 .tile-lab-index {
        grid-column: 2;
        grid-row: 1;
        width: 100%; height: 100%; min-height: 76px;
        border-radius: 16px;
        background: rgba(var(--accent-rgb), .09);
        color: var(--accent);
        font-size: 1.2rem;
      }
      .tile-concept-05 .tile-lab-status { grid-column: 1; justify-self: start; margin-left: 6px; }

      /* 06 - Floating */
      .tile-concept-06 .tile-lab-sample {
        display: grid;
        grid-template-columns: 48px minmax(0,1fr);
        gap: 16px;
        padding: 24px;
        margin: 4px 3px 10px;
        border: 0;
        border-radius: 24px;
        background: var(--panel-strong);
        box-shadow: 0 16px 38px rgba(var(--shadow-rgb), .32), inset 0 1px 0 rgba(255,255,255,.06);
      }
      .tile-concept-06 .tile-lab-status {
        position: absolute;
        right: 18px;
        bottom: 16px;
        background: var(--elevated);
      }
      .tile-concept-06 .tile-lab-copy { padding-bottom: 30px; }

      /* 07 - Layered */
      .tile-concept-07 .tile-lab-sample {
        display: grid;
        grid-template-columns: 50px minmax(0,1fr);
        gap: 14px;
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: 24px;
        background: rgba(255,255,255,.025);
      }
      .tile-concept-07 .tile-lab-copy {
        padding: 15px 16px;
        border-radius: 17px;
        background: rgba(var(--accent-rgb), .065);
      }
      .tile-concept-07 .tile-lab-index { align-self: center; margin-left: 5px; }
      .tile-concept-07 .tile-lab-status { grid-column: 2; justify-self: start; margin: 0 0 4px 16px; }

      /* 08 - Minimal Outline */
      .tile-concept-08 .tile-lab-sample {
        display: grid;
        grid-template-columns: 42px minmax(0,1fr) auto;
        gap: 16px;
        align-items: start;
        padding: 22px 20px;
        border: 1px solid var(--line-strong);
        border-radius: 18px;
        background: transparent;
      }
      .tile-concept-08 .tile-lab-index { width: 42px; height: 42px; border: 0; color: var(--accent); }
      .tile-concept-08 .tile-lab-status { border: 0; padding-inline: 6px; }

      /* 09 - Accent Edge */
      .tile-concept-09 .tile-lab-sample {
        display: grid;
        grid-template-columns: 48px minmax(0,1fr);
        gap: 15px;
        padding: 22px;
        border: 1px solid rgba(var(--accent-rgb), .18);
        border-radius: 22px;
        background:
          linear-gradient(90deg, rgba(var(--accent-rgb), .13), transparent 34%),
          var(--panel);
      }
      .tile-concept-09 .tile-lab-sample::after {
        content: "";
        position: absolute;
        inset: 0 auto 0 0;
        width: 3px;
        background: var(--accent);
      }
      .tile-concept-09 .tile-lab-status { grid-column: 2; justify-self: start; }

      /* 10 - Poster */
      .tile-concept-10 .tile-lab-sample {
        display: grid;
        grid-template-columns: minmax(0,1fr) auto;
        gap: 18px;
        padding: 26px 22px;
        border: 1px solid rgba(var(--accent-rgb), .24);
        border-radius: 26px;
        background: var(--panel-strong);
      }
      .tile-concept-10 .tile-lab-index {
        grid-column: 2;
        grid-row: 1 / span 2;
        width: auto;
        height: auto;
        border: 0;
        color: rgba(var(--accent-rgb), .24);
        font-size: clamp(3rem, 14vw, 5rem);
        line-height: .9;
      }
      .tile-concept-10 .tile-lab-status { grid-column: 1; justify-self: start; }

      @media (max-width: 560px) {
        .grammar-catalog-container > .card,
        .comprehension-catalog-container > .card {
          padding: 18px 14px;
        }
        .grammar-catalog-container .card > .flex-between,
        .comprehension-catalog-container .card > .flex-between {
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
        }
        .grammar-catalog-container .stage-row,
        .comprehension-catalog-container .stage-row {
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr);
          grid-template-areas:
            "dot copy"
            ". status";
          gap: 10px 14px;
          align-items: start;
          min-height: 0;
          padding: 20px 18px;
          border-radius: 16px;
        }
        .grammar-catalog-container .stage-row .unit-dot,
        .comprehension-catalog-container .stage-row .unit-dot {
          grid-area: dot;
          align-self: center;
        }
        .grammar-catalog-container .stage-row > div,
        .comprehension-catalog-container .stage-row > div { grid-area: copy; }
        .grammar-catalog-container .stage-row > .pill,
        .comprehension-catalog-container .stage-row > .pill {
          grid-area: status;
          justify-self: start;
          margin-top: 1px;
        }
        .grammar-catalog-container .study-row-ko,
        .comprehension-catalog-container .study-row-ko { font-size: 1rem; }
        .grammar-catalog-container .study-row-sub,
        .comprehension-catalog-container .study-row-sub {
          font-size: .86rem;
          line-height: 1.52;
        }
        .tile-lab-stage { padding: 16px; }
        .tile-lab-stage-head { flex-direction: column-reverse; }
        .tile-concept-03 .tile-lab-sample,
        .tile-concept-08 .tile-lab-sample {
          grid-template-columns: 48px minmax(0,1fr);
        }
        .tile-concept-03 .tile-lab-status,
        .tile-concept-08 .tile-lab-status {
          grid-column: 2;
          justify-self: start;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getChoice() {
    try { return localStorage.getItem(STORAGE_KEY) || ""; } catch { return ""; }
  }

  function setChoice(id) {
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  }

  function ensureHomeTile() {
    const tiles = document.querySelector(".staged-learn-home .hub-tiles");
    if (!tiles || tiles.querySelector("[data-tile-lab]")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "hub-tile tile-lab-home-tile";
    button.dataset.tileLab = "true";
    button.innerHTML = `
      <span class="hub-tile-icon">${LAB_ICON}</span>
      <span class="hub-tile-text">
        <strong>Tile Test</strong>
        <small>10 genummerde concepten voor spacing, ronding en indeling.</small>
      </span>
      <span class="hub-tile-go" aria-hidden="true">›</span>
    `;
    button.addEventListener("click", renderLab);
    tiles.appendChild(button);
  }

  function sampleMarkup() {
    return `
      <article class="tile-lab-sample">
        <span class="tile-lab-index">01</span>
        <div class="tile-lab-copy">
          <div class="tile-lab-kicker">A1 · Grammatica</div>
          <div class="tile-lab-title">Dutch Sounds, Syllable Structure, and Spelling Rules</div>
          <div class="tile-lab-sub">Klinkers, lettergrepen en spellingsregels · meer ruimte voor langere titels zonder dat badges alles pletten.</div>
        </div>
        <span class="tile-lab-status">Les 01</span>
      </article>
      <article class="tile-lab-sample">
        <span class="tile-lab-index">A2</span>
        <div class="tile-lab-copy">
          <div class="tile-lab-kicker">Niveau</div>
          <div class="tile-lab-title">A2 · Grammatica</div>
          <div class="tile-lab-sub">Meer tijden, verbindingen en dagelijkse grammaticale patronen.</div>
        </div>
        <span class="tile-lab-status">30 lessen</span>
      </article>
    `;
  }

  function renderConcept(id) {
    const concept = CONCEPTS.find((item) => item.id === id) || CONCEPTS[0];
    const stage = document.getElementById("tile-lab-stage");
    if (!stage) return;

    stage.className = `tile-lab-stage tile-concept-${concept.id}`;
    stage.innerHTML = `
      <div class="tile-lab-stage-head">
        <div>
          <h2 class="tile-lab-stage-title">${concept.name}</h2>
          <p class="tile-lab-stage-note">${concept.note}</p>
        </div>
        <span class="tile-lab-concept-id">${concept.id}</span>
      </div>
      <div class="tile-lab-preview">${sampleMarkup()}</div>
      <div class="tile-lab-actions">
        <button type="button" class="btn btn-primary" id="tile-lab-choose">Kies concept ${concept.id}</button>
      </div>
      <div class="tile-lab-choice-note">Dit past nog niets globaal toe. De keuze wordt alleen onthouden zodat het winnende concept daarna netjes over de hele app kan worden uitgerold.</div>
    `;

    document.querySelectorAll(".tile-lab-tab").forEach((tab) => {
      tab.setAttribute("aria-selected", tab.dataset.concept === concept.id ? "true" : "false");
    });

    const choose = document.getElementById("tile-lab-choose");
    if (choose) {
      choose.addEventListener("click", () => {
        setChoice(concept.id);
        refreshChoiceMarkers();
        choose.textContent = `Concept ${concept.id} gekozen ✓`;
      });
    }
  }

  function refreshChoiceMarkers() {
    const choice = getChoice();
    document.querySelectorAll(".tile-lab-tab").forEach((tab) => {
      tab.classList.toggle("is-choice", tab.dataset.concept === choice);
    });
  }

  function renderLab() {
    const screen = document.getElementById("screen-today");
    if (!screen) return;
    const tabs = CONCEPTS.map((concept, index) => `
      <button type="button" class="tile-lab-tab" role="tab" aria-selected="${index === 0 ? "true" : "false"}" data-concept="${concept.id}" aria-controls="tile-lab-stage">${concept.id}</button>
    `).join("");

    screen.innerHTML = `
      <div class="tile-lab-screen animate-fade">
        <button type="button" class="btn btn-outline tile-lab-back" id="tile-lab-back">← Leren</button>
        <div class="tile-lab-head">
          <div class="eyebrow">Ontwerp-test</div>
          <h1 class="page-title">Tile Test</h1>
          <p class="page-subtitle">Tik op 01–10. Vergelijk spacing, ronding, nummering en waar de statusbadge zit.</p>
        </div>
        <div class="tile-lab-tabs" role="tablist" aria-label="Tile concepten">${tabs}</div>
        <section id="tile-lab-stage" aria-live="polite"></section>
      </div>
    `;

    screen.querySelectorAll(".tile-lab-tab").forEach((tab) => {
      tab.addEventListener("click", () => renderConcept(tab.dataset.concept));
    });
    const back = document.getElementById("tile-lab-back");
    if (back) back.addEventListener("click", () => document.getElementById("nav-learn")?.click());

    refreshChoiceMarkers();
    renderConcept(getChoice() || "01");
    if (typeof window.NederApp?.scrollToTop === "function") window.NederApp.scrollToTop();
  }

  function apply() {
    ensureStyles();
    ensureHomeTile();
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      apply();
    });
  }

  function start() {
    apply();
    const root = document.getElementById("app") || document.body;
    new MutationObserver(scheduleApply).observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
