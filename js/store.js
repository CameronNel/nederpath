// NederPath State Management & Storage Store (Namespace: nederpath-v1)
(function (global) {
  "use strict";

  const STORAGE_KEY = "nederpath-v1";

  const DEFAULT_STATE = {
    version: 1,
    user: {
      name: "Learner",
      level: "A1",
      dailyGoal: 15, // target review/study items per day
      onboardingCompleted: false,
      streak: 0,
      lastActiveDate: null,
      totalXp: 0,
      createdAt: new Date().toISOString()
    },
    settings: {
      theme: "dark", // dark, light, system
      voiceEnabled: true,
      voiceSpeed: 0.9,
      voicePitch: 1.0,
      autoAdvance: true,
      hapticFeedback: true
    },
    srs: {
      // cardId -> { id, type: 'vocab'|'grammar'|'comprehension', interval, easeFactor, repetitions, dueDate, lapses, state: 'new'|'learning'|'review' }
      cards: {}
    },
    progress: {
      grammarCompleted: {}, // ruleId -> { completedAt, score, attempts }
      comprehensionCompleted: {}, // passageId -> { completedAt, score, totalQuestions }
      wordsBookmarked: {}, // wordId -> true
      studyDays: {}, // 'YYYY-MM-DD' -> count of items reviewed/learned
      dailyStats: {
        date: new Date().toISOString().split("T")[0],
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
        return Object.assign({}, DEFAULT_STATE, parsed, {
          user: Object.assign({}, DEFAULT_STATE.user, parsed.user),
          settings: Object.assign({}, DEFAULT_STATE.settings, parsed.settings),
          progress: Object.assign({}, DEFAULT_STATE.progress, parsed.progress),
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

    checkDailyReset() {
      const todayStr = new Date().toISOString().split("T")[0];
      if (this.state.progress.dailyStats.date !== todayStr) {
        // Calculate streak
        if (this.state.user.lastActiveDate) {
          const lastDate = new Date(this.state.user.lastActiveDate);
          const currDate = new Date(todayStr);
          const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            // Consecutive day: keep streak intact until activity completes it today
          } else if (diffDays > 1) {
            // Streak broken
            this.state.user.streak = 0;
          }
        }
        this.state.progress.dailyStats = {
          date: todayStr,
          learnedToday: 0
        };
        this.save();
      }
    }

    recordActivity(xpGained = 5) {
      const todayStr = new Date().toISOString().split("T")[0];
      this.checkDailyReset();

      this.state.progress.dailyStats.learnedToday += 1;
      this.state.user.totalXp = (this.state.user.totalXp || 0) + xpGained;

      // Update studyDays heatmap
      this.state.progress.studyDays[todayStr] = (this.state.progress.studyDays[todayStr] || 0) + 1;

      // Update streak
      if (this.state.user.lastActiveDate !== todayStr) {
        const lastDate = this.state.user.lastActiveDate ? new Date(this.state.user.lastActiveDate) : null;
        const currDate = new Date(todayStr);
        if (lastDate) {
          const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            this.state.user.streak += 1;
          } else if (diffDays > 1) {
            this.state.user.streak = 1;
          }
        } else {
          this.state.user.streak = 1;
        }
        this.state.user.lastActiveDate = todayStr;
      }

      this.save();
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
      const prev = this.state.progress.grammarCompleted[ruleId] || { attempts: 0 };
      this.state.progress.grammarCompleted[ruleId] = {
        completedAt: new Date().toISOString(),
        score: Math.max(score, prev.score || 0),
        attempts: prev.attempts + 1
      };
      this.recordActivity(15);
    }

    completeComprehension(passageId, score, totalQuestions) {
      this.state.progress.comprehensionCompleted[passageId] = {
        completedAt: new Date().toISOString(),
        score,
        totalQuestions
      };
      this.recordActivity(25);
    }

    resetAllData() {
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.save();
    }
  }

  global.NederStore = new Store();
})(typeof window !== "undefined" ? window : globalThis);
