// NederPath Sentence Bank Generator (5,000+ useful Dutch benchmark and practice sentences)
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Core sentence templates & thematic generators
const BASE_SENTENCES = [
  { nl: "Ik woon al drie jaar met veel plezier in Utrecht.", en: "I have lived in Utrecht with great pleasure for three years.", level: "A1", tags: ["present_tense", "v2_order", "time_manner_place"], cat: "daily_life", target: "woon" },
  { nl: "Morgenochtend om negen uur neem ik de trein naar Amsterdam Centraal.", en: "Tomorrow morning at nine o'clock I take the train to Amsterdam Central.", level: "A1", tags: ["inversion", "future_meaning", "time"], cat: "transport", target: "neem" },
  { nl: "De bakker om de hoek verkoopt elke dag vers volkorenbrood.", en: "The baker around the corner sells fresh wholemeal bread every day.", level: "A1", tags: ["present_tense", "articles_de"], cat: "shopping", target: "verkoopt" },
  { nl: "Zij heeft gisteren een prachtige nieuwe fiets gekocht.", en: "She bought a wonderful new bicycle yesterday.", level: "A2", tags: ["perfect_tense_hebben", "adjective_inflection"], cat: "transport", target: "gekocht" },
  { nl: "Omdat het vanochtend hard regende, ben ik met de bus naar kantoor gegaan.", en: "Because it was raining hard this morning, I went to the office by bus.", level: "A2", tags: ["subclause_omdat", "sov_word_order", "perfect_zijn"], cat: "commute", target: "regende" },
  { nl: "Jan staat elke werkdag om kwart over zes op om files te vermijden.", en: "Jan gets up at quarter past six every working day to avoid traffic jams.", level: "A2", tags: ["separable_verbs", "om_te_infinitive"], cat: "work", target: "opstaan" },
  { nl: "Kun je mij alstublieft even helpen met het tillen van deze zware koffer?", en: "Could you please help me for a moment with lifting this heavy suitcase?", level: "A2", tags: ["modal_kunnen", "polite_u"], cat: "travel", target: "helpen" },
  { nl: "In het weekend gaan wij graag wandelen in de duinen bij Bloemendaal.", en: "At the weekend we like to go walking in the dunes near Bloemendaal.", level: "A1", tags: ["modal_gaan", "leisure", "prepositions"], cat: "nature", target: "wandelen" },
  { nl: "Als je regelmatig oefent, zul je merken dat je Nederlands snel vooruitgaat.", en: "If you practice regularly, you will notice that your Dutch progresses quickly.", level: "B1", tags: ["conditional_als", "future_zullen", "subclause"], cat: "education", target: "vooruitgaat" },
  { nl: "Het nieuwe museumgebouw werd vorig jaar feestelijk geopend door de burgemeester.", en: "The new museum building was ceremonially opened last year by the mayor.", level: "B1", tags: ["passive_voice_past", "word_order"], cat: "culture", target: "geopend" }
];

const SUBJECTS = [
  { nl: "Jan", en: "Jan", pers: "3s" },
  { nl: "Lisa", en: "Lisa", pers: "3s" },
  { nl: "Peter", en: "Peter", pers: "3s" },
  { nl: "Sophie", en: "Sophie", pers: "3s" },
  { nl: "De student", en: "The student", pers: "3s" },
  { nl: "De leraar", en: "The teacher", pers: "3s" },
  { nl: "De arts", en: "The doctor", pers: "3s" },
  { nl: "De buurman", en: "The neighbour", pers: "3s" },
  { nl: "Wij", en: "We", pers: "1p" },
  { nl: "Zij", en: "They", pers: "3p" }
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
  { nl: "na het werk", en: "after work" }
];

