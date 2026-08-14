// NederPath Idioms & Everyday Expressions Generator
// Produces an authentic, curated bank of Dutch idioms, expressions, proverbs,
// and conversational formulas with stable, append-only IDs.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  exampleDemonstratesExpression,
  normalizeExpression,
  validateIdiomRow
} from "./idiom_rules.mjs";
import { validateRegistry, createIdAllocator, RegistryError } from "./id_allocator.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Curated authentic Dutch idioms, expressions, and proverbs with complete metadata.
const RAW_EXPRESSIONS = [
  ["Nu komt de aap uit de mouw", "Now the truth is revealed / the cat is out of the bag", "Now the monkey comes out of the sleeve", "idiom", "B1", "Toen hij zijn ware bedoelingen bekende, kwam de aap uit de mouw.", "When he confessed his true intentions, the truth finally came out.", "Used when hidden motives or facts are finally revealed.", "", "truth, revelation"],
  ["Helaas pindakaas", "Too bad / that's tough luck (informal, humorous)", "Unfortunately peanut butter", "colloquial", "A2", "De winkel is al gesloten, dus helaas pindakaas!", "The shop is already closed, so too bad!", "Playful Dutch rhyming expression used when something cannot be changed.", "Informal; do not use in solemn/formal contexts.", "daily, informal"],
  ["Voor een appel en een ei", "For next to nothing / very cheaply", "For an apple and an egg", "idiom", "A2", "Hij kocht die prachtige vintage fiets voor een appel en een ei op de markt.", "He bought that beautiful vintage bicycle for next to nothing at the market.", "Extremely common everyday price idiom.", "", "shopping, money"],
  ["Met de gebakken peren zitten", "To be left holding the bag / facing the consequences", "To sit with the baked pears", "idiom", "B1", "Zij namen de verkeerde beslissing en nu zitten wij met de gebakken peren.", "They made the wrong decision and now we are left facing the consequences.", "Used when someone else's mistake causes you trouble.", "", "trouble, consequences"],
  ["Iets onder de knie krijgen", "To master something / get the hang of something", "To get something under the knee", "idiom", "A2", "Het kostte wat tijd, maar nu heeft zij de grammatica goed onder de knie gekregen.", "It took some time, but now she really got the hang of the grammar.", "Commonly used for learning skills, languages, and tools.", "", "learning, skills"],
  ["De kat uit de boom kijken", "To adopt a wait-and-see attitude / hold back", "To look the cat out of the tree", "idiom", "B1", "In nieuwe sociale groepen kijkt hij liever eerst de kat uit de boom.", "In new social groups he prefers to wait and see first before participating.", "Describes a cautious, observant personality or strategy.", "", "character, strategy"],
  ["Een open deur intrappen", "To state the obvious / preach to the converted", "To kick in an open door", "idiom", "B1", "Zeggen dat beweging gezond is, is een open deur intrappen.", "Saying that exercise is healthy is stating the obvious.", "Frequently used in debates, presentations, and journalism.", "", "communication, opinion"],
  ["Water naar de zee dragen", "To carry coals to Newcastle / do something futile", "To carry water to the sea", "idiom", "B1", "Extra foldertjes drukken voor een digitaal publiek is water naar de zee dragen.", "Printing extra leaflets for a digital audience is carrying coals to Newcastle.", "Expresses pointless or redundant effort.", "", "futile, effort"],
  ["Iets met een korreltje zout nemen", "To take something with a grain of salt", "To take something with a grain of salt", "idiom", "A2", "Zijn verhalen zijn altijd aangedikt, neem ze met een korreltje zout.", "His stories are always exaggerated; take them with a grain of salt.", "Direct equivalent of the English phrase.", "", "caution, skepticism"],
  ["De knoop doorhakken", "To cut the knot / make a decisive choice", "To chop through the knot", "idiom", "B1", "Na urenlang vergaderen hakte de directeur eindelijk de knoop door.", "After hours of meetings, the director finally made the decision.", "Work and leadership context.", "", "decision, leadership"],
  ["Op eieren lopen", "To walk on eggshells / act very delicately", "To walk on eggs", "idiom", "B1", "Bij die gevoelige klant loopt het team voortdurend op eieren.", "With that sensitive client the team is constantly walking on eggshells.", "Situations requiring extreme tact.", "", "caution, relations"],
  ["Over koetjes en kalfjes praten", "To make small talk / talk about trivial matters", "To talk about little cows and little calves", "idiom", "A2", "Tijdens de receptie praatten we even over koetjes en kalfjes.", "During the reception we made some small talk for a moment.", "Everyday social pleasantries.", "", "social, conversation"],
  ["Niet geschoten is altijd mis", "You miss 100% of the shots you don't take", "Not shot is always missed", "proverb", "A2", "Stuur die sollicitatiebrief toch maar op: niet geschoten is altijd mis!", "Send in that application letter anyway: nothing ventured, nothing gained!", "Encouragement to take a reasonable chance.", "", "courage, motivation"],
  ["Wie het kleine niet eert, is het grote niet weerd", "Look after the pennies and the pounds will look after themselves", "He who does not honour the small is not worth the big", "proverb", "B1", "Wees dankbaar voor elke kleine donatie; wie het kleine niet eert, is het grote niet weerd.", "Be grateful for every small donation; every little bit truly counts.", "Traditional Dutch proverb emphasizing modest thrift.", "", "modesty, gratitude"],
  ["De kogel is door de kerk", "The decision is finally made / the die is cast", "The bullet is through the church", "idiom", "B1", "Eindelijk is de kogel door de kerk: we gaan verhuizen naar Utrecht.", "Finally the decision is made: we are moving to Utrecht.", "Used after protracted debate or negotiations.", "", "decision, news"],
  ["Een appeltje met iemand te schillen hebben", "To have a bone to pick with someone", "To have an apple to peel with someone", "idiom", "B1", "Ik moet even met hem praten, want ik heb nog een appeltje met hem te schillen.", "I need to speak with him, because I have a bone to pick with him.", "Used when addressing an unresolved grievance.", "", "conflict, relations"],
  ["Door de mand vallen", "To be exposed / revealed as a fraud or failure", "To fall through the basket", "idiom", "B1", "Toen hij de cijfers niet kon verklaren, viel hij door de mand.", "When he couldn't explain the numbers, he was completely exposed.", "Common in politics, journalism, and daily news.", "", "truth, failure"],
  ["In het diepe gegooid worden", "To be thrown in at the deep end", "To be thrown into the deep", "idiom", "B1", "Op mijn eerste werkdag werd ik meteen in het diepe gegooid.", "On my first working day I was immediately thrown in at the deep end.", "Very common in Dutch onboarding/work contexts.", "", "work, learning"],
  ["Het ijs breken", "To break the ice", "To break the ice", "idiom", "A2", "Een grapje hielp om het ijs te breken tijdens de bijeenkomst.", "A small joke helped to break the ice during the meeting.", "Social phrase for easing initial stiffness.", "", "social, meeting"],
  ["De bloemetjes buitenzetten", "To paint the town red / celebrate exuberantly", "To put the little flowers outside", "idiom", "B1", "Na de examens gaan we vanavond de bloemetjes buitenzetten in de stad.", "After the exams we are going to paint the town red tonight in the city.", "Informal celebration idiom.", "", "leisure, fun"],
  ["Met de neus in de boter vallen", "To land on one's feet / be in luck", "To fall with the nose into the butter", "idiom", "B1", "Zij kwam net binnen toen het buffet opende; ze viel met haar neus in de boter.", "She entered right when the buffet opened; she was in great luck.", "Describes an unexpected stroke of good fortune.", "", "luck, serendipity"],
  ["Lachen als een boer die kiespijn heeft", "To smile wryly / force a grim smile", "To laugh like a farmer with a toothache", "idiom", "B2", "Hij feliciteerde zijn rivaal, maar lachte als een boer die kiespijn heeft.", "He congratulated his rival, but gave a wry, pained smile.", "Visual expression for forced, uncomfortable amusement.", "", "emotions, reactions"],
  ["Een hart onder de riem steken", "To encourage someone / give a morale boost", "To stick a heart under the belt", "idiom", "B1", "We stuurden haar een bloemetje om haar een hart onder de riem te steken.", "We sent her some flowers to encourage her.", "Warm expression of solidarity and sympathy.", "", "support, friendship"],
  ["Het regent pijpenstelen", "It is raining cats and dogs / pouring down", "It is raining pipe stems", "idiom", "A2", "Vergeet je paraplu niet, want het regent buiten pijpenstelen.", "Don't forget your umbrella, because it is pouring down outside.", "Essential Dutch weather idiom.", "", "weather, daily"],
  ["Nu breekt mijn klomp", "I am totally flabbergasted / that beats everything!", "Now breaks my wooden shoe", "colloquial", "A2", "Heeft hij dat echt gezegd? Nou, nu breekt mijn klomp!", "Did he really say that? Well, I am completely flabbergasted!", "Classic expression of genuine astonishment.", "", "surprise, disbelief"],
  ["De puntjes op de i zetten", "To dot the i's and cross the t's / finalize the details", "To put the dots on the i", "idiom", "B1", "We moeten alleen nog even de puntjes op de i zetten voor het rapport.", "We only need to finalize the fine details for the report.", "Workplace precision idiom.", "", "work, detail"],
  ["Oost west, thuis best", "East, west, home's best / there's no place like home", "East west, at home best", "proverb", "A1", "Na een lange reis dacht hij: oost west, thuis best.", "After a long journey he thought: there's no place like home.", "Traditional Dutch saying.", "", "travel, home"],
  ["Al draagt een aap een gouden ring, het is en blijft een lelijk ding", "Clothes don't make the man / you can't put lipstick on a pig", "Even if a monkey wears a golden ring, it is and remains an ugly thing", "proverb", "B2", "Die dure auto verandert zijn slechte gedrag niet; al draagt een aap een gouden ring...", "That expensive car doesn't change his bad behaviour; clothes don't make the man.", "Classic Dutch moral proverb.", "", "wisdom, critique"],
  ["In de soep lopen", "To go completely wrong / turn into a shambles", "To run into the soup", "idiom", "A2", "Door de treinstoring liep de hele planning in de soep.", "Due to the train disruption the entire schedule went completely wrong.", "Very common everyday idiom for disrupted plans.", "", "trouble, schedule"],
  ["Beter laat dan nooit", "Better late than never", "Better late than never", "proverb", "A1", "Fijn dat je er bent, beter laat dan nooit!", "Glad you are here, better late than never!", "Universal saying in Dutch.", "", "daily, social"]
];

