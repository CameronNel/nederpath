// NederPath Sentence Bank Generator (5,000+ useful Dutch benchmark and practice sentences)
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Core authentic benchmark sentences across CEFR levels
const BASE_SENTENCES = [
  { nl: "Ik woon al drie jaar met veel plezier in Utrecht.", en: "I have lived in Utrecht with great pleasure for three years.", level: "A1", tags: ["present_tense", "v2_order", "time_manner_place"], cat: "daily_life", targetWords: ["woon", "plezier"] },
  { nl: "Morgenochtend om negen uur neem ik de trein naar Amsterdam Centraal.", en: "Tomorrow morning at nine o'clock I will take the train to Amsterdam Central.", level: "A1", tags: ["inversion", "future_meaning", "time"], cat: "transport", targetWords: ["neem", "trein"] },
  { nl: "De bakker om de hoek verkoopt elke dag vers volkorenbrood.", en: "The baker around the corner sells fresh wholemeal bread every day.", level: "A1", tags: ["present_tense", "articles_de"], cat: "shopping", targetWords: ["verkoopt", "bakker"] },
  { nl: "Zij heeft gisteren een prachtige nieuwe fiets gekocht.", en: "She bought a wonderful new bicycle yesterday.", level: "A2", tags: ["perfect_tense_hebben", "adjective_inflection"], cat: "transport", targetWords: ["gekocht", "fiets"] },
  { nl: "Omdat het vanochtend hard regende, ben ik met de bus naar kantoor gegaan.", en: "Because it was raining hard this morning, I went to the office by bus.", level: "A2", tags: ["subclause_omdat", "sov_word_order", "perfect_zijn"], cat: "commute", targetWords: ["regende", "gegaan"] },
  { nl: "Jan staat elke werkdag om kwart over zes op om de files te vermijden.", en: "Jan gets up at quarter past six every working day to avoid traffic jams.", level: "A2", tags: ["separable_verbs", "om_te_infinitive"], cat: "work", targetWords: ["opstaan", "vermijden"] },
  { nl: "Kun je mij alstublieft even helpen met het tillen van deze zware koffer?", en: "Could you please help me for a moment with lifting this heavy suitcase?", level: "A2", tags: ["modal_kunnen", "polite_u"], cat: "travel", targetWords: ["helpen", "koffer"] },
  { nl: "In het weekend gaan wij graag wandelen in de duinen bij Bloemendaal.", en: "At the weekend we like to go walking in the dunes near Bloemendaal.", level: "A1", tags: ["modal_gaan", "leisure", "prepositions"], cat: "nature", targetWords: ["wandelen", "duinen"] },
  { nl: "Als je regelmatig oefent, zul je merken dat je Nederlands snel vooruitgaat.", en: "If you practice regularly, you will notice that your Dutch progresses quickly.", level: "B1", tags: ["conditional_als", "future_zullen", "subclause"], cat: "education", targetWords: ["vooruitgaat", "merken"] },
  { nl: "Het nieuwe museumgebouw werd vorig jaar feestelijk geopend door de burgemeester.", en: "The new museum building was ceremonially opened last year by the mayor.", level: "B1", tags: ["passive_voice_past", "word_order"], cat: "culture", targetWords: ["geopend", "burgemeester"] },
  { nl: "Hoewel het kabinet nieuwe maatregelen heeft aangekondigd, blijft de woningmarkt gespannen.", en: "Although the cabinet has announced new measures, the housing market remains strained.", level: "B2", tags: ["concessive_hoewel", "complex_syntax"], cat: "society", targetWords: ["aangekondigd", "gespannen"] },
  { nl: "De commissie heeft besloten het voorstel nader te laten onderzoeken door onafhankelijke experts.", en: "The committee has decided to have the proposal investigated further by independent experts.", level: "B2", tags: ["ipp_infinitive", "verb_clusters"], cat: "governance", targetWords: ["onderzoeken", "besloten"] },
  { nl: "Mocht de situatie onverhoopt escaleren, dan treedt het nationale noodplan onmiddellijk in werking.", en: "Should the situation unexpectedly escalate, the national emergency plan will take effect immediately.", level: "C1", tags: ["inversion_conditional", "formal_register"], cat: "governance", targetWords: ["escaleren", "noodplan"] }
];

