export const lessons = [
  {
    id: "g-031",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "Simple Past Tense (OVT) of Weak Verbs: 't kofschip",
    titleNl: "Verleden Tijd (OVT): Zwakke Werkwoorden",
    summary:
      "Weak verbs form the onvoltooid verleden tijd with a dental suffix: voiceless kofschip sounds p, t, k, f, s, ch take -te(n); voiced stems take -de(n). Spelling then writes v as f and z as s, which is why you see leefde and reisde.",
    rules: [
      "Find the spoken stem (infinitive minus -en, with open/closed spelling). Decide -te vs -de on the last sound before final-obstruent spelling: only voiceless p, t, k, f, s, ch ('t kofschip / soft ketchup) take -te(n).",
      "Then write the stem with v→f and z→s: leven has voiced /v/, so -de, spelled leefde; reizen has /z/, so reisde — not *leefte or *reiste. Native f/s (blaffen, wensen) do take -te: blafte, wenste.",
      "If the stem ends in any other sound (l, m, n, r, g, w, vowels), add -de / -den: ik woonde, wij woonden; ik belde.",
      "Weak past forms do not change for person after the suffix is chosen: ik/jij/hij/zij/het all share the same -te or -de form. Inversion does not drop anything extra (werkte je?, woonde hij?).",
      "A stem that already ends in t still takes -te: praten → praatte, zetten → zette. Double letters here are spelling, not a new tense."
    ],
    structuralBreakdown:
      "[Onderwerp] + [stam-na-spelling + -te/-de] + [rest]  |  meervoud: [stam + -ten/-den]  ·  toets: p t k f s ch → stemloos",
    examples: [
      {
        nl: "Gisteren fietste Sanne naar het station en belde daarna haar broer.",
        en: "Yesterday Sanne cycled to the station and then called her brother.",
        highlight: "fietste (-te na t), belde (-de na l)"
      },
      {
        nl: "Wij reisden door Zeeland, maar de boot stopte bij Vlissingen.",
        en: "We travelled through Zeeland, but the boat stopped at Vlissingen.",
        highlight: "reisden (z→s, daarna -den), stopte (-te na p)"
      }
    ],
    commonMistake:
      "Writing *leefte or *reiste because the written stem ends in f or s.",
    correction:
      "Test voicing on the stem before final-obstruent spelling: /v/ and /z/ take -de (leefde, reisde). Only original f/s (blafte, danste) take -te.",
    prerequisites: ["g-005", "g-001"],
    relatedRules: ["g-032", "g-035"],
    tags: ["ovt", "zwakke-werkwoorden", "kofschip", "a2", "verleden-tijd"],
    exercises: [
      {
        type: "multiple_choice",
        question: "What is the correct simple past of 'wonen' for 'zij' (she)?",
        options: ["woonde", "woonte", "woonden", "woontte"],
        correct: 0,
        explanation: "Stem woon ends in n (not a kofschip letter), so singular takes -de: zij woonde."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Past of 'maken' after a voiceless stem-final k:",
        blankWord: "maakte",
        sentenceWithBlank: "Hij ___ gisteren een taart voor haar verjaardag.",
        hints: ["maakte", "maakde", "maakten"]
      },
      {
        type: "typed_conjugation",
        infinitive: "leven",
        subject: "ik",
        targetTense: "simple past (OVT)",
        correctForm: "leefde",
        explanation: "Voiced stem /v/ selects -de; spelling then gives leefde."
      },
      {
        type: "error_correction",
        sentenceWithError: "Wij werkde tot elf uur in de winkel.",
        correctedSentence: "Wij werkten tot elf uur in de winkel.",
        explanation: "Plural weak past needs -ten after kofschip stem werk-."
      }
    ]
  },
  {
    id: "g-032",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "Simple Past Tense (OVT) of Strong Verbs",
    titleNl: "Verleden Tijd (OVT): Sterke Werkwoorden",
    summary:
      "Strong verbs mark the simple past by a vowel change in the stem (ablaut) and take no -te/-de; the plural usually adds -en to that past stem.",
    rules: [
      "Memorise the ablaut set, not a suffix: ik loop → ik liep, ik eet → ik at, ik schrijf → ik schreef, ik vind → ik vond, ik zie → ik zag.",
      "Singular past has one form for ik/jij/hij/zij/het (hij liep, jij at). Plural is past stem + -en with regular spelling (wij liepen, zij aten, jullie schreven).",
      "Inversion with jij does not add or drop a -t on strong pasts: liep je?, at je?, zag hij? There is no present-tense -t to remove.",
      "Some strong verbs shorten or lengthen vowels between singular and plural past (ik zag / wij zagen; ik brak / wij braken). Keep the past vowel, then apply open-syllable spelling.",
      "Do not mix systems: *loopte and *eette are wrong. If a verb is strong, 't kofschip never applies in the OVT."
    ],
    structuralBreakdown:
      "[Onderwerp] + [ablaut-stam (enkelvoud)]  |  [ablaut-stam + -en (meervoud)]  ·  geen dentaalsuffix",
    examples: [
      {
        nl: "Zij schreef drie brieven en ik vond de enveloppen in de la.",
        en: "She wrote three letters and I found the envelopes in the drawer.",
        highlight: "schreef, vond"
      },
      {
        nl: "At je gisteren nog iets voordat de winkel sloot?",
        en: "Did you still eat anything yesterday before the shop closed?",
        highlight: "At je (sterk, inversie zonder -t)"
      }
    ],
    commonMistake:
      "Adding -te to a strong verb (*loopte naar huis) because the present stem ends in p.",
    correction:
      "Check the strong list first: lopen → liep/liepen. Kofschip only decides weak dentals.",
    prerequisites: ["g-031"],
    relatedRules: ["g-036", "g-042"],
    tags: ["ovt", "sterke-werkwoorden", "ablaut", "a2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which sentence uses a correct strong simple past?",
        options: [
          "Hij loopte naar de bushalte.",
          "Hij liep naar de bushalte.",
          "Hij looptte naar de bushalte.",
          "Hij heeft liep naar de bushalte."
        ],
        correct: 1,
        explanation: "Lopen is strong: past stem liep, no dental suffix."
      },
      {
        type: "typed_conjugation",
        infinitive: "schrijven",
        subject: "wij",
        targetTense: "simple past (OVT)",
        correctForm: "schreven",
        explanation: "Past vowel ee, then plural -en: schreven."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Strong past of 'zien' for 'ik':",
        blankWord: "zag",
        sentenceWithBlank: "Ik ___ haar nog bij de kassa staan.",
        hints: ["zag", "zag", "zien"]
      },
      {
        type: "word_order",
        translation: "Did you find the keys under the table?",
        tokens: ["Vond", "je", "de", "sleutels", "onder", "de", "tafel"],
        correctSentence: "Vond je de sleutels onder de tafel"
      }
    ]
  },
  {
    id: "g-033",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "Past Tense of Modal Auxiliary Verbs",
    titleNl: "Verleden Tijd van Modale Hulpwerkwoorden",
    summary:
      "The core modals kunnen, mogen, moeten, willen, zullen have irregular simple-past stems; the lexical verb stays an infinitive at the end of the clause.",
    rules: [
      "Past stems: kunnen → kon / konden; mogen → mocht / mochten; moeten → moest / moesten; willen → wou or wilde / wouden or wilden; zullen → zou / zouden.",
      "Kon and wou are the usual spoken singulars; wilde is equally standard in writing. Avoid mixing *ik kond or *wij mocht.",
      "The main verb remains an infinitive, not a participle: Zij moest vroeg opstaan, not *opgestaan. In a main clause the modal is V2 and the infinitive is final.",
      "Zou/zouden is the past of zullen and also the ordinary conditional marker (see g-044). In narrative it reports a future-in-the-past: Hij zei dat hij zou komen.",
      "Inversion still drops nothing extra on these pasts: kon je?, moest hij?, wou je mee?"
    ],
    structuralBreakdown:
      "[Onderwerp] + [kon/mocht/moest/wilde|wou/zou] + [middenveld] + [infinitief]",
    examples: [
      {
        nl: "We konden de trein niet meer halen, dus moesten we een uur wachten.",
        en: "We could no longer catch the train, so we had to wait an hour.",
        highlight: "konden … halen, moesten … wachten"
      },
      {
        nl: "Mocht je gisteren al naar binnen, of wilde de portier je paspoort zien?",
        en: "Were you already allowed in yesterday, or did the porter want to see your passport?",
        highlight: "Mocht je, wilde"
      }
    ],
    commonMistake:
      "Putting a past participle after a past modal (*Zij moest opgestaan om zes uur).",
    correction:
      "Keep the second verb as an infinitive: Zij moest om zes uur opstaan.",
    prerequisites: ["g-031", "g-032"],
    relatedRules: ["g-043", "g-044"],
    tags: ["modaal", "ovt", "hulpwerkwoord", "a2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Choose the correct past of 'kunnen' for 'wij'.",
        options: ["kon", "konden", "kunt", "gekund"],
        correct: 1,
        explanation: "Plural past of kunnen is konden."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Past of 'moeten' before a final infinitive:",
        blankWord: "moest",
        sentenceWithBlank: "Hij ___ gisteren tot tienen werken.",
        hints: ["moest", "moeten", "moeten"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Zij wilde een nieuwe jas gekocht.",
        correctedSentence: "Zij wilde een nieuwe jas kopen.",
        explanation: "After a modal the lexical verb is an infinitive."
      },
      {
        type: "typed_conjugation",
        infinitive: "mogen",
        subject: "jullie",
        targetTense: "simple past (OVT)",
        correctForm: "mochten",
        explanation: "Plural of mocht is mochten."
      }
    ]
  },
  {
    id: "g-034",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "Present Perfect Tense (VTT): Auxiliary 'hebben' vs 'zijn'",
    titleNl: "Voltooid Tegenwoordige Tijd: hebben of zijn",
    summary:
      "The voltooid tegenwoordige tijd pairs a finite present of hebben or zijn with a clause-final past participle; zijn is reserved for telic motion, change of state, and a closed list of copular/event verbs.",
    rules: [
      "Default auxiliary is hebben for activities, states, and almost every transitive verb: Ik heb de brief geschreven, We hebben tot laat gewerkt.",
      "Use zijn when the verb names a completed change of location or state (telic): Zij is naar Utrecht gegaan, Het water is bevroren, De soep is opgegaan.",
      "Always zijn with blijven, zijn, worden, gebeuren, plaatsvinden, and most inchoatives such as groeien, sterven, verdwijnen when they describe a result: Hij is ziek geweest, Het is gisteren gebeurd.",
      "The same lemma can take both: Ik heb veel gelopen (activity, no endpoint) vs Ik ben naar huis gelopen (motion to a goal). Transitive use stays with hebben: Ik heb de koffers naar boven gedragen.",
      "Finite auxiliary sits in V2; the participle is last unless another infinitive triggers IPP (finite + infinitives, no participle)."
    ],
    structuralBreakdown:
      "[Onderwerp] + [heb/heeft/hebben | ben/is/zijn] + [middenveld] + [voltooid deelwoord]",
    examples: [
      {
        nl: "Mila heeft de planten water gegeven, maar de kat is naar de schuur gevlucht.",
        en: "Mila has watered the plants, but the cat has fled to the shed.",
        highlight: "heeft … gegeven (transitief), is … gevlucht (telische beweging)"
      },
      {
        nl: "We zijn in Maastricht gebleven omdat de trein is uitgevallen.",
        en: "We stayed in Maastricht because the train was cancelled.",
        highlight: "zijn … gebleven, is uitgevallen"
      }
    ],
    commonMistake:
      "Using hebben with goal-oriented gaan/komen/vertrekken (*Ik heb naar huis gegaan).",
    correction:
      "Mark the reached destination with zijn: Ik ben naar huis gegaan.",
    prerequisites: ["g-003", "g-035"],
    relatedRules: ["g-041", "g-039"],
    tags: ["vtt", "hebben", "zijn", "hulpwerkwoord", "a2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which auxiliary is required in 'Zij ___ gisteren naar Gent gereden'?",
        options: ["heeft", "is", "hebt", "was"],
        correct: 1,
        explanation: "Rijden naar a place is telic motion, so zijn: is … gereden."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Auxiliary for a transitive result:",
        blankWord: "heeft",
        sentenceWithBlank: "Tom ___ de fiets in de schuur gezet.",
        hints: ["heeft", "is", "hebben"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Ik heb naar de bakker geweest.",
        correctedSentence: "Ik ben naar de bakker geweest.",
        explanation: "Zijn/wezen and motion-to-a-place take zijn."
      },
      {
        type: "sentence_transformation",
        original: "Eva schrijft een lang verslag.",
        instruction: "Zet in de voltooid tegenwoordige tijd.",
        transformed: "Eva heeft een lang verslag geschreven.",
        hints: ["hulpwerkwoord hebben + geschreven"]
      }
    ]
  },
  {
    id: "g-035",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "Past Participle Formation of Weak Verbs",
    titleNl: "Voltooid Deelwoord van Zwakke Werkwoorden",
    summary:
      "Weak participles are ge- + spelled stem + -t or -d, with the same voicing test as the OVT: kofschip letters take -t, other stems take -d.",
    rules: [
      "Prefix ge- unless the verb already has an unstressed inseparable prefix (g-037) or is separable (g-038, ge- between particle and stem).",
      "Add -t after original kofschip sounds and -d after voiced stems (then spell v→f, z→s): gewerkt, gefietst, gemaakt; gewoond, gebeld, geleefd, gereisd.",
      "If the stem already ends in t or d, you still write only one final letter: gezet (zetten), gepraat, gered — never *gezetd.",
      "The participle itself does not agree with the subject when it is verbal. Agreement -e appears only in attributive use (g-040).",
      "Pronounce final -d as [t], but keep the spelling contrast: ik heb betaald vs ik heb gewerkt."
    ],
    structuralBreakdown:
      "[ge- + stam-na-spelling + -t (ptkfsch)]  vs  [ge- + stam + -d (overige)]",
    examples: [
      {
        nl: "De loodgieter heeft de kraan gemaakt en daarna de kelder schoongemaakt.",
        en: "The plumber has fixed the tap and then cleaned the cellar.",
        highlight: "gemaakt, schoongemaakt"
      },
      {
        nl: "Heb je je oma al gebeld, of heb je alleen een kaartje gestuurd?",
        en: "Have you already called your grandma, or have you only sent a card?",
        highlight: "gebeld (-d na l), gestuurd (-d na r)"
      }
    ],
    commonMistake:
      "Writing *gewoont or *geleeft because the present third person is woont/leeft.",
    correction:
      "Participle voicing follows the stem, not the present -t: gewoond, geleefd.",
    prerequisites: ["g-031"],
    relatedRules: ["g-036", "g-037", "g-038"],
    tags: ["voltooid-deelwoord", "zwak", "kofschip", "a2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Past participle of 'fietsen'?",
        options: ["gefietst", "gefiesd", "gefietstte", "gefietsen"],
        correct: 0,
        explanation: "Stem fiets- ends in s (kofschip) → ge- + fiets + t."
      },
      {
        type: "typed_conjugation",
        infinitive: "wonen",
        subject: "past participle",
        targetTense: "voltooid deelwoord",
        correctForm: "gewoond",
        explanation: "Stem woon + -d (n is not kofschip)."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Weak participle of 'werken':",
        blankWord: "gewerkt",
        sentenceWithBlank: "Ik heb vandaag acht uur ___.",
        hints: ["gewerkt", "gewerkd", "werken"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Zij heeft haar vriendin gisteren gebelt.",
        correctedSentence: "Zij heeft haar vriendin gisteren gebeld.",
        explanation: "Stem bel- ends in l → -d: gebeld."
      }
    ]
  },
  {
    id: "g-036",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "Past Participle Formation of Strong Verbs",
    titleNl: "Voltooid Deelwoord van Sterke Werkwoorden",
    summary:
      "Strong participles typically take ge- plus a third-ablaut stem ending in -en; a smaller mixed group uses ge- + stem + -en with a vowel unlike both present and past.",
    rules: [
      "Learn the three-form row: schrijven – schreef – geschreven; vinden – vond – gevonden; zingen – zong – gezongen; helpen – hielp – geholpen.",
      "The participle vowel is often not the OVT vowel (blijven – bleef – gebleven; kijken – keek – gekeken). Do not recycle the simple-past stem.",
      "ge- is omitted on inseparable-prefix strong verbs: begrijpen → begrepen, verdwijnen → verdwenen, ontvangen → ontvangen.",
      "A few high-frequency verbs are hybrid (g-042): vragen – vroeg – gevraagd ends in -d, not -en.",
      "In a perfect without a second infinitive you need the participle: Ik heb het boek gelezen. With a second infinitive, IPP replaces the participle: Ik heb het boek willen lezen."
    ],
    structuralBreakdown:
      "[(ge-) + ablaut3-stam + -en]  ·  uitzondering: hybride op -d/-t",
    examples: [
      {
        nl: "De gids heeft het schilderij gevonden dat decennia was verdwenen.",
        en: "The guide has found the painting that had disappeared for decades.",
        highlight: "gevonden, verdwenen"
      },
      {
        nl: "Heb je ooit in de Waal gezwommen, of alleen maar gekeken?",
        en: "Have you ever swum in the Waal, or only watched?",
        highlight: "gezwommen, gekeken"
      }
    ],
    commonMistake:
      "Forming *geschreefd or *gevindt by adding a weak dental to the present or past stem.",
    correction:
      "Use the -en participle: geschreven, gevonden.",
    prerequisites: ["g-032", "g-035"],
    relatedRules: ["g-042", "g-037"],
    tags: ["voltooid-deelwoord", "sterk", "ablaut", "a2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "What is the past participle of 'schrijven'?",
        options: ["geschreef", "geschreven", "geschrijfd", "geschrijft"],
        correct: 1,
        explanation: "Strong class: schrijven – schreef – geschreven."
      },
      {
        type: "typed_conjugation",
        infinitive: "vinden",
        subject: "past participle",
        targetTense: "voltooid deelwoord",
        correctForm: "gevonden",
        explanation: "Third ablaut o + -en: gevonden."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Strong participle of 'zingen':",
        blankWord: "gezongen",
        sentenceWithBlank: "Het koor heeft drie psalmen ___.",
        hints: ["gezongen", "gezingt", "zongen"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Wij hebben de sleutel onder de mat gevindt.",
        correctedSentence: "Wij hebben de sleutel onder de mat gevonden.",
        explanation: "Vinden is strong: gevonden, not gevindt."
      }
    ]
  },
  {
    id: "g-037",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "Inseparable Prefix Verbs: 'be-', 'ge-', 'ver-', 'ont-', 'her-'",
    titleNl: "Onscheidbare Voorvoegsels: be-, ge-, ver-, ont-, her-",
    summary:
      "Unstressed prefixes be-, ge-, ver-, ont-, her- stay glued to the stem in every tense; the past participle never adds a second ge-.",
    rules: [
      "In main clauses the whole verb occupies V2: Zij betaalt de rekening, Hij verkoopt zijn auto, We herkennen het gebouw. The prefix does not float to the end.",
      "Present and past endings attach to the full form: ik begrijp, zij begreep, wij ontmoetten. Stress stays on the stem, not on the prefix.",
      "Participles omit extra ge-: betaald, begrepen, verkocht, ontmoet, herhaald — never *gebetaald or *geverkocht.",
      "ge- as inseparable prefix (gebeuren, gebruiken, geloven) is not the participle marker. Participles are gebeurd, gebruikt, geloofd.",
      "Contrast with stressed separable particles (op-, aan-, mee-): those do split and do take internal ge- (opgebeld)."
    ],
    structuralBreakdown:
      "[onbeklemtoond voorvoegsel+stam] in V2  ·  deelwoord: [voorvoegsel+stam+d/t/en] zonder extra ge-",
    examples: [
      {
        nl: "De gemeente heeft het plan herzien en de vergunning vervolgens verleend.",
        en: "The municipality has revised the plan and then granted the permit.",
        highlight: "herzien, verleend"
      },
      {
        nl: "Begrijp je waarom zij de uitnodiging heeft afgewezen maar de fout heeft hersteld?",
        en: "Do you understand why she declined the invitation but repaired the mistake?",
        highlight: "Begrijp je (onscheidbaar), hersteld (geen extra ge-)"
      }
    ],
    commonMistake:
      "Stacking the participle ge- on an inseparable verb: *geverkocht, *gebetaald, *geherhaald.",
    correction:
      "Verkopen → verkocht; betalen → betaald; herhalen → herhaald. No second ge-.",
    prerequisites: ["g-035", "g-036"],
    relatedRules: ["g-038"],
    tags: ["onscheidbaar", "voorvoegsel", "deelwoord", "a2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Past participle of 'verkopen'?",
        options: ["verkocht", "geverkocht", "verkoopt", "verkooptege"],
        correct: 0,
        explanation: "Inseparable ver- blocks extra ge-; strong/hybrid form is verkocht."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Participle of 'betalen':",
        blankWord: "betaald",
        sentenceWithBlank: "Heb je de huur al ___?",
        hints: ["betaald", "gebetaald", "betaalt"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Zij heeft het verhaal gisteren geherhaald.",
        correctedSentence: "Zij heeft het verhaal gisteren herhaald.",
        explanation: "her- is inseparable; participle is herhaald."
      },
      {
        type: "typed_conjugation",
        infinitive: "ontmoeten",
        subject: "past participle",
        targetTense: "voltooid deelwoord",
        correctForm: "ontmoet",
        explanation: "ont- + stem meeting already ending in t: ontmoet, no ge-."
      }
    ]
  },
  {
    id: "g-038",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "Past Participle of Separable Verbs",
    titleNl: "Voltooid Deelwoord van Scheidbare Werkwoorden",
    summary:
      "Separable particles (op, aan, mee, terug, vast, door…) leave the finite verb in V2 and sit at the clause end; in the participle, ge- is sandwiched: particle + ge- + stem + ending.",
    rules: [
      "Finite present/past: prefix splits off. Ik bel je vanavond op. Zij maakte het raam open. The particle is last after objects and adverbials.",
      "Participle shape: opgebeld, aangekomen, meegenomen, teruggegeven, vastgelegd. Never *geopbeld or *opgebeld with ge- in front of the particle.",
      "Auxiliary choice follows meaning, not the particle: aankomen (telic arrival) → is aangekomen; opbellen (transitive activity) → heeft opgebeld.",
      "In subordinate clauses the finite form and the particle rejoin at the end: …dat ik je vanavond opbel. The perfect stacks auxiliary + participle: …dat ik je heb opgebeld.",
      "If a modal plus infinitive is present, IPP often appears: …dat zij hem heeft willen opbellen (infinitive cluster, not opgebeld)."
    ],
    structuralBreakdown:
      "V2-splitsing: [pv] … [partikel]  ·  deelwoord: [partikel + ge- + stam + t/d/en]",
    examples: [
      {
        nl: "Lars heeft zijn moeder vanuit de trein opgebeld en is net aangekomen.",
        en: "Lars has called his mother from the train and has just arrived.",
        highlight: "opgebeld, is aangekomen"
      },
      {
        nl: "Zodra zij de sleutels heeft teruggegeven, sluiten we het kantoor af.",
        en: "As soon as she has returned the keys, we will lock up the office.",
        highlight: "teruggegeven, sluiten … af"
      }
    ],
    commonMistake:
      "Placing ge- before the particle (*geopbeld) or forgetting ge- (*opbeld).",
    correction:
      "Insert ge- after the stressed particle: opgebeld, meegenomen.",
    prerequisites: ["g-035", "g-037"],
    relatedRules: ["g-034", "g-041"],
    tags: ["scheidbaar", "deelwoord", "partikel", "a2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Correct participle of 'opbellen'?",
        options: ["geopbeld", "opgebeld", "opbeld", "gebelop"],
        correct: 1,
        explanation: "Particle + ge- + bel + d."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Arrival participle of 'aankomen':",
        blankWord: "aangekomen",
        sentenceWithBlank: "De ferry is om tien uur ___.",
        hints: ["aangekomen", "geaankomen", "aankomt"]
      },
      {
        type: "word_order",
        translation: "I will call you this evening (separable present).",
        tokens: ["Ik", "bel", "je", "vanavond", "op"],
        correctSentence: "Ik bel je vanavond op"
      },
      {
        type: "error_correction",
        sentenceWithError: "Zij heeft de dozen naar boven meegenomen niet.",
        correctedSentence: "Zij heeft de dozen niet naar boven meegenomen.",
        explanation: "Niet stands before the verbal cluster; participle stays final."
      }
    ]
  },
  {
    id: "g-039",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "Past Perfect Tense (VVT: Voltooid Verleden Tijd)",
    titleNl: "Voltooid Verleden Tijd",
    summary:
      "The past perfect places a simple-past auxiliary (had/hadden or was/waren) before the same participle used in the VTT, to mark a result already complete before another past time.",
    rules: [
      "hebben-verbs use had / hadden + participle: Ik had de deur al gesloten toen de post kwam.",
      "zijn-verbs use was / waren + participle: Zij was al vertrokken voordat de taxi arriveerde.",
      "Keep the same auxiliary you would choose in the present perfect; only the auxiliary tense changes.",
      "Typical companions are toen, voordat, nadat, and reported past: Nadat we hadden gegeten, gingen we wandelen.",
      "Do not stack two participles for one event (*had geweest gegaan). One auxiliary, one participle, unless a modal cluster triggers IPP: had willen gaan."
    ],
    structuralBreakdown:
      "[Onderwerp] + [had/hadden | was/waren] + [middenveld] + [voltooid deelwoord]",
    examples: [
      {
        nl: "De bakker had het brood al verkocht voordat wij de winkel binnenstapten.",
        en: "The baker had already sold the bread before we stepped into the shop.",
        highlight: "had … verkocht, binnenstapten"
      },
      {
        nl: "Toen de veerboot aanmeerde, waren de fietsers allang aangekomen.",
        en: "When the ferry docked, the cyclists had long since arrived.",
        highlight: "waren … aangekomen"
      }
    ],
    commonMistake:
      "Using a present auxiliary for a double-past timeline (*Ik heb al gegeten toen hij belde) when both events are past and one precedes the other.",
    correction:
      "Backshift the earlier event: Ik had al gegeten toen hij belde.",
    prerequisites: ["g-034", "g-031"],
    relatedRules: ["g-055", "g-048"],
    tags: ["vvt", "plusquamperfectum", "had", "was", "a2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Correct past perfect for telic 'vertrekken' with 'zij'?",
        options: [
          "Zij had al vertrokken.",
          "Zij was al vertrokken.",
          "Zij is al vertrok.",
          "Zij hebben al vertrokken."
        ],
        correct: 1,
        explanation: "Vertrekken takes zijn; past auxiliary is was."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Past auxiliary of hebben before a participle:",
        blankWord: "had",
        sentenceWithBlank: "Ik ___ de lamp al uitgedaan.",
        hints: ["had", "heb", "was"]
      },
      {
        type: "sentence_transformation",
        original: "Nadat we eten, gaan we wandelen.",
        instruction: "Maak er een verleden sequentie van met VVT + OVT.",
        transformed: "Nadat we hadden gegeten, gingen we wandelen.",
        hints: ["hadden gegeten", "gingen"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Zij was de brief al geschreven toen de koerier belde.",
        correctedSentence: "Zij had de brief al geschreven toen de koerier belde.",
        explanation: "Schrijven is transitive → hadden-family: had geschreven."
      }
    ]
  },
  {
    id: "g-040",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "Attributive Use of Past and Present Participles",
    titleNl: "Bijvoeglijk Gebruik van Deelwoorden",
    summary:
      "Participles can stand as adjectives before a noun; they then follow ordinary adjective inflection (-e after de-words, plurals, and definite het-phrases).",
    rules: [
      "Present participle (infinitive + -d) means ‘that is V-ing’: een lopende motor, de zingende kinderen. It stays -d even after ge-less verbs.",
      "Past participle as adjective is usually passive or resultative: de gebroken vaas, het gesloten loket, een verkocht huis.",
      "Inflect like other adjectives: de gesloten deuren, het gesloten hek, een gesloten hek (indefinite het-noun often no -e), een gesloten deur (de-noun still -e).",
      "Long participial phrases can sit before the noun: de gisteren aangekomen gasten, een door de storm gevelde boom. The noun stays last in that NP.",
      "Do not inflect a verbal participle in the predicate: De vaas is gebroken (not *gebrokene) unless it is a true noun (de gewonden)."
    ],
    structuralBreakdown:
      "[lidwoord] + [(modificatie) + deelwoord (+ -e)] + [substantief]  vs  predicaat: [zijn] + [onverbogen deelwoord]",
    examples: [
      {
        nl: "De gisteren aangekomen reizigers wachtten bij het gesloten loket.",
        en: "The travellers who arrived yesterday waited at the closed ticket window.",
        highlight: "aangekomen reizigers, gesloten loket"
      },
      {
        nl: "Een brandende kaars stond naast de gebroken spiegel.",
        en: "A burning candle stood next to the broken mirror.",
        highlight: "brandende, gebroken"
      }
    ],
    commonMistake:
      "Leaving a definite het-phrase without -e (*het lopend kind) or inflecting a predicative participle (*Het hek is geslotene).",
    correction:
      "Attributive after het/de: het lopende kind, het gesloten hek. Predicative: Het hek is gesloten.",
    prerequisites: ["g-035", "g-036"],
    relatedRules: ["g-045", "g-057"],
    tags: ["deelwoord", "attributief", "adjectief", "a2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which attributive form is correct before 'kind' after 'het'?",
        options: ["het slapend kind", "het slapende kind", "het slaapt kind", "het geslaap kind"],
        correct: 1,
        explanation: "Definite het-NP: present participle takes -e."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Inflected past participle before a de-noun:",
        blankWord: "gestolen",
        sentenceWithBlank: "De politie zoekt de ___ fiets.",
        hints: ["gestolen", "gestolene", "steel"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Het hek is geslotene sinds de storm.",
        correctedSentence: "Het hek is gesloten sinds de storm.",
        explanation: "Predicative participle is not inflected."
      },
      {
        type: "sentence_transformation",
        original: "De gasten zijn gisteren aangekomen.",
        instruction: "Maak er een nominale groep van: 'de … gasten'.",
        transformed: "de gisteren aangekomen gasten",
        hints: ["deelwoord vóór het substantief"]
      }
    ]
  },
  {
    id: "g-041",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "Motion and State Change Verbs Taking 'zijn'",
    titleNl: "Bewegings- en Toestandsverandering met 'zijn'",
    summary:
      "Zijn partners with verbs that present a completed path or a new state; without an endpoint the same motion verb often switches back to hebben.",
    rules: [
      "Core motion with a goal, source, or arrival: gaan, komen, vertrekken, aankomen, vallen, stijgen, dalen, vluchten + zijn when the change is presented as finished.",
      "State-change inchoatives: groeien, sterven, ontwaken, verdwijnen, smelten, bevriezen, veranderen, genezen (intransitive) take zijn: De sneeuw is gesmolten.",
      "blijven, zijn, worden, gebeuren, slagen, lukken are lexical zijn-verbs even without spatial motion: Het is goed gegaan; Zij is geslaagd.",
      "Add a direct object and you almost always return to hebben: Ik heb de koffer naar boven gedragen; Hij heeft de prijs gewonnen (transitive winnen).",
      "Bare activity readings keep hebben: We hebben uren gelopen / gezwommen / gereden — no arrival is asserted."
    ],
    structuralBreakdown:
      "[zijn + deelwoord] ↔ telisch pad/toestand  ·  [hebben + deelwoord] ↔ activiteit of transitief object",
    examples: [
      {
        nl: "Na de finish is Noor flauwgevallen, maar ze is snel weer bijgekomen.",
        en: "After the finish Noor fainted, but she quickly came to again.",
        highlight: "is flauwgevallen, is bijgekomen"
      },
      {
        nl: "We hebben de hele middag in het park gelopen; pas om zes uur zijn we naar huis gegaan.",
        en: "We walked in the park all afternoon; only at six did we go home.",
        highlight: "hebben … gelopen, zijn … gegaan"
      }
    ],
    commonMistake:
      "Treating every motion verb as a zijn-verb even in atelic descriptions (*Ik ben drie uur gereden zonder bestemming).",
    correction:
      "Without a goal, prefer hebben: Ik heb drie uur gereden. With naar Haarlem, use zijn: Ik ben naar Haarlem gereden.",
    prerequisites: ["g-034"],
    relatedRules: ["g-038", "g-039"],
    tags: ["zijn", "beweging", "telisch", "a2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Choose the grammatical sentence.",
        options: [
          "De boter is op het aanrecht gesmolten.",
          "De boter heeft op het aanrecht gesmolten.",
          "De boter is de boter gesmolten.",
          "De boter hebben gesmolten."
        ],
        correct: 0,
        explanation: "Intransitive smelten of a substance is a state change → zijn."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Auxiliary for arrival:",
        blankWord: "is",
        sentenceWithBlank: "De laatste bus ___ net vertrokken.",
        hints: ["is", "heeft", "was"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Ik ben drie uur op de hometrainer gefietst.",
        correctedSentence: "Ik heb drie uur op de hometrainer gefietst.",
        explanation: "Stationary duration without a destination takes hebben."
      },
      {
        type: "typed_conjugation",
        infinitive: "sterven",
        subject: "hij (VTT)",
        targetTense: "present perfect",
        correctForm: "is gestorven",
        explanation: "Sterven is an inchoative state change with zijn."
      }
    ]
  },
  {
    id: "g-042",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "Irregular Hybrid Verbs",
    titleNl: "Onregelmatige Gemengde Werkwoorden",
    summary:
      "Hybrid (mixed) verbs take a strong vowel change in the simple past but a weak dental participle, so the three principal parts do not match one class.",
    rules: [
      "High-frequency set: vragen – vroeg – gevraagd; zeggen – zei – gezegd; brengen – bracht – gebracht; denken – dacht – gedacht; kopen – kocht – gekocht; zoeken – zocht – gezocht.",
      "Also: weten – wist – geweten (en-participle but irregular past); mogen – mocht – gemogen; kunnen – kon – gekund when used as a full verb.",
      "Never apply kofschip to the OVT of these verbs: *vraagde, *zegde (except regional), *koopte are nonstandard in the Netherlands classroom standard (vraagde occurs in Belgium).",
      "Participles end in -d/-t like weak verbs: gebracht, gedacht, gekocht — not *gebringen or *gekochten.",
      "Inseparable hybrids still skip extra ge-: verkopen – verkocht – verkocht; vertellen – vertelde is actually weak. Focus: vergeten is strong (vergat – vergeten)."
    ],
    structuralBreakdown:
      "[OVT: ablaut/onregelmatige stam]  +  [VTT-deelwoord: ge- + stam + d/t]",
    examples: [
      {
        nl: "Zij vroeg de weg, maar niemand had de kaart meegenomen.",
        en: "She asked the way, but nobody had brought the map along.",
        highlight: "vroeg, meegenomen"
      },
      {
        nl: "Ik dacht dat hij de tickets al gekocht had, tot hij het tegenovergestelde zei.",
        en: "I thought he had already bought the tickets, until he said the opposite.",
        highlight: "dacht, gekocht, zei"
      }
    ],
    commonMistake:
      "Writing *ik vraagde / *ik heb gevragen by forcing one class onto the whole paradigm.",
    correction:
      "Keep the split: vroeg in the OVT, gevraagd in the perfect.",
    prerequisites: ["g-032", "g-035"],
    relatedRules: ["g-033", "g-036"],
    tags: ["hybride", "onregelmatig", "vraagt-vroeg-gevraagd", "a2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Principal parts of 'kopen'?",
        options: [
          "koopte – gekoopt",
          "kocht – gekocht",
          "kocht – gekopen",
          "koop – gekopen"
        ],
        correct: 1,
        explanation: "Hybrid: kocht / gekocht."
      },
      {
        type: "typed_conjugation",
        infinitive: "brengen",
        subject: "zij",
        targetTense: "simple past (OVT)",
        correctForm: "bracht",
        explanation: "Irregular past bracht, not brengde."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Hybrid participle of 'zoeken':",
        blankWord: "gezocht",
        sentenceWithBlank: "De redactie heeft uren naar het citaat ___.",
        hints: ["gezocht", "gezoeken", "zochte"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Hij heeft de docent gisteren vraagde of de deadline verschuift.",
        correctedSentence: "Hij heeft de docent gisteren gevraagd of de deadline verschuift.",
        explanation: "Perfect needs gevraagd; vroeg would be simple past without hebben."
      }
    ]
  },
  {
    id: "g-043",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "Distinguishing 'Zullen' vs 'Gaan' in Future Contexts",
    titleNl: "Zullen of Gaan voor de Toekomst",
    summary:
      "Dutch often leaves future time to the present plus an adverb; zullen adds prediction or commitment, while gaan marks an already decided or imminent plan.",
    rules: [
      "Present + time adverb is the default future: Morgen werk ik thuis. No auxiliary is required.",
      "gaan + infinitive = intention or scheduled movement toward an action: Ik ga volgende week verhuizen. It is not a pure tense marker.",
      "zullen + infinitive = prediction, promise, or formal future: Het zal vanavond waaien. We zullen u op de hoogte houden.",
      "Avoid stacking both for one future (*Ik zal gaan verhuizen) unless gaan keeps its lexical ‘go’ meaning: Ik zal morgen naar Delft gaan.",
      "In questions, ga je…? asks about plans; zal ik…? offers to do something: Zal ik het licht aandoen?"
    ],
    structuralBreakdown:
      "[present + tijdsbepaling]  |  [gaan + infinitief] (plan)  |  [zullen + infinitief] (voorspelling/belofte)",
    examples: [
      {
        nl: "Morgen presenteert Aisha haar scriptie; daarna gaan we iets drinken.",
        en: "Tomorrow Aisha presents her thesis; afterwards we are going to have a drink.",
        highlight: "presenteert (present-future), gaan … drinken"
      },
      {
        nl: "Het zal vast sneeuwen in de Ardennen, maar ik ga toch vertrekken.",
        en: "It will surely snow in the Ardennes, but I am still going to leave.",
        highlight: "zal … sneeuwen, ga … vertrekken"
      }
    ],
    commonMistake:
      "Calquing English will with zullen in every diary plan (*Ik zal vanavond pizza eten) when gaan or a bare present is more natural.",
    correction:
      "For a personal arrangement: Ik ga vanavond pizza eten / Vanavond eet ik pizza. Reserve zullen for forecasts and promises.",
    prerequisites: ["g-033"],
    relatedRules: ["g-044"],
    tags: ["toekomst", "zullen", "gaan", "a2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which option best offers to open a window?",
        options: [
          "Ga ik het raam openen?",
          "Zal ik het raam openen?",
          "Ik zal gaan het raam openen.",
          "Open ik zal het raam?"
        ],
        correct: 1,
        explanation: "Zal ik…? is the standard offer."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Plan-marker before an infinitive:",
        blankWord: "ga",
        sentenceWithBlank: "Ik ___ volgende maand een cursus volgen.",
        hints: ["ga", "zal", "word"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Morgen zal ik gaan de was ophangen in de tuin.",
        correctedSentence: "Morgen ga ik de was in de tuin ophangen.",
        explanation: "One planner (gaan) plus V2; particle ophangen splits."
      },
      {
        type: "sentence_transformation",
        original: "Het regent vanavond (voorspelling).",
        instruction: "Herschrijf met zullen.",
        transformed: "Het zal vanavond regenen.",
        hints: ["zal + infinitief"]
      }
    ]
  },
  {
    id: "g-044",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "The Conditional with 'zou' and 'zouden'",
    titleNl: "De Conditionalis met zou en zouden",
    summary:
      "Zou (singular) and zouden (plural) plus an infinitive express hypothetical, polite, or reported-future meaning; the if-clause often uses a past form without would.",
    rules: [
      "Main hypothetical: Als ik tijd had, zou ik langsfietsen. The als-clause takes a past (had, was, deed), not zou, in careful standard Dutch.",
      "Politeness: Zou u het raam even willen sluiten? Zou ik iets mogen vragen? Here zou softens a request.",
      "Future-in-the-past / reported intention: Ze zei dat ze later zou bellen.",
      "Plural agreement: wij/jullie/zij zouden blijven. There is no *zouen.",
      "Past counterfactual of a completed event uses zou hebben / zou zijn + participle: Als je had gebeld, zou ik thuis zijn gebleven."
    ],
    structuralBreakdown:
      "[als + OVT/VVT zonder zou] , [zou(den) + infinitief / hebben|zijn + deelwoord]",
    examples: [
      {
        nl: "Als de veerdienst uitviel, zouden we in Perkpolder blijven slapen.",
        en: "If the ferry service were cancelled, we would stay overnight in Perkpolder.",
        highlight: "Als … uitviel, zouden … blijven slapen"
      },
      {
        nl: "Zou jij de notulen willen nalopen voordat ik ze verstuur?",
        en: "Would you mind checking the minutes before I send them?",
        highlight: "Zou jij … willen nalopen"
      }
    ],
    commonMistake:
      "Putting zou inside the als-clause (*Als ik zou tijd hebben, zou ik komen).",
    correction:
      "Use a past in the condition: Als ik tijd had, zou ik komen.",
    prerequisites: ["g-033", "g-043"],
    relatedRules: ["g-049", "g-055"],
    tags: ["conditionalis", "zou", "hypothetisch", "a2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which conditional pair is standard?",
        options: [
          "Als ik zou winnen, zou ik een fiets kopen.",
          "Als ik won, zou ik een fiets kopen.",
          "Als ik win zou, ik een fiets kopen.",
          "Als ik zou won, ik koop een fiets."
        ],
        correct: 1,
        explanation: "Als-clause uses past won; main clause heeft zou + infinitief."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Plural conditional auxiliary:",
        blankWord: "zouden",
        sentenceWithBlank: "Zij ___ eerder vertrekken als de mist optrekt.",
        hints: ["zouden", "zou", "zullen"]
      },
      {
        type: "word_order",
        translation: "Would you like to sit closer to the stove?",
        tokens: ["Zou", "je", "dichter", "bij", "de", "kachel", "willen", "zitten"],
        correctSentence: "Zou je dichter bij de kachel willen zitten"
      },
      {
        type: "error_correction",
        sentenceWithError: "Wij zou de tent meenemen als het weer omsloeg.",
        correctedSentence: "Wij zouden de tent meenemen als het weer omsloeg.",
        explanation: "Plural subject requires zouden."
      }
    ]
  },
  {
    id: "g-045",
    section: 3,
    sectionTitle: "A2 Verb Systems & Tenses",
    level: "A2",
    title: "Invariable and Material Adjectives Ending in '-en'",
    titleNl: "Onveranderlijke en Stofelijke Adjectieven op -en",
    summary:
      "Adjectives that already end in -en — including material adjectives (gouden, houten, zilveren) — do not add a further -e in attributive position.",
    rules: [
      "Material adjectives formed with -en stay invariable: een gouden ring, de gouden ringen, het houten bankje, die stenen muur.",
      "Other fixed -en adjectives behave the same: een open deur (open is exception by vowel), more relevant: een eigen huis, het tevreden kind — tevreden and eigen take no extra -e.",
      "Do not write *goudene, *houtene, *zilverene. The -en already occupies the inflectional slot historically.",
      "Predicative use is identical in form: De ring is gouden is possible but rarer; speakers often recast as De ring is van goud. Either way, no extra -e.",
      "Contrast with ordinary adjectives: een mooie ring, het mooie huis. Only the -en class (and a few others like plastic, lila) skip agreement."
    ],
    structuralBreakdown:
      "[lidwoord] + [adjectief-op-en (geen extra -e)] + [substantief]",
    examples: [
      {
        nl: "Op de houten tafel lag een zilveren lepel naast het linnen servet.",
        en: "On the wooden table lay a silver spoon beside the linen napkin.",
        highlight: "houten, zilveren, linnen"
      },
      {
        nl: "Haar eigen fiets heeft een leren zadel, geen plastic exemplaar.",
        en: "Her own bicycle has a leather saddle, not a plastic one.",
        highlight: "eigen, leren"
      }
    ],
    commonMistake:
      "Adding adjective -e after a material -en: *de houtene stoel, *een gouden e ring.",
    correction:
      "Leave material -en untouched: de houten stoel, een gouden ring.",
    prerequisites: ["g-040"],
    relatedRules: ["g-004"],
    tags: ["adjectief", "stoffen", "onveranderlijk", "a2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Correct phrase for ‘the wooden bridge’?",
        options: ["de houtene brug", "de houten brug", "het houten brug", "de hout brug"],
        correct: 1,
        explanation: "Brug is a de-word; houten stays without extra -e."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Material adjective ‘gold’:",
        blankWord: "gouden",
        sentenceWithBlank: "Oma bewaart een ___ ketting in het doosje.",
        hints: ["gouden", "goudene", "goud"]
      },
      {
        type: "error_correction",
        sentenceWithError: "De zilverene kandelaar stond in de vensterbank.",
        correctedSentence: "De zilveren kandelaar stond in de vensterbank.",
        explanation: "zilveren already ends in -en; drop the extra e."
      },
      {
        type: "word_order",
        translation: "a leather saddle on her own bicycle",
        tokens: ["een", "leren", "zadel", "op", "haar", "eigen", "fiets"],
        correctSentence: "een leren zadel op haar eigen fiets"
      }
    ]
  }
];
