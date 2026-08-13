// NederPath Offline Service Worker (Cache version: v2)
const CACHE_NAME = "nederpath-v2-cache";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/learning.js",
  "./js/store.js",
  "./js/srs.js",
  "./js/voice.js",
  "./js/app.js",
  "./data/words.js",
  "./data/grammar.js",
  "./data/sentences.js",
  "./data/idioms.js",
  "./data/comprehension.js",
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
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
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
  // Only intercept safe same-origin GET requests
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  // Handle SPA navigation requests intentionally
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
          return caches.match("./index.html") || caches.match("./");
        })
    );
    return;
  }

  if (!isSameOrigin) {
    return;
  }

  // Cache-first strategy for same-origin static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
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
          // Fallback if network fails
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("./index.html");
          }
        });
    })
  );
});