const idRegistryPath = join(ROOT, "data", "idiom_ids.json");
if (!existsSync(idRegistryPath)) {
  throw new Error("FATAL: tracked historical ID registry data/idiom_ids.json is missing.");
}

let idRegistry;
try {
  idRegistry = JSON.parse(readFileSync(idRegistryPath, "utf8"));
} catch (err) {
  throw new Error(`FATAL: data/idiom_ids.json cannot be parsed: ${err.message}`);
}

let validatedRegistry;
try {
  validatedRegistry = validateRegistry(idRegistry, {
    prefix: "idm-",
    idPattern: /^idm-(\d{4,})$/,
    normalize: normalizeExpression,
    digits: 4
  });
} catch (err) {
  if (err instanceof RegistryError) throw new Error(`FATAL: data/idiom_ids.json is invalid: ${err.message}`);
  throw err;
}

const allocator = createIdAllocator(validatedRegistry, {
  prefix: "idm-",
  idPattern: /^idm-(\d{4,})$/,
  normalize: normalizeExpression,
  formatId: (num) => `idm-${String(num).padStart(4, "0")}`
});

const idiomList = [];
const sourceExpressions = new Map();

function addSourceRow(row) {
  const normalized = normalizeExpression(row.dutch);
  if (!normalized) throw new Error("FATAL: curated idiom source contains an empty Dutch expression.");
  const previous = sourceExpressions.get(normalized);
  if (previous) {
    throw new Error(`FATAL: duplicate normalized idiom source '${normalized}' (${previous} and ${row.source}).`);
  }
  sourceExpressions.set(normalized, row.source || "unknown source");

  const output = {
    id: allocator.assignId(normalized),
    dutch: row.dutch,
    meaning: row.meaning,
    literal: row.literal ?? null,
    register: row.register,
    level: row.level,
    example: row.example,
    exampleEn: row.exampleEn ?? null,
    contextNote: row.contextNote ?? null,
    usageWarning: row.usageWarning ?? null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    related: Array.isArray(row.related) ? row.related : []
  };
  const errors = validateIdiomRow(output);
  if (errors.length) throw new Error(`FATAL: invalid idiom source '${normalized}': ${errors.join(", ")}`);
  const exampleReason = exampleDemonstratesExpression(output.dutch, output.example);
  if (!exampleReason) {
    throw new Error(`FATAL: Dutch example does not demonstrate '${output.dutch}' (${output.id}).`);
  }
  idiomList.push(output);
}

