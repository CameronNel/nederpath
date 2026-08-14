// NederPath Spaced Repetition System (SM-2 / Leitner Hybrid Engine)
(function (global) {
  "use strict";

  const SAFE_CARD_ID_REGEX = /^[A-Za-z0-9_-]{1,80}$/;
  const ALLOWED_CARD_TYPES = new Set(["vocab", "grammar", "comprehension", "article"]);
  const MAX_INTERVAL_DAYS = 36500;

  function isSafeCardId(cardId) {
    return typeof cardId === "string" && SAFE_CARD_ID_REGEX.test(cardId);
  }

  function toTimestamp(value) {
    if (typeof value !== "string") return null;
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  function clampInteger(value, min, max, fallback) {
    if (!Number.isFinite(value)) return fallback;
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  function clampEase(value) {
    if (!Number.isFinite(value)) return 2.5;
    return Math.max(1.3, Math.min(3.5, value));
  }

  class SRSEngine {
    constructor(store) {
      this.store = store;
    }

    getCard(cardId, type = "vocab", createIfMissing = true) {
      if (!isSafeCardId(cardId)) {
        throw new TypeError("Invalid SRS card id.");
      }

      if (!this.store || !this.store.state || !this.store.state.srs) {
        throw new Error("SRS store is unavailable.");
      }

      if (!this.store.state.srs.cards || typeof this.store.state.srs.cards !== "object" || Array.isArray(this.store.state.srs.cards)) {
        this.store.state.srs.cards = {};
      }

      const cards = this.store.state.srs.cards;
      const hasCard = Object.prototype.hasOwnProperty.call(cards, cardId);
      if (!hasCard && createIfMissing) {
        cards[cardId] = {
          id: cardId,
          type: ALLOWED_CARD_TYPES.has(type) ? type : "vocab",
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          lapses: 0,
          dueDate: new Date().toISOString(),
          state: "new",
          lastReview: null
        };
      }
      return Object.prototype.hasOwnProperty.call(cards, cardId) ? cards[cardId] : null;
    }

    /**
     * Process review rating according to the app's SM-2-inspired scheduler.
     * 1: Again, 2: Hard, 3: Good, 4: Easy.
     */
    review(cardId, rating, type = "vocab") {
      // Validate every dependency before card creation so rejected calls are non-mutating.
      if (!Number.isInteger(rating) || rating < 1 || rating > 4) {
        throw new RangeError("SRS rating must be an integer from 1 through 4.");
      }
      if (!this.store || typeof this.store.recordActivity !== "function") {
        throw new Error("SRS store cannot record review activity.");
      }

      const card = this.getCard(cardId, type, true);
      const now = new Date();

      // Repair any pre-existing malformed numeric state before doing arithmetic.
      card.interval = clampInteger(card.interval, 0, MAX_INTERVAL_DAYS, 0);
      card.easeFactor = clampEase(card.easeFactor);
      card.repetitions = clampInteger(card.repetitions, 0, 100000, 0);
      card.lapses = clampInteger(card.lapses, 0, 100000, 0);
      card.id = cardId;
      card.type = ALLOWED_CARD_TYPES.has(card.type) ? card.type : (ALLOWED_CARD_TYPES.has(type) ? type : "vocab");

      if (rating === 1) {
        card.lapses = Math.min(100000, card.lapses + 1);
        card.repetitions = 0;
        card.interval = 1;
        card.state = "learning";
        card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
      } else {
        if (card.repetitions === 0) {
          card.interval = 1;
        } else if (card.repetitions === 1) {
          card.interval = rating === 4 ? 6 : 3;
        } else {
          card.interval = Math.round(card.interval * card.easeFactor);
        }

        const grade = rating + 1;
        card.easeFactor = clampEase(
          card.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
        );

        if (rating === 4) {
          card.interval = Math.round(card.interval * 1.3);
        } else if (rating === 2) {
          card.interval = Math.max(1, Math.round(card.interval * 0.8));
        }

        card.interval = clampInteger(card.interval, 1, MAX_INTERVAL_DAYS, 1);
        card.repetitions = Math.min(100000, card.repetitions + 1);
        card.state = "review";
      }

      card.interval = clampInteger(card.interval, 1, MAX_INTERVAL_DAYS, 1);
      const nextDue = new Date(now.getTime() + card.interval * 24 * 60 * 60 * 1000);
      card.dueDate = nextDue.toISOString();
      card.lastReview = now.toISOString();

      this.store.recordActivity(rating >= 2 ? 10 : 3);
      return card;
    }

    getDueCards(type = null) {
      const now = Date.now();
      const all = Object.values((this.store && this.store.state && this.store.state.srs && this.store.state.srs.cards) || {});
      return all
        .filter((card) => {
          if (!card || typeof card !== "object") return false;
          if (type && card.type !== type) return false;
          const due = toTimestamp(card.dueDate);
          return due !== null && due <= now;
        })
        .sort((a, b) => toTimestamp(a.dueDate) - toTimestamp(b.dueDate));
    }

    getDeckStats() {
      const all = Object.values((this.store && this.store.state && this.store.state.srs && this.store.state.srs.cards) || {});
      const now = Date.now();
      let due = 0;
      let learning = 0;
      let mastered = 0;
      const total = all.length;

      for (const card of all) {
        if (!card || typeof card !== "object") continue;
        const dueTimestamp = toTimestamp(card.dueDate);
        if (dueTimestamp !== null && dueTimestamp <= now) due++;
        if (card.state === "learning") learning++;
        if (Number.isFinite(card.repetitions) && Number.isFinite(card.interval) && card.repetitions >= 4 && card.interval >= 21) {
          mastered++;
        }
      }

      return { total, due, learning, mastered };
    }
  }

  global.NederSRS = new SRSEngine(global.NederStore);
})(typeof window !== "undefined" ? window : globalThis);