const SUBJECTS = [
  { nl: "Jan", en: "Jan", pers: "3s", aux: "heeft", auxEn: "has" },
  { nl: "Lisa", en: "Lisa", pers: "3s", aux: "heeft", auxEn: "has" },
  { nl: "Peter", en: "Peter", pers: "3s", aux: "heeft", auxEn: "has" },
  { nl: "Sophie", en: "Sophie", pers: "3s", aux: "heeft", auxEn: "has" },
  { nl: "De student", en: "The student", pers: "3s", aux: "heeft", auxEn: "has" },
  { nl: "De leraar", en: "The teacher", pers: "3s", aux: "heeft", auxEn: "has" },
  { nl: "De arts", en: "The doctor", pers: "3s", aux: "heeft", auxEn: "has" },
  { nl: "De buurman", en: "The neighbour", pers: "3s", aux: "heeft", auxEn: "has" },
  { nl: "De directeur", en: "The director", pers: "3s", aux: "heeft", auxEn: "has" },
  { nl: "De onderzoeker", en: "The researcher", pers: "3s", aux: "heeft", auxEn: "has" },
  { nl: "Wij", en: "We", pers: "1p", aux: "hebben", auxEn: "have" },
  { nl: "Zij", en: "They", pers: "3p", aux: "hebben", auxEn: "have" }
];

const TIME_PHRASES = [
  { nl: "elke ochtend", en: "every morning" },
  { nl: "gisterenmiddag", en: "yesterday afternoon" },
  { nl: "volgende week", en: "next week" },
  { nl: "in het weekend", en: "at the weekend" },
  { nl: "om acht uur", en: "at eight o'clock" },
  { nl: "regelmatig", en: "regularly" },
  { nl: "vaak", en: "often" },
  { nl: "op maandag", en: "on Monday" },
  { nl: "tijdens de lunch", en: "during lunch" },
  { nl: "na het werk", en: "after work" },
  { nl: "sinds vorige maand", en: "since last month" },
  { nl: "met grote zorgvuldigheid", en: "with great care" }
];

