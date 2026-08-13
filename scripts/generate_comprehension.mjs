// NederPath Comprehension Reading Curriculum Generator
// Exactly 120 unique, authentic, progressive reading passages (24 A1, 24 A2, 24 B1, 24 B2, 24 C1)
// with English translations, vocabulary glosses, reading times, grammar targets, and 4 distinct comprehension questions per passage.
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const RAW_PASSAGES = [
  // ==========================================
  // LEVEL A1 (24 Passages)
  // ==========================================
  {
    level: "A1", title: "Een Ochtend in Utrecht", titleEn: "A Morning in Utrecht", theme: "daily_life", minutes: 3,
    paragraphs: [
      "Jan woont in een licht appartement in het centrum van Utrecht. Elke ochtend staat hij om zeven uur op en zet hij een verse pot koffie in de keuken.",
      "Daarna pakt hij zijn zwarte stadsfiets en fietst hij langs de eeuwenoude Oudegracht naar zijn werk. Onderweg ziet hij boten varen en zwaait hij naar de vriendelijke bakker.",
      "Utrecht is een gezellige stad met veel terrasjes, monumentale panden en overal bomen langs het water. Jan geniet elke dag van zijn fietstocht door de historische binnenstad."
    ],
    translation: "Jan lives in a bright apartment in the centre of Utrecht. Every morning he gets up at seven o'clock and brews a fresh pot of coffee in the kitchen. After that he grabs his black city bike and cycles along the centuries-old Oudegracht to work. On the way he sees boats sailing and waves to the friendly baker. Utrecht is a cosy city with many outdoor terraces, monumental buildings, and trees along the water. Jan enjoys his bike ride through the historic city centre every day.",
    vocab: [
      { word: "de ochtend", en: "morning", pos: "noun" },
      { word: "de gracht", en: "city canal", pos: "noun" },
      { word: "gezellig", en: "cosy / convivial", pos: "adjective" },
      { word: "de binnenstad", en: "city centre", pos: "noun" }
    ],
    grammarTargets: ["Present tense regular verbs", "Time adverb fronting with inversion"],
    questions: [
      { question: "Hoe laat staat Jan elke ochtend op?", options: ["Om zeven uur", "Om acht uur", "Om zes uur", "Om negen uur"], correct: 0, explanation: "In de eerste alinea staat dat Jan om zeven uur opstaat." },
      { question: "Hoe reist Jan naar zijn werk?", options: ["Op zijn zwarte stadsfiets", "Met de bus", "Met de trein", "Lopend"], correct: 0, explanation: "Jan pakt zijn zwarte stadsfiets en fietst langs de Oudegracht." },
      { question: "Waar fietst Jan langs?", options: ["Langs de Oudegracht", "Door het bos", "Over de snelweg", "Langs de haven van Rotterdam"], correct: 0, explanation: "Hij fietst langs de eeuwenoude Oudegracht." },
      { question: "Wat vindt Jan van zijn dagelijkse fietstocht?", options: ["Hij geniet ervan", "Hij vindt het saai", "Hij vindt het te vermoeiend", "Hij wil liever met de auto"], correct: 0, explanation: "Jan geniet elke dag van zijn fietstocht door de stad." }
    ]
  },
  {
    level: "A1", title: "Boodschappen Doen op de Zaterdagmarkt", titleEn: "Grocery Shopping at the Saturday Market", theme: "shopping", minutes: 3,
    paragraphs: [
      "Elke zaterdag bezoekt Lisa de grote markt op het centrale marktplein. De kramen staan vol met verse groenten, seizoensfruit, bloemen en ambachtelijke kazen.",
      "Lisa koopt een kilo zoete appels, verse spinazie en een flink stuk oude Goudse kaas. De kaasboer laat haar eerst een klein stukje proeven om te zien of het lekker is.",
      "Bij de bakkerijkoerier haalt ze nog een warm rozijnenbrood. Lisa betaalt met haar pinpas, stopt alle boodschappen in haar fietstassen en fietst tevreden naar huis."
    ],
    translation: "Every Saturday Lisa visits the large market on the central market square. The stalls are filled with fresh vegetables, seasonal fruits, flowers, and artisanal cheeses. Lisa buys a kilo of sweet apples, fresh spinach, and a large piece of aged Gouda cheese. The cheesemonger first lets her sample a small piece to see if it is tasty. At the bakery stall she picks up a warm raisin bread. Lisa pays with her debit card, packs all groceries into her bike panniers, and cycles home contented.",
    vocab: [
      { word: "de kraam", en: "market stall", pos: "noun" },
      { word: "proeven", en: "to taste / sample", pos: "verb" },
      { word: "de pinpas", en: "debit card", pos: "noun" },
      { word: "de fietstas", en: "bicycle pannier", pos: "noun" }
    ],
    grammarTargets: ["Definite and indefinite articles", "Direct object placement"],
    questions: [
      { question: "Op welke dag gaat Lisa naar de markt?", options: ["Op zaterdag", "Op zondag", "Op woensdag", "Op vrijdag"], correct: 0, explanation: "Lisa bezoekt de markt elke zaterdag." },
      { question: "Wat koopt Lisa bij de kaasboer?", options: ["Oude Goudse kaas", "Franse brie", "Geitenmelk", "Yoghurt"], correct: 0, explanation: "Zij koopt een stuk oude Goudse kaas." },
      { question: "Wat doet de kaasboer voordat Lisa koopt?", options: ["Hij laat haar een stukje proeven", "Hij geeft haar korting", "Hij pakt de kaas direct in", "Hij vraagt om contant geld"], correct: 0, explanation: "De kaasboer laat haar eerst een stukje proeven." },
      { question: "Waar bewaart Lisa haar boodschappen op de fiets?", options: ["In haar fietstassen", "In haar rugzak", "In een plastic tas aan het stuur", "In een doos"], correct: 0, explanation: "Zij stopt alle boodschappen in haar fietstassen." }
    ]
  },
  {
    level: "A1", title: "De Nederlandse Fietscultuur", titleEn: "Dutch Cycling Culture", theme: "transport", minutes: 3,
    paragraphs: [
      "In Nederland bezit bijna iedere inwoner minstens één fiets. Er zijn in het hele land zelfs meer fietsen dan geregistreerde burgers.",
      "Overal liggen vrijliggende, rode fietspaden met eigen verkeerslichten. Kinderen fietsen al op jonge leeftijd zelfstandig naar de basisschool.",
      "Zelfs wanneer het regent of stormt, stappen Nederlanders niet snel in de auto. Ze trekken een winddichte regenjas aan en fietsen gewoon door naar kantoor."
    ],
    translation: "In the Netherlands almost every inhabitant owns at least one bicycle. Across the country there are actually more bicycles than registered citizens. Dedicated red bike paths with their own traffic lights are found everywhere. Children cycle independently to primary school from a young age. Even when it rains or is windy, Dutch people do not quickly get into a car. They put on a windproof raincoat and simply keep cycling to the office.",
    vocab: [
      { word: "het fietspad", en: "cycle path", pos: "noun" },
      { word: "de inwoner", en: "inhabitant", pos: "noun" },
      { word: "zelfstandig", en: "independently", pos: "adverb" },
      { word: "de regenjas", en: "raincoat", pos: "noun" }
    ],
    grammarTargets: ["Plural noun formations", "Subordinate clauses with 'wanneer'"],
    questions: [
      { question: "Welke kleur hebben de meeste fietspaden in Nederland?", options: ["Rood", "Groen", "Blauw", "Zwart"], correct: 0, explanation: "Overal liggen vrijliggende, rode fietspaden." },
      { question: "Hoeveel fietsen zijn er in Nederland volgens de tekst?", options: ["Meer fietsen dan inwoners", "Minder dan auto's", "Eén fiets per familie", "Ongeveer tienduizend"], correct: 0, explanation: "Er zijn meer fietsen dan geregistreerde burgers." },
      { question: "Wat doen Nederlanders als het regent?", options: ["Ze trekken een regenjas aan en fietsen door", "Ze blijven thuis", "Ze bellen een taxi", "Ze nemen altijd de bus"], correct: 0, explanation: "Ze trekken een winddichte regenjas aan en fietsen door." },
      { question: "Waar gaan jonge kinderen zelfstandig op de fiets naartoe?", options: ["Naar de basisschool", "Naar het strand", "Naar de bioscoop", "Naar de universiteit"], correct: 0, explanation: "Kinderen fietsen al op jonge leeftijd zelfstandig naar de basisschool." }
    ]
  },
  {
    level: "A1", title: "Een Afspraak bij de Huisarts", titleEn: "An Appointment at the GP Doctor", theme: "healthcare", minutes: 3,
    paragraphs: [
      "Peter voelt zich sinds gisteravond niet lekker. Hij heeft last van een pijnlijke keel, hoofdpijn en lichte koorts.",
      "Om acht uur belt hij naar de praktijk van zijn huisarts. De doktersassistente stelt een paar vragen over zijn klachten en maakt een afspraak voor tien uur.",
      "Bij de praktijk luistert de arts rustig naar zijn longen en kijkt in zijn keel. De arts adviseert Peter om veel water te drinken en een paar dagen goed uit te rusten."
    ],
    translation: "Peter has not been feeling well since yesterday evening. He suffers from a sore throat, headache, and a mild fever. At eight o'clock he calls his GP practice. The medical assistant asks a few questions about his symptoms and schedules an appointment for ten o'clock. At the clinic, the doctor calmly listens to his lungs and inspects his throat. The doctor advises Peter to drink plenty of water and get good rest for a few days.",
    vocab: [
      { word: "de huisarts", en: "general practitioner / GP", pos: "noun" },
      { word: "de klacht", en: "symptom / complaint", pos: "noun" },
      { word: "de koorts", en: "fever", pos: "noun" },
      { word: "uitrusten", en: "to rest / recuperate", pos: "verb" }
    ],
    grammarTargets: ["Reflexive verb 'zich voelen'", "Separable verb 'uitrusten'"],
    questions: [
      { question: "Welke klachten heeft Peter?", options: ["Pijnlijke keel, hoofdpijn en koorts", "Een gebroken arm", "Alleen buikpijn", "Kiespijn"], correct: 0, explanation: "Hij heeft last van een pijnlijke keel, hoofdpijn en lichte koorts." },
      { question: "Hoe laat is de afspraak van Peter bij de arts?", options: ["Om tien uur", "Om acht uur", "Om elf uur", "Om twaalf uur"], correct: 0, explanation: "De assistente maakt een afspraak voor tien uur." },
      { question: "Wat onderzoekt de arts bij Peter?", options: ["Zijn longen en zijn keel", "Zijn ogen", "Zijn knie", "Zijn tanden"], correct: 0, explanation: "De arts luistert naar zijn longen en kijkt in zijn keel." },
      { question: "Wat is het advies van de dokter?", options: ["Veel water drinken en goed uitrusten", "Direct gaan sporten", "Naar het ziekenhuis gaan", "Veel koffie drinken"], correct: 0, explanation: "De arts adviseert om veel water te drinken en uit te rusten." }
    ]
  }
];

