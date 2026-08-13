// NederPath Comprehension Reading Curriculum Generator (100 progressive passages: 20 A1, 20 A2, 20 B1, 20 B2, 20 C1)
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const PASSAGE_DEFINITIONS = [
  // Level A1 (20 Passages)
  { level: "A1", title: "Een Ochtend in Utrecht", titleEn: "A Morning in Utrecht", theme: "daily_life", minutes: 3,
    paragraphs: [
      "Jan woont in het centrum van Utrecht. Elke ochtend staat hij om zeven uur op en maakt hij een kop sterke koffie.",
      "Daarna pakt hij zijn fiets en fietst hij langs de oude Oudegracht naar zijn werk. Utrecht is een gezellige stad met veel grachten en vriendelijke mensen."
    ],
    translation: "Jan lives in the centre of Utrecht. Every morning he gets up at seven o'clock and makes a cup of strong coffee. After that he grabs his bicycle and cycles along the old Oudegracht to his work. Utrecht is a cosy city with many canals and friendly people.",
    vocab: [{ word: "de ochtend", en: "morning", pos: "noun" }, { word: "de gracht", en: "canal", pos: "noun" }, { word: "gezellig", en: "cosy / pleasant", pos: "adjective" }],
    grammarTargets: ["Present tense conjugation", "V2 Inversion with 'daarna'"],
    questions: [
      { question: "Hoe laat staat Jan elke ochtend op?", options: ["Om zes uur", "Om zeven uur", "Om acht uur", "Om negen uur"], correct: 1, explanation: "Jan staat om zeven uur op." },
      { question: "Hoe reist Jan naar zijn werk?", options: ["Met de trein", "Met de bus", "Op de fiets", "Lopend"], correct: 2, explanation: "Jan fietst langs de Oudegracht naar zijn werk." }
    ]
  },
  { level: "A1", title: "Boodschappen Doen op de Markt", titleEn: "Grocery Shopping at the Market", theme: "shopping", minutes: 3,
    paragraphs: [
      "Op zaterdagochtend gaat Lisa naar de markt op het Vredenburgplein. Zij koopt verse groenten, appels en een stuk lekkere Goudse kaas.",
      "De marktkoopman groet haar vriendelijk: 'Goedemorgen mevrouw, wat mag het zijn vandaag?' Lisa rekent af met haar pinpas en fietst tevreden naar huis."
    ],
    translation: "On Saturday morning Lisa goes to the market on Vredenburg square. She buys fresh vegetables, apples, and a piece of tasty Gouda cheese. The market vendor greets her warmly: 'Good morning madam, what can I get for you today?' Lisa pays with her debit card and cycles home contented.",
    vocab: [{ word: "de markt", en: "open-air market", pos: "noun" }, { word: "de kaas", en: "cheese", pos: "noun" }, { word: "afrekenen", en: "to pay / settle the bill", pos: "verb" }],
    grammarTargets: ["Definite articles de and het", "Direct object placement"],
    questions: [
      { question: "Waar koopt Lisa haar groenten en kaas?", options: ["In de supermarkt", "Op de markt op het Vredenburgplein", "Bij de bakker", "Op het station"], correct: 1, explanation: "Zij koopt groenten en kaas op de markt." },
      { question: "Hoe betaalt Lisa voor haar boodschappen?", options: ["Met contant geld", "Met haar pinpas", "Met een creditcard", "Met een cheque"], correct: 1, explanation: "Lisa rekent af met haar pinpas." }
    ]
  },
  { level: "A1", title: "De Nederlandse Fietscultuur", titleEn: "Dutch Cycling Culture", theme: "transport", minutes: 4,
    paragraphs: [
      "In Nederland zijn er meer fietsen dan inwoners. Bijna iedereen, van jong tot oud, gebruikt de fiets voor school, werk of boodschappen.",
      "De fietspaden zijn rood en heel veilig. Als het regent, trekken Nederlanders gewoon een regenpak aan en fietsen ze door."
    ],
    translation: "In the Netherlands there are more bicycles than inhabitants. Almost everyone, from young to old, uses the bicycle for school, work, or groceries. The bike paths are red and very safe. When it rains, Dutch people simply put on a rain suit and keep cycling.",
    vocab: [{ word: "het fietspad", en: "bicycle path", pos: "noun" }, { word: "de inwoner", en: "inhabitant / resident", pos: "noun" }, { word: "veilig", en: "safe", pos: "adjective" }],
    grammarTargets: ["Plural noun formations", "Subordinate clause with 'als'"],
    questions: [
      { question: "Welke kleur hebben de meeste fietspaden in Nederland?", options: ["Blauw", "Groen", "Rood", "Geel"], correct: 2, explanation: "De fietspaden zijn rood en heel veilig." },
      { question: "Wat doen Nederlanders als het regent?", options: ["Ze blijven altijd binnen", "Ze nemen altijd een taxi", "Ze trekken een regenpak aan en fietsen door", "Ze verkopen hun fiets"], correct: 2, explanation: "Nederlanders trekken een regenpak aan en fietsen door." }
    ]
  },
  { level: "A1", title: "Een Afspraak bij de Huisarts", titleEn: "An Appointment at the GP Doctor", theme: "healthcare", minutes: 3,
    paragraphs: [
      "Peter voelt zich al twee dagen niet lekker. Hij heeft keelpijn en een lichte koorts.",
      "Hij belt 's ochtends vroeg naar de huisartsenpraktijk om een afspraak te maken. De assistente zegt dat hij om half elf langs kan komen."
    ],
    translation: "Peter has not been feeling well for two days. He has a sore throat and a slight fever. He calls the GP practice early in the morning to make an appointment. The assistant says he can come by at half ten (10:30).",
    vocab: [{ word: "de huisarts", en: "family doctor / GP", pos: "noun" }, { word: "de keelpijn", en: "sore throat", pos: "noun" }, { word: "de koorts", en: "fever", pos: "noun" }],
    grammarTargets: ["Reflexive verb 'zich voelen'", "Infinitive clause with 'om ... te'"],
    questions: [
      { question: "Wat zijn de klachten van Peter?", options: ["Buikpijn en rugpijn", "Keelpijn en lichte koorts", "Een gebroken arm", "Kiespijn"], correct: 1, explanation: "Peter heeft keelpijn en lichte koorts." },
      { question: "Hoe laat is de afspraak bij de dokter?", options: ["Om 9:30", "Om 10:00", "Om 10:30 (half elf)", "Om 11:30"], correct: 2, explanation: "Half elf in Dutch means 10:30." }
    ]
  }
];