for (const [index, expr] of RAW_EXPRESSIONS.entries()) {
  const [dutch, meaning, literal, register, level, example, exampleEn, contextNote, usageWarning, tagsStr] = expr;
  addSourceRow({
    source: `RAW_EXPRESSIONS[${index}]`, dutch, meaning, literal, register, level, example, exampleEn,
    contextNote, usageWarning, tags: tagsStr.split(", "), related: []
  });
}

// Conversational formulas, polite Dutch phrases, meeting & daily templates
const THEMES = [
  {
    theme: "Groeten & Afscheid",
    level: "A1",
    register: "polite",
    items: [
      ["Goedemorgen, hoe gaat het met u?", "Good morning, how are you? (formal)", "Goedemorgen meneer Jansen, hoe gaat het met u vandaag?"],
      ["Goedemiddag, alles goed?", "Good afternoon, all well? (informal/neutral)", "Hoi Peter, goedemiddag, alles goed met de studie?"],
      ["Goedenavond allemaal", "Good evening everyone", "Goedenavond allemaal, welkom bij deze presentatie."],
      ["Prettig weekend gewenst!", "Have a nice weekend!", "Het werk zit erop; prettig weekend gewenst iedereen!"],
      ["Fijne dag verder!", "Have a nice rest of your day!", "Dank u wel voor uw hulp en een fijne dag verder!"],
      ["Tot ziens en tot de volgende keer", "Goodbye and see you next time", "Bedankt voor de gezellige les en tot ziens en tot de volgende keer!"]
    ]
  },
  {
    theme: "Sociale Gelegenheden & Wensen",
    level: "A1",
    register: "neutral",
    items: [
      ["Eet smakelijk!", "Enjoy your meal! / Bon appétit!", "Het eten staat op tafel: eet smakelijk allemaal!"],
      ["Proost!", "Cheers! (toast)", "Zij hieven het glas: proost op het goede nieuws!"],
      ["Gezondheid!", "Bless you! (after sneezing) / Good health!", "Toen hij niesde, zei iedereen direct: gezondheid!"],
      ["Hartelijk gefeliciteerd met je verjaardag!", "Warm congratulations on your birthday!", "Hartelijk gefeliciteerd met je verjaardag en een fijne dag toegewenst!"],
      ["Veel succes met het examen!", "Good luck with the exam!", "Je hebt goed geoefend, dus veel succes met het examen morgen!"]
    ]
  },
  {
    theme: "Zakelijk Overleg & Werk",
    level: "B1",
    register: "neutral",
    items: [
      ["Zullen we even kort overleggen?", "Shall we have a brief consultation / chat?", "Heb je vijf minuutjes? Zullen we even kort overleggen over het project?"],
      ["Ik kom hier later op terug", "I will get back to this later", "Dat moet ik even navragen bij de manager; ik kom hier later op terug."],
      ["Kun je dat even op de mail zetten?", "Could you put that in an email?", "Dat is een goed voorstel, kun je dat even op de mail zetten?"],
      ["Laten we de koppen bij elkaar steken", "Let's put our heads together / brainstorm", "Het probleem is ingewikkeld, dus laten we de koppen bij elkaar steken."],
      ["Ik zit vol tot het einde van de week", "I am fully booked until the end of the week", "Helaas kan ik geen nieuwe afspraken plannen; ik zit vol tot het einde van de week."],
      ["Laten we even een streep trekken onder deze discussie", "Let's draw a line under this discussion", "We hebben alle standpunten gehoord, laten we nu een streep trekken onder deze discussie."],
      ["Dat staat buiten kijf", "That is beyond question / unquestionable", "Dat zij hard heeft gewerkt voor dit resultaat staat buiten kijf."],
      ["Iemand op de hoogte houden", "To keep someone informed / in the loop", "Zodra ik meer nieuws heb, zal ik je direct op de hoogte houden."],
      ["Een vinger aan de pols houden", "To keep one's finger on the pulse / monitor closely", "De projectleider houdt voortdurend een vinger aan de pols bij de voortgang."],
      ["Met betrekking tot uw schrijven", "With reference to your letter/message (formal)", "Met betrekking tot uw schrijven van 12 maart delen wij u het volgende mede:"]
    ]
  },
  {
    theme: "Meningen & Gevoelens",
    level: "A2",
    register: "colloquial",
    items: [
      ["Dat meen je niet!", "You don't mean it! / No way! / You're kidding!", "Heeft zij de hoofdprijs gewonnen? Dat meen je niet!"],
      ["Geen probleem, graag gedaan!", "No problem, you're welcome!", "Dank voor de lift naar het station. — Geen probleem, graag gedaan!"],
      ["Maak je geen zorgen", "Don't worry", "Alles komt goed met de verhuizing, maak je geen zorgen."],
      ["Dat hangt ervan af", "That depends", "Gaan we buiten zitten? Dat hangt ervan af of het gaat regenen."],
      ["Nou en of!", "You bet! / And how! / Absolutely!", "Heb je genoten van de vakantie op Texel? — Nou en of!"],
      ["Wat een toeval!", "What a coincidence!", "Komen we elkaar hier weer tegen in Rotterdam, wat een toeval!"],
      ["Het zit me tot hier", "I've had it up to here / I'm fed up", "Die constante herrie van de buren zit me werkelijk tot hier."],
      ["Daar ben ik het helemaal mee eens", "I completely agree with that", "Dat openbaar vervoer betaalbaar moet blijven, daar ben ik het helemaal mee eens."],
      ["Ik heb er gemengde gevoelens over", "I have mixed feelings about it", "Over het nieuwe beleid van de gemeente heb ik eerlijk gezegd gemengde gevoelens."],
      ["Geen sprake van!", "Out of the question! / No way!", "Gaan we in deze storm fietsen? Geen sprake van!"]
    ]
  },
  {
    theme: "Dagelijkse Dienstverlening & Winkels",
    level: "A1",
    register: "polite",
    items: [
      ["Mag ik de rekening, alstublieft?", "May I have the bill, please?", "Pardon ober, mag ik de rekening, alstublieft?"],
      ["Pinnen of contant?", "Card (debit) or cash?", "Dat is dan vijftien euro vijftig. Pinnen of contant?"],
      ["Wilt u er een bonnetje bij?", "Would you like a receipt with that?", "Alstublieft uw wisselgeld. Wilt u er een bonnetje bij?"],
      ["Mag ik even passen?", "May I try this on for a moment?", "Deze jas is erg mooi, mag ik hem even passen in het pashokje?"],
      ["Waar kan ik het station vinden?", "Where can I find the station?", "Pardon meneer, weet u waar ik het centrale treinstation kan vinden?"],
      ["Is deze stoel nog vrij?", "Is this seat still available?", "Pardon mevrouw, is deze stoel naast u in de trein nog vrij?"],
      ["Wilt u hier iets bij drinken?", "Would you like something to drink with this?", "Welkom in ons café. Wilt u hier alvast iets bij drinken?"],
      ["Heeft u dit in een andere maat?", "Do you have this in a different size?", "Deze trui is iets te klein, heeft u deze trui in een grotere maat?"],
      ["Tot hoe laat bent u open?", "Until what time are you open?", "Goedemiddag, tot hoe laat bent u vanavond eigenlijk open?"],
      ["Kan ik hier gratis parkeren?", "Can I park here for free?", "Is dit een blauwe zone of kan ik hier overdag gratis parkeren?"]
    ]
  }
];