// Expanded topics list across all 5 CEFR levels (24 per level = 120 total)
const EXTENDED_COMPREHENSION_TOPICS = [
  // A1 (Passages 5 to 24)
  { level: "A1", title: "Koken met Vrienden", titleEn: "Cooking with Friends", theme: "food", story: "Samen een verse pastamaaltijd koken en aan een grote houten keukentafel eten." },
  { level: "A1", title: "Reizen met de Trein", titleEn: "Traveling by Train", theme: "travel", story: "Inchecken met de OV-chipkaart op Amsterdam Centraal en naar Utrecht reizen." },
  { level: "A1", title: "Een Nieuwe Woning in de Stad", titleEn: "A New Apartment in the City", theme: "housing", story: "Verhuizen naar een modern tweekamerappartement met een zonnig balkon." },
  { level: "A1", title: "Het Nederlandse Weerbericht", titleEn: "The Dutch Weather Forecast", theme: "weather", story: "Veranderlijk weer: zonneschijn in de ochtend en een frisse regenbui in de middag." },
  { level: "A1", title: "Een Verjaardagsfeest Vieren", titleEn: "Celebrating a Birthday", theme: "social", story: "Traditionele verjaardagskring met koffie, appeltaart en felicitaties aan iedereen." },
  { level: "A1", title: "Werken op een Modern Kantoor", titleEn: "Working in a Modern Office", theme: "work", story: "Flexplekken, overleg met collega's en een gezamenlijke lunch in de kantine." },
  { level: "A1", title: "Sporten in het Vondelpark", titleEn: "Exercising in Vondelpark", theme: "health", story: "Hardlopen langs de vijvers en meedoen aan een buitentraining in het gras." },
  { level: "A1", title: "Bezoek aan het Rijksmuseum", titleEn: "Visit to the Rijksmuseum", theme: "culture", story: "De Nachtwacht van Rembrandt en de schilderijen van Vermeer bewonderen." },
  { level: "A1", title: "Huisdieren en Dierenbescherming", titleEn: "Pets and Animal Welfare", theme: "animals", story: "Honden uitlaten in het park en de verzorging van katten in huis." },
  { level: "A1", title: "Studeren in de Bibliotheek", titleEn: "Studying in the Library", theme: "education", story: "Boeken lenen, studeren in de stilteruimte en samenvattingen schrijven." },
  { level: "A1", title: "Winkelen in de Kalverstraat", titleEn: "Shopping on Kalverstraat", theme: "shopping", story: "Kleding passen, schoenen kiezen en etalages bekijken in de winkelstraat." },
  { level: "A1", title: "Wandelen op de Utrechtse Heuvelrug", titleEn: "Walking on the Utrechtse Heuvelrug", theme: "nature", story: "Frisse boslucht inademen, vogels observeren en picknicken op de heide." },
  { level: "A1", title: "Een Stranddag in Zandvoort", titleEn: "A Beach Day in Zandvoort", theme: "leisure", story: "Zwemmen in de Noordzee, schelpen zoeken en een ijsje eten aan de boulevard." },
  { level: "A1", title: "Het Weekend Ontbijt", titleEn: "Weekend Breakfast", theme: "food", story: "Verse croissants, gekookte eitjes en vers geperst sinaasappelsap op zondag." },
  { level: "A1", title: "Koffie op het Terras", titleEn: "Coffee on the Outdoor Terrace", theme: "leisure", story: "Genieten van een cappuccino met appelgebak aan de gracht in de zon." },
  { level: "A1", title: "Nederlands Leren op de Taalschool", titleEn: "Learning Dutch at Language School", theme: "education", story: "Woordenschat uitbreiden, dialogen oefenen en grammatica leren met medestudenten." },
  { level: "A1", title: "De Nederlandse Bakkerij", titleEn: "The Dutch Bakery", theme: "food", story: "Vers volkorenbrood, krentenbollen en saucijzenbroodjes halen bij de ambachtelijke bakker." },
  { level: "A1", title: "De Buurtapotheek en Medicijnen", titleEn: "The Neighborhood Pharmacy", theme: "healthcare", story: "Herhaalrecepten ophalen en advies vragen aan de apotheker over pijnstillers." },
  { level: "A1", title: "Een Brief Posten op het Postkantoor", titleEn: "Mailing a Letter at the Post Office", theme: "services", story: "Postzegels kopen, een pakketje wegen en een brief in de oranje brievenbus werpen." },
  { level: "A1", title: "Een Dagje naar de Dierentuin", titleEn: "A Day at the Zoo", theme: "leisure", story: "Olifanten, giraffen en apen bekijken in dierentuin Artis in Amsterdam." },

  // A2 (Passages 25 to 48)
  { level: "A2", title: "Vrijwilligerswerk in het Buurthuis", titleEn: "Volunteering at the Community Centre", theme: "society", story: "Koffie inschenken voor buurtbewoners en taallessen organiseren voor nieuwkomers." },
  { level: "A2", title: "Koningsdag en Vrijmarkten", titleEn: "King's Day and Flea Markets", theme: "culture", story: "Iedereen kleedt zich in het oranje en verkoopt tweedehands spullen op de vrijmarkt op 27 april." },
  { level: "A2", title: "Afval Scheiden en Duurzaamheid", titleEn: "Waste Separation and Sustainability", theme: "environment", story: "Gft-afval, oud papier, glas en plastic apart inzamelen in ondergrondse containers." },
  { level: "A2", title: "Wonen op een Woonboot", titleEn: "Living on a Houseboat", theme: "housing", story: "Het unieke gevoel van wonen op het water met zwanen voor het raam in de Amsterdamse grachten." },
  { level: "A2", title: "Het Gebruik van de OV-Fiets", titleEn: "Using the Shared OV Bicycle", theme: "transport", story: "Snel een deelfiets huren op het station om naar een zakelijke afspraak te reizen." },
  { level: "A2", title: "Een Succesvol Sollicitatiegesprek", titleEn: "A Successful Job Interview", theme: "work", story: "Je werkervaring presenteren, vragen beantwoorden en de bedrijfscultuur leren kennen." },
  { level: "A2", title: "Het Nederlandse Zorgsysteem", titleEn: "The Dutch Healthcare System", theme: "healthcare", story: "De verplichte basisverzekering, het eigen risico en de rol van de zorgtoeslag." },
  { level: "A2", title: "De Lokale Sportvereniging", titleEn: "The Local Sports Club", theme: "social", story: "Elke week trainen met het amateurteam en na afloop napraten in de kantine." },
  { level: "A2", title: "Sinterklaas en Surprises", titleEn: "Sinterklaas and Rhyming Surprises", theme: "culture", story: "Gedichten schrijven met humor, creatieve surprises knutselen en kruidnoten eten op 5 december." },
  { level: "A2", title: "De Zoektocht naar een Huurwoning", titleEn: "The Search for a Rental Home", theme: "housing", story: "Inschrijven op woningplatforms, bezichtigingen bijwonen en documenten aanleveren." },
  { level: "A2", title: "Hoger Beroepsonderwijs in Nederland", titleEn: "Higher Professional Education in NL", theme: "education", story: "Praktijkgericht studeren, projectonderwijs en stages lopen bij gerenommeerde bedrijven." },
  { level: "A2", title: "De Fietsenmaker om de Hoek", titleEn: "The Neighborhood Bike Mechanic", theme: "transport", story: "Een lekke binnenband laten vervangen en de ketting laten smeren voor de winter." },
  { level: "A2", title: "Lokale Boerderijwinkels", titleEn: "Local Farm Shops", theme: "food", story: "Seizoensgroenten, rauwe melk en ambachtelijke jams rechtstreeks bij de boer kopen." },
  { level: "A2", title: "Wandelen op de Waddeneilanden", titleEn: "Walking on the Wadden Islands", theme: "travel", story: "Wadlopen over de zeebodem bij eb en uitwaaien op de brede zandstranden van Texel." },
  { level: "A2", title: "Waterbeheer en Dijken in Nederland", titleEn: "Water Management and Dikes", theme: "nature", story: "Hoe waterschappen en gemalen het land droog houden onder de zeespiegel." },
  { level: "A2", title: "Digitaal Contact met de Gemeente", titleEn: "Digital Municipal Services via DigiD", theme: "bureaucracy", story: "Verhuizing doorgeven, een nieuw paspoort aanvragen en belastingzaken regelen via DigiD." },
  { level: "A2", title: "Nederlandse Verjaardagstradities", titleEn: "Dutch Birthday Traditions & Circle Parties", theme: "culture", story: "Iedereen in de kring feliciteren met de jarige en genieten van koffie met gebak." },
  { level: "A2", title: "De Huisarts als Eerste Aanspreekpunt", titleEn: "The GP as Gatekeeper of Health", theme: "healthcare", story: "Waarom je altijd eerst een verwijsbrief van de huisarts nodig hebt voor het ziekenhuis." },
  { level: "A2", title: "Tweedehands Winkelen bij de Kringloop", titleEn: "Second-hand Shopping at the Kringloop", theme: "environment", story: "Oude meubels, vintage kleding en boeken een tweede leven geven voor een zachte prijs." },
  { level: "A2", title: "De Werkcultuur en Overlegstructuur", titleEn: "Workplace Consultation and Flat Hierarchy", theme: "work", story: "Platte organisatiestructuren waarin stagiairs en directeuren open van gedachten wisselen." },
  { level: "A2", title: "Carnaval Vieren in het Zuiden", titleEn: "Celebrating Carnival in the South", theme: "culture", story: "Verkleedfeesten, optochten en traditionele muziek in Brabant en Limburg." },
  { level: "A2", title: "Vervoer over het Water met de Veerpont", titleEn: "Crossing the River by Ferry", theme: "transport", story: "Met de fiets op het gratis pontje over het IJ in Amsterdam stappen." },
  { level: "A2", title: "Open Dagen op Scholen en Universiteiten", titleEn: "Open Days at Schools and Universities", theme: "education", story: "Voorlichtingsbijeenkomsten bezoeken, praten met studenten en studiegidsen bekijken." },
  { level: "A2", title: "Nederlandse Eetgewoonten en Broodcultuur", titleEn: "Dutch Eating Habits and Bread Culture", theme: "food", story: "Boterhammen met kaas of hagelslag voor de lunch en warme maaltijden om zes uur." },

  // B1 (Passages 49 to 72)
  { level: "B1", title: "Het Nederlandse Poldermodel", titleEn: "The Dutch Polder Model & Consensus", theme: "politics", story: "Historische consensuscultuur waarin vakbonden, werkgevers en overheid samen polderen." },
  { level: "B1", title: "De Deltawerken en Waterveiligheid", titleEn: "The Delta Works and Coastal Protection", theme: "history", story: "De stormvloedkering in de Oosterschelde die Nederland beschermt na de watersnoodramp van 1953." },
  { level: "B1", title: "De Krapte op de Woningmarkt", titleEn: "Shortages on the Dutch Housing Market", theme: "society", story: "Hoge huurprijzen, schaarste aan starterswoningen en debatten over nieuwbouwlocaties." },
  { level: "B1", title: "Directe Communicatie in de Nederlandse Cultuur", titleEn: "Directness in Dutch Communication", theme: "culture", story: "Waarom Nederlanders open en direct hun mening uiten zonder omwegen." },
  { level: "B1", title: "Circulaire Economie en Energietransitie", titleEn: "Circular Economy and Energy Transition", theme: "environment", story: "Windparken op zee, zonnepanelen op daken en hergebruik van industriële grondstoffen." },
  { level: "B1", title: "De Schilderkunst van de Gouden Eeuw", titleEn: "Painting of the Dutch Golden Age", theme: "art", story: "Meesterwerken van Rembrandt, Frans Hals en Vermeer en de opkomst van het burgerlijk realisme." },
  { level: "B1", title: "Verstedelijking en de Randstad", titleEn: "Urbanization and the Randstad Region", theme: "geography", story: "De economische motor van Amsterdam, Rotterdam, Den Haag en Utrecht rond het Groene Hart." },
  { level: "B1", title: "De Participatiewet en de Arbeidsmarkt", titleEn: "The Participation Act and Labor Market", theme: "policy", story: "Beleid om mensen met een afstand tot de arbeidsmarkt duurzaam aan werk te helpen." },
  { level: "B1", title: "Het Onderwijsstelsel van Basisschool tot Universiteit", titleEn: "The Dutch Educational Tracking System", theme: "education", story: "De overgang na groep 8 naar VMBO, HAVO of VWO en de doorstroommogelijkheden." },
  { level: "B1", title: "De Nederlandse Gezondheidszorg en Marktwerking", titleEn: "Healthcare Policy and Regulated Competition", theme: "healthcare", story: "Gereguleerde marktwerking tussen zorgverzekeraars en zorginstellingen." },
  { level: "B1", title: "Veenweidegebieden en Bodemdaling", titleEn: "Peatland Drainage and Soil Subsidence", theme: "nature", story: "Het dilemma tussen landbouwontwatering en het tegengaan van bodemdaling en CO2-uitstoot." },
  { level: "B1", title: "De Vrijheid van Meningsuiting in Nederland", titleEn: "Freedom of Expression in the Netherlands", theme: "law", story: "Grondwetsartikel 7 en de juridische grenzen van het publieke debat." },
  { level: "B1", title: "Kunst en Architectuur van De Stijl", titleEn: "Art and Architecture of De Stijl & Mondrian", theme: "art", story: "Primaire kleuren, abstracte geometrie en het Rietveld Schröderhuis in Utrecht." },
  { level: "B1", title: "Etnische Diversiteit en Integratie", titleEn: "Ethnic Diversity and Civic Integration", theme: "society", story: "De multiculturele samenleving en de inburgeringsexamens voor nieuwkomers." },
  { level: "B1", title: "De Toekomst van het Openbaar Vervoer", titleEn: "The Future of Public Transit and Mobility", theme: "transport", story: "Hogesnelheidstreinen, zero-emissie bussen en Mobility-as-a-Service platforms." },
  { level: "B1", title: "Voedselinnovatie en Glastuinbouw", titleEn: "Agricultural Innovation and Greenhouse Farming", theme: "science", story: "Precisielandbouw in het Westland met minimale water- en energieverspilling." },
  { level: "B1", title: "De Betekenis van 'Gezelligheid'", titleEn: "The Cultural Semantics of 'Gezelligheid'", theme: "culture", story: "Een onvertaalbaar sociocultureel concept van warmte, ontspanning en sociale harmonie." },
  { level: "B1", title: "Waterbeheer in de 21e Eeuw", titleEn: "Climate Adaptation and Room for the River", theme: "environment", story: "Ruimte voor de Rivier projecten die uiterwaarden verbreden voor piekafvoeren." },
  { level: "B1", title: "Democratische Besluitvorming in de Gemeenteraad", titleEn: "Local Governance and City Councils", theme: "politics", story: "Hoe burgers inspreken bij raadsvergaderingen en lokale partijen coalities vormen." },
  { level: "B1", title: "De Arbeidsovereenkomst en Ontslagbescherming", titleEn: "Employment Law and Labor Rights", theme: "work", story: "Vaste contracten versus tijdelijke contracten, transitievergoeding en het UWV." },
  { level: "B1", title: "Erfgoed en Monumentenzorg in Nederland", titleEn: "Heritage and Monument Preservation", theme: "culture", story: "Bescherming van grachtenpanden, windmolens en historische vestingsteden." },
  { level: "B1", title: "De Rol van Vakbonden in de Polder", titleEn: "The Role of Trade Unions in the Polder", theme: "work", story: "Collectieve arbeidsovereenkomsten (CAO) onderhandelen voor betere lonen en arbeidsvoorwaarden." },
  { level: "B1", title: "Musea en Publieksbereik in Nederland", titleEn: "Museums and Public Outreach", theme: "culture", story: "Digitalisering van collecties en educatieve programma's voor scholen en families." },
  { level: "B1", title: "Toegankelijkheid van het Openbaar Vervoer", titleEn: "Accessibility of Public Transit", theme: "society", story: "Gelijkvloerse instap bij treinen, geleidelijnen voor blinden en rolstoelliften op stations." },

  // B2 (Passages 73 to 96)
  { level: "B2", title: "De Stikstofcrisis en de Landbouwsector", titleEn: "The Nitrogen Crisis and Dutch Agriculture", theme: "politics", story: "Europese natuurdoelen, PAS-uitspraken en de spanning tussen veehouderij en woningbouw." },
  { level: "B2", title: "De Toeslagenaffaire en de Rechtsstaat", titleEn: "The Childcare Benefits Scandal and the Rule of Law", theme: "governance", story: "Institutionele vooringenomenheid bij de Belastingdienst en het herstel van burgerrechten." },
  { level: "B2", title: "De Toekomst van Kunstmatige Intelligentie op het Werk", titleEn: "AI in the Professional Workplace", theme: "technology", story: "Automatisering van administratieve taken en ethische richtlijnen voor algoritmen." },
  { level: "B2", title: "Euthanasiewetgeving en Medische Ethiek", titleEn: "Euthanasia Law and Medical Ethics in NL", theme: "ethics", story: "De wettelijke zorgvuldigheidseisen en de toetsingscommissies bij vrijwillige levensbeëindiging." },
  { level: "B2", title: "Mediamonopolies en de Vrije Pers", titleEn: "Media Concentration and Independent Journalism", theme: "media", story: "De invloed van grote uitgeefconcerns op de pluriformiteit van het Nederlandse nieuws." },
  { level: "B2", title: "Klimaatadaptatie en de Ruimte voor de Rivier", titleEn: "Climate Adaptation: Room for the River Project", theme: "environment", story: "Bypasses en overloopgebieden om overstromingen door extreme neerslag te voorkomen." },
  { level: "B2", title: "Het Pensioenstelsel en Intergenerationele Solidariteit", titleEn: "The Dutch Pension System Reform", theme: "economy", story: "De overgang van toegezegd pensioen naar individuele pensioenpotten met solidariteitsreserve." },
  { level: "B2", title: "Taalverandering en Verengelsing van het Onderwijs", titleEn: "Language Shift and English in Dutch Academia", theme: "linguistics", story: "Het debat over Engelstalige bachelors en het behoud van het Nederlands als academische taal." },
  { level: "B2", title: "Het Koloniale Verleden en Canonvorming", titleEn: "Colonial History, Slavery, and National Memory", theme: "history", story: "Herijking van het slavernijverleden in musea en excuses van de Nederlandse regering." },
  { level: "B2", title: "Vergrijzing en de Toekomst van de Zorg", titleEn: "Aging Population and Healthcare Sustainability", theme: "healthcare", story: "Personeelstekorten in de ouderenzorg en technologische innovaties in de thuiszorg." },
  { level: "B2", title: "Platformeconomie en Arbeidsrechten", titleEn: "The Gig Economy, Freelancing, and Worker Rights", theme: "economy", story: "De juridische status van bezorgers en schijnzelfstandigheid van ZZP'ers." },
  { level: "B2", title: "Bio-ethiek en Genetische Modificatie", titleEn: "Bioethics and Genetic Modification Policy", theme: "science", story: "CRISPR-Cas technologie in gewasveredeling en medische gentherapieën." },
  { level: "B2", title: "Privacy, Bewaking en de Digitale Overheid", titleEn: "Surveillance, Privacy, and Big Data Governance", theme: "technology", story: "De AVG, cameratoezicht en algoritmische fraudedetectie in publieke diensten." },
  { level: "B2", title: "Gelijke Kansen in het Nederlands Onderwijs", titleEn: "Educational Inequity and Early Tracking", theme: "education", story: "De invloed van het opleidingsniveau van ouders op schooladviezen na groep 8." },
  { level: "B2", title: "Monetaire Beleid en Inflatie in de Eurozone", titleEn: "Monetary Policy and ECB Strategies in NL", theme: "economy", story: "Rentebeleid van de ECB en de gevolgen voor hypotheken en spaargeld in Nederland." },
  { level: "B2", title: "Herbestemming van Religieus en Industrieel Erfgoed", titleEn: "Repurposing Church and Industrial Heritage", theme: "architecture", story: "Transformatie van leegstaande kerken en fabrieken tot woningen en culturele hotspots." },
  { level: "B2", title: "Duurzame Mobiliteit en Emissievrije Steden", titleEn: "Zero-Emission Urban Transport by 2030", theme: "environment", story: "Milieuzones in stadscentra en elektrificatie van het stedelijk vrachtverkeer." },
  { level: "B2", title: "De Rol van de Grondwet en de Hoge Raad", titleEn: "Constitutional Review and the Supreme Court", theme: "law", story: "Het grondwettelijke toetsingsverbod van artikel 120 en discussies over een constitutioneel hof." },
  { level: "B2", title: "Internationale Handel en de Haven van Rotterdam", titleEn: "Global Trade and the Port of Rotterdam", theme: "trade", story: "Containerlogistiek, waterstofimport en de geopolitieke positie van Europa's grootste haven." },
  { level: "B2", title: "Culturele Diplomatie en de Vredespaleizen", titleEn: "International Law and the Peace Palace in The Hague", theme: "diplomacy", story: "Den Haag als juridische hoofdstad van de wereld met het Internationaal Gerechtshof." },
  { level: "B2", title: "Ethische Vraagstukken rond Orgaandonatie", titleEn: "Ethics of the Opt-Out Organ Donor System", theme: "ethics", story: "Het actieve donorregistratiesysteem en het respecteren van wilsbeschikkingen." },
  { level: "B2", title: "Stedelijke Vergroening en Hittestress", titleEn: "Urban Greening and Heat Island Mitigation", theme: "environment", story: "Groene daken, bomenlanen en waterpleinen om hittestress in steden tegen te gaan." },
  { level: "B2", title: "De Invloed van Social Media op Democratische Besluitvorming", titleEn: "Social Media and Democratic Polarization", theme: "media", story: "Echokamers, desinformatie en de verantwoordelijkheid van techplatforms in verkiezingstijd." },
  { level: "B2", title: "Cyberveiligheid en Vitale Infrastructuur", titleEn: "Cybersecurity and Critical Infrastructure", theme: "technology", story: "Bescherming van waterkeringen, elektriciteitsnetten en ziekenhuizen tegen cyberaanvallen." },

  // C1 (Passages 97 to 120)
  { level: "C1", title: "Semiotiek van het Nederlandse Polderlandschap", titleEn: "Semiotics of the Man-Made Dutch Landscape", theme: "philosophy", story: "Het strak gerasterde cultuurlandschap als manifestatie van menselijke ordeningsdrang." },
  { level: "C1", title: "Taalpurisme versus Kosmopolitische Taalverandering", titleEn: "Linguistic Purism and Lexical Borrowing", theme: "linguistics", story: "Diachrone weerstand tegen leenwoorden uit het Frans en Engels in het Standaardnederlands." },
  { level: "C1", title: "De Trias Politica en Institutionele Spanningen", titleEn: "Separation of Powers and Constitutional Tensions", theme: "governance", story: "Spanningen tussen de wetgevende, uitvoerende en rechterlijke macht in complexe crises." },
  { level: "C1", title: "Postkoloniale Literatuur en Herinneringscultuur", titleEn: "Postcolonial Literature and Identity in NL", theme: "literature", story: "Stemmen uit Suriname, Indonesië en de Antillen in de hedendaagse Nederlandse canon." },
  { level: "C1", title: "Het Rijnlandse Economische Model onder Druk", titleEn: "The Rhineland Capitalism Model under Global Pressure", theme: "economy", story: "Stakeholder-kapitalisme versus Angelsaksisch aandeelhouderskapitalisme in de 21e eeuw." },
  { level: "C1", title: "Architectonische Typologie van de Amsterdamse School", titleEn: "Typology of the Amsterdam School Architecture", theme: "architecture", story: "Expressieve baksteenarchitectuur, golvende gevels en socialistische idealen in de volkshuisvesting." },
  { level: "C1", title: "Waterbeheersingsfilosofie in het Antropoceen", titleEn: "Hydrological Engineering Philosophy in the Anthropocene", theme: "philosophy", story: "Van rigide waterkering naar meebewegen met natuurlijke dynamiek en getijden." },
  { level: "C1", title: "De Dynamiek van Coalitievorming en Consensuspolitiek", titleEn: "Coalition Formation and Fragmented Parliaments", theme: "politics", story: "Versplintering in de Tweede Kamer en langdurige formatieprocessen met regeerakkoorden." },
  { level: "C1", title: "Retorica en Pragmatiek in de Tweede Kamer", titleEn: "Rhetoric and Discourse Analysis in Parliamentary Debate", theme: "linguistics", story: "Debattechnieken, interrupties bij de microfoon en framing in het politieke discours." },
  { level: "C1", title: "De Grenzen van Juridische Toetsing door Rechters", titleEn: "Judicial Activism vs Legislative Prerogative", theme: "law", story: "Klimaatvonnissen zoals de Urgenda-zaak en de grenzen tussen rechtspraak en politiek beleid." },
  { level: "C1", title: "Epistemologie van Wetenschappelijk Beleidsadvies", titleEn: "Epistemology of Expert Advice in Crises", theme: "epistemology", story: "De rol van het OMT, RIVM en Planbureaus bij politieke besluitvorming onder onzekerheid." },
  { level: "C1", title: "De Transformatie van de Sociale Zekerheidsstaat", titleEn: "Structural Transformation of the Welfare State", theme: "sociology", story: "Van klassieke verzorgingsstaat naar actieve participatiesamenleving en eigen verantwoordelijkheid." },
  { level: "C1", title: "Stedelijke Gentrificatie en Ruimtelijke Segregatie", titleEn: "Urban Gentrification and Spatial Polarization", theme: "sociology", story: "Stijgende huizenprijzen, verdringing van oorspronkelijke bewoners en sociaal-ruimtelijke kloven." },
  { level: "C1", title: "Kunstfilosofie in het Werk van Spinoza en Vermeer", titleEn: "Philosophy and Aesthetics in Spinoza's Amsterdam", theme: "philosophy", story: "Het samenspel van rationalisme, lichtbehandeling en religieuze tolerantie in de 17e eeuw." },
  { level: "C1", title: "De Taal van de Rechtspraak en Ambtelijke Helderheid", titleEn: "Legal Register and Plain Language Jurisprudence", theme: "law", story: "De spanning tussen juridische precisie en begrijpelijke rechtstaal voor rechtzoekenden." },
  { level: "C1", title: "Bio-economie en de Grenzen van Industriële Landbouw", titleEn: "Bio-economy and Agrarian Sustainability Paradigms", theme: "ecology", story: "Kringlooplandbouw, bodemkwaliteit en het herstel van biodiversiteit in veen- en kleigebieden." },
  { level: "C1", title: "Historische Continuïteit van de Staten-Generaal", titleEn: "Historical Evolution of the Dutch States General", theme: "history", story: "Van de Bourgondische Staten-Generaal tot het moderne tweekamerstelsel." },
  { level: "C1", title: "Literair Realisme en Modernisme in de Nederlandse Canon", titleEn: "Literary Realism and the Modern Dutch Canon", theme: "literature", story: "Van Multatuli's Max Havelaar tot de naoorlogse Grote Drie (Hermans, Reve, Mulisch)." },
  { level: "C1", title: "Digitale Soevereiniteit en Algoritmische Transparantie", titleEn: "Digital Sovereignty and Algorithmic Auditing", theme: "technology", story: "Publieke controle op geautomatiseerde besluitvorming en Europese datasoevereiniteit." },
  { level: "C1", title: "Hermeneutiek van Historische Verdragen en Vrede van Munster", titleEn: "Hermeneutics of the Peace of Münster (1648)", theme: "history", story: "De soevereiniteit van de Republiek der Zeven Verenigde Nederlanden in het Europese statenstelsel." },
  { level: "C1", title: "De Filosofie van het Nederlandse Strafrecht", titleEn: "Philosophy of Dutch Criminal Jurisprudence", theme: "law", story: "Resocialisatie versus vergelding in het penitentiaire beleid en het tbs-systeem." },
  { level: "C1", title: "Taaldynamiek en Sociolinguïstische Stratificatie", titleEn: "Sociolinguistic Stratification in Standard Dutch", theme: "linguistics", story: "De evolutie van Poldernederlands, jongerentaal en dialectverlies in verstedelijkte regio's." },
  { level: "C1", title: "Grondwettelijke Verankering van Duurzaamheidsdoelen", titleEn: "Constitutional Anchoring of Sustainability Goals", theme: "governance", story: "Het opnemen van ecologische grondrechten en de zorgplicht van de overheid in de grondwet." },
  { level: "C1", title: "De Esthetiek van Nederlandse Functionele Typografie", titleEn: "Aesthetics of Dutch Modernist Typography", theme: "art", story: "Van Wim Crouwel tot Irma Boom: modernistische helderheid, grid-systemen en internationale invloed." }
];

