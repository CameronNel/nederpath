export const lessons = [
  {
    id: "g-061",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "Passive Voice with 'worden' (dynamic passive)",
    titleNl: "Lijdende vorm met 'worden'",
    summary: "The worden-passive presents an event in progress or a process: the patient is subject and the agent is optional in a door-phrase. It is not a result-state description.",
    rules: [
      "Form: subject (patient) + conjugated worden + past participle at the clause end: De brief wordt geschreven.",
      "Present, past and future all keep worden as the passive auxiliary: wordt / werd / zal worden + participle.",
      "The agent, if mentioned, appears as door + NP. Leaving it out is normal when the agent is unknown or irrelevant.",
      "Separable verbs keep the participle together (opgehaald, aangekondigd); worden stays in the finite slot.",
      "Do not use zijn here if you mean the event itself rather than the leftover state."
    ],
    structuralBreakdown: "[Patiënt-onderwerp] + [worden-finiet] + (door Agent) + [voltooid deelwoord]",
    examples: [
      { nl: "Het dak wordt morgen door de aannemer vervangen.", en: "The roof is being replaced by the contractor tomorrow.", highlight: "wordt … vervangen" },
      { nl: "Tijdens de staking werden geen treinen meer ingezet.", en: "During the strike no more trains were put into service.", highlight: "werden … ingezet" }
    ],
    commonMistake: "Using zijn + participle when you still mean an ongoing or scheduled event: *Het dak is morgen vervangen.",
    correction: "Keep worden for the event: Het dak wordt morgen vervangen. Save zijn for the resulting state after the event.",
    prerequisites: ["g-045", "g-048"],
    relatedRules: ["g-062", "g-063"],
    tags: ["passive", "worden", "b1", "voice"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which sentence describes the replacement as an event, not a leftover state?",
        options: [
          "Het dak is al vervangen.",
          "Het dak wordt deze week vervangen.",
          "Het dak was vervangen toen we aankwamen.",
          "Het vervangen dak lekt niet."
        ],
        correct: 1,
        explanation: "wordt … vervangen is the dynamic passive of an event still to happen this week."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Insert the correct present-passive form of worden.",
        blankWord: "wordt",
        sentenceWithBlank: "De nieuwe dienstregeling ___ vanavond bekendgemaakt.",
        hints: ["wordt", "is", "werd"]
      },
      {
        type: "error_correction",
        sentenceWithError: "De contracten zijn morgen door de notaris ondertekend.",
        correctedSentence: "De contracten worden morgen door de notaris ondertekend.",
        explanation: "A scheduled signing is an event, so the auxiliary is worden, not zijn."
      },
      {
        type: "sentence_transformation",
        prompt: "Turn the active sentence into a worden-passive. Keep the agent in a door-phrase.",
        sourceSentence: "De redactie publiceert het rapport volgende week.",
        targetSentence: "Het rapport wordt volgende week door de redactie gepubliceerd.",
        explanation: "Patient becomes subject; worden + gepubliceerd; agent in door de redactie."
      }
    ]
  },
  {
    id: "g-062",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "Passive Voice with 'zijn' (stative / result passive)",
    titleNl: "Lijdende vorm met 'zijn' (toestandspassief)",
    summary: "Zijn + past participle can name a result state after an event, but the same string is also the perfect of a worden-passive. Context, time adverbials and pairing with worden disambiguate.",
    rules: [
      "Result reading: De deur is gesloten describes the door’s current state, not the closing event.",
      "Perfect-of-passive reading: De deur is gisteren gesloten = ‘someone closed it yesterday’ (event completed).",
      "A time adverb that locates an event (gisteren, om drie uur) favours the event/perfect reading; a state adverb (al uren, nog steeds) favours the result.",
      "Pairing helps: De deur werd om drie uur gesloten, en nu is ze nog steeds gesloten.",
      "Not every zijn + participle is passive at all: Hij is vertrokken is a perfect of an unaccusative, not a passive."
    ],
    structuralBreakdown: "[Onderwerp] + [zijn] + [voltooid deelwoord]  →  {resultaatstoestand} OF {perfectum van worden-passief}",
    examples: [
      { nl: "Het raam is al de hele ochtend opengezet, dus het is koud.", en: "The window has been set open all morning, so it is cold.", highlight: "is … opengezet (state lasting all morning)" },
      { nl: "Het raam is vanochtend om acht uur opengezet.", en: "The window was opened at eight this morning.", highlight: "is … opengezet (event time)" }
    ],
    commonMistake: "Treating every zijn + participle as a result state and then adding door + agent as if it were an ongoing process.",
    correction: "If you need a clear event-plus-agent, prefer worden (or werd). Use zijn + participle for states, or for a completed event whose agent you can omit.",
    prerequisites: ["g-061"],
    relatedRules: ["g-063", "g-048"],
    tags: ["passive", "zijn", "result", "ambiguity", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "In ‘De winkel is al weken gesloten’, what does zijn + participle mainly express?",
        options: [
          "An event happening right now",
          "A lasting result state",
          "A future scheduled closing",
          "An active transitive event"
        ],
        correct: 1,
        explanation: "al weken points to a continuing state, not to the closing act."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Choose the auxiliary that presents a current result, not a process.",
        blankWord: "is",
        sentenceWithBlank: "Kijk maar: de slagboom ___ al omlaaggedraaid.",
        hints: ["is", "wordt", "werd"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Toen we aankwamen, werd de poort al uren open.",
        correctedSentence: "Toen we aankwamen, was de poort al uren open.",
        explanation: "al uren open is a state; Dutch uses zijn (was), not worden."
      },
      {
        type: "sentence_transformation",
        prompt: "Rewrite so the sentence reports a completed event yesterday (perfect-of-passive), not a present state.",
        sourceSentence: "De brug is nu dicht.",
        targetSentence: "De brug is gisteren gesloten.",
        explanation: "Event time gisteren plus gesloten yields the perfect-of-passive reading."
      }
    ]
  },
  {
    id: "g-063",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "Passive with Modal Verbs and Perfect Passives",
    titleNl: "Passief met modale werkwoorden en voltooide passieven",
    summary: "Modals combine with a worden-infinitive plus participle (moet worden goedgekeurd). Perfect passives use zijn + geworden + participle, often reduced to zijn + participle in speech.",
    rules: [
      "Modal + dynamic passive: modal finite + worden (infinitive) + participle: Dit plan kan nog worden aangepast.",
      "The cluster sits at the end of a subordinate clause: … dat dit plan nog kan worden aangepast / kan aangepast worden (both occur).",
      "Full perfect of a worden-passive: De wet is vorig jaar aangenomen geworden — formally complete, but spoken Dutch usually drops geworden: De wet is vorig jaar aangenomen.",
      "A modal in the perfect typically triggers IPP on the modal: heeft moeten worden herzien, not *heeft gemoeten worden herzien.",
      "Do not insert te before worden after a modal: *moet te worden gedaan is English interference."
    ],
    structuralBreakdown: "[Modal-finiet] + [worden-infinitief] + [vd]   |   [zijn] + [vd] + (geworden)",
    examples: [
      { nl: "De aanvraag moet vóór vrijdag worden ingediend.", en: "The application must be submitted before Friday.", highlight: "moet … worden ingediend" },
      { nl: "Het voorstel is in commissie al besproken (geworden).", en: "The proposal has already been discussed in committee.", highlight: "is … besproken (geworden)" }
    ],
    commonMistake: "Writing *moet te worden ingediend or *heeft gemoeten worden herzien.",
    correction: "After a modal use bare worden + participle. In the perfect of a modal + passive, keep the modal as infinitive (IPP): heeft moeten worden herzien.",
    prerequisites: ["g-061", "g-062"],
    relatedRules: ["g-069", "g-070"],
    tags: ["passive", "modals", "perfect", "ipp", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which cluster is grammatical after a modal?",
        options: [
          "moet te worden goedgekeurd",
          "moet worden goedgekeurd",
          "moet goedgekeurd te worden",
          "moet is goedgekeurd"
        ],
        correct: 1,
        explanation: "Modals take a bare infinitive worden, not te-infinitive."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Complete the modal passive.",
        blankWord: "worden",
        sentenceWithBlank: "Deze fout kan nog ___ hersteld.",
        hints: ["worden", "zijn", "te"]
      },
      {
        type: "error_correction",
        sentenceWithError: "De tekst heeft gemoeten worden herschreven.",
        correctedSentence: "De tekst heeft moeten worden herschreven.",
        explanation: "IPP: the modal appears as infinitive moeten, not as participle gemoeten."
      },
      {
        type: "typed_conjugation",
        infinitive: "worden",
        subject: "de wet (modal moeten, present)",
        targetTense: "modal passive infinitive",
        correctForm: "worden",
        explanation: "After moet the passive auxiliary stays infinitive: moet worden aangenomen."
      }
    ]
  },
  {
    id: "g-064",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "Pronominal/Adverbial 'er' Combined (locative + quantitative + prepositional)",
    titleNl: "Gecombineerd 'er': plaats, hoeveelheid en voorzetsel",
    summary: "A single Dutch clause can host more than one function of er, but only one phonological er usually surfaces; extra functions ride along or appear as er-preposition forms.",
    rules: [
      "Locative er stands for a previously mentioned place: We zijn er geweest.",
      "Quantitative er anticipates an indefinite amount: Er liggen er nog drie (often reduced to Er liggen nog drie).",
      "Prepositional er is the dummy object of a stranded preposition: Ik denk erover.",
      "When locative and quantitative compete, Dutch generally keeps one er and lets the other function stay implicit: In die doos zitten er nog vijf.",
      "Do not stack *er er er; combine with ervan / erin / ervanover or drop a recoverable function."
    ],
    structuralBreakdown: "[(er-expletief)] + Vfin + [er-locatief/kwantitatief] + [er+voorzetsel]  —  meestal één hoorbaar er",
    examples: [
      { nl: "In die lade liggen er nog vier; ik pak er twee uit.", en: "There are still four in that drawer; I’ll take two out of them.", highlight: "er nog vier / er twee uit" },
      { nl: "We hebben er gisteren over gesproken, maar we zijn er nog niet uit.", en: "We talked about it yesterday, but we still haven’t figured it out.", highlight: "er … over / er … uit" }
    ],
    commonMistake: "Writing two or three adjacent er’s (*Ik heb er er drie van) because English maps each function separately.",
    correction: "Keep one er and attach the preposition or numeral: Ik heb er drie van / Ik heb er drie.",
    prerequisites: ["g-034"],
    relatedRules: ["g-065", "g-087"],
    tags: ["er", "quantitative", "locative", "prepositional", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "How do you naturally say ‘I still have three of them’?",
        options: [
          "Ik heb er er drie van.",
          "Ik heb er nog drie van.",
          "Ik heb nog drie ervan er.",
          "Ik heb drie er van ze."
        ],
        correct: 1,
        explanation: "One er plus numeral plus van covers quantity and the partitive preposition."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Insert the single er that licenses the quantity.",
        blankWord: "er",
        sentenceWithBlank: "In de schuur staan ___ nog twee fietsen.",
        hints: ["er", "daar", "het"]
      },
      {
        type: "word_order",
        translation: "We talked about it there yesterday.",
        tokens: ["We", "hebben", "er", "gisteren", "over", "gesproken"],
        correctSentence: "We hebben er gisteren over gesproken"
      },
      {
        type: "error_correction",
        sentenceWithError: "Ik denk er er nog vaak aan.",
        correctedSentence: "Ik denk er nog vaak aan.",
        explanation: "Locative/prepositional functions share one er before aan."
      }
    ]
  },
  {
    id: "g-065",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "'Er' + Preposition: 'ervan', 'erover', 'ermee'",
    titleNl: "'Er' + voorzetsel: ervan, erover, ermee",
    summary: "When the complement of a preposition is inanimate or clausal, Dutch replaces NP + P with er + P, written together (ervan, erover, ermee) or split around adverbs (er vaak over).",
    rules: [
      "Inanimate or propositional complement: Ik heb een mening erover, not *over het (for ‘about that matter’).",
      "Persons usually keep the preposition + pronoun: over hem, met haar — not *erover / *ermee referring to people in careful usage.",
      "The complex may be written as one word (ervan) or split when material intervenes: er niets van, er lang over.",
      "R-pronouns include hier- and daar- variants for deictic force: hiervan, daarover, daarmee.",
      "After verbs like houden van, praten over, beginnen met, the er-form is obligatory if the object is not a full NP."
    ],
    structuralBreakdown: "[er / hier / daar] + (tussenmateriaal) + [voorzetsel]   ≈   [ervan / erover / ermee]",
    examples: [
      { nl: "Ik heb er lang over nagedacht, maar ik zie er het nut niet van in.", en: "I thought about it for a long time, but I don’t see the point of it.", highlight: "er … over / er … van" },
      { nl: "Kun je de sleutel meenemen? Ik krijg de deur er niet mee open.", en: "Can you bring the key? I can’t get the door open with it.", highlight: "er … mee" }
    ],
    commonMistake: "Using *van het / *over het for a previously mentioned inanimate thing: *Ik heb over het nagedacht.",
    correction: "Replace inanimate prepositional objects with er + P: Ik heb erover nagedacht / Ik heb er over nagedacht.",
    prerequisites: ["g-064"],
    relatedRules: ["g-064", "g-034"],
    tags: ["er", "r-pronoun", "preposition", "ervan", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Choose the natural continuation of ‘Dat rapport is lastig.’",
        options: [
          "Ik heb over het nagedacht.",
          "Ik heb erover nagedacht.",
          "Ik heb over hem nagedacht.",
          "Ik heb hetover nagedacht."
        ],
        correct: 1,
        explanation: "Inanimate ‘that report’ becomes erover, not over het."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Complete with the fused form meaning ‘of it’.",
        blankWord: "ervan",
        sentenceWithBlank: "Ze heeft drie hoofdstukken gelezen en de rest ___ overgeslagen.",
        hints: ["ervan", "vanhet", "daarvanhet"]
      },
      {
        type: "word_order",
        translation: "I cannot open the jar with it.",
        tokens: ["Ik", "krijg", "de", "pot", "er", "niet", "mee", "open"],
        correctSentence: "Ik krijg de pot er niet mee open"
      },
      {
        type: "sentence_transformation",
        prompt: "Replace the full prepositional phrase with an er-form.",
        sourceSentence: "We beginnen met het project volgende week.",
        targetSentence: "We beginnen er volgende week mee.",
        explanation: "met het project → er … mee, with the time adverb splitting the complex."
      }
    ]
  },
  {
    id: "g-066",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "The Partitive Genitive and 'iets moois / niets nieuws'",
    titleNl: "Partitieve genitief: iets moois, niets nieuws",
    summary: "After indefinite pronouns and quantity words (iets, niets, wat, veel, weinig, iets anders), a following adjective takes a fossil genitive -s: iets moois, niets nieuws.",
    rules: [
      "Trigger words include iets, niets, wat, veel, weinig, allerlei, een hoop, and iemand/niemand only when an adjective follows in the partitive pattern (iemand anders is a frozen exception without -s on anders).",
      "The adjective gets -s: iets bijzonders, niets ergs, weinig opwindends.",
      "If a noun follows, you leave the partitive and use a normal NP: iets moois vs een mooi ding.",
      "Adjectives that already end in -s stay unchanged: iets grijs, iets roze (or iets roos — usage varies; grijs is stable).",
      "Do not add -e here: *iets mooie is attributive inflection in the wrong construction."
    ],
    structuralBreakdown: "[iets/niets/wat/veel/weinig] + [adjectief-s]",
    examples: [
      { nl: "Zegt de keuring iets zorgwekkends, of is het niets ernstigs?", en: "Does the inspection show anything worrying, or is it nothing serious?", highlight: "iets zorgwekkends / niets ernstigs" },
      { nl: "Ik zoek nog wat leuks voor bij de koffie.", en: "I’m still looking for something nice to go with the coffee.", highlight: "wat leuks" }
    ],
    commonMistake: "Writing *iets mooie or *niets nieuw, copying English ‘something nice / nothing new’.",
    correction: "Use the -s partitive: iets moois, niets nieuws.",
    prerequisites: ["g-016"],
    relatedRules: ["g-067"],
    tags: ["partitive", "genitive", "adjective", "iets", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which form is correct after niets?",
        options: ["niets nieuw", "niets nieuwe", "niets nieuws", "niets een nieuw"],
        correct: 2,
        explanation: "The partitive adjective takes -s: niets nieuws."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Add the partitive adjective meaning ‘special’.",
        blankWord: "bijzonders",
        sentenceWithBlank: "Is er vanavond iets ___ op tv?",
        hints: ["bijzonders", "bijzondere", "bijzonder"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Ik heb vandaag niets interessants gehoord — wacht, ik bedoel: niets interessante.",
        correctedSentence: "Ik heb vandaag niets interessants gehoord.",
        explanation: "Keep -s; do not switch to attributive -e without a noun."
      },
      {
        type: "sentence_transformation",
        prompt: "Turn the full NP into a partitive pronoun + adjective.",
        sourceSentence: "Ze vertelde een grappig verhaal.",
        targetSentence: "Ze vertelde iets grappigs.",
        explanation: "een grappig verhaal compresses to iets grappigs."
      }
    ]
  },
  {
    id: "g-067",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "Nominalization of Verbs and Adjectives",
    titleNl: "Nominalisatie van werkwoorden en bijvoeglijke naamwoorden",
    summary: "Dutch freely turns verbs into het-infinitives and adjectives into abstract nouns (-heid, -te, -ing, -atie), which then take articles, modifiers and prepositional arguments instead of subjects and objects.",
    rules: [
      "Bare infinitive as noun: het wachten, dat eindeloze vergaderen — neuter, often with het.",
      "Suffix nouns: beslissen → de beslissing; sluiten → de sluiting; veilig → de veiligheid; hoog → de hoogte.",
      "Arguments become van- or over-phrases, not nominative subjects: het sluiten van de brug, not *het sluiten de brug.",
      "Adjectival nominalizations with -heid are de-words: de vrijheid, de nauwkeurigheid.",
      "Keep the infinitive nominalization when you mean the activity itself; use -ing when you mean an instance or official act (het stemmen vs de stemming)."
    ],
    structuralBreakdown: "[het + infinitief] / [de X-ing/heid/te] + [van / over + argument]",
    examples: [
      { nl: "Het eindeloze wachten op een handtekening frustreert de aannemer.", en: "The endless waiting for a signature frustrates the contractor.", highlight: "Het eindeloze wachten op" },
      { nl: "De sluiting van de sluis wordt vanmiddag bekendgemaakt.", en: "The closure of the lock will be announced this afternoon.", highlight: "De sluiting van de sluis" }
    ],
    commonMistake: "Keeping verbal government after a noun: *de sluiting de sluis or *het wachten de bus.",
    correction: "After a nominalization, introduce the old object with van or another preposition: de sluiting van de sluis, het wachten op de bus.",
    prerequisites: ["g-004", "g-016"],
    relatedRules: ["g-066", "g-074"],
    tags: ["nominalization", "infinitive", "heid", "ing", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which phrase correctly nominalizes ‘close the lock’?",
        options: [
          "het sluiten de sluis",
          "de sluiting van de sluis",
          "de sluis sluiting",
          "sluiten de sluis het"
        ],
        correct: 1,
        explanation: "The old object becomes a van-phrase after de sluiting."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Use the abstract noun of veilig.",
        blankWord: "veiligheid",
        sentenceWithBlank: "De ___ van de dijk staat niet ter discussie.",
        hints: ["veiligheid", "veilig", "beveiligen"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Het wachten de veerboot duurde een uur.",
        correctedSentence: "Het wachten op de veerboot duurde een uur.",
        explanation: "The infinitive noun takes op, just as wachten op does."
      },
      {
        type: "sentence_transformation",
        prompt: "Nominalize the verb as an official act (-ing), not as an activity.",
        sourceSentence: "Zij stemmen vanavond over de begroting.",
        targetSentence: "De stemming over de begroting is vanavond.",
        explanation: "Instance/official act → de stemming over …"
      }
    ]
  },
  {
    id: "g-068",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "Position of 'niet' in Complex Clauses",
    titleNl: "Plaats van 'niet' in samengestelde zinnen",
    summary: "Niet sits before the constituent it scopes over. In verb-final clauses it typically precedes the verbal cluster unless it negates a specific later phrase.",
    rules: [
      "Sentence negation in a main clause: after objects and many adverbs, before the participle/particle: Ik heb die brief niet verstuurd.",
      "Constituent negation: place niet immediately before the focused phrase: niet de burgemeester, maar de wethouder.",
      "In subordinate clauses niet usually precedes the verb cluster: … dat hij de brief niet heeft verstuurd.",
      "With separable verbs, sentence-negation niet stands before the particle or the whole cluster: Hij belt haar niet terug.",
      "niet meer, nog niet, helemaal niet are fixed clusters; do not split *niet … meer around a finite verb without reason."
    ],
    structuralBreakdown: "[… middenveld …] + [niet] + [focus-XP of werkwoordcluster]",
    examples: [
      { nl: "Ik begrijp dat de commissie het voorstel niet heeft aangenomen.", en: "I understand that the committee did not adopt the proposal.", highlight: "niet heeft aangenomen" },
      { nl: "Ze zoekt niet een tijdelijke kracht, maar een vaste collega.", en: "She is not looking for a temporary hire, but a permanent colleague.", highlight: "niet een tijdelijke kracht" }
    ],
    commonMistake: "Parking niet at the English not-position right after the finite verb in a subordinate clause: *… dat hij niet de brief heeft verstuurd when you meant sentence negation of the sending.",
    correction: "For ‘did not send the letter’, write … dat hij de brief niet heeft verstuurd. Put niet before a NP only if that NP is the contrastive focus.",
    prerequisites: ["g-028"],
    relatedRules: ["g-069", "g-088"],
    tags: ["negation", "niet", "word-order", "scope", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Choose sentence negation of the sending in a dat-clause.",
        options: [
          "dat hij niet de brief heeft verstuurd (neutral sentence negation)",
          "dat hij de brief niet heeft verstuurd",
          "dat niet hij de brief heeft verstuurd (same meaning as sentence negation)",
          "dat hij de brief heeft niet verstuurd"
        ],
        correct: 1,
        explanation: "Neutral sentence negation sits before the cluster: de brief niet heeft verstuurd."
      },
      {
        type: "word_order",
        translation: "I have not sent that form yet.",
        tokens: ["Ik", "heb", "dat", "formulier", "nog", "niet", "verstuurd"],
        correctSentence: "Ik heb dat formulier nog niet verstuurd"
      },
      {
        type: "error_correction",
        sentenceWithError: "Ze belt terug haar niet.",
        correctedSentence: "Ze belt haar niet terug.",
        explanation: "Object before niet; particle terug stays at the end."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Place niet in the contrastive slot.",
        blankWord: "niet",
        sentenceWithBlank: "___ de directeur tekende, maar de procuratiehouder.",
        hints: ["niet", "geen", "nooit"]
      }
    ]
  },
  {
    id: "g-069",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "Double Infinitives and Verb Clustering in Main Clauses",
    titleNl: "Dubbele infinitieven en werkwoordclusters in hoofdzinnen",
    summary: "When a finite auxiliary or modal takes an infinitive that itself takes an infinitive, Dutch stacks the non-finite verbs at the end of the main clause (double or triple infinitive).",
    rules: [
      "Finite verb stays in second position; the infinitives occupy the right bracket: Zij wil de keuken laten verbouwen.",
      "Typical stacks: modal + laten/zien/horen/helpen + infinitive; or gaan/komen + infinitive.",
      "Objects and adverbials sit in the middle field between the finite verb and the cluster.",
      "Do not put the second infinitive next to the finite verb: *Zij wil laten de keuken verbouwen.",
      "In yes/no questions the finite verb inverts, but the cluster remains final: Wil zij de keuken laten verbouwen?"
    ],
    structuralBreakdown: "[XP] + [Vfin] + [middenveld] + [infinitief₁] + [infinitief₂]",
    examples: [
      { nl: "De gemeente wil de kademuur nog dit jaar laten herstellen.", en: "The municipality wants to have the quay wall repaired this year.", highlight: "wil … laten herstellen" },
      { nl: "Heb je die aankondiging vanochtend horen voorlezen?", en: "Did you hear that announcement being read out this morning?", highlight: "Heb … horen voorlezen" }
    ],
    commonMistake: "Splitting the cluster around the object: *De gemeente wil laten de kademuur herstellen.",
    correction: "Keep both infinitives together at the end: wil de kademuur laten herstellen.",
    prerequisites: ["g-027", "g-045"],
    relatedRules: ["g-070", "g-076"],
    tags: ["verb-cluster", "double-infinitive", "laten", "b1"],
    exercises: [
      {
        type: "word_order",
        translation: "She wants to have the kitchen renovated.",
        tokens: ["Zij", "wil", "de", "keuken", "laten", "verbouwen"],
        correctSentence: "Zij wil de keuken laten verbouwen"
      },
      {
        type: "multiple_choice",
        question: "Which main-clause cluster is well-formed?",
        options: [
          "Hij kan horen de klok luiden.",
          "Hij kan de klok horen luiden.",
          "Hij horen kan de klok luiden.",
          "Hij kan de klok luiden horen te."
        ],
        correct: 1,
        explanation: "Object in the middle; horen luiden as a final pair."
      },
      {
        type: "error_correction",
        sentenceWithError: "We moeten laten de fiets repareren.",
        correctedSentence: "We moeten de fiets laten repareren.",
        explanation: "de fiets belongs in the middle field, not inside the infinitive pair."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Supply the causative infinitive in the cluster.",
        blankWord: "laten",
        sentenceWithBlank: "Ze gaan het hek morgen ___ schilderen.",
        hints: ["laten", "gelaten", "te laten"]
      }
    ]
  },
  {
    id: "g-070",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "IPP (Infinitivus Pro Participio)",
    titleNl: "Infinitivus pro participio",
    summary: "When a perfect auxiliary governs a verb that itself takes a bare infinitive (modals, perception verbs, laten, some helpen/leren), that middle verb appears as an infinitive, not as a past participle.",
    rules: [
      "Trigger: heeft/had/is/was + V_middle + infinitive. V_middle is modal, laten, zien, horen, voelen, sometimes helpen, leren, doen.",
      "The expected participle of V_middle is replaced by an infinitive: heeft laten maken, not *heeft gelaten maken.",
      "Same for modals: heeft moeten wachten, not *heeft gemoeten wachten.",
      "If there is no dependent infinitive, the participle returns: Hij heeft het gelaten (no second infinitive).",
      "Spoken and written standard both require IPP in these clusters; *heeft gelaten maken is ungrammatical in standard Dutch."
    ],
    structuralBreakdown: "[hebben/zijn] + [infinitief i.p.v. vd] + [hoofdinfinitief]   —   *niet* [hebben] + [vd] + [infinitief]",
    examples: [
      { nl: "De buurman heeft het dak al laten maken.", en: "The neighbour has already had the roof repaired.", highlight: "heeft … laten maken" },
      { nl: "We hadden de veerboot nog net zien vertrekken.", en: "We had just seen the ferry leave.", highlight: "hadden … zien vertrekken" }
    ],
    commonMistake: "Writing *heeft gelaten maken or *heeft gezien vertrekken because the perfect ‘should’ show a participle.",
    correction: "Use the infinitive of the middle verb: heeft laten maken, heeft zien vertrekken, heeft moeten wachten.",
    prerequisites: ["g-069", "g-048"],
    relatedRules: ["g-063", "g-076"],
    tags: ["ipp", "infinitive", "perfect", "laten", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Select the grammatical perfect of laten + infinitive.",
        options: [
          "heeft gelaten maken",
          "heeft laten maken",
          "is gelaten maken",
          "heeft gemaakt laten"
        ],
        correct: 1,
        explanation: "IPP replaces gelaten with laten when maken follows."
      },
      {
        type: "fill_in_the_blank",
        prompt: "IPP form of moeten in the perfect.",
        blankWord: "moeten",
        sentenceWithBlank: "Zij heeft een uur ___ wachten.",
        hints: ["moeten", "gemoeten", "moest"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Ik heb de kinderen geholpen de tent opzetten — beter: heb geholpen opzetten? Nee: Ik heb de kinderen geholpen de tent opgezet.",
        correctedSentence: "Ik heb de kinderen de tent helpen opzetten.",
        explanation: "With a following infinitive, helpen is IPP (infinitive), and the cluster is final."
      },
      {
        type: "typed_conjugation",
        infinitive: "laten",
        subject: "hij (perfect + maken)",
        targetTense: "IPP perfect",
        correctForm: "laten",
        explanation: "Middle verb under hebben + infinitive surfaces as laten, not gelaten."
      }
    ]
  },
  {
    id: "g-071",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "'zouden' for Hypothesis, Softening, and Reported Future-in-Past",
    titleNl: "'Zouden': hypothese, verzachting en toekomende tijd in het verleden",
    summary: "Zouden is not only a polite extra. It marks hypotheses, softens requests, and shifts a future viewed from a past reporting time.",
    rules: [
      "Hypothesis / irrealis: Als het stormde, zouden de veren uitvallen.",
      "Softener: Zou u de deur even willen sluiten? is less blunt than Sluit de deur.",
      "Future-in-the-past: Ze zei dat ze de volgende dag zou langskomen — the coming is future relative to zei.",
      "zouden + infinitive, never *zouden te + infinitive.",
      "Do not use zullen when the orientation time is already past; zullen would reset the viewpoint to now."
    ],
    structuralBreakdown: "[zouden] + [infinitief]  →  {hypothese | verzachting | toekomst-vanaf-verleden}",
    examples: [
      { nl: "Volgens de dienstregeling zou de boot om vier uur vertrekken, maar de mist hield hem vast.", en: "According to the timetable the boat was to leave at four, but the fog held it.", highlight: "zou … vertrekken" },
      { nl: "Zou je die offerte nog vandaag willen nakijken?", en: "Would you mind checking that quote today?", highlight: "Zou je … willen nakijken" }
    ],
    commonMistake: "Reporting a past plan with zullen from the present: *Ze zei dat ze morgen zal komen when the saying is already past and you are staying in that timeline.",
    correction: "From a past reporting verb, use zou(den): Ze zei dat ze de volgende dag zou komen.",
    prerequisites: ["g-045"],
    relatedRules: ["g-082", "g-083"],
    tags: ["zouden", "modality", "reported-speech", "politeness", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Which sentence is future-in-the-past after ze beloofde?",
        options: [
          "Ze beloofde dat ze morgen zal bellen.",
          "Ze beloofde dat ze de volgende dag zou bellen.",
          "Ze beloofde dat ze belt.",
          "Ze beloofde te zullen dat ze belt."
        ],
        correct: 1,
        explanation: "Past reporting time plus later event → zou bellen."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Soften the request with zouden.",
        blankWord: "zou",
        sentenceWithBlank: "___ u dit formulier willen ondertekenen?",
        hints: ["zou", "zal", "moet"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Als we meer tijd hadden, zullen we de dijk zelf inspecteren.",
        correctedSentence: "Als we meer tijd hadden, zouden we de dijk zelf inspecteren.",
        explanation: "A hypothetical past/irrealis protasis takes zouden, not zullen."
      },
      {
        type: "sentence_transformation",
        prompt: "Shift the reported future into the past timeline.",
        sourceSentence: "Hij zegt: 'Ik zal later terugkomen.' (reported from yesterday)",
        targetSentence: "Hij zei dat hij later zou terugkomen.",
        explanation: "zei + zou + infinitive is future-in-the-past."
      }
    ]
  },
  {
    id: "g-072",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "Conjunctional Adverbs: 'daarom', 'toch', 'echter', 'immers'",
    titleNl: "Voegwoordelijke bijwoorden: daarom, toch, echter, immers",
    summary: "These words link discourse, but they are adverbs, not subordinators: they occupy the first position or the middle field and trigger inversion when they are first.",
    rules: [
      "daarom gives a consequence and is an adverb: Daarom blijft de veerdienst uit. Finite verb still second.",
      "toch marks opposition or insistence: Het waait hard, toch steken we over.",
      "echter is a formal adversative, typically mid-clause: De planning is krap; we halen de deadline echter wel.",
      "immers presents something as already known justification: We blijven thuis; de dam is immers afgesloten.",
      "None of them introduce a verb-final subordinate clause: *daarom de veerdienst uitblijft is wrong (that would need omdat or doordat)."
    ],
    structuralBreakdown: "[conjunctief bijwoord] + [Vfin] + [rest]   OF   [onderwerp] + [Vfin] + [bijwoord] + [rest]",
    examples: [
      { nl: "De windkracht neemt toe; daarom legt de schipper aan in Harlingen.", en: "The wind is picking up; that is why the skipper puts in at Harlingen.", highlight: "daarom legt" },
      { nl: "De vergunning is binnen; we beginnen echter pas na de vorstperiode.", en: "The permit is in; we will not start, however, until after the frost.", highlight: "beginnen echter pas" }
    ],
    commonMistake: "Treating daarom or echter like omdat and sending the verb to the end: *Daarom de schipper in Harlingen aanlegt.",
    correction: "Keep main-clause order with inversion after a first-position adverb: Daarom legt de schipper aan in Harlingen.",
    prerequisites: ["g-027"],
    relatedRules: ["g-079", "g-080"],
    tags: ["conjunctional-adverbs", "daarom", "echter", "word-order", "b1"],
    exercises: [
      {
        type: "word_order",
        translation: "That is why the ferry is staying in the harbour.",
        tokens: ["Daarom", "blijft", "de", "veerboot", "in", "de", "haven"],
        correctSentence: "Daarom blijft de veerboot in de haven"
      },
      {
        type: "multiple_choice",
        question: "Which sentence uses echter in a grammatical slot?",
        options: [
          "Echter we de deadline halen.",
          "We halen de deadline echter wel.",
          "We echter de deadline halen.",
          "Omdat echter we de deadline halen."
        ],
        correct: 1,
        explanation: "echter is mid-field; the finite verb remains second (halen)."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Insert the adverb that presents a known reason.",
        blankWord: "immers",
        sentenceWithBlank: "Neem extra kleding mee; het kan ___ nog vriezen op de Afsluitdijk.",
        hints: ["immers", "daarom", "hoewel"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Het waait hard, toch we steken over.",
        correctedSentence: "Het waait hard, toch steken we over.",
        explanation: "First-position toch inverts subject and finite verb."
      }
    ]
  },
  {
    id: "g-073",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "Present and Past Participles as Reduced Relatives",
    titleNl: "Deelwoorden als beknopte betrekkelijke bijzinnen",
    summary: "A present or past participle can compress a relative clause in front of a noun: de naderende storm, de gesloten sluis. The participle still licenses some of its old arguments.",
    rules: [
      "Present participle (-end) is active/progressive: de naderende storm ≈ de storm die nadert.",
      "Past participle is typically passive or resultative: de gesloten sluis ≈ de sluis die gesloten is/werd.",
      "The reduced form is prenominal and inflects like an adjective: een naderende storm, de naderende storm.",
      "Heavy complements often stay postnominal or force a full relative: de door Rijkswaterstaat gesloten sluis is possible but a full die-clause is clearer.",
      "Do not use a finite verb inside the prenominal phrase: *de die nadert storm."
    ],
    structuralBreakdown: "[(bepalingen) + deelwoord-inflectie] + [nomen]   ≈   [nomen + die/dat + finiete relatief]",
    examples: [
      { nl: "De naderende springvloed dwingt de havenmeester tot extra trossen.", en: "The approaching spring tide forces the harbour master to put out extra lines.", highlight: "De naderende springvloed" },
      { nl: "De gisteren nog openstaande brug is vanochtend gelicht.", en: "The bridge that was still open yesterday was raised this morning.", highlight: "openstaande brug" }
    ],
    commonMistake: "Leaving a finite relative pronoun inside the prenominal slot: *de die gesloten is sluis.",
    correction: "Either fully reduce (de gesloten sluis) or use a full postnominal relative (de sluis die gesloten is).",
    prerequisites: ["g-036"],
    relatedRules: ["g-061", "g-062"],
    tags: ["participles", "reduced-relative", "adjective", "b1"],
    exercises: [
      {
        type: "sentence_transformation",
        prompt: "Reduce the relative to a prenominal present participle.",
        sourceSentence: "de storm die nadert",
        targetSentence: "de naderende storm",
        explanation: "-end + adjective -e before a de-word."
      },
      {
        type: "multiple_choice",
        question: "Which phrase matches ‘the lock that has been closed’?",
        options: [
          "de sluitende sluis",
          "de gesloten sluis",
          "de sluis gesloten die",
          "de is gesloten sluis"
        ],
        correct: 1,
        explanation: "Past participle prenominally yields the result/passive reading."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Use the present-participle adjective of dreigen.",
        blankWord: "dreigende",
        sentenceWithBlank: "De ___ storing houdt de dienstregeling in de wacht.",
        hints: ["dreigende", "gedreigde", "dreigt"]
      },
      {
        type: "error_correction",
        sentenceWithError: "De die naderende is storm houdt het veer aan wal.",
        correctedSentence: "De naderende storm houdt het veer aan wal.",
        explanation: "Prenominal reduction cannot host die + finite verb."
      }
    ]
  },
  {
    id: "g-074",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "'te' + Infinitive after Adjectives and Nouns",
    titleNl: "'Te' + infinitief na adjectieven en zelfstandige naamwoorden",
    summary: "Many adjectives and nouns license a te-infinitive as complement (makkelijk te vinden, de neiging om te overdrijven). This is not the same as the om … te purpose clause, though om is often optional or preferred.",
    rules: [
      "After predicative adjectives of ease, difficulty, possibility: De kade is lastig te zien in de mist.",
      "After nouns of plan, right, chance, duty: de plicht te waarschuwen / de plicht om te waarschuwen.",
      "om is often added before te with nouns and with extra material: de kans om eerder te vertrekken.",
      "The infinitive clause does not take a finite verb: *makkelijk dat je het vindt is a different construction.",
      "Passive sense is common after adjectives: Dit formulier is nergens te krijgen ≈ ‘one cannot get this form anywhere’."
    ],
    structuralBreakdown: "[adjectief / nomen] + [(om) te + infinitief] (+ objecten in het midden van de infinitiefgroep)",
    examples: [
      { nl: "Die steiger is bij afgaand tij nauwelijks te bereiken.", en: "That jetty is hardly reachable at falling tide.", highlight: "nauwelijks te bereiken" },
      { nl: "We hebben de neiging om de wachttijd te onderschatten.", en: "We have a tendency to underestimate the waiting time.", highlight: "neiging om … te onderschatten" }
    ],
    commonMistake: "Dropping te after the adjective: *De steiger is lastig bereiken, on the model of English hard to reach without analysing te.",
    correction: "Dutch needs te: lastig te bereiken. After many nouns, prefer om te.",
    prerequisites: ["g-043"],
    relatedRules: ["g-067", "g-043"],
    tags: ["te-infinitive", "adjective", "noun-complement", "b1"],
    exercises: [
      {
        type: "fill_in_the_blank",
        prompt: "Insert te in the adjectival complement.",
        blankWord: "te",
        sentenceWithBlank: "Dit adres is in het donker moeilijk ___ vinden.",
        hints: ["te", "om", "van"]
      },
      {
        type: "multiple_choice",
        question: "Which complement fits de neiging?",
        options: [
          "de neiging dat overdrijven",
          "de neiging om te overdrijven",
          "de neiging overdrijven te om",
          "de neiging overdrijft"
        ],
        correct: 1,
        explanation: "Noun of tendency takes om te + infinitive."
      },
      {
        type: "error_correction",
        sentenceWithError: "Het formulier is nergens krijgen.",
        correctedSentence: "Het formulier is nergens te krijgen.",
        explanation: "Predicative possibility/availability requires te + infinitive."
      },
      {
        type: "sentence_transformation",
        prompt: "Turn the finite clause into an adjectival te-infinitive.",
        sourceSentence: "Je kunt die kade in de mist moeilijk zien.",
        targetSentence: "Die kade is in de mist moeilijk te zien.",
        explanation: "Object becomes subject; adjective + te zien."
      }
    ]
  },
  {
    id: "g-075",
    section: 5,
    sectionTitle: "B1 Intermediate Expansion",
    level: "B1",
    title: "Reciprocal 'elkaar' vs Reflexive 'zich'",
    titleNl: "Wederkerig 'elkaar' versus wederkerend 'zich'",
    summary: "Zich marks that the subject acts on itself; elkaar marks that members of a plural subject act on one another. They are not interchangeable.",
    rules: [
      "Reflexive: Hij scheert zich; De gemeente vergist zich — one participant, action returns to that same participant.",
      "Reciprocal: De twee wethouders wantrouwen elkaar — A acts on B and B on A.",
      "Inherent reflexives (zich schamen, zich vergissen, zich haasten) never take elkaar even with a plural subject: Ze schamen zich, not *elkaar, unless you mean mutual shaming, which is rare and usually zich voor elkaar schamen.",
      "elkaar can combine with prepositions: met elkaar, naar elkaar, van elkaar.",
      "Singular subjects cannot take elkaar: *Hij belt elkaar."
    ],
    structuralBreakdown: "[enkelvoud/inherent] + [zich]   vs   [meervoudige deelnemers] + [elkaar ( + P )]",
    examples: [
      { nl: "De schippers verstaan elkaar slecht over de marifoon.", en: "The skippers can barely understand one another over the VHF.", highlight: "elkaar" },
      { nl: "De schipper heeft zich in de betonning vergist.", en: "The skipper made a mistake about the buoyage.", highlight: "zich … vergist" }
    ],
    commonMistake: "Using elkaar with an inherent reflexive: *Ze haasten elkaar naar de boot.",
    correction: "Inherent reflexives keep zich: Ze haasten zich naar de boot. Use elkaar only for genuine mutual action (Ze helpen elkaar).",
    prerequisites: ["g-021"],
    relatedRules: ["g-021"],
    tags: ["elkaar", "zich", "reciprocal", "reflexive", "b1"],
    exercises: [
      {
        type: "multiple_choice",
        question: "Two colleagues write reports about one another. Which object?",
        options: ["zich", "elkaar", "hen zich", "zichzelf elkaar"],
        correct: 1,
        explanation: "Mutual action between two participants is elkaar."
      },
      {
        type: "fill_in_the_blank",
        prompt: "Inherent reflexive of zich haasten, plural.",
        blankWord: "zich",
        sentenceWithBlank: "De passagiers haasten ___ naar de sluis.",
        hints: ["zich", "elkaar", "hen"]
      },
      {
        type: "error_correction",
        sentenceWithError: "Hij belt elkaar morgen over de vrachtbrief.",
        correctedSentence: "Hij belt hem morgen over de vrachtbrief.",
        explanation: "A singular subject cannot be reciprocal; pick a real object pronoun."
      },
      {
        type: "sentence_transformation",
        prompt: "Make the action reciprocal.",
        sourceSentence: "Anna helpt Ben. Ben helpt Anna.",
        targetSentence: "Anna en Ben helpen elkaar.",
        explanation: "Two-way help collapses to elkaar."
      }
    ]
  }
];
