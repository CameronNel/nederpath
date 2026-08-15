// Browser-back sentinel adapted from the source product experience contract.
// Consumes Back into in-app detail/hub navigation; releases only at Learn root.
(function (global) {
  "use strict";

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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", registerBrowserBackButton);
  } else {
    registerBrowserBackButton();
  }

  global.NederExperience = { handleBackAction, registerBrowserBackButton };
})(typeof window !== "undefined" ? window : globalThis);
