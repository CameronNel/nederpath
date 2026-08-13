// NederPath State Management & Storage Store (Namespace: nederpath-v1)
(function (global) {
  "use strict";

  const STORAGE_KEY = "nederpath-v1";
  const CURRENT_VERSION = 1;

  function getDateStr(d = new Date()) {
    if (global.NederLearning && typeof global.NederLearning.getLocalISODate === "function") {
      return global.NederLearning.getLocalISODate(d);
    }
    const date = d instanceof Date ? d : new Date(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const DEFAULT_STATE = {
    version: CURRENT_VERSION,
    user: {
      name: "Learner",
      level: "A1",
      dailyGoal: 15, // target review/study items per day
      sessionSize: 10, // cards per practice session
      onboardingCompleted: true,
      streak: 0,
      lastActiveDate: null,
      totalXp: 0,
      createdAt: new Date().toISOString()
    },
    settings: {
      theme: "dark", // 'dark' | 'light'
      sessionSize: 10,
      dailyGoal: 15,
      autoAdvance: true,
      hapticFeedback: true
    },
    srs: {
      // cardId -> { id, type: 'vocab'|'grammar'|'comprehension'|'article', interval, easeFactor, repetitions, dueDate, lapses, state: 'new'|'learning'|'review' }
      cards: {}
    },
    progress: {
      grammarCompleted: {}, // ruleId -> { completedAt, score, attempts }
      comprehensionCompleted: {}, // passageId -> { completedAt, score, totalQuestions }
      wordsBookmarked: {}, // wordId -> true
      studyDays: {}, // 'YYYY-MM-DD' -> count of items reviewed/learned
      articleStats: {
        totalDrilled: 0,
        correct: 0,
        mistakes: {} // word -> count
      },
      dailyStats: {
        date: getDateStr(),
        learnedToday: 0
      }
    }
  };

  class Store {
    constructor() {
      this.state = this.load();
      this.listeners = new Set();
      this.checkDailyReset();
    }

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
        const parsed = JSON.parse(raw);
        if (global.NederLearning && typeof global.NederLearning.validateAndMergeBackup === "function") {
          return global.NederLearning.validateAndMergeBackup(parsed, DEFAULT_STATE);
        }
        return Object.assign({}, DEFAULT_STATE, parsed, {
          user: Object.assign({}, DEFAULT_STATE.user, parsed.user),
          settings: Object.assign({}, DEFAULT_STATE.settings, parsed.settings),
          progress: Object.assign({}, DEFAULT_STATE.progress, parsed.progress, {
            articleStats: Object.assign({}, DEFAULT_STATE.progress.articleStats, parsed.progress ? parsed.progress.articleStats : {})
          }),
          srs: Object.assign({}, DEFAULT_STATE.srs, parsed.srs)
        });
      } catch (e) {
        console.error("Failed to load NederPath storage:", e);
        return JSON.parse(JSON.stringify(DEFAULT_STATE));
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
        // Calculate streak
        if (this.state.user.lastActiveDate) {
          const lastParts = this.state.user.lastActiveDate.split("-").map(Number);
          const currParts = todayStr.split("-").map(Number);
          const lastDate = new Date(lastParts[0], lastParts[1] - 1, lastParts[2]);
          const currDate = new Date(currParts[0], currParts[1] - 1, currParts[2]);
          const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

          if (diffDays > 1) {
            // Streak broken
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

      if (changed && !skipSave) {
        this.save();
      }
    }

    recordActivity(xpGained = 5) {
      const todayStr = getDateStr();
      this.checkDailyReset(true);

      this.state.progress.dailyStats.learnedToday = (this.state.progress.dailyStats.learnedToday || 0) + 1;
      this.state.user.totalXp = (this.state.user.totalXp || 0) + xpGained;

      // Update studyDays heatmap
      this.state.progress.studyDays[todayStr] = (this.state.progress.studyDays[todayStr] || 0) + 1;

      // Update streak using calendar-day difference
      if (this.state.user.lastActiveDate !== todayStr) {
        if (this.state.user.lastActiveDate) {
          const lastParts = this.state.user.lastActiveDate.split("-").map(Number);
          const currParts = todayStr.split("-").map(Number);
          const lastDate = new Date(lastParts[0], lastParts[1] - 1, lastParts[2]);
          const currDate = new Date(currParts[0], currParts[1] - 1, currParts[2]);
          const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            this.state.user.streak = (this.state.user.streak || 0) + 1;
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
      stats.totalDrilled += 1;
      if (chosen === correct) {
        stats.correct += 1;
        this.recordActivity(5);
      } else {
        stats.mistakes[noun] = (stats.mistakes[noun] || 0) + 1;
        this.recordActivity(1);
      }
    }

    toggleBookmark(wordId) {
      if (this.state.progress.wordsBookmarked[wordId]) {
        delete this.state.progress.wordsBookmarked[wordId];
      } else {
        this.state.progress.wordsBookmarked[wordId] = true;
      }
      this.save();
      return !!this.state.progress.wordsBookmarked[wordId];
    }

    isBookmarked(wordId) {
      return !!this.state.progress.wordsBookmarked[wordId];
    }

    completeGrammarRule(ruleId, score = 100) {
      const prev = this.state.progress.grammarCompleted[ruleId] || { attempts: 0, score: 0 };
      const isFirstTime = !this.state.progress.grammarCompleted[ruleId];
      this.state.progress.grammarCompleted[ruleId] = {
        completedAt: new Date().toISOString(),
        score: Math.max(score, prev.score || 0),
        attempts: (prev.attempts || 0) + 1
      };
      // Award XP for completion (higher XP for first completion, review XP otherwise)
      this.recordActivity(isFirstTime ? 25 : 10);
    }

    completeComprehension(passageId, score, totalQuestions) {
      const isFirstTime = !this.state.progress.comprehensionCompleted[passageId];
      this.state.progress.comprehensionCompleted[passageId] = {
        completedAt: new Date().toISOString(),
        score,
        totalQuestions
      };
      // Award XP for quiz completion
      this.recordActivity(isFirstTime ? 30 : 15);
    }

    exportJSON() {
      return JSON.stringify(this.state, null, 2);
    }

    importJSON(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        if (global.NederLearning && typeof global.NederLearning.validateAndMergeBackup === "function") {
          this.state = global.NederLearning.validateAndMergeBackup(parsed, DEFAULT_STATE);
        } else {
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid format");
          this.state = Object.assign({}, DEFAULT_STATE, parsed);
        }
        this.save();
        return true;
      } catch (err) {
        console.error("Import failed:", err);
        return false;
      }
    }

    resetItem(itemId) {
      if (this.state.srs.cards[itemId]) {
        delete this.state.srs.cards[itemId];
      }
      if (this.state.progress.grammarCompleted[itemId]) {
        delete this.state.progress.grammarCompleted[itemId];
      }
      if (this.state.progress.comprehensionCompleted[itemId]) {
        delete this.state.progress.comprehensionCompleted[itemId];
      }
      this.save();
    }

    resetAllData() {
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.save();
    }
  }

  global.NederStore = new Store();
})(typeof window !== "undefined" ? window : globalThis);
