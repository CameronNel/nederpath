export const lessons = [
  {
    id: "g-001",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Dutch Sounds, Syllable Structure, and Spelling Rules",
    titleNl: "Klanken, Lettergrepen en Spellingsregels",
    summary: "Dutch spelling encodes vowel length by syllable type: a single vowel letter is long in an open syllable and short in a closed one, so adding a suffix often forces vowel or consonant doubling.",
    rules: [
      "An open syllable ends in a vowel letter; there a single a, e, o, or u is pronounced long (bo-men, ma-ken).",
      "A closed syllable ends in a consonant; a long vowel then needs two letters (boom, maan) while one letter stays short (bom, man).",
      "When a short-vowel stem takes a vowel-initial suffix, double the final consonant so the first syllable stays closed (kat → katten, zit → zitten).",
      "When a long-vowel closed stem opens up, drop one vowel letter (boot → boten, raam → ramen) rather than writing booten.",
      "Stem-final v and z become f and s at the end of a written syllable (leven → leef, lezen → lees), then the long vowel is shown by doubling if the syllable is closed."
    ],
    structuralBreakdown: "Closed CVC short vs closed CVVC long vs open CV- long; suffixation flips openness and triggers doubling or degemination.",
    examples: [
      { nl: "Naast die ene boom staan drie bomen, geen boomen.", en: "Beside that one tree stand three trees, not 'boomen'.", highlight: "boom → bo-men" },
      { nl: "Ik lees een boek, maar wij lezen samen de krant.", en: "I read a book, but we read the newspaper together.", highlight: "lees / lezen (z → s)" }
    ],
    commonMistake: "Writing booten or katen because the singular looks like the plural stem.",
    correction: "Open the long-vowel syllable (boten) and keep the short vowel closed by doubling (katten).",
    prerequisites: [],
    relatedRules: ["g-005", "g-008"],
    tags: ["spelling", "syllables", "vowel-length", "A1"],
    exercises: [
      { type: "multiple_choice", question: "What is the regular plural spelling of boom (tree)?", options: ["boomen", "bomen", "bommen", "booms"], correct: 1, explanation: "bo-men is open, so one o already marks the long vowel." },
      { type: "fill_in_the_blank", prompt: "Write the plural of man (person).", blankWord: "mannen", sentenceWithBlank: "Er staan drie ___ bij de bushalte.", hints: ["double n after short a"] },
      { type: "error_correction", sentenceWithError: "In de haven liggen veel booten.", correctedSentence: "In de haven liggen veel boten.", explanation: "The second syllable of bo-ten is open; drop one o." },
      { type: "typed_conjugation", infinitive: "lezen", subject: "ik", targetTense: "present", correctForm: "lees", explanation: "Syllable-final z becomes s and the long vowel is written ee." }
    ]
  },
  {
    id: "g-002",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Personal Pronouns: Subject, Object, and Reduced Forms",
    titleNl: "Persoonlijke Voornaamwoorden",
    summary: "Dutch pairs full, stressed pronouns with reduced unstressed forms; object hen, hun, and ze are not interchangeable, and hun is not the default object pronoun.",
    rules: [
      "Subject set: ik, jij/je, u, hij (spoken ie after a verb), zij/ze, het/'t, wij/we, jullie, zij/ze; use jij, wij, zij for contrast.",
      "Unstressed object and after verbs in speech: me, je, 'm, d'r/'r, 't, ons, jullie, and especially ze for third-person plural.",
      "Traditional written hen is used as a direct object and after a preposition (Ik zie hen; met hen); hun as object is widely used but is not the school-book default.",
      "Hun as a dative (Ik geef hun een boek) is the traditional written slot; spoken Dutch overwhelmingly prefers ze for plural objects."
    ],
    structuralBreakdown: "Stressed full form vs clitic reduced form; 3pl object hen (prep/DO, formal) vs hun (traditional IO) vs ze (neutral spoken).",
    examples: [
      { nl: "Wij gaan naar de markt, maar zij blijven thuis.", en: "We are going to the market, but they are staying home.", highlight: "Wij / zij (contrast)" },
      { nl: "Heb je me gisteren nog gezien bij hen thuis?", en: "Did you still see me yesterday at their place?", highlight: "je, me, hen (after preposition)" }
    ],
    commonMistake: "Treating hun as the ordinary object pronoun in every slot (Ik zie hun).",
    correction: "Prefer ze in speech (Ik zie ze); use hen after a preposition and as a careful direct object (met hen, Ik nodig hen uit).",
    prerequisites: ["g-001"],
    relatedRules: ["g-009", "g-019"],
    tags: ["pronouns", "clitics", "hen-hun-ze", "A1"],
    exercises: [
      { type: "multiple_choice", question: "Which reduced subject form matches unstressed wij?", options: ["ons", "we", "ze", "hun"], correct: 1, explanation: "we is the everyday unstressed partner of wij." },
      { type: "fill_in_the_blank", prompt: "After the preposition met, choose the traditional 3pl object.", blankWord: "hen", sentenceWithBlank: "Ik ga vanavond met ___ naar de film.", hints: ["hen after a preposition"] },
      { type: "word_order", translation: "Do you see me at the station?", tokens: ["Zie", "je", "me", "op", "het", "station"], correctSentence: "Zie je me op het station" },
      { type: "error_correction", sentenceWithError: "Ik wacht op hun bij de ingang.", correctedSentence: "Ik wacht op hen bij de ingang.", explanation: "After a preposition, traditional usage wants hen, not hun." }
    ]
  },
  {
    id: "g-003",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Present Tense of 'zijn' and 'hebben'",
    titleNl: "De Werkwoorden 'zijn' en 'hebben'",
    summary: "Zijn and hebben are irregular present-tense auxiliaries; inversion with jij/je drops the -t, while u keeps a second-person ending.",
    rules: [
      "Zijn: ik ben, jij/u bent, hij/zij/het is, wij/jullie/zij zijn; there is no *ik zij or *wij ben.",
      "Hebben: ik heb, jij hebt, u hebt or u heeft, hij/zij/het heeft, wij/jullie/zij hebben.",
      "Yes-no inversion with je drops -t: ben je, heb je, never bent je or hebt je.",
      "Polite u keeps the ending: bent u, hebt u / heeft u; do not apply the jij-drop rule to u."
    ],
    structuralBreakdown: "Subject + irregular PV (ben/bent/is/zijn or heb/hebt/heeft/hebben); je-inversion uses the t-less stem.",
    examples: [
      { nl: "Ik ben student en ik heb twee fietsen in de schuur.", en: "I am a student and I have two bicycles in the shed.", highlight: "ben, heb" },
      { nl: "Ben je vandaag vrij, of heeft u nog een vergadering?", en: "Are you free today, or do you (formal) still have a meeting?", highlight: "Ben je / heeft u" }
    ],
    commonMistake: "Saying bent je or hebt je because the dictionary form is bent/hebt.",
    correction: "Drop the -t only with inverted je/jij: ben je, heb je; keep bent u and hebt/heeft u.",
    prerequisites: ["g-002"],
    relatedRules: ["g-005", "g-006"],
    tags: ["zijn", "hebben", "auxiliaries", "A1"],
    exercises: [
      { type: "typed_conjugation", infinitive: "zijn", subject: "jij (inversion)", targetTense: "present", correctForm: "ben", explanation: "Inverted je takes ben, not bent." },
      { type: "fill_in_the_blank", prompt: "Conjugate hebben for hij.", blankWord: "heeft", sentenceWithBlank: "Hij ___ een nieuwe fiets in de stalling.", hints: ["third person singular"] },
      { type: "multiple_choice", question: "Which form is correct after wij with zijn?", options: ["bent", "is", "zijn", "ben"], correct: 2, explanation: "All plural subjects take zijn." },
      { type: "error_correction", sentenceWithError: "Hebt je honger na de les?", correctedSentence: "Heb je honger na de les?", explanation: "Inversion with je drops the -t on hebt." }
    ]
  },
  {
    id: "g-004",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Definite and Indefinite Articles: 'de', 'het', and 'een'",
    titleNl: "Lidwoorden: de, het en een",
    summary: "Dutch splits definite articles by gender (de common, het neuter) while een is gender-neutral; two hard rules override guessing: every plural is de, every diminutive is het.",
    rules: [
      "Common-gender singulars take de (de tafel, de fiets); neuter singulars take het (het huis, het kind); een marks any indefinite singular.",
      "Every plural noun takes de, even if the singular was het: het huis → de huizen, het kind → de kinderen.",
      "Every diminutive takes het: het huisje, het tafeltje, het meisje; this is morphological, not semantic.",
      "Ending heuristics help but leak: -ing, -heid, -schap, -teit often de; -isme, -ment, -um often het; compounds inherit the last noun's gender (de auto + het wiel → het autowiel)."
    ],
    structuralBreakdown: "de + common sg | het + neuter sg | de + any plural | het + any diminutive | een + any indefinite sg.",
    examples: [
      { nl: "De tafel staat in het huisje achter de tuin.", en: "The table stands in the little house behind the garden.", highlight: "De tafel / het huisje" },
      { nl: "Het kind leest de boeken in het huis van de buren.", en: "The child is reading the books in the neighbours' house.", highlight: "het kind, de boeken, het huis" }
    ],
    commonMistake: "Keeping het on a plural because the singular was het (het huizen).",
    correction: "Switch to de for every plural: de huizen, de kinderen.",
    prerequisites: ["g-001"],
    relatedRules: ["g-008", "g-010", "g-018"],
    tags: ["articles", "gender", "de-het", "A1"],
    exercises: [
      { type: "article_selection", noun: "meisje", meaning: "girl (diminutive of mei(d))", correct: "het", explanation: "All diminutives take het." },
      { type: "article_selection", noun: "kinderen", meaning: "children (plural)", correct: "de", explanation: "All plurals take de." },
      { type: "multiple_choice", question: "Which article belongs with vereniging (association, -ing)?", options: ["het", "de", "der", "den"], correct: 1, explanation: "Nouns in -ing are typically de-words." },
      { type: "fill_in_the_blank", prompt: "Choose de or het before kantoor (office, neuter).", blankWord: "het", sentenceWithBlank: "Wij werken elke dag in ___ kantoor.", hints: ["neuter singular"] }
    ]
  },
  {
    id: "g-005",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Regular Present Tense Verb Conjugation",
    titleNl: "Tegenwoordige Tijd: Regelmatige Werkwoorden",
    summary: "Regular presents use the stem for ik, stem + t for jij/u/hij, and the infinitive for all plurals, with spelling repairs and a special t-drop when je inverts.",
    rules: [
      "Strip -en from the infinitive and repair the stem: maken → maak, wonen → woon, leven → leef, reizen → reis.",
      "ik takes the bare stem (ik werk, ik woon); jij, u, hij, zij, het add -t unless the stem already ends in t (hij zit, not zitt).",
      "Inverted je/jij drops that -t: woon je, werk je; inverted u keeps it: woont u, werkt u.",
      "wij, jullie, and zij take the full infinitive (wij werken, jullie wonen), not a stem plus -en rebuilt from ik."
    ],
    structuralBreakdown: "ik = stem | jij/u/hij = stem+t | inverted je = stem | inverted u = stem+t | plural = infinitive.",
    examples: [
      { nl: "Ik woon in Utrecht, maar zij woont in Groningen.", en: "I live in Utrecht, but she lives in Groningen.", highlight: "woon / woont" },
      { nl: "Woon je nog in die straat, of woont u al ergens anders?", en: "Do you still live in that street, or do you (formal) already live elsewhere?", highlight: "Woon je / woont u" }
    ],
    commonMistake: "Keeping the -t on inverted je (woont je?) or dropping it on u (woon u?).",
    correction: "woon je? but woont u?; the t-drop is only for je/jij.",
    prerequisites: ["g-001", "g-003"],
    relatedRules: ["g-006", "g-016"],
    tags: ["present-tense", "conjugation", "t-drop", "A1"],
    exercises: [
      { type: "typed_conjugation", infinitive: "wonen", subject: "hij", targetTense: "present", correctForm: "woont", explanation: "Third person adds -t to the stem woon." },
      { type: "typed_conjugation", infinitive: "werken", subject: "je (inversion)", targetTense: "present", correctForm: "werk", explanation: "Inverted je uses the bare stem." },
      { type: "multiple_choice", question: "Which inverted question is correct for formal u with maken?", options: ["Maak u koffie?", "Maakt u koffie?", "Maken u koffie?", "Maakte u koffie?"], correct: 1, explanation: "u keeps the -t: maakt u." },
      { type: "error_correction", sentenceWithError: "Woont je nog bij je ouders?", correctedSentence: "Woon je nog bij je ouders?", explanation: "Drop -t when je follows the verb." }
    ]
  },
  {
    id: "g-006",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Subject-Verb Inversion in Questions and Fronted Sentences",
    titleNl: "Inversie bij Vragen en Aanloop",
    summary: "Dutch main clauses keep the finite verb in second position: if anything but the subject comes first, the subject flips after the verb.",
    rules: [
      "Neutral statements are Subject–FiniteVerb–rest (Ik drink koffie in de keuken).",
      "Yes-no questions start with the finite verb, then the subject (Drink jij koffie?).",
      "A fronted time, place, object, or adverb still occupies slot one, so the verb stays second and the subject follows it (Vandaag drink ik koffie).",
      "After inversion, je/jij loses present -t (Drink je koffie?) while u keeps it (Drinkt u koffie?)."
    ],
    structuralBreakdown: "Slot1 (subject or fronted XP) + finite V2 + subject if Slot1 was not the subject + remainder.",
    examples: [
      { nl: "Morgen fiets ik naar school, maar fiets jij dan mee?", en: "Tomorrow I cycle to school, but are you cycling along then?", highlight: "Morgen fiets ik / fiets jij" },
      { nl: "In Amsterdam woont u al jaren bij het park.", en: "In Amsterdam you (formal) have lived by the park for years.", highlight: "In Amsterdam woont u" }
    ],
    commonMistake: "Leaving English SVO after a fronted adverb: Morgen ik fiets naar school.",
    correction: "After morgen the finite verb must come next: Morgen fiets ik naar school.",
    prerequisites: ["g-005"],
    relatedRules: ["g-014", "g-026"],
    tags: ["inversion", "V2", "word-order", "A1"],
    exercises: [
      { type: "word_order", translation: "Tomorrow Jan goes to the market.", tokens: ["Morgen", "gaat", "Jan", "naar", "de", "markt"], correctSentence: "Morgen gaat Jan naar de markt" },
      { type: "sentence_transformation", original: "Jij drinkt thee in de tuin.", instruction: "Turn this into a yes-no question with je.", transformed: "Drink je thee in de tuin?", hints: ["verb first", "drop -t"] },
      { type: "error_correction", sentenceWithError: "Vandaag ik ga naar de markt.", correctedSentence: "Vandaag ga ik naar de markt.", explanation: "Fronted vandaag forces ga before ik." },
      { type: "multiple_choice", question: "After fronted gisteren, which order is grammatical?", options: ["Gisteren hij werkte laat.", "Gisteren werkte hij laat.", "Gisteren laat hij werkte.", "Werkt gisteren hij laat."], correct: 1, explanation: "Finite verb stays in second position." }
    ]
  },
  {
    id: "g-007",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Negation with 'niet' vs 'geen'",
    titleNl: "Ontkenning: niet en geen",
    summary: "Geen replaces an indefinite article or bare plural/mass noun; niet negates verbs, adjectives, adverbs, and definite or already determined noun phrases.",
    rules: [
      "Use geen before an indefinite noun phrase: geen fiets, geen tijd, geen kinderen (it occupies the een/∅ slot).",
      "Use niet to negate the verb or the whole predicate when the object is definite or missing: Ik fiets niet; Ik zie de fiets niet.",
      "Niet typically stands after objects and before most adjectives/adverbs and prepositional phrases (Ik ben niet moe; Hij woont niet in Leiden).",
      "Do not stack een + niet on a noun (*een niet fiets); switch the determiner to geen."
    ],
    structuralBreakdown: "geen + undetermined NP vs niet after determined NP / on V, Adj, Adv, PP.",
    examples: [
      { nl: "Ik heb geen auto, dus ik fiets naar mijn werk.", en: "I have no car, so I cycle to work.", highlight: "geen auto" },
      { nl: "Ik heb de auto niet, want hij staat bij de garage.", en: "I do not have the car, because it is at the garage.", highlight: "de auto niet" }
    ],
    commonMistake: "Saying Ik heb niet een auto or Ik zie niet de man as the default pattern.",
    correction: "Indefinite: Ik heb geen auto. Definite object: Ik zie de man niet.",
    prerequisites: ["g-004", "g-005"],
    relatedRules: ["g-029"],
    tags: ["negation", "niet", "geen", "A1"],
    exercises: [
      { type: "multiple_choice", question: "How do you say 'I have no time'?", options: ["Ik heb niet tijd.", "Ik heb geen tijd.", "Ik heb niet een tijd.", "Ik heb tijd niet."], correct: 1, explanation: "Bare/indefinite tijd takes geen." },
      { type: "fill_in_the_blank", prompt: "Negate the definite object de sleutel.", blankWord: "niet", sentenceWithBlank: "Ik vind de sleutel ___ in mijn tas.", hints: ["definite NP → niet"] },
      { type: "error_correction", sentenceWithError: "Wij hebben niet een hond.", correctedSentence: "Wij hebben geen hond.", explanation: "een + negation becomes geen." },
      { type: "sentence_transformation", original: "Zij is moe na het werk.", instruction: "Negate the adjective moe.", transformed: "Zij is niet moe na het werk.", hints: ["niet before the adjective"] }
    ]
  },
  {
    id: "g-008",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Regular Plural Formation of Nouns: '-en' vs '-s' vs '-eren'",
    titleNl: "Meervoud van Zelfstandige Naamwoorden",
    summary: "Most Dutch nouns pluralise with -en (with the same spelling repairs as verbs); -s is common after unstressed endings, and a small closed set takes -eren.",
    rules: [
      "Default plural is -en: boek → boeken, stoel → stoelen; apply open/closed spelling (boom → bomen, kat → katten).",
      "Prefer -s after unstressed -el, -em, -en, -er, -ie, and after many vowels (tafel → tafels, jongen → jongens, auto → auto's with apostrophe).",
      "A small set of old neuters takes -eren: kind → kinderen, ei → eieren, blad → bladeren (also bladen in some senses).",
      "Both -s and -en can be attested on a few nouns; learn the common member rather than inventing a third suffix."
    ],
    structuralBreakdown: "N-stem + -en (spelling repair) | unstressed final syllable + -s / -'s | closed set + -eren.",
    examples: [
      { nl: "De tafels en de stoelen staan in twee kamers.", en: "The tables and the chairs stand in two rooms.", highlight: "tafels (-s), stoelen (-en)" },
      { nl: "De kinderen zoeken de eieren achter de bomen.", en: "The children look for the eggs behind the trees.", highlight: "kinderen, eieren, bomen" }
    ],
    commonMistake: "Adding -en to every noun (tafelen) or forgetting consonant doubling (katen).",
    correction: "tafel → tafels; kat → katten; kind → kinderen.",
    prerequisites: ["g-001", "g-004"],
    relatedRules: ["g-018"],
    tags: ["plurals", "morphology", "nouns", "A1"],
    exercises: [
      { type: "multiple_choice", question: "What is the ordinary plural of tafel?", options: ["tafelen", "tafels", "tafelens", "taferen"], correct: 1, explanation: "Unstressed -el usually takes -s." },
      { type: "fill_in_the_blank", prompt: "Plural of kind.", blankWord: "kinderen", sentenceWithBlank: "De ___ spelen buiten in de tuin.", hints: ["-eren set"] },
      { type: "error_correction", sentenceWithError: "Achter het huis staan drie boomen.", correctedSentence: "Achter het huis staan drie bomen.", explanation: "Open syllable: bomen, not boomen." },
      { type: "sentence_transformation", original: "Ik zie één ei in de kom.", instruction: "Make the noun plural and adjust the article.", transformed: "Ik zie de eieren in de kom.", hints: ["ei → eieren", "plural article de"] }
    ]
  },
  {
    id: "g-009",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Possessive Pronouns and Reduced Forms",
    titleNl: "Bezittelijke Voornaamwoorden",
    summary: "Possessives agree only in the ons/onze pair; other persons have one written form plus reduced spoken variants, and hun is the 3pl possessive, not a default object.",
    rules: [
      "Full set: mijn, jouw, uw, zijn, haar, ons/onze, jullie, hun; reduced speech: m'n, je, z'n, d'r.",
      "Ons appears only before a singular het-noun (ons huis); onze appears before de-words and all plurals (onze fiets, onze huizen).",
      "Jouw is the stressed/written 2sg; unstressed attributive form is usually je (je tas), not jouw, unless you contrast.",
      "Hun + noun means 'their' (hun fiets). Do not recycle that hun as your default object pronoun (see g-002)."
    ],
    structuralBreakdown: "Poss + N; only ons (het-sg) vs onze (de / plural) inflects; je is the unstressed partner of jouw.",
    examples: [
      { nl: "Ons huis is klein, maar onze tuin is groot.", en: "Our house is small, but our garden is large.", highlight: "Ons huis / onze tuin" },
      { nl: "Is dit je fiets of jouw auto daar achter?", en: "Is this your bike, or your car back there?", highlight: "je (unstressed) / jouw (contrast)" }
    ],
    commonMistake: "Writing onze huis or using hun as 'them' because it looks like a possessive you already know.",
    correction: "het-noun: ons huis; de-noun: onze fiets; 'their car' = hun auto; 'I see them' = Ik zie ze / hen.",
    prerequisites: ["g-002", "g-004"],
    relatedRules: ["g-012"],
    tags: ["possessives", "ons-onze", "A1"],
    exercises: [
      { type: "multiple_choice", question: "Which form is correct before huis (het)?", options: ["onze huis", "ons huis", "onsen huis", "onzehuizen"], correct: 1, explanation: "Singular het-nouns take unsuffixed ons." },
      { type: "fill_in_the_blank", prompt: "Possessive for wij before fiets (de).", blankWord: "onze", sentenceWithBlank: "___ fiets staat in de schuur.", hints: ["de-word → onze"] },
      { type: "error_correction", sentenceWithError: "Onze huis heeft een rode deur.", correctedSentence: "Ons huis heeft een rode deur.", explanation: "huis is het, so ons not onze." },
      { type: "word_order", translation: "Their children play in our garden.", tokens: ["Hun", "kinderen", "spelen", "in", "onze", "tuin"], correctSentence: "Hun kinderen spelen in onze tuin" }
    ]
  },
  {
    id: "g-010",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Demonstrative Pronouns: 'deze', 'die', 'dit', and 'dat'",
    titleNl: "Aanwijzende Voornaamwoorden",
    summary: "Dutch demonstratives split by distance and by the de/het contrast: deze/dit are proximal, die/dat distal, and plurals always take a de-form.",
    rules: [
      "Near the speaker: deze + de-noun or any plural (deze stoel, deze huizen); dit + singular het-noun (dit huis).",
      "Farther or already known: die + de-noun/plural (die stoel, die huizen); dat + singular het-noun (dat huis).",
      "The same four words can stand alone as pronouns (Ik wil deze, niet die) and still respect gender/number of the referent.",
      "Dat also introduces clauses (Ik weet dat hij komt); that clausal dat is not a demonstrative of a noun and is taught separately."
    ],
    structuralBreakdown: "Proximal deze (de/pl) / dit (het-sg) vs distal die (de/pl) / dat (het-sg).",
    examples: [
      { nl: "Deze stoel is nieuw, maar dat huis daar is oud.", en: "This chair is new, but that house over there is old.", highlight: "Deze stoel / dat huis" },
      { nl: "Wil je dit boek of die boeken op de plank?", en: "Do you want this book or those books on the shelf?", highlight: "dit boek / die boeken" }
    ],
    commonMistake: "Using dit or dat with a plural (dit stoelen) because English this/that ignore gender.",
    correction: "Plurals take deze (near) or die (far): deze stoelen, die huizen.",
    prerequisites: ["g-004"],
    relatedRules: ["g-012"],
    tags: ["demonstratives", "deze-die-dit-dat", "A1"],
    exercises: [
      { type: "multiple_choice", question: "Which demonstrative fits a nearby het-noun boek?", options: ["deze boek", "die boek", "dit boek", "deze boeken"], correct: 2, explanation: "Singular het takes dit when near." },
      { type: "fill_in_the_blank", prompt: "Distal demonstrative before huizen (plural).", blankWord: "die", sentenceWithBlank: "___ huizen aan de overkant zijn te koop.", hints: ["plural → die/deze; far → die"] },
      { type: "error_correction", sentenceWithError: "Dit stoelen zijn te zwaar.", correctedSentence: "Deze stoelen zijn te zwaar.", explanation: "Plural needs deze, not dit." },
      { type: "sentence_transformation", original: "Het kind speelt in de tuin.", instruction: "Point to a nearby child with a demonstrative.", transformed: "Dit kind speelt in de tuin.", hints: ["kind is het", "near → dit"] }
    ]
  },
  {
    id: "g-011",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Cardinal and Ordinal Numbers",
    titleNl: "Hoofdtelwoorden en Rangtelwoorden",
    summary: "Dutch cardinals are the counting forms; ordinals add -de or -ste and then behave like adjectives that almost always take -e before a noun.",
    rules: [
      "Learn the irregular low cardinals (één, twee, drie, vier, acht, tien) and the linking en inside 21–99 (eenentwintig, not twintig-een).",
      "Tens + units are written as one word with the unit first: vijfendertig = 35; honderd and duizend follow the noun they count without extra of.",
      "Most ordinals take -de (vierde, negende); 1, 8 and multiples of 10 take -ste (eerste, achtste, twintigste).",
      "Attributive ordinals take the usual adjective -e: de eerste trein, het tweede huis; as adverbs they stay bare (Hij kwam eerst)."
    ],
    structuralBreakdown: "Cardinal: unit+en+ten as one word | Ordinal: stem + -de/-ste (+ adjectival -e before N).",
    examples: [
      { nl: "Ik ben vijfentwintig en woon op de vierde verdieping.", en: "I am twenty-five and live on the fourth floor.", highlight: "vijfentwintig / vierde" },
      { nl: "De eerste bus komt om acht uur, de tweede pas om tien uur.", en: "The first bus comes at eight o'clock, the second only at ten.", highlight: "eerste / tweede" }
    ],
    commonMistake: "Building teens and twenties on an English pattern (twintig-vijf) or saying *eende for eerste.",
    correction: "35 is vijfendertig; 1st is eerste; 8th is achtste.",
    prerequisites: ["g-004", "g-012"],
    relatedRules: ["g-023"],
    tags: ["numbers", "ordinals", "A1"],
    exercises: [
      { type: "multiple_choice", question: "How do you write 21 as a Dutch cardinal?", options: ["twintigeen", "eentwintig", "eenentwintig", "twintig en een"], correct: 2, explanation: "Unit + en + ten as one word." },
      { type: "fill_in_the_blank", prompt: "Ordinal for 1 before trein.", blankWord: "eerste", sentenceWithBlank: "De ___ trein naar Leiden is al weg.", hints: ["irregular eerste"] },
      { type: "error_correction", sentenceWithError: "Wij wonen op de twee verdieping.", correctedSentence: "Wij wonen op de tweede verdieping.", explanation: "Floor numbers use ordinals: tweede." },
      { type: "fill_in_the_blank", prompt: "Ordinal for 8 before verdieping.", blankWord: "achtste", sentenceWithBlank: "Zij wonen op de ___ verdieping.", hints: ["8 takes -ste, not -de"] }
    ]
  },
  {
    id: "g-012",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Adjective Endings: The Basic '-e' Rule",
    titleNl: "Bijvoeglijke Naamwoorden: de e-regel",
    summary: "Attributive adjectives usually take -e, but the ending is dropped after een/geen/ieder unstressed indefinite before a singular het-noun.",
    rules: [
      "After de, deze, die, possessives, and with every plural, the adjective takes -e: de grote tafel, mijn oude fiets, grote huizen.",
      "After het, dit, dat plus a definite reading, the adjective also takes -e: het grote huis, dit nieuwe boek.",
      "After een, geen, or zero article before a singular het-noun, the adjective stays bare: een groot huis, geen leuk boek.",
      "Predicative adjectives never take this -e: Het huis is groot. Some material adjectives (houten, zilveren) keep -en in all attributive slots."
    ],
    structuralBreakdown: "de/het-definite/poss/plural + Adj-e + N vs een/geen + Adj∅ + het-sg N vs predicative Adj∅.",
    examples: [
      { nl: "Het grote huis is duur, maar een groot huis zoeken we nog.", en: "The large house is expensive, but we are still looking for a large house.", highlight: "het grote / een groot" },
      { nl: "De rode fiets en mijn oude jas hangen in de schuur.", en: "The red bicycle and my old coat hang in the shed.", highlight: "rode / oude" }
    ],
    commonMistake: "Writing een grote huis because de grote huis felt parallel.",
    correction: "Indefinite neuter singular: een groot huis; definite: het grote huis.",
    prerequisites: ["g-004", "g-009"],
    relatedRules: ["g-018", "g-021"],
    tags: ["adjectives", "inflection", "e-rule", "A1"],
    exercises: [
      { type: "multiple_choice", question: "Which phrase is correct for an indefinite neuter huis?", options: ["een grote huis", "een groot huis", "een groote huis", "groot een huis"], correct: 1, explanation: "een + het-noun: no -e." },
      { type: "fill_in_the_blank", prompt: "Inflect mooi before het boek in a definite phrase.", blankWord: "mooie", sentenceWithBlank: "Ik lees het ___ boek vanavond.", hints: ["definite het → -e"] },
      { type: "error_correction", sentenceWithError: "Wij kopen een dure huis in het dorp.", correctedSentence: "Wij kopen een duur huis in het dorp.", explanation: "huis is het; indefinite drops -e and uses duur." },
      { type: "sentence_transformation", original: "Het huis is klein.", instruction: "Put klein attributively after het.", transformed: "het kleine huis", hints: ["definite het takes -e"] }
    ]
  },
  {
    id: "g-013",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Coordinating Conjunctions: 'en', 'maar', 'of', 'want', 'dus'",
    titleNl: "Nevenschikkende Voegwoorden",
    summary: "En, maar, of, want, and dus join two main clauses without sending the verb to the end; want is the because-coordinator, unlike subordinating omdat.",
    rules: [
      "En adds; maar contrasts; of offers an alternative (inclusive or exclusive depending on context).",
      "Want gives a reason and is coordinating: Ik blijf thuis, want ik ben ziek — finite verb stays in second position in the second clause.",
      "Dus marks a consequence and is often coordinating (Ik ben ziek, dus ik blijf thuis); some speakers front dus and then invert, but the school pattern keeps SVO after dus.",
      "Do not treat want like omdat: *want ik ziek ben is ungrammatical."
    ],
    structuralBreakdown: "Main clause + coordinator + main clause (V2 retained); want ≠ omdat (no SOV).",
    examples: [
      { nl: "Ik blijf thuis, want ik ben verkouden.", en: "I am staying home, because I have a cold.", highlight: "want ik ben" },
      { nl: "Zij wil thee of koffie, maar ik drink water, dus ik haal een glas.", en: "She wants tea or coffee, but I drink water, so I fetch a glass.", highlight: "of / maar / dus" }
    ],
    commonMistake: "Putting the verb last after want as if it were omdat (want ik ziek ben).",
    correction: "Coordinator: want ik ben ziek. Subordinator: omdat ik ziek ben.",
    prerequisites: ["g-006"],
    relatedRules: ["g-026"],
    tags: ["conjunctions", "coordination", "want", "A1"],
    exercises: [
      { type: "multiple_choice", question: "Which clause is grammatical after want?", options: ["want ik ziek ben", "want ben ik ziek", "want ik ben ziek", "want ziek ik ben"], correct: 2, explanation: "want leaves a normal main clause." },
      { type: "fill_in_the_blank", prompt: "Pick the contrasting coordinator.", blankWord: "maar", sentenceWithBlank: "Het regent, ___ wij fietsen toch.", hints: ["contrast"] },
      { type: "error_correction", sentenceWithError: "Ik eet een appel, want ik honger heb.", correctedSentence: "Ik eet een appel, want ik heb honger.", explanation: "After want keep heb in V2." },
      { type: "word_order", translation: "I am tired, so I go to bed.", tokens: ["Ik", "ben", "moe", "dus", "ik", "ga", "naar", "bed"], correctSentence: "Ik ben moe dus ik ga naar bed" }
    ]
  },
  {
    id: "g-014",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Question Words and Interrogative Sentences",
    titleNl: "Vraagwoorden en Vragende Zinnen",
    summary: "Wh-questions put the question word in slot one, the finite verb in slot two, and the subject after that verb unless the question word itself is the subject.",
    rules: [
      "Core set: wie (who), wat (what), waar (where), wanneer (when), waarom (why), hoe (how), welke + N (which), hoeveel (how many/much).",
      "Pattern: Q-word – finite verb – subject – rest (Waar woon jij?). If wie/wat is the subject, there is no extra subject (Wie woont hier?).",
      "Hoe combines with adjectives and adverbs (hoe oud, hoe laat, hoe vaak) without extra of.",
      "Welke agrees in the same de/het/plural way as demonstratives (welke fiets, welk huis, welke huizen)."
    ],
    structuralBreakdown: "[Q-word] + [finite V2] + [subject if Q ≠ subject] + remainder; welke/welk tracks gender.",
    examples: [
      { nl: "Waar woon je, en hoe laat begin je morgen?", en: "Where do you live, and what time do you start tomorrow?", highlight: "Waar woon je / hoe laat begin je" },
      { nl: "Welk huis zoeken jullie, en wie betaalt de huur?", en: "Which house are you looking for, and who pays the rent?", highlight: "Welk huis / wie betaalt" }
    ],
    commonMistake: "Using English do-support or leaving the subject before the verb (Waar jij woont?).",
    correction: "Waar woon je? Subject follows the finite verb unless the question word is the subject.",
    prerequisites: ["g-006", "g-010"],
    relatedRules: ["g-015"],
    tags: ["questions", "wh-words", "A1"],
    exercises: [
      { type: "word_order", translation: "Where do you work?", tokens: ["Waar", "werk", "je"], correctSentence: "Waar werk je" },
      { type: "multiple_choice", question: "Which form fits huis (het) in 'which house'?", options: ["welke huis", "welk huis", "welles huis", "wat huis"], correct: 1, explanation: "Singular het takes welk." },
      { type: "fill_in_the_blank", prompt: "Question word for a person as subject.", blankWord: "Wie", sentenceWithBlank: "___ woont naast jullie op nummer 8?", hints: ["who"] },
      { type: "error_correction", sentenceWithError: "Waarom jij blijft thuis?", correctedSentence: "Waarom blijf je thuis?", explanation: "Q-word, then finite verb, then subject; drop -t on je." }
    ]
  },
  {
    id: "g-015",
    section: 1,
    sectionTitle: "A0–A1 Fundamentals",
    level: "A1",
    title: "Basic Prepositions of Place and Direction",
    titleNl: "Voorzetsels van Plaats en Richting",
    summary: "Place prepositions locate a static figure; direction often switches in/op/aan for motion toward a goal, while naar marks a destination and uit/van an origin.",
    rules: [
      "in is containment (in het huis, in de tas); op is a supporting surface or public platform (op tafel, op het station, op het plein).",
      "aan is contact at an edge or attachment (aan de muur, aan tafel for sitting at table); bij is proximity without exact contact (bij de bakker, bij het station).",
      "naar marks destination of motion (naar school, naar Amsterdam); uit and van mark leaving a container or a source (uit de tas, van het dak).",
      "Some fixed place idioms ignore the spatial picture (op school, in bed, aan de universiteit) and must be learned as chunks."
    ],
    structuralBreakdown: "Static: in/op/aan/bij + NP | Path: naar + goal, uit/van + source; idioms override geometry.",
    examples: [
      { nl: "Het boek ligt op de tafel in de keuken, niet aan de muur.", en: "The book is lying on the table in the kitchen, not on the wall.", highlight: "op de tafel / in de keuken / aan de muur" },
      { nl: "Ik fiets naar school en haal mijn lunch uit de tas.", en: "I cycle to school and take my lunch out of the bag.", highlight: "naar school / uit de tas" }
    ],
    commonMistake: "Using in for every English in/on/at (in het station, in de tafel).",
    correction: "Stations and surfaces usually take op; containment takes in; destinations take naar.",
    prerequisites: ["g-004"],
    relatedRules: ["g-023", "g-030"],
    tags: ["prepositions", "place", "direction", "A1"],
    exercises: [
      { type: "multiple_choice", question: "Which preposition locates a train platform typically?", options: ["in het station", "op het station", "aan het station", "naar het station (static)"], correct: 1, explanation: "Public platforms take op." },
      { type: "fill_in_the_blank", prompt: "Destination preposition before school.", blankWord: "naar", sentenceWithBlank: "Elke ochtend fiets ik ___ school.", hints: ["motion toward"] },
      { type: "error_correction", sentenceWithError: "Het schilderij hangt in de muur.", correctedSentence: "Het schilderij hangt aan de muur.", explanation: "Attachment to a vertical surface is aan." },
      { type: "word_order", translation: "The keys are in the bag on the table.", tokens: ["De", "sleutels", "zitten", "in", "de", "tas", "op", "de", "tafel"], correctSentence: "De sleutels zitten in de tas op de tafel" }
    ]
  }
];
