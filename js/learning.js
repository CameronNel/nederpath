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
   * Extracts Dutch verb stem according to spelling rules.
   */
  function getDutchVerbStem(infinitive) {
    if (!infinitive || typeof infinitive !== "string") return "";
    const inf = infinitive.toLowerCase().trim();
    if (!inf.endsWith("en") || inf.length <= 2) return inf;

    let base = inf.slice(0, -2);

    // Double consonant at end -> single (e.g. bakken -> bak, pakken -> pak, zetten -> zet)
    if (base.length >= 2 && base[base.length - 1] === base[base.length - 2] && /[bcdfghjklmnpqrstvwxz]/.test(base[base.length - 1])) {
      base = base.slice(0, -1);
    } else {
      // Vowel lengthening in open syllables (e.g. maken -> maak, hopen -> hoop, praten -> praat)
      // Check single vowel followed by single consonant: [aeou] + consonant
      const match = base.match(/^(.+?)([aeou])([bcdfghjklmnpqrstvwxz])$/);
      if (match) {
        const [, prefix, vowel, consonant] = match;
        // Only double if not already a diphthong or preceded by vowel
        if (!/[aeiou]/.test(prefix.slice(-1))) {
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
          return w.inflectionType === "hij-form" || (w.meaning && w.meaning.includes("present-tense 'hij/zij' form"));
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
   * Validates imported backup JSON, rejects invalid/dangerous payloads,
   * and performs a safe deep merge with defaults.
   */
  function validateAndMergeBackup(parsed, defaultState) {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Import payload must be a non-empty JSON object.");
    }

    // Prototype pollution prevention
    const dangerousKeys = ["__proto__", "constructor", "prototype"];
    for (const key of dangerousKeys) {
      if (Object.prototype.hasOwnProperty.call(parsed, key)) {
        throw new Error(`Forbidden key '${key}' detected in backup.`);
      }
    }

    const merged = JSON.parse(JSON.stringify(defaultState));

    // Validate and merge user
    if (parsed.user && typeof parsed.user === "object" && !Array.isArray(parsed.user)) {
      if (typeof parsed.user.name === "string" && parsed.user.name.trim()) {
        merged.user.name = parsed.user.name.trim().slice(0, 40);
      }
      if (["A1", "A2", "B1", "B2", "C1"].includes(parsed.user.level)) {
        merged.user.level = parsed.user.level;
      }
      if (typeof parsed.user.dailyGoal === "number" && parsed.user.dailyGoal > 0 && parsed.user.dailyGoal <= 200) {
        merged.user.dailyGoal = Math.round(parsed.user.dailyGoal);
      }
      if (typeof parsed.user.sessionSize === "number" && parsed.user.sessionSize > 0 && parsed.user.sessionSize <= 100) {
        merged.user.sessionSize = Math.round(parsed.user.sessionSize);
      }
      if (typeof parsed.user.streak === "number" && parsed.user.streak >= 0) {
        merged.user.streak = Math.round(parsed.user.streak);
      }
      if (typeof parsed.user.totalXp === "number" && parsed.user.totalXp >= 0) {
        merged.user.totalXp = Math.round(parsed.user.totalXp);
      }
      if (typeof parsed.user.lastActiveDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.user.lastActiveDate)) {
        merged.user.lastActiveDate = parsed.user.lastActiveDate;
      }
    }

    // Validate and merge settings
    if (parsed.settings && typeof parsed.settings === "object" && !Array.isArray(parsed.settings)) {
      if (["dark", "light"].includes(parsed.settings.theme)) {
        merged.settings.theme = parsed.settings.theme;
      }
      if (typeof parsed.settings.sessionSize === "number" && parsed.settings.sessionSize > 0 && parsed.settings.sessionSize <= 100) {
        merged.settings.sessionSize = Math.round(parsed.settings.sessionSize);
      }
      if (typeof parsed.settings.dailyGoal === "number" && parsed.settings.dailyGoal > 0 && parsed.settings.dailyGoal <= 200) {
        merged.settings.dailyGoal = Math.round(parsed.settings.dailyGoal);
      }
      if (typeof parsed.settings.autoAdvance === "boolean") {
        merged.settings.autoAdvance = parsed.settings.autoAdvance;
      }
      if (typeof parsed.settings.hapticFeedback === "boolean") {
        merged.settings.hapticFeedback = parsed.settings.hapticFeedback;
      }
    }

    // Validate and merge progress
    if (parsed.progress && typeof parsed.progress === "object" && !Array.isArray(parsed.progress)) {
      if (parsed.progress.grammarCompleted && typeof parsed.progress.grammarCompleted === "object") {
        for (const [k, v] of Object.entries(parsed.progress.grammarCompleted)) {
          if (typeof k === "string" && v && typeof v === "object") {
            merged.progress.grammarCompleted[k] = {
              completedAt: typeof v.completedAt === "string" ? v.completedAt : new Date().toISOString(),
              score: typeof v.score === "number" ? Math.max(0, Math.min(100, Math.round(v.score))) : 100,
              attempts: typeof v.attempts === "number" ? Math.max(1, Math.round(v.attempts)) : 1
            };
          }
        }
      }

      if (parsed.progress.comprehensionCompleted && typeof parsed.progress.comprehensionCompleted === "object") {
        for (const [k, v] of Object.entries(parsed.progress.comprehensionCompleted)) {
          if (typeof k === "string" && v && typeof v === "object") {
            merged.progress.comprehensionCompleted[k] = {
              completedAt: typeof v.completedAt === "string" ? v.completedAt : new Date().toISOString(),
              score: typeof v.score === "number" ? Math.max(0, Math.min(100, Math.round(v.score))) : 100,
              totalQuestions: typeof v.totalQuestions === "number" ? Math.max(1, Math.round(v.totalQuestions)) : 4
            };
          }
        }
      }

      if (parsed.progress.wordsBookmarked && typeof parsed.progress.wordsBookmarked === "object") {
        for (const [k, v] of Object.entries(parsed.progress.wordsBookmarked)) {
          if (typeof k === "string" && v === true) {
            merged.progress.wordsBookmarked[k] = true;
          }
        }
      }

      if (parsed.progress.studyDays && typeof parsed.progress.studyDays === "object") {
        for (const [dateStr, count] of Object.entries(parsed.progress.studyDays)) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr) && typeof count === "number" && count >= 0) {
            merged.progress.studyDays[dateStr] = Math.round(count);
          }
        }
      }

      if (parsed.progress.articleStats && typeof parsed.progress.articleStats === "object") {
        const stats = parsed.progress.articleStats;
        if (typeof stats.totalDrilled === "number") merged.progress.articleStats.totalDrilled = Math.max(0, Math.round(stats.totalDrilled));
        if (typeof stats.correct === "number") merged.progress.articleStats.correct = Math.max(0, Math.round(stats.correct));
        if (stats.mistakes && typeof stats.mistakes === "object") {
          for (const [noun, mCount] of Object.entries(stats.mistakes)) {
            if (typeof noun === "string" && typeof mCount === "number") {
              merged.progress.articleStats.mistakes[noun] = Math.max(0, Math.round(mCount));
            }
          }
        }
      }

      if (parsed.progress.dailyStats && typeof parsed.progress.dailyStats === "object") {
        if (typeof parsed.progress.dailyStats.date === "string") {
          merged.progress.dailyStats.date = parsed.progress.dailyStats.date;
        }
        if (typeof parsed.progress.dailyStats.learnedToday === "number") {
          merged.progress.dailyStats.learnedToday = Math.max(0, Math.round(parsed.progress.dailyStats.learnedToday));
        }
      }
    }

    // Validate and merge SRS
    if (parsed.srs && typeof parsed.srs === "object" && parsed.srs.cards && typeof parsed.srs.cards === "object") {
      for (const [cardId, card] of Object.entries(parsed.srs.cards)) {
        if (typeof cardId === "string" && card && typeof card === "object") {
          merged.srs.cards[cardId] = {
            id: typeof card.id === "string" ? card.id : cardId,
            type: typeof card.type === "string" ? card.type : "vocab",
            interval: typeof card.interval === "number" ? Math.max(0, Math.round(card.interval)) : 0,
            easeFactor: typeof card.easeFactor === "number" ? Math.max(1.3, Math.min(3.5, card.easeFactor)) : 2.5,
            repetitions: typeof card.repetitions === "number" ? Math.max(0, Math.round(card.repetitions)) : 0,
            lapses: typeof card.lapses === "number" ? Math.max(0, Math.round(card.lapses)) : 0,
            dueDate: typeof card.dueDate === "string" ? card.dueDate : new Date().toISOString(),
            state: ["new", "learning", "review"].includes(card.state) ? card.state : "new",
            lastReview: typeof card.lastReview === "string" ? card.lastReview : null
          };
        }
      }
    }

    return merged;
  }

  const NederLearning = {
    getLocalISODate,
    shuffleArray,
    sampleArray,
    normalizeAnswer,
    getDutchVerbStem,
    getVerbHijConjugation,
    getNounPlural,
    createFillBlankCard,
    validateAndMergeBackup
  };

  global.NederLearning = NederLearning;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = NederLearning;
  }
})(typeof window !== "undefined" ? window : globalThis);