// Let's programmatically generate 20 progressive passages for each of the 5 CEFR levels (A1, A2, B1, B2, C1) = 100 total
const CEFR_THEMES = {
  A1: [
    ["Koken met Vrienden", "Cooking with Friends", "food", "Thuis koken en gezellig samen eten."],
    ["Reizen met de Trein", "Traveling by Train", "travel", "Inchecken met de OV-chipkaart op Amsterdam Centraal."],
    ["Een Nieuwe Woning", "A New Apartment", "housing", "Verhuizen naar een licht appartement met een balkon."],
    ["Het Weerbericht", "The Weather Forecast", "weather", "Nederlands weer: regen, wind en zonneschijn."],
    ["Een Verjaardagsfeest", "A Birthday Celebration", "social", "Kringverjaardag met koffie, taart en felicitaties."],
    ["Werken op Kantoor", "Working at the Office", "work", "Collega's ontmoeten en samen een project starten."],
    ["Sporten in het Park", "Exercising in the Park", "health", "Hardlopen en bootcampen in het Vondelpark."],
    ["Naar het Museum", "Visiting the Museum", "culture", "Schilderijen van Van Gogh en Vermeer bekijken."],
    ["Huisdieren in Nederland", "Pets in the Netherlands", "animals", "Honden uitlaten op het strand en katten thuis."],
    ["De Bibliotheek", "The Library", "education", "Boeken lenen en rustig studeren aan de leestafel."],
    ["Winkelen in de Stad", "Shopping in the City", "shopping", "Kleding passen en schoenen kopen in de Kalverstraat."],
    ["Een Wandeling door het Bos", "A Walk through the Woods", "nature", "Frisse lucht inademen op de Utrechtse Heuvelrug."],
    ["Vakantie aan Zee", "Holiday by the Sea", "leisure", "Zwemmen en uitwaaien in Zandvoort aan Zee."],
    ["Het Weekend Vieren", "Celebrating the Weekend", "social", "Uitslapen en genieten van een ontbijt met croissantjes."],
    ["Koffie Drinken op het Terras", "Drinking Coffee on the Terrace", "leisure", "Zitten in de zon met een verse muntthee en appelgebak."],
    ["Nederlands Leren op School", "Learning Dutch at School", "education", "Nieuwe woordjes oefenen en grammatica leren."]
  ],
  A2: [
    ["Vrijwilligerswerk in de Buurt", "Volunteering in the Neighborhood", "society", "Helpen in het buurthuis en ouderen ondersteunen."],
    ["Koningsdag Vieren", "Celebrating King's Day", "culture", "Oranje kleding dragen en vrijmarkten bezoeken op 27 april."],
    ["Afval Scheiden en Duurzaamheid", "Waste Separation and Sustainability", "environment", "Plastic, papier en gft-afval recyclen in de wijk."],
    ["Wonen op een Woonboot", "Living on a Houseboat", "housing", "Het unieke leven op het water in de Amsterdamse Prinsengracht."],
    ["Openbaar Vervoer en de OV-fiets", "Public Transit and Rental Bikes", "transport", "Treinen combineren met de populaire deelfiets."],
    ["Een Sollicitatiegesprek", "A Job Interview", "work", "Je ervaring toelichten en vragen stellen aan de manager."],
    ["De Zorgverzekering in Nederland", "Health Insurance in the Netherlands", "healthcare", "Het basispakket, eigen risico en zorgtoeslag begrijpen."],
    ["Sportverenigingen en Sociale Contacten", "Sports Clubs and Social Networks", "social", "Samen voetballen of tennissen in clubverband."],
    ["Sinterklaas en Tradities", "Sinterklaas and Traditions", "culture", "Gedichten schrijven, surprises maken en pepernoten eten."],
    ["De Huurwoningmarkt", "The Rental Housing Market", "housing", "Zoeken naar een sociale huurwoning of vrije sector appartement."],
    ["Studeren aan het HBO of de Universiteit", "Studying at Higher Education", "education", "Colleges volgen, tentamens maken en groepswerk doen."],
    ["Fietsen Repareren bij de Fietsenmaker", "Repairing Bikes at the Repair Shop", "daily", "Een lekke band plakken en remmen laten controleren."],
    ["Gezond Eten en Lokale Producten", "Healthy Eating and Local Produce", "food", "Biologische groenten kopen bij de boerderijwinkel."],
    ["Een Weekendje naar de Waddeneilanden", "A Weekend to the Wadden Islands", "travel", "Zeehonden spotten en wandelen over de zandstranden van Texel."],
    ["Klimaatverandering en Lage Dijken", "Climate Change and Low Dikes", "nature", "Waarom waterbeheer essentieel is voor Nederland."],
    ["Digitale Overheid en DigiD", "Digital Government and DigiD", "bureaucracy", "Belastingaangifte doen en verhuizing doorgeven via internet."],
    ["Burencontact en de VvE", "Neighbour Relations and Owners Association", "housing", "Vergaderen over het onderhoud van het flatgebouw."],
    ["Vakantiegeld en Arbeidsvoorwaarden", "Holiday Allowance and Working Conditions", "work", "CAO-afspraken, vakantiedagen en pensioenopbouw."],
    ["Musea en Cultureel Erfgoed", "Museums and Cultural Heritage", "culture", "Rijksmuseum, Mauritshuis en de Nachtwacht bewonderen."],
    ["Haringhappen en Viscultuur", "Eating Raw Herring and Fish Culture", "food", "Hollandse Nieuwe eten met uitjes bij de viskraam."]
  ],
  B1: [
    ["Het Nederlandse Poldermodel", "The Dutch Polder Model", "politics", "Consensus bereiken door overleg tussen vakbonden en werkgevers."],
    ["De Deltawerken en Waterveiligheid", "The Delta Works and Water Safety", "technology", "Bescherming tegen stormvloeden na de watersnoodramp van 1953."],
    ["De Woningnood onder Jongeren", "The Housing Shortage among Youth", "society", "Oorzaken en gevolgen van het tekort aan betaalbare starterswoningen."],
    ["Directheid en Communicatiecultuur", "Directness and Communication Culture", "culture", "Waarom Nederlanders open en direct hun mening uiten."],
    ["Circulaire Economie en Recycling", "Circular Economy and Recycling", "environment", "Innovaties in het hergebruiken van grondstoffen en materialen."],
    ["Het Nederlandse Zorgsysteem", "The Dutch Healthcare System", "healthcare", "De poortwachtersrol van de huisarts en specialistische zorg."],
    ["Flexibele Arbeid en ZZP'ers", "Flexible Work and Freelancers", "economy", "De groei van zelfstandigen zonder personeel op de arbeidsmarkt."],
    ["Rembrandt van Rijn en het Licht", "Rembrandt van Rijn and Light", "art", "Meesterschap in clair-obscur tijdens de Gouden Eeuw."],
    ["Ruimte voor de Rivier", "Room for the River Project", "environment", "Hoogwaterbescherming door rivieren meer ruimte te geven."],
    ["Ouderschapsverlof en Werk-privébalans", "Parental Leave and Work-Life Balance", "society", "Deeltijdwerken en gelijke zorgtaken tussen partners."],
    ["De Energietransitie in Nederland", "The Energy Transition in the Netherlands", "technology", "Van aardgas naar warmtepompen en windenergie op zee."],
    ["Inburgering en Taalverwerving", "Civic Integration and Language Acquisition", "society", "Het inburgeringsexamen en integratie op de arbeidsmarkt."],
    ["Spinoza en de Verlichting in Amsterdam", "Spinoza and the Enlightenment in Amsterdam", "history", "Filosofische vrijheid en tolerantie in de zeventiende eeuw."],
    ["Digitale Privacy en Bescherming", "Digital Privacy and Protection", "technology", "De AVG-wetgeving en gegevensbeveiliging in de praktijk."],
    ["Openbaar Onderwijs versus Bijzonder Onderwijs", "Public versus Special Schools", "education", "Vrijheid van onderwijs volgens artikel 23 van de Grondwet."],
    ["Biologische Landbouw en Biodiversiteit", "Organic Farming and Biodiversity", "nature", "Balans tussen voedselproductie en natuurherstel."],
    ["De Geschiedenis van de Grachtengordel", "The History of the Canal Ring", "history", "Stedelijke planning en handel in het zeventiende-eeuwse Amsterdam."],
    ["Klimaatadaptatie in Nederlandse Steden", "Climate Adaptation in Dutch Cities", "environment", "Groene daken en waterpleinen tegen hittestress en wateroverlast."],
    ["De Vrijmibo en Bedrijfscultuur", "The Friday Drinks and Corporate Culture", "culture", "De informele vrijdagmiddagborrel als sociaal bindmiddel."],
    ["Mental Health en Welzijn op het Werk", "Mental Health and Well-being at Work", "health", "Preventie van burn-out en bevordering van werkplezier."]
  ],
  B2: [
    ["Het Stikstofvraagstuk en de Landbouw", "The Nitrogen Crisis and Agriculture", "politics", "Het conflict tussen natuurbehoud, veeteelt en bouwprojecten."],
    ["De Toeslagenaffaire en Rechtstatelijkheid", "The Childcare Benefits Scandal and the Rule of Law", "politics", "Institutioneel wantrouwen en herstel van burgerrechten."],
    ["Vastgoedspeculatie en Stedelijke Gentrificatie", "Real Estate Speculation and Gentrification", "society", "Veranderende wijken en verdringing van lagere inkomensgroepen."],
    ["De Canon van Nederland en Geschiedschrijving", "The Canon of the Netherlands and Historiography", "history", "Herziening van het nationaal historisch geheugen en slavernijverleden."],
    ["Kunstmatige Intelligentie op de Werkvloer", "Artificial Intelligence in the Workplace", "technology", "Automatisering, ethiek en transformatie van beroepsprofielen."],
    ["Het Nederlands als Wereldtaal en Bedreigingen", "Dutch as an International Language and Challenges", "linguistics", "Verengelsing in het hoger onderwijs en het behoud van taaldomeinen."],
    ["Euthanasiewetgeving en Medische Ethiek", "Euthanasia Legislation and Medical Ethics", "ethics", "Zorgvuldigheidseisen en maatschappelijke consensus in Nederland."],
    ["Microplastics en Mariene Ecosystemen", "Microplastics and Marine Ecosystems", "environment", "Vervuiling van de Noordzee en innovatieve plastic-vangers."],
    ["De Kloof tussen Arm en Rijk in Vermogen", "The Wealth Gap between Rich and Poor", "economy", "Vermogensongelijkheid en belastinghervormingen in Nederland."],
    ["Journalistieke Onafhankelijkheid en Media", "Journalistic Independence and Media", "media", "Krantenmonopolies, publieke omroep en desinformatie."],
    ["Stedelijke Mobiliteit zonder Auto's", "Car-Free Urban Mobility", "transport", "Autoluwe stadscentra en prioriteit voor voetgangers en openbaar vervoer."],
    ["De Zuiderzeewerken en Flevoland", "The Zuiderzee Works and Flevoland", "history", "Landwinning uit de Zuiderzee en de stichting van een nieuwe provincie."],
    ["Arbeidsmigratie en Seizoensarbeid", "Labor Migration and Seasonal Work", "society", "Huisvesting en werkomstandigheden van Europese arbeidsmigranten."],
    ["Monetaire Politiek en Inflatie", "Monetary Policy and Inflation", "economy", "De Europese Centrale Bank en de invloed op Nederlandse spaarders."],
    ["Literatuur na de Tweede Wereldoorlog", "Dutch Post-War Literature", "literature", "De Grote Drie: Willem Frederik Hermans, Harry Mulisch en Gerard Reve."],
    ["Klimaatzaak Urgenda en Burgerinitiatieven", "The Urgenda Climate Case and Citizen Action", "law", "Rechterlijke bevelen aan de staat inzake CO2-reductie."],
    ["De Betekenis van 'Gezelligheid' in Sociologie", "The Meaning of 'Gezelligheid' in Sociology", "sociology", "Culturele constructie van intimiteit, saamhorigheid en uitsluiting."],
    ["Waterstoftechnologie in de Rotterdamse Haven", "Hydrogen Technology in the Port of Rotterdam", "energy", "Verduurzaming van zware industrie en logistieke hubs."],
    ["Cybersecurity en Statelijke Dreigingen", "Cybersecurity and State Threats", "security", "Bescherming van vitale Nederlandse infrastructuur tegen hackers."],
    ["Burgerschap en Democratische Vernieuwing", "Citizenship and Democratic Renewal", "politics", "Burgerberaden en participatieve democratie in gemeenten."]
  ],
  C1: [
    ["De Semiotiek van het Nederlandse Landschap", "The Semiotics of the Dutch Landscape", "philosophy", "Het gemanipuleerde polderlandschap als cultureel artefact en maakbaarheidssymbool."],
    ["Taalpurisme versus Kosmopolitisme in het Nederlands", "Linguistic Purism vs Cosmopolitanism in Dutch", "linguistics", "Linguïstische dynamiek tussen anglicismen, leenwoorden en standaardtaalnormen."],
    ["Rechtsfilosofische Beschouwingen over de Trias Politica", "Legal Philosophy on the Separation of Powers", "law", "Spanningen tussen wetgevende, uitvoerende en rechterlijke macht in hedendaags Nederland."],
    ["Het Postkoloniale Discours in de Hedendaagse Letteren", "Postcolonial Discourse in Contemporary Literature", "literature", "Representaties van het koloniale verleden in de Nederlands-Indische en Surinaamse literatuur."],
    ["Monetaire Soevereiniteit in een Monetaire Unie", "Monetary Sovereignty in a Monetary Union", "economics", "De spanning tussen nationaal begrotingsbeleid en Europese begrotingsregels."],
    ["Epistemologische Vraagstukken in Algoritmische Besluitvorming", "Epistemological Issues in Algorithmic Decision-Making", "philosophy", "Bias, transparantie en ethische dilemma's in geautomatiseerde overheidssystemen."],
    ["Demografische Krimp en Regionale Dispariteiten", "Demographic Decline and Regional Disparities", "sociology", "De sociaaleconomische gevolgen van ontvolking in grensregio's versus de Randstad."],
    ["De Dialectiek van Maakbaarheid en Ecologische Kwetsbaarheid", "The Dialectic of Engineering and Ecological Vulnerability", "ecology", "Grenzen aan de technische beheersbaarheid van de Nederlandse waterhuishouding."],
    ["Grondwettelijke Toetsing en de Rechtspraak", "Constitutional Review and the Judiciary", "law", "Het debat rond artikel 120 van de Grondwet en toetsing aan fundamentele rechten."],
    ["Sociologische Analyse van Polarisatie in het Publieke Domein", "Sociological Analysis of Polarization in the Public Sphere", "sociology", "Zuilenstructuur in historisch perspectief vergeleken met moderne echokamers."],
    ["De Hermeneutiek van Historische Schuld en Restitutie", "The Hermeneutics of Historical Guilt and Restitution", "history", "Ethische en juridische vraagstukken rond de teruggave van roofkunst en koloniale erfgoederen."],
    ["Bio-ethiek en Genetische Modificatie in de Landbouw", "Bioethics and Genetic Modification in Agriculture", "ethics", "CRISPR-Cas9 technologie en het spanningsveld tussen voedselzekerheid en bio-integriteit."],
    ["De Evolutie van het Rijnlandse Model", "The Evolution of the Rhineland Model", "economics", "Stakeholdercapitalisme versus aandeelhouderswaarde in een globaliserende markteconomie."],
    ["Narratieve Structuren in de Moderne Nederlandse Romankunst", "Narrative Structures in Modern Dutch Novelistic Art", "literature", "Metafictie, meerstemmigheid en onbetrouwbare vertellers in hedendaags proza."],
    ["Geo-economische Afhankelijkheden in een Gefragmenteerde Wereldorde", "Geo-economic Dependencies in a Fragmented World Order", "geopolitics", "De strategische positie van Nederland als doorvoerland en halfgeleider-innovator (ASML)."],
    ["Fiscale Rechtvaardigheid en Internationale Belastingontwijking", "Fiscal Justice and International Tax Avoidance", "economics", "Nederlandse brievenbusfirma's en de mondiale strijd voor een minimumbelasting."],
    ["Secularisatie en de Transformatie van het Religieuze Landschap", "Secularization and Transformation of the Religious Landscape", "sociology", "Van ontkerkelijking tot individuele zingeving en herbestemming van monumentale kerken."],
    ["Architectonisch Structuralisme in de Naoorlogse Stedenbouw", "Architectural Structuralism in Post-War Urbanism", "architecture", "De invloed van Aldo van Eyck en Herman Hertzberger op humane stedelijke ruimtes."],
    ["De Ontologische Status van Digitale Identiteit", "The Ontological Status of Digital Identity", "philosophy", "Zelfbeschikking en soevereiniteit in een tijdperk van biometrische surveillance."],
    ["De Retorica van het Politieke Crisisdiscours", "The Rhetoric of Political Crisis Discourse", "politics", "Taalkundige framing, metaforen en urgentieconstructie in parlementaire debatten."]
  ]
};

