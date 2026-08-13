// NederPath Lazy Data Loading Module with In-Memory Caching and Deduplication
(function (global) {
  "use strict";

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
   * @returns {Promise<any>}
   */
  function loadBank(bankName) {
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
      // In browser environment, load via dynamic script tag
      if (typeof document !== "undefined" && document.createElement) {
        const script = document.createElement("script");
        script.src = config.path;
        script.async = true;

        script.onload = () => {
          if (global[config.globalKey] !== undefined) {
            loadedBanks.add(bankName);
            resolve(global[config.globalKey]);
          } else {
            delete loadPromises[bankName];
            reject(new Error(`Databank ${bankName} geladen maar ${config.globalKey} niet gevonden.`));
          }
        };

        script.onerror = () => {
          delete loadPromises[bankName];
          if (script.parentNode) script.parentNode.removeChild(script);
          reject(new Error(`Fout bij het laden van ${config.path}. Controleer verbinding.`));
        };

        document.head.appendChild(script);
      } else {
        // Node / test environment fallback
        try {
          // If in Node, dynamic evaluation or resolution if injected
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
   * @returns {Promise<any[]>}
   */
  function loadBanks(bankNames = []) {
    return Promise.all(bankNames.map((name) => loadBank(name)));
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
   * Clears a failed bank promise so subsequent calls can retry.
   * @param {string} bankName
   */
  function resetBank(bankName) {
    delete loadPromises[bankName];
    loadedBanks.delete(bankName);
  }

  const DataLoader = {
    loadBank,
    loadBanks,
    isBankLoaded,
    resetBank,
    DATA_BANKS
  };

  global.NederDataLoader = DataLoader;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = DataLoader;
  }
})(typeof window !== "undefined" ? window : globalThis);