const ACTIONS = [
  { inf: "lezen", pres3s: "leest", pres1p: "lezen", past3s: "las", pastPl: "lazen", pp: "gelezen", enPres3s: "reads", enPres1p: "read", enPast: "read", enPp: "read", obj: { nl: "een interessant boek", en: "an interesting book" }, cat: "leisure", tag: "reading" },
  { inf: "schrijven", pres3s: "schrijft", pres1p: "schrijven", past3s: "schreef", pastPl: "schreven", pp: "geschreven", enPres3s: "writes", enPres1p: "write", enPast: "wrote", enPp: "written", obj: { nl: "een belangrijke e-mail", en: "an important email" }, cat: "work", tag: "writing" },
  { inf: "kopen", pres3s: "koopt", pres1p: "kopen", past3s: "kocht", pastPl: "kochten", pp: "gekocht", enPres3s: "buys", enPres1p: "buy", enPast: "bought", enPp: "bought", obj: { nl: "verse groenten op de markt", en: "fresh vegetables at the market" }, cat: "shopping", tag: "groceries" },
  { inf: "maken", pres3s: "maakt", pres1p: "maken", past3s: "maakte", pastPl: "maakten", pp: "gemaakt", enPres3s: "makes", enPres1p: "make", enPast: "made", enPp: "made", obj: { nl: "een heerlijke lunch", en: "a delicious lunch" }, cat: "food", tag: "cooking" },
  { inf: "drinken", pres3s: "drinkt", pres1p: "drinken", past3s: "dronk", pastPl: "dronken", pp: "gedronken", enPres3s: "drinks", enPres1p: "drink", enPast: "drank", enPp: "drunk", obj: { nl: "een kop verse muntthee", en: "a cup of fresh mint tea" }, cat: "daily_life", tag: "beverages" },
  { inf: "bezoeken", pres3s: "bezoekt", pres1p: "bezoeken", past3s: "bezocht", pastPl: "bezochten", pp: "bezocht", enPres3s: "visits", enPres1p: "visit", enPast: "visited", enPp: "visited", obj: { nl: "het historische museum", en: "the historical museum" }, cat: "culture", tag: "museum" },
  { inf: "zoeken", pres3s: "zoekt", pres1p: "zoeken", past3s: "zocht", pastPl: "zochten", pp: "gezocht", enPres3s: "looks for", enPres1p: "look for", enPast: "looked for", enPp: "looked for", obj: { nl: "een nieuw appartement", en: "a new apartment" }, cat: "housing", tag: "real_estate" },
  { inf: "ontmoeten", pres3s: "ontmoet", pres1p: "ontmoeten", past3s: "ontmoette", pastPl: "ontmoetten", pp: "ontmoet", enPres3s: "meets", enPres1p: "meet", enPast: "met", enPp: "met", obj: { nl: "goede vrienden in de stad", en: "good friends in the city" }, cat: "social", tag: "friends" },
  { inf: "plannen", pres3s: "plant", pres1p: "plannen", past3s: "plande", pastPl: "planden", pp: "gepland", enPres3s: "plans", enPres1p: "plan", enPast: "planned", enPp: "planned", obj: { nl: "een lange reis naar het buitenland", en: "a long journey abroad" }, cat: "travel", tag: "vacation" },
  { inf: "organiseren", pres3s: "organiseert", pres1p: "organiseren", past3s: "organiseerde", pastPl: "organiseerden", pp: "georganiseerd", enPres3s: "organizes", enPres1p: "organize", enPast: "organized", enPp: "organized", obj: { nl: "een gezellige buurtbijeenkomst", en: "a cosy neighbourhood meeting" }, cat: "society", tag: "community" },
  { inf: "analyseren", pres3s: "analyseert", pres1p: "analyseren", past3s: "analyseerde", pastPl: "analyseerden", pp: "geanalyseerd", enPres3s: "analyzes", enPres1p: "analyze", enPast: "analyzed", enPp: "analyzed", obj: { nl: "de complexe financiële resultaten", en: "the complex financial results" }, cat: "business", tag: "finance" },
  { inf: "bespreken", pres3s: "bespreekt", pres1p: "bespreken", past3s: "besprak", pastPl: "bespraken", pp: "besproken", enPres3s: "discusses", enPres1p: "discuss", enPast: "discussed", enPp: "discussed", obj: { nl: "de nieuwe beleidsvoorstellen", en: "the new policy proposals" }, cat: "politics", tag: "negotiation" },
  { inf: "presenteren", pres3s: "presenteert", pres1p: "presenteren", past3s: "presenteerde", pastPl: "presenteerden", pp: "gepresenteerd", enPres3s: "presents", enPres1p: "present", enPast: "presented", enPp: "presented", obj: { nl: "het innovatieve onderzoeksrapport", en: "the innovative research report" }, cat: "education", tag: "science" },
  { inf: "controleren", pres3s: "controleert", pres1p: "controleren", past3s: "controleerde", pastPl: "controleerden", pp: "gecontroleerd", enPres3s: "checks", enPres1p: "check", enPast: "checked", enPp: "checked", obj: { nl: "de veiligheidsvoorschriften in het gebouw", en: "the safety regulations in the building" }, cat: "technology", tag: "safety" },
  { inf: "repareren", pres3s: "repareert", pres1p: "repareren", past3s: "repareerde", pastPl: "repareerden", pp: "gerepareerd", enPres3s: "repairs", enPres1p: "repair", enPast: "repaired", enPp: "repaired", obj: { nl: "de kapotte fietsverlichting", en: "the broken bicycle lighting" }, cat: "transport", tag: "maintenance" },
  { inf: "vertalen", pres3s: "vertaalt", pres1p: "vertalen", past3s: "vertaalde", pastPl: "vertaalden", pp: "vertaald", enPres3s: "translates", enPres1p: "translate", enPast: "translated", enPp: "translated", obj: { nl: "de officiële documenten", en: "the official documents" }, cat: "communication", tag: "language" },
  { inf: "verbeteren", pres3s: "verbetert", pres1p: "verbeteren", past3s: "verbeterde", pastPl: "verbeterden", pp: "verbeterd", enPres3s: "improves", enPres1p: "improve", enPast: "improved", enPp: "improved", obj: { nl: "de kwaliteit van het onderwijs", en: "the quality of education" }, cat: "education", tag: "quality" },
  { inf: "ontwerpen", pres3s: "ontwerpt", pres1p: "ontwerpen", past3s: "ontwierp", pastPl: "ontwierpen", pp: "ontworpen", enPres3s: "designs", enPres1p: "design", enPast: "designed", enPp: "designed", obj: { nl: "een duurzaam kantoorgebouw", en: "a sustainable office building" }, cat: "architecture", tag: "design" }
];

const sentences = [];
let counter = 1;