for (const theme of THEMES) {
  for (const [index, item] of theme.items.entries()) {
    const [dutch, meaning, example] = item;
    addSourceRow({
      source: `${theme.theme}[${index}]`,
      dutch,
      meaning,
      literal: null,
      register: theme.register,
      level: theme.level,
      example,
      exampleEn: null,
      contextNote: theme.theme,
      usageWarning: null,
      tags: [theme.theme.toLowerCase(), theme.register],
      related: []
    });
  }
}

// Additional high-frequency authentic expressions
const EXTRA_SAYINGS = [
  ["Iets voor lief nemen", "To accept the drawbacks of something / accept something as inevitable", "B2", "De vertragingen bij slecht weer moet je helaas voor lief nemen."],
  ["Een zucht van verlichting slaken", "To breathe a sigh of relief", "B1", "Toen het verlossende telefoontje kwam, slaakte iedereen een zucht van verlichting."],
  ["Op rozen zitten", "To be in clover / be in an advantageous position", "B2", "Met die vaste baan en dat mooie huis zit hij werkelijk op rozen."],
  ["Aan de bel trekken", "To sound the alarm / raise the alarm", "B1", "Toen de veiligheid in het geding kwam, trok de werknemer direct aan de bel."],
  ["Met kop en schouders boven de rest uitsteken", "To stand head and shoulders above the rest", "B2", "Haar presentatie stak met kop en schouders boven de rest uit."],
  ["Een oogje in het zeil houden", "To keep an eye on things / watch over", "B1", "Zou jij even een oogje in het zeil willen houden terwijl ik weg ben?"],
  ["Iets uit de eerste hand vernemen", "To hear something firsthand", "B2", "Ik heb het nieuws over de overname uit de eerste hand vernomen van de directeur."],
  ["De spijker op de kop slaan", "To hit the nail on the head", "A2", "Jouw analyse sloeg precies de spijker op de kop."],
  ["In kannen en kruiken zijn", "To be all signed, sealed and delivered / completed", "B1", "Het koopcontract voor het nieuwe huis is nu in kannen en kruiken."],
  ["Het achterste van zijn tong niet laten zien", "To not reveal everything / keep one's cards close to chest", "B2", "Tijdens de onderhandelingen liet de advocaat het achterste van zijn tong niet zien."],
  ["Geen blad voor de mond nemen", "To not mince one's words / speak very bluntly", "B1", "Nederlanders staan erom bekend dat ze geen blad voor de mond nemen."],
  ["Iemand aan het lijntje houden", "To lead someone on / keep someone on a string", "B1", "Hij beloofde een contract, maar hield de sollicitant maanden aan het lijntje."],
  ["Op hete kolen zitten", "To be on pins and needles / anxious to leave or know", "B1", "Zij zat op hete kolen te wachten op de uitslag van haar examen."],
  ["Water bij de wijn doen", "To make compromises / water down one's demands", "B1", "In het Nederlandse poldermodel moet elke partij water bij de wijn doen."],
  ["Een vinger in de pap hebben", "To have a finger in the pie / have influence in decisions", "B1", "Zij wil graag overal een vinger in de pap hebben."],
  ["Van de regen in de drup raken", "To go from the frying pan into the fire / make things worse", "B1", "Door van baan te wisselen raakte hij van de regen in de drup."],
  ["Boter bij de vis", "Cash on the nail / immediate payment upon delivery", "B2", "Bij die aankoop gold: boter bij de vis."],
  ["Als mosterd na de maaltijd", "Too late to be of any use / like mustard after the meal", "B1", "Zijn advies kwam pas toen het project al klaar was: mosterd na de maaltijd."],
  ["Een zware dobber hebben aan iets", "To have a hard row to hoe / have a tough time with", "B2", "We hadden een zware dobber aan het afronden van het project."],
  ["De hand in eigen boezem steken", "To look into one's own heart / admit one's own fault", "B2", "Voordat je anderen bekritiseert, moet je de hand in eigen boezem steken."],
  ["Kort door de bocht", "Oversimplified / jumping to conclusions", "B1", "Die conclusie over alle jongeren is wel erg kort door de bocht."],
  ["Iemand in de watten leggen", "To pamper someone / spoil someone", "A2", "Voor haar verjaardag werd oma heerlijk in de watten gelegd."],
  ["De handen uit de mouwen steken", "To roll up one's sleeves / get to work", "A2", "Er is veel te doen, dus laten we de handen uit de mouwen steken."],
  ["Spijkers met koppen slaan", "To take decisive action / get down to brass tacks", "B1", "Laten we nu spijkers met koppen slaan en het contract tekenen."],
  ["Het roer omgooien", "To change course / make a career shift", "B1", "Na twintig jaar gooide hij het roer om en begon een eigen bakkerij."],
  ["Het bijltje erbij neergooien", "To throw in the towel / give up", "B1", "Het werk was te zwaar, dus gooide hij het bijltje erbij neer."],
  ["Als sneeuw voor de zon verdwijnen", "To vanish into thin air / disappear rapidly", "A2", "Mijn zorgen verdwenen als sneeuw voor de zon."],
  ["Na regen komt zonneschijn", "After rain comes sunshine", "A1", "Houd vol; na regen komt altijd weer zonneschijn."],
  ["De tijd dringt", "Time is pressing / running out", "B1", "We moeten nu handelen, want de tijd dringt."],
  ["Op het nippertje", "Just in the nick of time", "A2", "We haalden de trein op het nippertje."],
  ["In een oogwenk", "In the blink of an eye", "A2", "De vakantie was in een oogwenk voorbij."],
  ["Geld over de balk gooien", "To squander money / throw money down the drain", "B1", "Zoveel uitgeven aan onzin is geld over de balk gooien."],
  ["De broekriem aanhalen", "To tighten one's belt / cut expenses", "B1", "Tijdens zware tijden moeten we allemaal de broekriem aanhalen."],
  ["Op grote voet leven", "To live extravagantly / high off the hog", "B1", "Hij verdient veel, maar leeft ook op grote voet."],
  ["Geen cent te makken hebben", "To be completely broke", "A2", "Als student had ik soms geen cent te makken."],
  ["Doe maar gewoon, dan doe je al gek genoeg", "Just act normal, that's crazy enough already", "A2", "In Nederland geldt vaak: doe maar gewoon, dan doe je al gek genoeg."],
  ["Het hoogste woord voeren", "To dominate the conversation", "B1", "Tijdens het feest voerde hij constant het hoogste woord."],
  ["Een wit voetje halen", "To curry favor with someone", "B2", "Hij probeerde een wit voetje te halen bij de baas."],
  ["Uitwaaien aan zee", "To get a breath of fresh air on the coast", "A2", "Na een drukke week ging ze lekker uitwaaien aan zee in Scheveningen."],
  ["Het zonnetje in huis zijn", "To be a ray of sunshine / cheerful person", "A2", "Zij is altijd vrolijk en echt het zonnetje in huis."]
];

