// NederPath External Service Worker Registration Script (CSP Compliant)
(function () {
  "use strict";

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("./sw.js")
        .then(function (reg) {
          console.log("NederPath ServiceWorker registered successfully:", reg.scope);
        })
        .catch(function (err) {
          console.warn("NederPath ServiceWorker registration encountered an issue:", err);
        });
    });
  }
})();
