// Section 7: B2 Advanced Register & Nuance (g-091 – g-105)
export const lessons = [
  {
    id: "g-091",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Academic Connectors: 'desalniettemin', 'niettemin', 'derhalve'",
    titleNl: "Academische verbindingswoorden: desalniettemin, niettemin, derhalve",
    summary: "Formal Dutch prefers concessive 'niettemin/desalniettemin' and inferential 'derhalve' over spoken 'toch' and 'dus'; they sit as sentence adverbs and do not cancel V2.",
    rules: [
      "'Niettemin' and the heavier 'desalniettemin' concede a preceding point and then assert a contrast: the following clause is still true despite that point.",
      "'Desalniettemin' is more ceremonial and slightly old-fashioned; many editors accept 'niettemin' or 'desondanks' as leaner formal alternatives.",
      "'Derhalve' marks a logical consequence from stated premises, closer to 'bijgevolg' than to casual 'dus'. It is typical of reports, not conversation.",
      "Fronted concessives still invert the finite verb: 'Niettemin blijft de steekproef klein.' Do not write *'Niettemin de steekproef blijft klein'.",
      "These connectors do not take 'dat' as a complementiser. Pair them with a full main clause, or use a semicolon before them."
    ],
    structuralBreakdown: "[Premisse]. [Niettemin / Desalniettemin / Derhalve] + [pv] + [rest]  — concessie of gevolg, V2 blijft",
    examples: [
      {
        nl: "De steekproef is klein. Niettemin wijzen de cijfers in dezelfde richting.",
        en: "The sample is small. Nevertheless the figures point in the same direction.",
        highlight: "Niettemin wijzen"
      },
      {
        nl: "De wettelijke termijn is verstreken; derhalve wijzen wij het verzoek af.",
        en: "The statutory deadline has expired; we therefore reject the request.",
        highlight: "derhalve wijzen wij"
      }
    ],
    commonMistake: "Using 'desalniettemin' as if it were a subordinating conjunction: *'Desalniettemin dat de kosten stegen, gingen we door.'",
    correction: "Keep a main clause after the adverb: 'Desalniettemin gingen we door, hoewel de kosten stegen.'",
    prerequisites: ["g-061", "g-075"],
    relatedRules: ["g-096", "g-097"],
    tags: ["connectors", "register", "academic", "b2", "concessive"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which fronted sentence is grammatical?",
        options: [
          "Niettemin de uitslag is duidelijk.",
          "Niettemin is de uitslag duidelijk.",
          "Niettemin dat de uitslag duidelijk is.",
          "Niettemin duidelijk de uitslag is."
        ],
        correct: 1,
        explanation: "Sentence adverbs occupy first position and trigger inversion: 'Niettemin is de uitslag duidelijk.'"
      },
      {
        type: "fill_in_the_blank",
        prompt: "Choose the inferential connector (not concessive).",
        blankWord: "derhalve",
        sentenceWithBlank: "De voorwaarden zijn niet vervuld; ___ wijzen wij de aanvraag af.",
        hints: ["derhalve", "niettemin", "desalniettemin"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Desalniettemin dat het rapport laat is, publiceren we het.",
        correctedSentence: "Desalniettemin publiceren we het, hoewel het rapport laat is.",
        explanation: "'Desalniettemin' is an adverb, not a conjunction taking 'dat'."
      },
      {
        type: "multiple_choice",
        question: "Best paraphrase of spoken 'Dus keuren we het af' in a formal letter?",
        options: [
          "Toch keuren we het af.",
          "Derhalve keuren wij het af.",
          "Desalniettemin keuren we het af.",
          "Alweer keuren we het af."
        ],
        correct: 1,
        explanation: "'Derhalve' is the formal inferential counterpart of 'dus'."
      }
    ]
  },
  {
    id: "g-092",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Information Structure: Topic, Focus, and Afterthought",
    titleNl: "Informatiestructuur: topic, focus en uitloop",
    summary: "Dutch packs given information leftward (topic), new or contrastive material toward the right periphery or immediately after the finite verb, and parks afterthoughts after the verbal cluster.",
    rules: [
      "The first field is typically a topic (given, scene-setting, or contrastive frame), not automatically the subject: 'Die beslissing betreur ik nog steeds.'",
      "Narrow focus often sits just after the finite verb or in the rightmost slot before the verb cluster: 'Ik heb GISTEREN het rapport gelezen' vs 'Ik heb gisteren het RAPPORT gelezen'.",
      "Material after the verb cluster (uitloop) is an afterthought or heavy NP: 'Ik heb het gelezen, dat rapport over de dijken.'",
      "Clitic objects and 'er' prefer the left middle field; heavy or focused objects prefer the right. Mixed order is possible but marked.",
      "Do not treat every fronted constituent as emphasis. Fronting a known topic is often less marked than leaving it late."
    ],
    structuralBreakdown: "[Topic/voorveld] + [pv] + [clitica/er] + [middenveld] + [FOCUS] + [werkwoordcluster] , [uitloop/afterthought]",
    examples: [
      {
        nl: "Die regeling ken ik. Het nieuwe protocol ken ik niet.",
        en: "That regulation I know. The new protocol I do not know.",
        highlight: "Die regeling / Het nieuwe protocol (contrastive topics)"
      },
      {
        nl: "We hebben het gisteren nog nagekeken, dat lastige hoofdstuk.",
        en: "We checked it yesterday, that difficult chapter.",
        highlight: "dat lastige hoofdstuk (uitloop)"
      }
    ],
    commonMistake: "Cramming a heavy afterthought into the middle field and leaving the verb cluster stranded far to the right without a pause: unreadable 'tang' where an uitloop would help.",
    correction: "Move the heavy NP after the cluster: 'We hebben het nagekeken, dat lastige hoofdstuk over de dijken.'",
    prerequisites: ["g-006", "g-045"],
    relatedRules: ["g-101", "g-114"],
    tags: ["information-structure", "topic", "focus", "uitloop", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which sentence uses an afterthought (uitloop) after the cluster?",
        options: [
          "Dat rapport heb ik gisteren gelezen.",
          "Ik heb gisteren dat rapport gelezen.",
          "Ik heb het gisteren gelezen, dat rapport.",
          "Gisteren las ik dat rapport."
        ],
        correct: 2,
        explanation: "The NP after the participle is right-dislocated afterthought."
      },
      {
        type: "error_correction",
        sentenceWithError: "Ik heb dat extreem gedetailleerde rapport over de nieuwe dijkversterking gisteren nog eens helemaal gelezen.",
        correctedSentence: "Ik heb het gisteren nog eens helemaal gelezen, dat extreem gedetailleerde rapport over de nieuwe dijkversterking.",
        explanation: "Park the heavy object as uitloop so the cluster is not pushed miles away."
      },
      {
        type: "word_order",
        translation: "That decision I still regret.",
        tokens: ["Die", "beslissing", "betreur", "ik", "nog", "steeds"],
        correctSentence: "Die beslissing betreur ik nog steeds"
      },
      {
        type: "multiple_choice",
        question: "Fronting 'Die regeling' in 'Die regeling ken ik' mainly marks…",
        options: [
          "a new-information focus only",
          "a given or contrastive topic",
          "an afterthought",
          "a subordinate conjunction"
        ],
        correct: 1,
        explanation: "Left-peripheral definite NPs are typically topics, often contrastive."
      }
    ]
  },
  {
    id: "g-093",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Nominal Style vs Verbal Style in Formal Dutch",
    titleNl: "Nominale stijl versus verbale stijl",
    summary: "Formal Dutch often packs events into noun phrases ('de vaststelling van…') where spoken Dutch keeps finite verbs; overdone nominal style becomes opaque rather than official.",
    rules: [
      "Nominal style replaces a clause with a deverbal noun plus 'van'-complements: 'dat het college besloot' → 'het besluit van het college'.",
      "Arguments of the noun surface as 'van'-PPs or compound first members: 'de uitvoering van het plan' / 'planuitvoering'. Agents may appear as 'door'.",
      "Verbal style keeps tense, aspect, and polarity on the verb and is easier to negate or modalise: 'Het college heeft het plan nog niet uitgevoerd.'",
      "Good formal prose mixes both: nouns for established facts, verbs for claims you must hedge. Stacking three nominalisations in one NP is a house-style problem, not a prestige feature.",
      "Dutch officialese favours '-ing', '-atie', and '-tie' nouns; they remain countable and still need articles."
    ],
    structuralBreakdown: "[deverbale N + van-PP / door-PP]  ≈  [onderwerp + pv + object]  — kies werkwoord als je tijd of ontkenning nodig hebt",
    examples: [
      {
        nl: "Na vaststelling van de begroting gaat het college over tot uitvoering van het plan.",
        en: "After adoption of the budget the executive proceeds to implementation of the plan.",
        highlight: "vaststelling / uitvoering"
      },
      {
        nl: "Nadat de raad de begroting had vastgesteld, voerde het college het plan uit.",
        en: "After the council had adopted the budget, the executive implemented the plan.",
        highlight: "had vastgesteld / voerde … uit"
      }
    ],
    commonMistake: "Writing 'de niet uitvoering van het plan' instead of keeping negation on a verb or using 'het uitblijven van uitvoering'.",
    correction: "Negate a verb: 'Het college voerde het plan niet uit.' Or name the absence: 'het uitblijven van de uitvoering'.",
    prerequisites: ["g-040", "g-070"],
    relatedRules: ["g-098", "g-120"],
    tags: ["style", "nominalisation", "register", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Most natural verbal rewrite of 'na vaststelling van de begroting'?",
        options: [
          "na de begroting vast",
          "nadat de begroting was vastgesteld",
          "na vast de begroting",
          "toen vaststelling de begroting"
        ],
        correct: 1,
        explanation: "A temporal noun phrase unpacks as a 'nadat'-clause with a finite verb."
      },
      {
        type: "error_correction",
        sentenceWithError: "De niet uitvoering van het plan door het college was opvallend.",
        correctedSentence: "Het college voerde het plan niet uit, wat opvallend was.",
        explanation: "Dutch cannot freely prefix 'niet' to a deverbal noun the way English uses 'non-implementation'."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Complete the nominalisation of 'het college besluit'.",
        blankWord: "besluit",
        sentenceWithBlank: "Het ___ van het college werd gisteren bekendgemaakt.",
        hints: ["besluit", "besluiten", "besloot"]
      },
      {
        type: "multiple_choice",
        question: "When is verbal style clearly better?",
        options: [
          "When you must mark tense, modality, or negation",
          "Whenever you write an email",
          "Never in formal Dutch",
          "Only in headlines"
        ],
        correct: 0,
        explanation: "Nouns hide tense and polarity; verbs carry them."
      }
    ]
  },
  {
    id: "g-094",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Impersonal 'men' vs 'je' vs 'we' as generic subjects",
    titleNl: "Generiek subject: men, je en we",
    summary: "'Men' is a formal generic person; generic 'je' is the spoken default; generic 'we' includes writer and reader. They are not interchangeable in tone or agreement.",
    rules: [
      "'Men' takes third-person singular: 'Men vraagt zich af…'. Possessives and reflexives stay third person: 'zijn/haar' is rare; often the sentence is recast.",
      "Generic 'je' is intimate and informal. It also takes singular: 'Je merkt al snel dat…'. Avoid mixing 'je' and 'men' in one paragraph.",
      "Generic 'we' ('auteurlijk we' or inclusive 'we') is common in textbooks and policy: 'We zien hier dat…'. It is not a royal we.",
      "Passives and 'er'-existentials often replace 'men' in contemporary official Dutch: 'Er wordt aangenomen dat…' instead of 'Men neemt aan dat…'.",
      "'Men' cannot be used for a specific group you could name. If the actor is the ministry, say so."
    ],
    structuralBreakdown: "[men + 3sg]  |  [generiek je + 2sg]  |  [inclusief we + 1pl]  |  [er wordt + voltooid deelwoord]",
    examples: [
      {
        nl: "Men kan deze cijfers niet zomaar vergelijken.",
        en: "One cannot simply compare these figures.",
        highlight: "Men kan"
      },
      {
        nl: "Je merkt al snel dat de procedure stroef loopt.",
        en: "You soon notice that the procedure runs sluggishly.",
        highlight: "Je merkt"
      }
    ],
    commonMistake: "Agreement errors such as *'Men vragen zich af' or mixing *'Men merkt dat je…' in one generic chain.",
    correction: "Keep one generic strategy: 'Men vraagt zich af of de cijfers vergelijkbaar zijn' or stay with 'je' throughout.",
    prerequisites: ["g-002", "g-055"],
    relatedRules: ["g-099", "g-111"],
    tags: ["impersonal", "men", "register", "generics", "b2"],
    exercises: [
      {
        type: "fill_in_the_blank",
        prompt: "Correct finite verb after 'men'.",
        blankWord: "vraagt",
        sentenceWithBlank: "Men ___ zich af of de steekproef toereikend is.",
        hints: ["vraagt", "vragen", "vraag"]
      },
      {
        type: "multiple_choice",
        question: "Most natural contemporary official rewrite of 'Men neemt aan dat de wet geldt'?",
        options: [
          "Je neemt aan dat de wet geldt.",
          "Er wordt aangenomen dat de wet geldt.",
          "Wijlen neemt aan dat de wet geldt.",
          "Men nemen aan dat de wet geldt."
        ],
        correct: 1,
        explanation: "Modern officialese often prefers an impersonal passive to 'men'."
      },
      {
        type: "error_correction",
        sentenceWithError: "Men merkt al snel dat je de cijfers niet kunt vergelijken.",
        correctedSentence: "Men merkt al snel dat men de cijfers niet kan vergelijken.",
        explanation: "Do not switch generic 'men' to generic 'je' mid-sentence."
      },
      {
        type: "multiple_choice",
        question: "Which subject is inclusive of writer and reader?",
        options: ["men", "je (generic)", "we (authorial/inclusive)", "het"],
        correct: 2,
        explanation: "Inclusive 'we' pulls the reader into the observation."
      }
    ]
  },
  {
    id: "g-095",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Subjunctive Relics and Formulaic Optatives ('leve', 'moge')",
    titleNl: "Restanten van de aanvoegende wijs: leve, moge",
    summary: "Dutch no longer has a living subjunctive paradigm; a handful of fossilised optatives and formulaic third-person forms survive in toasts, minutes, and legal wishes.",
    rules: [
      "'Leve de koning/de jarige' is an optative relic of 'leven' (3sg without -t). It is not used as a normal present: you cannot say *'hij leve in Utrecht' for 'he lives'.",
      "'Moge' + infinitive expresses a wish: 'Moge het u goed gaan.' Outside ceremonies it sounds theatrical.",
      "Minutes still use 'de voorzitter stelt voor dat het verslag worde goedgekeurd' or, more often now, indicative 'wordt goedgekeurd'. Both occur; 'worde' is marked as formulaic.",
      "Fixed wishes: 'God zij dank', 'het zij zo', 'koste wat het kost', 'ware het niet dat…'. Treat them as idioms, not as a paradigm you can conjugate freely.",
      "Do not invent *'hij gae' or *'wij hebben'. Productive counterfactuals use 'zou' or past-tense indicatives, not new subjunctives."
    ],
    structuralBreakdown: "[Leve + NP]  |  [Moge + subject + infinitief]  |  [zij / ware / worde] alleen in vaste formules",
    examples: [
      {
        nl: "Leve de jarige, en moge het komende jaar rustiger zijn.",
        en: "Long live the birthday girl, and may the coming year be quieter.",
        highlight: "Leve / moge"
      },
      {
        nl: "Ware het niet dat de termijn verstreken is, zouden we het verzoek inwilligen.",
        en: "Were it not that the deadline has expired, we would grant the request.",
        highlight: "Ware het niet dat"
      }
    ],
    commonMistake: "Treating 'leve' as a regular present: *'Zij leve in Den Haag' meaning 'She lives in The Hague'.",
    correction: "Use the indicative: 'Zij woont in Den Haag.' Reserve 'leve' for toasts.",
    prerequisites: ["g-003", "g-050"],
    relatedRules: ["g-106", "g-107"],
    tags: ["subjunctive", "optative", "formulaic", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which sentence uses a living optative formula correctly?",
        options: [
          "Hij leve in Rotterdam sinds 2019.",
          "Leve de koning.",
          "Wij moge morgen komen.",
          "Ik leve u succes."
        ],
        correct: 1,
        explanation: "'Leve X' is the toast formula; it is not a locative present."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Complete the ceremonial wish.",
        blankWord: "Moge",
        sentenceWithBlank: "___ het u goed gaan.",
        hints: ["Moge", "Mag", "Moet"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Zij leve al jaren in Utrecht.",
        correctedSentence: "Zij woont al jaren in Utrecht.",
        explanation: "'Leve' is not the ordinary present of 'leven/wonen'."
      },
      {
        type: "multiple_choice",
        question: "Best modern alternative to formulaic 'dat het verslag worde goedgekeurd'?",
        options: [
          "dat het verslag wordt goedgekeurd",
          "dat het verslag leve goedgekeurd",
          "dat het verslag moge",
          "dat het verslag zijnde goedkeuren"
        ],
        correct: 0,
        explanation: "Contemporary minutes usually switch to the indicative 'wordt'."
      }
    ]
  },
  {
    id: "g-096",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Complex Argumentative Connectors: 'daarentegen', 'krachtens'",
    titleNl: "Argumentatieve connectoren: daarentegen en krachtens",
    summary: "'Daarentegen' contrasts two predicates or sentences; 'krachtens' is a legal preposition meaning 'by virtue of' a named norm, not a casual synonym of 'volgens'.",
    rules: [
      "'Daarentegen' is a linking adverb. Fronted, it inverts: 'De export steeg. Daarentegen daalde de binnenlandse vraag.'",
      "It contrasts two comparable claims. It is heavier than 'maar' and more bookish than 'daar staat tegenover dat'.",
      "'Krachtens' takes a noun that denotes a rule, contract, or statute: 'krachtens artikel 6', 'krachtens de wet', 'krachtens overeenkomst'.",
      "'Krachtens' is not used with persons or vague sources: *'krachtens de minister' is wrong; use 'volgens de minister' or 'namens de minister'.",
      "Related legal prepositions: 'ingevolge' (as a consequence of a provision), 'uit hoofde van' (in one's capacity / on the basis of). They overlap but are not free variants."
    ],
    structuralBreakdown: "[claim A]. [Daarentegen] + [pv] + [claim B]   |   [krachtens + NORM-NP] + [rechtsgevolg]",
    examples: [
      {
        nl: "De kosten daalden. Daarentegen steeg het aantal klachten.",
        en: "Costs fell. By contrast, the number of complaints rose.",
        highlight: "Daarentegen steeg"
      },
      {
        nl: "Krachtens artikel 6 van de wet kan het college een vergunning weigeren.",
        en: "By virtue of article 6 of the act the executive may refuse a permit.",
        highlight: "Krachtens artikel 6"
      }
    ],
    commonMistake: "Writing *'krachtens de burgemeester' or *'krachtens het nieuws' as if it meant 'according to'.",
    correction: "Reserve 'krachtens' for a legal basis. For a person or medium use 'volgens' or 'namens'.",
    prerequisites: ["g-091", "g-072"],
    relatedRules: ["g-103", "g-118"],
    tags: ["connectors", "legal", "krachtens", "daarentegen", "b2"],
    exercises: [
      {
        type: "fill_in_the_blank",
        prompt: "Insert the legal preposition.",
        blankWord: "Krachtens",
        sentenceWithBlank: "___ artikel 12 wijzen wij het bezwaar af.",
        hints: ["Krachtens", "Daarentegen", "Volgens mij"]
      },
      {
        type: "multiple_choice",
        question: "Which complement of 'krachtens' is well-formed?",
        options: [
          "krachtens de minister",
          "krachtens het journaal",
          "krachtens de overeenkomst",
          "krachtens gisteren"
        ],
        correct: 2,
        explanation: "'Krachtens' wants a norm or instrument, here a contract."
      },
      {
        type: "error_correction",
        sentenceWithError: "Daarentegen de export steeg sterk.",
        correctedSentence: "Daarentegen steeg de export sterk.",
        explanation: "Fronted 'daarentegen' triggers inversion."
      },
      {
        type: "multiple_choice",
        question: "'Volgens de minister' and 'krachtens de wet' differ because…",
        options: [
          "they are perfect synonyms",
          "'volgens' cites a source of information; 'krachtens' cites a legal basis",
          "both must invert",
          "'krachtens' is only spoken Dutch"
        ],
        correct: 1,
        explanation: "Source vs legal ground is the real contrast."
      }
    ]
  },
  {
    id: "g-097",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Semantic Nuances of 'alsnog', 'alweer', 'vooralsnog'",
    titleNl: "Nuances van alsnog, alweer en vooralsnog",
    summary: "'Alsnog' means 'after all / still, later than expected'; 'alweer' marks a repeated or surprisingly early return; 'vooralsnog' hedges 'for the time being, pending new facts'.",
    rules: [
      "'Alsnog' presupposes delay or a previous negative expectation: something happens later than planned or despite earlier refusal. 'Hij kreeg alsnog toestemming.'",
      "'Alweer' combines 'al' (already) with repetition: 'alweer te laat' = late once more, often with irritation. It is not a synonym of 'opnieuw' in neutral reports.",
      "'Vooralsnog' restricts a claim to the current evidence: 'Vooralsnog ontbreken harde cijfers.' It invites later revision.",
      "Do not confuse 'alsnog' with 'nog steeds' (uninterrupted continuation) or with 'toch' (bare contrast).",
      "Position: these are middle-field adverbs. Fronting is possible and then inverts: 'Vooralsnog blijven we bij dit advies.'"
    ],
    structuralBreakdown: "[alsnog = later dan verwacht / ondanks eerdere weigering]  ≠  [alweer = herhaling]  ≠  [vooralsnog = voorlopig, herzienbaar]",
    examples: [
      {
        nl: "Na twee afwijzingen kreeg ze alsnog een vergunning.",
        en: "After two refusals she was granted a permit after all.",
        highlight: "alsnog"
      },
      {
        nl: "Vooralsnog blijft het advies ongewijzigd; de cijfers komen pas in mei.",
        en: "For the time being the advice remains unchanged; the figures only arrive in May.",
        highlight: "Vooralsnog blijft"
      }
    ],
    commonMistake: "Using 'vooralsnog' when the event already happened against the odds: *'Hij slaagde vooralsnog' instead of 'Hij slaagde alsnog'.",
    correction: "Completed late or unexpected success is 'alsnog'. 'Vooralsnog' only hedges an unfinished assessment.",
    prerequisites: ["g-030", "g-091"],
    relatedRules: ["g-111", "g-091"],
    tags: ["particles", "alsnog", "alweer", "vooralsnog", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "After two refusals she got the permit. Best adverb?",
        options: ["vooralsnog", "alweer", "alsnog", "derhalve"],
        correct: 2,
        explanation: "Late success after refusal is 'alsnog'."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Mark a claim as provisional.",
        blankWord: "Vooralsnog",
        sentenceWithBlank: "___ ontbreken harde bewijzen.",
        hints: ["Vooralsnog", "Alsnog", "Alweer"]
      },
      {
        type: "error_correction",
        sentenceWithError: "De trein is vooralsnog te laat, net als gisteren en eergisteren.",
        correctedSentence: "De trein is alweer te laat, net als gisteren en eergisteren.",
        explanation: "Annoyed repetition is 'alweer', not a hedge."
      },
      {
        type: "multiple_choice",
        question: "'Hij is nog steeds ziek' vs 'Hij is alsnog ziek geworden' — the second means…",
        options: [
          "the illness never stopped",
          "the illness arrived later than hoped or expected",
          "the illness is only provisional",
          "the illness is legal"
        ],
        correct: 1,
        explanation: "'Alsnog' encodes delay relative to an expectation, not mere continuation."
      }
    ]
  },
  {
    id: "g-098",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Gerundial and Present Participle Nominalizations",
    titleNl: "Gerundium en tegenwoordig deelwoord als nomina",
    summary: "Dutch uses infinitives as nouns ('het wachten'), present participles as adjectives or reduced relatives ('de wachtende reizigers'), and a few -end forms that have fully become nouns.",
    rules: [
      "The bare infinitive with 'het' names the activity: 'het wachten valt zwaar', 'het fietsen in de regen'. It takes 'van'-complements, not a direct object without 'van'.",
      "Present participles in -end(e) modify nouns: 'een lopend onderzoek', 'de aanwezige leden'. Inflection follows ordinary adjective rules.",
      "A small set of participles is fully nominal: 'een studente', historically from a participle, or 'de voorzitter' (agent noun, not a live participle). Do not invent *'de schrijvende' for 'the writer'.",
      "Free-standing 'wachttend' as a clause equivalent of English 'while waiting' is limited. Dutch prefers 'tijdens het wachten' or a 'terwijl'-clause.",
      "Absolute participle adjuncts ('Dit gezegd hebbende,…') exist in high style; they are marked and easily become comic if overused."
    ],
    structuralBreakdown: "[het + infinitief]  |  [participium -end(e) + N]  |  [tijdens het + infinitief]  ≠  Engels gerund-clause",
    examples: [
      {
        nl: "Het wachten op een beslissing valt de aanvragers zwaar.",
        en: "Waiting for a decision weighs heavily on the applicants.",
        highlight: "Het wachten op"
      },
      {
        nl: "De aanwezige leden keurden het lopende onderzoek goed.",
        en: "The members present approved the ongoing investigation.",
        highlight: "aanwezige / lopende"
      }
    ],
    commonMistake: "Calquing English 'Waiting, she opened the letter' as *'Wachtend opende ze de brief' in ordinary prose.",
    correction: "Use 'Terwijl ze wachtte, opende ze de brief' or 'Tijdens het wachten opende ze de brief.'",
    prerequisites: ["g-093", "g-038"],
    relatedRules: ["g-110", "g-120"],
    tags: ["participle", "infinitive-noun", "nominalisation", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Best Dutch for 'Waiting is difficult' as a named activity?",
        options: [
          "Wachtend is moeilijk.",
          "Het wachten is moeilijk.",
          "De wachtende is moeilijk.",
          "Wachtens is moeilijk."
        ],
        correct: 1,
        explanation: "Activity names use 'het' + infinitive."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Inflect the participle before a de-word plural.",
        blankWord: "aanwezige",
        sentenceWithBlank: "De ___ leden stemden voor.",
        hints: ["aanwezige", "aanwezend", "aanwezigde"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Wachtend de trein, las hij de krant.",
        correctedSentence: "Tijdens het wachten op de trein las hij de krant.",
        explanation: "Dutch does not freely use a hanging participle as a temporal clause."
      },
      {
        type: "multiple_choice",
        question: "Which form is a true activity noun?",
        options: ["lopende", "het fietsen", "fietsende", "gefietst"],
        correct: 1,
        explanation: "'Het fietsen' is the infinitival noun."
      }
    ]
  },
  {
    id: "g-099",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Impersonal Existential Constructions in Academic Dutch",
    titleNl: "Onpersoonlijke existentiezinnen in academisch Nederlands",
    summary: "Academic Dutch introduces new referents with 'er is/zijn', 'er bestaat', 'er doet zich voor', and hedges claims with 'er lijkt… te' rather than starting every sentence with a human subject.",
    rules: [
      "'Er is/zijn' agrees with the logical subject: 'er is een probleem', 'er zijn twee problemen'. In inversion the same agreement holds.",
      "'Er bestaat' is common with abstract nouns: 'Er bestaat geen consensus.' It is stronger than 'er is' when existence itself is at issue.",
      "Academic hedges: 'Er lijkt sprake te zijn van…', 'Er valt niet uit te sluiten dat…', 'Het ligt voor de hand dat…'.",
      "Do not pile dummy 'het' and 'er' without a predicate: *'Er het is belangrijk'. Choose one frame: 'Het is belangrijk dat…' or 'Er is reden om…'.",
      "Plural agreement variation exists in speech ('er is twee problemen') but standard writing keeps plural 'zijn'."
    ],
    structuralBreakdown: "[Er + is/zijn/bestaat] + [onbepaalde NP]   |   [Er + lijkt/schijnt] + [te + infinitief]",
    examples: [
      {
        nl: "Er bestaat geen overeenstemming over de omvang van het effect.",
        en: "There is no agreement on the size of the effect.",
        highlight: "Er bestaat geen overeenstemming"
      },
      {
        nl: "Er lijkt sprake te zijn van een selectiebias.",
        en: "There appears to be a selection bias.",
        highlight: "Er lijkt sprake te zijn van"
      }
    ],
    commonMistake: "Writing *'Er zijn geen consensus' or *'Het bestaat geen bewijs'.",
    correction: "Match number and dummy: 'Er bestaat geen consensus'; 'Er is geen bewijs'.",
    prerequisites: ["g-020", "g-094"],
    relatedRules: ["g-100", "g-118"],
    tags: ["existential", "er", "academic", "b2"],
    exercises: [
      {
        type: "fill_in_the_blank",
        prompt: "Agree the existential with a plural NP.",
        blankWord: "zijn",
        sentenceWithBlank: "Er ___ twee verklaringen voor dit patroon.",
        hints: ["zijn", "is", "bestaat"]
      },
      {
        type: "multiple_choice",
        question: "Best hedge that existence of bias is only apparent?",
        options: [
          "Er is een selectiebias.",
          "Er lijkt sprake te zijn van een selectiebias.",
          "Men selectiebias.",
          "Het zijn selectiebias."
        ],
        correct: 1,
        explanation: "'Er lijkt sprake te zijn van' is the stock academic hedge."
      },
      {
        type: "error_correction",
        sentenceWithError: "Er zijn geen consensus over deze meting.",
        correctedSentence: "Er bestaat geen consensus over deze meting.",
        explanation: "'Consensus' is singular; 'bestaan' is the usual verb for (non)existence of agreement."
      },
      {
        type: "multiple_choice",
        question: "Which sentence is standard written Dutch?",
        options: [
          "Er is twee problemen.",
          "Er zijn twee problemen.",
          "Het zijn twee problemen in existentie.",
          "Er het zijn twee problemen."
        ],
        correct: 1,
        explanation: "Standard agreement is plural 'zijn' with a plural pivot."
      }
    ]
  },
  {
    id: "g-100",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Quantitative Partitives in Passive and Relative Clauses",
    titleNl: "Kwantitatieve partitieven in passief en betrekkelijke bijzinnen",
    summary: "Partitives such as 'een van de', 'geen van de', 'verscheidene van de' keep the superordinate noun's gender out of the quantifier and complicate agreement in passives and relatives.",
    rules: [
      "'Een van de + plural' takes singular agreement on the main verb when 'een' is the head: 'Een van de rapporten is zoek.' Informal plural attraction ('zijn zoek') occurs but is non-standard.",
      "Relative pronouns agree with the partitive head you mean: 'een van de vrouwen die aanwezig was/waren' — singular if the relative restricts the one woman, plural if it restricts the set. Both parses exist; writers often recast.",
      "Passives: 'Een van de voorstellen werd aangenomen.' The promoted subject is singular 'een'.",
      "'Geen van beiden/allen' is singular in careful prose: 'Geen van beiden was aanwezig.' Spoken Dutch sometimes uses plural.",
      "After prepositions the whole partitive stays together: 'over een van de punten die…', not *'over een die van de punten'."
    ],
    structuralBreakdown: "[Q + van + de/het + NP-pl] + [pv sg als Q=een/geen] + [relatief die/dat …] — let op attractie",
    examples: [
      {
        nl: "Een van de bezwaren werd in hoger beroep verworpen.",
        en: "One of the objections was dismissed on appeal.",
        highlight: "Een van de bezwaren werd"
      },
      {
        nl: "Geen van de aanwezige leden was tegen het amendement.",
        en: "None of the members present was against the amendment.",
        highlight: "Geen van de aanwezige leden was"
      }
    ],
    commonMistake: "Plural attraction in writing: *'Een van de rapporten zijn zoek' and split partitives *'een die van de rapporten'.",
    correction: "Keep singular agreement with 'een/geen' as head: 'Een van de rapporten is zoek.'",
    prerequisites: ["g-025", "g-048"],
    relatedRules: ["g-099", "g-115"],
    tags: ["partitive", "agreement", "relative", "passive", "b2"],
    exercises: [
      {
        type: "fill_in_the_blank",
        prompt: "Standard written agreement after 'een van de rapporten'.",
        blankWord: "is",
        sentenceWithBlank: "Een van de rapporten ___ zoek.",
        hints: ["is", "zijn", "worden"]
      },
      {
        type: "multiple_choice",
        question: "Best passive of 'Men nam een van de voorstellen aan'?",
        options: [
          "Een van de voorstellen werden aangenomen.",
          "Een van de voorstellen werd aangenomen.",
          "Van de voorstellen een werd aangenomen.",
          "De voorstellen een werd aangenomen."
        ],
        correct: 1,
        explanation: "The derived subject is singular 'een'."
      },
      {
        type: "error_correction",
        sentenceWithError: "Geen van beiden waren op de zitting.",
        correctedSentence: "Geen van beiden was op de zitting.",
        explanation: "Careful Dutch treats 'geen van beiden' as singular."
      },
      {
        type: "multiple_choice",
        question: "Why is 'een van de vrouwen die aanwezig waren' ambiguous?",
        options: [
          "Because 'die' has no gender",
          "The relative may modify the whole set or the single woman",
          "Because passives forbid partitives",
          "Because 'van' blocks relatives"
        ],
        correct: 1,
        explanation: "Attachment to 'vrouwen' vs 'een' yields plural vs singular readings."
      }
    ]
  },
  {
    id: "g-101",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Disentangling Overloaded Tangconstructies",
    titleNl: "Overbelaste tangconstructies ontwarren",
    summary: "A tangconstructie clamps middle-field material between the finite verb and the cluster; when that middle field holds several PPs, relatives, and negation, readers lose the verb. Repair by splitting, extraposing, or promoting a noun.",
    rules: [
      "Basic tang: 'Ik heb [gisteren in Den Haag het dossier] ingezien.' The participle 'ingezien' is the right jaw.",
      "Overload appears when a relative or 'om te'-clause is also trapped: '… het dossier dat de commissie vorige week nog had opgevraagd ingezien.'",
      "Repair 1: extrapose the relative after the cluster: 'Ik heb het dossier ingezien dat de commissie vorige week had opgevraagd.'",
      "Repair 2: split into two sentences or promote a nominal: 'Na inzage van het dossier…'.",
      "Not every tang is bad. Short, expected objects between the jaws are normal Dutch. Only interruptive depth is the problem."
    ],
    structuralBreakdown: "[pv] + [te zware middenveld-NP/PP/relatief] + [cluster]  →  [pv] + [lichte NP] + [cluster] + [uitloop/relatief]",
    examples: [
      {
        nl: "De raad heeft het voorstel dat de commissie in juni na lang beraad had gedaan verworpen.",
        en: "The council rejected the proposal that the committee had made in June after long deliberation.",
        highlight: "heeft … verworpen (jaws far apart)"
      },
      {
        nl: "De raad heeft het voorstel verworpen dat de commissie in juni na lang beraad had gedaan.",
        en: "The council rejected the proposal that the committee had made in June after long deliberation.",
        highlight: "heeft het voorstel verworpen dat…"
      }
    ],
    commonMistake: "Leaving a relative and two PPs inside the jaws so the participle arrives as a surprise after twenty words.",
    correction: "Close the cluster early and extrapose the relative: '… heeft het voorstel verworpen dat…'.",
    prerequisites: ["g-045", "g-092"],
    relatedRules: ["g-108", "g-115"],
    tags: ["tangconstructie", "word-order", "extraposition", "b2"],
    exercises: [
      {
        type: "error_correction",
        sentenceWithError: "Ik heb het dossier dat de commissie vorige week nog had opgevraagd gisteren in Den Haag eindelijk ingezien.",
        correctedSentence: "Ik heb het dossier gisteren in Den Haag eindelijk ingezien dat de commissie vorige week nog had opgevraagd.",
        explanation: "Extrapose the relative so the participle is not postponed after the whole relative."
      },
      {
        type: "multiple_choice",
        question: "Which rewrite best unloads the tang?",
        options: [
          "De raad heeft het voorstel dat de commissie in juni na lang beraad had gedaan verworpen.",
          "De raad heeft het voorstel verworpen dat de commissie in juni na lang beraad had gedaan.",
          "De raad het voorstel verworpen heeft dat…",
          "Het voorstel de raad heeft verworpen."
        ],
        correct: 1,
        explanation: "Cluster first, relative afterwards."
      },
      {
        type: "multiple_choice",
        question: "A short tang such as 'Ik heb het boek gelezen' is…",
        options: [
          "ungrammatical",
          "normal Dutch",
          "only legal Dutch",
          "an afterthought error"
        ],
        correct: 1,
        explanation: "Light objects inside the jaws are the default perfect pattern."
      },
      {
        type: "word_order",
        translation: "The council has rejected the proposal.",
        tokens: ["De", "raad", "heeft", "het", "voorstel", "verworpen"],
        correctSentence: "De raad heeft het voorstel verworpen"
      }
    ]
  },
  {
    id: "g-102",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Scope of Negation and Negative Polarity Items",
    titleNl: "Bereik van ontkenning en negatief-polaire uitdrukkingen",
    summary: "Dutch 'niet' usually takes the constituent to its right in the middle field; NPIs such as 'ook maar', 'hoeven', and 'meer' (in the 'any longer' reading) need a negative licenser.",
    rules: [
      "'Niet' before a focused constituent negates that constituent: 'Ik heb niet het rapport gelezen (maar de notulen).' Sentence negation often sits before the verbal cluster: 'Ik heb het rapport niet gelezen.'",
      "'Geen' is the determiner-level negator and cannot combine with another determiner: *'geen het rapport'.",
      "NPI 'hoeven' is licensed by negation, 'nauwelijks', questions, or conditionals: 'Je hoeft niet te komen.' Without a licenser, *'Je hoeft te komen' is out (use 'moeten').",
      "'Ook maar iemand/iets' is an NPI: 'Ik heb ook maar iemand gezien' is odd without negation. 'Ik heb niemand ook maar iets verteld' is fine.",
      "Double negation is not productive standard Dutch. 'Ik heb niet niemand gezien' is substandard or jokey, not formal emphasis."
    ],
    structuralBreakdown: "[niet + gefocuste XP]  |  [XP + niet + cluster]  |  [NPI hoeven/ook maar/meer] ⇔ [negatief licentiegever]",
    examples: [
      {
        nl: "Je hoeft dat formulier niet in te vullen.",
        en: "You need not fill in that form.",
        highlight: "hoeft … niet"
      },
      {
        nl: "Ik heb niet de burgemeester gesproken, maar de wethouder.",
        en: "I did not speak to the mayor, but to the alderman.",
        highlight: "niet de burgemeester"
      }
    ],
    commonMistake: "Using 'hoeven' without a negative licenser, or placing 'niet' so that the wrong constituent is denied.",
    correction: "License 'hoeven' with 'niet/geen/nooit/nauwelijks'. Place 'niet' immediately before the focused alternative.",
    prerequisites: ["g-007", "g-033"],
    relatedRules: ["g-103", "g-114"],
    tags: ["negation", "NPI", "hoeven", "scope", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which sentence correctly licenses the NPI 'hoeven'?",
        options: [
          "Je hoeft het formulier in te vullen.",
          "Je hoeft het formulier niet in te vullen.",
          "Je moet niet hoeven het formulier.",
          "Hoeven je het formulier?"
        ],
        correct: 1,
        explanation: "'Hoeven' needs 'niet' (or another licenser)."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Pick the NPI that means 'even a single'.",
        blankWord: "ook maar",
        sentenceWithBlank: "Niemand heeft ___ iets gemerkt.",
        hints: ["ook maar", "alweer", "derhalve"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Je hoeft morgen te komen.",
        correctedSentence: "Je moet morgen komen.",
        explanation: "Without negation, obligation is 'moeten', not 'hoeven'."
      },
      {
        type: "multiple_choice",
        question: "'Ik heb niet het rapport gelezen, maar de notulen' negates…",
        options: [
          "the whole sentence equally",
          "specifically the object 'het rapport'",
          "only the tense",
          "the subject"
        ],
        correct: 1,
        explanation: "Pre-constituent 'niet' marks constituent negation with a 'maar'-alternative."
      }
    ]
  },
  {
    id: "g-103",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Deontic vs Epistemic Modality in Legal Directives",
    titleNl: "Deontische versus epistemische modaliteit in voorschriften",
    summary: "In statutes 'moeten' and 'kunnen' are usually deontic (duty/permission). The same verbs are epistemic when they estimate probability. Legal drafting tries to keep those readings apart.",
    rules: [
      "Deontic 'moet' in a directive imposes a duty: 'De aanvrager moet het formulier ondertekenen.' English drafting often uses 'shall'; Dutch uses 'moet' or the present indicative 'ondertekent'.",
      "Deontic 'kan' grants competence or permission: 'Het college kan een vergunning weigeren.' It does not by itself mean 'is likely to'.",
      "Epistemic 'moet' infers from evidence: 'Het licht brandt; ze moet thuis zijn.' That reading is rare and dangerous in statutes.",
      "Epistemic 'kan/zou kunnen' hedges possibility: 'De schade kan groter zijn dan gedacht.' Policy memos use this; operative articles should not.",
      "Replace ambiguous 'moet wel' in legal prose. Spell duty as 'is verplicht te' and inference as 'blijkt / valt af te leiden dat'."
    ],
    structuralBreakdown: "[deontisch: plicht/bevoegdheid — moet/kan + infinitief in een artikel]  ≠  [epistemisch: gevolgtrekking/kans — moet/kan + bewijssignaal]",
    examples: [
      {
        nl: "De vergunninghouder moet de administratie zeven jaar bewaren.",
        en: "The permit holder must keep the records for seven years.",
        highlight: "moet … bewaren (duty)"
      },
      {
        nl: "Gezien de stukken moet de termijn al verstreken zijn.",
        en: "Given the documents the deadline must already have expired.",
        highlight: "moet … verstreken zijn (inference)"
      }
    ],
    commonMistake: "Writing an article as 'De schade moet groter zijn' when you meant an estimate, which a court can read as a duty that the damage be larger.",
    correction: "For estimates write 'De schade kan groter zijn' or 'waarschijnlijk is de schade groter'. Keep 'moet' for obligations.",
    prerequisites: ["g-034", "g-096"],
    relatedRules: ["g-118", "g-107"],
    tags: ["modality", "deontic", "epistemic", "legal", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "'De aanvrager moet het formulier ondertekenen' is…",
        options: [
          "epistemic (we infer that he signs)",
          "deontic (he is under a duty to sign)",
          "optative",
          "generic 'men'"
        ],
        correct: 1,
        explanation: "In a directive, 'moet' encodes obligation."
      },
      {
        type: "multiple_choice",
        question: "'Het licht brandt; ze moet thuis zijn' is…",
        options: [
          "deontic: she is ordered to be home",
          "epistemic: we infer that she is home",
          "a partitive",
          "a tangconstructie"
        ],
        correct: 1,
        explanation: "Evidence + 'moet' is a classic epistemic inference."
      },
      {
        type: "error_correction",
        sentenceWithError: "Artikel 4. De schade moet groter zijn dan 400 euro.",
        correctedSentence: "Artikel 4. Een vordering is slechts ontvankelijk indien de schade groter is dan 400 euro.",
        explanation: "Do not use inferential 'moet' as if it were a threshold duty; state the condition."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Permission/competence, not likelihood.",
        blankWord: "kan",
        sentenceWithBlank: "Het college ___ een vergunning weigeren.",
        hints: ["kan", "moet", "zal wel"]
      }
    ]
  },
  {
    id: "g-104",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Rhetorical Figures in Dutch Political Discourse",
    titleNl: "Stilistische figuren in politiek Nederlands",
    summary: "Dutch political speech leans on parallelism, antithesis, rhetorical questions, and litotes ('niet onverdienstelijk') more than on ornate metaphor; recognising the figure prevents over-literal reading.",
    rules: [
      "Parallelism repeats a frame: 'Niet de macht, niet het geld, maar het vertrouwen telt.' The verb still obeys V2 in the last member.",
      "Antithesis pairs 'wel/niet', 'hier/daar', 'nu/straks': 'Wij investeren wel in onderwijs, niet in prestigeprojecten.'",
      "Litotes understates by denying the opposite: 'Dat is niet niks', 'een niet onaardig resultaat'. The polarity is weaker than a bare positive.",
      "Rhetorical 'Wie betaalt dat?' expects no answer. In writing it can look like a real question; context and lack of a reply mark it.",
      "Tricolon and anaphora ('We kunnen… We moeten… We zullen…') are common in throne speeches. They remain main clauses, not a special mood."
    ],
    structuralBreakdown: "[parallelle XP, XP, maar XP + V2]  |  [niet + antoniem = litotes]  |  [wie/wat + V2 = retorische vraag]",
    examples: [
      {
        nl: "Niet de procedure telt, niet het circus, maar het resultaat voor de burger.",
        en: "Not the procedure counts, not the circus, but the result for the citizen.",
        highlight: "Niet … niet … maar …"
      },
      {
        nl: "Een niet onverdienstelijk compromis, zou ik zeggen.",
        en: "A not uncreditable compromise, I would say.",
        highlight: "niet onverdienstelijk"
      }
    ],
    commonMistake: "Reading litotes as a full negative: treating 'niet onverdienstelijk' as 'worthless'.",
    correction: "Litotes is a hedged positive: 'rather creditable', not a denial of merit.",
    prerequisites: ["g-102", "g-092"],
    relatedRules: ["g-113", "g-111"],
    tags: ["rhetoric", "politics", "litotes", "parallelism", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "'Een niet onaardig resultaat' most nearly means…",
        options: [
          "a bad result",
          "a fairly decent result",
          "no result",
          "an illegal result"
        ],
        correct: 1,
        explanation: "Litotes weakens a positive rather than asserting a negative."
      },
      {
        type: "multiple_choice",
        question: "Which excerpt is antithesis?",
        options: [
          "We kunnen, we moeten, we zullen.",
          "Wij investeren wel in onderwijs, niet in prestigeprojecten.",
          "Er bestaat geen consensus.",
          "Leve de koning."
        ],
        correct: 1,
        explanation: "'Wel… niet…' is textbook antithesis."
      },
      {
        type: "error_correction",
        sentenceWithError: "Niet de procedure, niet het circus, het resultaat telt de burger voor.",
        correctedSentence: "Niet de procedure, niet het circus, maar het resultaat voor de burger telt.",
        explanation: "The last parallel member must still be a grammatical V2 clause."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Complete the litotes.",
        blankWord: "niks",
        sentenceWithBlank: "Vier zetels winst is niet ___.",
        hints: ["niks", "alles", "men"]
      }
    ]
  },
  {
    id: "g-105",
    section: 7,
    sectionTitle: "B2 Advanced Register & Nuance",
    level: "B2",
    title: "Punctuation, Semicolons, and Colon Scope in Dutch Syntax",
    titleNl: "Interpunctie: puntkomma en bereik van de dubbele punt",
    summary: "Dutch uses the semicolon between closely related main clauses without a coordinator, and a colon to project an explanation or list whose syntactic scope runs to the next full stop.",
    rules: [
      "A semicolon joins two main clauses that could be separate sentences but belong together argumentatively: 'De termijn is verstreken; wij wijzen het verzoek af.' Each side keeps V2.",
      "Do not put a semicolon before 'dat' or 'omdat'. Those are subordinators and want a comma at most.",
      "A colon announces an elaboration, quote, or list. What follows may be a clause, a list, or a quoted sentence. The first word after a colon is not capitalised unless it is a proper name or a full quoted sentence.",
      "Lists after a colon are often introduced by 'de volgende:' or by a noun. Avoid a colon directly after a preposition (*'volgens: artikel 6').",
      "Dutch comma rules are lighter than German's. You may omit commas around short restrictive relatives; you should use them around non-restrictive appositions."
    ],
    structuralBreakdown: "[hoofdzin V2] ; [hoofdzin V2]   |   [aanloop] : [toelichting | opsomming | citaat tot de volgende punt]",
    examples: [
      {
        nl: "De zienswijzetermijn is voorbij; we publiceren het ontwerpbesluit volgende week.",
        en: "The period for views is over; we will publish the draft decision next week.",
        highlight: "voorbij; we publiceren"
      },
      {
        nl: "Het college overweegt drie opties: uitstel, afwijzing of een nieuwe ronde.",
        en: "The executive is considering three options: postponement, rejection or a new round.",
        highlight: "opties: uitstel, afwijzing of"
      }
    ],
    commonMistake: "A semicolon before a subordinate clause (*'…; omdat de termijn verstreken is') or a capital after a colon in a mere list.",
    correction: "Use a comma or a full stop before 'omdat'. After a colon in a list, keep lower case: 'drie opties: uitstel, afwijzing of…'.",
    prerequisites: ["g-061", "g-091"],
    relatedRules: ["g-120", "g-108"],
    tags: ["punctuation", "semicolon", "colon", "syntax", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which punctuation is correct?",
        options: [
          "De termijn is verstreken; omdat wij te laat zijn.",
          "De termijn is verstreken; wij wijzen het verzoek af.",
          "De termijn is verstreken: omdat wij te laat zijn;",
          "De termijn is verstreken wij; wijzen af."
        ],
        correct: 1,
        explanation: "Semicolon links two main clauses, each with V2."
      },
      {
        type: "error_correction",
        sentenceWithError: "Het college overweegt drie opties: Uitstel, Afwijzing of Een nieuwe ronde.",
        correctedSentence: "Het college overweegt drie opties: uitstel, afwijzing of een nieuwe ronde.",
        explanation: "List items after a colon stay lower case unless they are names."
      },
      {
        type: "multiple_choice",
        question: "A colon after 'volgens' in *'volgens: artikel 6' is wrong because…",
        options: [
          "colons are illegal in Dutch",
          "a preposition cannot be separated from its complement by a colon",
          "article numbers forbid punctuation",
          "you must use a semicolon instead"
        ],
        correct: 1,
        explanation: "The PP must stay intact: 'volgens artikel 6'."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Choose the mark that joins two related main clauses.",
        blankWord: ";",
        sentenceWithBlank: "De cijfers zijn duidelijk___ de interpretatie niet.",
        hints: [";", ":", ","]
      }
    ]
  }
];