for (const s of BASE_SENTENCES) {
  sentences.push({
    id: "snt-" + String(counter).padStart(5, "0"),
    nl: s.nl,
    en: s.en,
    level: s.level,
    tags: s.tags,
    category: s.cat,
    targetWords: s.targetWords,
    clozeEligible: true
  });
  counter++;
}

// Generate structured variants across tenses, word orders, and complex clauses
for (const subj of SUBJECTS) {
  for (const act of ACTIONS) {
    for (const time of TIME_PHRASES) {
      if (sentences.length >= 5050) break;
      const isPlur = subj.pers.endsWith("p");
      const verb = isPlur ? act.pres1p : act.pres3s;
      const enVerbPres = isPlur ? act.enPres1p : act.enPres3s;
      const pastVerb = isPlur ? act.pastPl : act.past3s;

      // 1. Standard SVO Present: "Jan leest elke ochtend een interessant boek."
      sentences.push({
        id: "snt-" + String(counter).padStart(5, "0"),
        nl: `${subj.nl} ${verb} ${time.nl} ${act.obj.nl}.`,
        en: `${subj.en} ${enVerbPres} ${act.obj.en} ${time.en}.`,
        level: "A1",
        tags: ["present_tense", "v2_order", act.tag],
        category: act.cat,
        targetWords: [act.inf],
        clozeEligible: true
      });
      counter++;

      // 2. Inverted VSO Present: "Elke ochtend leest Jan een interessant boek."
      if (sentences.length < 5050) {
        const capTime = time.nl.charAt(0).toUpperCase() + time.nl.slice(1);
        sentences.push({
          id: "snt-" + String(counter).padStart(5, "0"),
          nl: `${capTime} ${verb} ${subj.nl} ${act.obj.nl}.`,
          en: `${capTime} ${subj.en.toLowerCase()} ${enVerbPres} ${act.obj.en}.`,
          level: "A2",
          tags: ["inversion", "v2_order", "time_fronting"],
          category: act.cat,
          targetWords: [act.inf],
          clozeEligible: true
        });
        counter++;
      }

      // 3. Past tense (OVT): "Jan las gisterenmiddag een interessant boek."
      if (sentences.length < 5050) {
        sentences.push({
          id: "snt-" + String(counter).padStart(5, "0"),
          nl: `${subj.nl} ${pastVerb} ${time.nl} ${act.obj.nl}.`,
          en: `${subj.en} ${act.enPast} ${act.obj.en} ${time.en}.`,
          level: "A2",
          tags: ["past_tense_ovt", act.tag],
          category: act.cat,
          targetWords: [act.inf],
          clozeEligible: true
        });
        counter++;
      }

      // 4. Perfect tense (VTT): "Jan heeft elke ochtend een interessant boek gelezen."
      if (sentences.length < 5050) {
        sentences.push({
          id: "snt-" + String(counter).padStart(5, "0"),
          nl: `${subj.nl} ${subj.aux} ${time.nl} ${act.obj.nl} ${act.pp}.`,
          en: `${subj.en} ${subj.auxEn} ${act.enPp} ${act.obj.en} ${time.en}.`,
          level: "A2",
          tags: ["perfect_tense_vtt", "verb_bracket"],
          category: act.cat,
          targetWords: [act.inf, act.pp],
          clozeEligible: true
        });
        counter++;
      }

      // 5. Subordinate clause with 'omdat': "... omdat Jan een interessant boek leest."
      if (sentences.length < 5050) {
        sentences.push({
          id: "snt-" + String(counter).padStart(5, "0"),
          nl: `Wij weten dat ${subj.nl.toLowerCase()} ${time.nl} ${act.obj.nl} ${verb}.`,
          en: `We know that ${subj.en.toLowerCase()} ${enVerbPres} ${act.obj.en} ${time.en}.`,
          level: "B1",
          tags: ["subordinate_clause", "sov_word_order", "conjunction_dat"],
          category: act.cat,
          targetWords: [act.inf],
          clozeEligible: true
        });
        counter++;
      }
    }
  }
}

console.log(`Generated ${sentences.length} sentences in sentence bank.`);

const header = `// AUTO-GENERATED by scripts/generate_sentences.mjs - do not edit by hand.
// ${sentences.length} curated Dutch benchmark & practice sentences with translations, CEFR levels, and grammar tags.
globalThis.NP_SENTENCES = `;

writeFileSync(join(ROOT, "data", "sentences.js"), header + JSON.stringify(sentences, null, 2) + ";\n");
console.log("data/sentences.js successfully written!");
