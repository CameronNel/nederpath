// NederPath final Number Rail tile system.
// The runtime path is retained to keep the web/PWA/Android asset manifests
// stable; the temporary concept-picker behaviour has been removed.
(function () {
  "use strict";

  function ensureStyles() {
    if (document.getElementById("number-rail-styles")) return;

    const style = document.createElement("style");
    style.id = "number-rail-styles";
    style.textContent = `
      /* Slightly rounder surfaces across the product. */
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
        border-radius: 18px;
      }

      .card,
      .grammar-flow-card {
        border-radius: 22px;
      }

      .hub-tiles {
        gap: 16px;
      }

      .study-list {
        gap: 12px;
      }

      .study-row {
        min-height: 88px;
        padding: 20px 18px;
      }

      .study-row-sub {
        margin-top: 7px;
        line-height: 1.52;
      }

      /* Final Concept 03: Number Rail.
         The identifier sits top-left, the copy gets the full card width, and
         secondary status never steals a narrow third column from the title. */
      .number-rail-row {
        position: relative;
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 14px !important;
        align-items: start !important;
        min-height: 0 !important;
        padding: 22px 20px 22px 22px !important;
        overflow: hidden;
        border: 1px solid var(--line) !important;
        border-left: 4px solid var(--accent) !important;
        border-radius: 22px !important;
        background: var(--panel-strong) !important;
      }

      .number-rail-row:hover {
        border-color: rgba(var(--accent-rgb), .30) !important;
        border-left-color: var(--accent) !important;
        background: var(--surface-hover) !important;
      }

      .number-rail-row.complete {
        background: rgba(var(--accent-rgb), .055) !important;
        border-color: rgba(var(--accent-rgb), .18) !important;
        border-left-color: var(--accent) !important;
      }

      .number-rail-topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        width: 100%;
        min-width: 0;
      }

      .number-rail-label {
        min-width: 0;
        color: var(--accent);
        font-family: "Outfit", sans-serif;
        font-size: .86rem;
        font-weight: 900;
        line-height: 1.15;
        letter-spacing: .025em;
      }

      .number-rail-meta,
      .number-rail-state {
        flex: 0 0 auto;
        color: var(--muted-2);
        font-size: .76rem;
        font-weight: 760;
        line-height: 1.2;
      }

      .number-rail-state {
        color: var(--good);
      }

      .number-rail-copy {
        width: 100%;
        min-width: 0;
      }

      .number-rail-copy .study-row-ko {
        width: 100%;
        max-width: none;
        color: var(--text);
        font-size: 1.04rem;
        line-height: 1.3;
        text-wrap: pretty;
      }

      .number-rail-copy .study-row-sub {
        width: 100%;
        max-width: none;
        margin-top: 7px;
        color: var(--muted);
        font-size: .86rem;
        line-height: 1.55;
        text-wrap: pretty;
      }

      /* The old dot and bottom pill are intentionally gone on Number Rail
         cards. One identifier is enough; humans can count without redundancy. */
      .number-rail-row > .unit-dot,
      .number-rail-row > .pill {
        display: none !important;
      }

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

        .number-rail-row {
          gap: 13px !important;
          padding: 20px 17px 20px 19px !important;
          border-radius: 20px !important;
        }

        .number-rail-copy .study-row-ko {
          font-size: 1.02rem;
          line-height: 1.3;
        }

        .number-rail-copy .study-row-sub {
          font-size: .87rem;
          line-height: 1.55;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function captureCopy(row) {
    return {
      title: row.querySelector(".study-row-ko")?.textContent.trim() || "",
      sub: row.querySelector(".study-row-sub")?.textContent.trim() || "",
      pill: row.querySelector(":scope > .pill")?.textContent.trim() || ""
    };
  }

  function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  }

  function rebuildRow(row, { label, meta = "", state = "" }) {
    if (!row || row.dataset.numberRailApplied === "true") return;

    const copy = captureCopy(row);
    const top = element("div", "number-rail-topline");
    top.appendChild(element("span", "number-rail-label", label));

    const rightText = state || meta;
    if (rightText) {
      top.appendChild(element("span", state ? "number-rail-state" : "number-rail-meta", rightText));
    }

    const copyHost = element("div", "number-rail-copy");
    copyHost.appendChild(element("div", "study-row-ko", copy.title));
    if (copy.sub) copyHost.appendChild(element("div", "study-row-sub", copy.sub));

    row.replaceChildren(top, copyHost);
    row.classList.add("number-rail-row");
    row.dataset.numberRailApplied = "true";
  }

  function transformGrammarLevels() {
    const rows = [...document.querySelectorAll(".grammar-catalog-container [data-filter-lvl]")]
      .filter((row) => row.dataset.filterLvl && row.dataset.filterLvl !== "all");

    rows.forEach((row) => {
      const level = row.dataset.filterLvl;
      const copy = captureCopy(row);
      rebuildRow(row, {
        label: `Level ${level}`,
        meta: copy.pill
      });
    });
  }

  function transformGrammarLessons() {
    const rows = [...document.querySelectorAll(".grammar-catalog-container button[data-rule-id]")];
    rows.forEach((row, index) => {
      const number = String(index + 1).padStart(2, "0");
      const complete = row.classList.contains("complete") || /✓ Completed|voltooid|✓/i.test(row.textContent);
      rebuildRow(row, {
        label: `Lesson ${number}`,
        state: complete ? "✓ Completed" : ""
      });
    });
  }

  function transformReadingLevels() {
    const rows = [...document.querySelectorAll(".comprehension-catalog-container [data-filter-comp-lvl]")]
      .filter((row) => row.dataset.filterCompLvl && row.dataset.filterCompLvl !== "all");

    rows.forEach((row) => {
      const level = row.dataset.filterCompLvl;
      const copy = captureCopy(row);
      rebuildRow(row, {
        label: `Level ${level}`,
        meta: copy.pill
      });
    });
  }

  function transformReadingTexts() {
    const rows = [...document.querySelectorAll(".comprehension-catalog-container button[data-passage-id]")];
    rows.forEach((row, index) => {
      const number = String(index + 1).padStart(2, "0");
      const complete = row.classList.contains("complete") || /✓ Read|gelezen|✓/i.test(row.textContent);
      rebuildRow(row, {
        label: `Text ${number}`,
        state: complete ? "✓ Read" : ""
      });
    });
  }

  function removeLabResidue() {
    document.querySelectorAll("[data-tile-lab], .tile-lab-screen, #tile-lab-styles").forEach((node) => node.remove());
    try { localStorage.removeItem("nederpath-tile-concept-choice"); } catch {}
  }

  function apply() {
    ensureStyles();
    removeLabResidue();
    transformGrammarLevels();
    transformGrammarLessons();
    transformReadingLevels();
    transformReadingTexts();
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

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
