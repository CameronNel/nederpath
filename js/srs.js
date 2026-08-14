// NederPath Spaced Repetition System (SM-2 / Leitner Hybrid Engine)
(function (global) {
  "use strict";

  const SAFE_CARD_ID_REGEX = /^[A-Za-z0-9_-]{1,80}$/;
  const DANGEROUS_CARD_IDS = new Set(["__proto__", "constructor", "prototype"]);
  const ALLOWED_CARD_TYPES = new Set(["vocab", "grammar", "comprehension", "article"]);
  const ALLOWED_CARD_STATES = new Set(["new", "learning", "review"]);
  const MAX_INTERVAL_DAYS = 36500;

  function isSafeCardId(cardId) {
    return (
      typeof cardId === "string" &&
      SAFE_CARD_ID_REGEX.test(cardId) &&
      !DANGEROUS_CARD_IDS.has(cardId)
    );
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

  function formatSRSInterval(days) {
    if (!Number.isFinite(days) || days <= 1) return "1d";
    if (days < 30) return `${days}d`;
    if (days < 365) return `${Math.round(days / 30)}m (${days}d)`;
    return `${(days / 365).toFixed(1)}y (${days}d)`;
  }

  function formatSRSDutch(days) {
    if (!Number.isFinite(days) || days <= 1) return "1 dag";
    if (days < 30) return `${days} dagen`;
    if (days < 365) return `${Math.round(days / 30)} mnd (${days} dgn)`;
    return `${(days / 365).toFixed(1)} jr (${days} dgn)`;
  }

  /**
   * Create a repaired, detached scheduler snapshot. This is the single source
   * of truth for both preview and persisted review arithmetic.
   */
  function normalizeCardSnapshot(card, cardId, type = "vocab") {
    const source = card && typeof card === "object" ? card : {};
    return {
      id: cardId,
      type: ALLOWED_CARD_TYPES.has(source.type)
        ? source.type
        : (ALLOWED_CARD_TYPES.has(type) ? type : "vocab"),
      interval: clampInteger(source.interval, 0, MAX_INTERVAL_DAYS, 0),
      easeFactor: clampEase(source.easeFactor),
      repetitions: clampInteger(source.repetitions, 0, 100000, 0),
      lapses: clampInteger(source.lapses, 0, 100000, 0),
      state: ALLOWED_CARD_STATES.has(source.state) ? source.state : "new"
    };
  }

  /**
   * Pure scheduler transition shared by review() and previewReview().
   * 1: Again, 2: Hard, 3: Good, 4: Easy.
   */
  function computeReviewOutcome(card, cardId, rating, type = "vocab") {
    const next = normalizeCardSnapshot(card, cardId, type);

    if (rating === 1) {
      next.lapses = Math.min(100000, next.lapses + 1);
      next.repetitions = 0;
      next.interval = 1;
      next.state = "learning";
      next.easeFactor = Math.max(1.3, next.easeFactor - 0.2);
    } else {
      if (next.repetitions === 0) {
        next.interval = 1;
      } else if (next.repetitions === 1) {
        next.interval = rating === 4 ? 6 : 3;
      } else {
        next.interval = Math.round(next.interval * next.easeFactor);
      }

      const grade = rating + 1;
      next.easeFactor = clampEase(
        next.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
      );

      if (rating === 4) {
        next.interval = Math.round(next.interval * 1.3);
      } else if (rating === 2) {
        next.interval = Math.max(1, Math.round(next.interval * 0.8));
      }

      next.interval = clampInteger(next.interval, 1, MAX_INTERVAL_DAYS, 1);
      next.repetitions = Math.min(100000, next.repetitions + 1);
      next.state = "review";
    }

    next.interval = clampInteger(next.interval, 1, MAX_INTERVAL_DAYS, 1);
    return next;
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
     * Uses the exact same pure transition function as previewReview().
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
      const outcome = computeReviewOutcome(card, cardId, rating, type);
      Object.assign(card, outcome);

      const now = new Date();
      const nextDue = new Date(now.getTime() + card.interval * 24 * 60 * 60 * 1000);
      card.dueDate = nextDue.toISOString();
      card.lastReview = now.toISOString();

      this.store.recordActivity(rating >= 2 ? 10 : 3);
      return card;
    }

    /**
     * Pure, non-mutating preview of the scheduler transition used by review().
     */
    previewReview(cardId, rating, type = "vocab") {
      if (!isSafeCardId(cardId)) {
        throw new TypeError("Invalid SRS card id.");
      }
      if (!Number.isInteger(rating) || rating < 1 || rating > 4) {
        throw new RangeError("SRS rating must be an integer from 1 through 4.");
      }

      const cards = (this.store && this.store.state && this.store.state.srs && this.store.state.srs.cards) || {};
      const existing = Object.prototype.hasOwnProperty.call(cards, cardId) ? cards[cardId] : null;
      const outcome = computeReviewOutcome(existing, cardId, rating, type);

      return {
        ...outcome,
        formattedInterval: formatSRSInterval(outcome.interval),
        formattedDutch: formatSRSDutch(outcome.interval)
      };
    }

    /**
     * Preview all 4 ratings (1: Again, 2: Hard, 3: Good, 4: Easy) for a card.
     */
    previewRatings(cardId, type = "vocab") {
      return {
        1: this.previewReview(cardId, 1, type),
        2: this.previewReview(cardId, 2, type),
        3: this.previewReview(cardId, 3, type),
        4: this.previewReview(cardId, 4, type)
      };
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
