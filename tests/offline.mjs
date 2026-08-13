// NederPath Deterministic Service Worker & Offline Test Suite (VM Sandbox Execution of sw.js)
import vm from "node:vm";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const swSource = readFileSync(join(ROOT, "sw.js"), "utf8");

console.log("\n=======================================================");
console.log("   NederPath Authoritative Service Worker VM Tests     ");
console.log("=======================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, name, details = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${name}`);
  } else {
    failed++;
    console.error(`  ✗ [FAIL] ${name} ${details ? "- " + details : ""}`);
  }
}

// -------------------------------------------------------------------
// 1. Mock Web Standards & CacheStorage for ServiceWorker Sandbox
// -------------------------------------------------------------------
const BASE_ORIGIN = "https://cameronnel.github.io";
const BASE_PATH = "/nederpath/";
const BASE_URL = BASE_ORIGIN + BASE_PATH;

function normalizeUrlKey(key) {
  const str = typeof key === "string" ? key : key?.url || "";
  try {
    const u = new URL(str, BASE_URL);
    return u.href;
  } catch {
    return str;
  }
}

class MockResponse {
  constructor(body = "", init = {}) {
    this._body = body;
    this.status = init.status !== undefined ? init.status : 200;
    this.statusText = init.statusText || "OK";
    this.type = init.type || "basic";
    this.headers = new Map(Object.entries(init.headers || {}));
    this.url = init.url || "";
  }

  clone() {
    return new MockResponse(this._body, {
      status: this.status,
      statusText: this.statusText,
      type: this.type,
      headers: Object.fromEntries(this.headers.entries()),
      url: this.url
    });
  }
}

class MockCache {
  constructor(name) {
    this.name = name;
    this.store = new Map();
  }

  async add(request) {
    const urlKey = normalizeUrlKey(request);
    const res = new MockResponse(`content-of-${urlKey}`, { status: 200, url: urlKey });
    this.store.set(urlKey, res);
  }

  async addAll(requests) {
    for (const req of requests) {
      await this.add(req);
    }
  }

