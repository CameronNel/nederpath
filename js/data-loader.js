// NederPath Lazy Data Loading Module with In-Memory Caching and Deduplication
(function (global) {
  "use strict";

  const DEFAULT_LOAD_TIMEOUT_MS = 30000; // 30s safe timeout for large data banks on slow networks

  const DATA_BANKS = {
    words: { path: "./data/words.js", globalKey: "NP_WORDS" },
    grammar: { path: "./data/grammar.js", globalKey: "NP_GRAMMAR" },
    sentences: { path: "./data/sentences.js", globalKey: "NP_SENTENCES" },
    idioms: { path: "./data/idioms.js", globalKey: "NP_IDIOMS" },
    comprehension: { path: "./data/comprehension.js", globalKey: "NP_COMPREHENSION" }
  };

  const loadPromises = {};
  const loadedBanks = new Set();

  /**
   * Loads a single data bank script on demand.
   * Caches in-flight and fulfilled promises to prevent duplicate network/script evaluation.
   * @param {string} bankName - 'words' | 'grammar' | 'sentences' | 'idioms' | 'comprehension'
   * @param {number} [timeoutMs=DEFAULT_LOAD_TIMEOUT_MS]
   * @returns {Promise<any>}
   */
  function loadBank(bankName, timeoutMs = DEFAULT_LOAD_TIMEOUT_MS) {
    const config = DATA_BANKS[bankName];
    if (!config) {
      return Promise.reject(new Error(`Onbekende databank: ${bankName}`));
    }

    // Return immediately if already loaded into global scope
    if (global[config.globalKey] !== undefined) {
      loadedBanks.add(bankName);
      return Promise.resolve(global[config.globalKey]);
    }

    // Return existing in-flight promise
    if (loadPromises[bankName]) {
      return loadPromises[bankName];
    }

    const promise = new Promise((resolve, reject) => {
      const doc = typeof document !== "undefined" ? document : global.document;
      // In browser environment, load via dynamic script tag
      if (doc && doc.createElement && doc.head) {
        const script = doc.createElement("script");
        script.src = config.path;
        script.async = true;

        const effectiveTimeout = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : DEFAULT_LOAD_TIMEOUT_MS;
        const timeoutId = setTimeout(() => {
          delete loadPromises[bankName];
          if (script.parentNode) script.parentNode.removeChild(script);
          reject(new Error(`Time-out bij het laden van ${config.path}. Controleer verbinding.`));
        }, effectiveTimeout);

        script.onload = () => {
          clearTimeout(timeoutId);
          if (global[config.globalKey] !== undefined) {
            loadedBanks.add(bankName);
            resolve(global[config.globalKey]);
          } else {
            delete loadPromises[bankName];
            if (script.parentNode) script.parentNode.removeChild(script);
            reject(new Error(`Databank ${bankName} geladen maar ${config.globalKey} niet gevonden.`));
          }
        };

        script.onerror = () => {
          clearTimeout(timeoutId);
          delete loadPromises[bankName];
          if (script.parentNode) script.parentNode.removeChild(script);
          reject(new Error(`Fout bij het laden van ${config.path}. Controleer verbinding.`));
        };

        doc.head.appendChild(script);
      } else {
        // Node / test environment fallback
        try {
          if (global[config.globalKey] !== undefined) {
            loadedBanks.add(bankName);
            resolve(global[config.globalKey]);
          } else {
            resolve([]);
          }
        } catch (err) {
          delete loadPromises[bankName];
          reject(err);
        }
      }
    });

    loadPromises[bankName] = promise;
    return promise;
  }

  /**
   * Loads multiple data banks concurrently.
   * @param {string[]} bankNames
   * @param {number} [timeoutMs=DEFAULT_LOAD_TIMEOUT_MS]
   * @returns {Promise<any[]>}
   */
  function loadBanks(bankNames = [], timeoutMs = DEFAULT_LOAD_TIMEOUT_MS) {
    return Promise.all(bankNames.map((name) => loadBank(name, timeoutMs)));
  }

  /**
   * Checks if a specific data bank is loaded.
   * @param {string} bankName
   * @returns {boolean}
   */
  function isBankLoaded(bankName) {
    const config = DATA_BANKS[bankName];
    return !!(config && (loadedBanks.has(bankName) || global[config.globalKey] !== undefined));
  }

  /**
   * Clears a failed in-flight bank promise so subsequent calls can retry.
   * Safely preserves successfully loaded banks in memory without unloading global data.
   * @param {string} bankName
   */
  function resetBank(bankName) {
    delete loadPromises[bankName];
    const config = DATA_BANKS[bankName];
    if (config && global[config.globalKey] === undefined) {
      loadedBanks.delete(bankName);
    }
  }

  /**
   * Test-only helper to forcibly evict a bank from memory and global scope.
   * NEVER used in normal UI error retry flow.
   * @param {string} bankName
   */
  function __forceUnloadBankForTest(bankName) {
    delete loadPromises[bankName];
    loadedBanks.delete(bankName);
    const config = DATA_BANKS[bankName];
    if (config) {
      delete global[config.globalKey];
    }
  }

  const DataLoader = {
    DEFAULT_LOAD_TIMEOUT_MS,
    loadBank,
    loadBanks,
    isBankLoaded,
    resetBank,
    __forceUnloadBankForTest,
    DATA_BANKS
  };

  global.NederDataLoader = DataLoader;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = DataLoader;
  }
})(typeof window !== "undefined" ? window : globalThis);
