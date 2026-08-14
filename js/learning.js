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

  const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{1,80}$/;
  const MAX_ITEMS = 25000;

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
   * Never shifts based on UTC offset, including invalid-input fallback.
   */
  function getLocalISODate(date = new Date()) {
    const parsed = date instanceof Date ? date : new Date(date);
    const d = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Validates if a string is a legitimate, finite ISO date with strict calendar and leap-year validation.
   */
  function isValidISODateString(str) {
    if (typeof str !== "string" || str.length > 35) return false;
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(?:Z|[+-]\d{2}:\d{2})?)?$/);
    if (!match) return false;
    const [, yStr, mStr, dStr, hrStr, minStr, secStr] = match;
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);
    const day = parseInt(dStr, 10);
    if (year < 2000 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) return false;

    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day > daysInMonth[month - 1]) return false;

    if (hrStr !== undefined) {
      const hr = parseInt(hrStr, 10);
      const min = parseInt(minStr, 10);
      const sec = parseInt(secStr, 10);
      if (hr < 0 || hr > 23 || min < 0 || min > 59 || sec < 0 || sec > 59) return false;
    }

    const d = new Date(str);
    return !Number.isNaN(d.getTime());
  }

  function canonicalISOString(value, fallback = null) {
    if (!isValidISODateString(value)) return fallback;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
  }

  function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
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
    if (!Array.isArray(arr) || arr.length === 0) return [];
    const requestedCount = Number.isFinite(count) ? Math.floor(count) : 10;
    if (requestedCount <= 0) return [];
    if (arr.length <= requestedCount) return shuffleArray(arr);
    const shuffled = shuffleArray(arr);
    return shuffled.slice(0, requestedCount);
  }

  /**
   * Normalizes answers for exact grading while preserving meaningful Dutch
   * orthography such as apostrophes and hyphens. Sentence punctuation remains
   * ignorable; Unicode composed/decomposed forms compare consistently.
   */
  function normalizeAnswer(str) {
    if (typeof str !== "string") return "";
    return str
      .normalize("NFC")
      .replace(/[’‘]/g, "'")
      .trim()
      .toLocaleLowerCase("nl-NL")
      .replace(/\s+/g, " ")
      .replace(/[.,/#!$%^&*;:{}=_`~()?"“”]/g, "");
  }

  /**
   * Extracts a best-effort Dutch verb stem. This helper is retained for
   * compatibility and utility use. Learner-facing verb practice is gated by
   * getVerifiedVerbHijConjugation instead of trusting this heuristic.
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

    if (
      base.length >= 2 &&
      base[base.length - 1] === base[base.length - 2] &&
      /[bcdfghjklmnpqrstvwxz]/.test(base[base.length - 1])
    ) {
      base = base.slice(0, -1);
    } else {
      const match = base.match(/^(.*?)([aeou])([bcdfghjklmnpqrstvwxz])$/);
      if (match) {
        const [, prefix, vowel, consonant] = match;
        if (!prefix || !/[aeiou]/.test(prefix.slice(-1))) {
          base = `${prefix}${vowel}${vowel}${consonant}`;
        }
      }
    }

    if (base.endsWith("v")) {
      base = base.slice(0, -1) + "f";
    } else if (base.endsWith("z")) {
      base = base.slice(0, -1) + "s";
    }

    return base;
  }

  /**
   * Builds or returns cached indexes on the words bank for O(1) lookups.
   */
  function getWordBankIndexes(wordsBank) {
    if (!Array.isArray(wordsBank)) return null;
    if (wordsBank._np_indexes) return wordsBank._np_indexes;

    const lemmaToHij = new Map();
    const lemmaToVerifiedHij = new Map();
    const lemmaToPastParticiple = new Map();
    const lemmaToPlural = new Map();
    const eligibleVerbs = [];

    for (let i = 0; i < wordsBank.length; i++) {
      const w = wordsBank[i];
      if (!w) continue;

      if (w.pos === "verb") {
        if (w.lemma) {
          const lKey = w.lemma.toLowerCase().trim();
          const meaning = (w.meaning || "").toLowerCase();
          const isExplicitHij = w.inflectionType === "hij-form";
          const isLegacyHij =
            !w.inflectionType &&
            (meaning.includes("present-tense 'hij/zij' form") || meaning.includes("present-tense 'hij' form"));

          if ((isExplicitHij || isLegacyHij) && w.word && !lemmaToHij.has(lKey)) {
            lemmaToHij.set(lKey, w.word.toLowerCase().trim());
          }
          if (isExplicitHij && w.word && !lemmaToVerifiedHij.has(lKey)) {
            lemmaToVerifiedHij.set(lKey, w.word.toLowerCase().trim());
          }
          if (w.inflectionType === "past-participle" && w.word && !lemmaToPastParticiple.has(lKey)) {
            lemmaToPastParticiple.set(lKey, w.word.toLowerCase().trim());
          }
        }
        if (w.inflectionType === "lemma" && w.learnable !== false) {
          const wordStr = (w.word || "").toLowerCase().trim();
          const isStandardInfinitive =
            wordStr.endsWith("en") || ["zijn", "gaan", "staan", "doen", "zien", "slaan"].includes(wordStr);
          if (isStandardInfinitive) eligibleVerbs.push(w);
        }
      } else if (w.pos === "noun" && w.lemma) {
        const lKey = w.lemma.toLowerCase().trim();
        const meaning = (w.meaning || "").toLowerCase();
        const isDirectPlural =
          w.inflectionType === "plural" ||
          (!w.inflectionType &&
            !meaning.includes("diminutive") &&
            (meaning.startsWith("plural of") || meaning.includes("(plural of")));
        if (isDirectPlural && w.word && !lemmaToPlural.has(lKey)) {
          lemmaToPlural.set(lKey, w.word.toLowerCase().trim());
        }
      }
    }

    const indexes = {
      lemmaToHij,
      lemmaToVerifiedHij,
      lemmaToPastParticiple,
      lemmaToPlural,
      eligibleVerbs
    };

    try {
      Object.defineProperty(wordsBank, "_np_indexes", {
        value: indexes,
        writable: true,
        configurable: true,
        enumerable: false
      });
    } catch {
      // Caching is optional. Frozen arrays must remain valid read-only inputs.
    }

    return indexes;
  }

  /**
   * Resolves only an authoritative hij/zij finite form: either a deliberately
   * curated irregular or an explicit hij-form row emitted from curated metadata.
   */
  function getVerifiedVerbHijConjugation(infinitive, wordsBank = null) {
    if (!infinitive || typeof infinitive !== "string") return null;
    const inf = infinitive.toLowerCase().trim();
    if (IRREGULAR_HIJ_VERBS[inf]) return IRREGULAR_HIJ_VERBS[inf];
    if (!Array.isArray(wordsBank)) return null;
    const indexes = getWordBankIndexes(wordsBank);
    return indexes && indexes.lemmaToVerifiedHij.has(inf) ? indexes.lemmaToVerifiedHij.get(inf) : null;
  }

  /**
   * Conservative separability detector for practice gating. A participle with
   * internal "ge" after a lexical prefix (afgesproken, uitgenodigd,
   * hardgelopen) makes a bare one-token hij/zij prompt context-dependent, so
   * the verb is excluded until structured separability metadata exists.
   */
  function hasSeparableParticiplePattern(infinitive, wordsBank) {
    if (!Array.isArray(wordsBank)) return false;
    const inf = String(infinitive || "").toLowerCase().trim();
    if (!inf || /^(be|ge|her|ont|ver)/.test(inf)) return false;
    const indexes = getWordBankIndexes(wordsBank);
    const participle = indexes && indexes.lemmaToPastParticiple.get(inf);
    if (!participle) return false;
    const geIndex = participle.indexOf("ge");
    return geIndex > 0 && geIndex < participle.length - 2;
  }

  /**
   * General compatibility helper for hij/zij present tense forms. Explicit
   * bank data wins, followed by the historical best-effort weak-verb fallback.
   * Learner-facing practice does NOT use this fallback for eligibility.
   */
  function getVerbHijConjugation(infinitive, wordsBank = null) {
    if (!infinitive || typeof infinitive !== "string") return null;
    const inf = infinitive.toLowerCase().trim();

    if (IRREGULAR_HIJ_VERBS[inf]) return IRREGULAR_HIJ_VERBS[inf];

    if (Array.isArray(wordsBank)) {
      const indexes = getWordBankIndexes(wordsBank);
      if (indexes && indexes.lemmaToHij.has(inf)) {
        return indexes.lemmaToHij.get(inf);
      }
    }

    const stem = getDutchVerbStem(inf);
    if (!stem) return null;
    return stem.endsWith("t") ? stem : stem + "t";
  }

  /**
   * Filters a word bank to trustworthy infinitive lemmas for one-token hij/zij
   * practice. Guessed paradigms and likely separable verbs are deliberately
   * excluded rather than teaching a confidently wrong answer.
   */
  function getEligibleVerbs(wordsBank) {
    if (!Array.isArray(wordsBank)) return [];
    const indexes = getWordBankIndexes(wordsBank);
    const candidates = indexes
      ? indexes.eligibleVerbs
      : wordsBank.filter((w) => w && w.pos === "verb" && w.inflectionType === "lemma" && w.learnable !== false);

    return candidates.filter((v) => {
      const wordStr = (v.word || "").toLowerCase().trim();
      const verifiedHij = getVerifiedVerbHijConjugation(wordStr, wordsBank);
      return typeof verifiedHij === "string" && verifiedHij.length > 0 && !hasSeparableParticiplePattern(wordStr, wordsBank);
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
      const indexes = getWordBankIndexes(wordsBank);
      if (indexes && indexes.lemmaToPlural.has(lemma)) return indexes.lemmaToPlural.get(lemma);
    }
    return null;
  }

  /**
   * Generates a flashcard session. Due SRS cards are placed first, then unseen
   * learnable words, with the historical early-review fallback retained only
   * when the unseen pool is exhausted.
   */
  function generateFlashcardSession({ wordsBank = [], srsCards = {}, dueCards = [], sessionSize = 10 } = {}) {
    const requestedSize = Number.isFinite(sessionSize) ? Math.floor(sessionSize) : 10;
    const size = Math.max(1, Math.min(100, requestedSize));
    const words = Array.isArray(wordsBank) ? wordsBank : [];

    const sessionCards = [];
    const sessionIds = new Set();
    const allTrackedIds = new Set(
      Array.isArray(srsCards)
        ? srsCards.map((c) => c && c.id).filter(Boolean)
        : Object.keys(srsCards || {})
    );

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

    if (sessionCards.length < size) {
      const remainingNeeded = size - sessionCards.length;
      const fallbackEligible = words.filter((w) => w && w.learnable !== false && !sessionIds.has(w.id));
      const sampledFallback = sampleArray(fallbackEligible, remainingNeeded);
      for (const w of sampledFallback) {
        sessionCards.push(w);
        sessionIds.add(w.id);
      }
    }

    return sessionCards;
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function literalTokenRegex(value) {
    const escaped = escapeRegExp(value);
    return new RegExp(`(^|[^\\p{L}\\p{M}\\p{N}_])(${escaped})(?=$|[^\\p{L}\\p{M}\\p{N}_])`, "iu");
  }

  function stableStringId(value) {
    let hash = 2166136261;
    const input = String(value);
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  /**
   * Creates a stable Fill-in-the-Blank card using only explicit, literal,
   * regex-safe target metadata. Invalid/missing targets fail closed instead of
   * silently substituting an arbitrary sentence word.
   */
  function createFillBlankCard(sentenceItem, wordsBank = []) {
    if (!sentenceItem || typeof sentenceItem.nl !== "string" || !sentenceItem.nl.trim()) return null;
    if (sentenceItem.clozeEligible === false) return null;

    const sentence = sentenceItem.nl;
    const candidates = [];
    if (typeof sentenceItem.targetWord === "string" && sentenceItem.targetWord.trim()) {
      candidates.push(sentenceItem.targetWord.trim());
    }
    if (Array.isArray(sentenceItem.targetWords)) {
      for (const rawTarget of sentenceItem.targetWords) {
        if (typeof rawTarget !== "string" || !rawTarget.trim()) continue;
        const candidate = rawTarget.trim();
        if (!candidates.includes(candidate)) candidates.push(candidate);
      }
    }

    let targetRegex = null;
    for (const candidate of candidates) {
      const regex = literalTokenRegex(candidate);
      if (regex.test(sentence)) {
        targetRegex = literalTokenRegex(candidate);
        break;
      }
    }
    if (!targetRegex) return null;

    const match = targetRegex.exec(sentence);
    if (!match) return null;
    const matchedActual = match[2];
    const maskedSentence = sentence.replace(targetRegex, (full, prefix) => `${prefix}_______`);

    const candidateDistractors = [];
    if (Array.isArray(wordsBank) && wordsBank.length > 0) {
      const sentenceLower = sentence.normalize("NFC").toLocaleLowerCase("nl-NL");
      const sampled = sampleArray(wordsBank, 50);
      for (const w of sampled) {
        const wordStr = typeof w?.word === "string" ? w.word.trim() : "";
        const normalizedWord = wordStr.normalize("NFC").toLocaleLowerCase("nl-NL");
        if (
          wordStr &&
          normalizedWord !== matchedActual.normalize("NFC").toLocaleLowerCase("nl-NL") &&
          !sentenceLower.includes(normalizedWord) &&
          !candidateDistractors.some((d) => d.normalize("NFC").toLocaleLowerCase("nl-NL") === normalizedWord)
        ) {
          candidateDistractors.push(wordStr);
          if (candidateDistractors.length === 3) break;
        }
      }
    }

    const fallbackDistractors = ["altijd", "samen", "misschien", "zeker", "morgen", "nooit"];
    for (const fb of fallbackDistractors) {
      if (candidateDistractors.length >= 3) break;
      if (normalizeAnswer(fb) !== normalizeAnswer(matchedActual) && !candidateDistractors.includes(fb)) {
        candidateDistractors.push(fb);
      }
    }

    const options = shuffleArray([matchedActual, ...candidateDistractors.slice(0, 3)]);
    return {
      id: typeof sentenceItem.id === "string" && SAFE_ID_REGEX.test(sentenceItem.id)
        ? sentenceItem.id
        : `fib-${stableStringId(sentence)}`,
      originalSentence: sentence,
      translation: typeof sentenceItem.en === "string" ? sentenceItem.en : "",
      targetWord: matchedActual,
      maskedSentence,
      options,
      category: typeof sentenceItem.category === "string" ? sentenceItem.category : "general",
      level: ["A1", "A2", "B1", "B2", "C1"].includes(sentenceItem.level) ? sentenceItem.level : "A1"
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
      if (key === "__proto__" || key === "constructor" || key === "prototype") return true;
      if (containsDangerousKeys(value[key])) return true;
    }
    return false;
  }

  /**
   * Validates imported backup JSON, rejects invalid/dangerous payloads,
   * enforces numeric and collection bounds, sanitizes strings, and performs safe deep merge.
   */
  function validateAndMergeBackup(parsed, defaultState) {
    if (!isRecord(parsed)) throw new Error("Import payload must be a non-empty JSON object.");
    if (containsDangerousKeys(parsed)) throw new Error("Forbidden prototype-pollution keys detected in import payload.");

    const merged = JSON.parse(JSON.stringify(defaultState));

    if (isRecord(parsed.user)) {
      if (typeof parsed.user.name === "string") {
        const sanitizedName = parsed.user.name
          .replace(/<[^>]*>/g, "")
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 50);
        if (sanitizedName.length > 0) merged.user.name = sanitizedName;
      }
      if (["A1", "A2", "B1", "B2", "C1"].includes(parsed.user.level)) merged.user.level = parsed.user.level;
      if (typeof parsed.user.dailyGoal === "number" && Number.isFinite(parsed.user.dailyGoal)) {
        merged.user.dailyGoal = Math.max(1, Math.min(500, Math.round(parsed.user.dailyGoal)));
      }
      if (typeof parsed.user.sessionSize === "number" && Number.isFinite(parsed.user.sessionSize)) {
        merged.user.sessionSize = Math.max(1, Math.min(100, Math.round(parsed.user.sessionSize)));
      }
      if (typeof parsed.user.streak === "number" && Number.isFinite(parsed.user.streak)) {
        merged.user.streak = Math.max(0, Math.min(100000, Math.round(parsed.user.streak)));
      }
      if (typeof parsed.user.totalXp === "number" && Number.isFinite(parsed.user.totalXp)) {
        merged.user.totalXp = Math.max(0, Math.min(10000000, Math.round(parsed.user.totalXp)));
      }
      if (typeof parsed.user.lastActiveDate === "string" && isValidISODateString(parsed.user.lastActiveDate)) {
        merged.user.lastActiveDate = parsed.user.lastActiveDate.slice(0, 10);
      }
    }

    if (isRecord(parsed.settings)) {
      if (["dark", "light"].includes(parsed.settings.theme)) merged.settings.theme = parsed.settings.theme;
      if (typeof parsed.settings.sessionSize === "number" && Number.isFinite(parsed.settings.sessionSize)) {
        merged.settings.sessionSize = Math.max(1, Math.min(100, Math.round(parsed.settings.sessionSize)));
      }
      if (typeof parsed.settings.dailyGoal === "number" && Number.isFinite(parsed.settings.dailyGoal)) {
        merged.settings.dailyGoal = Math.max(1, Math.min(500, Math.round(parsed.settings.dailyGoal)));
      }
      if (typeof parsed.settings.autoAdvance === "boolean") merged.settings.autoAdvance = parsed.settings.autoAdvance;
      if (typeof parsed.settings.hapticFeedback === "boolean") merged.settings.hapticFeedback = parsed.settings.hapticFeedback;
    }

    if (isRecord(parsed.progress)) {
      if (isRecord(parsed.progress.grammarCompleted)) {
        let accepted = 0;
        for (const [k, v] of Object.entries(parsed.progress.grammarCompleted)) {
          if (accepted >= 500) break;
          if (SAFE_ID_REGEX.test(k) && isRecord(v)) {
            merged.progress.grammarCompleted[k] = {
              completedAt: canonicalISOString(v.completedAt, new Date().toISOString()),
              score: typeof v.score === "number" && Number.isFinite(v.score) ? Math.max(0, Math.min(100, Math.round(v.score))) : 100,
              attempts: typeof v.attempts === "number" && Number.isFinite(v.attempts) ? Math.max(1, Math.min(10000, Math.round(v.attempts))) : 1
            };
            accepted++;
          }
        }
      }

      if (isRecord(parsed.progress.comprehensionCompleted)) {
        let accepted = 0;
        for (const [k, v] of Object.entries(parsed.progress.comprehensionCompleted)) {
          if (accepted >= 500) break;
          if (SAFE_ID_REGEX.test(k) && isRecord(v)) {
            merged.progress.comprehensionCompleted[k] = {
              completedAt: canonicalISOString(v.completedAt, new Date().toISOString()),
              score: typeof v.score === "number" && Number.isFinite(v.score) ? Math.max(0, Math.min(100, Math.round(v.score))) : 100,
              totalQuestions: typeof v.totalQuestions === "number" && Number.isFinite(v.totalQuestions) ? Math.max(1, Math.min(100, Math.round(v.totalQuestions))) : 4
            };
            accepted++;
          }
        }
      }

      if (isRecord(parsed.progress.wordsBookmarked)) {
        let accepted = 0;
        for (const [k, v] of Object.entries(parsed.progress.wordsBookmarked)) {
          if (accepted >= MAX_ITEMS) break;
          if (SAFE_ID_REGEX.test(k) && v === true) {
            merged.progress.wordsBookmarked[k] = true;
            accepted++;
          }
        }
      }

      if (isRecord(parsed.progress.studyDays)) {
        let accepted = 0;
        for (const [dateStr, dayCount] of Object.entries(parsed.progress.studyDays)) {
          if (accepted >= 3650) break;
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr) && isValidISODateString(dateStr) && typeof dayCount === "number" && Number.isFinite(dayCount) && dayCount >= 0) {
            merged.progress.studyDays[dateStr] = Math.min(100000, Math.round(dayCount));
            accepted++;
          }
        }
      }

      if (isRecord(parsed.progress.articleStats)) {
        const stats = parsed.progress.articleStats;
        if (typeof stats.totalDrilled === "number" && Number.isFinite(stats.totalDrilled)) {
          merged.progress.articleStats.totalDrilled = Math.max(0, Math.min(10000000, Math.round(stats.totalDrilled)));
        }
        if (typeof stats.correct === "number" && Number.isFinite(stats.correct)) {
          merged.progress.articleStats.correct = Math.max(0, Math.min(10000000, Math.round(stats.correct)));
        }
        merged.progress.articleStats.correct = Math.min(merged.progress.articleStats.correct, merged.progress.articleStats.totalDrilled);

        if (isRecord(stats.mistakes)) {
          let accepted = 0;
          for (const [noun, mCount] of Object.entries(stats.mistakes)) {
            if (accepted >= MAX_ITEMS) break;
            if (typeof noun === "string" && noun.length <= 60 && typeof mCount === "number" && Number.isFinite(mCount)) {
              merged.progress.articleStats.mistakes[noun] = Math.max(0, Math.min(100000, Math.round(mCount)));
              accepted++;
            }
          }
        }
      }

      if (isRecord(parsed.progress.dailyStats)) {
        if (typeof parsed.progress.dailyStats.date === "string" && isValidISODateString(parsed.progress.dailyStats.date)) {
          merged.progress.dailyStats.date = parsed.progress.dailyStats.date.slice(0, 10);
        }
        if (typeof parsed.progress.dailyStats.learnedToday === "number" && Number.isFinite(parsed.progress.dailyStats.learnedToday)) {
          merged.progress.dailyStats.learnedToday = Math.max(0, Math.min(100000, Math.round(parsed.progress.dailyStats.learnedToday)));
        }
      }
    }

    if (isRecord(parsed.srs) && isRecord(parsed.srs.cards)) {
      let accepted = 0;
      for (const [cardId, card] of Object.entries(parsed.srs.cards)) {
        if (accepted >= MAX_ITEMS) break;
        if (SAFE_ID_REGEX.test(cardId) && isRecord(card)) {
          const nowIso = new Date().toISOString();
          merged.srs.cards[cardId] = {
            id: cardId,
            type: typeof card.type === "string" && ["vocab", "grammar", "comprehension", "article"].includes(card.type) ? card.type : "vocab",
            interval: typeof card.interval === "number" && Number.isFinite(card.interval) ? Math.max(0, Math.min(36500, Math.round(card.interval))) : 0,
            easeFactor: typeof card.easeFactor === "number" && Number.isFinite(card.easeFactor) ? Math.max(1.3, Math.min(3.5, card.easeFactor)) : 2.5,
            repetitions: typeof card.repetitions === "number" && Number.isFinite(card.repetitions) ? Math.max(0, Math.min(100000, Math.round(card.repetitions))) : 0,
            lapses: typeof card.lapses === "number" && Number.isFinite(card.lapses) ? Math.max(0, Math.min(100000, Math.round(card.lapses))) : 0,
            dueDate: canonicalISOString(card.dueDate, nowIso),
            state: ["new", "learning", "review"].includes(card.state) ? card.state : "new",
            lastReview: canonicalISOString(card.lastReview, null)
          };
          accepted++;
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
    getWordBankIndexes,
    getVerifiedVerbHijConjugation,
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
