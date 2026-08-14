// NederPath State Management & Storage Store (Namespace: nederpath-v1)
(function (global) {
  "use strict";

  const STORAGE_KEY = "nederpath-v1";
  const CURRENT_VERSION = 1;
  const SAFE_ID_REGEX = /^[A-Za-z0-9_-]{1,80}$/;
  const DANGEROUS_OBJECT_KEYS = new Set(["__proto__", "constructor", "prototype"]);
  const MAX_XP = 10000000;
  const MAX_ACTIVITY_COUNT = 100000;

  function isSafeId(value) {
    return typeof value === "string" && SAFE_ID_REGEX.test(value) && !DANGEROUS_OBJECT_KEYS.has(value);
  }

  function boundedInteger(value, min, max, fallback) {
    if (!Number.isFinite(value)) return fallback;
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  function getDateStr(d = new Date()) {
    if (global.NederLearning && typeof global.NederLearning.getLocalISODate === "function") {
      return global.NederLearning.getLocalISODate(d);
    }
    const date = d instanceof Date ? d : new Date(d);
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
    const year = safeDate.getFullYear();
    const month = String(safeDate.getMonth() + 1).padStart(2, "0");
    const day = String(safeDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const DEFAULT_STATE = {
    version: CURRENT_VERSION,
    user: {
      name: "Learner",
      level: "A1",
      dailyGoal: 15,
      sessionSize: 10,
      onboardingCompleted: true,
      streak: 0,
      lastActiveDate: null,
      totalXp: 0,
      createdAt: new Date().toISOString()
    },
    settings: {
      theme: "dark",
      sessionSize: 10,
      dailyGoal: 15,
      autoAdvance: true,
      hapticFeedback: true
    },
    srs: {
      cards: {}
    },
    progress: {
      grammarCompleted: {},
      comprehensionCompleted: {},
      wordsBookmarked: {},
      studyDays: {},
      articleStats: {
        totalDrilled: 0,
        correct: 0,
        mistakes: {}
      },
      dailyStats: {
        date: getDateStr(),
        learnedToday: 0
      }
    }
  };

  function freshDefaultState() {
    const state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    state.user.createdAt = new Date().toISOString();
    state.progress.dailyStats.date = getDateStr();
    state.progress.dailyStats.learnedToday = 0;
    return state;
  }

  class Store {
    constructor() {
      this.state = this.load();
      this.listeners = new Set();
      this.checkDailyReset();
    }

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return freshDefaultState();
        const parsed = JSON.parse(raw);
        if (global.NederLearning && typeof global.NederLearning.validateAndMergeBackup === "function") {
          return global.NederLearning.validateAndMergeBackup(parsed, DEFAULT_STATE);
        }
        console.error("NederPath learning validator unavailable; ignoring persisted state.");
        return freshDefaultState();
      } catch (e) {
        console.error("Failed to load NederPath storage:", e);
        return freshDefaultState();
      }
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        this.notify();
      } catch (e) {
        console.error("Failed to save NederPath storage:", e);
      }
    }

    subscribe(fn) {
      if (typeof fn !== "function") return () => undefined;
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    }

    notify() {
      for (const fn of this.listeners) {
        try {
          fn(this.state);
        } catch (e) {
          console.error("Error in store listener:", e);
        }
      }
    }

    checkDailyReset(skipSave = false) {
      const todayStr = getDateStr();
      let changed = false;

      if (!this.state.progress.dailyStats || this.state.progress.dailyStats.date !== todayStr) {
        if (this.state.user.lastActiveDate) {
          const lastParts = this.state.user.lastActiveDate.split("-").map(Number);
          const currParts = todayStr.split("-").map(Number);
          const lastDate = new Date(lastParts[0], lastParts[1] - 1, lastParts[2]);
          const currDate = new Date(currParts[0], currParts[1] - 1, currParts[2]);
          const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

          if (diffDays > 1) {
            this.state.user.streak = 0;
            changed = true;
          }
        }
        this.state.progress.dailyStats = {
          date: todayStr,
          learnedToday: 0
        };
        changed = true;
      }

      if (changed && !skipSave) this.save();
    }

    recordActivity(xpGained = 5) {
      const todayStr = getDateStr();
      this.checkDailyReset(true);

      const xp = boundedInteger(xpGained, 0, 1000, 0);
      this.state.progress.dailyStats.learnedToday = boundedInteger(
        (this.state.progress.dailyStats.learnedToday || 0) + 1,
        0,
        MAX_ACTIVITY_COUNT,
        1
      );
      this.state.user.totalXp = boundedInteger(
        (this.state.user.totalXp || 0) + xp,
        0,
        MAX_XP,
        xp
      );

      this.state.progress.studyDays[todayStr] = boundedInteger(
        (this.state.progress.studyDays[todayStr] || 0) + 1,
        0,
        MAX_ACTIVITY_COUNT,
        1
      );

      if (this.state.user.lastActiveDate !== todayStr) {
        if (this.state.user.lastActiveDate) {
          const lastParts = this.state.user.lastActiveDate.split("-").map(Number);
          const currParts = todayStr.split("-").map(Number);
          const lastDate = new Date(lastParts[0], lastParts[1] - 1, lastParts[2]);
          const currDate = new Date(currParts[0], currParts[1] - 1, currParts[2]);
          const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            this.state.user.streak = boundedInteger((this.state.user.streak || 0) + 1, 0, 100000, 1);
          } else {
            this.state.user.streak = 1;
          }
        } else {
          this.state.user.streak = 1;
        }
        this.state.user.lastActiveDate = todayStr;
      }

      this.save();
    }

    recordArticleDrill(noun, chosen, correct) {
      const stats = this.state.progress.articleStats;
      stats.totalDrilled = boundedInteger((stats.totalDrilled || 0) + 1, 0, MAX_XP, 1);
      if (chosen === correct) {
        stats.correct = boundedInteger((stats.correct || 0) + 1, 0, stats.totalDrilled, 1);
        this.recordActivity(5);
      } else {
        const rawNoun = typeof noun === "string" ? noun.trim().slice(0, 80) : "";
        const nounKey = rawNoun && !DANGEROUS_OBJECT_KEYS.has(rawNoun) ? rawNoun : "onbekend";
        const previousCount = Object.prototype.hasOwnProperty.call(stats.mistakes, nounKey)
          ? stats.mistakes[nounKey]
          : 0;
        stats.mistakes[nounKey] = boundedInteger((previousCount || 0) + 1, 0, MAX_ACTIVITY_COUNT, 1);
        this.recordActivity(1);
      }
    }

    toggleBookmark(wordId) {
      if (!isSafeId(wordId)) return false;
      if (Object.prototype.hasOwnProperty.call(this.state.progress.wordsBookmarked, wordId)) {
        delete this.state.progress.wordsBookmarked[wordId];
      } else {
        this.state.progress.wordsBookmarked[wordId] = true;
      }
      this.save();
      return this.state.progress.wordsBookmarked[wordId] === true;
    }

    isBookmarked(wordId) {
      return isSafeId(wordId) && this.state.progress.wordsBookmarked[wordId] === true;
    }

    completeGrammarRule(ruleId, score = 100) {
      if (!isSafeId(ruleId)) return false;
      const existing = Object.prototype.hasOwnProperty.call(this.state.progress.grammarCompleted, ruleId)
        ? this.state.progress.grammarCompleted[ruleId]
        : null;
      const prev = existing && typeof existing === "object" ? existing : { attempts: 0, score: 0 };
      const boundedScore = boundedInteger(score, 0, 100, 0);
      const previousScore = boundedInteger(prev.score, 0, 100, 0);
      const previousAttempts = boundedInteger(prev.attempts, 0, 10000, 0);

      this.state.progress.grammarCompleted[ruleId] = {
        completedAt: new Date().toISOString(),
        score: Math.max(boundedScore, previousScore),
        attempts: Math.min(10000, previousAttempts + 1)
      };
      this.recordActivity(existing ? 10 : 25);
      return true;
    }

    completeComprehension(passageId, score, totalQuestions) {
      if (!isSafeId(passageId)) return false;
      const isFirstTime = !Object.prototype.hasOwnProperty.call(this.state.progress.comprehensionCompleted, passageId);
      this.state.progress.comprehensionCompleted[passageId] = {
        completedAt: new Date().toISOString(),
        score: boundedInteger(score, 0, 100, 0),
        totalQuestions: boundedInteger(totalQuestions, 1, 100, 1)
      };
      this.recordActivity(isFirstTime ? 30 : 15);
      return true;
    }

    exportJSON() {
      return JSON.stringify(this.state, null, 2);
    }

    importJSON(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        if (!global.NederLearning || typeof global.NederLearning.validateAndMergeBackup !== "function") {
          throw new Error("Learning validator unavailable");
        }
        this.state = global.NederLearning.validateAndMergeBackup(parsed, DEFAULT_STATE);
        this.save();
        return true;
      } catch (err) {
        console.error("Import failed:", err);
        return false;
      }
    }

    resetItem(itemId) {
      if (!isSafeId(itemId)) return false;
      if (Object.prototype.hasOwnProperty.call(this.state.srs.cards, itemId)) delete this.state.srs.cards[itemId];
      if (Object.prototype.hasOwnProperty.call(this.state.progress.grammarCompleted, itemId)) delete this.state.progress.grammarCompleted[itemId];
      if (Object.prototype.hasOwnProperty.call(this.state.progress.comprehensionCompleted, itemId)) delete this.state.progress.comprehensionCompleted[itemId];
      this.save();
      return true;
    }

    sanitizeStaleWordReferences(validWordIds) {
      if (!validWordIds) return false;
      const validSet = validWordIds instanceof Set ? validWordIds : new Set(validWordIds);
      let modified = false;

      if (this.state.progress && this.state.progress.wordsBookmarked) {
        for (const id of Object.keys(this.state.progress.wordsBookmarked)) {
          if (!validSet.has(id)) {
            delete this.state.progress.wordsBookmarked[id];
            modified = true;
          }
        }
      }

      if (this.state.srs && this.state.srs.cards) {
        for (const id of Object.keys(this.state.srs.cards)) {
          const card = this.state.srs.cards[id];
          if (card && card.type === "vocab" && !validSet.has(id)) {
            delete this.state.srs.cards[id];
            modified = true;
          }
        }
      }

      if (modified) this.save();
      return modified;
    }

    resetAllData() {
      this.state = freshDefaultState();
      this.save();
    }
  }

  global.NederStore = new Store();
})(typeof window !== "undefined" ? window : globalThis);
