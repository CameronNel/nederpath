(function () {
  "use strict";

  const VERSION = "1";
  const ACCENTS = ["#ff7d91", "#9b84ff", "#62b7ff", "#72d6b0", "#ffad63"];
  const state = { person: "all", tense: "all" };
  const PEOPLE = [
    ["all", "Alle"], ["ik", "Ik"], ["je", "Jij / je"],
    ["third", "U / hij / zij / het"], ["wij", "Wij"],
    ["jullie", "Jullie"], ["zij_plural", "Zij (mv.)"]
  ];
  const TENSES = [
    ["all", "Alle vormen"], ["infinitive", "Infinitief"],
    ["present", "Tegenwoordige tijd"], ["imperfect", "Imperfectum"],
    ["perfect", "Perfectum"], ["imperative", "Gebiedende wijs"]
  ];
  let verbIndex = null;
  let scheduled = false;

  const txt = (el) => el ? el.textContent.trim() : "";
  const norm = (v) => String(v || "").normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[“”'’]/g, "")
    .replace(/\s+/g, " ").trim();
  const esc = (v) => String(v == null ? "" : v).replace(/&/g, "&amp;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  const example = (v) => String(v || "").trim().replace(/^[“\"]+|[”\"]+$/g, "").trim();

  function translation(v) {
    const raw = String(v || "").trim();
    if (/\b(form of|tense|participle|imperative|reference)\b/i.test(raw)) {
      const match = raw.match(/\(([^()]+)\)\s*$/);
      if (match) return match[1].trim();
    }
    return raw;
  }

  function classify(form, word, lemma) {
    const s = norm(form);
    let tense = null;
    if (/basisvorm|lemma|infinitief/.test(s) || (!s && norm(word) === norm(lemma))) tense = "infinitive";
    else if (/tegenwoordige tijd|presens|present tense/.test(s)) tense = "present";
    else if (/imperfectum|onvoltooid verleden|verleden tijd|past tense/.test(s)) tense = "imperfect";
    else if (/perfectum|voltooid deelwoord|past participle|perfect tense/.test(s)) tense = "perfect";
    else if (/gebiedende wijs|imperatief|imperative/.test(s)) tense = "imperative";

    const p = (s.match(/\(([^)]+)\)/) || [null, s])[1];
    const people = [];
    if (/\bik\b/.test(p)) people.push("ik");
    if (/\b(jij|je)\b/.test(p)) people.push("je");
    if (/\b(u|hij|het)\b/.test(p)) people.push("third");
    const plural = /\b(wij|jullie)\b/.test(p);
    if (plural) {
      if (/\bwij\b/.test(p)) people.push("wij");
      if (/\bjullie\b/.test(p)) people.push("jullie");
      if (/\bzij\b/.test(p)) people.push("zij_plural");
    } else if (/\bzij\b/.test(p)) people.push("third");
    return { tense, people: [...new Set(people)] };
  }

  function rawEntry(raw) {
    const lemma = String(raw.baseLemma || raw.lemma || raw.dutch || raw.word || "").trim();
    const word = String(raw.displayWord || raw.dutch || raw.word || lemma).trim();
    if (!word || !lemma) return null;
    const form = String(raw.formDescription || raw.grammaticalForm || raw.reference || "").trim();
    const c = classify(form, word, lemma);
    return {
      word, lemma, form, tense: c.tense, people: c.people,
      translation: translation(raw.english || raw.meaning || ""),
      example: example(raw.sentence || raw.example || raw.exampleSentence || ""),
      verb: norm(raw.type || raw.pos).includes("verb") || Boolean(form), priority: 1
    };
  }

  function getVerbIndex() {
    if (verbIndex) return verbIndex;
    verbIndex = new Map();
    (Array.isArray(window.NP_WORDS) ? window.NP_WORDS : []).forEach((raw) => {
      const type = norm(raw && (raw.type || raw.pos));
      if (type && !type.includes("verb")) return;
      const e = rawEntry(raw);
      if (!e || !e.verb) return;
      const key = norm(e.lemma);
      if (!verbIndex.has(key)) verbIndex.set(key, []);
      verbIndex.get(key).push(e);
    });
    return verbIndex;
  }

  function domEntry(card) {
    const word = txt(card.querySelector(".word-title"));
    if (!word) return null;
    const lemmaNode = card.querySelector(".word-lemma-link strong");
    const lemma = txt(lemmaNode) || word;
    const form = txt(card.querySelector(".word-gram-form"));
    const c = classify(form, word, lemma);
    const pos = norm(txt(card.querySelector(".word-footer span")));
    return {
      word, lemma, form, tense: c.tense, people: c.people,
      translation: translation(txt(card.querySelector(".word-meaning"))),
      example: example(txt(card.querySelector(".word-example"))),
      verb: pos.includes("verb") || Boolean(lemmaNode) || /tijd|lemma|deelwoord|infinitief|imperatief/i.test(form),
      priority: 0
    };
  }

  function groupsFrom(cards) {
    const map = new Map();
    cards.forEach((card, index) => {
      const e = domEntry(card);
      if (!e) return;
      const key = norm(e.lemma);
      if (!map.has(key)) map.set(key, { key, lemma: e.lemma, index, entries: [] });
      map.get(key).entries.push(e);
    });
    return [...map.values()].sort((a, b) => a.index - b.index).map((g) => {
      g.verb = g.entries.some((e) => e.verb);
      if (g.verb) {
        const seen = new Set(g.entries.map((e) => `${norm(e.word)}|${norm(e.form)}`));
        (getVerbIndex().get(g.key) || []).forEach((e) => {
          const k = `${norm(e.word)}|${norm(e.form)}`;
          if (!seen.has(k)) { seen.add(k); g.entries.push(e); }
        });
      }
      return g;
    });
  }

  const tenseWeight = (t) => ({ present: 0, infinitive: 1, imperfect: 2, perfect: 3, imperative: 4 })[t] ?? 9;
  function personWeight(e) {
    const p = e.people || [];
    if (p.includes("ik")) return 0;
    if (p.includes("je")) return 1;
    if (p.includes("third")) return 2;
    if (p.includes("wij")) return 3;
    if (p.includes("jullie")) return 4;
    if (p.includes("zij_plural")) return 5;
    return 8;
  }
  function baseEntry(g) {
    return g.entries.find((e) => e.tense === "infinitive" && norm(e.word) === norm(g.lemma))
      || g.entries.find((e) => norm(e.word) === norm(g.lemma))
      || g.entries.find((e) => e.tense === "infinitive") || g.entries[0];
  }
  function candidates(g) {
    if (!g.verb) return state.person === "all" && state.tense === "all" ? g.entries : [];
    let list = g.entries.filter((e) => state.tense === "all" || e.tense === state.tense);
    if (!list.length) return [];
    if (state.person !== "all" && ["all", "present", "imperfect"].includes(state.tense)) {
      list = list.filter((e) => (e.people || []).includes(state.person));
    }
    return list;
  }
  function activeEntry(g) {
    const list = candidates(g);
    if (!list.length) return null;
    if (state.person === "all" && state.tense === "all") {
      return list.find((e) => e.tense === "present" && e.people.includes("ik")) || baseEntry(g);
    }
    return list.slice().sort((a, b) => tenseWeight(a.tense) - tenseWeight(b.tense) || personWeight(a) - personWeight(b) || a.priority - b.priority)[0];
  }
  function switchEntries(g) {
    if (!g.verb) return [];
    let list = g.entries.slice();
    if (state.tense === "all") {
      const compact = list.filter((e) => e.tense === "present" || e.tense === "infinitive");
      if (compact.length) list = compact;
    } else {
      const same = list.filter((e) => e.tense === state.tense);
      if (same.length) list = same;
    }
    list.sort((a, b) => personWeight(a) - personWeight(b) || tenseWeight(a.tense) - tenseWeight(b.tense) || a.priority - b.priority);
    const seen = new Set();
    return list.filter((e) => { const k = norm(e.word); if (!k || seen.has(k)) return false; seen.add(k); return true; });
  }
  function accent(key) {
    let h = 0;
    for (let i = 0; i < key.length; i += 1) h = ((h << 5) - h + key.charCodeAt(i)) | 0;
    return ACCENTS[Math.abs(h) % ACCENTS.length];
  }
  function groupTranslation(g) {
    return translation(baseEntry(g)?.translation) || g.entries.map((e) => translation(e.translation)).find(Boolean) || "";
  }
  function groupExample(g, active) {
    return active?.example || g.entries.find((e) => active && norm(e.word) === norm(active.word) && e.example)?.example
      || baseEntry(g)?.example || g.entries.find((e) => e.example)?.example || "";
  }

  function cardFor(g, active) {
    const card = document.createElement("article");
    card.className = "np-vocab-card";
    card.style.setProperty("--np-accent", accent(g.key));
    const trans = groupTranslation(g);
    const ex = groupExample(g, active);
    const forms = switchEntries(g);
    card.innerHTML = `
      <div class="np-vocab-main"><strong class="np-vocab-word">${esc(active.word)}</strong>${trans ? `<span class="np-vocab-translation">${esc(trans)}</span>` : ""}</div>
      ${forms.length > 1 ? `<div class="np-vocab-switch" role="group" aria-label="Vormen van ${esc(g.lemma)}">${forms.map((e) => `<button type="button" class="np-vocab-form ${norm(e.word) === norm(active.word) ? "active" : ""}" data-form="${esc(e.word)}">${esc(e.word)}</button>`).join("")}</div>` : ""}
      ${ex ? `<div class="np-vocab-example">${esc(ex)}</div>` : ""}`;
    card.querySelectorAll("[data-form]").forEach((btn) => btn.addEventListener("click", () => {
      const next = g.entries.find((e) => norm(e.word) === norm(btn.dataset.form)) || active;
      card.querySelector(".np-vocab-word").textContent = next.word;
      card.querySelectorAll("[data-form]").forEach((b) => b.classList.toggle("active", norm(b.dataset.form) === norm(next.word)));
      const sentence = groupExample(g, next);
      let node = card.querySelector(".np-vocab-example");
      if (sentence) {
        if (!node) { node = document.createElement("div"); node.className = "np-vocab-example"; card.appendChild(node); }
        node.textContent = sentence;
      } else if (node) node.remove();
    }));
    return card;
  }

  function render(host, groups) {
    const frag = document.createDocumentFragment();
    let count = 0;
    groups.forEach((g) => { const active = activeEntry(g); if (active) { count += 1; frag.appendChild(cardFor(g, active)); } });
    if (!count) {
      const empty = document.createElement("div"); empty.className = "np-vocab-empty";
      empty.textContent = "Geen woorden passen bij deze vormfilters."; frag.appendChild(empty);
    }
    host.replaceChildren(frag);
  }

  function filterButtons(items, current, attr) {
    return items.map(([v, label]) => `<button type="button" class="np-vocab-filter ${v === current ? "active" : ""}" ${attr}="${esc(v)}">${esc(label)}</button>`).join("");
  }
  function toolbar(host, groups) {
    const bar = document.createElement("section");
    bar.className = "np-vocab-toolbar";
    bar.innerHTML = `
      <div><span class="np-vocab-label">Persoon</span><div class="np-vocab-scroll">${filterButtons(PEOPLE, state.person, "data-person")}</div></div>
      <div><span class="np-vocab-label">Tijd / vorm</span><div class="np-vocab-scroll">${filterButtons(TENSES, state.tense, "data-tense")}</div></div>`;
    bar.addEventListener("click", (event) => {
      const p = event.target.closest("[data-person]");
      const t = event.target.closest("[data-tense]");
      if (!p && !t) return;
      if (p) state.person = p.dataset.person;
      if (t) state.tense = t.dataset.tense;
      bar.querySelectorAll("[data-person]").forEach((b) => b.classList.toggle("active", b.dataset.person === state.person));
      bar.querySelectorAll("[data-tense]").forEach((b) => b.classList.toggle("active", b.dataset.tense === state.tense));
      render(host, groups);
    });
    return bar;
  }

  function resetOldFilters() {
    const app = window.NederApp;
    if (!app || typeof app.render !== "function") return false;
    if ([app.selectedLevel, app.selectedPos, app.selectedArticle].every((v) => !v || v === "all")) return false;
    app.selectedLevel = app.selectedPos = app.selectedArticle = "all";
    app.render();
    return true;
  }

  function transform() {
    const screen = document.getElementById("screen-words");
    if (!screen || screen.hidden || resetOldFilters()) return;
    const cards = [...screen.querySelectorAll(".word-item-card")];
    if (!cards.length) return;
    const host = cards[0].parentElement;
    if (!host || host.dataset.npClean === VERSION) return;
    const groups = groupsFrom(cards);
    if (!groups.length) return;

    screen.querySelectorAll(".level-rail,.filter-row,.words-results-meta,.np-vocab-toolbar").forEach((el) => el.remove());
    const search = screen.querySelector(".words-search-card");
    if (search) {
      const title = search.querySelector(".page-title");
      const sub = search.querySelector(".page-subtitle");
      const input = search.querySelector("#words-search-input");
      if (title) title.textContent = "Woordenschat";
      if (sub) sub.textContent = "Zoek een Nederlands woord of Engelse betekenis.";
      if (input) input.placeholder = "Zoek Nederlands of Engels…";
    }

    host.dataset.npClean = VERSION;
    host.classList.add("np-vocab-list");
    const bar = toolbar(host, groups);
    host.before(bar);
    render(host, groups);
  }

  function styles() {
    if (document.getElementById("np-vocab-styles")) return;
    const style = document.createElement("style");
    style.id = "np-vocab-styles";
    style.textContent = `
#screen-words .word-card-badges,#screen-words .word-gram-form,#screen-words .word-lemma-link,#screen-words .word-footer,#screen-words .level-rail,#screen-words .filter-row{display:none!important}
#screen-words .np-vocab-toolbar{position:sticky;top:0;z-index:12;display:grid;gap:10px;margin:0 0 16px;padding:11px 0 12px;border-bottom:1px solid color-mix(in srgb,currentColor 13%,transparent);backdrop-filter:blur(18px) saturate(130%)}
html[data-color-mode="dark"] #screen-words .np-vocab-toolbar{background:rgba(0,0,0,.9)}html[data-color-mode="light"] #screen-words .np-vocab-toolbar{background:rgba(255,255,255,.93)}
#screen-words .np-vocab-label{display:block;margin:0 0 6px 2px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.48}
#screen-words .np-vocab-scroll{display:flex;gap:7px;overflow-x:auto;padding:1px 2px 4px;scrollbar-width:none}#screen-words .np-vocab-scroll::-webkit-scrollbar,#screen-words .np-vocab-switch::-webkit-scrollbar{display:none}
#screen-words .np-vocab-filter{flex:0 0 auto;min-height:34px;padding:7px 11px;border:1px solid color-mix(in srgb,currentColor 16%,transparent);border-radius:999px;background:color-mix(in srgb,currentColor 5%,transparent);color:inherit;font:inherit;font-size:13px;font-weight:700;opacity:.66;cursor:pointer}
#screen-words .np-vocab-filter.active{border-color:#ff7d91;background:color-mix(in srgb,#ff7d91 17%,transparent);color:#ff8fa0;opacity:1}
#screen-words .np-vocab-list{display:grid!important;gap:10px!important}
#screen-words .np-vocab-card{--np-accent:#ff7d91;position:relative;overflow:hidden;padding:16px;border:1px solid color-mix(in srgb,currentColor 12%,transparent);border-radius:18px;background:color-mix(in srgb,currentColor 4%,transparent);box-shadow:inset 3px 0 0 var(--np-accent)}
#screen-words .np-vocab-main{display:flex;align-items:baseline;gap:10px;min-width:0;margin-bottom:10px;flex-wrap:wrap}
#screen-words .np-vocab-word{color:var(--np-accent);font-size:clamp(23px,5vw,31px);line-height:1.05;letter-spacing:-.025em;font-weight:850}
#screen-words .np-vocab-translation{font-size:15px;line-height:1.35;font-weight:600;opacity:.72}
#screen-words .np-vocab-switch{display:flex;width:max-content;max-width:100%;gap:3px;overflow-x:auto;margin:0 0 11px;padding:3px;border:1px solid color-mix(in srgb,currentColor 12%,transparent);border-radius:12px;background:color-mix(in srgb,currentColor 5%,transparent);scrollbar-width:none}
#screen-words .np-vocab-form{flex:0 0 auto;min-height:30px;padding:5px 10px;border:0;border-radius:9px;background:transparent;color:inherit;font:inherit;font-size:13px;font-weight:750;opacity:.55;cursor:pointer}
#screen-words .np-vocab-form.active{background:var(--np-accent);color:#0b0b0c;opacity:1;box-shadow:0 4px 16px color-mix(in srgb,var(--np-accent) 25%,transparent)}
#screen-words .np-vocab-example{padding-top:9px;border-top:1px solid color-mix(in srgb,currentColor 9%,transparent);font-size:14px;line-height:1.5;font-style:italic;opacity:.66}
#screen-words .np-vocab-empty{padding:28px 16px;border:1px dashed color-mix(in srgb,currentColor 18%,transparent);border-radius:16px;text-align:center;opacity:.6}
@media(max-width:520px){#screen-words .np-vocab-card{padding:14px;border-radius:16px}#screen-words .np-vocab-translation{font-size:14px}}
`;
    document.head.appendChild(style);
  }

  function apply() { styles(); transform(); }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; apply(); });
  }
  function start() {
    apply();
    new MutationObserver(schedule).observe(document.getElementById("app") || document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
