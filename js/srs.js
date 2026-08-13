// NederPath Spaced Repetition System (SM-2 / Leitner Hybrid Engine)
(function (global) {
  "use strict";

  class SRSEngine {
    constructor(store) {
      this.store = store;
    }

    getCard(cardId, type = "vocab") {
      const cards = this.store.state.srs.cards;
      if (!cards[cardId]) {
        cards[cardId] = {
          id: cardId,
          type,
          interval: 0, // days
          easeFactor: 2.5, // default SM-2 ease factor
          repetitions: 0,
          lapses: 0,
          dueDate: new Date().toISOString(),
          state: "new", // 'new' | 'learning' | 'review'
          lastReview: null
        };
        this.store.save();
      }
      return cards[cardId];
    }

    /**
     * Process review rating according to SM-2:
     * rating:
     * 1: Again (Total blackout / failed)
     * 2: Hard (Recalled with intense difficulty)
     * 3: Good (Recalled with hesitation / correct)
     * 4: Easy (Perfect instant recall)
     */
    review(cardId, rating, type = "vocab") {
      const card = this.getCard(cardId, type);
      const now = new Date();

      if (rating < 2) {
        // Failed / Again
        card.lapses += 1;
        card.repetitions = 0;
        card.interval = 1; // repeat tomorrow (or same day)
        card.state = "learning";
        card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
      } else {
        // Successful recall
        if (card.repetitions === 0) {
          card.interval = 1;
        } else if (card.repetitions === 1) {
          card.interval = rating === 4 ? 6 : 3;
        } else {
          card.interval = Math.round(card.interval * card.easeFactor);
        }

        // Adjust ease factor
        // EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
        const grade = rating + 1; // scale 2..4 to 3..5
        card.easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));

        if (rating === 4) {
          card.interval = Math.round(card.interval * 1.3); // Bonus for Easy
        } else if (rating === 2) {
          card.interval = Math.max(1, Math.round(card.interval * 0.8)); // Penalty for Hard
        }

        card.repetitions += 1;
        card.state = "review";
      }

      // Schedule next due date
      const nextDue = new Date(now.getTime() + card.interval * 24 * 60 * 60 * 1000);
      card.dueDate = nextDue.toISOString();
      card.lastReview = now.toISOString();

      this.store.save();
      this.store.recordActivity(rating >= 2 ? 10 : 3);
      return card;
    }

    getDueCards(type = null) {
      const nowIso = new Date().toISOString();
      const all = Object.values(this.store.state.srs.cards);
      return all.filter((c) => {
        if (type && c.type !== type) return false;
        return c.dueDate <= nowIso;
      });
    }

    getDeckStats() {
      const all = Object.values(this.store.state.srs.cards);
      const nowIso = new Date().toISOString();
      let due = 0;
      let learning = 0;
      let mastered = 0;
      let total = all.length;

      for (const c of all) {
        if (c.dueDate <= nowIso) due++;
        if (c.state === "learning") learning++;
        if (c.repetitions >= 4 && c.interval >= 21) mastered++;
      }

      return { total, due, learning, mastered };
    }
  }

  global.NederSRS = new SRSEngine(global.NederStore);
})(typeof window !== "undefined" ? window : globalThis);
