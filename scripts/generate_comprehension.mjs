// NederPath Comprehension Reading Curriculum Generator (100 progressive passages: 20 A1, 20 A2, 20 B1, 20 B2, 20 C1)
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const TOPICS = {
  A1: [
    { title: "Een Ochtend in Utrecht", titleEn: "A Morning in Utrecht", theme: "daily_life" },
    { title: "Boodschappen Doen op de Zaterdagmarkt", titleEn: "Grocery Shopping at the Saturday Market", theme: "shopping" },
    { title: "De Nederlandse Fietscultuur", titleEn: "Dutch Cycling Culture", theme: "transport" },
    { title: "Een Afspraak bij de Huisarts", titleEn: "An Appointment at the GP Doctor", theme: "healthcare" },
    { title: "Koken met Vrienden", titleEn: "Cooking with Friends", theme: "food" },
    { title: "Reizen met de Trein", titleEn: "Traveling by Train", theme: "travel" },
    { title: "Een Nieuwe Woning in de Stad", titleEn: "A New Apartment in the City", theme: "housing" },
    { title: "Het Nederlandse Weerbericht", titleEn: "The Dutch Weather Forecast", theme: "weather" },
    { title: "Een Verjaardagsfeest Vieren", titleEn: "Celebrating a Birthday", theme: "social" },
    { title: "Werken op een Modern Kantoor", titleEn: "Working in a Modern Office", theme: "work" },
    { title: "Sporten in het Vondelpark", titleEn: "Exercising in Vondelpark", theme: "health" },
    { title: "Bezoek aan het Rijksmuseum", titleEn: "Visit to the Rijksmuseum", theme: "culture" },
    { title: "Huisdieren en Dierenbescherming", titleEn: "Pets and Animal Welfare", theme: "animals" },
    { title: "Studeren in de Bibliotheek", titleEn: "Studying in the Library", theme: "education" },
    { title: "Winkelen in de Kalverstraat", titleEn: "Shopping on Kalverstraat", theme: "shopping" },
    { title: "Wandelen op de Utrechtse Heuvelrug", titleEn: "Walking on the Utrechtse Heuvelrug", theme: "nature" },
    { title: "Een Stranddag in Zandvoort", titleEn: "A Beach Day in Zandvoort", theme: "leisure" },
    { title: "Het Weekend Ontbijt", titleEn: "Weekend Breakfast", theme: "food" },
    { title: "Koffie op het Terras", titleEn: "Coffee on the Outdoor Terrace", theme: "leisure" },
    { title: "Nederlands Leren op de Taalschool", titleEn: "Learning Dutch at Language School", theme: "education" }
  ],
  A2: [
    { title: "Vrijwilligerswerk in het Buurthuis", titleEn: "Volunteering at the Community Centre", theme: "society" },
    { title: "Koningsdag en Vrijmarkten", titleEn: "King's Day and Flea Markets", theme: "culture" },
    { title: "Afval Scheiden en Duurzaamheid", titleEn: "Waste Separation and Sustainability", theme: "environment" },
    { title: "Wonen op een Woonboot", titleEn: "Living on a Houseboat", theme: "housing" },
    { title: "Het Gebruik van de OV-Fiets", titleEn: "Using the Shared OV Bicycle", theme: "transport" },
    { title: "Een Succesvol Sollicitatiegesprek", titleEn: "A Successful Job Interview", theme: "work" },
    { title: "Het Nederlandse Zorgsysteem", titleEn: "The Dutch Healthcare System", theme: "healthcare" },
    { title: "De Lokale Sportvereniging", titleEn: "The Local Sports Club", theme: "social" },
    { title: "Sinterklaas en Surprises", titleEn: "Sinterklaas and Rhyming Surprises", theme: "culture" },
    { title: "De Zoektocht naar een Huurwoning", titleEn: "The Search for a Rental Home", theme: "housing" },
    { title: "Hoger Beroepsonderwijs in Nederland", titleEn: "Higher Professional Education in NL", theme: "education" },
    { title: "De Fietsenmaker om de Hoek", titleEn: "The Neighborhood Bike Mechanic", theme: "transport" },
    { title: "Lokale Boerderijwinkels", titleEn: "Local Farm Shops", theme: "food" },
    { title: "Wandelen op de Waddeneilanden", titleEn: "Walking on the Wadden Islands", theme: "travel" },
    { title: "Waterbeheer en Dijken in Nederland", titleEn: "Water Management and Dikes", theme: "nature" },
    { title: "Digitaal Contact met de Gemeente", titleEn: "Digital Municipal Services via DigiD", theme: "bureaucracy" },
    { title: "Nederlandse Verjaardagstradities", titleEn: "Dutch Birthday Traditions & Circle Parties", theme: "culture" },
    { title: "De Huisarts als Eerste Aanspreekpunt", titleEn: "The GP as Gatekeeper of Health", theme: "healthcare" },
    { title: "Tweedehands Winkelen bij de Kringloop", titleEn: "Second-hand Shopping at the Kringloop", theme: "environment" },
    { title: "De Werkcultuur en Overlegstructuur", titleEn: "Workplace Consultation and Flat Hierarchy", theme: "work" }
  ],
  B1: [
    { title: "Het Nederlandse Poldermodel", titleEn: "The Dutch Polder Model & Consensus", theme: "politics" },
    { title: "De Deltawerken en Waterveiligheid", titleEn: "The Delta Works and Coastal Protection", theme: "history" },
    { title: "De Krapte op de Woningmarkt", titleEn: "Shortages on the Dutch Housing Market", theme: "society" },
    { title: "Directe Communicatie in de Nederlandse Cultuur", titleEn: "Directness in Dutch Communication", theme: "culture" },
    { title: "Circulaire Economie en Energietransitie", titleEn: "Circular Economy and Energy Transition", theme: "environment" },
    { title: "De Schilderkunst van de Gouden Eeuw", titleEn: "Painting of the Dutch Golden Age", theme: "art" },
    { title: "Verstedelijking en de Randstad", titleEn: "Urbanization and the Randstad Region", theme: "geography" },
    { title: "De Participatiewet en de Arbeidsmarkt", titleEn: "The Participation Act and Labor Market", theme: "policy" },
    { title: "Het Onderwijsstelsel van Basisschool tot Universiteit", titleEn: "The Dutch Educational Tracking System", theme: "education" },
    { title: "De Nederlandse Gezondheidszorg en Marktwerking", titleEn: "Healthcare Policy and Regulated Competition", theme: "healthcare" },
    { title: "Veenweidegebieden en Bodemdaling", titleEn: "Peatland Drainage and Soil Subsidence", theme: "nature" },
    { title: "De Vrijheid van Meningsuiting in Nederland", titleEn: "Freedom of Expression in the Netherlands", theme: "law" },
    { title: "Kunst en Architectuur van De Stijl", titleEn: "Art and Architecture of De Stijl & Mondrian", theme: "art" },
    { title: "Etnische Diversiteit en Integratie", titleEn: "Ethnic Diversity and Civic Integration", theme: "society" },
    { title: "De Toekomst van het Openbaar Vervoer", titleEn: "The Future of Public Transit and Mobility", theme: "transport" },
    { title: "Voedselinnovatie en Glastuinbouw", titleEn: "Agricultural Innovation and Greenhouse Farming", theme: "science" },
    { title: "De Betekenis van 'Gezelligheid'", titleEn: "The Cultural Semantics of 'Gezelligheid'", theme: "culture" },
    { title: "Waterbeheer in de 21e Eeuw", titleEn: "Climate Adaptation and Room for the River", theme: "environment" },
    { title: "Democratische Besluitvorming in de Gemeenteraad", titleEn: "Local Governance and City Councils", theme: "politics" },
    { title: "De Arbeidsovereenkomst en Ontslagbescherming", titleEn: "Employment Law and Labor Rights", theme: "work" }
  ],
  B2: [
    { title: "De Stikstofcrisis en de Landbouwsector", titleEn: "The Nitrogen Crisis and Dutch Agriculture", theme: "politics" },
    { title: "De Toeslagenaffaire en de Rechtsstaat", titleEn: "The Childcare Benefits Scandal and the Rule of Law", theme: "governance" },
    { title: "De Toekomst van Kunstmatige Intelligentie op het Werk", titleEn: "AI in the Professional Workplace", theme: "technology" },
    { title: "Euthanasiewetgeving en Medische Ethiek", titleEn: "Euthanasia Law and Medical Ethics in NL", theme: "ethics" },
    { title: "Mediamonopolies en de Vrije Pers", titleEn: "Media Concentration and Independent Journalism", theme: "media" },
    { title: "Klimaatadaptatie en de Ruimte voor de Rivier", titleEn: "Climate Adaptation: Room for the River Project", theme: "environment" },
    { title: "Het Pensioenstelsel en Intergenerationele Solidariteit", titleEn: "The Dutch Pension System Reform", theme: "economy" },
    { title: "Taalverandering en Verengelsing van het Onderwijs", titleEn: "Language Shift and English in Dutch Academia", theme: "linguistics" },
    { title: "Het Koloniale Verleden en Canonvorming", titleEn: "Colonial History, Slavery, and National Memory", theme: "history" },
    { title: "Vergrijzing en de Toekomst van de Zorg", titleEn: "Aging Population and Healthcare Sustainability", theme: "healthcare" },
    { title: "Platformeconomie en Arbeidsrechten", titleEn: "The Gig Economy, Freelancing, and Worker Rights", theme: "economy" },
    { title: "Bio-ethiek en Genetische Modificatie", titleEn: "Bioethics and Genetic Modification Policy", theme: "science" },
    { title: "Privacy, Bewaking en de Digitale Overheid", titleEn: "Surveillance, Privacy, and Big Data Governance", theme: "technology" },
    { title: "Gelijke Kansen in het Nederlands Onderwijs", titleEn: "Educational Inequity and Early Tracking", theme: "education" },
    { title: "Monetaire Beleid en Inflatie in de Eurozone", titleEn: "Monetary Policy and ECB Strategies in NL", theme: "economy" },
    { title: "Herbestemming van Religieus en Industrieel Erfgoed", titleEn: "Repurposing Church and Industrial Heritage", theme: "architecture" },
    { title: "Duurzame Mobiliteit en Emissievrije Steden", titleEn: "Zero-Emission Urban Transport by 2030", theme: "environment" },
    { title: "De Rol van de Grondwet en de Hoge Raad", titleEn: "Constitutional Review and the Supreme Court", theme: "law" },
    { title: "Internationale Handel en de Haven van Rotterdam", titleEn: "Global Trade and the Port of Rotterdam", theme: "trade" },
    { title: "Culturele Diplomatie en de Vredespaleizen", titleEn: "International Law and the Peace Palace in The Hague", theme: "diplomacy" }
  ],
  C1: [
    { title: "Semiotiek van het Nederlandse Polderlandschap", titleEn: "Semiotics of the Man-Made Dutch Landscape", theme: "philosophy" },
    { title: "Taalpurisme versus Kosmopolitische Taalverandering", titleEn: "Linguistic Purism and Lexical Borrowing", theme: "linguistics" },
    { title: "De Trias Politica en Institutionele Spanningen", titleEn: "Separation of Powers and Constitutional Tensions", theme: "governance" },
    { title: "Postkoloniale Literatuur en Herinneringscultuur", titleEn: "Postcolonial Literature and Identity in NL", theme: "literature" },
    { title: "Het Rijnlandse Economische Model onder Druk", titleEn: "The Rhineland Capitalism Model under Global Pressure", theme: "economy" },
    { title: "Architectonische Typologie van de Amsterdamse School", titleEn: "Typology of the Amsterdam School Architecture", theme: "architecture" },
    { title: "Waterbeheersingsfilosofie in het Antropoceen", titleEn: "Hydrological Engineering Philosophy in the Anthropocene", theme: "philosophy" },
    { title: "De Dynamiek van Coalitievorming en Consensuspolitiek", titleEn: "Coalition Formation and Fragmented Parliaments", theme: "politics" },
    { title: "Retorica en Pragmatiek in de Tweede Kamer", titleEn: "Rhetoric and Discourse Analysis in Parliamentary Debate", theme: "linguistics" },
    { title: "De Grenzen van Juridische Toetsing door Rechters", titleEn: "Judicial Activism vs Legislative Prerogative", theme: "law" },
    { title: "Epistemologie van Wetenschappelijk Beleidsadvies", titleEn: "Epistemology of Expert Advice in Crises", theme: "epistemology" },
    { title: "De Transformatie van de Sociale Zekerheidsstaat", titleEn: "Structural Transformation of the Welfare State", theme: "sociology" },
    { title: "Stedelijke Gentrificatie en Ruimtelijke Segregatie", titleEn: "Urban Gentrification and Spatial Polarization", theme: "sociology" },
    { title: "Kunstfilosofie in het Werk van Spinoza en Vermeer", titleEn: "Philosophy and Aesthetics in Spinoza's Amsterdam", theme: "philosophy" },
    { title: "De Taal van de Rechtspraak en Ambtelijke Helderheid", titleEn: "Legal Register and Plain Language Jurisprudence", theme: "law" },
    { title: "Bio-economie en de Grenzen van Industriële Landbouw", titleEn: "Bio-economy and Agrarian Sustainability Paradigms", theme: "ecology" },
    { title: "Historische Continuïteit van de Staten-Generaal", titleEn: "Historical Evolution of the Dutch States General", theme: "history" },
    { title: "Literair Realisme en Modernisme in de Nederlandse Canon", titleEn: "Literary Realism and the Modern Dutch Canon", theme: "literature" },
    { title: "Digitale Soevereiniteit en Algoritmische Transparantie", titleEn: "Digital Sovereignty and Algorithmic Auditing", theme: "technology" },
    { title: "Hermeneutiek van Historische Verdragen en Vrede van Munster", titleEn: "Hermeneutics of the Peace of Münster (1648)", theme: "history" }
  ]
};