for (const [index, ex] of EXTRA_SAYINGS.entries()) {
  const [dutch, meaning, level, example] = ex;
  addSourceRow({
    source: `EXTRA_SAYINGS[${index}]`,
    dutch,
    meaning,
    literal: null,
    register: "idiom",
    level,
    example,
    exampleEn: null,
    contextNote: null,
    usageWarning: null,
    tags: ["idiom", "communication"],
    related: []
  });
}

// Conversational formulas
const FORMULA_TEMPLATES = [
  ["Mag ik u even iets vragen?", "May I ask you something for a moment?", "A1", "Pardon mevrouw, mag ik u even iets vragen over de bushalte?"],
  ["Kunt u dat alstublieft herhalen?", "Could you please repeat that?", "A1", "Het ging iets te snel, kunt u dat alstublieft herhalen?"],
  ["Wat bedoelt u precies met dit punt?", "What exactly do you mean by this point?", "A2", "Wat bedoelt u precies met deze voorwaarde in het contract?"],
  ["Daar heb ik nog niet over nagedacht", "I haven't thought about that yet", "A2", "Dat is een interessante vraag, daar heb ik nog niet over nagedacht."],
  ["Zou u mij kunnen doorverbinden met de juiste afdeling?", "Could you connect me with the right department?", "B1", "Goedemorgen, zou u mij kunnen doorverbinden met de afdeling administratie?"],
  ["Ik ben het er roerend mee eens", "I completely and wholeheartedly agree", "B1", "Met uw visie op duurzaamheid ben ik het roerend eens."],
  ["Dat is makkelijker gezegd dan gedaan", "That is easier said than done", "A2", "Gezonder eten klinkt simpel, maar het is makkelijker gezegd dan gedaan."],
  ["Neem rustig de tijd", "Take your time", "A1", "Er is geen haast bij, neem rustig de tijd."],
  ["Het spijt me ontzettend voor het ongemak", "I am terribly sorry for the inconvenience", "A2", "Het spijt me ontzettend dat ik te laat ben voor onze afspraak."],
  ["Alvast heel erg bedankt voor uw medewerking", "Thank you very much in advance for your cooperation", "A2", "Ik zie uw reactie tegemoet, alvast heel erg bedankt voor uw medewerking!"]
];