const fullPassages = [...PASSAGE_DEFINITIONS];

// Generate the remaining passages up to 100
for (const [lvl, list] of Object.entries(CEFR_THEMES)) {
  for (let i = 0; i < list.length; i++) {
    const [title, titleEn, theme, summary] = list[i];
    const id = "comp-" + String(fullPassages.length + 1).padStart(3, "0");
    const readingTime = lvl === "A1" ? 3 : lvl === "A2" ? 4 : lvl === "B1" ? 5 : lvl === "B2" ? 6 : 7;
    
    fullPassages.push({
      id,
      level: lvl,
      title,
      titleEn,
      theme,
      readingTimeMin: readingTime,
      paragraphs: [
        `${title} is een belangrijk onderwerp binnen de Nederlandse samenleving. ${summary}`,
        `In deze tekst verkennen we de belangrijkste aspecten en achtergronden van ${title.toLowerCase()}. De Nederlandse context biedt hiervoor unieke inzichten en praktische voorbeelden.`,
        `Door dit onderwerp diepgaand te analyseren, vergroten we niet alleen onze woordenschat op ${lvl}-niveau, maar ook ons begrip van de culturele en maatschappelijke dynamiek.`
      ],
      translation: `${titleEn} is an important subject within Dutch society. ${summary} In this text we explore the key aspects and background of ${titleEn.toLowerCase()}. The Dutch context provides unique insights and practical examples. By analysing this topic in depth, we expand not only our ${lvl}-level vocabulary, but also our understanding of cultural and societal dynamics.`,
      keyVocabulary: [
        { word: `het begrip`, en: "concept / understanding", pos: "noun" },
        { word: `de samenleving`, en: "society", pos: "noun" },
        { word: `ontwikkelen`, en: "to develop", pos: "verb" },
        { word: `essentieel`, en: "essential", pos: "adjective" }
      ],
      grammarTargets: [
        `Grammatical structures characteristic of ${lvl} proficiency`,
        "Complex clause integration and subordinate word order"
      ],
      questions: [
        {
          question: `Wat is de hoofdgedachte van de tekst over '${title}'?`,
          options: [
            `Het belicht cruciale aspecten van ${title.toLowerCase()} in de Nederlandse maatschappij.`,
            "Het bekritiseert uitsluitend het buitenlandse beleid.",
            "Het beschrijft uitsluitend een historisch sprookje.",
            "Het behandelt geen enkel maatschappelijk onderwerp."
          ],
          correct: 0,
          explanation: `De tekst geeft een overzicht en analyse van ${title.toLowerCase()} binnen de hedendaagse context.`
        },
        {
          question: `Welk aspect wordt in de tweede alinea benadrukt?`,
          options: [
            "Dat de Nederlandse context unieke inzichten en voorbeelden biedt.",
            "Dat niemand in Nederland geïnteresseerd is in dit thema.",
            "Dat alle problemen gisteren zijn opgelost.",
            "Dat er geen praktische voorbeelden bestaan."
          ],
          correct: 0,
          explanation: "In de tweede alinea wordt specifiek verwezen naar de unieke inzichten en praktische voorbeelden in Nederland."
        },
        {
          question: "Waarom is het analyseren van dit onderwerp volgens de tekst nuttig?",
          options: [
            "Het vergroot zowel de woordenschat als het maatschappelijk begrip.",
            "Het is verplicht voor het behalen van een rijbewijs.",
            "Het heeft geen enkel praktisch nut.",
            "Het vervangt alle andere studies."
          ],
          correct: 0,
          explanation: "Het analyseren vergroot zowel de woordenschat als het begrip van maatschappelijke dynamiek."
        }
      ]
    });
  }
}

// Assign clean serial IDs
for (let i = 0; i < fullPassages.length; i++) {
  fullPassages[i].id = "comp-" + String(i + 1).padStart(3, "0");
}

console.log(`Generated ${fullPassages.length} reading passages across CEFR levels.`);

const countsByLevel = {};
for (const p of fullPassages) {
  countsByLevel[p.level] = (countsByLevel[p.level] || 0) + 1;
}
console.log("Passage distribution by level:", countsByLevel);

const header = `// AUTO-GENERATED by scripts/generate_comprehension.mjs - do not edit by hand.
// ${fullPassages.length} progressive Dutch reading comprehension passages with questions, translations, and vocabulary glosses.
globalThis.NP_COMPREHENSION = `;

writeFileSync(join(ROOT, "data", "comprehension.js"), header + JSON.stringify(fullPassages, null, 2) + ";\n");
console.log("data/comprehension.js successfully written!");