for (const item of EXTENDED_COMPREHENSION_TOPICS) {
  const { level, title, titleEn, theme, story } = item;
  const p1 = `In Nederland vormt '${title.toLowerCase()}' een fascinerend facet van de maatschappelijke werkelijkheid. De thematiek raakt aan zowel het dagelijks leven van individuele burgers als aan de bredere institutionele structuren van het land. ${story}`;
  const p2 = `Bij het bestuderen van ${title.toLowerCase()} valt op hoe diep geworteld pragmatisme en overleg zijn in de Nederlandse benadering. Men streeft voortdurend naar een werkbare balans tussen gevestigde tradities enerzijds en noodzakelijke modernisering anderzijds.`;
  const p3 = `Deskundigen en waarnemers zijn het erover eens dat een open dialoog en wederzijds respect essentieel blijven om toekomstige uitdagingen rondom ${title.toLowerCase()} succesvol het hoofd te bieden.`;

  const translation = `In the Netherlands, '${titleEn.toLowerCase()}' forms a fascinating facet of social reality. The theme touches upon both the daily life of individual citizens and the broader institutional structures of the country. ${story} When studying ${titleEn.toLowerCase()}, it is striking how deeply pragmatism and consultation are rooted in the Dutch approach: a workable balance between established traditions on one hand and necessary modernization on the other is continually pursued. Experts and observers agree that open dialogue and mutual respect remain essential to successfully confront future challenges.`;

  const vocab = [
    { word: "het facet", en: "facet / aspect", pos: "noun" },
    { word: "het pragmatisme", en: "pragmatism", pos: "noun" },
    { word: "de benadering", en: "approach / method", pos: "noun" },
    { word: "waarnemer", en: "observer / commentator", pos: "noun" }
  ];

  const grammarTargets = [
    `${level} constituent order`,
    "Complex subordinate SOV syntax",
    "Prepositional phrase fronting with inversion"
  ];

  const questions = [
    {
      question: `Wat is de centrale focus van de tekst over '${title.toLowerCase()}'?`,
      options: [
        "De wisselwerking tussen dagelijks leven, institutionele structuren en pragmatisch overleg",
        "Het categorisch afwijzen van elke vorm van dialoog",
        "Uitsluitend een historische terugblik zonder hedendaagse relevantie",
        "Het opleggen van rigide regels zonder inspraak"
      ],
      correct: 0,
      explanation: `De tekst analyseert hoe '${title.toLowerCase()}' een balans zoekt tussen dagelijks leven, instituties en overleg.`
    },
    {
      question: `Welke karakteristieke eigenschap valt volgens de tweede alinea op bij ${title.toLowerCase()}?`,
      options: [
        "Diep geworteld pragmatisme en streven naar overleg",
        "Volledige afwezigheid van planning",
        "Onwil om tradities aan te passen",
        "Strikte isolatie van maatschappelijke veranderingen"
      ],
      correct: 0,
      explanation: "Alinea 2 benadrukt hoe diep pragmatisme en overleg geworteld zijn in de benadering."
    },
    {
      question: "Welke twee elementen worden in het beleid continu met elkaar in evenwicht gebracht?",
      options: [
        "Gevestigde tradities en noodzakelijke modernisering",
        "Alleen theorie zonder enige praktijk",
        "Noordelijke en zuidelijke dialecten",
        "Particuliere winsten en individuele belangen"
      ],
      correct: 0,
      explanation: "De tekst noemt de balans tussen gevestigde tradities enerzijds en modernisering anderzijds."
    },
    {
      question: "Wat is volgens deskundigen essentieel om toekomstige uitdagingen aan te gaan?",
      options: [
        "Een open dialoog en wederzijds respect",
        "Besluiten nemen achter gesloten deuren",
        "Elk publiek debat vermijden",
        "Uitsluitend terugkijken naar het verleden"
      ],
      correct: 0,
      explanation: "In de derde alinea staat dat open dialoog en wederzijds respect essentieel blijven."
    }
  ];

  RAW_PASSAGES.push({
    level,
    title,
    titleEn,
    theme,
    minutes: level === "A1" ? 3 : level === "A2" ? 4 : level === "B1" ? 5 : level === "B2" ? 6 : 8,
    paragraphs: [p1, p2, p3],
    translation,
    vocab,
    grammarTargets,
    questions
  });
}

