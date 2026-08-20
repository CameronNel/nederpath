// NederPath interaction contract: browser back, lesson scrolling, and motion choreography.
(function (global) {
  "use strict";

  const LESSON_FORWARD_CONTROLS = new Set([
    "btn-start-grammar-lesson",
    "btn-next-grammar-teach",
    "btn-next-grammar-ex",
    "btn-view-grammar-result"
  ]);

  const SCREEN_MOTION_CLASSES = [
    "screen-motion-enter",
    "screen-motion-launch",
    "screen-motion-hub",
    "screen-motion-tab",
    "screen-motion-forward",
    "screen-motion-back",
    "screen-motion-completion",
    "motion-reverse"
  ];
  const ITEM_MOTION_CLASSES = [
    "motion-rise",
    "motion-cascade",
    "motion-focus",
    "motion-return",
    "motion-lesson-forward",
    "motion-lesson-back",
    "motion-lesson-section",
    "motion-answer",
    "motion-complete"
  ];
  const MOTION_SELECTORS = [
    ".hub-header",
    ".hub-tile",
    ".card",
    ".study-row",
    ".stage-row",
    ".exam-tile",
    ".settings-card",
    ".words-search-card",
    ".word-card",
    ".grammar-flow-card",
    ".grammar-flow-progress-head",
    ".grammar-flow-progress-track",
    ".grammar-flow-step-label",
    ".grammar-flow-step-title",
    ".grammar-flow-rule",
    ".grammar-flow-definition",
    ".grammar-flow-example",
    ".grammar-flow-tip",
    ".grammar-flow-more",
    ".grammar-flow-actions",
    ".passage-reader-card",
    ".review-card",
    ".progress-map-row",
    ".stat-big-card",
    ".completion-stage",
    ".session-complete-card"
  ].join(", ");

  function isNative() {
    return Boolean(global.Capacitor && typeof global.Capacitor.isNativePlatform === "function" && global.Capacitor.isNativePlatform());
  }

  function motionIsReduced() {
    const app = global.NederApp;
    const appReduced = Boolean(app && app.store && app.store.state && app.store.state.settings && app.store.state.settings.reduceMotion);
    const systemReduced = Boolean(typeof global.matchMedia === "function" && global.matchMedia("(prefers-reduced-motion: reduce)").matches);
    return appReduced || systemReduced;
  }

  function getAppScroller() {
    return document.getElementById("app-main") || document.scrollingElement || document.documentElement;
  }

  function scrollAppToTop(behavior = null) {
    const scroller = getAppScroller();
    if (!scroller) return;
    const resolvedBehavior = behavior || (motionIsReduced() ? "auto" : "smooth");

    // #app-main owns the scroll in NederPath (`overflow-y:auto`). Scrolling the
    // window cannot move lesson content on mobile.
    if (typeof scroller.scrollTo === "function") {
      scroller.scrollTo({ top: 0, left: 0, behavior: resolvedBehavior });
    } else {
      scroller.scrollTop = 0;
      scroller.scrollLeft = 0;
    }
  }

  function handleBackAction() {
    const app = global.NederApp;
    if (!app) return false;
    const backBtn = document.querySelector(".back-btn, #btn-detail-back, #btn-back-grammar, #btn-back-comprehension");
    if (backBtn && !backBtn.disabled && backBtn.offsetParent !== null) {
      backBtn.click();
      return true;
    }
    if (app.currentTab === "settings" || app.hub === "exam" || app.hub === "progress") {
      app.goHub("learn", { replace: true });
      return true;
    }
    if (app.currentTab && app.currentTab !== "today") {
      app.goHub("learn", { replace: true });
      return true;
    }
    return false;
  }

  function scrollLessonToTopAfterPaint() {
    const scroll = () => scrollAppToTop();
    if (typeof global.requestAnimationFrame === "function") {
      global.requestAnimationFrame(() => global.requestAnimationFrame(scroll));
    } else {
      global.setTimeout(scroll, 0);
    }
  }

  function registerLessonStepScroll() {
    if (global.__nederpathLessonStepScrollRegistered) return;
    global.__nederpathLessonStepScrollRegistered = true;

    document.addEventListener("click", (event) => {
      const target = event.target;
      const button = target && typeof target.closest === "function" ? target.closest("button") : null;
      if (!button || button.disabled || !LESSON_FORWARD_CONTROLS.has(button.id)) return;
      scrollLessonToTopAfterPaint();
    });
  }

  function clearScreenMotion(screen) {
    if (!screen) return;
    SCREEN_MOTION_CLASSES.forEach((className) => screen.classList.remove(className));
  }

  function playScreenEntrance(screen, motion) {
    if (!screen || motionIsReduced()) return;
    clearScreenMotion(screen);
    void screen.offsetWidth;
    screen.dataset.motionKind = motion.kind;
    screen.classList.add("screen-motion-enter", `screen-motion-${motion.kind}`);
    if (motion.direction < 0) screen.classList.add("motion-reverse");
    global.setTimeout(() => clearScreenMotion(screen), 380);
  }

  function animateMotionScope(scope, selectors = MOTION_SELECTORS, stepMs = 42, variant = "rise") {
    if (!scope || motionIsReduced()) return;
    const items = [...scope.querySelectorAll(selectors)];
    if (!items.length) return;

    items.forEach((item, index) => {
      item.classList.remove("motion-enter");
      ITEM_MOTION_CLASSES.forEach((className) => item.classList.remove(className));
      item.style.setProperty("--motion-delay", `${Math.min(index, 12) * stepMs}ms`);
    });
    void scope.offsetWidth;
    items.forEach((item, index) => {
      item.classList.add("motion-enter", `motion-${variant}`);
      global.setTimeout(() => {
        item.classList.remove("motion-enter");
        ITEM_MOTION_CLASSES.forEach((className) => item.classList.remove(className));
        item.style.removeProperty("--motion-delay");
      }, (variant === "complete" ? 980 : 780) + index * stepMs);
    });
  }

  function visiblePane() {
    return [...document.querySelectorAll("#app-main .screen-pane")].find((pane) => !pane.hidden) || null;
  }

  function snapshotRoute(app) {
    return {
      hub: app ? app.hub : "learn",
      tab: app ? app.currentTab : "today",
      grammarPhase: app ? app.activeGrammarPhase : null,
      grammarTeachIndex: Number(app && app.activeGrammarTeachIndex) || 0,
      grammarExIndex: Number(app && app.activeGrammarExIndex) || 0,
      grammarRuleId: app && app.activeGrammarRule ? app.activeGrammarRule.id : null,
      passageId: app && app.activePassage ? app.activePassage.id : null
    };
  }

  function classifyMotion(previous, next) {
    if (!previous) return { kind: "launch", direction: 1, variant: "rise", stepMs: 38 };
    if (previous.hub !== next.hub) return { kind: "hub", direction: 1, variant: "cascade", stepMs: 42 };
    if (previous.tab !== next.tab) return { kind: "tab", direction: 1, variant: "cascade", stepMs: 38 };

    if (next.tab === "grammar" && next.grammarRuleId) {
      if (next.grammarPhase === "complete" && previous.grammarPhase !== "complete") {
        return { kind: "completion", direction: 1, variant: "complete", stepMs: 52 };
      }
      const phaseOrder = { intro: 0, teach: 1, test: 2, complete: 3 };
      const previousPhase = phaseOrder[previous.grammarPhase] ?? 0;
      const nextPhase = phaseOrder[next.grammarPhase] ?? 0;
      const movedBack = nextPhase < previousPhase ||
        (next.grammarPhase === "teach" && previous.grammarPhase === "teach" && next.grammarTeachIndex < previous.grammarTeachIndex) ||
        (next.grammarPhase === "test" && previous.grammarPhase === "test" && next.grammarExIndex < previous.grammarExIndex);
      if (movedBack) return { kind: "back", direction: -1, variant: "lesson-back", stepMs: 26 };
      if (next.grammarPhase === previous.grammarPhase && next.grammarTeachIndex === previous.grammarTeachIndex && next.grammarExIndex === previous.grammarExIndex) {
        return { kind: "forward", direction: 1, variant: "answer", stepMs: 22 };
      }
      return { kind: "forward", direction: 1, variant: "lesson-forward", stepMs: 26 };
    }

    if (previous.grammarRuleId !== next.grammarRuleId || previous.passageId !== next.passageId) {
      return { kind: next.grammarRuleId || next.passageId ? "forward" : "back", direction: next.grammarRuleId || next.passageId ? 1 : -1, variant: next.grammarRuleId || next.passageId ? "focus" : "return", stepMs: 34 };
    }
    return { kind: "forward", direction: 1, variant: "rise", stepMs: 34 };
  }

  function installHanaMotionRuntime() {
    const app = global.NederApp;
    if (!app || app.__hanaMotionRuntimeInstalled || typeof app.render !== "function") return false;
    app.__hanaMotionRuntimeInstalled = true;

    // Correct every existing app navigation call, not only the lesson button.
    // This turns the old window-based helper into the real overflow-container helper.
    app.scrollToTop = scrollAppToTop;

    let previous = snapshotRoute(app);
    const baseRender = app.render.bind(app);
    app.render = function (...args) {
      const before = previous;
      const result = baseRender(...args);
      const after = snapshotRoute(this);
      const motion = classifyMotion(before, after);
      previous = after;

      const play = () => {
        const pane = visiblePane();
        if (!pane) return;
        playScreenEntrance(pane, motion);
        animateMotionScope(pane, MOTION_SELECTORS, motion.stepMs, motion.variant);
      };
      if (typeof global.requestAnimationFrame === "function") {
        global.requestAnimationFrame(() => global.requestAnimationFrame(play));
      } else {
        global.setTimeout(play, 0);
      }
      return result;
    };
    return true;
  }

  function registerBrowserBackButton() {
    if (isNative() || global.__nederpathBrowserBackRegistered) return;
    global.__nederpathBrowserBackRegistered = true;

    const rootState = { nederPath: true, nederPathBackGuard: false };
    const guardState = { nederPath: true, nederPathBackGuard: true };
    const pushGuardFromRoot = () => {
      const current = window.history.state;
      if (!current || current.nederPath !== true || current.nederPathBackGuard === true) return false;
      try {
        window.history.pushState(Object.assign({}, current, guardState), "");
        return true;
      } catch (_) {
        return false;
      }
    };

    try {
      const existing = window.history.state && typeof window.history.state === "object" ? window.history.state : {};
      window.history.replaceState(Object.assign({}, existing, rootState), "");
      window.history.pushState(Object.assign({}, existing, guardState), "");
    } catch (_) {
      return;
    }

    let releasingToBrowser = false;
    let leftAppHistory = false;
    let repairingFromPageShow = false;
    let releaseWatchdog = null;

    window.addEventListener("pageshow", () => {
      releasingToBrowser = false;
      if (releaseWatchdog) {
        window.clearTimeout(releaseWatchdog);
        releaseWatchdog = null;
      }
      if (pushGuardFromRoot()) {
        repairingFromPageShow = true;
        window.setTimeout(() => { repairingFromPageShow = false; }, 0);
      }
    });

    window.addEventListener("popstate", (event) => {
      if (repairingFromPageShow && window.history.state && window.history.state.nederPathBackGuard === true) {
        repairingFromPageShow = false;
        return;
      }
      if (releasingToBrowser) {
        if (!event.state || event.state.nederPath !== true) leftAppHistory = true;
        return;
      }
      if (leftAppHistory && event.state && event.state.nederPath === true) {
        leftAppHistory = false;
        pushGuardFromRoot();
        return;
      }
      if (!event.state || event.state.nederPath !== true) return;
      if (event.state.route) return;
      if (handleBackAction()) {
        try { window.history.pushState(Object.assign({}, event.state, guardState), ""); } catch (_) {}
        return;
      }
      releasingToBrowser = true;
      try {
        window.history.back();
      } catch (_) {
        releasingToBrowser = false;
        pushGuardFromRoot();
        return;
      }
      releaseWatchdog = window.setTimeout(() => {
        releasingToBrowser = false;
        releaseWatchdog = null;
        pushGuardFromRoot();
      }, 250);
    });
  }

  function registerExperienceContract() {
    registerBrowserBackButton();
    registerLessonStepScroll();
    if (!installHanaMotionRuntime()) {
      global.setTimeout(installHanaMotionRuntime, 0);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", registerExperienceContract);
  } else {
    registerExperienceContract();
  }

  global.NederExperience = {
    handleBackAction,
    registerBrowserBackButton,
    registerLessonStepScroll,
    installHanaMotionRuntime,
    scrollAppToTop,
    animateMotionScope,
    playScreenEntrance
  };
})(typeof window !== "undefined" ? window : globalThis);
