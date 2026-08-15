// NederPath Offline Service Worker (Cache version: v3 - Shell Precache & Fresh Runtime Caching)
const CACHE_NAME = "nederpath-v4-cache";

// Core App Shell assets only (data files are runtime-cached on first successful visit)
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./fonts/fonts.css",
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

function isCacheable(response) {
  return (
    response &&
    response.status === 200 &&
    (response.type === "basic" || response.type === "default")
  );
}

function offlineResponse(request) {
  if (request.headers.get("accept")?.includes("text/html")) {
    return caches.match("./index.html").then((cachedIndex) => {
      return cachedIndex || new Response("Offline resource unavailable", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "text/plain" }
      });
    });
  }
  return Promise.resolve(
    new Response("Offline resource unavailable", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain" }
    })
  );
}

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
        .then(async (response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            // A cache-write failure must not hide a valid online response.
            await caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseClone))
              .catch(() => undefined);
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

  // Network-first keeps unversioned shell and data URLs current across
  // deployments. The last successful response remains available offline.
  event.respondWith(
    fetch(event.request)
      .then(async (networkResponse) => {
        if (isCacheable(networkResponse)) {
          const responseToCache = networkResponse.clone();
          // Finish the update while the response promise keeps this fetch
          // event alive. Cache quota failures do not mask fresh content.
          await caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache))
            .catch(() => undefined);
          return networkResponse;
        }

        // A transient server error must not replace a previously valid asset.
        return (await caches.match(event.request)) || networkResponse;
      })
      .catch(async () => {
        return (await caches.match(event.request)) || offlineResponse(event.request);
      })
  );
});