const ACTIONS = [
  { inf: "lezen", pres3s: "leest", pres1p: "lezen", past3s: "las", pp: "gelezen", en: "read", obj: { nl: "een interessant boek", en: "an interesting book" }, cat: "leisure", tag: "reading" },
  { inf: "schrijven", pres3s: "schrijft", pres1p: "schrijven", past3s: "schreef", pp: "geschreven", en: "write", obj: { nl: "een belangrijke e-mail", en: "an important email" }, cat: "work", tag: "writing" },
  { inf: "kopen", pres3s: "koopt", pres1p: "kopen", past3s: "kocht", pp: "gekocht", en: "buy", obj: { nl: "verse groenten op de markt", en: "fresh vegetables at the market" }, cat: "shopping", tag: "groceries" },
  { inf: "maken", pres3s: "maakt", pres1p: "maken", past3s: "maakte", pp: "gemaakt", en: "make", obj: { nl: "een heerlijke lunch", en: "a delicious lunch" }, cat: "food", tag: "cooking" },
  { inf: "drinken", pres3s: "drinkt", pres1p: "drinken", past3s: "dronk", pp: "gedronken", en: "drink", obj: { nl: "een kop verse muntthee", en: "a cup of fresh mint tea" }, cat: "daily_life", tag: "beverages" },
  { inf: "bezoeken", pres3s: "bezoekt", pres1p: "bezoeken", past3s: "bezocht", pp: "bezocht", en: "visit", obj: { nl: "het historische museum", en: "the historical museum" }, cat: "culture", tag: "museum" },
  { inf: "zoeken", pres3s: "zoekt", pres1p: "zoeken", past3s: "zocht", pp: "gezocht", en: "look for", obj: { nl: "een nieuw appartement", en: "a new apartment" }, cat: "housing", tag: "real_estate" },
  { inf: "ontmoeten", pres3s: "ontmoet", pres1p: "ontmoeten", past3s: "ontmoette", pp: "ontmoet", en: "meet", obj: { nl: "goede vrienden in de stad", en: "good friends in the city" }, cat: "social", tag: "friends" },
  { inf: "plannen", pres3s: "plant", pres1p: "plannen", past3s: "plande", pp: "gepland", en: "plan", obj: { nl: "een lange reis naar het buitenland", en: "a long journey abroad" }, cat: "travel", tag: "vacation" },
  { inf: "organiseren", pres3s: "organiseert", pres1p: "organiseren", past3s: "organiseerde", pp: "georganiseerd", en: "organize", obj: { nl: "een gezellige buurtbijeenkomst", en: "a cosy neighbourhood meeting" }, cat: "society", tag: "community" },
  { inf: "analyseren", pres3s: "analyseert", pres1p: "analyseren", past3s: "analyseerde", pp: "geanalyseerd", en: "analyse", obj: { nl: "de complexe financiële resultaten", en: "the complex financial results" }, cat: "business", tag: "finance" },
  { inf: "bespreken", pres3s: "bespreekt", pres1p: "bespreken", past3s: "besprak", pp: "besproken", en: "discuss", obj: { nl: "de nieuwe voorstellen", en: "the new proposals" }, cat: "politics", tag: "negotiation" },
  { inf: "presenteren", pres3s: "presenteert", pres1p: "presenteren", past3s: "presenteerde", pp: "gepresenteerd", en: "present", obj: { nl: "het innovatieve onderzoeksrapport", en: "the innovative research report" }, cat: "education", tag: "science" },
  { inf: "controleren", pres3s: "controleert", pres1p: "controleren", past3s: "controleerde", pp: "gecontroleerd", en: "check", obj: { nl: "de veiligheidsvoorschriften in het gebouw", en: "the safety regulations in the building" }, cat: "technology", tag: "safety" },
  { inf: "repareren", pres3s: "repareert", pres1p: "repareren", past3s: "repareerde", pp: "gerepareerd", en: "repair", obj: { nl: "de kapotte fietsverlichting", en: "the broken bicycle lighting" }, cat: "transport", tag: "maintenance" }
];

const sentences = [...BASE_SENTENCES];

