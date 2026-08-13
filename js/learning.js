// NederPath Learning Engine & Data Helpers (Zero-dependency, offline-first)
(function (global) {
  "use strict";

  const IRREGULAR_HIJ_VERBS = {
    zijn: "is",
    hebben: "heeft",
    kunnen: "kan",
    mogen: "mag",
    willen: "wil",
    zullen: "zal",
    weten: "weet",
    gaan: "gaat",
    staan: "staat",
    doen: "doet",
    zien: "ziet",
    slaan: "slaat",
    komen: "komt"
  };

  /**
   * HTML entity escaper for safe interpolation into innerHTML sinks.
   */
  function escapeHTML(str) {
    if (typeof str !== "string") return "";
    return str.replace(/[&<>"']/g, (m) => {
      switch (m) {
        case "&": return "&amp;";
        case "<": return "&lt;";
        case ">": return "&gt;";
        case '"': return "&quot;";
        case "'": return "&#39;";
        default: return m;
      }
    });
  }

  /**
   * Formats a local calendar date as 'YYYY-MM-DD'.
   * Never shifts based on UTC offset.
   */
  function getLocalISODate(date = new Date()) {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Validates if a string is a legitimate, finite ISO date within reasonable range.
   */
  function isValidISODateString(str) {
    if (typeof str !== "string" || str.length > 35) return false;
    if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z?)?$/.test(str)) return false;
    const d = new Date(str);
    if (isNaN(d.getTime())) return false;
    const year = d.getUTCFullYear();
    return year >= 2000 && year <= 2100;
  }

  /**
   * Non-mutating Fisher-Yates array shuffle.
   * Returns a new array.
   */
  function shuffleArray(arr) {
    if (!Array.isArray(arr)) return [];
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  /**
   * Non-mutating unbiased sample of N elements from array.
   * Returns a new array of length min(count, arr.length).
   */
  function sampleArray(arr, count = 10) {
    if (!Array.isArray(arr) || arr.length === 0 || count <= 0) return [];
    if (arr.length <= count) return shuffleArray(arr);
    const shuffled = shuffleArray(arr);
    return shuffled.slice(0, count);
  }

  /**
   * Normalizes answers for exact grading (trimmed, lowercase, punctuation removed).
   */
  function normalizeAnswer(str) {
    if (typeof str !== "string") return "";
    return str
      .trim()
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "");
  }

  /**
   * Extracts Dutch verb stem according to standard spelling rules.
   */
  function getDutchVerbStem(infinitive) {
    if (!infinitive || typeof infinitive !== "string") return "";
    const inf = infinitive.toLowerCase().trim();
    if (inf === "zijn") return "is";
    if (inf === "doen") return "doe";
    if (inf === "gaan") return "ga";
    if (inf === "staan") return "sta";
    if (inf === "zien") return "zie";
    if (inf === "slaan") return "sla";
    if (!inf.endsWith("en") || inf.length <= 2) return inf;

    let base = inf.slice(0, -2);

    // Double consonant at end -> single (e.g. bakken -> bak, pakken -> pak, zetten -> zet)
    if (
      base.length >= 2 &&
      base[base.length - 1] === base[base.length - 2] &&
      /[bcdfghjklmnpqrstvwxz]/.test(base[base.length - 1])
    ) {
      base = base.slice(0, -1);
    } else {
      // Vowel lengthening in open syllables (e.g. maken -> maak, hopen -> hoop, praten -> praat, eten -> eet)
      const match = base.match(/^(.*?)([aeou])([bcdfghjklmnpqrstvwxz])$/);
      if (match) {
        const [, prefix, vowel, consonant] = match;
        // Only double if not already a diphthong or preceded by vowel
        if (!prefix || !/[aeiou]/.test(prefix.slice(-1))) {
          base = `${prefix}${vowel}${vowel}${consonant}`;
        }
      }
    }

    // Convert trailing v -> f, z -> s (e.g. leven -> leef, reizen -> reis, geloven -> geloof)
    if (base.endsWith("v")) {
      base = base.slice(0, -1) + "f";
    } else if (base.endsWith("z")) {
      base = base.slice(0, -1) + "s";
    }

    return base;
  }

  /**
   * Resolves authentic 'hij/zij' present tense form for a verb infinitive.
   * Priority:
   * 1. Known irregular verbs dictionary
   * 2. Explicit lemma present-tense row in wordsBank
   * 3. Regular Dutch weak verb stem + t
   * Returns string or null if unsupported.
   */
  function getVerbHijConjugation(infinitive, wordsBank = null) {
    if (!infinitive || typeof infinitive !== "string") return null;
    const inf = infinitive.toLowerCase().trim();

    // 1. Check known irregulars
    if (IRREGULAR_HIJ_VERBS[inf]) {
      return IRREGULAR_HIJ_VERBS[inf];
    }

    // 2. Check explicit entry in wordsBank if available
    if (Array.isArray(wordsBank)) {
      const explicitRow = wordsBank.find((w) => {
        if (w.pos !== "verb") return false;
        if (w.lemma && w.lemma.toLowerCase() === inf) {
          const meaning = (w.meaning || "").toLowerCase();
          return (
            w.inflectionType === "hij-form" ||
            meaning.includes("present-tense 'hij/zij' form") ||
            meaning.includes("present-tense 'hij' form")
          );
        }
        return false;
      });
      if (explicitRow && explicitRow.word) {
        return explicitRow.word.toLowerCase().trim();
      }
    }

    // 3. Regular Dutch weak verb stem + t
    const stem = getDutchVerbStem(inf);
    if (!stem) return null;
    if (stem.endsWith("t")) return stem;
    return stem + "t";
  }

  /**
   * Filters a word bank down to trustworthy infinitive lemma entries for verb practice.
   * Excludes past tense, participles, and non-lemma forms (e.g. waren, hadden, gezien, gelopen).
   */
  function getEligibleVerbs(wordsBank) {
    if (!Array.isArray(wordsBank)) return [];
    return wordsBank.filter((w) => {
      if (!w || w.pos !== "verb") return false;
      if (w.inflectionType !== "lemma") return false;
      if (w.learnable === false) return false;
      const wordStr = (w.word || "").toLowerCase().trim();
      const isStandardInfinitive =
        wordStr.endsWith("en") || ["zijn", "gaan", "staan", "doen", "zien", "slaan"].includes(wordStr);
      if (!isStandardInfinitive) return false;
      const hij = getVerbHijConjugation(wordStr, wordsBank);
      return typeof hij === "string" && hij.length > 0;
    });
  }

  /**
   * Resolves authentic plural form for a noun lemma from the words bank.
   * Returns string or null if not found.
   */
  function getNounPlural(nounLemma, wordsBank = null) {
    if (!nounLemma || typeof nounLemma !== "string") return null;
    const lemma = nounLemma.toLowerCase().replace(/^(de|het)\s+/, "").trim();

    if (Array.isArray(wordsBank)) {
      const explicitRow = wordsBank.find((w) => {
        if (w.pos !== "noun") return false;
        if (w.lemma && w.lemma.toLowerCase() === lemma) {
          return (
            w.inflectionType === "plural" ||
            (w.meaning && (w.meaning.startsWith("plural of") || w.meaning.includes("(plural of")))
          );
        }
        return false;
      });
      if (explicitRow && explicitRow.word) {
        return explicitRow.word.toLowerCase().trim();
      }
    }
    return null;
  }

  /**
   * Generates a deterministic flashcard session.
   * Prioritizes due SRS cards first, fills remainder exclusively from unseen words (not in srsCards),
   * and falls back to remaining words only when unseen words are fully exhausted.
   */
  function generateFlashcardSession({ wordsBank = [], srsCards = {}, dueCards = [], sessionSize = 10 } = {}) {
    const size = Math.max(1, sessionSize);
    const words = Array.isArray(wordsBank) ? wordsBank : [];

    const sessionCards = [];
    const sessionIds = new Set();

    // Map all tracked card IDs in SRS
    const allTrackedIds = new Set(
      Array.isArray(srsCards)
        ? srsCards.map((c) => c && c.id).filter(Boolean)
        : Object.keys(srsCards || {})
    );

    // 1. Genuinely due cards first
    const dueList = Array.isArray(dueCards) ? dueCards : [];
    for (const card of dueList) {
      if (sessionCards.length >= size) break;
      const cardId = typeof card === "string" ? card : (card && card.id);
      if (!cardId || sessionIds.has(cardId)) continue;
      const wordObj = words.find((w) => w.id === cardId);
      if (wordObj && wordObj.learnable !== false) {
        sessionCards.push(wordObj);
        sessionIds.add(wordObj.id);
      }
    }

    // 2. Fill remainder from genuinely UNSEEN learnable words (not in allTrackedIds)
    if (sessionCards.length < size) {
      const remainingNeeded = size - sessionCards.length;
      const unseenEligible = words.filter(
        (w) => w && w.learnable !== false && !allTrackedIds.has(w.id) && !sessionIds.has(w.id)
      );
      const sampledUnseen = sampleArray(unseenEligible, remainingNeeded);
      for (const w of sampledUnseen) {
        sessionCards.push(w);
        sessionIds.add(w.id);
      }
    }

    // 3. Explicit fallback only if unseen words are completely exhausted
    if (sessionCards.length < size) {
      const remainingNeeded = size - sessionCards.length;
      const fallbackEligible = words.filter(
        (w) => w && w.learnable !== false && !sessionIds.has(w.id)
      );
      const sampledFallback = sampleArray(fallbackEligible, remainingNeeded);
      for (const w of sampledFallback) {
        sessionCards.push(w);
        sessionIds.add(w.id);
      }
    }

    return sessionCards;
  }

  /**
   * Creates a stable Fill-in-the-Blank card with unambiguous masking and distractors.
   */
  function createFillBlankCard(sentenceItem, wordsBank = []) {
    if (!sentenceItem || !sentenceItem.nl) return null;

    const sentence = sentenceItem.nl;
    const cleanTokens = sentence
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3);

    // Prefer targetWords if specified
    let target = null;
    if (Array.isArray(sentenceItem.targetWords) && sentenceItem.targetWords.length > 0) {
      for (const tw of sentenceItem.targetWords) {
        const regex = new RegExp(`\\b${tw}\\b`, "i");
        if (regex.test(sentence)) {
          target = tw;
          break;
        }
      }
    }

    if (!target && cleanTokens.length > 0) {
      // Pick middle content word
      target = cleanTokens[Math.floor(cleanTokens.length / 2)];
    }

    if (!target) {
      target = cleanTokens[0] || "woord";
    }

    // Mask the exact word occurrence
    const targetRegex = new RegExp(`\\b${target}\\b`, "i");
    const match = sentence.match(targetRegex);
    const matchedActual = match ? match[0] : target;
    const maskedSentence = sentence.replace(targetRegex, "_______");

    // Select 3 distinct distractors from words bank
    const candidateDistractors = [];
    if (Array.isArray(wordsBank) && wordsBank.length > 0) {
      const sentenceLower = sentence.toLowerCase();
      const sampled = sampleArray(wordsBank, 50);
      for (const w of sampled) {
        const wordStr = (w.word || "").trim();
        if (
          wordStr &&
          wordStr.toLowerCase() !== matchedActual.toLowerCase() &&
          !sentenceLower.includes(wordStr.toLowerCase()) &&
          !candidateDistractors.includes(wordStr)
        ) {
          candidateDistractors.push(wordStr);
          if (candidateDistractors.length === 3) break;
        }
      }
    }

    // Fallbacks if bank unavailable
    const fallbackDistractors = ["altijd", "samen", "misschien", "zeker", "morgen", "nooit"];
    for (const fb of fallbackDistractors) {
      if (candidateDistractors.length >= 3) break;
      if (fb.toLowerCase() !== matchedActual.toLowerCase() && !candidateDistractors.includes(fb)) {
        candidateDistractors.push(fb);
      }
    }

    const options = shuffleArray([matchedActual, ...candidateDistractors.slice(0, 3)]);

    return {
      id: sentenceItem.id || `fib-${Math.random().toString(36).slice(2, 9)}`,
      originalSentence: sentence,
      translation: sentenceItem.en || "",
      targetWord: matchedActual,
      maskedSentence,
      options,
      category: sentenceItem.category || "general",
      level: sentenceItem.level || "A1"
    };
  }

  /**
   * Recursively detects dangerous prototype-pollution keys (__proto__, constructor, prototype).
   */
  function containsDangerousKeys(value) {
    if (!value || typeof value !== "object") return false;
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (containsDangerousKeys(value[i])) return true;
      }
      return false;
    }
    for (const key of Object.getOwnPropertyNames(value)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return true;
      }
      if (containsDangerousKeys(value[key])) return true;
    }
    return false;
  }

  /**
   * Validates imported backup JSON, rejects invalid/dangerous payloads,
   * enforces numeric and collection bounds, sanitizes strings, and performs safe deep merge.
   */
  function validateAndMergeBackup(parsed, defaultState) {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Import payload must be a non-empty JSON object.");
    }

    // Recursive prototype pollution check
    if (containsDangerousKeys(parsed)) {
      throw new Error("Forbidden prototype-pollution keys detected in import payload.");
    }

    const merged = JSON.parse(JSON.stringify(defaultState));

    // Validate and merge user
    if (parsed.user && typeof parsed.user === "object" && !Array.isArray(parsed.user)) {
      if (typeof parsed.user.name === "string") {
        // Sanitize name: strip HTML tags, preserve normal Unicode letters, numbers, spaces, hyphens
        const sanitizedName = parsed.user.name
          .replace(/<[^>]*>/g, "")
          .replace(/[^a-zA-Z0-9\s\-\.\u00C0-\u024F\u1E00-\u1EFF]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 40);
        if (sanitizedName.length > 0) {
          merged.user.name = sanitizedName;
        }
      }
      if (["A1", "A2", "B1", "B2", "C1"].includes(parsed.user.level)) {
        merged.user.level = parsed.user.level;
      }
      if (typeof parsed.user.dailyGoal === "number" && isFinite(parsed.user.dailyGoal)) {
        merged.user.dailyGoal = Math.max(1, Math.min(500, Math.round(parsed.user.dailyGoal)));
      }
      if (typeof parsed.user.sessionSize === "number" && isFinite(parsed.user.sessionSize)) {
        merged.user.sessionSize = Math.max(1, Math.min(100, Math.round(parsed.user.sessionSize)));
      }
      if (typeof parsed.user.streak === "number" && isFinite(parsed.user.streak)) {
        merged.user.streak = Math.max(0, Math.min(100000, Math.round(parsed.user.streak)));
      }
      if (typeof parsed.user.totalXp === "number" && isFinite(parsed.user.totalXp)) {
        merged.user.totalXp = Math.max(0, Math.min(10000000, Math.round(parsed.user.totalXp)));
      }
      if (typeof parsed.user.lastActiveDate === "string" && isValidISODateString(parsed.user.lastActiveDate)) {
        merged.user.lastActiveDate = parsed.user.lastActiveDate.slice(0, 10);
      }
    }

    // Validate and merge settings
    if (parsed.settings && typeof parsed.settings === "object" && !Array.isArray(parsed.settings)) {
      if (["dark", "light"].includes(parsed.settings.theme)) {
        merged.settings.theme = parsed.settings.theme;
      }
      if (typeof parsed.settings.sessionSize === "number" && isFinite(parsed.settings.sessionSize)) {
        merged.settings.sessionSize = Math.max(1, Math.min(100, Math.round(parsed.settings.sessionSize)));
      }
      if (typeof parsed.settings.dailyGoal === "number" && isFinite(parsed.settings.dailyGoal)) {
        merged.settings.dailyGoal = Math.max(1, Math.min(500, Math.round(parsed.settings.dailyGoal)));
      }
      if (typeof parsed.settings.autoAdvance === "boolean") {
        merged.settings.autoAdvance = parsed.settings.autoAdvance;
      }
      if (typeof parsed.settings.hapticFeedback === "boolean") {
        merged.settings.hapticFeedback = parsed.settings.hapticFeedback;
      }
    }

    const SAFE_ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
    const MAX_ITEMS = 25000;

    // Validate and merge progress
    if (parsed.progress && typeof parsed.progress === "object" && !Array.isArray(parsed.progress)) {
      if (parsed.progress.grammarCompleted && typeof parsed.progress.grammarCompleted === "object") {
        let count = 0;
        for (const [k, v] of Object.entries(parsed.progress.grammarCompleted)) {
          if (count++ >= 500) break;
          if (typeof k === "string" && SAFE_ID_REGEX.test(k) && v && typeof v === "object") {
            merged.progress.grammarCompleted[k] = {
              completedAt: isValidISODateString(v.completedAt) ? v.completedAt : new Date().toISOString(),
              score: typeof v.score === "number" && isFinite(v.score) ? Math.max(0, Math.min(100, Math.round(v.score))) : 100,
              attempts: typeof v.attempts === "number" && isFinite(v.attempts) ? Math.max(1, Math.min(10000, Math.round(v.attempts))) : 1
            };
          }
        }
      }

      if (parsed.progress.comprehensionCompleted && typeof parsed.progress.comprehensionCompleted === "object") {
        let count = 0;
        for (const [k, v] of Object.entries(parsed.progress.comprehensionCompleted)) {
          if (count++ >= 500) break;
          if (typeof k === "string" && SAFE_ID_REGEX.test(k) && v && typeof v === "object") {
            merged.progress.comprehensionCompleted[k] = {
              completedAt: isValidISODateString(v.completedAt) ? v.completedAt : new Date().toISOString(),
              score: typeof v.score === "number" && isFinite(v.score) ? Math.max(0, Math.min(100, Math.round(v.score))) : 100,
              totalQuestions: typeof v.totalQuestions === "number" && isFinite(v.totalQuestions) ? Math.max(1, Math.min(100, Math.round(v.totalQuestions))) : 4
            };
          }
        }
      }

      if (parsed.progress.wordsBookmarked && typeof parsed.progress.wordsBookmarked === "object") {
        let count = 0;
        for (const [k, v] of Object.entries(parsed.progress.wordsBookmarked)) {
          if (count++ >= MAX_ITEMS) break;
          if (typeof k === "string" && SAFE_ID_REGEX.test(k) && v === true) {
            merged.progress.wordsBookmarked[k] = true;
          }
        }
      }

      if (parsed.progress.studyDays && typeof parsed.progress.studyDays === "object") {
        let count = 0;
        for (const [dateStr, dayCount] of Object.entries(parsed.progress.studyDays)) {
          if (count++ >= 3650) break;
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr) && isValidISODateString(dateStr) && typeof dayCount === "number" && isFinite(dayCount) && dayCount >= 0) {
            merged.progress.studyDays[dateStr] = Math.min(100000, Math.round(dayCount));
          }
        }
      }

      if (parsed.progress.articleStats && typeof parsed.progress.articleStats === "object") {
        const stats = parsed.progress.articleStats;
        if (typeof stats.totalDrilled === "number" && isFinite(stats.totalDrilled)) {
          merged.progress.articleStats.totalDrilled = Math.max(0, Math.min(10000000, Math.round(stats.totalDrilled)));
        }
        if (typeof stats.correct === "number" && isFinite(stats.correct)) {
          merged.progress.articleStats.correct = Math.max(0, Math.min(10000000, Math.round(stats.correct)));
        }
        if (stats.mistakes && typeof stats.mistakes === "object") {
          let count = 0;
          for (const [noun, mCount] of Object.entries(stats.mistakes)) {
            if (count++ >= MAX_ITEMS) break;
            if (typeof noun === "string" && noun.length <= 60 && typeof mCount === "number" && isFinite(mCount)) {
              merged.progress.articleStats.mistakes[noun] = Math.max(0, Math.min(100000, Math.round(mCount)));
            }
          }
        }
      }

      if (parsed.progress.dailyStats && typeof parsed.progress.dailyStats === "object") {
        if (typeof parsed.progress.dailyStats.date === "string" && isValidISODateString(parsed.progress.dailyStats.date)) {
          merged.progress.dailyStats.date = parsed.progress.dailyStats.date.slice(0, 10);
        }
        if (typeof parsed.progress.dailyStats.learnedToday === "number" && isFinite(parsed.progress.dailyStats.learnedToday)) {
          merged.progress.dailyStats.learnedToday = Math.max(0, Math.min(100000, Math.round(parsed.progress.dailyStats.learnedToday)));
        }
      }
    }

    // Validate and merge SRS
    if (parsed.srs && typeof parsed.srs === "object" && parsed.srs.cards && typeof parsed.srs.cards === "object") {
      let count = 0;
      for (const [cardId, card] of Object.entries(parsed.srs.cards)) {
        if (count++ >= MAX_ITEMS) break;
        if (typeof cardId === "string" && SAFE_ID_REGEX.test(cardId) && card && typeof card === "object") {
          merged.srs.cards[cardId] = {
            id: typeof card.id === "string" && SAFE_ID_REGEX.test(card.id) ? card.id : cardId,
            type: typeof card.type === "string" && ["vocab", "grammar"].includes(card.type) ? card.type : "vocab",
            interval: typeof card.interval === "number" && isFinite(card.interval) ? Math.max(0, Math.min(36500, Math.round(card.interval))) : 0,
            easeFactor: typeof card.easeFactor === "number" && isFinite(card.easeFactor) ? Math.max(1.3, Math.min(3.5, card.easeFactor)) : 2.5,
            repetitions: typeof card.repetitions === "number" && isFinite(card.repetitions) ? Math.max(0, Math.min(100000, Math.round(card.repetitions))) : 0,
            lapses: typeof card.lapses === "number" && isFinite(card.lapses) ? Math.max(0, Math.min(100000, Math.round(card.lapses))) : 0,
            dueDate: isValidISODateString(card.dueDate) ? card.dueDate : new Date().toISOString(),
            state: ["new", "learning", "review"].includes(card.state) ? card.state : "new",
            lastReview: isValidISODateString(card.lastReview) ? card.lastReview : null
          };
        }
      }
    }

    return merged;
  }

  const NederLearning = {
    escapeHTML,
    getLocalISODate,
    isValidISODateString,
    shuffleArray,
    sampleArray,
    normalizeAnswer,
    getDutchVerbStem,
    getVerbHijConjugation,
    getEligibleVerbs,
    getNounPlural,
    generateFlashcardSession,
    createFillBlankCard,
    containsDangerousKeys,
    validateAndMergeBackup
  };

  global.NederLearning = NederLearning;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = NederLearning;
  }
})(typeof window !== "undefined" ? window : globalThis);
