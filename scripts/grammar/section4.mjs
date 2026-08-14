export const lessons = [
  {
    id: "g-046",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Subordinate Clauses: Conjunctions and SOV Word Order",
    titleNl: "Bijzinnen: Voegwoorden en SOV-volgorde",
    summary:
      "A subordinating conjunction (dat, omdat, terwijl, voordat, nadat, zodat, hoewel) opens a bijzin in which the finite verb moves to the clause-final field.",
    rules: [
      "After a subordinator the order is conjunction + subject + middle field + finite verb last: … omdat de bus te laat kwam.",
      "Objects, particles and infinitives stay before that final finite: … dat zij het pakket gisteren heeft teruggestuurd.",
      "The main clause keeps V2. If the bijzin comes first, the main finite verb still occupies second position of the whole sentence: Omdat het regende, bleven we binnen.",
      "Coordinators (en, maar, of, want) do not trigger SOV. Want leaves V2: We bleven binnen, want het regende.",
      "Do not invert subject and finite inside the bijzin (*omdat kwam de bus te laat)."
    ],
    structuralBreakdown:
      "[voegwoord] + [onderwerp] + [middenveld] + [persoonsvorm-laatst]  ·  hoofdzin blijft V2",
    examples: [
      {
        nl: "Ik weet dat de loodgieter de ketel morgen pas kan vervangen.",
        en: "I know that the plumber can only replace the boiler tomorrow.",
        highlight: "dat … kan vervangen (SOV-cluster)"
      },
      {
        nl: "Omdat de veerboot vertraging had, sliepen we in Breskens.",
        en: "Because the ferry was delayed, we slept in Breskens.",
        highlight: "Omdat … had, sliepen (bijzin eerst → V2 in hoofdzin)"
      }
    ],
    commonMistake:
      "Keeping main-clause inversion after omdat/dat: *Ik blijf thuis omdat regent het.",
    correction:
      "Put the finite last in the bijzin: Ik blijf thuis omdat het regent.",
    prerequisites: ["g-006"],
    relatedRules: ["g-047", "g-054"],
    tags: ["bijzin", "sov", "voegwoord", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which clause is a well-formed dat-bijzin?",
        options: [
          "dat komt de post later",
          "dat de post later komt",
          "dat later komt de post",
          "dat de post komt later"
        ],
        correct: 1,
        explanation: "Subject de post, adverb later, finite komt last."
      },
      {
        type: "word_order",
        translation: "We stayed inside because the rain was heavy.",
        tokens: ["We", "bleven", "binnen", "omdat", "de", "regen", "hard", "was"],
        correctSentence: "We bleven binnen omdat de regen hard was"
      },
      {
        type: "error_correction",
        sentenceWithError: "Zij belt af omdat heeft zij koorts.",
        correctedSentence: "Zij belt af omdat zij koorts heeft.",
        explanation: "Omdat forces SOV: subject then object then heeft."
      },
      {
        type: "sentence_transformation",
        original: "Het waait hard. We sluiten de luiken.",
        instruction: "Bind met 'omdat' en zet de reden vooraan.",
        transformed: "Omdat het hard waait, sluiten we de luiken.",
        hints: ["omdat … waait, sluiten we"]
      }
    ]
  },
  {
    id: "g-047",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Word Order with Multiple Verbs in Subordinate Clauses",
    titleNl: "Werkwoordclusters in de Bijzin",
    summary:
      "When a bijzin contains an auxiliary or modal plus more verbs, the whole verbal cluster sits at the end; Dutch prefers finite-first in speech and often infinitive-instead-of-participle (IPP) when two infinitives appear.",
    rules: [
      "Basic perfect in a bijzin: … dat zij de sleutel heeft gevonden (finite heeft immediately before the participle, or … gevonden heeft in a more formal/southern order).",
      "Modal + infinitive: … omdat we vroeg moeten vertrekken. Both verbs are final; the modal is usually left of the infinitive in the Netherlands.",
      "IPP (infinitivus pro participio): when a participle would govern another infinitive, Dutch uses an infinitive instead: … dat hij het boek heeft willen lezen, not *gewild lezen.",
      "Separable particles glue to the last non-finite: … dat ze hem gisteren heeft opgebeld; with IPP: … dat ze hem heeft willen opbellen.",
      "Do not leave a finite verb in V2 inside the bijzin once a cluster is present (*… dat zij heeft de sleutel gevonden)."
    ],
    structuralBreakdown:
      "[voegwoord + SO] + [middenveld] + [pv + (IPP-infinitieven | deelwoord)]",
    examples: [
      {
        nl: "Ik geloof dat de aannemer het dak volgende week zal laten repareren.",
        en: "I believe that the contractor will have the roof repaired next week.",
        highlight: "zal laten repareren"
      },
      {
        nl: "We waren blij dat ze de trein nog heeft kunnen halen.",
        en: "We were glad that she was still able to catch the train.",
        highlight: "heeft kunnen halen (IPP)"
      }
    ],
    commonMistake:
      "Using a participle before a second infinitive: *… dat hij heeft gewild komen.",
    correction:
      "Apply IPP: … dat hij heeft willen komen.",
    prerequisites: ["g-046", "g-033"],
    relatedRules: ["g-038", "g-053"],
    tags: ["werkwoordcluster", "ipp", "bijzin", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which bijzin shows IPP correctly?",
        options: [
          "dat zij de vis heeft gewild bakken",
          "dat zij de vis heeft willen bakken",
          "dat zij heeft de vis willen bakken",
          "dat zij de vis willen heeft bakken"
        ],
        correct: 1,
        explanation: "Finite heeft + infinitive willen + infinitive bakken."
      },
      {
        type: "fill_in_the_blank",
        prompt: "IPP form of 'willen' after 'heeft':",
        blankWord: "willen",
        sentenceWithBlank: "Hij zegt dat hij je heeft ___ waarschuwen.",
        hints: ["willen", "gewild", "wou"]
      },
      {
        type: "word_order",
        translation: "… that we have to leave early tomorrow.",
        tokens: ["dat", "we", "morgen", "vroeg", "moeten", "vertrekken"],
        correctSentence: "dat we morgen vroeg moeten vertrekken"
      },
      {
        type: "error_correction",
        sentenceWithError: "Ik weet dat zij heeft het rapport gisteren gelezen.",
        correctedSentence: "Ik weet dat zij het rapport gisteren heeft gelezen.",
        explanation: "Object and time stay in the middle field; cluster is final."
      }
    ]
  },
  {
    id: "g-048",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Temporal Subclauses: 'toen' vs 'als' / 'wanneer'",
    titleNl: "Tijdbijzinnen: toen tegenover als en wanneer",
    summary:
      "Toen introduces one completed past interval; als and wanneer cover habitual, present, or future time — nooit één afgesloten verleden keer.",
    rules: [
      "Single past episode: Toen de sirene ging, renden we naar buiten. Toen never means ‘when’ for the future.",
      "Habit in any tense: Als/Wanneer de sirene gaat, rennen de buurtbewoners naar buiten. Past habit also uses als: Als kind fietste ik langs de dijk wanneer het eb werd.",
      "Future or open condition of time: Als je aankomt, app je me. Wanneer is slightly more formal or timetable-like: Wanneer de deuren openen, stromen de bezoekers binnen.",
      "Both als and wanneer take SOV. Fronting the bijzin still leaves the main verb in V2: Toen het eb werd, liepen we het wad op.",
      "Do not pair toen with a present or future finite (*Toen je aankomt, bel me)."
    ],
    structuralBreakdown:
      "[toen + OVT/VVT: één verleden keer]  vs  [als/wanneer + present/future/gewoonte]",
    examples: [
      {
        nl: "Toen de IJssel buiten haar oevers trad, evacueerde de gemeente twee straten.",
        en: "When the IJssel overflowed its banks, the municipality evacuated two streets.",
        highlight: "Toen … trad (één verleden gebeurtenis)"
      },
      {
        nl: "Als de markt op zaterdag open is, koopt hij altijd kaas bij De Waag.",
        en: "When the market is open on Saturday, he always buys cheese at De Waag.",
        highlight: "Als … is (gewoonte)"
      }
    ],
    commonMistake:
      "Using toen for a future appointment: *Toen je morgen landt, sta ik klaar.",
    correction:
      "Switch to als or wanneer: Als je morgen landt, sta ik klaar.",
    prerequisites: ["g-046", "g-031"],
    relatedRules: ["g-049", "g-039"],
    tags: ["toen", "als", "wanneer", "tijd", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which linker fits a unique past flood?",
        options: ["als", "wanneer", "toen", "totdat"],
        correct: 2,
        explanation: "One completed past event takes toen."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Habitual Saturday shopping:",
        blankWord: "Als",
        sentenceWithBlank: "___ de klok tien slaat, gaat de poort van de kaasmarkt open.",
        hints: ["Als", "Toen", "Want"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Toen de veerboot morgen vertrekt, staan wij op de kade.",
        correctedSentence: "Als de veerboot morgen vertrekt, staan wij op de kade.",
        explanation: "Morgen is future; replace toen with als."
      },
      {
        type: "sentence_transformation",
        original: "De sirene ging. We renden naar buiten.",
        instruction: "Bind tot één zin met 'toen' vooraan.",
        transformed: "Toen de sirene ging, renden we naar buiten.",
        hints: ["Toen + OVT, dan V2"]
      }
    ]
  },
  {
    id: "g-049",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Conditional Subclauses with 'als', 'indien', 'mits', 'tenzij'",
    titleNl: "Voorwaardelijke Bijzinnen: als, indien, mits, tenzij",
    summary:
      "Als is the everyday if; indien is formal; mits states a required positive proviso; tenzij means ‘unless’ and already contains the negation.",
    rules: [
      "Als + SOV is the default real or hypothetical condition: Als het opklaart, steken we over. Combine with zou in the main clause for irrealis (g-044).",
      "Indien belongs in contracts, notices and academic prose: Indien u niet verschijnt, vervalt de reservering.",
      "Mits introduces a necessary extra condition that must hold: U mag fotograferen, mits u de flits uitzet. It is not a synonym of gewoon als.",
      "Tenzij = ‘if not / except if’. Do not add extra niet: We varen uit, tenzij de wind boven 7 Bft komt — not *tenzij de wind niet… unless you truly mean a double negative.",
      "All four are subordinators (finite last). Fronted conditions invert the main clause: Mits je zwijgt, mag je blijven."
    ],
    structuralBreakdown:
      "[als/indien/mits/tenzij] + [SOV] , [V2-hoofdzin]",
    examples: [
      {
        nl: "De vergunning blijft geldig, mits de eigenaar de gevel binnen een jaar herstelt.",
        en: "The permit remains valid provided the owner repairs the façade within a year.",
        highlight: "mits … herstelt"
      },
      {
        nl: "We houden de picknick, tenzij het KNMI code oranje afgeeft.",
        en: "We will keep the picnic unless the KNMI issues an orange warning.",
        highlight: "tenzij … afgeeft"
      }
    ],
    commonMistake:
      "Adding niet after tenzij (*tenzij het niet regent) when the intended meaning is simply ‘unless it rains’.",
    correction:
      "Tenzij het regent already means ‘unless it rains’.",
    prerequisites: ["g-046", "g-044"],
    relatedRules: ["g-048", "g-050"],
    tags: ["voorwaarde", "als", "mits", "tenzij", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which linker means ‘unless’?",
        options: ["mits", "indien", "tenzij", "zodat"],
        correct: 2,
        explanation: "Tenzij = unless."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Required proviso in a formal notice:",
        blankWord: "mits",
        sentenceWithBlank: "Bezoekers mogen filmen, ___ zij geen statief gebruiken.",
        hints: ["mits", "tenzij", "want"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Ik kom, tenzij ik niet ziek ben.",
        correctedSentence: "Ik kom, tenzij ik ziek ben.",
        explanation: "Tenzij already negates the condition."
      },
      {
        type: "word_order",
        translation: "If the fog lifts, we will cross.",
        tokens: ["Als", "de", "mist", "optrekt", "steken", "we", "over"],
        correctSentence: "Als de mist optrekt steken we over"
      }
    ]
  },
  {
    id: "g-050",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Concessive Subclauses with 'hoewel', 'ofschoon', 'ondanks dat'",
    titleNl: "Toegevende Bijzinnen: hoewel, ofschoon, ondanks dat",
    summary:
      "Hoewel and ofschoon concede a fact in a finite bijzin; ondanks is normally a preposition, so ondanks dat (or ondanks het feit dat) is needed before a full clause.",
    rules: [
      "Hoewel + SOV: Hoewel de kaartjes duur waren, zat de zaal vol. Ofschoon is a more formal twin with the same syntax.",
      "Ondanks takes a noun phrase: ondanks de regen, ondanks zijn hooikoorts. To attach a clause, write ondanks dat … or ondanks het feit dat ….",
      "Al is another concessive, often with inversion inside a short clause: Al is het laat, we maken het af.",
      "Main-clause contrast can be reinforced with toch: Hoewel ze moe was, fietste ze toch door.",
      "Do not use hoewel as a preposition (*hoewel de regen)."
    ],
    structuralBreakdown:
      "[hoewel/ofschoon + SOV]  |  [ondanks + NP]  |  [ondanks dat + SOV]",
    examples: [
      {
        nl: "Hoewel de veerdienst uitviel, bereikten de fietsers nog voor donker Perkpolder.",
        en: "Although the ferry service was cancelled, the cyclists still reached Perkpolder before dark.",
        highlight: "Hoewel … uitviel"
      },
      {
        nl: "Ondanks dat de kachel rookte, bleven de schaatsers in het huisje hangen.",
        en: "Despite the fact that the stove was smoking, the skaters stayed in the hut.",
        highlight: "Ondanks dat … rookte"
      }
    ],
    commonMistake:
      "Treating ondanks like a conjunction: *Ondanks het regende, gingen we wandelen.",
    correction:
      "Use ondanks de regen or hoewel het regende.",
    prerequisites: ["g-046"],
    relatedRules: ["g-049", "g-054"],
    tags: ["concessief", "hoewel", "ondanks", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which string is grammatical?",
        options: [
          "Ondanks het waaide hard",
          "Hoewel de harde wind",
          "Hoewel het hard waaide",
          "Ofschoon de harde waaide"
        ],
        correct: 2,
        explanation: "Hoewel needs a finite bijzin."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Preposition before a noun concession:",
        blankWord: "Ondanks",
        sentenceWithBlank: "___ de files haalde ze haar vlucht.",
        hints: ["Ondanks", "Hoewel", "Tenzij"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Hoewel de storm, bleef de markt open.",
        correctedSentence: "Ondanks de storm bleef de markt open.",
        explanation: "A bare NP after concession needs ondanks, not hoewel."
      },
      {
        type: "sentence_transformation",
        original: "De kaartjes waren duur. De zaal zat vol.",
        instruction: "Bind met 'hoewel' vooraan.",
        transformed: "Hoewel de kaartjes duur waren, zat de zaal vol.",
        hints: ["Hoewel + SOV, dan V2"]
      }
    ]
  },
  {
    id: "g-051",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Relative Clauses with 'die' and 'dat'",
    titleNl: "Betrekkelijke Bijzinnen met die en dat",
    summary:
      "Restrictive and non-restrictive relatives use die after de-words and all plurals, and dat after a singular het-word; the relative clause itself is SOV.",
    rules: [
      "Antecedent de man / de fiets / de vrouwen → die: de man die daar staat; de fietsen die ik leende.",
      "Antecedent het huis / het kind (singular het) → dat: het huis dat te koop staat.",
      "Diminutives are het-words, so het huisje dat…, even if the base noun was de-word (de stoel → het stoeltje dat piept).",
      "The finite verb is final: de brief die ik gisteren heb geschreven. Commas are optional around restrictive relatives; they are usual around extra, parenthetical ones.",
      "Never choose die/dat by the English translation ‘who/which’. Gender and number of the Dutch noun decide."
    ],
    structuralBreakdown:
      "[de/mv-antecedent + die + SOV]  |  [het-enkelvoud + dat + SOV]",
    examples: [
      {
        nl: "Het kantoor dat aan de gracht staat, wordt verbouwd.",
        en: "The office that stands on the canal is being renovated.",
        highlight: "Het kantoor dat … staat"
      },
      {
        nl: "De vrijwilligers die het wad opruimden, kregen soep van de reddingsbrigade.",
        en: "The volunteers who cleaned the mudflats got soup from the rescue brigade.",
        highlight: "De vrijwilligers die … opruimden"
      }
    ],
    commonMistake:
      "Using dat after a de-word because the English relative is ‘that’: *de trein dat naar Groningen rijdt.",
    correction:
      "De trein is a de-word → de trein die naar Groningen rijdt.",
    prerequisites: ["g-004", "g-046"],
    relatedRules: ["g-052"],
    tags: ["betrekkelijk", "die", "dat", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Relative after 'het meisje'?",
        options: ["die", "dat", "wie", "welke"],
        correct: 1,
        explanation: "Meisje is a diminutive het-word → dat."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Relative after plural 'de boten':",
        blankWord: "die",
        sentenceWithBlank: "De boten ___ in de sluis lagen, moesten wachten.",
        hints: ["die", "dat", "wie"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Het museum die om zes uur sluit, hangt vol etsen.",
        correctedSentence: "Het museum dat om zes uur sluit, hangt vol etsen.",
        explanation: "Museum is het → dat."
      },
      {
        type: "word_order",
        translation: "the letter that I wrote yesterday",
        tokens: ["de", "brief", "die", "ik", "gisteren", "heb", "geschreven"],
        correctSentence: "de brief die ik gisteren heb geschreven"
      }
    ]
  },
  {
    id: "g-052",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Relative Clauses with Prepositions: 'waar' + preposition / 'wie'",
    titleNl: "Betrekkelijke Bijzinnen met voorzetsel: waarop, waarmee, wie",
    summary:
      "When the relative is complement of a preposition, things and clauses take waar- + preposition (waarop, waarmee, waarvan); persons usually take preposition + wie.",
    rules: [
      "Inanimate: het rapport waarop we wachten; de sleutel waarmee ze opende; de stoel waarop je zit. Written split waar … op is possible in speech but the fused form is the teaching target.",
      "Persons: de collega met wie ik deel, de buren over wie we spraken — not *de collega waarmee in careful style (common in speech).",
      "Dont use die after a stranded preposition (*de man die ik mee reis). Recast as met wie or waarmee only if the antecedent is not clearly human.",
      "Free relatives: wie het weet mag het zeggen (whoever); wat je zegt is waar (that which).",
      "The bijzin remains SOV after the relative PP: de haven waaruit het schip gisteren is vertrokken."
    ],
    structuralBreakdown:
      "[zaak: waar+vz + SOV]  |  [persoon: vz + wie + SOV]",
    examples: [
      {
        nl: "Dit is de kade waarop de haringboten vroeger losten.",
        en: "This is the quay on which the herring boats used to unload.",
        highlight: "waarop … losten"
      },
      {
        nl: "De gids met wie we door de grot liepen, kende elke zijgang.",
        en: "The guide with whom we walked through the cave knew every side passage.",
        highlight: "met wie … liepen"
      }
    ],
    commonMistake:
      "Using waarmee for a named person in formal writing: *de minister waarmee ik sprak.",
    correction:
      "Write de minister met wie ik sprak.",
    prerequisites: ["g-051"],
    relatedRules: ["g-046"],
    tags: ["waarop", "met-wie", "betrekkelijk", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Best relative for ‘the pen I write with’?",
        options: ["de pen die ik mee schrijf", "de pen waarmee ik schrijf", "de pen wie ik schrijf", "de pen dat ik schrijf met"],
        correct: 1,
        explanation: "Inanimate instrument → waarmee."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Human complement of 'over':",
        blankWord: "wie",
        sentenceWithBlank: "De buurvrouw over ___ iedereen roddelt, verhuist.",
        hints: ["wie", "dat", "waar"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Het dossier waar we op hebben maanden gewacht, is er.",
        correctedSentence: "Het dossier waarop we maanden hebben gewacht, is er.",
        explanation: "Fuse waar+op and keep the cluster final."
      },
      {
        type: "sentence_transformation",
        original: "Ik reis met die collega.",
        instruction: "Maak een relatiefzin: 'de collega …'.",
        transformed: "de collega met wie ik reis",
        hints: ["met wie"]
      }
    ]
  },
  {
    id: "g-053",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Infinitive Clauses with 'te' and 'om ... te'",
    titleNl: "Infinitiefconstructies met te en om te",
    summary:
      "Om … te states purpose or follows nouns/adjectives of goal; bare te follows a closed list of verbs and adjectives (proberen te, beloven te, blij te zijn) without a purpose reading.",
    rules: [
      "Purpose: We stoppen om koffie te drinken. Om may be dropped only in a few fixed short phrases, not in learner prose.",
      "After nouns of plan/chance: de kans om te slagen, het plan om te verhuizen.",
      "Verbs that take te without om: beloven, proberen, weigeren, beweren, hopen, durven, schijnen: Zij probeert de kist te tillen.",
      "Adjectives: blij/bang/van plan te zijn: Ik ben blij je te zien. Do not insert om here (*blij om je te zien is heard but marked informal).",
      "Separable verbs keep the particle on the infinitive: om op te bellen, te laten liggen. Te stands immediately before the infinitive stem."
    ],
    structuralBreakdown:
      "[om … te + infinitief] (doel)  vs  [werkwoord/adj. + te + infinitief] (vast patroon)",
    examples: [
      {
        nl: "De ploeg bleef nabeunen om de laatste pallet nog te laden.",
        en: "The crew stayed after hours in order to load the last pallet.",
        highlight: "om … te laden"
      },
      {
        nl: "Noor weigerde de petitie te ondertekenen, al hoopte de actiegroep haar te overtuigen.",
        en: "Noor refused to sign the petition, even though the campaign hoped to convince her.",
        highlight: "weigerde … te ondertekenen, hoopte … te overtuigen"
      }
    ],
    commonMistake:
      "Using om te after proberen: *Hij probeert om de deur te openen (common in speech, marked in writing).",
    correction:
      "Hij probeert de deur te openen.",
    prerequisites: ["g-038"],
    relatedRules: ["g-047", "g-054"],
    tags: ["om-te", "te-infinitief", "doel", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which sentence is the careful written form?",
        options: [
          "Zij probeert om de kist te tillen.",
          "Zij probeert de kist te tillen.",
          "Zij probeert de kist tillen te.",
          "Zij probeert tot de kist tillen."
        ],
        correct: 1,
        explanation: "Proberen takes te without om."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Purpose marker:",
        blankWord: "om",
        sentenceWithBlank: "We reden om, ___ de file te vermijden.",
        hints: ["om", "te", "dat"]
      },
      {
        type: "word_order",
        translation: "in order to call the doctor (separable)",
        tokens: ["om", "de", "dokter", "op", "te", "bellen"],
        correctSentence: "om de dokter op te bellen"
      },
      {
        type: "error_correction",
        sentenceWithError: "Ik ben blij om je te zien op het perron.",
        correctedSentence: "Ik ben blij je te zien op het perron.",
        explanation: "Blij zijn takes te, not om te, in standard writing."
      }
    ]
  },
  {
    id: "g-054",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Causal and Consecutive Clauses: 'omdat', 'doordat', 'zodat'",
    titleNl: "Oorzakelijke en gevolgenbijzinnen: omdat, doordat, zodat",
    summary:
      "Omdat gives a reason (often intentional or justificatory); doordat prefers a mechanical cause; zodat introduces a result, not a purpose (purpose is om te or opdat).",
    rules: [
      "Omdat answers waarom and can express a speaker’s motive: Ik blijf thuis omdat ik griep heb. It subordinates (SOV), unlike want.",
      "Doordat highlights an external, often non-volitional cause: De wedstrijd ging niet door doordat het veld blank stond.",
      "Zodat marks a consequence that follows: Ze zette de wekker eerder, zodat ze de eerste tram haalde. It is not interchangeable with zodat = purpose in careful Dutch; use om te or opdat for purpose.",
      "Want coordinates and keeps V2: Ik blijf thuis, want ik heb griep. A comma before want is standard.",
      "Fronted omdat/doordat/zodat clauses invert the main finite: Doordat de sluis defect was, stonden de vrachtschepen stil."
    ],
    structuralBreakdown:
      "[omdat: reden] / [doordat: oorzaak] / [zodat: gevolg] + SOV  ·  [want + V2]",
    examples: [
      {
        nl: "De veiling sluit vroeger omdat de keurmeester ziek is.",
        en: "The auction closes earlier because the inspector is ill.",
        highlight: "omdat … is"
      },
      {
        nl: "Het ijs groeide aan doordat de wind naar het oosten draaide, zodat de tocht kon doorgaan.",
        en: "The ice thickened because the wind veered east, so the tour could go ahead.",
        highlight: "doordat … draaide, zodat … kon doorgaan"
      }
    ],
    commonMistake:
      "Using zodat to state a purpose: *Ik leer Nederlands zodat een baan te vinden.",
    correction:
      "Purpose: Ik leer Nederlands om een baan te vinden. Result: Ik oefen dagelijks, zodat mijn uitspraak verbetert.",
    prerequisites: ["g-046", "g-053"],
    relatedRules: ["g-050"],
    tags: ["omdat", "doordat", "zodat", "want", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Best linker for a flooded pitch cancelling a match?",
        options: ["want het veld blank stond", "doordat het veld blank stond", "zodat het veld blank stond", "om te het veld blank stond"],
        correct: 1,
        explanation: "External mechanical cause → doordat + SOV."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Result clause:",
        blankWord: "zodat",
        sentenceWithBlank: "Zet de deksel op de pan, ___ de soep niet inspringt.",
        hints: ["zodat", "omdat", "want"]
      },
      {
        type: "error_correction",
        sentenceWithError: "We bleven binnen, omdat had het geijzeld.",
        correctedSentence: "We bleven binnen omdat het geijzeld had.",
        explanation: "Omdat takes SOV; past perfect cluster is final."
      },
      {
        type: "sentence_transformation",
        original: "Ik heb griep. Ik blijf thuis. (coördinerend)",
        instruction: "Bind met 'want'.",
        transformed: "Ik blijf thuis, want ik heb griep.",
        hints: ["want houdt V2"]
      }
    ]
  },
  {
    id: "g-055",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Reported Speech and Sequence of Tense",
    titleNl: "Indirecte Rede en Consecutio Temporum",
    summary:
      "Reported statements are dat-clauses with SOV; when the reporting verb is past, Dutch typically backshifts present → past and perfect → past perfect, while zal becomes zou.",
    rules: [
      "Quotation to report: Hij zei: “Ik ben ziek.” → Hij zei dat hij ziek was.",
      "Present perfect in the quote becomes VVT after a past reporting verb: “Ik heb betaald.” → Zij zei dat ze had betaald.",
      "Future zal → zou: “Ik zal later bellen.” → Hij beloofde dat hij later zou bellen.",
      "If the reported content is still true and the reporting verb is present, keep the original tense: Ze zegt dat ze ziek is.",
      "Pronouns and deictics shift: hier → daar, nu → toen, ik → hij/zij as required by the new speaker."
    ],
    structuralBreakdown:
      "[zei/vertelde + dat] + [verschoven pronomen] + [SOV met terugverschoven tijd]",
    examples: [
      {
        nl: "De conducteur zei dat de sprinter tien minuten vertraging had.",
        en: "The conductor said that the stopper had a ten-minute delay.",
        highlight: "zei dat … had"
      },
      {
        nl: "Mila beloofde dat ze de notulen voor vrijdag zou mailen.",
        en: "Mila promised that she would email the minutes before Friday.",
        highlight: "beloofde dat … zou mailen"
      }
    ],
    commonMistake:
      "Leaving V2 after dat in a report: *Hij zei dat hij is ziek.",
    correction:
      "Hij zei dat hij ziek was (SOV + backshift after zei).",
    prerequisites: ["g-046", "g-044"],
    relatedRules: ["g-056", "g-039"],
    tags: ["indirecte-rede", "terugverschuiving", "dat", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Report of “Ik ben moe” after 'zij zei'.",
        options: [
          "Zij zei dat ik ben moe.",
          "Zij zei dat ze moe was.",
          "Zij zei dat ze is moe.",
          "Zij zei ze was moe dat."
        ],
        correct: 1,
        explanation: "Pronoun shifts to ze; tense to was; verb last."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Backshifted zullen:",
        blankWord: "zou",
        sentenceWithBlank: "Hij beloofde dat hij later ___ bellen.",
        hints: ["zou", "zal", "gaat"]
      },
      {
        type: "sentence_transformation",
        original: "Lukas zei: \"Ik heb de sleutel gevonden.\"",
        instruction: "Zet in de indirecte rede.",
        transformed: "Lukas zei dat hij de sleutel had gevonden.",
        hints: ["had gevonden"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Ze vertelde dat komt de bus later.",
        correctedSentence: "Ze vertelde dat de bus later kwam.",
        explanation: "Dat-clause is SOV; past reporting verb prefers kwam."
      }
    ]
  },
  {
    id: "g-056",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Indirect Questions and Embedded V1/SOV",
    titleNl: "Indirecte Vragen en Ingebedde Vraagvolgorde",
    summary:
      "Embedded questions keep the question word but lose subject–verb inversion: the finite verb goes to the end, just as in other bijzinnen.",
    rules: [
      "Yes/no reports use of: Ik vraag me af of de winkel nog open is — not *of is de winkel nog open.",
      "Wh-reports: Weet jij waar de sleutel ligt? / Ze vroeg wanneer de veerboot vertrok. Question word + subject + … + finite.",
      "The matrix clause is V2; only the embedded interrogative is SOV. Double inversion is ungrammatical.",
      "Choice questions keep of … of: Zeg me of we links of rechts moeten.",
      "Do not insert dat after a question word (*Ik weet niet wanneer dat hij komt)."
    ],
    structuralBreakdown:
      "[matrix] + [of / vraagwoord] + [onderwerp] + [middenveld] + [pv]",
    examples: [
      {
        nl: "De portier vroeg of we onze tassen even wilden openen.",
        en: "The porter asked whether we would mind opening our bags.",
        highlight: "vroeg of we … wilden openen"
      },
      {
        nl: "Niemand wist hoe laat de laatste stoptrein uit Roosendaal vertrok.",
        en: "Nobody knew what time the last stopping train from Roosendaal left.",
        highlight: "wist hoe laat … vertrok"
      }
    ],
    commonMistake:
      "Keeping main-clause question inversion inside the embed: *Ze vroeg waar ligt de sleutel.",
    correction:
      "Ze vroeg waar de sleutel ligt.",
    prerequisites: ["g-046", "g-055"],
    relatedRules: ["g-047"],
    tags: ["indirecte-vraag", "of", "vraagwoord", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Correct embed of ‘Is de brug open?’",
        options: [
          "Ik vraag of is de brug open.",
          "Ik vraag of de brug open is.",
          "Ik vraag dat de brug open is?",
          "Ik vraag of de brug is open."
        ],
        correct: 1,
        explanation: "Of + subject + complement + is."
      },
      {
        type: "word_order",
        translation: "Do you know where the key is?",
        tokens: ["Weet", "jij", "waar", "de", "sleutel", "ligt"],
        correctSentence: "Weet jij waar de sleutel ligt"
      },
      {
        type: "error_correction",
        sentenceWithError: "Zeg me wanneer dat de film begint.",
        correctedSentence: "Zeg me wanneer de film begint.",
        explanation: "No dat after a question word."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Yes/no complementizer:",
        blankWord: "of",
        sentenceWithBlank: "Kun je kijken ___ het licht nog aan is?",
        hints: ["of", "dat", "als"]
      }
    ]
  },
  {
    id: "g-057",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Participial and Absolute Constructions",
    titleNl: "Deelwoordconstructies en Absolute Bepalingen",
    summary:
      "A free participial phrase can pack a background event beside a main clause; it has no finite verb of its own and should share the main-clause subject unless an absolute NP is supplied.",
    rules: [
      "Present participle clause: Fluitend liep ze de dijk af. The -end form is adverbial and invariable here.",
      "Past participle clause of result or passive background: Door de mist verrast, misten de schippers de ton. The understood subject is de schippers.",
      "Avoid dangling participles: *Aangekomen op het perron, vertrok de trein already — the train did not arrive; the travellers did.",
      "Absolute with met: met de motor nog draaiend, met de ramen open. These need no extra finite verb.",
      "Do not inflect these adverbial participles (*Fluitende liep ze)."
    ],
    structuralBreakdown:
      "[(NP +) deelwoordzin zonder persoonsvorm] , [V2-hoofdzin met hetzelfde subject]",
    examples: [
      {
        nl: "Door de storm verrast, zochten de wadlopers de vluchtheuvel op.",
        en: "Caught out by the storm, the mudflat walkers headed for the refuge mound.",
        highlight: "Door de storm verrast"
      },
      {
        nl: "Met de motor nog stationair draaiend controleerde de monteur het oliepeil.",
        en: "With the engine still idling, the mechanic checked the oil level.",
        highlight: "Met de motor nog stationair draaiend"
      }
    ],
    commonMistake:
      "A dangling participle whose implied subject is not the main subject: *Aangekomen in Delft, was het al donker.",
    correction:
      "Toen we in Delft aankwamen, was het al donker — or Aangekomen in Delft, zochten we een café.",
    prerequisites: ["g-040"],
    relatedRules: ["g-046", "g-053"],
    tags: ["deelwoordconstructie", "absoluut", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which sentence avoids a dangling participle?",
        options: [
          "Aangekomen op het perron, vertrok de trein al.",
          "Aangekomen op het perron, misten we de trein.",
          "Aangekomene op het perron, we misten de trein.",
          "Aangekomen op het perron de trein vertrok."
        ],
        correct: 1,
        explanation: "We is the arriver and the main subject."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Adverbial present participle of 'fluiten':",
        blankWord: "Fluitend",
        sentenceWithBlank: "___ liep ze de dijk af.",
        hints: ["Fluitend", "Fluitende", "Gefloten"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Zingend liepen de koorleden de kerk uit de deuren.",
        correctedSentence: "Zingend liepen de koorleden de kerk uit.",
        explanation: "Particle uit is already the adverbial; drop the stray NP."
      },
      {
        type: "sentence_transformation",
        original: "Ze was door de mist verrast. Ze miste de ton.",
        instruction: "Begin met een past participle phrase.",
        transformed: "Door de mist verrast, miste ze de ton.",
        hints: ["Door de mist verrast"]
      }
    ]
  },
  {
    id: "g-058",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Clause Combining: Asyndeton vs Explicit Connectors",
    titleNl: "Zinsverbinding: Asyndeton versus Expliciete Connectoren",
    summary:
      "Dutch can stack main clauses with only a comma or semicolon (asyndeton) for pace, but argumentative prose prefers explicit en, maar, want, daarom, toch, immers.",
    rules: [
      "Asyndeton: De mist zakte, de veerboot toetert, niemand bewoog. Each clause remains V2; a comma is enough between short parallel mains.",
      "Semicolon links two complete mains that are tightly related: De sluis is defect; de binnenvaart ligt stil.",
      "Additive en and contrastive maar keep V2 in the second conjunct: …, maar de kapitein wachtte af.",
      "Adverbial connectors (daarom, toch, immers, namelijk) occupy the first slot or the middle field and still force V2: Het ijzelde; daarom bleef de markt dicht / De markt bleef daarom dicht.",
      "Do not treat daarom as a subordinator (*daarom de markt dichtbleef)."
    ],
    structuralBreakdown:
      "[V2], [V2] (asyndeton)  |  [V2]; [connector + V2]  |  geen SOV na daarom/toch",
    examples: [
      {
        nl: "Het tij keerde, de geul viel droog, de wadlopers haastten zich naar de dijk.",
        en: "The tide turned, the channel ran dry, the walkers hurried to the dike.",
        highlight: "drie V2-zinnen, alleen komma's"
      },
      {
        nl: "De brug bleef open; daarom moest het wegverkeer omrijden via Sas van Gent.",
        en: "The bridge stayed open; therefore road traffic had to detour via Sas van Gent.",
        highlight: "daarom moest … (V2)"
      }
    ],
    commonMistake:
      "Putting the finite last after daarom: *Het ijzelde, daarom de markt dichtbleef.",
    correction:
      "Het ijzelde; daarom bleef de markt dicht.",
    prerequisites: ["g-046", "g-054"],
    relatedRules: ["g-059", "g-060"],
    tags: ["asyndeton", "connector", "daarom", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which continuation after ‘Het ijzelde;’ is grammatical?",
        options: [
          "daarom de markt dichtbleef.",
          "daarom bleef de markt dicht.",
          "omdat bleef de markt dicht.",
          "daarom de markt bleef dicht."
        ],
        correct: 1,
        explanation: "Daarom is an adverb in first position; finite bleef is second."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Contrast coordinator (V2 follows):",
        blankWord: "maar",
        sentenceWithBlank: "De wind trok aan, ___ de schipper bleef liggen.",
        hints: ["maar", "omdat", "dat"]
      },
      {
        type: "error_correction",
        sentenceWithError: "De sluis is defect, daarom de binnenvaart stil ligt.",
        correctedSentence: "De sluis is defect; daarom ligt de binnenvaart stil.",
        explanation: "Daher-type daarom does not create SOV."
      },
      {
        type: "word_order",
        translation: "The ice grew; therefore the tour could continue.",
        tokens: ["Het", "ijs", "groeide", "aan", "daarom", "kon", "de", "tocht", "doorgaan"],
        correctSentence: "Het ijs groeide aan daarom kon de tocht doorgaan"
      }
    ]
  },
  {
    id: "g-059",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Fronting and Contrastive Topicalization",
    titleNl: "Vooropplaatsing en Contrastieve Topicalisatie",
    summary:
      "Any one constituent can occupy the first slot of a Dutch main clause; the finite verb stays second, and a contrastive object or adverbial there is marked, not optional extra inversion.",
    rules: [
      "Neutral: subject first. Marked: time, place, object, or whole bijzin first: Die fout heb ik niet gemaakt. The rest of the clause follows the finite.",
      "Only one constituent before V2. *Gisteren in Delft heb ik… is only good if the two PPs form one complex scene; otherwise split.",
      "Contrastive objects often pick up a stressed demonstrative: Dat boek lees ik wel, maar die bundel niet.",
      "After a fronted bijzin, do not repeat the subject before the finite: *Omdat het regende, we bleven binnen → Omdat het regende, bleven we binnen.",
      "Inversion with jij still drops present -t: Morgen kom je toch? not *komt je."
    ],
    structuralBreakdown:
      "[één voorveld-constituent] + [pv] + [rest, incl. onderwerp indien niet vooraan]",
    examples: [
      {
        nl: "Dat rapport heb ik gisteren al naar de inspectie gestuurd.",
        en: "That report I already sent to the inspectorate yesterday.",
        highlight: "Dat rapport heb ik … gestuurd"
      },
      {
        nl: "Pas na middernacht kwam je terug van de kermis.",
        en: "Only after midnight did you come back from the fair.",
        highlight: "kwam je (geen -t)"
      }
    ],
    commonMistake:
      "Leaving the subject before the finite after a fronted phrase: *Die fout ik heb niet gemaakt.",
    correction:
      "Die fout heb ik niet gemaakt.",
    prerequisites: ["g-006", "g-046"],
    relatedRules: ["g-058", "g-060"],
    tags: ["vooropplaatsing", "v2", "contrast", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Correct fronting of the object ‘die fout’?",
        options: [
          "Die fout ik heb niet gemaakt.",
          "Die fout heb ik niet gemaakt.",
          "Die fout niet ik heb gemaakt.",
          "Heb die fout ik niet gemaakt."
        ],
        correct: 1,
        explanation: "Object | heb | ik | niet gemaakt."
      },
      {
        type: "sentence_transformation",
        original: "Ik lees dat boek wel.",
        instruction: "Zet 'dat boek' vooraan voor contrast.",
        transformed: "Dat boek lees ik wel.",
        hints: ["Dat boek lees ik"]
      },
      {
        type: "typed_conjugation",
        infinitive: "komen",
        subject: "jij (inversie na 'morgen')",
        targetTense: "present",
        correctForm: "kom",
        explanation: "Inversion with je drops -t: kom je."
      },
      {
        type: "error_correction",
        sentenceWithError: "Omdat het eb werd, we liepen het wad op.",
        correctedSentence: "Omdat het eb werd, liepen we het wad op.",
        explanation: "Fronted bijzin counts as the first slot; finite is next."
      }
    ]
  },
  {
    id: "g-060",
    section: 4,
    sectionTitle: "A2–B1 Sentence Structure & Clauses",
    level: "B1",
    title: "Punctuation of Complex Clauses in Dutch",
    titleNl: "Interpunctie van Samengestelde Zinnen",
    summary:
      "Dutch uses a comma more sparingly than English before restrictive relatives, but it does mark fronted bijzinnen, want, and parenthetical extras; question and quotation marks follow Dutch, not English, conventions.",
    rules: [
      "A fronted subordinate clause is followed by a comma: Als het eb wordt, lopen we uit. The comma is recommended even when short.",
      "Restrictive die/dat-clauses usually have no comma: de fiets die ik leende. Non-restrictive extras take commas: Mijn fiets, die ik gisteren leende, is stuk.",
      "Place a comma before want, maar, and en when the second unit is a full clause with its own subject: We bleven binnen, want het ijzelde.",
      "No comma automatically before dat/of object clauses: Ik weet dat ze komt. English learners over-insert one.",
      "Quoted speech: Hij zei: “Ik kom.” The colon introduces the quote; the period sits inside the Dutch quotation marks. Indirect speech has no extra quotes."
    ],
    structuralBreakdown:
      "[bijzin vooraan], [hoofdzin]  ·  [restrictief relatief: geen komma]  ·  [want/maar + hoofdzin: wel komma]",
    examples: [
      {
        nl: "Wanneer de sluis opengaat, moeten de fietsers wachten, want het wegdek is nat.",
        en: "When the lock opens, the cyclists have to wait, because the roadway is wet.",
        highlight: "komma na wanneer-zin; komma voor want"
      },
      {
        nl: "De loods zei: “De geul is gemarkeerd.” Hij voegde toe dat we midscheeps moesten blijven.",
        en: "The pilot said, “The channel is marked.” He added that we should stay midships.",
        highlight: "dubbele punt + aanhaling; daarna dat zonder komma"
      }
    ],
    commonMistake:
      "Inserting an English-style comma before every dat: *Ik denk, dat de tram vol is.",
    correction:
      "Ik denk dat de tram vol is.",
    prerequisites: ["g-046", "g-051", "g-055"],
    relatedRules: ["g-058", "g-059"],
    tags: ["interpunctie", "komma", "aanhaling", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which punctuation is standard?",
        options: [
          "Ik denk, dat de tram vol is.",
          "Ik denk dat de tram vol is.",
          "Ik denk: dat de tram vol is",
          "Ik denk dat, de tram vol is."
        ],
        correct: 1,
        explanation: "No comma before a dat-object clause."
      },
      {
        type: "error_correction",
        sentenceWithError: "Als het eb wordt lopen we uit zonder komma.",
        correctedSentence: "Als het eb wordt, lopen we uit.",
        explanation: "Comma after a fronted bijzin."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Coordinator that normally takes a preceding comma:",
        blankWord: "want",
        sentenceWithBlank: "We bleven binnen, ___ het ijzelde.",
        hints: ["want", "dat", "of"]
      },
      {
        type: "sentence_transformation",
        original: "Hij zei dat hij komt. (maak er een citaat van)",
        instruction: "Directe rede met Nederlandse interpunctie.",
        transformed: "Hij zei: “Ik kom.”",
        hints: ["dubbele punt en aanhalingstekens"]
      }
    ]
  }
];