// Generate structured variants across tenses, word orders, and complex clauses
let counter = 1;
for (const s of sentences) {
  s.id = "snt-" + String(counter).padStart(5, "0");
  s.clozeEligible = true;
  counter++;
}

// 1. Present tense V2 sentences
for (const subj of SUBJECTS) {
  for (const act of ACTIONS) {
    for (const time of TIME_PHRASES) {
      if (sentences.length >= 5050) break;
      const isPlur = subj.pers.endsWith("p");
      const verb = isPlur ? act.pres1p : act.pres3s;
      
      // Standard SVO: "Jan leest elke ochtend een interessant boek."
      const s1 = {
        id: "snt-" + String(counter).padStart(5, "0"),
        nl: `${subj.nl} ${verb} ${time.nl} ${act.obj.nl}.`,
        en: `${subj.en} ${isPlur ? act.en : act.en + "s"} ${act.obj.en} ${time.en}.`,
        level: "A1",
        tags: ["present_tense", "v2_order", act.tag],
        category: act.cat,
        targetWords: [act.inf],
        clozeEligible: true
      };
      sentences.push(s1);
      counter++;

      // Inverted VSO: "Elke ochtend leest Jan een interessant boek."
      if (sentences.length < 5050) {
        const capTime = time.nl.charAt(0).toUpperCase() + time.nl.slice(1);
        const s2 = {
          id: "snt-" + String(counter).padStart(5, "0"),
          nl: `${capTime} ${verb} ${subj.nl} ${act.obj.nl}.`,
          en: `${capTime} ${subj.en.toLowerCase()} ${isPlur ? act.en : act.en + "s"} ${act.obj.en}.`,
          level: "A2",
          tags: ["inversion", "v2_order", "time_fronting"],
          category: act.cat,
          targetWords: [act.inf],
          clozeEligible: true
        };
        sentences.push(s2);
        counter++;
      }

      // Past tense (OVT): "Gisteren las Jan een interessant boek."
      if (sentences.length < 5050) {
        const pastVerb = isPlur ? (act.past3s.endsWith("en") ? act.past3s : act.past3s + "en") : act.past3s;
        const s3 = {
          id: "snt-" + String(counter).padStart(5, "0"),
          nl: `${subj.nl} ${pastVerb} ${time.nl} ${act.obj.nl}.`,
          en: `${subj.en} ${act.en}ed ${act.obj.en} ${time.en}.`,
          level: "A2",
          tags: ["past_tense_ovt", act.tag],
          category: act.cat,
          targetWords: [act.inf],
          clozeEligible: true
        };
        sentences.push(s3);
        counter++;
      }

      // Perfect tense (VTT): "Jan heeft elke ochtend een interessant boek gelezen."
      if (sentences.length < 5050) {
        const aux = isPlur ? "hebben" : "heeft";
        const s4 = {
          id: "snt-" + String(counter).padStart(5, "0"),
          nl: `${subj.nl} ${aux} ${time.nl} ${act.obj.nl} ${act.pp}.`,
          en: `${subj.en} has ${act.en}ed ${act.obj.en} ${time.en}.`,
          level: "A2",
          tags: ["perfect_tense_vtt", "verb_bracket"],
          category: act.cat,
          targetWords: [act.inf, act.pp],
          clozeEligible: true
        };
        sentences.push(s4);
        counter++;
      }

      // Subordinate clause with 'omdat': "... omdat Jan een interessant boek leest."
      if (sentences.length < 5050) {
        const s5 = {
          id: "snt-" + String(counter).padStart(5, "0"),
          nl: `Wij weten dat ${subj.nl.toLowerCase()} ${time.nl} ${act.obj.nl} ${verb}.`,
          en: `We know that ${subj.en.toLowerCase()} ${isPlur ? act.en : act.en + "s"} ${act.obj.en} ${time.en}.`,
          level: "B1",
          tags: ["subordinate_clause", "sov_word_order", "conjunction_dat"],
          category: act.cat,
          targetWords: [act.inf],
          clozeEligible: true
        };
        sentences.push(s5);
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
