// NederPath Offline Service Worker (Cache version: v3 - Shell Precache & On-Demand Data Runtime Caching)
const CACHE_NAME = "nederpath-v3-cache";

// Core App Shell assets only (data files are runtime-cached on first successful visit)
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/learning.js",
  "./js/store.js",
  "./js/srs.js",
  "./js/voice.js",
  "./js/data-loader.js",
  "./js/sw-register.js",
  "./js/app.js",
  "./manifest.webmanifest",
  "./icons/favicon-32.png",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Only intercept same-origin GET requests; all others bypass the worker
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  if (!isSameOrigin) {
    return;
  }

  // Handle SPA navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match("./index.html").then((cachedIndex) => {
            return cachedIndex || caches.match("./");
          });
        })
    );
    return;
  }

  // Cache-first strategy for static assets and on-demand runtime data caching
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          // Strictly cache successful 200 OK responses only (never 4xx, 5xx, or error states)
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === "basic" || networkResponse.type === "default")
          ) {
            const responseToCache = networkResponse.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then((cache) => {
                return cache.put(event.request, responseToCache);
              })
            );
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback when network is unavailable and resource is not cached
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("./index.html");
          }
          return new Response("Offline resource unavailable", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" }
          });
        });
    })
  );
});
