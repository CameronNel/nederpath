// NederPath curated comprehension curriculum generator
// Only independently authored passages belong here; topic-swapped template expansion is prohibited.
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const RAW_PASSAGES = [
  // ==========================================
  // CURATED A1 PASSAGES
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
      "Bij de bakkerskraam haalt ze nog een warm rozijnenbrood. Lisa betaalt met haar pinpas, stopt alle boodschappen in haar fietstassen en fietst tevreden naar huis."
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
      "In Nederland is de fiets een alledaags vervoermiddel. Bij veel stations staan grote fietsenstallingen voor reizigers die fiets en trein combineren.",
      "In veel steden liggen vrijliggende, vaak rode fietspaden met eigen verkeerslichten. Kinderen leren er op jonge leeftijd hoe ze veilig aan het verkeer deelnemen.",
      "Ook bij regen blijven veel mensen fietsen. Ze trekken een winddichte regenjas aan en rijden voorzichtig door naar school, het station of hun werk."
    ],
    translation: "In the Netherlands, the bicycle is an everyday means of transport. At many stations there are large bicycle parking facilities for travellers who combine cycling and train travel. In many cities there are separated, often red cycle paths with their own traffic lights. Children learn at a young age how to participate safely in traffic. Even when it rains, many people continue cycling. They put on a windproof raincoat and ride carefully to school, the station, or work.",
    vocab: [
      { word: "het fietspad", en: "cycle path", pos: "noun" },
      { word: "de fietsenstalling", en: "bicycle parking facility", pos: "noun" },
      { word: "vrijliggend", en: "separated / dedicated", pos: "adjective" },
      { word: "de regenjas", en: "raincoat", pos: "noun" }
    ],
    grammarTargets: ["Plural noun formations", "Subordinate clauses with 'wanneer'"],
    questions: [
      { question: "Welke kleur hebben veel fietspaden volgens de tekst?", options: ["Rood", "Groen", "Blauw", "Zwart"], correct: 0, explanation: "In de tweede alinea staat dat veel fietspaden vaak rood zijn." },
      { question: "Wat staat er bij veel stations?", options: ["Grote fietsenstallingen", "Gratis taxistandplaatsen", "Autovrije campings", "Ondergrondse winkels"], correct: 0, explanation: "Bij veel stations staan grote fietsenstallingen voor reizigers." },
      { question: "Wat doen veel mensen als het regent?", options: ["Ze trekken een regenjas aan en fietsen voorzichtig door", "Ze blijven altijd thuis", "Ze bellen een taxi", "Ze nemen zonder uitzondering de bus"], correct: 0, explanation: "Veel mensen trekken een regenjas aan en blijven voorzichtig fietsen." },
      { question: "Wat leren kinderen op jonge leeftijd?", options: ["Veilig deelnemen aan het verkeer", "Een trein besturen", "Een auto repareren", "Verkeerslichten bouwen"], correct: 0, explanation: "De tekst zegt dat kinderen leren hoe ze veilig aan het verkeer deelnemen." }
    ]
  },
  {
    level: "A1", title: "Een Afspraak bij de Huisarts", titleEn: "An Appointment with the GP", theme: "healthcare", minutes: 3,
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

// Stable IDs are deliberately independent of array position so existing learner
// progress survives editorial reordering.
const PASSAGE_IDS = new Map([
  ["Een Ochtend in Utrecht", "comp-001"],
  ["Boodschappen Doen op de Zaterdagmarkt", "comp-002"],
  ["De Nederlandse Fietscultuur", "comp-003"],
  ["Een Afspraak bij de Huisarts", "comp-004"]
]);

function rotateQuestionOptions(question, passageIndex, questionIndex) {
  const options = [...question.options];
  const offset = (passageIndex + questionIndex) % options.length;
  return {
    ...question,
    options: options.slice(offset).concat(options.slice(0, offset)),
    correct: (question.correct - offset + options.length) % options.length
  };
}

const compiledPassages = RAW_PASSAGES.map((passage, passageIndex) => ({
  id: PASSAGE_IDS.get(passage.title),
  level: passage.level,
  title: passage.title,
  titleEn: passage.titleEn,
  theme: passage.theme,
  readingTimeMin: passage.minutes,
  paragraphs: passage.paragraphs,
  translation: passage.translation,
  keyVocabulary: passage.vocab,
  grammarTargets: passage.grammarTargets,
  questions: passage.questions.map((question, questionIndex) =>
    rotateQuestionOptions(question, passageIndex, questionIndex)
  )
}));

const allowedLevels = new Set(["A1", "A2", "B1", "B2", "C1"]);
const ids = new Set();
for (const passage of compiledPassages) {
  if (!passage.id) throw new Error(`Missing stable ID for comprehension passage: ${passage.title}`);
  if (ids.has(passage.id)) throw new Error(`Duplicate comprehension ID: ${passage.id}`);
  if (!allowedLevels.has(passage.level)) throw new Error(`Invalid CEFR level: ${passage.level}`);
  ids.add(passage.id);
}

const header = `// AUTO-GENERATED by scripts/generate_comprehension.mjs - do not edit by hand.
// Curated Dutch reading passages with authored translations, vocabulary, grammar targets,
// and passage-specific comprehension questions. Inventory size is not a quality claim.
globalThis.NP_COMPREHENSION = `;

writeFileSync(
  join(ROOT, "data", "comprehension.js"),
  header + JSON.stringify(compiledPassages, null, 2) + ";\n"
);
console.log(`Generated ${compiledPassages.length} curated comprehension passages.`);