  async match(request) {
    const urlKey = normalizeUrlKey(request);
    const exact = this.store.get(urlKey);
    if (exact) return exact.clone();

    // Fallback: match by relative path suffix
    for (const [k, v] of this.store.entries()) {
      if (k.endsWith(urlKey.replace(/^\.\//, "")) || urlKey.endsWith(k.replace(/^\.\//, ""))) {
        return v.clone();
      }
    }
    return null;
  }

  async put(request, response) {
    const urlKey = normalizeUrlKey(request);
    this.store.set(urlKey, response.clone ? response.clone() : response);
  }

  async delete(request) {
    const urlKey = normalizeUrlKey(request);
    return this.store.delete(urlKey);
  }
}

class MockCacheStorage {
  constructor() {
    this.caches = new Map();
  }

  async open(name) {
    if (!this.caches.has(name)) {
      this.caches.set(name, new MockCache(name));
    }
    return this.caches.get(name);
  }

  async match(request) {
    for (const cache of this.caches.values()) {
      const match = await cache.match(request);
      if (match) return match;
    }
    return null;
  }

  async keys() {
    return Array.from(this.caches.keys());
  }

  async delete(name) {
    return this.caches.delete(name);
  }
}

// -------------------------------------------------------------------
// 2. Instantiate and Execute sw.js in VM Sandbox
// -------------------------------------------------------------------
const listeners = {
  install: [],
  activate: [],
  fetch: []
};

const mockCaches = new MockCacheStorage();
let networkOnline = true;
const customNetworkRoutes = new Map();

const mockFetch = async (input, init = {}) => {
  const url = typeof input === "string" ? input : input.url;
  const fullUrl = normalizeUrlKey(url);

  if (!networkOnline) {
    throw new TypeError("Failed to fetch: Network is offline");
  }

  if (customNetworkRoutes.has(fullUrl)) {
    return customNetworkRoutes.get(fullUrl).clone();
  }

  return new MockResponse(`network-data-for-${fullUrl}`, {
    status: 200,
    statusText: "OK",
    type: "basic",
    url: fullUrl
  });
};

const sandbox = {
  self: {
    location: {
      origin: BASE_ORIGIN,
      pathname: BASE_PATH + "sw.js",
      href: BASE_URL + "sw.js"
    },
    addEventListener: (type, fn) => {
      if (listeners[type]) listeners[type].push(fn);
    },
    skipWaiting: () => Promise.resolve(),
    clients: {
      claim: () => Promise.resolve()
    }
  },
  caches: mockCaches,
  fetch: mockFetch,
  Response: MockResponse,
  URL,
  console
};

// Bind self to global context
sandbox.self.caches = mockCaches;
sandbox.self.fetch = mockFetch;
sandbox.self.Response = MockResponse;

const context = vm.createContext(sandbox);

// Execute authoritative sw.js
try {
  vm.runInContext(swSource, context);
  assert(true, "Production sw.js compiled and executed cleanly in sandbox");
} catch (err) {
  assert(false, "Failed to compile sw.js", err.message);
  process.exit(1);
}

assert(listeners.install.length >= 1, "sw.js registered 'install' event listener");
assert(listeners.activate.length >= 1, "sw.js registered 'activate' event listener");
assert(listeners.fetch.length >= 1, "sw.js registered 'fetch' event listener");

// -------------------------------------------------------------------
// 3. Test Install Event & Precache Asset Verification
// -------------------------------------------------------------------
let installWaitPromise = null;
const installEvent = {
  waitUntil: (p) => {
    installWaitPromise = p;
  }
};

await listeners.install[0](installEvent);
await installWaitPromise;

const cacheKeys = await mockCaches.keys();
assert(cacheKeys.length === 1, `Cache opened on install: ${cacheKeys[0]}`);

const installedCache = await mockCaches.open(cacheKeys[0]);
const cachedEntries = Array.from(installedCache.store.keys());

// Ensure NO heavy data files are in install precache
const dataPrecached = cachedEntries.filter((k) => k.includes("/data/") || k.endsWith("words.js"));
assert(
  dataPrecached.length === 0,
  "Install precache excludes heavy curriculum data banks (words/grammar/sentences/idioms/comprehension)",
  `Found: ${dataPrecached.join(", ")}`
);

// Verify core shell assets are cached
const hasIndex = await installedCache.match("./index.html");
const hasStyles = await installedCache.match("./css/styles.css");
const hasApp = await installedCache.match("./js/app.js");
const hasLoader = await installedCache.match("./js/data-loader.js");

assert(hasIndex !== null && hasIndex.status === 200, "App shell index.html precached by sw.js install hook");
assert(hasStyles !== null && hasStyles.status === 200, "App shell styles.css precached by sw.js install hook");
assert(hasApp !== null && hasApp.status === 200, "App shell js/app.js precached by sw.js install hook");
assert(hasLoader !== null && hasLoader.status === 200, "App shell js/data-loader.js precached by sw.js install hook");

// -------------------------------------------------------------------
// 4. Test Activate Event & Old-Cache Deletion
// -------------------------------------------------------------------
// Pre-seed old cache versions
await mockCaches.open("nederpath-v1-cache");
await mockCaches.open("nederpath-v2-cache");

const keysBeforeActivate = await mockCaches.keys();
assert(keysBeforeActivate.length === 3, "Created legacy cache versions (v1, v2) for upgrade test");

let activateWaitPromise = null;
const activateEvent = {
  waitUntil: (p) => {
    activateWaitPromise = p;
  }
};

await listeners.activate[0](activateEvent);
await activateWaitPromise;

const keysAfterActivate = await mockCaches.keys();
assert(
  keysAfterActivate.length === 1 && keysAfterActivate[0] === cacheKeys[0],
  "Activate event handler in sw.js pruned all legacy caches and retained only the active version"
);

// -------------------------------------------------------------------
// 5. Test Fetch Event Handler Routing through real sw.js listener
// -------------------------------------------------------------------
async function dispatchFetchToWorker(req) {
  let respondWithPromise = null;
  let waitUntilPromises = [];

  const event = {
    request: req,
    respondWith: (p) => {
      respondWithPromise = p;
    },
    waitUntil: (p) => {
      waitUntilPromises.push(p);
    }
  };

  await listeners.fetch[0](event);

  if (!respondWithPromise) {
    return { intercepted: false, response: null };
  }

  const response = await respondWithPromise;
  await Promise.all(waitUntilPromises);
  return { intercepted: true, response };
}

// 5.1: Non-GET request bypass
const postReq = {
  method: "POST",
  url: BASE_URL + "api/backup",
  headers: new Map(),
  mode: "cors"
};
const postResult = await dispatchFetchToWorker(postReq);
assert(!postResult.intercepted, "Non-GET request (POST) passes through sw.js without interception");

// 5.2: Cross-origin request bypass
const crossOriginReq = {
  method: "GET",
  url: "https://fonts.googleapis.com/css2?family=Roboto",
  headers: new Map(),
  mode: "cors"
};
const crossResult = await dispatchFetchToWorker(crossOriginReq);
assert(!crossResult.intercepted, "Cross-origin request passes through sw.js without interception");

// 5.3: Navigation request online vs offline
const navReq = {
  method: "GET",
  url: BASE_URL + "practice",
  headers: new Map([["accept", "text/html"]]),
  mode: "navigate"
};

networkOnline = true;
const navOnlineResult = await dispatchFetchToWorker(navReq);
assert(
  navOnlineResult.intercepted && navOnlineResult.response.status === 200,
  "Navigation request online is handled and returns 200 OK"
);

networkOnline = false;
const navOfflineResult = await dispatchFetchToWorker(navReq);
assert(
  navOfflineResult.intercepted && navOfflineResult.response.status === 200,
  "Navigation request offline serves cached index.html shell fallback"
);

// 5.4: On-demand Data Bank Fetch & First-Use Runtime Caching
networkOnline = true;
const wordsDataUrl = BASE_URL + "data/words.js";

const wordsBeforeFetch = await installedCache.match(wordsDataUrl);
assert(wordsBeforeFetch === null, "words.js is NOT in cache prior to first navigation");

const dataFetchReq = {
  method: "GET",
  url: wordsDataUrl,
  headers: new Map([["accept", "application/javascript"]]),
  mode: "cors"
};

const firstFetchResult = await dispatchFetchToWorker(dataFetchReq);
assert(
  firstFetchResult.intercepted && firstFetchResult.response.status === 200,
  "First fetch for words.js returns 200 OK from network"
);

// Verify sw.js put words.js into runtime cache
const wordsAfterFetch = await installedCache.match(wordsDataUrl);
assert(wordsAfterFetch !== null && wordsAfterFetch.status === 200, "sw.js runtime-cached words.js on first successful 200 response");

// 5.5: Offline reuse of visited data bank
networkOnline = false;
const offlineVisitedResult = await dispatchFetchToWorker(dataFetchReq);
assert(
  offlineVisitedResult.intercepted && offlineVisitedResult.response.status === 200,
  "Offline request for visited words.js is served directly from runtime cache"
);

// 5.6: Offline unvisited data bank returns 503
const unvisitedDataUrl = BASE_URL + "data/sentences.js";
const unvisitedReq = {
  method: "GET",
  url: unvisitedDataUrl,
  headers: new Map([["accept", "application/javascript"]]),
  mode: "cors"
};

const offlineUnvisitedResult = await dispatchFetchToWorker(unvisitedReq);
assert(
  offlineUnvisitedResult.intercepted && offlineUnvisitedResult.response.status === 503,
  "Offline request for unvisited sentences.js returns 503 Service Unavailable (triggering client retry UI)"
);

// 5.7: Error responses (404, 500) from network are NEVER cached
networkOnline = true;
const notFoundUrl = BASE_URL + "data/missing.js";
customNetworkRoutes.set(notFoundUrl, new MockResponse("Not Found", { status: 404, statusText: "Not Found", url: notFoundUrl }));

const serverErrorUrl = BASE_URL + "data/error.js";
customNetworkRoutes.set(serverErrorUrl, new MockResponse("Server Error", { status: 500, statusText: "Internal Error", url: serverErrorUrl }));

await dispatchFetchToWorker({ method: "GET", url: notFoundUrl, headers: new Map(), mode: "cors" });
const match404 = await installedCache.match(notFoundUrl);
assert(match404 === null, "404 Not Found network response was NOT cached by sw.js");

await dispatchFetchToWorker({ method: "GET", url: serverErrorUrl, headers: new Map(), mode: "cors" });
const match500 = await installedCache.match(serverErrorUrl);
assert(match500 === null, "500 Server Error network response was NOT cached by sw.js");

console.log("\n=======================================================");
console.log(`Authoritative Service Worker Tests: ${passed} Passed, ${failed} Failed`);
console.log("=======================================================\n");

if (failed > 0) process.exit(1);