for (const [index, template] of FORMULA_TEMPLATES.entries()) {
  const [dutch, meaning, level, example] = template;
  addSourceRow({
    source: `FORMULA_TEMPLATES[${index}]`,
    dutch,
    meaning,
    literal: null,
    register: "polite",
    level,
    example,
    exampleEn: null,
    contextNote: null,
    usageWarning: null,
    tags: ["conversational", "spoken"],
    related: []
  });
}

if (idiomList.length === 0) throw new Error("FATAL: no curated idiom source rows were generated.");
const outputIds = new Set();
for (const row of idiomList) {
  if (outputIds.has(row.id)) throw new Error(`FATAL: duplicate generated idiom ID '${row.id}'.`);
  outputIds.add(row.id);
}

console.log(`Generated ${idiomList.length} curated Dutch idioms & everyday expressions.`);

const header = `// AUTO-GENERATED by scripts/generate_idioms.mjs - do not edit by hand.
// ${idiomList.length} curated Dutch idioms, everyday expressions, proverbs, and polite formulas.
globalThis.NP_IDIOMS = `;

writeFileSync(join(ROOT, "data", "idioms.js"), header + JSON.stringify(idiomList, null, 2) + ";\n");
writeFileSync(idRegistryPath, JSON.stringify(allocator.toRegistry()) + "\n");
console.log("data/idioms.js successfully written!");
