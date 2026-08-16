// Browser-back sentinel adapted from the source product experience contract.
// Consumes Back into in-app detail/hub navigation; releases only at Learn root.
(function (global) {
  "use strict";

  const LESSON_FORWARD_CONTROLS = new Set([
    "btn-start-grammar-lesson",
    "btn-next-grammar-teach",
    "btn-next-grammar-ex",
    "btn-view-grammar-result"
  ]);

  function isNative() {
    return Boolean(global.Capacitor && typeof global.Capacitor.isNativePlatform === "function" && global.Capacitor.isNativePlatform());
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
    const scroll = () => {
      const app = global.NederApp;
      if (app && typeof app.scrollToTop === "function") {
        app.scrollToTop();
        return;
      }

      const prefersReduced =
        typeof global.matchMedia === "function" &&
        global.matchMedia("(prefers-reduced-motion: reduce)").matches;
      global.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    };

    // The lesson controller replaces the clicked button during render. Starting
    // the smooth scroll in that same click cycle can be cancelled by mobile
    // browsers. Wait until the replacement step has painted, then scroll.
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
      if (event.state.route) {
        return;
      }
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", registerExperienceContract);
  } else {
    registerExperienceContract();
  }

  global.NederExperience = {
    handleBackAction,
    registerBrowserBackButton,
    registerLessonStepScroll
  };
})(typeof window !== "undefined" ? window : globalThis);
