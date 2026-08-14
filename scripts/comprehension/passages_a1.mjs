export const passages = [
  {
    id: "comp-001",
    level: "A1",
    title: "Een Ochtend in Utrecht",
    titleEn: "A Morning in Utrecht",
    theme: "daily_life",
    minutes: 3,
    paragraphs: [
      "Jan woont in een licht appartement in het centrum van Utrecht. Elke ochtend staat hij om zeven uur op en zet hij een verse pot koffie in de keuken. Zijn kat Poesje drinkt melk uit een blauw bakje naast de koelkast.",
      "Daarna pakt hij zijn zwarte stadsfiets en fietst hij langs de oude Oudegracht naar zijn werk bij een boekhandel. Onderweg ziet hij boten varen en zwaait hij naar de vriendelijke bakker bij de Neude. De bakker houdt een warm brood omhoog.",
      "Utrecht is een gezellige stad met veel terrasjes, mooie oude gebouwen en overal bomen langs het water. Jan geniet elke dag van zijn fietstocht door de oude binnenstad. Bij de Domtoren stopt hij even en eet hij een appel uit zijn jas."
    ],
    translation: "Jan lives in a bright apartment in the centre of Utrecht. Every morning he gets up at seven o'clock and brews a fresh pot of coffee in the kitchen. His cat Poesje drinks milk from a blue bowl next to the fridge. After that he grabs his black city bike and cycles along the old Oudegracht to his work at a bookshop. On the way he sees boats sailing and waves to the friendly baker at the Neude. The baker holds up a warm loaf. Utrecht is a cosy city with many outdoor terraces, beautiful old buildings, and trees along the water. Jan enjoys his bike ride through the old city centre every day. At the Dom tower he stops briefly and eats an apple from his coat.",
    vocab: [
      { word: "de ochtend", en: "morning", pos: "noun" },
      { word: "de gracht", en: "city canal", pos: "noun" },
      { word: "gezellig", en: "cosy / convivial", pos: "adjective" },
      { word: "de binnenstad", en: "city centre", pos: "noun" },
      { word: "het appartement", en: "apartment", pos: "noun" },
      { word: "de bakker", en: "baker", pos: "noun" }
    ],
    grammarTargets: ["Present tense regular verbs", "Time adverb fronting with inversion"],
    questions: [
      { question: "Hoe laat staat Jan elke ochtend op?", options: ["Om zeven uur", "Om acht uur", "Om zes uur", "Om negen uur"], correct: 0, explanation: "In de eerste alinea staat dat Jan om zeven uur opstaat." },
      { question: "Hoe reist Jan naar zijn werk?", options: ["Met de bus", "Op zijn zwarte stadsfiets", "Met de trein", "Lopend"], correct: 1, explanation: "Jan pakt zijn zwarte stadsfiets en fietst langs de Oudegracht." },
      { question: "Waar fietst Jan langs?", options: ["Door het bos", "Over de snelweg", "Langs de Oudegracht", "Langs de haven van Rotterdam"], correct: 2, explanation: "Hij fietst langs de oude Oudegracht." },
      { question: "Wat vindt Jan van zijn dagelijkse fietstocht?", options: ["Hij vindt het saai", "Hij vindt het te vermoeiend", "Hij wil liever met de auto", "Hij geniet ervan"], correct: 3, explanation: "Jan geniet elke dag van zijn fietstocht door de stad." }
    ]
  },
  {
    id: "comp-002",
    level: "A1",
    title: "Boodschappen Doen op de Zaterdagmarkt",
    titleEn: "Grocery Shopping at the Saturday Market",
    theme: "food",
    minutes: 3,
    paragraphs: [
      "Elke zaterdag bezoekt Lisa de grote markt op het centrale marktplein in Deventer. De kramen staan vol met verse groenten, fruit, bloemen en kazen van de boer. Een vrouw verkoopt tulpen in een emmer bij de kerk.",
      "Lisa koopt een kilo zoete appels, verse spinazie en een flink stuk oude Goudse kaas. De kaasboer laat haar eerst een klein stukje proeven om te zien of het lekker is. Ze lacht en knikt ja.",
      "Bij de bakkerskraam haalt ze nog een warm rozijnenbrood. Lisa betaalt met haar pinpas, stopt alle boodschappen in haar fietstassen en fietst tevreden naar huis langs de IJssel. Haar hond Bram wacht bij de voordeur."
    ],
    translation: "Every Saturday Lisa visits the large market on the central market square in Deventer. The stalls are filled with fresh vegetables, fruit, flowers, and cheeses from the farmer. A woman sells tulips in a bucket by the church. Lisa buys a kilo of sweet apples, fresh spinach, and a large piece of aged Gouda cheese. The cheesemonger first lets her sample a small piece to see if it is tasty. She smiles and nods yes. At the bakery stall she picks up a warm raisin bread. Lisa pays with her debit card, packs all groceries into her bike panniers, and cycles home contented along the IJssel. Her dog Bram waits at the front door.",
    vocab: [
      { word: "de kraam", en: "market stall", pos: "noun" },
      { word: "proeven", en: "to taste / sample", pos: "verb" },
      { word: "de pinpas", en: "debit card", pos: "noun" },
      { word: "de fietstas", en: "bicycle pannier", pos: "noun" },
      { word: "de kaas", en: "cheese", pos: "noun" },
      { word: "de markt", en: "market", pos: "noun" }
    ],
    grammarTargets: ["Definite and indefinite articles", "Direct object placement"],
    questions: [
      { question: "Op welke dag gaat Lisa naar de markt?", options: ["Op zondag", "Op zaterdag", "Op woensdag", "Op vrijdag"], correct: 1, explanation: "Lisa bezoekt de markt elke zaterdag." },
      { question: "Wat koopt Lisa bij de kaasboer?", options: ["Franse brie", "Geitenmelk", "Oude Goudse kaas", "Yoghurt"], correct: 2, explanation: "Zij koopt een stuk oude Goudse kaas." },
      { question: "Wat doet de kaasboer voordat Lisa koopt?", options: ["Hij geeft haar korting", "Hij pakt de kaas direct in", "Hij vraagt om contant geld", "Hij laat haar een stukje proeven"], correct: 3, explanation: "De kaasboer laat haar eerst een stukje proeven." },
      { question: "Waar bewaart Lisa haar boodschappen op de fiets?", options: ["In haar fietstassen", "In haar rugzak", "In een plastic tas aan het stuur", "In een doos"], correct: 0, explanation: "Zij stopt alle boodschappen in haar fietstassen." }
    ]
  },
  {
    id: "comp-003",
    level: "A1",
    title: "De Nederlandse Fietscultuur",
    titleEn: "Dutch Cycling Culture",
    theme: "transport",
    minutes: 3,
    paragraphs: [
      "In Nederland is de fiets een alledaags vervoermiddel. Bij veel stations staan grote fietsenstallingen voor reizigers die fiets en trein combineren. In Zwolle ziet een kind een oranje fiets met een mand vol appels.",
      "In veel steden liggen aparte, vaak rode fietspaden. Die paden liggen niet op de weg. Kinderen leren er op jonge leeftijd hoe ze veilig meedoen in het verkeer. Een juf in Houten oefent met een bel en een helm.",
      "Ook bij regen blijven veel mensen fietsen. Ze trekken een waterdichte regenjas aan en rijden voorzichtig door naar school, het station of hun werk. Een man in een gele jas stopt bij een brug voor een boot."
    ],
    translation: "In the Netherlands, the bicycle is an everyday means of transport. At many stations there are large bicycle parking facilities for travellers who combine cycling and train travel. In Zwolle a child sees an orange bicycle with a basket full of apples. In many cities there are separate, often red cycle paths. Those paths are not on the road. Children learn at a young age how to take part safely in traffic. A teacher in Houten practises with a bell and a helmet. Even when it rains, many people continue cycling. They put on a waterproof raincoat and ride carefully to school, the station, or work. A man in a yellow coat stops at a bridge for a boat.",
    vocab: [
      { word: "het fietspad", en: "cycle path", pos: "noun" },
      { word: "de fietsenstalling", en: "bicycle parking facility", pos: "noun" },
      { word: "waterdicht", en: "waterproof", pos: "adjective" },
      { word: "de regenjas", en: "raincoat", pos: "noun" },
      { word: "het station", en: "station", pos: "noun" },
      { word: "het verkeer", en: "traffic", pos: "noun" }
    ],
    grammarTargets: ["Plural noun formations", "Separable verb 'aantrekken'"],
    questions: [
      { question: "Welke kleur hebben veel fietspaden volgens de tekst?", options: ["Groen", "Blauw", "Rood", "Zwart"], correct: 2, explanation: "In de tweede alinea staat dat veel fietspaden vaak rood zijn." },
      { question: "Wat staat er bij veel stations?", options: ["Gratis taxistandplaatsen", "Autovrije campings", "Ondergrondse winkels", "Grote fietsenstallingen"], correct: 3, explanation: "Bij veel stations staan grote fietsenstallingen voor reizigers." },
      { question: "Wat doen veel mensen als het regent?", options: ["Ze trekken een regenjas aan en fietsen voorzichtig door", "Ze blijven altijd thuis", "Ze bellen een taxi", "Ze nemen zonder uitzondering de bus"], correct: 0, explanation: "Veel mensen trekken een regenjas aan en blijven voorzichtig fietsen." },
      { question: "Wat leren kinderen op jonge leeftijd?", options: ["Een trein besturen", "Veilig meedoen in het verkeer", "Een auto repareren", "Verkeerslichten bouwen"], correct: 1, explanation: "De tekst zegt dat kinderen leren hoe ze veilig meedoen in het verkeer." }
    ]
  },
  {
    id: "comp-004",
    level: "A1",
    title: "Een Afspraak bij de Huisarts",
    titleEn: "An Appointment with the GP",
    theme: "health",
    minutes: 3,
    paragraphs: [
      "Peter voelt zich sinds gisteravond niet lekker. Hij heeft last van een pijnlijke keel, hoofdpijn en lichte koorts. Op het nachtkastje in Zutphen ligt een glas water en een thermometer.",
      "Om acht uur belt hij naar de praktijk van zijn huisarts. De doktersassistente stelt een paar vragen over zijn klachten en maakt een afspraak voor tien uur. Peter trekt een warme trui aan en loopt langzaam naar de IJsselkade.",
      "Bij de praktijk luistert de arts rustig naar zijn longen en kijkt in zijn keel. De arts adviseert Peter om veel water te drinken en een paar dagen goed uit te rusten. Peter koopt onderweg nog een doosje thee bij drogist De Zon."
    ],
    translation: "Peter has not been feeling well since yesterday evening. He suffers from a sore throat, headache, and a mild fever. On the bedside table in Zutphen there is a glass of water and a thermometer. At eight o'clock he calls his GP practice. The medical assistant asks a few questions about his symptoms and schedules an appointment for ten o'clock. Peter puts on a warm jumper and walks slowly to the IJssel quay. At the clinic, the doctor calmly listens to his lungs and inspects his throat. The doctor advises Peter to drink plenty of water and get good rest for a few days. On the way Peter also buys a box of tea at chemist De Zon.",
    vocab: [
      { word: "de huisarts", en: "general practitioner / GP", pos: "noun" },
      { word: "de klacht", en: "symptom / complaint", pos: "noun" },
      { word: "de koorts", en: "fever", pos: "noun" },
      { word: "uitrusten", en: "to rest / recuperate", pos: "verb" },
      { word: "de keel", en: "throat", pos: "noun" },
      { word: "de afspraak", en: "appointment", pos: "noun" }
    ],
    grammarTargets: ["Reflexive verb 'zich voelen'", "Separable verb 'uitrusten'"],
    questions: [
      { question: "Welke klachten heeft Peter?", options: ["Een gebroken arm", "Alleen buikpijn", "Kiespijn", "Pijnlijke keel, hoofdpijn en koorts"], correct: 3, explanation: "Hij heeft last van een pijnlijke keel, hoofdpijn en lichte koorts." },
      { question: "Hoe laat is de afspraak van Peter bij de arts?", options: ["Om tien uur", "Om acht uur", "Om elf uur", "Om twaalf uur"], correct: 0, explanation: "De assistente maakt een afspraak voor tien uur." },
      { question: "Wat onderzoekt de arts bij Peter?", options: ["Zijn ogen", "Zijn longen en zijn keel", "Zijn knie", "Zijn tanden"], correct: 1, explanation: "De arts luistert naar zijn longen en kijkt in zijn keel." },
      { question: "Wat is het advies van de dokter?", options: ["Direct gaan sporten", "Naar het ziekenhuis gaan", "Veel water drinken en goed uitrusten", "Veel koffie drinken"], correct: 2, explanation: "De arts adviseert om veel water te drinken en uit te rusten." }
    ]
  },
  {
    id: "comp-005",
    level: "A1",
    title: "Een Kamer Huren in Groningen",
    titleEn: "Renting a Room in Groningen",
    theme: "housing",
    minutes: 3,
    paragraphs: [
      "Amina zoekt een kamer in Groningen. Ze is student en wil dicht bij de universiteit wonen. Haar tas hangt vol folders van de Grote Markt en de universiteitsbibliotheek.",
      "Op donderdag bekijkt ze een lichte kamer op de tweede verdieping aan de Pelsterstraat. De kamer heeft een bureau, een bed en een klein balkon. De keuken deelt ze met twee huisgenoten. Elke huisgenoot heeft een plank in de koelkast.",
      "De huur is vierhonderd euro per maand, inclusief wifi. Amina tekent het contract bij de verhuurder en krijgt dezelfde dag de sleutel. Beneden staat een groene plant in de gang naast een oude piano."
    ],
    translation: "Amina is looking for a room in Groningen. She is a student and wants to live close to the university. Her bag is full of leaflets about the Grote Markt and the university library. On Thursday she views a bright room on the second floor on Pelsterstraat. The room has a desk, a bed, and a small balcony. She shares the kitchen with two housemates. Each housemate has a shelf in the fridge. The rent is four hundred euros per month, including wifi. Amina signs the contract with the landlord and receives the key the same day. Downstairs a green plant stands in the hall next to an old piano.",
    vocab: [
      { word: "de kamer", en: "room", pos: "noun" },
      { word: "de huur", en: "rent", pos: "noun" },
      { word: "de verhuurder", en: "landlord", pos: "noun" },
      { word: "het contract", en: "contract", pos: "noun" },
      { word: "de sleutel", en: "key", pos: "noun" },
      { word: "de huisgenoot", en: "housemate", pos: "noun" }
    ],
    grammarTargets: ["Present tense", "Prepositions of place"],
    questions: [
      { question: "Waarom zoekt Amina een kamer in Groningen?", options: ["Ze is student", "Ze werkt in een fabriek", "Ze is toerist", "Ze is arts"], correct: 0, explanation: "De tekst zegt dat ze student is." },
      { question: "Op welke verdieping ligt de kamer?", options: ["Op de begane grond", "Op de tweede verdieping", "Op de vijfde verdieping", "In de kelder"], correct: 1, explanation: "De kamer ligt op de tweede verdieping." },
      { question: "Hoeveel kost de huur per maand?", options: ["Driehonderd euro", "Vijfhonderd euro", "Vierhonderd euro", "Zeshonderd euro"], correct: 2, explanation: "De huur is vierhonderd euro per maand." },
      { question: "Wat krijgt Amina dezelfde dag?", options: ["Een fiets", "Een auto", "Een tafel", "De sleutel"], correct: 3, explanation: "Ze krijgt dezelfde dag de sleutel." }
    ]
  },
  {
    id: "comp-006",
    level: "A1",
    title: "Met de Bus naar School",
    titleEn: "By Bus to School",
    theme: "education",
    minutes: 3,
    paragraphs: [
      "Omar gaat elke schooldag met de bus naar het ROC in Tilburg. De halte ligt twee minuten van zijn huis aan de Ringbaan. Hij eet snel een boterham met kaas.",
      "Hij checkt in met zijn ov-chipkaart en gaat achterin zitten naast een raam. In de bus leest hij zijn huiswerk voor wiskunde. Een meisje luistert naar muziek met rode oordopjes.",
      "Om half negen stopt de bus bij de school. Omar stapt uit en loopt naar lokaal twaalf. Zijn eerste les begint om negen uur. Op het bord staat een som over procenten."
    ],
    translation: "Omar takes the bus to the ROC college in Tilburg every school day. The stop is two minutes from his house on the Ringbaan. He quickly eats a cheese sandwich. He checks in with his public-transport card and sits at the back next to a window. On the bus he reads his maths homework. A girl listens to music with red earphones. At half past eight the bus stops at the school. Omar gets off and walks to classroom twelve. His first lesson starts at nine o'clock. On the board there is a sum about percentages.",
    vocab: [
      { word: "de bus", en: "bus", pos: "noun" },
      { word: "de halte", en: "stop", pos: "noun" },
      { word: "de ov-chipkaart", en: "public transport chip card", pos: "noun" },
      { word: "het huiswerk", en: "homework", pos: "noun" },
      { word: "het lokaal", en: "classroom", pos: "noun" },
      { word: "de les", en: "lesson", pos: "noun" }
    ],
    grammarTargets: ["Time expressions", "Separable verb 'instappen/uitstappen'"],
    questions: [
      { question: "Waar gaat Omar naar school?", options: ["In Amsterdam", "In Tilburg", "In Utrecht", "In Maastricht"], correct: 1, explanation: "Hij gaat naar het ROC in Tilburg." },
      { question: "Hoe checkt Omar in?", options: ["Met contant geld", "Met een briefje", "Met zijn ov-chipkaart", "Met zijn telefoon alleen"], correct: 2, explanation: "Hij checkt in met zijn ov-chipkaart." },
      { question: "Wat leest hij in de bus?", options: ["Een krant", "Een roman", "Een menu", "Zijn huiswerk voor wiskunde"], correct: 3, explanation: "In de bus leest hij zijn huiswerk voor wiskunde." },
      { question: "Hoe laat begint de eerste les?", options: ["Om negen uur", "Om acht uur", "Om tien uur", "Om half negen"], correct: 0, explanation: "Zijn eerste les begint om negen uur." }
    ]
  },
  {
    id: "comp-007",
    level: "A1",
    title: "Eerste Dag op het Werk",
    titleEn: "First Day at Work",
    theme: "work",
    minutes: 3,
    paragraphs: [
      "Noor begint vandaag bij een bakkerij in Haarlem aan de Grote Houtstraat. Ze komt om zes uur en krijgt een schort van haar collega Mark. De oven is al warm en ruikt naar krenten.",
      "Eerst leert ze brood in de oven schuiven. Daarna helpt ze klanten aan de toonbank. Een man koopt twee croissants en een broodje kaas. Een kind wijst naar een appelflap in de vitrine.",
      "Om twee uur is haar dienst klaar. Mark zegt dat ze goed heeft gewerkt. Noor fietst blij naar huis langs de Grote Markt. In haar tas zit een klein zakje met twee oude krakelingen."
    ],
    translation: "Noor starts today at a bakery in Haarlem on Grote Houtstraat. She arrives at six o'clock and gets an apron from her colleague Mark. The oven is already warm and smells of currants. First she learns to slide bread into the oven. After that she helps customers at the counter. A man buys two croissants and a cheese roll. A child points to an apple turnover in the display. At two o'clock her shift is finished. Mark says that she has worked well. Noor cycles home happily along the Grote Markt. In her bag is a small bag with two old pretzels.",
    vocab: [
      { word: "de bakkerij", en: "bakery", pos: "noun" },
      { word: "de collega", en: "colleague", pos: "noun" },
      { word: "de toonbank", en: "counter", pos: "noun" },
      { word: "de klant", en: "customer", pos: "noun" },
      { word: "de dienst", en: "shift", pos: "noun" },
      { word: "het schort", en: "apron", pos: "noun" }
    ],
    grammarTargets: ["Present tense", "Time adverbials"],
    questions: [
      { question: "In welke stad werkt Noor?", options: ["Leiden", "Delft", "Haarlem", "Breda"], correct: 2, explanation: "Ze begint bij een bakkerij in Haarlem." },
      { question: "Wie geeft Noor een schort?", options: ["Haar baas uit Amsterdam", "Een klant", "Haar zus", "Haar collega Mark"], correct: 3, explanation: "Ze krijgt een schort van haar collega Mark." },
      { question: "Hoe laat is haar dienst klaar?", options: ["Om twee uur", "Om zes uur", "Om twaalf uur", "Om vier uur"], correct: 0, explanation: "Om twee uur is haar dienst klaar." },
      { question: "Wat koopt een man aan de toonbank?", options: ["Alleen koffie", "Twee croissants en een broodje kaas", "Een taart", "Melk"], correct: 1, explanation: "Een man koopt twee croissants en een broodje kaas." }
    ]
  },
  {
    id: "comp-008",
    level: "A1",
    title: "Een Brief van de Gemeente",
    titleEn: "A Letter from the Municipality",
    theme: "government",
    minutes: 3,
    paragraphs: [
      "Op maandag vindt Koen een blauwe envelop in de brievenbus. De brief komt van de gemeente Eindhoven. Buiten blaft de hond van buurman Piet tegen de postbode.",
      "De gemeente vraagt of zijn adres nog klopt. Koen woont nu aan de Kerkstraat, huisnummer 14. Hij moet het formulier voor 15 mei terugsturen. Op de tafel ligt een rode pen naast een kop koffie.",
      "Koen vult zijn naam, geboortedatum en adres in. Hij stopt het formulier in een envelop en brengt het naar de brievenbus op de hoek bij de slager. Daarna koopt hij een krant bij kiosk De Lantaarn."
    ],
    translation: "On Monday Koen finds a blue envelope in the letterbox. The letter comes from the municipality of Eindhoven. Outside neighbour Piet's dog barks at the postman. The municipality asks whether his address is still correct. Koen now lives on Kerkstraat, house number 14. He must send the form back before 15 May. On the table there is a red pen next to a cup of coffee. Koen fills in his name, date of birth, and address. He puts the form in an envelope and takes it to the letterbox on the corner by the butcher. After that he buys a newspaper at kiosk De Lantaarn.",
    vocab: [
      { word: "de gemeente", en: "municipality", pos: "noun" },
      { word: "de envelop", en: "envelope", pos: "noun" },
      { word: "het adres", en: "address", pos: "noun" },
      { word: "het formulier", en: "form", pos: "noun" },
      { word: "de brievenbus", en: "letterbox", pos: "noun" },
      { word: "de geboortedatum", en: "date of birth", pos: "noun" }
    ],
    grammarTargets: ["Modal verb 'moeten'", "Present tense"],
    questions: [
      { question: "Van wie komt de brief?", options: ["Van een bank", "Van een school", "Van een winkel", "Van de gemeente Eindhoven"], correct: 3, explanation: "De brief komt van de gemeente Eindhoven." },
      { question: "Aan welke straat woont Koen?", options: ["Aan de Kerkstraat", "Aan de Marktstraat", "Aan de Stationsweg", "Aan de Parklaan"], correct: 0, explanation: "Koen woont aan de Kerkstraat, huisnummer 14." },
      { question: "Wanneer moet het formulier terug?", options: ["Voor 1 juni", "Voor 15 mei", "Voor 15 april", "Voor kerst"], correct: 1, explanation: "Hij moet het formulier voor 15 mei terugsturen." },
      { question: "Wat vult Koen onder andere in?", options: ["Zijn salaris", "Zijn hobby's", "Zijn naam, geboortedatum en adres", "Zijn telefoonabonnement"], correct: 2, explanation: "Hij vult zijn naam, geboortedatum en adres in." }
    ]
  },
  {
    id: "comp-009",
    level: "A1",
    title: "Koningsdag in Apeldoorn",
    titleEn: "King's Day in Apeldoorn",
    theme: "culture",
    minutes: 3,
    paragraphs: [
      "Op 27 april viert Fatima Koningsdag in Apeldoorn. Overal ziet ze oranje kleren, vlaggen en muziek. Bij Paleis Het Loo speelt een band op een klein podium.",
      "Op het plein is een vrijmarkt. Fatima wil oude boeken en een rode lamp verkopen. Een jongen koopt twee boeken voor drie euro. Hij steekt het geld in een oranje zakje.",
      "Later eet ze een oranje tompouce bij een kraampje naast de vijver. Om vijf uur gaat ze met haar nicht naar huis. Het was een drukke, vrolijke dag. In de tas zit nog een gele ballon."
    ],
    translation: "On 27 April Fatima celebrates King's Day in Apeldoorn. Everywhere she sees orange clothes, flags, and music. At Palace Het Loo a band plays on a small stage. On the square there is a flea market. Fatima wants to sell old books and a red lamp. A boy buys two books for three euros. He puts the money in an orange bag. Later she eats an orange tompouce at a stall next to the pond. At five o'clock she goes home with her cousin. It was a busy, cheerful day. In the bag there is still a yellow balloon.",
    vocab: [
      { word: "Koningsdag", en: "King's Day", pos: "noun" },
      { word: "oranje", en: "orange", pos: "adjective" },
      { word: "de vrijmarkt", en: "flea market", pos: "noun" },
      { word: "verkopen", en: "to sell", pos: "verb" },
      { word: "de vlag", en: "flag", pos: "noun" },
      { word: "de nicht", en: "female cousin / niece", pos: "noun" }
    ],
    grammarTargets: ["Dates and numbers", "Present tense"],
    questions: [
      { question: "Op welke datum is Koningsdag in de tekst?", options: ["Op 27 april", "Op 5 mei", "Op 1 januari", "Op 25 december"], correct: 0, explanation: "Op 27 april viert Fatima Koningsdag." },
      { question: "Wat verkoopt Fatima?", options: ["Fietsen", "Oude boeken en een rode lamp", "IJs", "Kleren"], correct: 1, explanation: "Ze wil oude boeken en een rode lamp verkopen." },
      { question: "Hoeveel betaalt de jongen voor twee boeken?", options: ["Vijf euro", "Tien euro", "Drie euro", "Eén euro"], correct: 2, explanation: "Een jongen koopt twee boeken voor drie euro." },
      { question: "Wat eet Fatima later?", options: ["Soep", "Pizza", "Kaas", "Een oranje tompouce"], correct: 3, explanation: "Later eet ze een oranje tompouce." }
    ]
  },
  {
    id: "comp-010",
    level: "A1",
    title: "Een Nieuwe Telefoon in de Winkel",
    titleEn: "A New Phone in the Shop",
    theme: "technology",
    minutes: 3,
    paragraphs: [
      "Samir gaat naar een elektronicawinkel in Almere. Zijn oude telefoon is kapot. Het scherm is zwart. In zijn jas zit een losse oortje van de bus.",
      "Een medewerker laat hem twee eenvoudige toestellen zien. Samir kiest het goedkopere model. Het kost honderdtwintig euro. Op de doos staat een sticker van winkel MediaPlein.",
      "Hij betaalt met zijn bankpas en krijgt een hoesje cadeau. Thuis zet hij zijn simkaart in de nieuwe telefoon. Hij belt meteen naar zijn moeder in Lelystad. Zij lacht als ze zijn stem hoort."
    ],
    translation: "Samir goes to an electronics shop in Almere. His old phone is broken. The screen is black. In his coat is a loose earbud from the bus. An employee shows him two simple devices. Samir chooses the cheaper model. It costs one hundred and twenty euros. On the box there is a sticker from shop MediaPlein. He pays with his bank card and receives a case as a gift. At home he puts his SIM card into the new phone. He immediately calls his mother in Lelystad. She laughs when she hears his voice.",
    vocab: [
      { word: "de telefoon", en: "phone", pos: "noun" },
      { word: "kapot", en: "broken", pos: "adjective" },
      { word: "het scherm", en: "screen", pos: "noun" },
      { word: "de medewerker", en: "employee", pos: "noun" },
      { word: "de bankpas", en: "bank card", pos: "noun" },
      { word: "de simkaart", en: "SIM card", pos: "noun" }
    ],
    grammarTargets: ["Comparative 'goedkoper'", "Present tense"],
    questions: [
      { question: "Waarom gaat Samir naar de winkel?", options: ["Zijn oude telefoon is kapot", "Hij zoekt een laptop", "Hij werkt daar", "Hij koopt een tv"], correct: 0, explanation: "Zijn oude telefoon is kapot." },
      { question: "Hoeveel kost het toestel dat hij kiest?", options: ["Tachtig euro", "Honderdtwintig euro", "Tweehonderd euro", "Vijftig euro"], correct: 1, explanation: "Het kost honderdtwintig euro." },
      { question: "Wat krijgt hij cadeau?", options: ["Oordopjes", "Een lader", "Een hoesje", "Een tablet"], correct: 2, explanation: "Hij krijgt een hoesje cadeau." },
      { question: "Wie belt Samir thuis?", options: ["Zijn baas", "Zijn leraar", "Zijn broer", "Zijn moeder"], correct: 3, explanation: "Hij belt meteen naar zijn moeder." }
    ]
  },
  {
    id: "comp-011",
    level: "A1",
    title: "Afval Scheiden in de Straat",
    titleEn: "Sorting Waste on the Street",
    theme: "environment",
    minutes: 3,
    paragraphs: [
      "In de straat van Els staan drie containers. De groene is voor groente- en tuinafval. De grijze is voor restafval. Papier gaat in de blauwe bak. Een meeuw zit op de deksel bij nummer 8.",
      "Els spoelt een glazen pot om en brengt glas naar de glasbak bij de supermarkt. Plastic verpakkingen doet ze in een oranje zak. Haar tas ruikt nog naar sinaasappelschillen.",
      "Op dinsdag haalt de vuilniswagen het restafval op. Els zet de grijze container voor het huis. Haar zoon helpt mee tillen. Hij draagt een groene muts van school De Bron."
    ],
    translation: "On Els's street there are three containers. The green one is for vegetable and garden waste. The grey one is for residual waste. Paper goes in the blue bin. A seagull sits on the lid at number 8. Els rinses a glass jar and takes glass to the bottle bank at the supermarket. She puts plastic packaging in an orange bag. Her bag still smells of orange peels. On Tuesday the refuse lorry collects the residual waste. Els puts the grey container in front of the house. Her son helps lift it. He wears a green hat from school De Bron.",
    vocab: [
      { word: "het afval", en: "waste", pos: "noun" },
      { word: "de container", en: "container", pos: "noun" },
      { word: "het restafval", en: "residual waste", pos: "noun" },
      { word: "de glasbak", en: "bottle bank", pos: "noun" },
      { word: "de verpakking", en: "packaging", pos: "noun" },
      { word: "de vuilniswagen", en: "refuse lorry", pos: "noun" }
    ],
    grammarTargets: ["Colour adjectives", "Prepositions"],
    questions: [
      { question: "Waar is de groene container voor?", options: ["Voor restafval", "Voor papier", "Voor groente- en tuinafval", "Voor glas"], correct: 2, explanation: "De groene is voor groente- en tuinafval." },
      { question: "Waar brengt Els het glas?", options: ["Naar de kelder", "Naar school", "Naar het park", "Naar de glasbak bij de supermarkt"], correct: 3, explanation: "Ze brengt glas naar de glasbak bij de supermarkt." },
      { question: "Op welke dag komt de vuilniswagen voor restafval?", options: ["Op dinsdag", "Op zaterdag", "Op zondag", "Op donderdag"], correct: 0, explanation: "Op dinsdag haalt de vuilniswagen het restafval op." },
      { question: "Wie helpt Els tillen?", options: ["Haar buurvrouw", "Haar zoon", "De postbode", "Niemand"], correct: 1, explanation: "Haar zoon helpt mee tillen." }
    ]
  },
  {
    id: "comp-012",
    level: "A1",
    title: "Sparen voor een Fiets",
    titleEn: "Saving for a Bicycle",
    theme: "finance",
    minutes: 3,
    paragraphs: [
      "Yara wil een tweedehands fiets kopen. De fiets in de winkel kost honderd euro. Ze heeft nu zestig euro op haar spaarrekening. Ze wil extra geld sparen voor een slot en een bel.",
      "Elke week krijgt ze twintig euro van haar bijbaan in de supermarkt. Ze zet dat geld op de bank. Haar baas noemt haar altijd op tijd klaar bij de kassa.",
      "Na twee weken heeft ze honderd euro. Op zaterdag koopt ze de blauwe fiets bij Fietsenhuis De Pijl in Oss. De verkoper zet de trappers goed en geeft haar een slot."
    ],
    translation: "Yara wants to buy a second-hand bicycle. The bicycle in the shop costs one hundred euros. She now has sixty euros in her savings account. She wants to save extra money for a lock and a bell. Every week she gets twenty euros from her part-time job at the supermarket. She puts that money in the bank. Her boss always says she is ready on time at the till. After two weeks she has one hundred euros. On Saturday she buys the blue bicycle at bike shop De Pijl in Oss. The seller adjusts the pedals and gives her a lock.",
    vocab: [
      { word: "sparen", en: "to save (money)", pos: "verb" },
      { word: "tweedehands", en: "second-hand", pos: "adjective" },
      { word: "de spaarrekening", en: "savings account", pos: "noun" },
      { word: "de bijbaan", en: "part-time job", pos: "noun" },
      { word: "de verkoper", en: "seller", pos: "noun" },
      { word: "het slot", en: "lock", pos: "noun" }
    ],
    grammarTargets: ["Numbers", "Present tense"],
    questions: [
      { question: "Hoeveel kost de fiets?", options: ["Zestig euro", "Twintig euro", "Honderd euro", "Tachtig euro"], correct: 2, explanation: "De fiets kost honderd euro." },
      { question: "Hoeveel heeft Yara nu op haar spaarrekening?", options: ["Honderd euro", "Twintig euro", "Veertig euro", "Zestig euro"], correct: 3, explanation: "Ze heeft nu zestig euro op haar spaarrekening." },
      { question: "Waar heeft Yara een bijbaan?", options: ["In de supermarkt", "In een café", "Op school", "In een bibliotheek"], correct: 0, explanation: "Ze krijgt geld van haar bijbaan in de supermarkt." },
      { question: "Wat geeft de verkoper erbij?", options: ["Een helm", "Een slot", "Een mand", "Een pomp"], correct: 1, explanation: "De verkoper geeft haar een slot." }
    ]
  },
  {
    id: "comp-013",
    level: "A1",
    title: "Een Paspoort Aanvragen",
    titleEn: "Applying for a Passport",
    theme: "bureaucracy",
    minutes: 3,
    paragraphs: [
      "Milan moet een nieuw paspoort aanvragen. Zijn oude paspoort is verlopen. Hij maakt online een afspraak bij het stadhuis in Zwolle. Op het scherm klikt hij op een groene knop.",
      "Hij neemt een pasfoto, zijn oude paspoort en pinpas mee. Aan de balie controleert een ambtenaar zijn gegevens. In de wachtzaal leest hij een folder over reizen naar België.",
      "Milan betaalt de kosten en krijgt een briefje. Over vijf werkdagen kan hij het nieuwe paspoort ophalen. Buiten eet hij een appel op een bankje bij de Sassenpoort."
    ],
    translation: "Milan must apply for a new passport. His old passport has expired. He makes an appointment online at the town hall in Zwolle. On the screen he clicks a green button. He takes a passport photo, his old passport, and a debit card with him. At the counter a civil servant checks his details. In the waiting hall he reads a leaflet about travelling to Belgium. Milan pays the fee and receives a slip. In five working days he can collect the new passport. Outside he eats an apple on a bench by the Sassenpoort.",
    vocab: [
      { word: "het paspoort", en: "passport", pos: "noun" },
      { word: "aanvragen", en: "to apply for", pos: "verb" },
      { word: "verlopen", en: "expired", pos: "adjective" },
      { word: "het stadhuis", en: "town hall", pos: "noun" },
      { word: "de ambtenaar", en: "civil servant", pos: "noun" },
      { word: "ophalen", en: "to collect", pos: "verb" }
    ],
    grammarTargets: ["Modal verb 'moeten'", "Separable verb 'ophalen'"],
    questions: [
      { question: "Waarom heeft Milan een nieuw paspoort nodig?", options: ["Hij is het kwijt", "Het is nat", "Zijn oude paspoort is verlopen", "Hij gaat verhuizen"], correct: 2, explanation: "Zijn oude paspoort is verlopen." },
      { question: "Waar maakt hij een afspraak?", options: ["Bij de bank", "Bij de school", "Bij de bakker", "Bij het stadhuis in Zwolle"], correct: 3, explanation: "Hij maakt een afspraak bij het stadhuis in Zwolle." },
      { question: "Wat neemt hij onder andere mee?", options: ["Een pasfoto", "Een fiets", "Een hond", "Een tas vol kleren"], correct: 0, explanation: "Hij neemt een pasfoto, zijn oude paspoort en pinpas mee." },
      { question: "Wanneer kan hij het nieuwe paspoort ophalen?", options: ["Morgen", "Over vijf werkdagen", "Over een jaar", "Vandaag"], correct: 1, explanation: "Over vijf werkdagen kan hij het ophalen." }
    ]
  },
  {
    id: "comp-014",
    level: "A1",
    title: "Het Journaal op de Radio",
    titleEn: "The News on the Radio",
    theme: "media",
    minutes: 3,
    paragraphs: [
      "Elke ochtend zet Hanne de radio aan tijdens het ontbijt. Om acht uur begint het journaal. Op tafel staan havermout en een gele beker.",
      "De presentator vertelt over het weer. Vandaag is het droog en dertien graden. Daarna komt een kort bericht over een nieuwe brug in Nijmegen. Hanne hoort ook een naam van een wethouder.",
      "Hanne drinkt thee en schrijft de temperatuur op. Ze neemt geen paraplu mee. Om half negen fietst ze naar haar werk bij een apotheek aan de Waalkade. Haar jas is lichtblauw."
    ],
    translation: "Every morning Hanne turns on the radio during breakfast. At eight o'clock the news bulletin starts. On the table there is porridge and a yellow mug. The presenter talks about the weather. Today it is dry and thirteen degrees. After that there is a short report about a new bridge in Nijmegen. Hanne also hears the name of an alderman. Hanne drinks tea and writes down the temperature. She does not take an umbrella. At half past eight she cycles to her work at a pharmacy on the Waalkade. Her coat is light blue.",
    vocab: [
      { word: "de radio", en: "radio", pos: "noun" },
      { word: "het journaal", en: "news bulletin", pos: "noun" },
      { word: "de presentator", en: "presenter", pos: "noun" },
      { word: "het weer", en: "weather", pos: "noun" },
      { word: "de brug", en: "bridge", pos: "noun" },
      { word: "de paraplu", en: "umbrella", pos: "noun" }
    ],
    grammarTargets: ["Separable verb 'aanzetten'", "Negation with 'geen'"],
    questions: [
      { question: "Hoe laat begint het journaal?", options: ["Om zeven uur", "Om tien uur", "Om acht uur", "Om twaalf uur"], correct: 2, explanation: "Om acht uur begint het journaal." },
      { question: "Hoe is het weer volgens de radio?", options: ["Nat en koud", "Sneeuw", "Heel warm", "Droog en dertien graden"], correct: 3, explanation: "Het is droog en dertien graden." },
      { question: "Waarover is het korte bericht?", options: ["Over een nieuwe brug in Nijmegen", "Over een concert", "Over voetbal", "Over een staking"], correct: 0, explanation: "Er komt een kort bericht over een nieuwe brug in Nijmegen." },
      { question: "Neemt Hanne een paraplu mee?", options: ["Ja, twee", "Nee", "Alleen 's avonds", "Alleen in de auto"], correct: 1, explanation: "Ze neemt geen paraplu mee." }
    ]
  },
  {
    id: "comp-015",
    level: "A1",
    title: "Een Weekend in Maastricht",
    titleEn: "A Weekend in Maastricht",
    theme: "travel",
    minutes: 3,
    paragraphs: [
      "Lara en Tom nemen de trein naar Maastricht. Ze moeten in Roermond overstappen. De reis duurt ongeveer twee uur. Tom leest een stripboek over een boot op de Maas.",
      "In Maastricht lopen ze over de oude brug en drinken ze koffie op een plein. Lara maakt foto's van de kerk. Een man verkoopt kaarsen bij de deur.",
      "Ze slapen in een klein hotel bij het station. Op zondag eten ze vlaai en reizen ze weer naar huis. In de trein deelt Lara een stuk kersenvlaai met Tom."
    ],
    translation: "Lara and Tom take the train to Maastricht. They have to change trains in Roermond. The journey takes about two hours. Tom reads a comic book about a boat on the Meuse. In Maastricht they walk across the old bridge and drink coffee on a square. Lara takes photos of the church. A man sells candles at the door. They sleep in a small hotel near the station. On Sunday they eat vlaai and travel home again. On the train Lara shares a piece of cherry vlaai with Tom.",
    vocab: [
      { word: "de trein", en: "train", pos: "noun" },
      { word: "overstappen", en: "to change trains", pos: "verb" },
      { word: "de reis", en: "journey", pos: "noun" },
      { word: "het plein", en: "square", pos: "noun" },
      { word: "het hotel", en: "hotel", pos: "noun" },
      { word: "de vlaai", en: "Limburg pie / tart", pos: "noun" }
    ],
    grammarTargets: ["Separable verb 'overstappen'", "Present tense"],
    questions: [
      { question: "Waar stappen Lara en Tom over?", options: ["In Utrecht", "In Roermond", "In Den Haag", "In Arnhem"], correct: 1, explanation: "Ze moeten in Roermond overstappen." },
      { question: "Hoe lang duurt de reis ongeveer?", options: ["Vijf uur", "Tien minuten", "Twee uur", "Een dag"], correct: 2, explanation: "De reis duurt ongeveer twee uur." },
      { question: "Waarvan maakt Lara foto's?", options: ["Van een boot", "Van een museum", "Van een fiets", "Van de kerk"], correct: 3, explanation: "Lara maakt foto's van de kerk." },
      { question: "Wat eten ze op zondag?", options: ["Vlaai", "Hamburger", "Sushi", "Pannenkoeken"], correct: 0, explanation: "Op zondag eten ze vlaai." }
    ]
  },
  {
    id: "comp-016",
    level: "A1",
    title: "Stamppot bij Oma",
    titleEn: "Stamppot at Grandma's",
    theme: "food",
    minutes: 3,
    paragraphs: [
      "Op woensdagavond eet Daan bij oma in Kampen. Oma kookt stamppot andijvie met worst. Op het fornuis staat een oude pan met een houten lepel.",
      "Daan helpt aardappelen schillen en oma snijdt de andijvie. De keuken ruikt naar boter. Op tafel staan melk en appelmoes. Een radio speelt een oud liedje.",
      "Na het eten wast Daan de borden. Oma geeft hem nog een koekje. Om acht uur fietst hij naar huis langs de IJsselkade. In zijn zak zit een extra koekje voor morgen."
    ],
    translation: "On Wednesday evening Daan eats at grandma's in Kampen. Grandma cooks endive stamppot with sausage. On the stove stands an old pan with a wooden spoon. Daan helps peel potatoes and grandma cuts the endive. The kitchen smells of butter. On the table there are milk and apple sauce. A radio plays an old song. After the meal Daan washes the plates. Grandma gives him another biscuit. At eight o'clock he cycles home along the IJssel quay. In his pocket is an extra biscuit for tomorrow.",
    vocab: [
      { word: "de stamppot", en: "mashed potatoes with vegetables", pos: "noun" },
      { word: "de andijvie", en: "endive", pos: "noun" },
      { word: "de worst", en: "sausage", pos: "noun" },
      { word: "schillen", en: "to peel", pos: "verb" },
      { word: "de appelmoes", en: "apple sauce", pos: "noun" },
      { word: "het bord", en: "plate", pos: "noun" }
    ],
    grammarTargets: ["Present tense", "Prepositions of time"],
    questions: [
      { question: "Wat kookt oma?", options: ["Pizza", "Soep alleen", "Pasta", "Stamppot andijvie met worst"], correct: 3, explanation: "Oma kookt stamppot andijvie met worst." },
      { question: "Wat doet Daan in de keuken?", options: ["Hij helpt aardappelen schillen", "Hij slaapt", "Hij kijkt tv", "Hij belt een vriend"], correct: 0, explanation: "Daan helpt aardappelen schillen." },
      { question: "Wat staat er op tafel naast melk?", options: ["Sap", "Appelmoes", "Koffie", "IJs"], correct: 1, explanation: "Op tafel staan melk en appelmoes." },
      { question: "Wat wast Daan na het eten?", options: ["De ramen", "De fiets", "De borden", "De auto"], correct: 2, explanation: "Na het eten wast Daan de borden." }
    ]
  },
  {
    id: "comp-017",
    level: "A1",
    title: "Een Nieuwe Buurvrouw",
    titleEn: "A New Neighbour",
    theme: "relationships",
    minutes: 3,
    paragraphs: [
      "Naast Sofie komt een nieuwe buurvrouw wonen. Haar naam is Ines. Ze komt uit Spanje en spreekt een beetje Nederlands. Haar kat heet Luna en zit op de vensterbank.",
      "Sofie brengt koffie en een cake. Ines laat haar kleine woonkamer zien. Er staan nog veel dozen. In de doos bij het raam liggen foto's van Madrid.",
      "Ze willen zondag samen naar het park afspreken. Sofie is blij. Ze vindt het fijn om een vriendelijke buurvrouw te hebben. Ines geeft haar een klein blikje olijven mee."
    ],
    translation: "A new neighbour comes to live next to Sofie. Her name is Ines. She comes from Spain and speaks a little Dutch. Her cat is called Luna and sits on the windowsill. Sofie brings coffee and a cake. Ines shows her small living room. There are still many boxes. In the box by the window there are photos of Madrid. They want to arrange to walk to the park together on Sunday. Sofie is happy. She likes having a friendly neighbour. Ines gives her a small tin of olives.",
    vocab: [
      { word: "de buurvrouw", en: "female neighbour", pos: "noun" },
      { word: "de woonkamer", en: "living room", pos: "noun" },
      { word: "de doos", en: "box", pos: "noun" },
      { word: "afspreken", en: "to arrange / make an appointment", pos: "verb" },
      { word: "vriendelijk", en: "friendly", pos: "adjective" },
      { word: "het park", en: "park", pos: "noun" }
    ],
    grammarTargets: ["Separable verb 'afspreken'", "Present tense"],
    questions: [
      { question: "Hoe heet de nieuwe buurvrouw?", options: ["Sofie", "Lara", "Ines", "Els"], correct: 2, explanation: "Haar naam is Ines." },
      { question: "Waar komt Ines vandaan?", options: ["Duitsland", "België", "Italië", "Spanje"], correct: 3, explanation: "Ze komt uit Spanje." },
      { question: "Wat brengt Sofie mee?", options: ["Koffie en een cake", "Bloemen alleen", "Een plant", "Pizza"], correct: 0, explanation: "Sofie brengt koffie en een cake." },
      { question: "Wat doen ze op zondag?", options: ["Winkelen", "Samen naar het park lopen", "Koken", "Zwemmen"], correct: 1, explanation: "Ze willen zondag samen naar het park afspreken." }
    ]
  },
  {
    id: "comp-018",
    level: "A1",
    title: "Een Schoolbezoek aan het Science Center",
    titleEn: "A School Visit to the Science Centre",
    theme: "science",
    minutes: 3,
    paragraphs: [
      "Klas 3b gaat naar een science center in Delft. Meester Bram wil kaartjes uitdelen bij de ingang. Jasmijn draagt een blauwe rugzak met een sticker van een raket.",
      "De leerlingen kijken naar een proef met water en lucht. Jasmijn mag een knop indrukken. Een balletje gaat omhoog. Een gids legt uit hoe lucht duwt.",
      "In de winkel koopt niemand iets. Op de terugweg in de bus praten ze over de proef. Jasmijn vindt wetenschap leuk. Ze tekent later een balletje in haar schrift."
    ],
    translation: "Class 3b goes to a science centre in Delft. Teacher Bram wants to hand out tickets at the entrance. Jasmijn wears a blue backpack with a rocket sticker. The pupils watch an experiment with water and air. Jasmijn may press a button. A little ball goes up. A guide explains how air pushes. In the shop nobody buys anything. On the way back on the bus they talk about the experiment. Jasmijn thinks science is fun. Later she draws a little ball in her notebook.",
    vocab: [
      { word: "de klas", en: "class", pos: "noun" },
      { word: "de leerling", en: "pupil", pos: "noun" },
      { word: "de proef", en: "experiment", pos: "noun" },
      { word: "de knop", en: "button", pos: "noun" },
      { word: "de lucht", en: "air", pos: "noun" },
      { word: "de wetenschap", en: "science", pos: "noun" }
    ],
    grammarTargets: ["Modal verb 'mogen'", "Present tense"],
    questions: [
      { question: "Waar gaat klas 3b naartoe?", options: ["Naar een zwembad", "Naar een science center in Delft", "Naar een boerderij", "Naar een bioscoop"], correct: 1, explanation: "Klas 3b gaat naar een science center in Delft." },
      { question: "Wat mag Jasmijn doen?", options: ["Rennen", "Zingen", "Een knop indrukken", "Koken"], correct: 2, explanation: "Jasmijn mag een knop indrukken." },
      { question: "Koopt iemand iets in de winkel?", options: ["Ja, iedereen", "Alleen de meester", "Alleen Jasmijn", "Nee, niemand"], correct: 3, explanation: "In de winkel koopt niemand iets." },
      { question: "Wat vindt Jasmijn leuk?", options: ["Wetenschap", "Voetbal", "Wiskunde alleen", "Slaap"], correct: 0, explanation: "Jasmijn vindt wetenschap leuk." }
    ]
  },
  {
    id: "comp-019",
    level: "A1",
    title: "Boeken Lenen in de Bibliotheek",
    titleEn: "Borrowing Books at the Library",
    theme: "public_services",
    minutes: 3,
    paragraphs: [
      "Pim gaat naar de bibliotheek in Leeuwarden. Hij heeft een groene lenerspas. Aan de balie vraagt hij waar de kinderboeken staan. Hij wil drie prentenboeken lenen.",
      "Hij kiest drie prentenboeken en één boek over dieren. Bij de zelfscan gaat hij de pas en de boeken scannen. Een medewerker helpt als een piep te lang is.",
      "Hij mag de boeken vier weken houden. Pim stopt ze in zijn tas en loopt naar buiten. Het regent zacht. Op het Oldehoofsterkerkhof springt hij over een plas."
    ],
    translation: "Pim goes to the library in Leeuwarden. He has a green library card. At the desk he asks where the children's books are. He wants to borrow three picture books. He chooses three picture books and one book about animals. At the self-scan he is going to scan his card and the books. A staff member helps if a beep lasts too long. He may keep the books for four weeks. Pim puts them in his bag and walks outside. It is raining gently. On the Oldehoofsterkerkhof he jumps over a puddle.",
    vocab: [
      { word: "de bibliotheek", en: "library", pos: "noun" },
      { word: "de pas", en: "card", pos: "noun" },
      { word: "lenen", en: "to borrow", pos: "verb" },
      { word: "het prentenboek", en: "picture book", pos: "noun" },
      { word: "scannen", en: "to scan", pos: "verb" },
      { word: "de balie", en: "desk / counter", pos: "noun" }
    ],
    grammarTargets: ["Modal verb 'mogen'", "Question word 'waar'"],
    questions: [
      { question: "Welke kleur heeft Pims pas?", options: ["Rood", "Blauw", "Zwart", "Groen"], correct: 3, explanation: "Hij heeft een groene lenerspas." },
      { question: "Hoeveel prentenboeken kiest hij?", options: ["Drie", "Eén", "Vijf", "Tien"], correct: 0, explanation: "Hij kiest drie prentenboeken." },
      { question: "Hoe lang mag hij de boeken houden?", options: ["Twee dagen", "Vier weken", "Een jaar", "Eén dag"], correct: 1, explanation: "Hij mag de boeken vier weken houden." },
      { question: "Hoe is het weer als hij naar buiten loopt?", options: ["Het sneeuwt", "De zon schijnt hard", "Het regent zacht", "Het stormt"], correct: 2, explanation: "Het regent zacht." }
    ]
  },
  {
    id: "comp-020",
    level: "A1",
    title: "Wachten op de Tandarts",
    titleEn: "Waiting for the Dentist",
    theme: "health",
    minutes: 3,
    paragraphs: [
      "Lotte heeft om kwart over drie een afspraak bij de tandarts in Assen. Ze zit in de wachtkamer en leest een tijdschrift. Op de tafel staat een bakje met plastic dino's.",
      "De assistente roept haar naam. Lotte gaat in de stoel zitten. De tandarts kijkt naar haar tanden en poetst één kies schoon. Een lamp schijnt helder boven haar hoofd.",
      "Het doet geen pijn. Lotte krijgt een nieuwe tandenborstel. Ze maakt een nieuwe afspraak over een halfjaar. Buiten eet ze een peer op een bankje bij de Brink."
    ],
    translation: "Lotte has an appointment at a quarter past three with the dentist in Assen. She sits in the waiting room and reads a magazine. On the table there is a bowl of plastic dinosaurs. The assistant calls her name. Lotte sits in the chair. The dentist looks at her teeth and cleans one molar. A lamp shines brightly above her head. It does not hurt. Lotte receives a new toothbrush. She makes a new appointment in six months. Outside she eats a pear on a bench by the Brink.",
    vocab: [
      { word: "de tandarts", en: "dentist", pos: "noun" },
      { word: "de wachtkamer", en: "waiting room", pos: "noun" },
      { word: "het tijdschrift", en: "magazine", pos: "noun" },
      { word: "de kies", en: "molar", pos: "noun" },
      { word: "de tandenborstel", en: "toothbrush", pos: "noun" },
      { word: "de pijn", en: "pain", pos: "noun" }
    ],
    grammarTargets: ["Time expressions", "Negation with 'geen'"],
    questions: [
      { question: "Hoe laat is Lottes afspraak?", options: ["Om kwart over drie", "Om acht uur", "Om twaalf uur", "Om vijf uur"], correct: 0, explanation: "Ze heeft om kwart over drie een afspraak." },
      { question: "Wat leest ze in de wachtkamer?", options: ["Een roman", "Een tijdschrift", "Haar huiswerk", "Een brief"], correct: 1, explanation: "Ze leest een tijdschrift." },
      { question: "Wat poetst de tandarts schoon?", options: ["Haar bril", "Haar handen", "Eén kies", "Haar tas"], correct: 2, explanation: "De tandarts poetst één kies schoon." },
      { question: "Wat krijgt Lotte mee?", options: ["Medicijnen", "Een brief", "Een appel", "Een nieuwe tandenborstel"], correct: 3, explanation: "Lotte krijgt een nieuwe tandenborstel." }
    ]
  },
  {
    id: "comp-021",
    level: "A1",
    title: "Op Kamers in een Studentenhuis",
    titleEn: "Living in a Student House",
    theme: "housing",
    minutes: 3,
    paragraphs: [
      "Ravi deelt een studentenhuis in Wageningen met drie anderen. Hij heeft een kleine slaapkamer op zolder. Uit het raam ziet hij de toren van de universiteit.",
      "Op maandag is hij aan de beurt voor de keuken. Hij veegt de vloer en wast de pannen. 's Avonds koken ze samen pasta. Op het aanrecht staat een pot pesto uit Italië.",
      "De huur betaalt hij via de bank. Wifi werkt goed. Ravi is tevreden, maar hij zoekt nog een betere bureaulamp. In de gang hangt een gele jas van huisgenoot Teun."
    ],
    translation: "Ravi shares a student house in Wageningen with three others. He has a small bedroom in the attic. From the window he sees the university tower. On Monday it is his turn for the kitchen. He sweeps the floor and washes the pans. In the evening they cook pasta together. On the counter stands a pot of pesto from Italy. He pays the rent via the bank. Wifi works well. Ravi is content, but he is still looking for a better desk lamp. In the hall hangs a yellow coat belonging to housemate Teun.",
    vocab: [
      { word: "het studentenhuis", en: "student house", pos: "noun" },
      { word: "de slaapkamer", en: "bedroom", pos: "noun" },
      { word: "de zolder", en: "attic", pos: "noun" },
      { word: "de vloer", en: "floor", pos: "noun" },
      { word: "de pan", en: "pan", pos: "noun" },
      { word: "tevreden", en: "content / satisfied", pos: "adjective" }
    ],
    grammarTargets: ["Possessive and sharing", "Present tense"],
    questions: [
      { question: "Met hoeveel anderen deelt Ravi het huis?", options: ["Met één", "Met tien", "Met drie anderen", "Met niemand"], correct: 2, explanation: "Hij deelt het huis met drie anderen." },
      { question: "Waar is zijn slaapkamer?", options: ["In de kelder", "Op de begane grond", "In de schuur", "Op zolder"], correct: 3, explanation: "Hij heeft een kleine slaapkamer op zolder." },
      { question: "Wat is Ravi op maandag aan de beurt?", options: ["Voor de keuken", "Voor de tuin", "Voor de auto", "Voor de post"], correct: 0, explanation: "Op maandag is hij aan de beurt voor de keuken." },
      { question: "Wat zoekt hij nog?", options: ["Een stoel", "Een betere bureaulamp", "Een fiets", "Een kat"], correct: 1, explanation: "Hij zoekt nog een betere bureaulamp." }
    ]
  },
  {
    id: "comp-022",
    level: "A1",
    title: "Met de Veerpont naar Werkendam",
    titleEn: "By Ferry to Werkendam",
    theme: "transport",
    minutes: 3,
    paragraphs: [
      "Gijs neemt de veerpont over de rivier. Hij gaat naar zijn tante in Werkendam. De pont vertrekt om tien over elf. Een meeuw vliegt laag over het water.",
      "Hij zet zijn fiets tegen de reling. De wind is koud. Een schipper verkoopt koffie in een beker. Gijs houdt de beker met twee handen vast.",
      "Na twintig minuten is de overtocht klaar. Gijs fietst naar het dorp. Zijn tante wacht bij de kerk. Ze draagt een rode sjaal en heeft een tas met appels."
    ],
    translation: "Gijs takes the ferry across the river. He is going to his aunt in Werkendam. The ferry leaves at ten past eleven. A seagull flies low over the water. He puts his bicycle against the railing. The wind is cold. A skipper sells coffee in a cup. Gijs holds the cup with two hands. After twenty minutes the crossing is finished. Gijs cycles to the village. His aunt waits at the church. She wears a red scarf and has a bag of apples.",
    vocab: [
      { word: "de veerpont", en: "ferry", pos: "noun" },
      { word: "de rivier", en: "river", pos: "noun" },
      { word: "de overtocht", en: "crossing", pos: "noun" },
      { word: "de schipper", en: "skipper", pos: "noun" },
      { word: "de reling", en: "railing", pos: "noun" },
      { word: "de tante", en: "aunt", pos: "noun" }
    ],
    grammarTargets: ["Time expressions", "Present tense"],
    questions: [
      { question: "Hoe laat vertrekt de pont?", options: ["Om negen uur", "Om tien over elf", "Om twee uur", "Om zes uur"], correct: 1, explanation: "De pont vertrekt om tien over elf." },
      { question: "Hoe lang duurt de overtocht?", options: ["Een uur", "Vijf minuten", "Twintig minuten", "Een dag"], correct: 2, explanation: "Na twintig minuten is de overtocht klaar." },
      { question: "Waar wacht zijn tante?", options: ["Bij het station", "Bij de winkel", "Bij de brug", "Bij de kerk"], correct: 3, explanation: "Zijn tante wacht bij de kerk." },
      { question: "Wat verkoopt de schipper?", options: ["Koffie in een beker", "IJs", "Kaartjes voor de trein", "Brood"], correct: 0, explanation: "Een schipper verkoopt koffie in een beker." }
    ]
  },
  {
    id: "comp-023",
    level: "A1",
    title: "Een Rekening bij de Bank",
    titleEn: "A Bank Account",
    theme: "finance",
    minutes: 3,
    paragraphs: [
      "Selma opent een rekening bij een bank in Amersfoort. Ze neemt haar identiteitskaart en een brief van haar werk mee. Haar jas hangt aan een haak in de hal.",
      "De bankmedewerker stelt vragen over haar adres en inkomen. Selma moet twee papieren tekenen. Ze krijgt een pas over een week. Op het bureau staat een groene plant.",
      "Op haar telefoon zet ze de bankapp. Ze kan nu haar saldo zien. Vandaag staat er nul euro, maar vrijdag komt haar loon. Ze drinkt later thee bij café De Linde."
    ],
    translation: "Selma opens an account at a bank in Amersfoort. She takes her identity card and a letter from her work with her. Her coat hangs on a hook in the hall. The bank employee asks questions about her address and income. Selma has to sign two papers. She will get a card in a week. On the desk there is a green plant. She puts the bank app on her phone. She can now see her balance. Today there are zero euros, but on Friday her wages arrive. Later she drinks tea at café De Linde.",
    vocab: [
      { word: "de rekening", en: "account / bill", pos: "noun" },
      { word: "de identiteitskaart", en: "identity card", pos: "noun" },
      { word: "het inkomen", en: "income", pos: "noun" },
      { word: "het saldo", en: "balance", pos: "noun" },
      { word: "het loon", en: "wages", pos: "noun" },
      { word: "tekenen", en: "to sign", pos: "verb" }
    ],
    grammarTargets: ["Modal verb 'kunnen'", "Present tense"],
    questions: [
      { question: "Wat neemt Selma mee naar de bank?", options: ["Alleen een fiets", "Haar identiteitskaart en een brief van haar werk", "Een hond", "Haar paspoort van tien jaar geleden"], correct: 1, explanation: "Ze neemt haar identiteitskaart en een brief van haar werk mee." },
      { question: "Hoeveel papieren tekent ze?", options: ["Vijf", "Tien", "Twee", "Geen"], correct: 2, explanation: "Selma moet twee papieren tekenen." },
      { question: "Wanneer krijgt ze een pas?", options: ["Vandaag", "Morgenvroeg", "Over een jaar", "Over een week"], correct: 3, explanation: "Ze krijgt een pas over een week." },
      { question: "Wanneer komt haar loon?", options: ["Vrijdag", "Zondag", "Maandag", "Dinsdag"], correct: 0, explanation: "Vrijdag komt haar loon." }
    ]
  },
  {
    id: "comp-024",
    level: "A1",
    title: "Een Mail naar de Docent",
    titleEn: "An Email to the Teacher",
    theme: "education",
    minutes: 3,
    paragraphs: [
      "Nadia is ziek en kan niet naar de taalles. Ze schrijft een korte mail naar haar docent, meneer Vos. Haar kat ligt op de deken in haar kamer in Gouda.",
      "In de mail zet ze de datum en haar groepsnummer. Ze vraagt of ze het huiswerk later mag inleveren. Naast de laptop staat een kop gemberthee.",
      "Na een uur gaat meneer Vos antwoorden. Hij schrijft: rust goed en stuur het werk vrijdag. Nadia is opgelucht en gaat slapen. Op haar nachtkastje ligt een schrift met oefeningen."
    ],
    translation: "Nadia is ill and cannot go to the language class. She writes a short email to her teacher, Mr Vos. Her cat lies on the blanket in her room in Gouda. In the email she puts the date and her group number. She asks whether she may hand in the homework later. Next to the laptop there is a cup of ginger tea. After an hour Mr Vos is going to reply. He writes: rest well and send the work on Friday. Nadia is relieved and goes to sleep. On her bedside table lies a notebook with exercises.",
    vocab: [
      { word: "de mail", en: "email", pos: "noun" },
      { word: "de docent", en: "teacher", pos: "noun" },
      { word: "ziek", en: "ill", pos: "adjective" },
      { word: "inleveren", en: "to hand in", pos: "verb" },
      { word: "antwoorden", en: "to reply", pos: "verb" },
      { word: "opgelucht", en: "relieved", pos: "adjective" }
    ],
    grammarTargets: ["Modal verb 'kunnen/mogen'", "Separable verb 'inleveren'"],
    questions: [
      { question: "Waarom schrijft Nadia een mail?", options: ["Ze is ziek en kan niet naar de les", "Ze wil een baan", "Ze zoekt een huis", "Ze bestelt eten"], correct: 0, explanation: "Nadia is ziek en kan niet naar de taalles." },
      { question: "Hoe heet de docent?", options: ["Meneer Jan", "Meneer Vos", "Meneer De Vries", "Meneer Bakker"], correct: 1, explanation: "Haar docent is meneer Vos." },
      { question: "Wat vraagt Nadia?", options: ["Of de les vervalt", "Of ze een cijfer krijgt", "Of ze het huiswerk later mag inleveren", "Of ze een boek mag kopen"], correct: 2, explanation: "Ze vraagt of ze het huiswerk later mag inleveren." },
      { question: "Wanneer moet ze het werk sturen volgens het antwoord?", options: ["Morgen", "Zondag", "Vandaag", "Vrijdag"], correct: 3, explanation: "Hij schrijft: stuur het werk vrijdag." }
    ]
  }
];