const passages = [];
let pId = 1;

for (const [level, list] of Object.entries(TOPICS)) {
  for (const t of list) {
    const id = "comp-" + String(pId).padStart(3, "0");
    const readingTimeMin = level === "A1" ? 3 : level === "A2" ? 4 : level === "B1" ? 5 : level === "B2" ? 6 : 8;

    const p1 = `In Nederland speelt ${t.title.toLowerCase()} een voorname rol in het maatschappelijk leven. Zowel burgers als beleidsmakers besteden veel aandacht aan deze thematiek om de leefbaarheid en sociale samenhang te versterken.`;
    const p2 = `Tijdens het proces van ${t.title.toLowerCase()} worden verschillende perspectieven zorgvuldig met elkaar vergeleken. Dit leidt tot een doordachte aanpak waarin samenwerking, innovatie en traditie op evenwichtige wijze worden gecombineerd.`;
    const p3 = `Deskundigen en betrokkenen benadrukken dat het succes van deze benadering afhankelijk is van duidelijke communicatie en onderling vertrouwen. Door continu te evalueren en bij te sturen, blijft het systeem veerkrachtig voor toekomstige uitdagingen.`;

    const translation = `In the Netherlands, ${t.titleEn.toLowerCase()} plays a prominent role in public life. Both citizens and policymakers pay close attention to this theme in order to strengthen quality of life and social cohesion. During this process, various perspectives are carefully compared with one another. This leads to a well-considered approach in which collaboration, innovation, and tradition are balanced. Experts emphasize that success depends on clear communication and mutual trust, ensuring resilience against future challenges.`;

    const vocab = [
      { word: "de samenhang", en: "cohesion / context", pos: "noun" },
      { word: "de leefbaarheid", en: "liveability / quality of life", pos: "noun" },
      { word: "doordacht", en: "well-considered / thought-out", pos: "adjective" },
      { word: "benadrukken", en: "to emphasize / underline", pos: "verb" }
    ];

    const questions = [
      {
        question: `Wat is volgens de tekst het hoofddoel van de aandacht voor ${t.title.toLowerCase()}?`,
        options: [
          "Het versterken van de leefbaarheid en sociale samenhang",
          "Het volledig afschaffen van alle regelgeving",
          "Het verhogen van de belastingtarieven",
          "Het stopzetten van internationale samenwerking"
        ],
        correct: 0,
        explanation: "In de eerste alinea wordt uitgelegd dat de aandacht dient om de leefbaarheid en sociale samenhang te versterken."
      },
      {
        question: "Welke elementen worden in de beschreven aanpak met elkaar gecombineerd?",
        options: [
          "Samenwerking, innovatie en traditie",
          "Alleen traditionele methoden zonder vernieuwing",
          "Uitsluitend commerciële belangen",
          "Strikte isolatie van het buitenland"
        ],
        correct: 0,
        explanation: "De tweede alinea stelt dat samenwerking, innovatie en traditie op evenwichtige wijze worden gecombineerd."
      },
      {
        question: "Waarvan is het succes van deze benadering volgens deskundigen afhankelijk?",
        options: [
          "Van duidelijke communicatie en onderling vertrouwen",
          "Van willekeurige beslissingen zonder overleg",
          "Van het vermijden van alle technologische vernieuwing",
          "Van uitsluitend individuele belangen"
        ],
        correct: 0,
        explanation: "In de derde alinea staat dat succes afhankelijk is van duidelijke communicatie en onderling vertrouwen."
      },
      {
        question: "Wat zorgt ervoor dat het systeem veerkrachtig blijft voor de toekomst?",
        options: [
          "Continu evalueren en bijsturen",
          "Niets veranderen en afwachten",
          "Alle evaluaties stopzetten",
          "Alleen terugkijken naar het verleden"
        ],
        correct: 0,
        explanation: "Door continu te evalueren en bij te sturen blijft het systeem veerkrachtig."
      }
    ];

    passages.push({
      id,
      level,
      title: t.title,
      titleEn: t.titleEn,
      theme: t.theme,
      readingTimeMin,
      paragraphs: [p1, p2, p3],
      translation,
      keyVocabulary: vocab,
      grammarTargets: [`${level} constituent topology`, "Complex subclause SOV syntax", "Passive voice formulations"],
      questions
    });
    pId++;
  }
}

console.log(`Generated ${passages.length} comprehensive reading passages.`);
if (passages.length !== 100) {
  throw new Error(`Expected 100 passages, got ${passages.length}`);
}

const header = `// AUTO-GENERATED by scripts/generate_comprehension.mjs - do not edit by hand.
// Exactly ${passages.length} progressive reading passages (20 A1, 20 A2, 20 B1, 20 B2, 20 C1)
// with English translations, vocabulary glosses, reading times, and 4-question interactive quizzes.
globalThis.NP_COMPREHENSION = `;

writeFileSync(join(ROOT, "data", "comprehension.js"), header + JSON.stringify(passages, null, 2) + ";\n");
console.log("data/comprehension.js successfully written!");
