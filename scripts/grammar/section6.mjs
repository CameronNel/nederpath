export const lessons = [
  {
    id: "g-076",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Verb Clusters: Red Order vs Green Order",
    titleNl: "Werkwoordclusters: rode en groene volgorde",
    summary: "In subordinate clauses Dutch allows both red order (finite verb first in the cluster: 1-2) and green order (finite verb last: 2-1). Neither order is the unique standard; region, register and cluster length favour one or the other.",
    rules: [
      "Red order (1-2): finite auxiliary/modal precedes the participle or infinitive: … dat hij het heeft gezien.",
      "Green order (2-1): the participle or infinitive precedes the finite verb: … dat hij het gezien heeft.",
      "Both are grammatical in Netherlandic and Belgian standard; green is more frequent in the south and in many spoken varieties, red is common in northern writing and with longer clusters.",
      "With three or more verbs, mixed orders occur (… dat hij het heeft laten maken). Do not label one extra order ‘wrong’ if it is an attested 1-2-3 or 3-2-1 variant.",
      "Never claim that only red or only green is correct in a finite subordinate cluster of two verbs."
    ],
    structuralBreakdown: "bijzin: [… ] + { Vfin + Vnonfin  (rood 1-2)  |  Vnonfin + Vfin  (groen 2-1) }",
    examples: [
      { nl: "Ik weet dat de schipper de sluis heeft gepasseerd.", en: "I know that the skipper has passed the lock.", highlight: "heeft gepasseerd (red 1-2)" },
      { nl: "Ik weet dat de schipper de sluis gepasseerd heeft.", en: "I know that the skipper has passed the lock.", highlight: "gepasseerd heeft (green 2-1)" }
    ],
    commonMistake: "Correcting a well-formed green cluster to red (or vice versa) as if one national order were obligatory.",
    correction: "Accept both heeft gepasseerd and gepasseerd heeft in a two-verb subordinate cluster; teach register and regional preference, not a single ban.",
    prerequisites: ["g-069", "g-070"],
    relatedRules: ["g-077", "g-063"],
    tags: ["verb-cluster", "red-order", "green-order", "subordinate", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which statement about … dat hij het gezien heeft / heeft gezien is accurate?",
        options: [
          "Only red order is standard.",
          "Only green order is standard.",
          "Both red (heeft gezien) and green (gezien heeft) occur in standard Dutch.",
          "Both are ungrammatical; the finite verb must be second."
        ],
        correct: 2,
        explanation: "Two-verb clusters allow 1-2 and 2-1."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Complete a grammatical red-order cluster.",
        blankWord: "heeft",
        sentenceWithBlank: "… omdat de veerboot de oversteek al ___ gemaakt.",
        hints: ["heeft", "is", "zal"]
      },
      {
        type: "sentence_transformation",
        prompt: "Rewrite the red cluster as green order without changing meaning.",
        sourceSentence: "… dat zij het rapport heeft gelezen.",
        targetSentence: "… dat zij het rapport gelezen heeft.",
        explanation: "Participle before finite auxiliary is green 2-1."
      },
      {
        type: "error_correction",
        sentenceWithError: "In een bijzin mag je alleen schrijven: dat hij het heeft gezien — gezien heeft is fout.",
        correctedSentence: "In een bijzin mag je zowel dat hij het heeft gezien als dat hij het gezien heeft schrijven.",
        explanation: "The original claim falsely bans green order."
      }
    ]
  },
  {
    id: "g-077",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Extraposition and the 'tangconstructie'",
    titleNl: "Extrapositie en de tangconstructie",
    summary: "Dutch often opens a ‘pincer’: material after V2 waits for a clause-final verb. Heavy clauses and PPs can be extraposed past that final verb, loosening the pincer.",
    rules: [
      "Basic pincer: finite V2 … final participle/particle: De inspectie heeft gisteren de hele kade gecontroleerd.",
      "Extraposition of a heavy dat/om-te clause is preferred: Het is duidelijk geworden dat de dijk verhoogd moet worden — not a huge middle field.",
      "PPs and comparatives can also step rightward: Hij heeft gesproken met de havenmeester (instead of met de havenmeester gesproken).",
      "Light objects usually stay inside the pincer; extraposing a weak pronoun is marked (*Heeft gezien hem).",
      "Extraposition is a packaging choice, not a repair of a ‘wrong’ inner order."
    ],
    structuralBreakdown: "[V2] + [lichte middenstukken] + [Vfinal] + [zware extrapositie: dat-zin / om-te / PP]",
    examples: [
      { nl: "Het is de commissie gisteren pas duidelijk geworden dat de sluis te smal is.", en: "It only became clear to the committee yesterday that the lock is too narrow.", highlight: "geworden dat …" },
      { nl: "We hebben lang gewacht op een schriftelijke bevestiging van Rijkswaterstaat.", en: "We waited a long time for written confirmation from Rijkswaterstaat.", highlight: "gewacht op …" }
    ],
    commonMistake: "Cramming a whole dat-clause into the middle field: *Het is dat de sluis te smal is gisteren duidelijk geworden.",
    correction: "Leave the finite/participle pincer relatively light and extrapose the heavy clause: Het is gisteren duidelijk geworden dat de sluis te smal is.",
    prerequisites: ["g-027", "g-069"],
    relatedRules: ["g-078", "g-076"],
    tags: ["extraposition", "tangconstructie", "word-order", "b2"],
    exercises: [
      {
        type: "word_order",
        translation: "It has become clear that the lock is too narrow.",
        tokens: ["Het", "is", "duidelijk", "geworden", "dat", "de", "sluis", "te", "smal", "is"],
        correctSentence: "Het is duidelijk geworden dat de sluis te smal is"
      },
      {
        type: "multiple_choice",
        question: "Which version best extraposes the heavy PP?",
        options: [
          "We hebben op een schriftelijke bevestiging van Rijkswaterstaat lang gewacht.",
          "We hebben lang gewacht op een schriftelijke bevestiging van Rijkswaterstaat.",
          "We op een schriftelijke bevestiging hebben lang gewacht.",
          "We hebben lang op gewacht een schriftelijke bevestiging."
        ],
        correct: 1,
        explanation: "Heavy PP after the participle is the typical extraposition."
      },
      {
        type: "error_correction",
        sentenceWithError: "Hij heeft hem gezien buiten — bedoeld als: Heeft gezien hem buiten.",
        correctedSentence: "Hij heeft hem buiten gezien.",
        explanation: "Weak pronouns stay inside the pincer; do not extrapose hem."
      },
      {
        type: "sentence_transformation",
        prompt: "Extrapose the dat-clause from the middle field.",
        sourceSentence: "Het is dat de veerdienst uitvalt al bekend.",
        targetSentence: "Het is al bekend dat de veerdienst uitvalt.",
        explanation: "Light predicate al bekend; heavy clause after it."
      }
    ]
  },
  {
    id: "g-078",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Raised and Discontinuous Constituents",
    titleNl: "Geraakte en onderbroken constituentie",
    summary: "Parts of one constituent can be separated: an R-pronoun or quantifier raises leftward while its preposition or NP remnant stays lower. The pieces still form one unit of meaning.",
    rules: [
      "R-pronoun split: Daar heb ik niet aan gedacht — daar … aan is one PP.",
      "Wat voor-split: Wat heb je voor boeken meegenomen?",
      "Quantifier float: De passagiers zijn allemaal van boord — allemaal belongs with de passagiers.",
      "Partial topic: Die brief heb ik nog niet gelezen van de notaris (marked; keep the remnant recoverable).",
      "Do not treat the leftover P or NP as an independent extra preposition; it is the stranded half of the raised phrase."
    ],
    structuralBreakdown: "[gedeelte↑] + [Vfin] + [midden] + [restant van dezelfde XP]",
    examples: [
      { nl: "Daar heeft de loods gisteren nog voor gewaarschuwd.", en: "The pilot warned about that only yesterday.", highlight: "Daar … voor" },
      { nl: "Wat hebben ze voor extra trossen klaarliggen?", en: "What extra lines do they have ready?", highlight: "Wat … voor extra trossen" }
    ],
    commonMistake: "Completing the raised R-pronoun with a full NP object as well: *Daar heeft hij voor de storm gewaarschuwd meaning ‘warned about that’.",
    correction: "If daar stands for the complement, leave only the stranded preposition: Daar heeft hij voor gewaarschuwd. Keep the NP only if daar is locative.",
    prerequisites: ["g-065", "g-077"],
    relatedRules: ["g-064", "g-077"],
    tags: ["discontinuity", "r-pronoun", "quantifier-float", "b2"],
    exercises: [
      {
        type: "word_order",
        translation: "I had not thought of that.",
        tokens: ["Daar", "had", "ik", "niet", "aan", "gedacht"],
        correctSentence: "Daar had ik niet aan gedacht"
      },
      {
        type: "multiple_choice",
        question: "Identify the split wat voor-question.",
        options: [
          "Voor wat boeken heb je meegenomen?",
          "Wat heb je voor boeken meegenomen?",
          "Wat voor heb je boeken meegenomen?",
          "Heb je meegenomen wat voor?"
        ],
        correct: 1,
        explanation: "Wat raises; voor boeken stays lower."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Float the quantifier after the verb.",
        blankWord: "allemaal",
        sentenceWithBlank: "De opstappers zijn ___ op tijd geweest.",
        hints: ["allemaal", "allen de", "elk"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Daar heeft de loods voor de mist gewaarschuwd. (daar = de mist)",
        correctedSentence: "Daar heeft de loods voor gewaarschuwd.",
        explanation: "daar already is the complement of voor; do not repeat de mist."
      }
    ]
  },
  {
    id: "g-079",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Modal Particles: 'nou', 'toch', 'even', 'maar', 'hoor', 'wel'",
    titleNl: "Modale partikels: nou, toch, even, maar, hoor, wel",
    summary: "These particles leave truth-conditions almost untouched and change illocution: impatience, reassurance, minimization, concession, or friendly insistence.",
    rules: [
      "nou in questions or commands adds impatience or a prompt to act: Kom nou! / Wat is dat nou?",
      "toch seeks confirmation or marks that something holds against expectation: Dat is toch de loods?",
      "even minimizes the imposition of a request: Mag ik even langs?",
      "maar in imperatives softens or gives permission: Loop maar door.",
      "hoor after a clause reassures or mildly contradicts: Dat komt goed, hoor.",
      "wel affirms against a negative expectation: Ik snap het wel. Contrast with truth-conditional wel/niet polarity, which is stronger."
    ],
    structuralBreakdown: "[kernpropositie onveranderd] + [partikel → illocutie: aansporing / bevestiging / verlichting / geruststelling]",
    examples: [
      { nl: "Schuif die fender maar een stukje op; dat holt zo wel bij.", en: "Just slide that fender along a bit; it will come alongside all right.", highlight: "maar / wel" },
      { nl: "Je hebt de marifoon toch aanstaan, hoor?", en: "You do have the VHF on, right?", highlight: "toch / hoor" }
    ],
    commonMistake: "Translating every particle as a content adverb (now / but / well) and stacking them as if they added extra facts.",
    correction: "Keep one or two particles and treat them as speech-act colour. Kom nou even is a prompt, not a claim that the coming happens ‘now for a short time’ as two extra propositions.",
    prerequisites: ["g-072"],
    relatedRules: ["g-080", "g-081"],
    tags: ["particles", "illocution", "nou", "toch", "hoor", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "What does ‘Loop maar door’ mainly add, compared with ‘Loop door’?",
        options: [
          "A new fact: there is an obstacle called maar",
          "Permission or softening of the imperative",
          "Past tense",
          "Negation of the walking"
        ],
        correct: 1,
        explanation: "Imperative maar changes illocution toward permission/softening."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Add the particle that minimizes a request.",
        blankWord: "even",
        sentenceWithBlank: "Kunt u ___ de sluisdeur op een kier zetten?",
        hints: ["even", "nooit", "reeds"]
      },
      {
        type: "sentence_transformation",
        prompt: "Add hoor so the clause reassures rather than merely asserts.",
        sourceSentence: "Dat redden we.",
        targetSentence: "Dat redden we hoor.",
        explanation: "Clause-final hoor is a reassuring stance marker."
      },
      {
        type: "error_correction",
        sentenceWithError: "Kom nou even maar toch hoor wel hier. (intended: a simple prompt to come)",
        correctedSentence: "Kom nou even hier.",
        explanation: "Particle stacks beyond two usually muddy illocution; a short prompt is enough."
      }
    ]
  },
  {
    id: "g-080",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Interactional Particles and Softeners: 'eigenlijk', 'gewoon', 'best'",
    titleNl: "Interactionele partikels: eigenlijk, gewoon, best",
    summary: "Eigenlijk, gewoon and best adjust stance toward the addressee: correction of an assumption, downplaying, or cautious positive evaluation — again without flipping the core proposition.",
    rules: [
      "eigenlijk signals that the coming statement revises an assumption: Ik blijf eigenlijk liever aan wal.",
      "gewoon downplays effort or presents something as the obvious option: Doe maar gewoon de motor uit.",
      "best hedges a positive evaluation: Dat is best lastig / best aardig — stronger than a little, weaker than very, and often slightly concessive.",
      "These are not interchangeable with English actually / just / best in every slot; gewoon is not always ‘usually’.",
      "In answers, eigenlijk often prefaces a dispreferred reply: Eigenlijk niet."
    ],
    structuralBreakdown: "[eigenlijk → assumptie-correctie]  |  [gewoon → trivialisering]  |  [best → voorzichtige evaluatie]",
    examples: [
      { nl: "We kunnen eigenlijk beter morgen vertrekken; vanavond is het tij gewoon ongunstig.", en: "We’d actually do better to leave tomorrow; this evening the tide is simply unfavourable.", highlight: "eigenlijk / gewoon" },
      { nl: "De oversteek is best doenlijk als de mist optrekt.", en: "The crossing is reasonably feasible once the fog lifts.", highlight: "best doenlijk" }
    ],
    commonMistake: "Reading gewoon as altijd/meestal: *Hij is gewoon thuis understood only as ‘he is usually at home’ when the speaker means ‘just stay home / it’s simply that he’s home’.",
    correction: "Check whether gewoon trivializes or marks obviousness. For habit, prefer meestal or altijd.",
    prerequisites: ["g-079"],
    relatedRules: ["g-079", "g-082"],
    tags: ["particles", "eigenlijk", "gewoon", "best", "stance", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "In ‘Eigenlijk niet’ as an answer, what is the main job of eigenlijk?",
        options: [
          "To negate more strongly than niet alone",
          "To mark a dispreferred or assumption-correcting answer",
          "To place the event in the past",
          "To form a comparative"
        ],
        correct: 1,
        explanation: "eigenlijk flags that the answer revises what the asker hoped or assumed."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Hedge the positive evaluation.",
        blankWord: "best",
        sentenceWithBlank: "Die aanlegsteiger is ___ stevig, ook bij deining.",
        hints: ["best", "nooit", "louter"]
      },
      {
        type: "sentence_transformation",
        prompt: "Downplay the instruction with gewoon (obvious, no fuss).",
        sourceSentence: "Zet de motor uit.",
        targetSentence: "Zet de motor gewoon uit.",
        explanation: "gewoon presents the action as the straightforward thing to do."
      },
      {
        type: "error_correction",
        sentenceWithError: "Ik blijf meestal liever aan wal — speaker only wanted to correct the plan, not state a habit.",
        correctedSentence: "Ik blijf eigenlijk liever aan wal.",
        explanation: "Assumption-correction is eigenlijk, not the habit adverb meestal."
      }
    ]
  },
  {
    id: "g-081",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Formal vs Informal Address and Register Shifts ('je' / 'u')",
    titleNl: "Aanspreekvormen: je en u",
    summary: "Je/jij/jullie versus u is a register system: verb agreement, possessives and reflexives shift with the pronoun, and mixing them in one speech situation is socially noisy unless you are signalling a deliberate change.",
    rules: [
      "Informal singular: je/jij + verb without polite morphology: Heb je de vrachtbrief? Possessive je/jouw, reflexive je.",
      "Formal: u + hebt or heeft (both used; heeft is slightly more formal), possessive uw, reflexive zich (u vergist zich).",
      "Plural informal is jullie (verb: hebben/zijn plural). There is no everyday polite plural other than u (sometimes used to a group).",
      " inversion: hebt u / heeft u keep -t; heb je drops -t.",
      "Written notices to the public often choose u; internal crew talk uses je. Switching mid-email from u to je needs a reason."
    ],
    structuralBreakdown: "[je/jij + heb/ben + je/jouw]   vs   [u + hebt/heeft/bent + uw + zich]",
    examples: [
      { nl: "Hebt u uw identiteitsbewijs bij u? Dan kunt u aan boord.", en: "Do you have your ID with you? Then you may board.", highlight: "Hebt u / uw / u" },
      { nl: "Heb je je papieren bij je? Dan kun je aan boord.", en: "Have you got your papers on you? Then you can board.", highlight: "Heb je / je / je" }
    ],
    commonMistake: "Mixing uw with je in one sentence: *Heb je uw papieren bij u?",
    correction: "Stay in one column: Heb je je papieren bij je? or Hebt u uw papieren bij u?",
    prerequisites: ["g-002"],
    relatedRules: ["g-079", "g-085"],
    tags: ["register", "u", "je", "politeness", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which set is internally consistent?",
        options: [
          "Heb je uw jas bij u?",
          "Hebt u uw jas bij u?",
          "Heeft je uw jas bij zich?",
          "Heb u je jas bij je?"
        ],
        correct: 1,
        explanation: "u + hebt + uw + u stay in the formal column."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Formal possessive.",
        blankWord: "uw",
        sentenceWithBlank: "Mag ik ___ kaartje even zien?",
        hints: ["uw", "je", "jullie"]
      },
      {
        type: "typed_conjugation",
        infinitive: "hebben",
        subject: "u (inversion)",
        targetTense: "present",
        correctForm: "heeft",
        explanation: "Both hebt u and heeft u occur; this item targets the more formal heeft u. Acceptable classroom key: heeft."
      },
      {
        type: "error_correction",
        sentenceWithError: "U vergist je in de dienstregeling.",
        correctedSentence: "U vergist zich in de dienstregeling.",
        explanation: "The formal reflexive is zich, not je."
      }
    ]
  },
  {
    id: "g-082",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Hedging and Epistemic Stance: 'zou kunnen', 'lijkt', 'schijnt'",
    titleNl: "Afzwakking en epistemische houding",
    summary: "Zou kunnen, lijken and schijnen grade the speaker’s commitment. They do not assert the embedded state as a known fact.",
    rules: [
      "zou kunnen marks possibility with extra caution: Het zou kunnen dat de veerdienst uitvalt.",
      "lijken presents an appearance based on available evidence: Het lijkt of de mist optrekt / De mist lijkt op te trekken.",
      "schijnen often reports hearsay or a general impression: Het schijnt dat de sluis vanavond dichtblijft.",
      "lijken aan + NP personalizes the impression: Het lijkt me verstandig te wachten.",
      "Do not stack all three hedges on one clause unless you truly want almost zero commitment."
    ],
    structuralBreakdown: "[zou kunnen + dat / infinitief]  |  [lijkt (of) / lijkt te]  |  [schijnt dat / schijnt te]",
    examples: [
      { nl: "Het zou kunnen dat we de laatste opening missen.", en: "It could be that we miss the last opening.", highlight: "zou kunnen dat" },
      { nl: "Het schijnt dat de lodsen staking houden; het lijkt me beter een uur te schuiven.", en: "Apparently the pilots are on strike; it seems wiser to me to shift by an hour.", highlight: "schijnt dat / lijkt me" }
    ],
    commonMistake: "Using schijnt as a visual verb like kijken: *Ik schijn naar de radar (‘I look at the radar’).",
    correction: "schijnen is epistemic/hearsay (or ‘to shine’). For looking, use kijken naar. For appearance of a situation, lijken is often the better hedge.",
    prerequisites: ["g-071"],
    relatedRules: ["g-071", "g-083"],
    tags: ["hedging", "epistemic", "lijken", "schijnen", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which form best reports hearsay rather than the speaker’s own visual impression?",
        options: [
          "Ik zie dat de sluis dichtblijft.",
          "Het schijnt dat de sluis dichtblijft.",
          "De sluis is dicht.",
          "Kijk de sluis dichtblijft."
        ],
        correct: 1,
        explanation: "schijnt dat is the hearsay/impression report."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Personal hedge with lijken.",
        blankWord: "lijkt",
        sentenceWithBlank: "Het ___ me verstandig de radar aan te laten.",
        hints: ["lijkt", "schijnt", "is"]
      },
      {
        type: "sentence_transformation",
        prompt: "Weaken the assertion to cautious possibility.",
        sourceSentence: "De veerdienst valt uit.",
        targetSentence: "Het zou kunnen dat de veerdienst uitvalt.",
        explanation: "zou kunnen dat lowers commitment."
      },
      {
        type: "error_correction",
        sentenceWithError: "Ik schijn naar de betonning.",
        correctedSentence: "Ik kijk naar de betonning.",
        explanation: "Visual attention is kijken naar, not schijnen."
      }
    ]
  },
  {
    id: "g-083",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Conditionals: Real, Hypothetical, and Counterfactual",
    titleNl: "Conditionelen: reëel, hypothetisch en contrafeitelijk",
    summary: "Dutch als-clauses distinguish open/real conditions (present + present/future), hypotheticals (past + zouden), and counterfactuals (pluperfect + zouden hebben / was … geweest).",
    rules: [
      "Real/open: Als het tij keert, varen we uit / zullen we uitvaren.",
      "Hypothetical (possible but remote): Als het tij keerde, zouden we uitvaren.",
      "Counterfactual past: Als het tij gekeerd was, zouden we zijn uitgevaren.",
      "The als-clause is verb-final; the main clause inverts if als-clause comes first: Als het waait, blijven we.",
      "tenzij, mits and wanneer overlap only partly; wanneer is often temporal rather than hypothetical."
    ],
    structuralBreakdown: "[Als + Vfinal] + [Vfin + …]   met tijd/modus: pres+pres | ovt+zouden | vvt+zouden+inf",
    examples: [
      { nl: "Als de mist optrekt, steken we nog voor donker over.", en: "If the fog lifts, we will cross before dark.", highlight: "Als … optrekt, steken we" },
      { nl: "Als de mist was opgetrokken, zouden we al aan de overkant zijn geweest.", en: "If the fog had lifted, we would already have been on the other side.", highlight: "was opgetrokken / zouden … zijn geweest" }
    ],
    commonMistake: "Using zullen in the main clause of a counterfactual: *Als hij was gewaarschuwd, zullen we zijn gestopt.",
    correction: "Counterfactuals take zouden + perfect infinitive: zouden we zijn gestopt.",
    prerequisites: ["g-071"],
    relatedRules: ["g-084", "g-071"],
    tags: ["conditionals", "als", "counterfactual", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which pair is a past counterfactual?",
        options: [
          "Als het waait, blijven we.",
          "Als het waaide, zouden we blijven.",
          "Als het gewaaid had, zouden we zijn gebleven.",
          "Wanneer het waait, blijven we altijd."
        ],
        correct: 2,
        explanation: "Pluperfect protasis plus zouden + perfect infinitive."
      },
      {
        type: "word_order",
        translation: "If the tide turns, we will sail out.",
        tokens: ["Als", "het", "tij", "keert", "varen", "we", "uit"],
        correctSentence: "Als het tij keert varen we uit"
      },
      {
        type: "fill_in_the_blank",
        prompt: "Hypothetical auxiliary in the main clause.",
        blankWord: "zouden",
        sentenceWithBlank: "Als we meer brandstof hadden, ___ we verder varen.",
        hints: ["zouden", "zullen", "zijn"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Als hij was gewaarschuwd, zullen we eerder zijn gestopt.",
        correctedSentence: "Als hij was gewaarschuwd, zouden we eerder zijn gestopt.",
        explanation: "Counterfactual apodosis uses zouden, not zullen."
      }
    ]
  },
  {
    id: "g-084",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Mixed Conditionals and Implied Protases",
    titleNl: "Gemengde conditionelen en stilzwijgende bijzinnen",
    summary: "The if-clause and the main clause can sit in different time worlds (present result of a past condition). Often the if-clause is dropped and only anders, anders … wel, or a past perfect fragment remains.",
    rules: [
      "Past cause + present result: Als we eerder waren vertrokken, stonden we nu niet in deze file / zouden we nu niet hier staan.",
      "Present (timeless) condition + past result is rarer and needs a standing circumstance: Als hij loods was, had hij dat sein herkend.",
      "Implied protasis: Anders waren we al binnen — the missing piece is ‘if things had gone otherwise’.",
      "dan can resume a fronted condition: Als het vriest, dan blijven de ponten aan de ketting.",
      "Do not force both clauses into the same tense if the meaning is mixed."
    ],
    structuralBreakdown: "[Als + verleden contrafeit] + [heden / zouden-heden]   |   [Anders + contrafeitelijke hoofdzin]",
    examples: [
      { nl: "Als we de opening niet hadden gemist, lagen we nu al in de kolk.", en: "If we had not missed the opening, we would already be lying in the chamber now.", highlight: "hadden gemist / lagen we nu" },
      { nl: "Anders had de loods allang aan dek gestaan.", en: "Otherwise the pilot would have been on deck long ago.", highlight: "Anders had … gestaan" }
    ],
    commonMistake: "Repeating the same perfect in both clauses when the result is clearly present: *Als we eerder waren vertrokken, zouden we zijn aangekomen nu still talking about a present location.",
    correction: "For a present result, use a present or zouden + present infinitive: stonden we nu / zouden we nu aankomen.",
    prerequisites: ["g-083"],
    relatedRules: ["g-083", "g-071"],
    tags: ["mixed-conditionals", "implied-protasis", "anders", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which sentence mixes a past condition with a present result?",
        options: [
          "Als het waait, blijven we.",
          "Als we eerder waren vertrokken, stonden we nu niet hier.",
          "Als het waaide, zouden we zijn gebleven (beide puur verleden).",
          "We blijven omdat het waait."
        ],
        correct: 1,
        explanation: "waren vertrokken (past) + stonden nu (present result)."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Implied protasis marker.",
        blankWord: "Anders",
        sentenceWithBlank: "___ lagen we allang in de haven.",
        hints: ["Anders", "Omdat", "Tijdens"]
      },
      {
        type: "sentence_transformation",
        prompt: "Turn the explicit als-clause into an anders-sentence.",
        sourceSentence: "Als het niet had gesneeuwd, waren we op tijd geweest.",
        targetSentence: "Anders waren we op tijd geweest.",
        explanation: "anders absorbs the negated condition."
      },
      {
        type: "error_correction",
        sentenceWithError: "Als hij loods is, had hij dat sein gisteren herkend — speaker means a standing identity, but used present factual is with a past counterfactual without marking remoteness.",
        correctedSentence: "Als hij loods was, had hij dat sein gisteren herkend.",
        explanation: "Standing but non-actual identity in a mixed conditional is typically past was."
      }
    ]
  },
  {
    id: "g-085",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Reported Speech: Indirect Commands and Requests",
    titleNl: "Indirecte bevelen en verzoeken",
    summary: "Commands and requests become infinitive complements or dat-clauses with a modal, not English-style ‘told that go’. Choice of zeggen/vragen/verzoeken/bevelen and of om te vs dat matters.",
    rules: [
      "Neutral report of a command: Hij zei dat ik moest wachten / Hij zei me te wachten.",
      "Requests: Ze vroeg of ik het luik wilde sluiten or Ze vroeg me het luik te sluiten.",
      "Formal verzoeken/bevelen often take om te: De havenmeester verzocht ons om de snelheid te minderen.",
      "Yes/no requests become of-clauses, not dat: *Hij vroeg dat ik kwam → Hij vroeg of ik kwam / wilde komen.",
      "Pronouns and time/place shift as in other reported speech (morgen → de volgende dag when the report is later)."
    ],
    structuralBreakdown: "[zeggen/vragen/verzoeken] + { dat + modal + Vfinal  |  (om) te + infinitief  |  of + Vfinal }",
    examples: [
      { nl: "De sluiswachter zei dat we de trossen vast moesten houden.", en: "The lock keeper said that we had to keep the lines fast.", highlight: "zei dat … moesten houden" },
      { nl: "Hij verzocht ons om de motoren stationair te laten draaien.", en: "He asked us to leave the engines idling.", highlight: "verzocht … om … te laten draaien" }
    ],
    commonMistake: "Using dat after vragen for a yes/no request: *Ze vroeg dat ik het luik sloot.",
    correction: "Use of for the embedded question, or a te-infinitive: Ze vroeg of ik het luik wilde sluiten / Ze vroeg me het luik te sluiten.",
    prerequisites: ["g-071", "g-081"],
    relatedRules: ["g-074", "g-071"],
    tags: ["reported-speech", "commands", "of", "om-te", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Choose the well-formed report of ‘Sluit het luik, alsjeblieft.’",
        options: [
          "Ze vroeg dat ik het luik sloot.",
          "Ze vroeg of ik het luik wilde sluiten.",
          "Ze vroeg sluit ik het luik.",
          "Ze zei of dat het luik sluiten."
        ],
        correct: 1,
        explanation: "A request becomes of + modal or a te-infinitive, not dat + bare past."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Complementizer for a yes/no request.",
        blankWord: "of",
        sentenceWithBlank: "Hij vroeg ___ we nog brandstof nodig hadden.",
        hints: ["of", "dat", "om"]
      },
      {
        type: "sentence_transformation",
        prompt: "Report the command with zeggen + dat + moeten.",
        sourceSentence: "Wacht bij de sluis.",
        targetSentence: "Hij zei dat ik bij de sluis moest wachten.",
        explanation: "Imperative becomes moest + infinitive in a verb-final dat-clause."
      },
      {
        type: "error_correction",
        sentenceWithError: "De havenmeester verzocht ons dat minderen de snelheid.",
        correctedSentence: "De havenmeester verzocht ons om de snelheid te minderen.",
        explanation: "verzoeken takes om te + infinitive, not a finite dat-clause with English word order."
      }
    ]
  },
  {
    id: "g-086",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Clefts and Pseudo-clefts: 'het is X die/dat'",
    titleNl: "Spleet- en schijnspleetzinnen",
    summary: "Clefts put focus after het is/was and resume with die, dat or die/dat + clause. Pseudo-clefts start with a free relative (wat/degene die) and identify it after zijn.",
    rules: [
      "Cleft: Het is de loods die de beslissing neemt — focus on de loods.",
      "Agreement of the relative: die with de-words and persons, dat with het-words: Het is het tij dat ons tegenhoudt.",
      "Pseudo-cleft: Wat ons tegenhoudt, is het tij / Degene die belt, is de sluiswachter.",
      "Do not add a second finite verb in the focus NP: *Het is de loods neemt de beslissing.",
      "Negated clefts are common: Het is niet de mist die ons hindert, maar de stroming."
    ],
    structuralBreakdown: "[Het is/was + focus-XP + die/dat + rest]   |   [Wat/degene die …] + [zijn] + [identificatie]",
    examples: [
      { nl: "Het is de stroming die de veerboot uit het vaarwater duwt, niet de wind.", en: "It is the current that pushes the ferry out of the fairway, not the wind.", highlight: "Het is de stroming die" },
      { nl: "Wat de planning ondermijnt, is de late opening van de brug.", en: "What undermines the schedule is the late opening of the bridge.", highlight: "Wat … is" }
    ],
    commonMistake: "Using dat after a common-gender focus: *Het is de loods dat de beslissing neemt.",
    correction: "Match the relative to the focused noun: de loods die; het tij dat.",
    prerequisites: ["g-036"],
    relatedRules: ["g-087"],
    tags: ["cleft", "pseudo-cleft", "focus", "die-dat", "b2"],
    exercises: [
      {
        type: "fill_in_the_blank",
        prompt: "Relative after focused de-word.",
        blankWord: "die",
        sentenceWithBlank: "Het is de sluiswachter ___ ons doorwuift.",
        hints: ["die", "dat", "wat"]
      },
      {
        type: "multiple_choice",
        question: "Which is a pseudo-cleft?",
        options: [
          "Het is de mist die ons hindert.",
          "Wat ons hindert, is de mist.",
          "De mist hindert ons het.",
          "Hindert de mist het is."
        ],
        correct: 1,
        explanation: "Free relative wat … plus identificational is."
      },
      {
        type: "sentence_transformation",
        prompt: "Cleft the subject for contrast with de wind.",
        sourceSentence: "De stroming duwt de boot weg, niet de wind.",
        targetSentence: "Het is de stroming die de boot wegduwt, niet de wind.",
        explanation: "het is + focus + die + remnant."
      },
      {
        type: "error_correction",
        sentenceWithError: "Het is het tij die ons tegenhoudt.",
        correctedSentence: "Het is het tij dat ons tegenhoudt.",
        explanation: "Neuter het tij takes dat."
      }
    ]
  },
  {
    id: "g-087",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Existential and Presentational 'er' in Formal Prose",
    titleNl: "Existential en presentatief 'er' in zakelijk Nederlands",
    summary: "Formal Dutch still uses er to introduce new, often indefinite referents (Er bestaat een regeling…), but overusing er next to locative daar or after a definite unique subject sounds sloppy in prose.",
    rules: [
      "Presentational: Er geldt een verbod op nachtelijke passage — the ban is new information.",
      "Existential with indefinite NP: Er zijn uitzonderingen voor hulpdiensten.",
      "In formal style, a definite unique subject usually does not take presentational er: De minister heeft besloten, not ?Er heeft de minister besloten.",
      "Locative daar and dummy er can coexist carefully (Daar is er weinig ruimte), but one is often enough.",
      "Passive presentational: Er wordt extra gecontroleerd bij de sluis."
    ],
    structuralBreakdown: "[Er] + [Vfin] + [onbepaalde NP / passief]   —   vermijd er bij uniek bepaalde onderwerpen",
    examples: [
      { nl: "Er bestaat een tijdelijke ontheffing voor werkvaart tot zonsopgang.", en: "There exists a temporary exemption for work vessels until sunrise.", highlight: "Er bestaat een tijdelijke ontheffing" },
      { nl: "Er wordt van de schipper verwacht dat hij de meldplicht nakomt.", en: "The skipper is expected to comply with the reporting duty.", highlight: "Er wordt … verwacht dat" }
    ],
    commonMistake: "Opening every formal sentence with er even when the subject is already uniquely known: *Er heeft de inspectie het rapport vastgesteld.",
    correction: "Use a definite subject without er: De inspectie heeft het rapport vastgesteld. Keep er for new/indefinite or impersonal passives.",
    prerequisites: ["g-064"],
    relatedRules: ["g-061", "g-086"],
    tags: ["er", "existential", "presentational", "formal", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which opening fits formal prose with a unique definite subject?",
        options: [
          "Er heeft de inspectie het rapport vastgesteld.",
          "De inspectie heeft het rapport vastgesteld.",
          "Er het rapport heeft de inspectie vastgesteld.",
          "Heeft er de inspectie het rapport."
        ],
        correct: 1,
        explanation: "Unique definite subjects drop presentational er."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Impersonal passive presentational.",
        blankWord: "Er",
        sentenceWithBlank: "___ wordt extra gecontroleerd bij hoog water.",
        hints: ["Er", "Het", "Men er"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Er de minister heeft een verbod afgekondigd.",
        correctedSentence: "De minister heeft een verbod afgekondigd.",
        explanation: "Do not combine er with a fronted unique subject in this way."
      },
      {
        type: "sentence_transformation",
        prompt: "Make the indefinite introduction presentational.",
        sourceSentence: "Uitzonderingen voor hulpdiensten bestaan.",
        targetSentence: "Er bestaan uitzonderingen voor hulpdiensten.",
        explanation: "er + verb + indefinite NP is the existential frame."
      }
    ]
  },
  {
    id: "g-088",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Scope of Quantifiers and Negation",
    titleNl: "Bereik van kwantoren en ontkenning",
    summary: "Word order, stress and choice of geen vs niet alle decide whether negation sits inside or outside a quantifier. Alle … niet is often read as ‘not all’, while niemand/geen is a single negative quantifier.",
    rules: [
      "geen + noun is a negative determiner: Geen schip mocht passeren = zero ships.",
      "niet alle / niet iedereen is partial negation: Niet alle schepen mochten passeren.",
      "alle … niet is ambiguous or tends to ‘not all’ in careful prose; writers who mean ‘none’ should use geen or niemand.",
      "twee keer niet ≠ niet twee keer: frequency and negation invert.",
      "Place niet immediately before the phrase whose quantity you deny."
    ],
    structuralBreakdown: "[geen N] = 0   |   [niet alle N] = sommige niet   |   [alle N … niet] vaak ≠ 0",
    examples: [
      { nl: "Niet alle bruggen gaan open bij windkracht acht.", en: "Not all bridges open at wind force eight.", highlight: "Niet alle bruggen" },
      { nl: "Geen brug gaat open bij deze windwaarschuwing.", en: "No bridge opens under this wind warning.", highlight: "Geen brug" }
    ],
    commonMistake: "Writing Alle bruggen gaan niet open intending ‘none open’, which many readers parse as ‘it is not the case that all open’.",
    correction: "For zero, use geen brug or geen enkele brug. For partial negation, use niet alle bruggen.",
    prerequisites: ["g-068"],
    relatedRules: ["g-068", "g-064"],
    tags: ["scope", "negation", "quantifiers", "geen", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which sentence unambiguously means ‘zero ships may pass’?",
        options: [
          "Alle schepen mogen niet passeren.",
          "Geen schip mag passeren.",
          "Niet alle schepen mogen passeren.",
          "Schepen mogen alle niet."
        ],
        correct: 1,
        explanation: "geen schip is the clear zero-quantifier."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Partial negation.",
        blankWord: "alle",
        sentenceWithBlank: "Niet ___ openingen zijn geschikt voor hoge schepen.",
        hints: ["alle", "geen", "elk geen"]
      },
      {
        type: "sentence_transformation",
        prompt: "Turn ambiguous alle … niet into a clear zero statement.",
        sourceSentence: "Alle seinen werkten niet.",
        targetSentence: "Geen enkel sein werkte.",
        explanation: "geen enkel forces the zero reading."
      },
      {
        type: "error_correction",
        sentenceWithError: "Ik heb de radar niet twee keer uitgezet — intended: I did not turn it off; I only used it twice? Speaker meant ‘I turned it off not twice but never’.",
        correctedSentence: "Ik heb de radar geen twee keer uitgezet; ik heb hem helemaal niet uitgezet.",
        explanation: "niet twee keer only denies the count two; use helemaal niet for zero events."
      }
    ]
  },
  {
    id: "g-089",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Comparative Clauses: 'dan' vs 'als' after comparatives",
    titleNl: "Vergelijkingen: 'dan' of 'als' na een comparatief",
    summary: "The standard complementizer after a comparative (groter, meer, eerder) is dan. Als after a comparative is common in speech but remains non-standard in writing. Equatives use zo/even … als.",
    rules: [
      "Comparative + dan: groter dan de vorige sluis, eerder dan verwacht, meer dan tien schepen.",
      "Equative: zo breed als / even breed als de Nieuwe Maas — here als is required.",
      "Spoken groter als is widespread but marked as non-standard after comparatives; do not teach it as the written norm.",
      "anders dan, niemand anders dan keep dan.",
      "Do not use dan after zo/even: *even groot dan is the complementary error."
    ],
    structuralBreakdown: "[comparatief] + [dan + XP]   vs   [zo/even + positief] + [als + XP]",
    examples: [
      { nl: "Deze kolk is langer dan de oude sluis bij Vreeswijk.", en: "This chamber is longer than the old lock at Vreeswijk.", highlight: "langer dan" },
      { nl: "De nieuwe brug is even hoog als de spoorbrug verderop.", en: "The new bridge is as high as the railway bridge further on.", highlight: "even hoog als" }
    ],
    commonMistake: "Writing groter als in a formal text, or even groot dan in an equative.",
    correction: "After -er/meer/minder/eerder use dan. After zo/even use als.",
    prerequisites: ["g-017"],
    relatedRules: ["g-090"],
    tags: ["comparative", "dan", "als", "standard", "b2"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Standard written Dutch after groter:",
        options: ["groter als de oude sluis", "groter dan de oude sluis", "groter of de oude sluis", "groter even de oude sluis"],
        correct: 1,
        explanation: "Comparatives take dan in the standard language."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Equative linker.",
        blankWord: "als",
        sentenceWithBlank: "De pont is even breed ___ de overliggende steiger.",
        hints: ["als", "dan", "toen"]
      },
      {
        type: "error_correction",
        sentenceWithError: "We vertrekken eerder als gepland.",
        correctedSentence: "We vertrekken eerder dan gepland.",
        explanation: "eerder is comparative, so dan is standard."
      },
      {
        type: "sentence_transformation",
        prompt: "Turn the equative into a comparative with dan.",
        sourceSentence: "De nieuwe sluis is even lang als de oude.",
        targetSentence: "De nieuwe sluis is langer dan de oude.",
        explanation: "Comparative morphology + dan."
      }
    ]
  },
  {
    id: "g-090",
    section: 6,
    sectionTitle: "B1–B2 Complex Syntax & Modality",
    level: "B2",
    title: "Correlative Comparatives: 'hoe ... hoe / des te'",
    titleNl: "Evenredige comparatieven: hoe … hoe / des te",
    summary: "Two comparatives can rise together: hoe langer hoe beter, or hoe langer, des te beter. The first hoe-clause is verb-final; des te introduces the main clause with inversion.",
    rules: [
      "Paired hoe: Hoe harder het waait, hoe voorzichtiger we manoeuvreren (both parts often verb-final or reduced).",
      "hoe … des te: Hoe later de opening, des te langer wordt de file — des te-clause is a main clause (V2).",
      "Bare formula: hoe eerder hoe liever / des te beter without a full verb.",
      "Do not mix *als … des te or *dan … hoe for this correlative meaning.",
      "des te alone can answer a reason: Daarom varen we des te voorzichtiger."
    ],
    structuralBreakdown: "[hoe + comparatief + (Vfinal)] + [hoe + comparatief]   |   [hoe …] + [des te + comparatief + V2]",
    examples: [
      { nl: "Hoe dichter de mist, hoe langzamer de loods de bocht aansnijdt.", en: "The thicker the fog, the more slowly the pilot cuts the bend.", highlight: "Hoe dichter … hoe langzamer" },
      { nl: "Hoe langer we wachten, des te kleiner wordt de kans op een extra schutting.", en: "The longer we wait, the smaller the chance of an extra locking becomes.", highlight: "Hoe langer … des te kleiner wordt" }
    ],
    commonMistake: "Putting V2 in the first hoe-clause: *Hoe langer wachten we, des te beter.",
    correction: "The hoe-clause is subordinate (verb-final): Hoe langer we wachten, des te beter.",
    prerequisites: ["g-089"],
    relatedRules: ["g-089", "g-027"],
    tags: ["correlative", "hoe-hoe", "des-te", "comparative", "b2"],
    exercises: [
      {
        type: "word_order",
        translation: "The longer we wait, the smaller the chance becomes.",
        tokens: ["Hoe", "langer", "we", "wachten", "des", "te", "kleiner", "wordt", "de", "kans"],
        correctSentence: "Hoe langer we wachten des te kleiner wordt de kans"
      },
      {
        type: "multiple_choice",
        question: "Which correlative is well-formed?",
        options: [
          "Als later de opening, des te langer de file.",
          "Hoe later de opening, des te langer wordt de file.",
          "Dan later de opening hoe de file langer.",
          "Hoe later wordt de opening, hoe de file."
        ],
        correct: 1,
        explanation: "hoe + comparative in a non-V2 opener; des te + V2."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Second half of the compact formula.",
        blankWord: "beter",
        sentenceWithBlank: "hoe eerder hoe ___",
        hints: ["beter", "als", "dan"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Hoe langer wachten we, des te beter.",
        correctedSentence: "Hoe langer we wachten, des te beter.",
        explanation: "hoe-clause is verb-final: we wachten, not wachten we."
      }
    ]
  }
];
