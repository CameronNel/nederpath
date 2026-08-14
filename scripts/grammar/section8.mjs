// Section 8: C1 Mastery & Stylistics (g-106 – g-120)
export const lessons = [
  {
    id: "g-106",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Archaic and Fossilized Genitive Relics",
    titleNl: "Versteende genitieven",
    summary: "Modern Dutch no longer inflects nouns for genitive case in free syntax, but a closed set of 's-/'s forms and 'der/des' phrases survives in titles, time phrases, and elevated style.",
    rules: [
      "The productive possessive is 'van' or a possessive pronoun: 'het besluit van de raad', not *'des raads besluit' in ordinary prose.",
      "Fossil 's remains in time and evaluation: ''s ochtends', ''s avonds', ''s winters', ''s lands wijs, 's lands eer'. The apostrophe marks a lost schwa, not an English plural.",
      "Elevated or institutional leftovers: 'de heer des huizes', 'in naam des konings', 'ten tijde van', 'ten behoeve van'. Learn them as chunks.",
      "'Der' as a genitive article survives in fixed titles: 'de Staten-Generaal der Nederlanden', 'minister der Financiën' (now usually 'van Financiën').",
      "Do not generate new 'des + noun-s' combinations. *'des ministers voorstel' is pastiche, not contemporary standard."
    ],
    structuralBreakdown: "['s + tijdnoun]  |  [des/der + N (+ -s)] alleen in chunks  |  productief: [N + van + NP]",
    examples: [
      {
        nl: "'s Ochtends leest hij de stukken van de raad, niet des raads stukken.",
        en: "In the morning he reads the council's papers, not 'des raads' papers.",
        highlight: "'s Ochtends / van de raad"
      },
      {
        nl: "Ten behoeve van de vergunninghouder stellen wij uit.",
        en: "For the benefit of the permit holder we postpone.",
        highlight: "Ten behoeve van"
      }
    ],
    commonMistake: "Inventing *'des commissies advies' or dropping the apostrophe in *'sochtends'.",
    correction: "Write 'het advies van de commissie' and keep the apostrophe: ''s ochtends'.",
    prerequisites: ["g-009", "g-095"],
    relatedRules: ["g-107", "g-119"],
    tags: ["genitive", "archaic", "fossil", "c1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Contemporary standard for 'the committee's advice'?",
        options: [
          "des commissies advies",
          "het advies van de commissie",
          "der commissie advies",
          "'s commissies advies"
        ],
        correct: 1,
        explanation: "Free genitive is dead; use 'van'."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Complete the fossilised time phrase (include apostrophe+s).",
        blankWord: "'s avonds",
        sentenceWithBlank: "De ploeg werkt vooral ___.",
        hints: ["'s avonds", "des avonds", "van avond"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Des ministers voorstel werd aangenomen.",
        correctedSentence: "Het voorstel van de minister werd aangenomen.",
        explanation: "Do not coin a living 'des'-genitive."
      },
      {
        type: "multiple_choice",
        question: "Which phrase is a genuine fossil rather than a productive pattern?",
        options: [
          "ten behoeve van de aanvrager",
          "des aanvragers formulier",
          "der aanvraag handtekening",
          "aanvragers des formulier"
        ],
        correct: 0,
        explanation: "'Ten behoeve van' is a fixed PP; the others are invented case."
      }
    ]
  },
  {
    id: "g-107",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Archaic Case Endings in Idiomatic Legal Formulae",
    titleNl: "Verouderde naamvalsuitgangen in juridische formules",
    summary: "Dutch legal language preserves dative and genitive scraps inside prepositional formulae ('ter, ten, des, der') that no longer inflect freely outside those chunks.",
    rules: [
      "'Ter' = 'te' + dative feminine/singular 'der': 'ter inzage', 'ter zitting', 'ter uitvoering van'. The noun after 'ter' is often a verbal noun without an article.",
      "'Ten' = 'te' + dative masculine/neuter or plural: 'ten behoeve van', 'ten aanzien van', 'ten spoedigste', 'ten gevolge van'.",
      "'Inzake' (one word) governs a bare noun: 'inzake het bezwaar' is now common with an article; older style has 'inzake bezwaarschrift X'.",
      "Vocative and Latin tags ('in casu', 'a contrario', 'de jure') sit outside Dutch inflection. Do not add Dutch case endings to them.",
      "If you do not know the fossil, paraphrase: 'ter inzage leggen' → 'ter inzage leggen' (learn it) or 'voor inzage beschikbaar stellen'."
    ],
    structuralBreakdown: "[ter + deverbaal N]  |  [ten + N/adv]  |  [inzake + (het) N]  — geen vrije datief buiten de formule",
    examples: [
      {
        nl: "De stukken liggen ter inzage op het gemeentehuis.",
        en: "The documents are available for inspection at the town hall.",
        highlight: "ter inzage"
      },
      {
        nl: "Ten aanzien van artikel 6 merken wij het volgende op.",
        en: "With regard to article 6 we note the following.",
        highlight: "Ten aanzien van"
      }
    ],
    commonMistake: "Writing *'te de inzage' or *'ten de behoeve van' by inserting a modern article into the fossil.",
    correction: "Keep the chunk intact: 'ter inzage', 'ten behoeve van de aanvrager' (article only on the complement of 'van').",
    prerequisites: ["g-106", "g-096"],
    relatedRules: ["g-118", "g-108"],
    tags: ["legal", "case", "ter", "ten", "c1"],
    exercises: [
      {
        type: "fill_in_the_blank",
        prompt: "Choose the fossil for 'available for inspection'.",
        blankWord: "ter inzage",
        sentenceWithBlank: "Het rapport ligt ___ in de bibliotheek.",
        hints: ["ter inzage", "ten inzage", "te de inzage"]
      },
      {
        type: "multiple_choice",
        question: "Correct formula meaning 'with regard to'?",
        options: [
          "ten aanzien van artikel 6",
          "ter aanzien artikel 6",
          "des aanzien artikel 6",
          "te het aanzien artikel 6"
        ],
        correct: 0,
        explanation: "The fixed form is 'ten aanzien van' + NP."
      },
      {
        type: "error_correction",
        sentenceWithError: "De stukken liggen te de inzage.",
        correctedSentence: "De stukken liggen ter inzage.",
        explanation: "The dative article is already fused in 'ter'."
      },
      {
        type: "multiple_choice",
        question: "'Ten gevolge van de storm' is best paraphrased as…",
        options: [
          "tijdens de storm",
          "als gevolg van de storm",
          "krachtens de storm",
          "leve de storm"
        ],
        correct: 1,
        explanation: "'Ten gevolge van' = 'als gevolg van'."
      }
    ]
  },
  {
    id: "g-108",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Deep Nested Tangconstructies in Juridical Texts",
    titleNl: "Diep geneste tangconstructies in juridische teksten",
    summary: "Judgments often nest a tang inside another: a finite verb waits for a participle that itself waits for an 'om te' or a relative. C1 writers must be able to draw the brackets and then rewrite.",
    rules: [
      "Identify each pair of jaws: Vfin … Vcluster. A second pair may live inside a relative: 'dat de raad [in 2021 na advies] had genomen'.",
      "Legal Dutch historically tolerated very long first pairs. Current style guides (Rijkshuisstijl, Klaroen) ask you to close the first cluster before opening a heavy relative.",
      "When two clusters compete, keep the matrix participle next to its auxiliary: 'heeft … overwogen dat…' rather than 'heeft dat … overwogen' with twenty words in between.",
      "A third nest ('om … te kunnen laten toetsen') should usually become a new sentence or a nominal 'ter toetsing'.",
      "Reading strategy: find the last verb, walk left to its auxiliary, then parse leftovers as extras or relatives."
    ],
    structuralBreakdown: "[hulp] + [NP [rel: pv … cluster2]] + [cluster1]  →  [hulp] + [lichte NP] + [cluster1] + [relatief/dat-zin]",
    examples: [
      {
        nl: "De rechtbank heeft het besluit dat het college na de zienswijzen die in mei waren ingediend had genomen vernietigd.",
        en: "The court quashed the decision that the executive had taken after the views submitted in May.",
        highlight: "heeft … vernietigd (outer jaws)"
      },
      {
        nl: "De rechtbank heeft het besluit vernietigd dat het college had genomen na de zienswijzen die in mei waren ingediend.",
        en: "The court quashed the decision that the executive had taken after the views that had been submitted in May.",
        highlight: "heeft het besluit vernietigd dat…"
      }
    ],
    commonMistake: "Leaving 'heeft' and 'vernietigd' twenty-five words apart with two relatives inside the jaws.",
    correction: "Close the matrix cluster immediately after the head noun, then attach the relatives.",
    prerequisites: ["g-101", "g-107"],
    relatedRules: ["g-115", "g-118"],
    tags: ["tangconstructie", "legal", "nesting", "c1"],
    exercises: [
      {
        type: "error_correction",
        sentenceWithError: "De rechtbank heeft het besluit dat het college na de zienswijzen die in mei waren ingediend had genomen vernietigd.",
        correctedSentence: "De rechtbank heeft het besluit vernietigd dat het college had genomen na de zienswijzen die in mei waren ingediend.",
        explanation: "Unnest: matrix cluster first, then the 'dat'-relative, then the inner relative."
      },
      {
        type: "multiple_choice",
        question: "In the overloaded sentence, what is the outer right jaw?",
        options: ["had genomen", "waren ingediend", "vernietigd", "heeft"],
        correct: 2,
        explanation: "Matrix 'heeft … vernietigd' is the outer pair."
      },
      {
        type: "multiple_choice",
        question: "Best first repair step?",
        options: [
          "Add another 'dat'",
          "Place 'vernietigd' right after 'het besluit'",
          "Delete all relatives",
          "Front 'mei'"
        ],
        correct: 1,
        explanation: "Closing the matrix jaws is the cheapest parse aid."
      },
      {
        type: "word_order",
        translation: "The court has quashed the decision.",
        tokens: ["De", "rechtbank", "heeft", "het", "besluit", "vernietigd"],
        correctSentence: "De rechtbank heeft het besluit vernietigd"
      }
    ]
  },
  {
    id: "g-109",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Prepositional Syntagms with Double Prepositions",
    titleNl: "Voorzetselgroepen met dubbele voorzetsels",
    summary: "Dutch has complex prepositions made of two parts ('van … uit', 'op … na', 'tot … toe') whose complement sits in the middle, plus adjacent PPs that only look double.",
    rules: [
      "Circumpositions wrap the NP: 'van hieruit' / 'van het balkon af', 'tot de grens toe', 'op één na alle leden'. The second element is historically an adverb.",
      "'Op … na' means 'except': 'Op één tegenstem na werd het aangenomen.' Do not read it as locative 'on … after'.",
      "'Van … uit' gives a vantage point: 'Van de gemeente uit bezien is dit haalbaar.' Closely related: 'vanuit de gemeente' (one word, slightly more spatial).",
      "True stacked PPs are different: 'met betrekking tot', 'in tegenstelling tot' — complex but left-headed, not wrapping.",
      "Pronominal adverbs can split: 'daar … van uit', but 'vanuit daar' is now common. Both occur; house styles differ."
    ],
    structuralBreakdown: "[P1 + NP + P2/partikel]  |  [complex P + NP]  |  [vanuit / tot aan] als één voorzetsel",
    examples: [
      {
        nl: "Op twee onthoudingen na stemde de raad voor het voorstel.",
        en: "Except for two abstentions the council voted for the proposal.",
        highlight: "Op twee onthoudingen na"
      },
      {
        nl: "Van de provincie uit is er geen bezwaar tot de grens toe.",
        en: "From the province's point of view there is no objection right up to the border.",
        highlight: "Van de provincie uit / tot de grens toe"
      }
    ],
    commonMistake: "Reading 'op één na' as a location, or writing *'na op één' in the English order 'after one'.",
    correction: "Keep the wrap: 'op één na alle aanwezigen' = all but one of those present.",
    prerequisites: ["g-028", "g-072"],
    relatedRules: ["g-107", "g-110"],
    tags: ["prepositions", "circumposition", "op-na", "c1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "'Op één tegenstem na' means…",
        options: [
          "after one vote against, then something else",
          "except for one vote against",
          "on top of one later vote",
          "according to article one"
        ],
        correct: 1,
        explanation: "'Op X na' = except X."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Complete the circumposition 'except'.",
        blankWord: "na",
        sentenceWithBlank: "Op drie leden ___ was iedereen aanwezig.",
        hints: ["na", "toe", "uit"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Na op één tegenstem werd het voorstel aangenomen.",
        correctedSentence: "Op één tegenstem na werd het voorstel aangenomen.",
        explanation: "The NP is wrapped by 'op … na'."
      },
      {
        type: "multiple_choice",
        question: "Which is a wrapping circumposition, not a left-headed complex P?",
        options: [
          "met betrekking tot het rapport",
          "tot de grens toe",
          "in tegenstelling tot het advies",
          "krachtens artikel 6"
        ],
        correct: 1,
        explanation: "'Tot … toe' wraps the NP; the others take a complement to the right only."
      }
    ]
  },
  {
    id: "g-110",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Stylistic Ellipsis in Headline and Proverbial Syntax",
    titleNl: "Stilistische ellips in koppen en spreekwoorden",
    summary: "Headlines, proverbs, and slogans drop articles, copulas, and finite auxiliaries; the missing pieces are recoverable from genre, not from a special 'headline tense' paradigm.",
    rules: [
      "News heads often omit articles and 'zijn/worden': 'Minister opgestapt na lek' = 'De minister is opgestapt na een lek'.",
      "Finite verbs that remain are usually present or a participle used as a label, not a full perfect: 'Raad stemt in', 'Vergunning geweigerd'.",
      "Proverbs freeze older syntax: 'Wie niet waagt, wie niet wint' (gapped second clause), 'Hoe later op de avond, hoe schoner volk' (no copula).",
      "Do not import headline ellipsis into running text. A judgment that reads 'College afgewezen verzoek' is not formal; it is a telegram.",
      "Recoverability test: if you cannot uniquely restore the missing article or auxiliary, the head is ambiguous ('Politie schiet dode' problems)."
    ],
    structuralBreakdown: "[(lidwoord Ø) N] + [(copula Ø) + deelwoord / pv] + [PP]   |   [spreekwoord: gapping / geen copula]",
    examples: [
      {
        nl: "Gemeente weigert vergunning na protest omwonenden",
        en: "Municipality refuses permit after residents' protest",
        highlight: "omitted articles"
      },
      {
        nl: "Hoe meer zielen, hoe meer vreugd.",
        en: "The more souls, the more joy.",
        highlight: "Hoe meer … hoe meer (no verb)"
      }
    ],
    commonMistake: "Writing full reports in head-style: *'College besluit uitstel vanwege kosten' as a body sentence.",
    correction: "In running prose restore grammar: 'Het college besluit tot uitstel vanwege de kosten.'",
    prerequisites: ["g-093", "g-098"],
    relatedRules: ["g-113", "g-120"],
    tags: ["ellipsis", "headlines", "proverbs", "c1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Full-sentence restore of 'Minister opgestapt na lek'?",
        options: [
          "Minister opstappen na lek.",
          "De minister is opgestapt na een lek.",
          "De minister opgestapt het lek.",
          "Men minister opgestapt."
        ],
        correct: 1,
        explanation: "Restore article, copula/auxiliary, and the indefinite article on 'lek'."
      },
      {
        type: "error_correction",
        sentenceWithError: "Het college besluit uitstel vanwege kosten en raadsleden tevreden.",
        correctedSentence: "Het college besluit tot uitstel vanwege de kosten, en de raadsleden zijn tevreden.",
        explanation: "Body text cannot keep headline gapping."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Complete the proverb frame.",
        blankWord: "hoe",
        sentenceWithBlank: "Hoe meer zielen, ___ meer vreugd.",
        hints: ["hoe", "des", "als"]
      },
      {
        type: "multiple_choice",
        question: "Why is the head 'Politie schiet dode' infamous?",
        options: [
          "Because headlines cannot use verbs",
          "Ellipsis makes the object reading ('shoots a dead person') compete with 'shoots, dead man results'",
          "Because 'politie' needs 'men'",
          "Because proverbs forbid nouns"
        ],
        correct: 1,
        explanation: "Unrecoverable role structure is the danger of ellipsis."
      }
    ]
  },
  {
    id: "g-111",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Pragmatic Markers and Intersubjectivity",
    titleNl: "Pragmatische partikels en intersubjectiviteit",
    summary: "Particles such as 'toch', 'eigenlijk', 'hoor', 'zeg maar', and 'immers' do not add truth-conditional content; they manage the common ground between speaker and hearer.",
    rules: [
      "'Toch' can reopen a closed assumption: 'Het is toch binnen gekomen?' seeks confirmation against a doubt. It is not always concessive 'still'.",
      "'Eigenlijk' marks a mismatch with a simpler picture: 'Eigenlijk is het een ander artikel.' It hedges, it does not mean 'real' as an adjective.",
      "'Hoor' (utterance-final) reassures or mildly warns: 'Dat hoeft niet, hoor.' It is informal and almost never written in statutes.",
      "'Immers' presents a reason as already shared: 'We stoppen; het budget is immers op.' Using it for brand-new evidence sounds pushy.",
      "Stacking ('nou toch eigenlijk wel hoor') is spoken and hard to translate particle-by-particle. In essays, pick one marker."
    ],
    structuralBreakdown: "[propositionele kern] + [partikel: toch/eigenlijk/immers/hoor] — stuurt common ground, niet de waarheidstafel",
    examples: [
      {
        nl: "Het budget is immers al toegewezen, dus een nieuwe ronde heeft weinig zin.",
        en: "The budget has already been allocated, as we both know, so a new round makes little sense.",
        highlight: "immers"
      },
      {
        nl: "Dat hoeft u niet te tekenen, hoor.",
        en: "You really don't have to sign that, you know.",
        highlight: "hoor"
      }
    ],
    commonMistake: "Translating 'eigenlijk' as 'actually' in every slot, or putting utterance-final 'hoor' in a judgment.",
    correction: "Use 'eigenlijk' only for a corrective nuance. Drop 'hoor' from formal writing.",
    prerequisites: ["g-094", "g-097"],
    relatedRules: ["g-113", "g-116"],
    tags: ["particles", "pragmatics", "intersubjectivity", "c1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Function of 'immers' in 'Het budget is immers op'?",
        options: [
          "introduces brand-new surprising news",
          "treats the reason as already in the common ground",
          "marks a toast",
          "negates the clause"
        ],
        correct: 1,
        explanation: "'Immers' presents the reason as shared knowledge."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Informal reassuring particle at the end.",
        blankWord: "hoor",
        sentenceWithBlank: "Dat hoeft niet, ___.",
        hints: ["hoor", "immers", "derhalve"]
      },
      {
        type: "error_correction",
        sentenceWithError: "De rechtbank overweegt, hoor, dat het beroep slaagt.",
        correctedSentence: "De rechtbank overweegt dat het beroep slaagt.",
        explanation: "'Hoor' is a spoken hearer-oriented particle, not judicial style."
      },
      {
        type: "multiple_choice",
        question: "'Eigenlijk is het een ander artikel' signals…",
        options: [
          "the article is fake",
          "a correction of a simpler assumption",
          "a genitive fossil",
          "deontic duty"
        ],
        correct: 1,
        explanation: "'Eigenlijk' flags a mismatch with the expected description."
      }
    ]
  },
  {
    id: "g-112",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Semantic Shift and False Friends (Valse Vrienden)",
    titleNl: "Betekenisverschuiving en valse vrienden",
    summary: "Several high-frequency Dutch words look like English or German cognates but have shifted: 'eventueel', 'actueel', 'overkomen', 'solliciteren', 'brief', 'winkel'.",
    rules: [
      "'Eventueel' means 'if any / should the case arise', not English 'eventually' (that is 'uiteindelijk'). 'Eventuele vragen' = any questions that may arise.",
      "'Actueel' means 'topical, current', not 'actual' ('werkelijk, daadwerkelijk').",
      "'Solliciteren' is 'to apply for a job', not 'to solicit'. 'Een brief' is a letter, not briefs. 'Een winkel' is a shop, not an angle.",
      "German traps: 'bellen' is 'to ring/call', not 'to bark'; 'merken' is 'to notice', not only 'to mark'; 'dus' is inferential, not German 'also' in every use.",
      "When in doubt, check collocations, not etymology. 'Een eventuele vertraging' collocates with hypothetical delay, not with the end of a process."
    ],
    structuralBreakdown: "[NL-vorm ≈ EN/DE-vorm] ⇏ [zelfde betekenis]  — toets collocatie: eventueel=indien van toepassing; actueel=nu speelbaar",
    examples: [
      {
        nl: "Stuur eventuele bijlagen mee; de beslissing volgt uiteindelijk in mei.",
        en: "Send any attachments if applicable; the decision will eventually come in May.",
        highlight: "eventuele ≠ uiteindelijk"
      },
      {
        nl: "Het is een actueel debat, maar geen daadwerkelijk wetsvoorstel.",
        en: "It is a current debate, but not an actual bill.",
        highlight: "actueel / daadwerkelijk"
      }
    ],
    commonMistake: "Writing *'Eventueel kwam de trein aan' intending 'Eventually the train arrived'.",
    correction: "Use 'Uiteindelijk kwam de trein aan.' Reserve 'eventueel' for contingencies.",
    prerequisites: ["g-097", "g-111"],
    relatedRules: ["g-119", "g-120"],
    tags: ["false-friends", "lexis", "register", "c1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Best Dutch for English 'eventually'?",
        options: ["eventueel", "uiteindelijk", "actueel", "solliciterend"],
        correct: 1,
        explanation: "'Uiteindelijk' is the temporal 'in the end'."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Meaning 'any … that may arise'.",
        blankWord: "eventuele",
        sentenceWithBlank: "Noteer ___ wijzigingen in de marge.",
        hints: ["eventuele", "uiteindelijke", "actuele"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Eventueel heeft de commissie ingestemd.",
        correctedSentence: "Uiteindelijk heeft de commissie ingestemd.",
        explanation: "Completed outcome is 'uiteindelijk', not 'eventueel'."
      },
      {
        type: "multiple_choice",
        question: "'Een actueel onderwerp' means…",
        options: [
          "an actual (real) subject as opposed to a fake one",
          "a topical / currently relevant subject",
          "an eventual subject",
          "a shop subject"
        ],
        correct: 1,
        explanation: "'Actueel' = currently in the news or on the agenda."
      }
    ]
  },
  {
    id: "g-113",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Register Inversion and Irony in Essayistic Prose",
    titleNl: "Registerbreuk en ironie in essayistisch proza",
    summary: "Irony in Dutch essays often works by dropping a spoken particle or slang noun into a high periodic sentence, or by using conspicuously official diction about a trivial object.",
    rules: [
      "Register inversion: a bureaucratic frame ('onderhavige kwestie') applied to something small ('onderhavige sok') signals mock-solemnity.",
      "The reverse — 'nou ja, die wet is een zooitje' in a legal essay — can be biting if used once. Repeated slang collapses the essay into chat.",
      "Scare quotes in Dutch ('zogenaamd', 'zogeheten', or quotation marks) flag distance. Overuse looks juvenile.",
      "Ironic understatement often uses litotes plus a particle: 'Dat was niet bepaald een meesterzet, zeg maar.'",
      "Readers only get the irony if the default register of the genre is stable. Mix three registers at once and the signal drowns."
    ],
    structuralBreakdown: "[hoog frame + laag object] of [laag partikel in hoge periode] = ironie  |  [één breuk per alinea]",
    examples: [
      {
        nl: "Onderhavige koffievlek geeft aanleiding tot nader beraad.",
        en: "The present coffee stain gives cause for further deliberation.",
        highlight: "Onderhavige koffievlek"
      },
      {
        nl: "De minister presenteerde, nou ja, een visie.",
        en: "The minister presented, well, a vision.",
        highlight: "nou ja"
      }
    ],
    commonMistake: "Stacking slang, scare quotes, and mock-legalese in one sentence so the reader cannot tell which layer is the joke.",
    correction: "Keep one stable register and invert a single lexical item.",
    prerequisites: ["g-104", "g-111"],
    relatedRules: ["g-116", "g-120"],
    tags: ["irony", "register", "style", "c1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "What makes 'onderhavige koffievlek' ironic?",
        options: [
          "the word 'koffie' is an NPI",
          "legal determiner 'onderhavige' is applied to a trivial stain",
          "it is a genitive fossil",
          "it is a headline ellipsis"
        ],
        correct: 1,
        explanation: "High legal lexis + low object = mock solemnity."
      },
      {
        type: "multiple_choice",
        question: "Safest way to mark distance from a term in an essay?",
        options: [
          "repeat 'hoor' three times",
          "use one 'zogenaamd' or one pair of quotes",
          "switch to English",
          "use 'men' and 'je' together"
        ],
        correct: 1,
        explanation: "A single distance marker is enough."
      },
      {
        type: "error_correction",
        sentenceWithError: "Onderhavige 'zogenaamde' wet is nou ja echt een zooitje hoor, zeg maar.",
        correctedSentence: "Onderhavige wet is, zeg maar, een zooitje.",
        explanation: "One inversion carries the irony; a pile of markers is noise."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Insert the mock-legal determiner.",
        blankWord: "onderhavige",
        sentenceWithBlank: "De ___ koffievlek vergt nader beraad.",
        hints: ["onderhavige", "eventuele", "actuele"]
      }
    ]
  },
  {
    id: "g-114",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Intonation Contours and Pitch Accent in Focus",
    titleNl: "Intonatiecontouren en toonhoogteaccent bij focus",
    summary: "Spoken Dutch marks focus with a pitch accent (usually a fall or fall-rise) on the focused word; written Dutch approximates this with word order, 'wel/niet', and italics, not with English-style do-support.",
    rules: [
      "Neutral declarative contour: rise through the middle field, fall on the last lexical accent ('Ik heb het RAPPORT gelezen').",
      "Contrastive focus shifts the fall: 'Ik heb het rapport GELEZEN (niet samengevat).' In writing, add the alternative or use 'wel'.",
      "Yes/no questions often end with a rise, but Dutch also uses a fall on the finite verb plus a lighter rise: both occur regionally.",
      "There is no dummy 'do' for emphasis. *'Ik doe het rapport lezen' is not emphatic focus. Use 'Ik heb het rapport wél gelezen.'",
      "Pitch accent interacts with clitics: reduced 'je/'t/d'r' almost never carry focus; switch to 'jij/het/haar' when they are contrastive."
    ],
    structuralBreakdown: "[neutrale val op laatste lexicale accent]  |  [contrast: val op XP + (maar/niet Y)]  |  schrift: wel / hoofdletters / cursief, geen do-support",
    examples: [
      {
        nl: "Ik heb het rapport wél gelezen, maar ik heb het niet samengevat.",
        en: "I DID read the report, but I did not summarise it.",
        highlight: "wél gelezen"
      },
      {
        nl: "JIJ moet tekenen, niet je collega.",
        en: "YOU have to sign, not your colleague.",
        highlight: "JIJ (full pronoun)"
      }
    ],
    commonMistake: "Calquing English emphatic 'do': *'Ik doe het begrijpen' for 'I do understand it'.",
    correction: "Write 'Ik begrijp het wél' or front the contrast: 'Begrijpen doe ik het wel' (infinitive fronting, informal).",
    prerequisites: ["g-092", "g-002"],
    relatedRules: ["g-102", "g-116"],
    tags: ["intonation", "focus", "accent", "c1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Written stand-in for contrastive pitch on the verb 'read'?",
        options: [
          "Ik doe het rapport lezen.",
          "Ik heb het rapport wél gelezen.",
          "Ik heb het rapport men lezen.",
          "Ik heb het rapport derhalve."
        ],
        correct: 1,
        explanation: "Emphatic 'wel' (often with accent) replaces English do-support."
      },
      {
        type: "error_correction",
        sentenceWithError: "Ik doe het begrijpen.",
        correctedSentence: "Ik begrijp het wel.",
        explanation: "Dutch has no emphatic dummy 'doen' in this structure."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Use the stressed pronoun for contrast.",
        blankWord: "Jij",
        sentenceWithBlank: "___ moet tekenen, niet je collega.",
        hints: ["Jij", "Je", "Men"]
      },
      {
        type: "multiple_choice",
        question: "Why is reduced 'je' a bad contrastive focus?",
        options: [
          "Because 'je' cannot be a subject",
          "Unstressed clitics do not carry pitch accent; use 'jij'",
          "Because focus forbids second person",
          "Because 'je' is only generic"
        ],
        correct: 1,
        explanation: "Focus needs the full form that can be accented."
      }
    ]
  },
  {
    id: "g-115",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Ambiguity Resolution in Relative Clause Attachment",
    titleNl: "Ambigue hechting van betrekkelijke bijzinnen",
    summary: "A relative after a complex NP ('de brief van de wethouder die…') can attach high (to 'brief') or low (to 'wethouder'); Dutch has a mild low-attachment preference but style, agreement, and recasting decide.",
    rules: [
      "'Die' vs 'dat' follows the gender/number of the intended head: 'het rapport van de wethouder dat uitlekte' must attach to 'rapport' (het).",
      "When both heads take 'die' ('de brief van de wethouder die…'), agreement on the relative verb can help if one head is plural.",
      "Extraposition after the cluster often favours high attachment to the object: 'Ik heb de brief gelezen die uitlekte.'",
      "Prosody (g-114) and a comma (non-restrictive) also guide readers. Restrictive relatives stay close to their head if you can move the PP away.",
      "If both readings are live and legally relevant, recast: 'de brief die van de wethouder kwam en die uitlekte' vs 'de wethouder die de brief stuurde'."
    ],
    structuralBreakdown: "[N1 + van + N2 + REL] → hechting aan N1 of N2; disambigueer met die/dat, getal, extrapositie of herschrijven",
    examples: [
      {
        nl: "Het rapport van de wethouder dat uitlekte lag op straat.",
        en: "The report by the alderman that leaked was in the street.",
        highlight: "dat → rapport (het)"
      },
      {
        nl: "De brief van de wethouders die gisteren zijn beëdigd, is zoek.",
        en: "The letter from the aldermen who were sworn in yesterday is missing.",
        highlight: "die … zijn → wethouders (plural)"
      }
    ],
    commonMistake: "Leaving 'de brief van de wethouder die zoek is' in a contract, where either the letter or the alderman could be missing.",
    correction: "Recast: 'de zoekgeraakte brief van de wethouder' or 'de brief van de wethouder die vermist wordt'.",
    prerequisites: ["g-048", "g-100"],
    relatedRules: ["g-101", "g-108"],
    tags: ["relatives", "attachment", "ambiguity", "c1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "In 'het rapport van de wethouder dat uitlekte', what leaked?",
        options: [
          "the alderman (forced by 'dat')",
          "the report ('dat' agrees with het-noun)",
          "either, freely",
          "the preposition 'van'"
        ],
        correct: 1,
        explanation: "'Dat' cannot take 'wethouder' (de)."
      },
      {
        type: "multiple_choice",
        question: "Best disambiguation if the LETTER is missing?",
        options: [
          "de brief van de wethouder die zoek is",
          "de zoekgeraakte brief van de wethouder",
          "de brief van de wethouder dat zoek is",
          "de brief der wethouder zoek"
        ],
        correct: 1,
        explanation: "A prenominal participle pins the property on 'brief'."
      },
      {
        type: "error_correction",
        sentenceWithError: "Wij vernietigen de brief van de wethouder die onrechtmatig is.",
        correctedSentence: "Wij vernietigen de brief van de wethouder, omdat die brief onrechtmatig is.",
        explanation: "Spell out which NP is unlawful when both take 'die'."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Relative pronoun for attachment to 'rapport'.",
        blankWord: "dat",
        sentenceWithBlank: "Het rapport van de wethouder ___ uitlekte is openbaar.",
        hints: ["dat", "die", "wie"]
      }
    ]
  },
  {
    id: "g-116",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Free Indirect Discourse (Vrije Indirecte Rede)",
    titleNl: "Vrije indirecte rede",
    summary: "Vrije indirecte rede reports thought or speech without 'dat' or quotation marks, shifting tense and deictics toward the narrator while keeping the character's evaluative words.",
    rules: [
      "Direct: 'Ze dacht: ik moet nú tekenen.' Indirect: 'Ze dacht dat ze toen moest tekenen.' Free indirect: 'Ze moest nú tekenen, dat was duidelijk.'",
      "Tense usually backshifts to the narrative past, but proximal adverbs ('nu', 'hier', 'morgen') may stay, creating the double voice.",
      "Questions and exclamations keep their clause type without quotes: 'En waarom tekende hij niet? Dat was toch belachelijk.'",
      "Particles ('toch', 'hoor', 'eigenlijk') are strong cues that we are inside a character's stance.",
      "Journalistic Dutch uses a milder form after a dash or colon. Academic Dutch should not slip into VIR for other people's claims; attribute them."
    ],
    structuralBreakdown: "[verleden pv + personage-deixis (nu/hier) + partikel/evaluatie] zonder 'dat' of aanhalingstekens",
    examples: [
      {
        nl: "Morgen moest het af zijn. Dat was toch afgesproken?",
        en: "It had to be finished tomorrow. That had been agreed, hadn't it?",
        highlight: "Morgen moest (proximal adverb + past)"
      },
      {
        nl: "Hij tekende. Wat een circus was dit allemaal.",
        en: "He signed. What a circus this all was.",
        highlight: "Wat een circus (character evaluation)"
      }
    ],
    commonMistake: "Mixing unshifted present and narrator past without cues: the reader cannot tell who thinks what.",
    correction: "Either quote, use 'dat', or commit to VIR with a stable past plus a character adverb/particle.",
    prerequisites: ["g-052", "g-111"],
    relatedRules: ["g-113", "g-114"],
    tags: ["speech", "VIR", "narration", "c1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which sentence is free indirect discourse?",
        options: [
          "Ze dacht: ik moet nu tekenen.",
          "Ze dacht dat ze toen moest tekenen.",
          "Ze moest nu tekenen, dat was toch duidelijk.",
          "Men moet nu tekenen."
        ],
        correct: 2,
        explanation: "Past + 'nu' + particle 'toch', no 'dat' and no quotes."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Keep the proximal adverb typical of VIR.",
        blankWord: "Morgen",
        sentenceWithBlank: "___ moest het af zijn, vond ze.",
        hints: ["Morgen", "De volgende dag altijd verplicht", "Eventueel"]
      },
      {
        type: "error_correction",
        sentenceWithError: "De minister overweegt. Dit is toch belachelijk, schrijft de krant zonder aanhaling of 'dat'.",
        correctedSentence: "De minister overweegt dat dit belachelijk is, schrijft de krant.",
        explanation: "News attribution of another party's stance should not be unmarked VIR."
      },
      {
        type: "multiple_choice",
        question: "A hallmark cue of Dutch VIR is…",
        options: [
          "a new subjunctive paradigm",
          "past tense plus a character-oriented particle or 'nu/hier/morgen'",
          "obligatory 'des'",
          "headline ellipsis only"
        ],
        correct: 1,
        explanation: "The double deictic system is the signature."
      }
    ]
  },
  {
    id: "g-117",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Diachronic Evolution of Dutch Verb Clusters",
    titleNl: "Historische ontwikkeling van de werkwoordelijke eindgroep",
    summary: "Middle Dutch allowed several cluster orders; modern standard writing prefers 1-2 or 1-2-3 with auxiliaries left of main verbs, while southern speech and some dialects still show 2-1 and IPP effects.",
    rules: [
      "Number verbs from the finite auxiliary (1) outward: 'dat hij het heeft1 gezien2' (1-2) vs older/southern 'dat hij het gezien2 heeft1' (2-1). Both are grammatical; northern writing prefers 1-2 for two-verb clusters, with real variation.",
      "Three-verb clusters: 'dat hij het moet1 hebben2 gezien3' is a common written order. 'Moet gezien hebben' also occurs. Rigid 'always 1-2-3' claims are false.",
      "IPP (Infinitivus Pro Participio): after a finite auxiliary, a clustering verb that itself selects an infinitive appears as an infinitive: 'heeft laten vallen', not *'heeft gelaten vallen'.",
      "Older texts show double infinitives and mixed orders more freely. Do not 'correct' a seventeenth-century 2-1 cluster against modern house style.",
      "In main clauses only the finite verb leaves the cluster (V2). The historical cluster facts surface in subordinates and in the remainder after V2."
    ],
    structuralBreakdown: "[onderschikking: 1-2 (heeft gezien) ~ 2-1 (gezien heeft)]  |  [IPP: heeft + lateninf + Vinf]  |  V2 tilt alleen 1 naar voren",
    examples: [
      {
        nl: "…dat de raad het voorstel heeft aangenomen.",
        en: "…that the council has adopted the proposal.",
        highlight: "heeft aangenomen (1-2)"
      },
      {
        nl: "Hij heeft het glas laten vallen.",
        en: "He has dropped the glass (lit. let fall).",
        highlight: "heeft laten vallen (IPP)"
      }
    ],
    commonMistake: "Declaring 2-1 (*'dat hij het gezien heeft') 'wrong' in all standard Dutch, or writing *'heeft gelaten vallen'.",
    correction: "Treat 2-1 as a widespread variant, especially in speech. Use the infinitive in IPP: 'heeft laten vallen'.",
    prerequisites: ["g-046", "g-066"],
    relatedRules: ["g-108", "g-119"],
    tags: ["clusters", "IPP", "diachrony", "c1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which sentence shows IPP?",
        options: [
          "Hij heeft het glas gevallen.",
          "Hij heeft het glas laten vallen.",
          "Hij heeft het glas gelaten vallen.",
          "Hij liet het glas heeft vallen."
        ],
        correct: 1,
        explanation: "'Laten' stays infinitive between 'heeft' and 'vallen'."
      },
      {
        type: "error_correction",
        sentenceWithError: "Hij heeft het glas gelaten vallen.",
        correctedSentence: "Hij heeft het glas laten vallen.",
        explanation: "IPP replaces the participle of the clustering verb with an infinitive."
      },
      {
        type: "multiple_choice",
        question: "About 'dat hij het gezien heeft' vs 'heeft gezien':",
        options: [
          "only 1-2 is Dutch",
          "only 2-1 is Dutch",
          "both occur; northern writing often prefers 1-2, speech and the south often allow 2-1",
          "both are ungrammatical after 1900"
        ],
        correct: 2,
        explanation: "Cluster order is variable; do not teach a fake absolute."
      },
      {
        type: "fill_in_the_blank",
        prompt: "IPP form of 'laten'.",
        blankWord: "laten",
        sentenceWithBlank: "Ze heeft de termijn ___ verlopen.",
        hints: ["laten", "gelaten", "liet"]
      }
    ]
  },
  {
    id: "g-118",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Juridical Modality in Treaties and Statutes",
    titleNl: "Juridische modaliteit in verdragen en wetten",
    summary: "Treaty and statute Dutch encodes obligation, permission, and competence with a small closed set: present indicative, 'moet', 'kan', 'is bevoegd', 'is verplicht', plus 'zal' in older treaty style.",
    rules: [
      "The simple present in an article is often performative duty: 'De minister stelt regels vast.' It is not a description of a habit.",
      "'Zal' in older treaties ('De partijen zullen samenwerken') is deontic future, calqued on French 'devront/shall'. Modern Dutch drafting prefers the present or 'moeten'.",
      "'Is bevoegd te' / 'kan' mark competence. 'Is verplicht te' / 'moet' mark duty. Do not use 'mag' in an article if you mean competence of an organ; 'mag' sounds like informal permission.",
      "'Dient te' is a formal deontic, slightly softer than 'moet', common in circulars, less sharp in criminal statutes.",
      "Negated competence is 'is niet bevoegd' or 'kan niet'. 'Mag niet' is everyday prohibition, usable in bye-laws but stylistically lower."
    ],
    structuralBreakdown: "[tegenwoordige tijd = operatieve plicht]  |  [is verplicht / moet]  |  [is bevoegd / kan]  |  [zal = ouder verdrags-shall]",
    examples: [
      {
        nl: "De minister stelt de nadere regels vast.",
        en: "The minister shall lay down the further rules.",
        highlight: "stelt … vast (operative present)"
      },
      {
        nl: "Het college is bevoegd de vergunning te weigeren.",
        en: "The executive is competent to refuse the permit.",
        highlight: "is bevoegd … te weigeren"
      }
    ],
    commonMistake: "Using epistemic 'zal wel' or spoken 'mag' in an operative article, or reading every present as a mere description.",
    correction: "Write 'is bevoegd te' for competence and 'is verplicht te' for duty. Read an article's present as a norm, not a habit.",
    prerequisites: ["g-103", "g-107"],
    relatedRules: ["g-096", "g-108"],
    tags: ["legal", "modality", "statutes", "c1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "'De minister stelt regels vast' in an article is primarily…",
        options: [
          "a habit description",
          "an operative duty/competence in the present",
          "free indirect discourse",
          "a proverb"
        ],
        correct: 1,
        explanation: "Statutory present is normative."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Formal competence, not informal 'mag'.",
        blankWord: "bevoegd",
        sentenceWithBlank: "Het college is ___ de vergunning te weigeren.",
        hints: ["bevoegd", "eventueel", "actueel"]
      },
      {
        type: "multiple_choice",
        question: "Older treaty 'De partijen zullen samenwerken' is closest to…",
        options: [
          "a prediction about the weather",
          "deontic 'shall' / an obligation to cooperate",
          "epistemic 'must be cooperating'",
          "headline ellipsis"
        ],
        correct: 1,
        explanation: "Treaty 'zal' is a deontic future, not a forecast."
      },
      {
        type: "error_correction",
        sentenceWithError: "Artikel 3. Het college mag wel de vergunning weigeren, hoor.",
        correctedSentence: "Artikel 3. Het college is bevoegd de vergunning te weigeren.",
        explanation: "Operative competence uses 'is bevoegd', not spoken 'mag wel, hoor'."
      }
    ]
  },
  {
    id: "g-119",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Sociolinguistic Variation: Standard Dutch vs Polder Dutch",
    titleNl: "Standaardnederlands en Poldernederlands",
    summary: "Poldernederlands is a described prestige-adjacent variety (Stroop) with a lowered/diphthongised pronunciation of 'ij/ei, ui, ou'; it is not a separate grammar, and it is not 'wrong Dutch'.",
    rules: [
      "Standard Dutch (ABN/Standaardnederlands) is a written and broadcast norm. Spoken reality includes regional accents, Moroccan-Dutch youth varieties, and Poldernederlands among highly educated speakers.",
      "Poldernederlands is mainly phonetic: 'tijd' approaching [tɑid], 'huis' more open. Morphosyntax stays standard. Do not invent a Polder conjugation.",
      "Southern and Flemish standard varieties differ in cluster order, 'ge'-diminutives, and polite forms. They are standard in their own centres, not deviations from Hollandic.",
      "Writing for a general audience still follows the Woordenlijst and Onze Taal/Taalunie advice. Accent does not licence non-standard agreement on paper.",
      "Avoid stigmatising labels ('plat', 'fout') for systematic varieties. Describe the variable and choose a register for the task."
    ],
    structuralBreakdown: "[Standaardnederlands = schrijf-/uitzendnorm]  ≠  [Poldernederlands = klankverschuiving ij/ei-ui-ou]  ≠  [regionale standaarden BE/NL-Zuid]",
    examples: [
      {
        nl: "In Poldernederlands klinkt 'tijd' opener, maar men schrijft nog steeds tijd.",
        en: "In Polder Dutch 'tijd' sounds more open, but one still spells tijd.",
        highlight: "klinkt … schrijft"
      },
      {
        nl: "Dat hij het gezien heeft, komt in Vlaamse standaardteksten vaker voor dan in Hollandse.",
        en: "That he has seen it (2-1) occurs more often in Flemish standard texts than in Hollandic ones.",
        highlight: "gezien heeft"
      }
    ],
    commonMistake: "Calling every non-Randstad pronunciation 'incorrect' or claiming Poldernederlands has its own verb endings.",
    correction: "Treat Poldernederlands as a phonetic variety of the standard. Keep standard spelling and agreement in writing.",
    prerequisites: ["g-117", "g-001"],
    relatedRules: ["g-112", "g-120"],
    tags: ["sociolinguistics", "polder", "variation", "c1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Poldernederlands is primarily…",
        options: [
          "a new case system",
          "a phonetic shift in certain diphthongs among (often highly educated) speakers",
          "Belgian legal Dutch",
          "headline syntax"
        ],
        correct: 1,
        explanation: "Stroop's description is about vowels, not morphology."
      },
      {
        type: "multiple_choice",
        question: "How do you spell 'tijd' in a standard text if you speak Poldernederlands?",
        options: ["taid", "tijd", "tyd", "teid"],
        correct: 1,
        explanation: "Pronunciation variety does not change the official spelling."
      },
      {
        type: "error_correction",
        sentenceWithError: "Poldernederlands eist: wij zijnd akkoord.",
        correctedSentence: "Ook in Poldernederlands schrijven we: wij zijn akkoord.",
        explanation: "There is no Polder agreement ending '-d' on 'zijn'."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Official written form.",
        blankWord: "tijd",
        sentenceWithBlank: "De ___ is verstreken.",
        hints: ["tijd", "taid", "tyd"]
      }
    ]
  },
  {
    id: "g-120",
    section: 8,
    sectionTitle: "C1 Mastery & Stylistics",
    level: "C1",
    title: "Syntactic Mastery and Stylistic Polish in Dutch",
    titleNl: "Syntactische beheersing en stilistische afwerking",
    summary: "C1 polish is the coordinated choice of information structure, cluster length, register, and punctuation so that a paragraph can be parsed in one pass without sounding either telegraphic or officialese.",
    rules: [
      "One main claim per sentence; park heavy relatives after the cluster; keep one generic-subject strategy ('men' or 'we' or passive).",
      "Vary sentence length: a short V2 after a long subordinate clears the air. Do not chain four 'dat'-clauses without a full stop.",
      "Prefer a verb when you need tense, modality, or negation; keep a noun when the event is already established (g-093).",
      "Edit particles: one 'immers' or 'eigenlijk' per paragraph is plenty. Drop 'hoor' and 'zeg maar' unless you want a spoken voice.",
      "Final read-aloud test: if you run out of breath before the participle, unload the tang. If every sentence could be a statute, add one concrete verb."
    ],
    structuralBreakdown: "[1 claim / zin] + [korte kaken] + [vaste registerkeuze] + [werkwoord als polariteit telt] + [hardop-test op de tang]",
    examples: [
      {
        nl: "Het college weigert de vergunning. De motivering volgt morgen, nadat de zienswijzen zijn verwerkt.",
        en: "The executive refuses the permit. The reasoning follows tomorrow, after the views have been processed.",
        highlight: "short V2 + controlled subordinate"
      },
      {
        nl: "Niettemin blijft de steekproef klein; derhalve formuleren we het besluit voorzichtig.",
        en: "Nevertheless the sample remains small; we therefore word the decision cautiously.",
        highlight: "niettemin / derhalve"
      }
    ],
    commonMistake: "Showing mastery by maximal length: one 80-word sentence with 'men', 'je', two tangs, and three particles.",
    correction: "Split, close clusters early, pick one generic subject, and keep particles sparse.",
    prerequisites: ["g-101", "g-093", "g-105"],
    relatedRules: ["g-108", "g-113", "g-118"],
    tags: ["style", "editing", "c1", "mastery"],
    exercises: [
      {
        type: "error_correction",
        sentenceWithError: "Men merkt dat je het besluit dat het college na de zienswijzen die in mei waren ingediend had genomen eigenlijk toch wel hoor moet herzien.",
        correctedSentence: "Het besluit dat het college na de zienswijzen van mei had genomen, moet worden herzien.",
        explanation: "Unload the tang, drop the particle pile, and keep one impersonal strategy."
      },
      {
        type: "multiple_choice",
        question: "Best first polish step for an 80-word official sentence?",
        options: [
          "Add 'desalniettemin' at both ends",
          "Split after the first claim and close the first verb cluster",
          "Replace all verbs by nouns",
          "Switch to headline ellipsis"
        ],
        correct: 1,
        explanation: "Length and open jaws are the usual readability killers."
      },
      {
        type: "multiple_choice",
        question: "When should you keep a finite verb rather than a nominalisation?",
        options: [
          "Never at C1",
          "When tense, modality, or negation must stay visible",
          "Only in proverbs",
          "Only in Poldernederlands"
        ],
        correct: 1,
        explanation: "Verbs carry the operators nouns hide."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Concessive sentence adverb, then invert.",
        blankWord: "Niettemin",
        sentenceWithBlank: "___ blijft de steekproef klein.",
        hints: ["Niettemin", "Omdat", "Hoor"]
      }
    ]
  }
];
