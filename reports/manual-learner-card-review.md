# Pass 2 learner-card manual review

`reports/manual-learner-sample-200.json` was regenerated after the final lexical source corrections by `node scripts/select_learner_card_sample.mjs`. The deterministic queue contains exactly 200 of 4,245 learner-facing rows, seeded across all five CEFR levels, all 11 learner-visible POS values, and 53 categories. It was read in four batches of 50 cards.

For each card I checked the displayed Dutch surface (including noun article), lemma/provenance, POS, CEFR band, English gloss, category, and `learnable: true` status. I also checked that phrases were not treated as inflections and that typed source senses did not lose their provenance. The final queue contained no unresolved spelling, article, gloss, POS, classification, or learner-suitability problem.

The first pre-final queue exposed `stilte vallen` as an unsafe phrase and several ordinary plural source headwords. Those rows were retired or corrected to singular lemmas with explicit exact plurals, the bank was regenerated, and this 200-card review was restarted from the new deterministic queue. This is evidence of the hostile review loop, not a deferred limitation.

Final sample coverage: A1 62, A2 53, B1 62, B2 22, C1 1; adjectives 7, adverbs 6, conjunctions 1, determiners 1, interjections 2, nouns 151, particle 1, phrase 1, prepositions 1, pronouns 1, verbs 28. Proper-name rows are intentionally excluded from learner-card sampling because they are curated non-learnable references with no de/het article.
