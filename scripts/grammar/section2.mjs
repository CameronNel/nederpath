export const lessons = [
  {
    id: "g-016",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "Separable Verbs in the Present Tense",
    titleNl: "Scheidbare Werkwoorden in de Tegenwoordige Tijd",
    summary: "A separable verb splits in a main clause: the finite stem sits in V2 and the prefix waits at the clause end; the parts stay glued in the infinitive and take ge- between prefix and stem in the participle.",
    rules: [
      "In a main clause the stressed prefix (op, aan, mee, terug, uit, weg…) detaches and lands after objects and most adverbials: Ik sta om zeven uur op.",
      "The finite part conjugates like any regular or irregular verb (staat op, maakt schoon); inversion still applies (Sta je vroeg op?).",
      "Infinitives and te-infinitives keep the prefix attached in writing (opstaan, om op te staan); the particle te slips between prefix and stem.",
      "Past participles insert ge- in the middle (opgestaan, aangekomen), not *geopstaan; inseparable prefixes (be-, ver-, ont-) never split."
    ],
    structuralBreakdown: "Main clause: [PV-stem] + middle field + [prefix] | Infinitive: prefix+stem | Participle: prefix+ge+stem.",
    examples: [
      { nl: "Ik sta elke werkdag om zeven uur op en ga daarna onder de douche.", en: "I get up at seven every weekday and then take a shower.", highlight: "sta … op" },
      { nl: "Wil je morgen op tijd aankomen, of kom je weer te laat aan?", en: "Do you want to arrive on time tomorrow, or will you arrive late again?", highlight: "aankomen / kom … aan" }
    ],
    commonMistake: "Leaving the prefix on the finite verb in a main clause (Ik opsta om zeven uur).",
    correction: "Split in main clauses: Ik sta om zeven uur op. Keep it attached only in the infinitive: Ik wil opstaan.",
    prerequisites: ["g-005", "g-006"],
    relatedRules: ["g-017", "g-024"],
    tags: ["separable-verbs", "prefixes", "A2"],
    exercises: [
      { type: "sentence_transformation", original: "Ik opstaan om acht uur. (repair)", instruction: "Write a grammatical present main clause with opstaan.", transformed: "Ik sta om acht uur op.", hints: ["split the prefix"] },
      { type: "fill_in_the_blank", prompt: "Place the prefix of meegaan at the clause end.", blankWord: "mee", sentenceWithBlank: "Gaat jouw zus vanavond ___ naar de film?", hints: ["detached prefix"] },
      { type: "error_correction", sentenceWithError: "Wij aankomen altijd te laat op het station.", correctedSentence: "Wij komen altijd te laat aan op het station.", explanation: "Finite komen stays in V2; aan waits later (here before the place PP is also accepted as Wij komen altijd te laat op het station aan)." },
      { type: "multiple_choice", question: "What is the past participle of opstaan?", options: ["geopstaan", "opgestaan", "opgegaanstaan", "gestaanop"], correct: 1, explanation: "ge- sits between prefix and stem." }
    ]
  },
  {
    id: "g-017",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "Modal Auxiliary Verbs: 'kunnen', 'moeten', 'mogen', 'willen'",
    titleNl: "Modale Hulpwerkwoorden",
    summary: "Present-tense modals are irregular and take a bare infinitive at the end of the clause; they encode ability, necessity, permission, and desire rather than tense.",
    rules: [
      "kunnen (can/be able): ik kan, jij kunt/kan, hij kan, wij kunnen; inversion kun je, not *kunt je.",
      "moeten (must/have to): ik moet, jij moet, hij moet, wij moeten — obligation or strong inference, not a future marker by itself.",
      "mogen (may/be allowed): ik mag, jij mag, hij mag, wij mogen; permission, not English may-of-possibility as the first reading.",
      "willen (want): ik wil, jij wilt/wil, hij wil, wij willen; inverted wil je. The lexical verb stays an infinitive without te (Ik wil koffie drinken)."
    ],
    structuralBreakdown: "Subject + modal-PV + middle field + lexical infinitive (no te) at the end.",
    examples: [
      { nl: "Ik kan vandaag niet komen, want ik moet overwerken.", en: "I cannot come today, because I have to work overtime.", highlight: "kan … komen / moet overwerken" },
      { nl: "Mag ik hier fietsen, of wilt u dat ik loop?", en: "May I cycle here, or do you (formal) want me to walk?", highlight: "Mag ik / wilt u" }
    ],
    commonMistake: "Inserting te after a modal (Ik moet te werken) or conjugating the second verb (Ik kan zwemt).",
    correction: "Modal + bare infinitive: Ik moet werken; Ik kan zwemmen.",
    prerequisites: ["g-005", "g-016"],
    relatedRules: ["g-024", "g-020"],
    tags: ["modals", "infinitive", "A2"],
    exercises: [
      { type: "typed_conjugation", infinitive: "kunnen", subject: "ik", targetTense: "present", correctForm: "kan", explanation: "First person of kunnen is kan." },
      { type: "word_order", translation: "We want to drink coffee later.", tokens: ["Wij", "willen", "later", "koffie", "drinken"], correctSentence: "Wij willen later koffie drinken" },
      { type: "error_correction", sentenceWithError: "Jij moet te wachten bij de deur.", correctedSentence: "Jij moet wachten bij de deur.", explanation: "No te after moeten." },
      { type: "multiple_choice", question: "Which inverted form is correct for je + willen?", options: ["Wilt je mee?", "Wil je mee?", "Willen je mee?", "Wille je mee?"], correct: 1, explanation: "Inverted je uses wil." }
    ]
  },
  {
    id: "g-018",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "Diminutives (Verkleinwoorden) and Universal 'het'",
    titleNl: "Verkleinwoorden en het vaste het",
    summary: "Diminutives add a variant of -je and become neuter regardless of the base noun, so the article is always het and adjectives follow the het-pattern.",
    rules: [
      "All diminutives take het in the singular (het huisje, het stoeltje, het meisje) even if the base was de stoel or de meid.",
      "The suffix shape depends on the stem: -je after voiceless consonants (hokje), -tje after long vowels, -l/-n/-r etc. (konijntje, autootje), -pje after -m (bloempje), -etje after some short-vowel stems (bedje, biggetje).",
      "The plural of a diminutive is -s: de huisjes, de stoeltjes — still de because every plural is de.",
      "Adjectives: het kleine huisje vs een klein huisje, exactly as with other het-nouns."
    ],
    structuralBreakdown: "Base N + -je/-tje/-pje/-etje → het-noun; plural diminutive = de + -jes.",
    examples: [
      { nl: "Het stoeltje van het kindje staat naast het tafeltje.", en: "The little chair of the little child stands next to the little table.", highlight: "Het stoeltje / het kindje / het tafeltje" },
      { nl: "We kopen een klein huisje, geen grote huisjes in de stad.", en: "We are buying a small cottage, not large little houses in the city.", highlight: "een klein huisje / grote huisjes" }
    ],
    commonMistake: "Keeping de on a diminutive because the base was a de-word (de stoeltje).",
    correction: "Singular diminutive: het stoeltje. Plural: de stoeltjes.",
    prerequisites: ["g-004", "g-008", "g-012"],
    relatedRules: ["g-001"],
    tags: ["diminutives", "gender", "het", "A2"],
    exercises: [
      { type: "article_selection", noun: "huisje", meaning: "little house", correct: "het", explanation: "Every diminutive is het." },
      { type: "article_selection", noun: "stoeltjes", meaning: "little chairs (plural)", correct: "de", explanation: "Plural diminutives take de." },
      { type: "fill_in_the_blank", prompt: "Indefinite adjective before huisje.", blankWord: "klein", sentenceWithBlank: "Zij huurt een ___ huisje aan het water.", hints: ["een + het-noun: no -e"] },
      { type: "error_correction", sentenceWithError: "De meisje speelt met de hondje.", correctedSentence: "Het meisje speelt met het hondje.", explanation: "Both diminutives need het." }
    ]
  },
  {
    id: "g-019",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "Reflexive Verbs and Reflexive Pronouns",
    titleNl: "Wederkerende Werkwoorden",
    summary: "Reflexive zich-verbs take a pronoun that matches the subject; Dutch distinguishes stressed zichzelf from unstressed me/je/zich, and some verbs are lexically reflexive.",
    rules: [
      "Unstressed paradigm: ik … me, jij … je, u … zich, hij/zij/het … zich, wij … ons, jullie … je, zij … zich.",
      "Stressed/contrastive forms add -zelf (mezelf, jezelf, zichzelf) when the object is truly the same person as a focused object (Hij ziet zichzelf in de spiegel).",
      "Many hygiene and change-of-state verbs are inherently reflexive (zich wassen, zich schamen, zich haasten) and sound incomplete without the pronoun.",
      "The reflexive sits in the middle field, usually right after the finite verb or subject, not at the English himself-end by default."
    ],
    structuralBreakdown: "Subject + PV + reflexive (me/je/zich/ons) + rest; -zelf only under stress or true object focus.",
    examples: [
      { nl: "Ik haast me, want de trein vertrekt over vijf minuten.", en: "I hurry, because the train leaves in five minutes.", highlight: "haast me" },
      { nl: "Schaamt u zich niet, of wast hij zich nog?", en: "Are you (formal) not ashamed, or is he still washing?", highlight: "Schaamt u zich / wast hij zich" }
    ],
    commonMistake: "Using zich with ik or jij (Ik wast zich) or dropping the pronoun on lexically reflexive verbs.",
    correction: "Match the subject: ik was me, jij wast je, hij wast zich, u wast zich.",
    prerequisites: ["g-002", "g-005"],
    relatedRules: ["g-016"],
    tags: ["reflexive", "zich", "A2"],
    exercises: [
      { type: "typed_conjugation", infinitive: "zich haasten", subject: "ik", targetTense: "present", correctForm: "haast me", explanation: "First person reflexive is me." },
      { type: "fill_in_the_blank", prompt: "Reflexive for hij with zich schamen.", blankWord: "zich", sentenceWithBlank: "Hij schaamt ___ voor die fout.", hints: ["third person"] },
      { type: "error_correction", sentenceWithError: "Wij wassen zich voor het eten.", correctedSentence: "Wij wassen ons voor het eten.", explanation: "wij takes ons, not zich." },
      { type: "multiple_choice", question: "Which pair is correct for formal u?", options: ["u wast je", "u wast zich", "u wast me", "u wast ons"], correct: 1, explanation: "u takes zich." }
    ]
  },
  {
    id: "g-020",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "The Imperative Mood (Gebiedende Wijs)",
    titleNl: "De Gebiedende Wijs",
    summary: "The informal singular imperative is the verb stem; a plural or polite command often adds -t, and separable prefixes still wait at the end.",
    rules: [
      "Default informal command = present stem: Kom!, Wacht!, Wees stil! (zijn uses wees, not ben, in the standard imperative).",
      "A -t form (Komt u binnen, Wacht even) is common with u and in older or written plural addresses; jullie can also take the stem plus jullie (Kom jullie mee!).",
      "Separable verbs split: Sta op!, Doe het licht uit!; the prefix does not stay on the stem.",
      "Negative commands use niet or geen in their usual slots: Wacht niet, Maak geen lawaai. Object pronouns follow the stem (Geef me die pen)."
    ],
    structuralBreakdown: "Stem (informal) / stem+t (+ u) + objects + [separable prefix] + niet/geen as needed.",
    examples: [
      { nl: "Wacht hier en doe je jas uit.", en: "Wait here and take your coat off.", highlight: "Wacht / doe … uit" },
      { nl: "Komt u binnen en wees niet bang.", en: "Please come in and do not be afraid.", highlight: "Komt u / wees niet" }
    ],
    commonMistake: "Using ben as the command of zijn (Ben stil!) or keeping the prefix attached (Opstaan!).",
    correction: "Wees stil! and Sta op! are the standard commands.",
    prerequisites: ["g-005", "g-016"],
    relatedRules: ["g-017"],
    tags: ["imperative", "commands", "A2"],
    exercises: [
      { type: "sentence_transformation", original: "Jij staat nu op.", instruction: "Make an informal singular command.", transformed: "Sta nu op.", hints: ["stem + split prefix"] },
      { type: "multiple_choice", question: "What is the standard imperative of zijn meaning 'be quiet'?", options: ["Ben stil!", "Is stil!", "Wees stil!", "Zijn stil!"], correct: 2, explanation: "Imperative of zijn is wees." },
      { type: "error_correction", sentenceWithError: "Opstaan nu, we komen te laat!", correctedSentence: "Sta nu op, we komen te laat!", explanation: "Split the separable verb in the imperative." },
      { type: "fill_in_the_blank", prompt: "Informal stem of wachten as a command.", blankWord: "Wacht", sentenceWithBlank: "___ even bij de deur, alsjeblieft.", hints: ["bare stem"] }
    ]
  },
  {
    id: "g-021",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "Comparative and Superlative of Adjectives",
    titleNl: "Vergrotende en Overtreffende Trap",
    summary: "Most adjectives add -er and -st, then take the ordinary -e when attributive; irregulars like goed/beter/best must be memorised, and dan (not als) is the careful comparative particle.",
    rules: [
      "Comparative = stem + -er (sometimes -der after -r: helderder); superlative = (het) + stem + -st / -t.",
      "Attributive forms still follow the e-rule: een grotere auto, de grootste auto, een beter boek, het beste boek.",
      "Irregular cores: goed–beter–best, veel–meer–meest, weinig–minder–minst, graag–liever–liefst.",
      "Standard written Dutch prefers groter dan; groter als is widespread in speech but marked as informal/nonstandard in careful style."
    ],
    structuralBreakdown: "Adj-er (+ dan XP) | (het) Adj-st | attributive + ordinary -e; irregular stems listed above.",
    examples: [
      { nl: "Deze tas is groter dan die tas, maar niet de grootste van allemaal.", en: "This bag is larger than that bag, but not the largest of all.", highlight: "groter dan / de grootste" },
      { nl: "Zij spreekt beter Nederlands dan ik, en het liefst oefent ze elke dag.", en: "She speaks better Dutch than I do, and she prefers to practise every day.", highlight: "beter / het liefst" }
    ],
    commonMistake: "Using meer groot like English more big, or writing groter als in a formal exercise.",
    correction: "Dutch prefers synthetic -er: groter dan. Reserve meer for veel and for long participles that resist -er.",
    prerequisites: ["g-012"],
    relatedRules: ["g-022"],
    tags: ["comparatives", "superlatives", "dan", "A2"],
    exercises: [
      { type: "multiple_choice", question: "Which comparative is standard before dan?", options: ["meer groot dan", "groter als", "groter dan", "grootst dan"], correct: 2, explanation: "Synthetic -er plus dan." },
      { type: "fill_in_the_blank", prompt: "Comparative of goed.", blankWord: "beter", sentenceWithBlank: "Vandaag voel ik me ___ dan gisteren.", hints: ["irregular"] },
      { type: "error_correction", sentenceWithError: "Dit is de meest goed restaurant van de straat.", correctedSentence: "Dit is het beste restaurant van de straat.", explanation: "goed → best; restaurant is het." },
      { type: "sentence_transformation", original: "Het huis is groot.", instruction: "Make a comparative attributive phrase with auto (de) and dan een fiets.", transformed: "een grotere auto dan een fiets", hints: ["-er + -e after een + de-noun"] }
    ]
  },
  {
    id: "g-022",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "Adverbs of Frequency, Time, and Degree",
    titleNl: "Bijwoorden van Frequentie, Tijd en Graad",
    summary: "Frequency and degree adverbs live in the middle field rather than in English-style do-support slots; they do not take the adjectival -e.",
    rules: [
      "Frequency: altijd, meestal, vaak, soms, zelden, nooit — typically after the finite verb (Ik fiets vaak naar werk).",
      "Time-when adverbs (vandaag, gisteren, straks, al, nog) also sit early in the middle field and can occupy slot one, triggering inversion.",
      "Degree: heel, erg, vrij, te, genoeg (postposed), een beetje — they modify adjectives/adverbs without adding -e (heel groot, not hele groot unless hele is the adjective 'whole').",
      "niet and nooit occupy the same late-middle zone as other negators; nooit already contains negation, so skip extra niet."
    ],
    structuralBreakdown: "PV + (time/frequency) + (degree + Adj/Adv) + objects/PPs; adverbs stay uninflected.",
    examples: [
      { nl: "Ik drink 's ochtends altijd sterke koffie, maar 's avonds zelden thee.", en: "I always drink strong coffee in the morning, but I seldom drink tea in the evening.", highlight: "altijd / zelden" },
      { nl: "Zij is heel moe en komt te laat, dus ze rust een beetje uit.", en: "She is very tired and arrives too late, so she rests a little.", highlight: "heel / te / een beetje" }
    ],
    commonMistake: "Inflecting heel as hele before a predicative adjective (Hij is hele moe) or stacking niet nooit.",
    correction: "Predicative: heel moe. Use nooit alone for 'never'.",
    prerequisites: ["g-006", "g-012"],
    relatedRules: ["g-026"],
    tags: ["adverbs", "frequency", "degree", "A2"],
    exercises: [
      { type: "word_order", translation: "I often work at home.", tokens: ["Ik", "werk", "vaak", "thuis"], correctSentence: "Ik werk vaak thuis" },
      { type: "multiple_choice", question: "Which degree phrase is correct before predicative moe?", options: ["hele moe", "heel moe", "helen moe", "moe heel"], correct: 1, explanation: "Adverb heel does not take -e." },
      { type: "error_correction", sentenceWithError: "Wij gaan niet nooit naar dat café.", correctedSentence: "Wij gaan nooit naar dat café.", explanation: "nooit already negates." },
      { type: "fill_in_the_blank", prompt: "Frequency adverb meaning 'usually'.", blankWord: "meestal", sentenceWithBlank: "Op zondag ontbijten wij ___ laat.", hints: ["meestal"] }
    ]
  },
  {
    id: "g-023",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "Prepositions of Time: 'om', 'in', 'op', 'tijdens', 'sinds'",
    titleNl: "Voorzetsels van Tijd",
    summary: "Clock times take om, parts of the day and dates split between in and op, tijdens covers duration of an event, and sinds marks a starting point that still holds.",
    rules: [
      "om + clock time: om acht uur, om half drie; also om de week for regular intervals.",
      "in + month, year, season, and longer spans: in januari, in 2019, in de winter, in het weekend (also op het weekend in Belgium).",
      "op + day and date: op maandag, op 14 augustus, op kerstavond; parts of a named day often keep op (op maandagochtend).",
      "tijdens + event noun (tijdens de les); sinds + starting point of a continuing state (sinds 2020, sinds gisteren). Voor can mean 'before' or duration, so do not swap it blindly for sinds."
    ],
    structuralBreakdown: "om + clock | in + month/year/season | op + day/date | tijdens + event | sinds + start of ongoing interval.",
    examples: [
      { nl: "De les begint om negen uur op dinsdag in september.", en: "The class starts at nine o'clock on Tuesday in September.", highlight: "om negen uur / op dinsdag / in september" },
      { nl: "Sinds maart werk ik thuis tijdens de vergaderingen.", en: "Since March I have been working at home during the meetings.", highlight: "Sinds maart / tijdens de vergaderingen" }
    ],
    commonMistake: "Using in maandag or om 2020 because English at/in/on do not map one-to-one.",
    correction: "Days: op maandag. Years: in 2020. Clock: om tien uur.",
    prerequisites: ["g-015", "g-011"],
    relatedRules: ["g-024"],
    tags: ["prepositions", "time", "om-in-op", "A2"],
    exercises: [
      { type: "multiple_choice", question: "Which preposition fits maandag?", options: ["in maandag", "om maandag", "op maandag", "sinds maandag (default)"], correct: 2, explanation: "Named days take op." },
      { type: "fill_in_the_blank", prompt: "Clock-time preposition.", blankWord: "om", sentenceWithBlank: "Wij eten ___ zes uur.", hints: ["clock"] },
      { type: "error_correction", sentenceWithError: "Ik ben geboren om 1998 in 5 mei.", correctedSentence: "Ik ben geboren in 1998 op 5 mei.", explanation: "Year takes in; date takes op." },
      { type: "sentence_transformation", original: "De film duurt de pauze. (wrong prep)", instruction: "Express 'during the break' with tijdens.", transformed: "tijdens de pauze", hints: ["tijdens + event"] }
    ]
  },
  {
    id: "g-024",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "Expressing Future Time with 'gaan', 'zullen', and Present Tense",
    titleNl: "Toekomst: gaan, zullen en de onvoltooid tegenwoordige tijd",
    summary: "Scheduled or imminent future is often just the present plus a time adverb; gaan + infinitive marks intention or near future; zullen is prediction, promise, or formal future—not the everyday default.",
    rules: [
      "Present + time expression covers timetables and calendars: De trein vertrekt om acht; Morgen werk ik thuis.",
      "gaan + infinitive signals planned personal future: Ik ga volgend jaar verhuizen; inversion ga je mee?",
      "zullen + infinitive is used for promises, offers, predictions, and formal writing (Het zal wel regenen; Ik zal je helpen).",
      "Do not stack gaan and zullen on one verb (*Ik zal gaan te werken); pick one construction."
    ],
    structuralBreakdown: "Present + time XP | gaan-PV + infinitive | zullen-PV + infinitive (modal/predictive).",
    examples: [
      { nl: "Morgen begint de cursus om tien uur in Utrecht.", en: "Tomorrow the course starts at ten o'clock in Utrecht.", highlight: "Morgen begint" },
      { nl: "Wij gaan in juli trouwen, en ik zal je de uitnodiging sturen.", en: "We are going to get married in July, and I will send you the invitation.", highlight: "gaan … trouwen / zal … sturen" }
    ],
    commonMistake: "Translating every English will with zullen, producing stiff Ik zal morgen werken for a simple plan.",
    correction: "Everyday plan: Ik ga morgen werken or Morgen werk ik. Reserve zullen for promise or prediction.",
    prerequisites: ["g-005", "g-017", "g-023"],
    relatedRules: ["g-016"],
    tags: ["future", "gaan", "zullen", "A2"],
    exercises: [
      { type: "multiple_choice", question: "Most natural for a personal plan 'I am going to move'.", options: ["Ik zal verhuizen.", "Ik ga verhuizen.", "Ik verhuis zal.", "Ik gaan verhuizen."], correct: 1, explanation: "gaan + infinitive for intention." },
      { type: "word_order", translation: "Tomorrow I work at home.", tokens: ["Morgen", "werk", "ik", "thuis"], correctSentence: "Morgen werk ik thuis" },
      { type: "fill_in_the_blank", prompt: "Finite zullen for ik in a promise.", blankWord: "zal", sentenceWithBlank: "Ik ___ je vanavond bellen.", hints: ["ik zal"] },
      { type: "error_correction", sentenceWithError: "Zij zal gaan te studeren in Leiden.", correctedSentence: "Zij gaat in Leiden studeren.", explanation: "One future marker; gaan + infinitive, no te." }
    ]
  },
  {
    id: "g-025",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "Continuous Aspect: 'aan het ... zijn' and Positional Verbs",
    titleNl: "De duratieve constructie en positiewerkwoorden",
    summary: "Dutch has no obligatory progressive inflection; ongoing activity is often zijn + aan het + infinitive, or a positional verb (zitten/staan/liggen/lopen) plus te + infinitive.",
    rules: [
      "aan het + infinitive requires a form of zijn: Ik ben aan het koken; Zij is de aardappels aan het schillen (object may precede aan het).",
      "The infinitive after aan het never takes te and is not conjugated.",
      "zitten/staan/liggen/lopen te + infinitive adds posture: Zij zit te lezen, Hij staat te wachten; choose the posture that fits.",
      "Stative verbs (weten, kennen, hebben as possession) rarely take aan het; use the simple present instead."
    ],
    structuralBreakdown: "zijn + (object) + aan het + INF | posture-verb + te + INF.",
    examples: [
      { nl: "Ik ben de keuken aan het schoonmaken, dus ik kan nu niet praten.", en: "I am cleaning the kitchen, so I cannot talk now.", highlight: "ben … aan het schoonmaken" },
      { nl: "Zij zit in de tuin te lezen terwijl hij bij de deur staat te wachten.", en: "She is sitting in the garden reading while he is standing at the door waiting.", highlight: "zit … te lezen / staat … te wachten" }
    ],
    commonMistake: "Calquing English -ing onto the Dutch verb (Ik ben kokend) or adding te after aan het.",
    correction: "Ik ben aan het koken or Ik zit te koken — never Ik ben kokend.",
    prerequisites: ["g-003", "g-017"],
    relatedRules: ["g-022"],
    tags: ["progressive", "aan-het", "posture-verbs", "A2"],
    exercises: [
      { type: "sentence_transformation", original: "Ik kook nu soep.", instruction: "Rewrite with zijn aan het.", transformed: "Ik ben soep aan het koken.", hints: ["ben + object + aan het + infinitive"] },
      { type: "fill_in_the_blank", prompt: "Missing piece of the progressive frame.", blankWord: "het", sentenceWithBlank: "Wij zijn aan ___ oefenen voor het examen.", hints: ["aan het"] },
      { type: "error_correction", sentenceWithError: "Hij is aan het te wachten op de bus.", correctedSentence: "Hij is op de bus aan het wachten.", explanation: "No te after aan het." },
      { type: "multiple_choice", question: "Which posture pattern means 'she is (sitting) reading'?", options: ["Zij is lezend.", "Zij zit te lezen.", "Zij zit aan lezen.", "Zij leest te zitten."], correct: 1, explanation: "zitten te + infinitive." }
    ]
  },
  {
    id: "g-026",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "Word Order in Main Clauses: Time-Manner-Place (TMP)",
    titleNl: "Woordvolgorde in de Hoofdzin: Tijd-Wijze-Plaats",
    summary: "After the finite verb, Dutch prefers time before manner before place; objects usually precede those adverbials, and a fronted adverbial still leaves the rest in TMP order.",
    rules: [
      "Canonical middle-field sketch: (indirect object) (direct object) Time Manner Place, then any verbal leftover (prefix, infinitive).",
      "Time before place: Ik ga morgen naar Amsterdam, not *Ik ga naar Amsterdam morgen as the neutral order.",
      "Manner (met de trein, snel, per ongeluk) sits between time and place: Ik ga morgen met de trein naar Amsterdam.",
      "Fronting one adverbial (Morgen ga ik met de trein naar Amsterdam) does not licence English-style stacking after the verb in a different order."
    ],
    structuralBreakdown: "Slot1 + V2 + subject? + IO + DO + Time + Manner + Place + verbal remainder.",
    examples: [
      { nl: "Ik fiets vanavond rustig naar huis.", en: "I cycle home calmly this evening.", highlight: "vanavond (T) rustig (M) naar huis (P)" },
      { nl: "Morgen reizen wij met de trein naar Groningen.", en: "Tomorrow we travel to Groningen by train.", highlight: "Morgen … met de trein naar Groningen" }
    ],
    commonMistake: "Putting place before time as in English I go to Amsterdam tomorrow (Ik ga naar Amsterdam morgen).",
    correction: "Neutral: Ik ga morgen naar Amsterdam.",
    prerequisites: ["g-006", "g-015", "g-022"],
    relatedRules: ["g-016"],
    tags: ["TMP", "word-order", "main-clause", "A2"],
    exercises: [
      { type: "word_order", translation: "I go to Amsterdam tomorrow by train.", tokens: ["Ik", "ga", "morgen", "met", "de", "trein", "naar", "Amsterdam"], correctSentence: "Ik ga morgen met de trein naar Amsterdam" },
      { type: "error_correction", sentenceWithError: "Zij werkt in Utrecht altijd hard.", correctedSentence: "Zij werkt altijd hard in Utrecht.", explanation: "Time (altijd) then manner (hard) then place (in Utrecht)." },
      { type: "multiple_choice", question: "Neutral order for time and place:", options: ["Ik ga naar school morgen.", "Ik ga morgen naar school.", "Ik morgen ga naar school.", "Naar school ik ga morgen."], correct: 1, explanation: "Time before place." },
      { type: "sentence_transformation", original: "Wij eten in de keuken om zes uur rustig.", instruction: "Restore TMP.", transformed: "Wij eten om zes uur rustig in de keuken.", hints: ["time, manner, place"] }
    ]
  },
  {
    id: "g-027",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "Independent Pronominal 'er': Existential Sentences",
    titleNl: "Onafhankelijk er: presentatieve zinnen",
    summary: "Existential er introduces a new indefinite subject and keeps the finite verb in agreement with that real subject, not with er.",
    rules: [
      "Pattern: Er + finite verb + indefinite NP (+ place/time): Er staat een fiets buiten; Er zijn veel mensen.",
      "The verb agrees with the logical noun: er is een probleem, er zijn problemen — never *er is veel mensen.",
      "Definite subjects normally do not use this presentative er (*Er is de burgemeester in de zaal); use a plain locative instead.",
      "When something else occupies slot one, er often remains as a placeholder after the verb (Buiten staat er een fiets)."
    ],
    structuralBreakdown: "Er + PV[agr with NP] + indefinite NP + locative; agreement tracks the NP, not er.",
    examples: [
      { nl: "Er staat een gele fiets voor de deur.", en: "There is a yellow bicycle in front of the door.", highlight: "Er staat een … fiets" },
      { nl: "Er zijn vanavond geen vrije tafels in het café.", en: "There are no free tables in the café this evening.", highlight: "Er zijn … tafels" }
    ],
    commonMistake: "Using singular is with a plural new subject (Er is veel studenten) on the model of English there is.",
    correction: "Agree with the noun: Er zijn veel studenten.",
    prerequisites: ["g-003", "g-007"],
    relatedRules: ["g-028"],
    tags: ["er", "existential", "agreement", "A2"],
    exercises: [
      { type: "multiple_choice", question: "Choose agreement for plural mensen.", options: ["Er is veel mensen.", "Er zijn veel mensen.", "Er heb veel mensen.", "Zijn er is veel mensen."], correct: 1, explanation: "Plural logical subject → zijn." },
      { type: "fill_in_the_blank", prompt: "Existential placeholder.", blankWord: "Er", sentenceWithBlank: "___ ligt een brief op de mat.", hints: ["presentative er"] },
      { type: "error_correction", sentenceWithError: "Er heeft een probleem in de lift.", correctedSentence: "Er is een probleem in de lift.", explanation: "Existence of a singular NP uses zijn, not hebben." },
      { type: "word_order", translation: "There are two cats in the garden.", tokens: ["Er", "zitten", "twee", "katten", "in", "de", "tuin"], correctSentence: "Er zitten twee katten in de tuin" }
    ]
  },
  {
    id: "g-028",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "Partitive 'er': Counting and Quantifying",
    titleNl: "Partitief er bij hoeveelheden",
    summary: "When a number or quantity stands without its noun, Dutch usually keeps a partitive er that points back to that noun.",
    rules: [
      "Full NP: Ik heb drie appels. Partitive: Ik heb er drie — er replaces the missing noun, not the number.",
      "er + quantifier works with veel, weinig, genoeg, geen, hoeveel, een paar: Heb je nog koffie? Ik heb er nog genoeg.",
      "If the noun is still expressed, do not add this er (*Ik heb er drie appels) except in some southern/informal varieties; standard teaching drops it.",
      "Partitive er is not the same as existential er or prepositional er (erop); it can co-occur with a subject (Wij hebben er twee)."
    ],
    structuralBreakdown: "Subject + PV + er + numeral/quantifier (noun elided); no extra copy of the noun in the standard pattern.",
    examples: [
      { nl: "Hoeveel fietsen hebben jullie? Wij hebben er twee.", en: "How many bicycles do you have? We have two (of them).", highlight: "er twee" },
      { nl: "Ik wou appels kopen, maar ik zag er geen in de winkel.", en: "I wanted to buy apples, but I saw none in the shop.", highlight: "er geen" }
    ],
    commonMistake: "Omitting er (Ik heb drie) when the noun is not repeated, or doubling it (Ik heb er drie appels).",
    correction: "Noun gone: Ik heb er drie. Noun present: Ik heb drie appels.",
    prerequisites: ["g-011", "g-027"],
    relatedRules: ["g-029"],
    tags: ["er", "partitive", "quantifiers", "A2"],
    exercises: [
      { type: "fill_in_the_blank", prompt: "Partitive er before the numeral.", blankWord: "er", sentenceWithBlank: "Aardappels? Ik schil ___ nog vijf.", hints: ["elided noun"] },
      { type: "multiple_choice", question: "Standard reply to 'Heb je pennen?' meaning you have four.", options: ["Ik heb vier.", "Ik heb er vier.", "Ik heb er vier pennen.", "Ik vier er heb."], correct: 1, explanation: "er + number, noun omitted." },
      { type: "error_correction", sentenceWithError: "Wij kopen er zes broodjes extra broodjes.", correctedSentence: "Wij kopen er zes extra.", explanation: "Do not keep the noun after partitive er." },
      { type: "sentence_transformation", original: "Ik heb drie katten.", instruction: "Answer without repeating katten.", transformed: "Ik heb er drie.", hints: ["insert er"] }
    ]
  },
  {
    id: "g-029",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "Indefinite Pronouns: 'iemand', 'niemand', 'iets', 'niets', 'alles'",
    titleNl: "Onbepaalde Voornaamwoorden",
    summary: "Person and thing indefinites are standalone pronouns; the negative members already contain negation, so they do not combine with extra niet/geen on the same constituent.",
    rules: [
      "Persons: iemand (someone), niemand (no one), iedereen (everyone). Things: iets (something), niets/niks (nothing), alles (everything).",
      "Adjectives after iets/niets/iemand often take -s: iets leuks, niets bijzonders, iemand aardigs.",
      "niemand and niets are negative; do not add niet (*Ik zie niet niemand). Geen is for nouns, not these pronouns.",
      "They occupy object or subject slots like full NPs and can invert (Kent iemand dit adres?)."
    ],
    structuralBreakdown: "Indefinite pronoun as NP; iets/niets + Adj-s; negative members block a second negator.",
    examples: [
      { nl: "Iemand heeft iets leuks op tafel gelegd, maar niemand weet wat.", en: "Someone has put something nice on the table, but nobody knows what.", highlight: "Iemand / iets leuks / niemand" },
      { nl: "Ik heb niets gezien en alles al opgeruimd.", en: "I have seen nothing and have already tidied everything.", highlight: "niets / alles" }
    ],
    commonMistake: "Saying niet iemand or iets leuk without -s, or using geen iemand as the default for 'nobody'.",
    correction: "nobody = niemand; something funny = iets leuks.",
    prerequisites: ["g-007", "g-002"],
    relatedRules: ["g-028"],
    tags: ["indefinites", "iemand", "iets", "A2"],
    exercises: [
      { type: "multiple_choice", question: "How do you say 'nothing special'?", options: ["niet iets speciaal", "niets bijzonders", "geen iets bijzonder", "niets bijzonder"], correct: 1, explanation: "niets + adjective-s." },
      { type: "fill_in_the_blank", prompt: "Negative person pronoun.", blankWord: "niemand", sentenceWithBlank: "Er is ___ thuis op dit uur.", hints: ["no one"] },
      { type: "error_correction", sentenceWithError: "Ik ken niet iemand in dit dorp.", correctedSentence: "Ik ken niemand in dit dorp.", explanation: "Use niemand, not niet iemand." },
      { type: "sentence_transformation", original: "Ik zoek een leuk ding.", instruction: "Replace with iets + adjective-s.", transformed: "Ik zoek iets leuks.", hints: ["iets leuks"] }
    ]
  },
  {
    id: "g-030",
    section: 2,
    sectionTitle: "A1–A2 Core Grammar",
    level: "A2",
    title: "Fixed Prepositional Objects with Verbs",
    titleNl: "Vaste Voorzetselvoorwerpen",
    summary: "Many verbs select a fixed preposition that must be learned with the verb; swapping in a spatial guess (denken om for denken aan) is a frequent error.",
    rules: [
      "High-frequency pairs: wachten op, luisteren naar, kijken naar, houden van, denken aan, praten over, beginnen met, zoeken naar.",
      "The preposition is lexical, not a free place adverb: Ik wacht op de bus even if you are not literally 'on' the bus.",
      "When the object is a clause or infinitive, the same preposition often remains (Ik denk eraan dat…, Ik houd ervan om…) — er + preposition is taught more fully later.",
      "Do not drop the preposition on the English model (*Ik wacht de bus) and do not translate look at as kijken aan."
    ],
    structuralBreakdown: "Verb + fixed P + NP (or er+P + clause); P is selected, not computed from space.",
    examples: [
      { nl: "Wij wachten op de tram en luisteren naar de podcast.", en: "We wait for the tram and listen to the podcast.", highlight: "wachten op / luisteren naar" },
      { nl: "Zij houdt van jazz en denkt vaak aan haar leraar.", en: "She loves jazz and often thinks of her teacher.", highlight: "houdt van / denkt … aan" }
    ],
    commonMistake: "Ik wacht de bus or Ik denk om jou because wait and think of use different English prepositions.",
    correction: "wachten op de bus; denken aan jou; houden van jazz; kijken naar de film.",
    prerequisites: ["g-015", "g-005"],
    relatedRules: ["g-016"],
    tags: ["prepositional-objects", "collocations", "A2"],
    exercises: [
      { type: "multiple_choice", question: "Which preposition does wachten select?", options: ["wachten aan", "wachten op", "wachten naar", "wachten van"], correct: 1, explanation: "wachten op + NP." },
      { type: "fill_in_the_blank", prompt: "Preposition after houden (to like).", blankWord: "van", sentenceWithBlank: "Houden jullie ___ oude films?", hints: ["houden van"] },
      { type: "error_correction", sentenceWithError: "Ik denk vaak om mijn ouders.", correctedSentence: "Ik denk vaak aan mijn ouders.", explanation: "denken aan, not om." },
      { type: "word_order", translation: "They are looking at the painting.", tokens: ["Zij", "kijken", "naar", "het", "schilderij"], correctSentence: "Zij kijken naar het schilderij" }
    ]
  }
];