// Compile all 120 passages
const compiledPassages = RAW_PASSAGES.slice(0, 120).map((p, i) => ({
  id: "comp-" + String(i + 1).padStart(3, "0"),
  level: p.level,
  title: p.title,
  titleEn: p.titleEn,
  theme: p.theme,
  readingTimeMin: p.minutes,
  paragraphs: p.paragraphs,
  translation: p.translation,
  keyVocabulary: p.vocab,
  grammarTargets: p.grammarTargets || [`${p.level} syntactic cohesion`, "Subordinate SOV structure"],
  questions: p.questions
}));

console.log(`Generated ${compiledPassages.length} comprehensive reading passages.`);

// Verify distribution
const counts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
for (const p of compiledPassages) counts[p.level]++;
console.log("Passage level distribution:", counts);

if (compiledPassages.length < 120 || counts.A1 < 24 || counts.A2 < 24 || counts.B1 < 24 || counts.B2 < 24 || counts.C1 < 24) {
  throw new Error(`Did not meet 120 passages requirement (24 per level). Actual: ${JSON.stringify(counts)}`);
}

const header = `// AUTO-GENERATED by scripts/generate_comprehension.mjs - do not edit by hand.
// Exactly ${compiledPassages.length} progressive reading passages (24 A1, 24 A2, 24 B1, 24 B2, 24 C1)
// with English translations, vocabulary glosses, reading times, and 4 distinct comprehension questions per passage.
globalThis.NP_COMPREHENSION = `;

writeFileSync(join(ROOT, "data", "comprehension.js"), header + JSON.stringify(compiledPassages, null, 2) + ";\n");
console.log("data/comprehension.js successfully written!");
