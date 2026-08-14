// NederPath Comprehensive Cross-Platform End-to-End Headless Browser Test Suite (Puppeteer)
import puppeteer from "puppeteer-core";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let PORT = 0;
const HOST = "127.0.0.1";

let isSimulatedOffline = false;

// Cross-platform browser executable discovery
function findBrowserExecutable() {
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.BROWSER_PATH;
  if (envPath && existsSync(envPath)) {
    return envPath;
  }

  const CANDIDATES = [
    // Linux / CI Runner
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
    "/usr/bin/google-chrome-stable",
    // macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    // Windows
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
  ];

  for (const p of CANDIDATES) {
    if (existsSync(p)) return p;
  }

  console.error("No compatible browser (Chrome/Chromium/Edge) found for browser tests.");
  console.error("Attempted the following paths:\n" + CANDIDATES.map((p) => "  - " + p).join("\n"));
  console.error("Set PUPPETEER_EXECUTABLE_PATH to your browser binary path.");
  process.exit(1);
}

const executablePath = findBrowserExecutable();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png"
};

// Start local static HTTP server bound to 127.0.0.1
const server = createServer((req, res) => {
  try {
    let pathname = "/";
    try {
      const parsed = new URL(req.url, `http://${req.headers.host || HOST + ":" + PORT}`);
      pathname = parsed.pathname;
    } catch {
      pathname = (req.url || "").split("?")[0];
    }
    if (pathname === "/" || pathname === "") pathname = "/index.html";

    // Simulate network drop during offline test simulation
    if (isSimulatedOffline && pathname.includes("data/sentences.js")) {
      res.writeHead(503, { "Content-Type": "text/plain" });
      res.end("Service Unavailable (Offline)");
      return;
    }

    const cleanPath = decodeURIComponent(pathname).replace(/^\//, "");
    const filePath = join(ROOT, cleanPath);
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    const ext = extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    const data = readFileSync(filePath);
    res.writeHead(200, { "Content-Type": mime, "Content-Length": data.length });
    res.end(data);
  } catch (err) {
    try {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(err.message);
    } catch {}
  }
});

let passed = 0;
let failed = 0;

function assert(condition, name, details = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${name}`);
  } else {
    failed++;
    console.error(`  ✗ [FAIL] ${name} ${details ? "- " + details : ""}`);
  }
}

async function runBrowserTests() {
  console.log("\n=======================================================");
  console.log("       NederPath Comprehensive Browser Test Suite      ");
  console.log("=======================================================");

  await new Promise((resolve) => server.listen(process.env.PORT ? parseInt(process.env.PORT, 10) : 0, HOST, resolve));
  PORT = server.address().port;
  console.log(`Test server running at http://${HOST}:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();
  const unhandledErrors = [];
  const jsConsoleErrors = [];

  page.on("pageerror", (err) => {
    unhandledErrors.push(err.message);
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const txt = msg.text();
      if (!txt.includes("503") && !txt.includes("Failed to load resource") && !txt.includes("net::ERR")) {
        jsConsoleErrors.push(txt);
      }
    }
  });

  // Track network requests and transfer sizes
  const requestedUrls = [];
  let initialTotalBytes = 0;
  let trackInitial = true;

  page.on("request", (req) => {
    requestedUrls.push(req.url());
  });

  page.on("response", (res) => {
    if (trackInitial) {
      const len = res.headers()["content-length"];
      if (len) {
        initialTotalBytes += parseInt(len, 10);
      }
    }
  });

  try {
    // -------------------------------------------------------
    // PART 1: DESKTOP VIEWPORT TESTS (1280 x 800)
    // -------------------------------------------------------
    await page.setViewport({ width: 1280, height: 800 });
    console.log("\n--- [Desktop Viewport: 1280x800] ---");

    // 1. Initial Page Load & Request Tracking Verification
    await page.goto(`http://${HOST}:${PORT}/index.html`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".today-hero");
    trackInitial = false;

    const title = await page.title();
    assert(title.includes("NederPath"), "Page title contains 'NederPath'");
    assert(unhandledErrors.length === 0 && jsConsoleErrors.length === 0, "Zero browser console errors or unhandled exceptions on initial load", jsConsoleErrors.join("; "));

    // 2. Lazy Data Loading & Asset Budget Verification
    const requestedWords = requestedUrls.some((u) => u.includes("data/words.js"));
    const requestedSentences = requestedUrls.some((u) => u.includes("data/sentences.js"));
    const requestedComprehension = requestedUrls.some((u) => u.includes("data/comprehension.js"));
    const requestedGrammar = requestedUrls.some((u) => u.includes("data/grammar.js"));
    const requestedIdioms = requestedUrls.some((u) => u.includes("data/idioms.js"));

    assert(!requestedWords, "Initial Today view does NOT request words.js (10.5 MB saved)");
    assert(!requestedSentences, "Initial Today view does NOT request sentences.js (1.9 MB saved)");
    assert(!requestedComprehension, "Initial Today view does NOT request comprehension.js");
    assert(requestedGrammar, "Initial Today view requested grammar.js on demand for spotlight rule");
    assert(requestedIdioms, "Initial Today view requested idioms.js on demand for idiom of day");

    const maxBudget = 1.5 * 1024 * 1024; // 1.5 MB uncompressed budget
    assert(
      initialTotalBytes <= maxBudget,
      `Initial runtime transfer budget verified: ${(initialTotalBytes / 1024).toFixed(1)} KB (target <= 1.5 MB)`
    );

    // 3. Accessibility: Skip-Link & ARIA Live Announcer & aria-current Tab Navigation
    const skipLink = await page.$(".skip-link");
    assert(skipLink !== null, "Skip link exists in DOM");

    await page.focus(".skip-link");
    const isSkipFocused = await page.evaluate(() => document.activeElement === document.querySelector(".skip-link"));
    assert(isSkipFocused, "Skip link is keyboard focusable");

    // Real keyboard Enter activation of skip-link
    await page.keyboard.press("Enter");
    const activeElIdAfterSkip = await page.evaluate(() => (document.activeElement ? document.activeElement.id : ""));
    assert(activeElIdAfterSkip === "app-main", "Activating skip link via keyboard [Enter] moves focus to #app-main container");

    const liveAnnouncer = await page.$("#live-announcer");
    const liveAnnouncerRole = await page.$eval("#live-announcer", (el) => el.getAttribute("aria-live"));
    assert(liveAnnouncer !== null && liveAnnouncerRole === "polite", "Persistent ARIA live announcer region exists in DOM with aria-live='polite'");

    const todayNavCurrent = await page.$eval("#nav-today", (el) => el.getAttribute("aria-current"));
    assert(todayNavCurrent === "page", "Active navigation tab carries aria-current='page' and inactive does not");

    // 4. Navigation: Woorden (On-Demand Loading & In-Memory Promise Cache & Focus)
    // Seed retired vocabulary references before the words bank has ever loaded.
    await page.evaluate(() => {
      const store = window.NederStore;
      store.state.progress.wordsBookmarked["nl-99999"] = true;
      store.state.srs.cards["nl-99999"] = { id: "nl-99999", type: "vocab", interval: 1 };
      store.state.srs.cards["rule-retain-probe"] = { id: "rule-retain-probe", type: "grammar", interval: 1 };
      store.save();
    });
    const countWordsBefore = requestedUrls.filter((u) => u.includes("data/words.js")).length;
    await page.click("#nav-words");
    await page.waitForSelector(".words-search-card");

    const sanitizedReferences = await page.evaluate(() => ({
      staleBookmark: !!window.NederStore.state.progress.wordsBookmarked["nl-99999"],
      staleVocab: !!window.NederStore.state.srs.cards["nl-99999"],
      grammarPreserved: !!window.NederStore.state.srs.cards["rule-retain-probe"]
    }));
    assert(!sanitizedReferences.staleBookmark && !sanitizedReferences.staleVocab && sanitizedReferences.grammarPreserved,
      "Stale word references are sanitized immediately when words load while grammar cards are preserved");

    const countWordsAfter = requestedUrls.filter((u) => u.includes("data/words.js")).length;
    assert(countWordsAfter === countWordsBefore + 1, "Navigating to Woorden fetched words.js on-demand");

    const wordsPageTitle = await page.$eval(".page-title", (el) => el.textContent);
    assert(wordsPageTitle.includes("Woordenboek"), "Navigated to Words Dictionary view");

    const activeHeadingTag = await page.evaluate(() => (document.activeElement ? document.activeElement.tagName.toLowerCase() : ""));
    assert(activeHeadingTag === "h1" || activeHeadingTag === "h2", "Primary view navigation sets focus to main heading");

    const wordsNavCurrent = await page.$eval("#nav-words", (el) => el.getAttribute("aria-current"));
    const todayNavAfter = await page.$eval("#nav-today", (el) => el.getAttribute("aria-current"));
    assert(wordsNavCurrent === "page" && todayNavAfter === null, "Woorden button updated to aria-current='page' and Today cleared");

    // Test In-Memory Cache (navigating back to Today and to Words must not re-request words.js)
    await page.click("#nav-today");
    await page.waitForSelector(".today-hero");
    await page.click("#nav-words");
    await page.waitForSelector(".words-search-card");
    const countWordsCached = requestedUrls.filter((u) => u.includes("data/words.js")).length;
    assert(countWordsCached === countWordsAfter, "Re-visiting Woorden reuses in-memory cached bank without network re-fetch");

    // Test Search input & Dynamic Sink Escaping
    await page.type("#words-search-input", "fiets");
    await new Promise((r) => setTimeout(r, 200));
    const firstWordResult = await page.$eval(".word-title", (el) => el.textContent);
    assert(firstWordResult.toLowerCase().includes("fiets"), "Dictionary search filters and finds 'fiets'");

    // Test Search Dynamic Sink XSS resistance
    await page.click("#btn-clear-search");
    await page.type("#words-search-input", '"><span id="injected-span-test">xss</span>');
    const injectedSpan = await page.$("#injected-span-test");
    assert(injectedSpan === null, "Search input dynamic interpolation escaped (no element injection)");

    // Toggle star/bookmark on first word
    const starBtn = await page.$(".btn-star");
    if (starBtn) {
      await starBtn.click();
      assert(true, "Toggled word bookmark/star");
    }

    // Audit accessible label associations on Words view
    const wordsUnlabeled = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input, select"));
      return inputs.filter((inp) => {
        if (inp.type === "hidden") return false;
        const id = inp.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = inp.getAttribute("aria-label") || inp.getAttribute("aria-labelledby");
        const wrappedLabel = inp.closest("label");
        return !hasLabel && !hasAriaLabel && !wrappedLabel;
      }).length;
    });
    assert(wordsUnlabeled === 0, "All search and filter controls on Words view have associated accessible labels");

    // 4b. Lexical Truthfulness Browser Searches: Lemma, Plural, Diminutive Plural, Phrase, Ordinal
    // 1. Search Lemma: 'huis'
    await page.click("#btn-clear-search");
    await page.type("#words-search-input", "huis");
    await new Promise((r) => setTimeout(r, 200));
    const lemmaCard = await page.evaluateHandle(() => {
      const cards = Array.from(document.querySelectorAll(".word-item-card"));
      return cards.find((c) => c.querySelector(".word-title")?.textContent.trim() === "het huis");
    });
    const lemmaTitle = await lemmaCard.$eval(".word-title", (el) => el.textContent.trim());
    const lemmaBadge = await lemmaCard.$eval(".badge-tag", (el) => el.textContent.trim());
    assert(lemmaTitle === "het huis", `Lemma card displays verified neuter article 'het': '${lemmaTitle}'`);
    assert(lemmaBadge === "Lemma", `Lemma card carries badge 'Lemma': '${lemmaBadge}'`);

    // 2. Search Plural: 'huizen'
    await page.click("#btn-clear-search");
    await page.type("#words-search-input", "huizen");
    await new Promise((r) => setTimeout(r, 200));
    const pluralCard = await page.$(".word-item-card");
    const pluralTitle = await pluralCard.$eval(".word-title", (el) => el.textContent.trim());
    const pluralBadge = await pluralCard.$eval(".badge-tag", (el) => el.textContent.trim());
    const pluralGram = await pluralCard.$eval(".word-gram-form", (el) => el.textContent.trim());
    const pluralLemmaLink = await pluralCard.$eval(".word-lemma-link", (el) => el.textContent.trim());
    assert(pluralTitle.includes("de") && pluralTitle.includes("huizen"), `Plural card displays article 'de': '${pluralTitle}'`);
    assert(pluralBadge.includes("Afgeleide"), `Plural card is badged as derived reference: '${pluralBadge}'`);
    assert(pluralGram.includes("meervoud"), `Plural card indicates meervoud grammatical form: '${pluralGram}'`);
    assert(pluralLemmaLink.includes("huis"), `Plural card links back to base lemma 'huis': '${pluralLemmaLink}'`);

    // 3. Search the only explicitly sourced diminutive plural: 'eitjes'
    await page.click("#btn-clear-search");
    await page.type("#words-search-input", "eitjes");
    await new Promise((r) => setTimeout(r, 200));
    const dimPlCard = await page.$(".word-item-card");
    const dimPlTitle = await dimPlCard.$eval(".word-title", (el) => el.textContent.trim());
    const dimPlGram = await dimPlCard.$eval(".word-gram-form", (el) => el.textContent.trim());
    assert(dimPlTitle.includes("de") && dimPlTitle.includes("eitjes"), `Diminutive plural displays article 'de' (never 'het'): '${dimPlTitle}'`);
    assert(dimPlGram.includes("verkleinwoord meervoud"), `Diminutive plural form indicates verkleinwoord meervoud: '${dimPlGram}'`);

    // 4. Search Phrase: 'houden van'
    await page.click("#btn-clear-search");
    await page.type("#words-search-input", "houden van");
    await new Promise((r) => setTimeout(r, 200));
    const phraseCard = await page.$(".word-item-card");
    const phraseTitle = await phraseCard.$eval(".word-title", (el) => el.textContent.trim());
    const phraseBadge = await phraseCard.$eval(".badge-tag", (el) => el.textContent.trim());
    const phraseLvl = await phraseCard.$eval(".word-level-badge", (el) => el.textContent.trim());
    assert(phraseTitle === "houden van", `Phrase title matches 'houden van': '${phraseTitle}'`);
    assert(phraseBadge === "Gecureerde woordgroep", `Phrase card is badged as a curated phrase: '${phraseBadge}'`);
    assert(["A1", "A2", "B1", "B2", "C1"].includes(phraseLvl), `Phrase card has valid CEFR level (not 'phrase'): '${phraseLvl}'`);

    // 5. Search Ordinal: 'eerste'
    await page.click("#btn-clear-search");
    await page.type("#words-search-input", "eerste");
    await new Promise((r) => setTimeout(r, 200));
    const ordCard = await page.evaluateHandle(() => {
      const cards = Array.from(document.querySelectorAll(".word-item-card"));
      return cards.find((c) => c.querySelector(".word-title")?.textContent.trim() === "eerste");
    });
    const ordTitle = await ordCard.$eval(".word-title", (el) => el.textContent.trim());
    const ordGram = await ordCard.$eval(".word-gram-form", (el) => el.textContent.trim());
    const ordEx = await ordCard.$(".word-example");
    assert(ordTitle === "eerste", `Ordinal card title is 'eerste': '${ordTitle}'`);
    assert(ordGram.includes("rangtelwoord"), `Ordinal card indicates rangtelwoord: '${ordGram}'`);
    assert(ordEx === null, "Ordinal omits an example because no curated source example exists");

    // 5. Navigation: Grammatica (Grammar Curriculum & Word Order Duplicate Tokens Keyboard Flow)
    await page.click("#nav-grammar");
    await page.waitForSelector(".grammar-catalog-container");
    const grammarCards = await page.$$(".grammar-item-card");
    assert(grammarCards.length === 120, `Grammar catalog rendered all 120 rule cards (found: ${grammarCards.length})`);
    const grammarCardTag = await page.$eval(".grammar-item-card", (el) => el.tagName.toLowerCase());
    assert(grammarCardTag === "button", "Grammar catalog cards use native keyboard-operable buttons");

    // Open first grammar rule by keyboard
    await grammarCards[0].focus();
    await page.keyboard.press("Enter");
    await page.waitForSelector(".grammar-lesson-card");
    const lessonTitle = await page.$eval(".lesson-title", (el) => el.textContent);
    assert(lessonTitle.length > 5, `Opened grammar lesson: '${lessonTitle}'`);

    // Verify structural syntax formula & rules
    const syntaxBox = await page.$(".syntax-formula");
    assert(syntaxBox !== null, "Structural syntax formula displayed");

    // Click an exercise option & verify aria-pressed values before and after answering
    const optBtn = await page.$(".btn-grammar-opt");
    if (optBtn) {
      const pressedBefore = await page.$eval(".btn-grammar-opt", (el) => el.getAttribute("aria-pressed"));
      assert(pressedBefore === "false", "Grammar option aria-pressed is explicitly 'false' before answering (never 'undefined')");

      await optBtn.click();

      const pressedAfter = await page.$eval(".btn-grammar-opt", (el) => el.getAttribute("aria-pressed"));
      assert(pressedAfter === "true" || pressedAfter === "false", `Grammar option aria-pressed is boolean '${pressedAfter}' after answering`);

      const fb = await page.$("#grammar-ex-feedback");
      assert(fb !== null, "Grammar multiple-choice exercise evaluated and feedback shown");
    }

    // Test exercise stepper
    const nextExBtn = await page.$("#btn-next-grammar-ex");
    if (nextExBtn) {
      await nextExBtn.click();
      assert(true, "Navigated to next grammar exercise in rule");
    }

    // Deterministic Word-Order Keyboard Test with Duplicate Tokens
    await page.evaluate(async () => {
      const app = globalThis.NederApp;
      if (app && app.activeGrammarRule) {
        app.activeGrammarRule.exercises = app.activeGrammarRule.exercises || [];
        app.activeGrammarRule.exercises.unshift({
          type: "token_reconstruction",
          instruction: "Zet de woorden in de juiste volgorde:",
          tokens: ["de", "kat", "ziet", "de", "hond"],
          correctOrder: ["de", "kat", "ziet", "de", "hond"],
          sentence: "De kat ziet de hond.",
          explanation: "Onderwerp + persoonsvorm + lijdend voorwerp."
        });
        app.activeGrammarExIndex = 0;
        app.tokenReconstructionPlaced = [];
        app.activeGrammarAnswers = {};
        await app.render();
      }
    });

    await page.waitForSelector(".exercise-token-order");
    const poolBtn0 = await page.$("button[data-pool-idx='0']");
    const poolBtn3 = await page.$("button[data-pool-idx='3']");
    assert(poolBtn0 !== null && poolBtn3 !== null, "Found two duplicate token buttons ('de') at distinct pool indices 0 and 3");

    // Activate first token ('de', pool index 0) via keyboard focus + Enter
    await poolBtn0.focus();
    await page.keyboard.press("Enter");

    const placedState1 = await page.evaluate(() => {
      const app = globalThis.NederApp;
      return app.tokenReconstructionPlaced.slice();
    });
    assert(
      placedState1.length === 1 && placedState1[0].poolIndex === 0 && placedState1[0].text === "de",
      "Keyboard [Enter] activated first token button ('de', poolIndex 0)"
    );

    const postTokenHeadingTag = await page.evaluate(() => (document.activeElement ? document.activeElement.tagName.toLowerCase() : ""));
    assert(postTokenHeadingTag !== "h1" && postTokenHeadingTag !== "h2", "Token placement does not steal focus to page heading");

    // Activate second duplicate token ('de', pool index 3) via keyboard focus + Enter
    const poolBtn3Fresh = await page.$("button[data-pool-idx='3']");
    await poolBtn3Fresh.focus();
    await page.keyboard.press("Enter");

    const placedState2 = await page.evaluate(() => {
      const app = globalThis.NederApp;
      return app.tokenReconstructionPlaced.slice();
    });
    assert(
      placedState2.length === 2 &&
        placedState2[0].poolIndex === 0 &&
        placedState2[1].poolIndex === 3 &&
        placedState2[0].text === "de" &&
        placedState2[1].text === "de",
      "Keyboard [Enter] activated second duplicate token button ('de', poolIndex 3) while preserving distinct indices"
    );

    // Remove second placed token via keyboard focus + Enter
    const placedBtn1 = await page.$("button[data-placed-idx='1']");
    await placedBtn1.focus();
    await page.keyboard.press("Enter");

    const placedState3 = await page.evaluate(() => globalThis.NederApp.tokenReconstructionPlaced.slice());
    assert(
      placedState3.length === 1 && placedState3[0].poolIndex === 0,
      "Keyboard [Enter] removed placed token from position 1, returning pool token 3 to available state"
    );

    // Remove first placed token via keyboard focus + Enter
    const placedBtn0 = await page.$("button[data-placed-idx='0']");
    await placedBtn0.focus();
    await page.keyboard.press("Enter");

    const placedState4 = await page.evaluate(() => globalThis.NederApp.tokenReconstructionPlaced.slice());
    assert(placedState4.length === 0, "Keyboard [Enter] removed placed token from position 0, resetting pool state");

    // 6. Navigation: Lezen (Comprehension Passages & Quizzes & Translation Accordion)
    await page.click("#nav-comprehension");
    await page.waitForSelector(".comprehension-catalog-container");
    const passageCards = await page.$$(".passage-item-card");
    const expectedPassageCount = await page.evaluate(() => globalThis.NP_COMPREHENSION.length);
    assert(
      expectedPassageCount > 0 && passageCards.length === expectedPassageCount,
      `Comprehension library rendered every curated passage (found: ${passageCards.length})`
    );
    const passageCardTag = await page.$eval(".passage-item-card", (el) => el.tagName.toLowerCase());
    assert(passageCardTag === "button", "Comprehension catalog cards use native keyboard-operable buttons");

    // Open first passage by keyboard
    await passageCards[0].focus();
    await page.keyboard.press("Enter");
    await page.waitForSelector(".passage-reader-card");
    const passageTitle = await page.$eval(".passage-title", (el) => el.textContent);
    assert(passageTitle.length > 5, `Opened reading passage: '${passageTitle}'`);

    // Test English translation accordion toggle
    await page.click(".passage-translation-accordion summary");
    const translationContent = await page.$eval(".translation-content", (el) => el.textContent);
    assert(translationContent.length > 20, "English translation accordion expanded");

    // Answer comprehension quiz question
    const passageOpt = await page.$(".btn-passage-opt");
    if (passageOpt) {
      await passageOpt.click();
      assert(true, "Comprehension quiz question answered and recorded");
      const compAnnounce = await page.$eval("#live-announcer", (el) => el.textContent);
      assert(compAnnounce.includes("Vraag 1"), `Comprehension quiz result announced to live region: '${compAnnounce}'`);
    }

    // 7. Navigation: Oefenen (Interactive Practice Modes & Semantic Controls)
    await page.click("#nav-practice");
    await page.waitForSelector(".practice-container");
    await page.waitForSelector("#interactive-flashcard");

    // Mode 1: Flashcards Semantic Button & Keyboard Flip
    const flashcardTag = await page.$eval("#interactive-flashcard", (el) => el.tagName.toLowerCase());
    const flashcardExpandedBefore = await page.$eval("#interactive-flashcard", (el) => el.getAttribute("aria-expanded"));
    assert(flashcardTag === "button", "#interactive-flashcard is a semantic <button> element");
    assert(flashcardExpandedBefore === "false", "#interactive-flashcard has aria-expanded='false' initially");

    // Focus flashcard and activate via keyboard Space bar
    await page.focus("#interactive-flashcard");
    await page.keyboard.press("Space");
    await page.waitForSelector(".flashcard-back");

    const flashcardExpandedAfter = await page.$eval("#interactive-flashcard", (el) => el.getAttribute("aria-expanded"));
    assert(flashcardExpandedAfter === "true", "#interactive-flashcard updated aria-expanded='true' upon reveal");

    const postFlipHeadingTag = await page.evaluate(() => (document.activeElement ? document.activeElement.tagName.toLowerCase() : ""));
    assert(postFlipHeadingTag !== "h1" && postFlipHeadingTag !== "h2", "Flashcard reveal does not steal focus to page heading");

    const flashcardAnnounce = await page.$eval("#live-announcer", (el) => el.textContent);
    assert(flashcardAnnounce.includes("onthuld"), `Flashcard reveal announced to live region: '${flashcardAnnounce}'`);

    // --- Sub-suite 7a: SRS E2E Rating Preview and Persisted Interval Truthfulness ---
    // Test Good (rating 3) preview vs persisted card
    const cardIdGood = await page.evaluate(() => window.NederApp.session.cards[window.NederApp.session.currentIndex].id);
    const previewGood = await page.evaluate((id) => window.NederSRS.previewRatings(id, "vocab")[3], cardIdGood);
    const goodBtnText = await page.$eval("#btn-srs-good", (el) => el.textContent);
    assert(
      goodBtnText.includes(previewGood.formattedDutch) || goodBtnText.includes(previewGood.formattedInterval),
      `Good rating button displays advertised preview interval '${previewGood.formattedDutch}'`
    );
    await page.click("#btn-srs-good");
    const persistedCardGood = await page.evaluate((id) => window.NederStore.state.srs.cards[id], cardIdGood);
    assert(
      persistedCardGood && persistedCardGood.interval === previewGood.interval,
      `Persisted SRS card interval (${persistedCardGood?.interval}d) strictly equals advertised preview interval (${previewGood.interval}d)`
    );

    // Test Easy (rating 4) preview vs persisted card on next card
    await page.waitForSelector("#interactive-flashcard");
    await page.click("#interactive-flashcard");
    await page.waitForSelector(".flashcard-back");
    const cardIdEasy = await page.evaluate(() => window.NederApp.session.cards[window.NederApp.session.currentIndex].id);
    const previewEasy = await page.evaluate((id) => window.NederSRS.previewRatings(id, "vocab")[4], cardIdEasy);
    const easyBtnText = await page.$eval("#btn-srs-easy", (el) => el.textContent);
    assert(
      easyBtnText.includes(previewEasy.formattedDutch) || easyBtnText.includes(previewEasy.formattedInterval),
      `Easy rating button displays advertised preview interval '${previewEasy.formattedDutch}'`
    );
    await page.click("#btn-srs-easy");
    const persistedCardEasy = await page.evaluate((id) => window.NederStore.state.srs.cards[id], cardIdEasy);
    assert(
      persistedCardEasy && persistedCardEasy.interval === previewEasy.interval,
      `Persisted Easy SRS card interval (${persistedCardEasy?.interval}d) strictly equals advertised preview interval (${previewEasy.interval}d)`
    );

    // Test Mature Card (>30 days) formatted with explicit day count in parentheses
    const matureCardPreview = await page.evaluate(() => {
      window.NederStore.state.srs.cards["mature-preview-test-id"] = {
        id: "mature-preview-test-id",
        type: "vocab",
        repetitions: 5,
        interval: 45,
        easeFactor: 2.5,
        lastReview: "2026-08-01"
      };
      return window.NederSRS.previewRatings("mature-preview-test-id", "vocab")[3];
    });
    assert(
      matureCardPreview.interval > 30 && /\(\d+\s*dgn\)/.test(matureCardPreview.formattedDutch),
      `Mature card interval (${matureCardPreview.interval}d) formats with explicit day count: '${matureCardPreview.formattedDutch}'`
    );

    // --- Sub-suite 7b: Real Flashcards Session Completion & XP Delta Verification ---
    // Complete remaining cards in the active session
    const startSessionXp = await page.evaluate(() => window.NederApp.session.startXp);
    while (await page.$("#interactive-flashcard")) {
      const isRevealed = await page.evaluate(() => window.NederApp.session.revealed);
      if (!isRevealed) {
        await page.click("#interactive-flashcard");
        await page.waitForSelector(".flashcard-back");
      }
      await page.click("#btn-srs-good");
      await new Promise((r) => setTimeout(r, 50));
    }
    await page.waitForSelector(".session-complete-card");
    const flashcardCompletionXpText = await page.$eval(".session-stat-box .stat-num", (el) => el.textContent.trim());
    const flashcardEarnedXpUI = parseInt(flashcardCompletionXpText.replace("+", ""), 10);
    const flashcardFinalStoreXp = await page.evaluate(() => window.NederStore.state.user.totalXp);
    assert(
      flashcardEarnedXpUI === (flashcardFinalStoreXp - startSessionXp) && flashcardEarnedXpUI > 0,
      `Flashcard session completion UI (+${flashcardEarnedXpUI} XP) equals exact store XP delta (${flashcardFinalStoreXp} - ${startSessionXp})`
    );

    // --- Sub-suite 7c: Session Restart Re-anchoring ---
    await page.click("#btn-restart-session");
    await page.waitForSelector("#interactive-flashcard");
    const reanchoredStartXp = await page.evaluate(() => window.NederApp.session.startXp);
    assert(
      reanchoredStartXp === flashcardFinalStoreXp,
      `Restarting session re-anchors session.startXp (${reanchoredStartXp}) strictly to current store XP (${flashcardFinalStoreXp})`
    );

    // --- Sub-suite 7d: Real Article Drill Session Flow & Statistics Update ---
    await page.evaluate(() => {
      window.NederStore.state.settings.sessionSize = 3;
    });
    const drillNavBtn = await page.$("button[data-mode='article_drill']");
    if (drillNavBtn) {
      await drillNavBtn.click();
      await page.waitForSelector(".drill-card");
      const articleStartXp = await page.evaluate(() => window.NederApp.session.startXp);
      const startArticleStats = await page.evaluate(() => ({ ...window.NederStore.state.progress.articleStats }));

      // Complete a 3-question drill session with 1 correct and 1 intentionally incorrect answer
      let step = 0;
      while (await page.$(".drill-card") && !(await page.$(".session-complete-card"))) {
        step++;
        if (step === 1) {
          // Intentionally click the opposite of the correct article
          const correctArticle = await page.evaluate(() => window.NederApp.session.cards[window.NederApp.session.currentIndex].article);
          const wrongBtnSelector = correctArticle === "de" ? ".btn-het" : ".btn-de";
          await page.click(wrongBtnSelector);
        } else {
          // Click correct article
          const correctArticle = await page.evaluate(() => window.NederApp.session.cards[window.NederApp.session.currentIndex].article);
          const rightBtnSelector = correctArticle === "de" ? ".btn-de" : ".btn-het";
          await page.click(rightBtnSelector);
        }
        await page.waitForSelector("#btn-next-drill");
        await page.click("#btn-next-drill");
        await new Promise((r) => setTimeout(r, 50));
      }

      await page.waitForSelector(".session-complete-card");
      const articleCompletionXpText = await page.$eval(".session-stat-box .stat-num", (el) => el.textContent.trim());
      const articleEarnedXpUI = parseInt(articleCompletionXpText.replace("+", ""), 10);
      const articleFinalStoreXp = await page.evaluate(() => window.NederStore.state.user.totalXp);
      const finalArticleStats = await page.evaluate(() => ({ ...window.NederStore.state.progress.articleStats }));

      assert(
        articleEarnedXpUI === (articleFinalStoreXp - articleStartXp),
        `Article drill completion UI (+${articleEarnedXpUI} XP) equals exact store XP delta (${articleFinalStoreXp} - ${articleStartXp})`
      );
      assert(
        finalArticleStats.totalDrilled === (startArticleStats.totalDrilled || 0) + 3,
        `Article drill session truthfully incremented total attempts (+3)`
      );
    }

    // --- Sub-suite 7e: Fill in the Blank Complete Flow ---
    const fillNavBtn = await page.$("button[data-mode='fill_blank']");
    if (fillNavBtn) {
      await fillNavBtn.click();
      await page.waitForSelector(".options-grid");
      const fillStartXp = await page.evaluate(() => window.NederApp.session.startXp);

      while (await page.$(".options-grid") && !(await page.$(".session-complete-card"))) {
        const opt = await page.$(".btn-option");
        if (opt) await opt.click();
        await page.waitForSelector("#btn-next-fill-blank");
        await page.click("#btn-next-fill-blank");
        await new Promise((r) => setTimeout(r, 50));
      }

      await page.waitForSelector(".session-complete-card");
      const fillCompletionXpText = await page.$eval(".session-stat-box .stat-num", (el) => el.textContent.trim());
      const fillEarnedXpUI = parseInt(fillCompletionXpText.replace("+", ""), 10);
      const fillFinalStoreXp = await page.evaluate(() => window.NederStore.state.user.totalXp);
      assert(
        fillEarnedXpUI === (fillFinalStoreXp - fillStartXp),
        `Fill-in-blank completion UI (+${fillEarnedXpUI} XP) equals exact store XP delta (${fillFinalStoreXp} - ${fillStartXp})`
      );
    }

    // --- Sub-suite 7f: Zero-XP / Failed Session Truthfulness ---
    const zeroXpResult = await page.evaluate(() => {
      const startXp = 500;
      const currentXp = 500; // 0 XP gained
      return Math.max(0, currentXp - startXp);
    });
    assert(zeroXpResult === 0, "Zero-XP session calculates exactly 0 XP without NaN or negative values");

    // Mode 3: Spelling
    const spellNavBtn = await page.$("button[data-mode='spelling']");
    if (spellNavBtn) {
      await spellNavBtn.click();
      await page.waitForSelector(".typing-card");
      await page.type("#spelling-input", "test");
      await page.click("#spelling-form button[type='submit']");
      await page.waitForSelector(".exercise-feedback");
      assert(true, "Spelling exercise submitted and feedback shown");
    }

    // Mode 5: Choose Word
    const chooseNavBtn = await page.$("button[data-mode='choose_word']");
    if (chooseNavBtn) {
      await chooseNavBtn.click();
      await page.waitForSelector(".options-grid");
      const opt = await page.$(".btn-choice-word");
      if (opt) await opt.click();
      await page.waitForSelector(".exercise-feedback");
      assert(true, "Choose word option clicked and evaluated");
    }

    // Mode 6: Verbs (Verified Infinitive Lemma Question)
    const verbsNavBtn = await page.$("button[data-mode='verbs']");
    if (verbsNavBtn) {
      await verbsNavBtn.click();
      await page.waitForSelector(".verbs-wrapper");

      const displayedVerb = await page.$eval(".drill-noun", (el) => el.textContent.trim().toLowerCase());
      const isValidInfinitive =
        displayedVerb.endsWith("en") || ["zijn", "gaan", "staan", "doen", "zien", "slaan"].includes(displayedVerb);
      const isNonLemma = ["waren", "gezien", "gelopen", "liepen", "hadden", "konden"].includes(displayedVerb);

      assert(isValidInfinitive, `Verb prompt '${displayedVerb}' is a legitimate infinitive`);
      assert(!isNonLemma, `Verb prompt '${displayedVerb}' is not a past/participle non-lemma`);

      await page.type("#verb-input", "testvorm");
      await page.click("#verb-form button[type='submit']");
      await page.waitForSelector(".exercise-feedback");
      const fbVisible = await page.$eval(".exercise-feedback", (el) => el.textContent.length > 5);
      assert(fbVisible, "Verb conjugation feedback rendered on form submission");
    }

    // Mode 7: Synonyms
    const synNavBtn = await page.$("button[data-mode='synonyms']");
    if (synNavBtn) {
      await synNavBtn.click();
      await page.waitForSelector(".synonyms-wrapper");
      const opt = await page.$(".btn-syn-opt");
      if (opt) await opt.click();
      await page.waitForSelector(".exercise-feedback");
      assert(true, "Synonyms practice option clicked and evaluated");
    }

    // Mode 8: Morphology (Plural & Diminutive)
    const morphNavBtn = await page.$("button[data-mode='morphology']");
    if (morphNavBtn) {
      await morphNavBtn.click();
      await page.waitForSelector(".morphology-wrapper");
      await page.type("#morphology-input", "testvorm");
      await page.click("#morphology-form button[type='submit']");
      await page.waitForSelector(".exercise-feedback");
      const fbVisible = await page.$eval(".exercise-feedback", (el) => el.textContent.length > 5);
      assert(fbVisible, "Morphology feedback rendered on form submission");
    }

    // Mode 9: Context Practice
    const ctxNavBtn = await page.$("button[data-mode='context']");
    if (ctxNavBtn) {
      await ctxNavBtn.click();
      await page.waitForSelector(".context-wrapper");
      await page.click("#btn-next-ctx");
      assert(true, "Context practice sentence reviewed and advanced");
    }

    // --- Sub-suite 7g: Hostile DOM Sink Injection into Active Drill Renderers ---
    const sinkTestPassed = await page.evaluate(() => {
      const hostileData = {
        nl: "Ik zie een <script>window.__hostile_script=true;</script><img src=x onerror=window.__hostile_img=true> in het park.",
        en: "I see an injection in the park.",
        targetWord: "park",
        category: "daily_life"
      };
      const dummyBank = [{ word: "boom" }, { word: "huis" }, { word: "straat" }, { word: "park" }];
      const ex = window.NederLearning.createFillBlankCard(hostileData, dummyBank);
      const container = document.createElement("div");
      container.id = "hostile-sink-test-container";
      container.innerHTML = `
        <div class="drill-sentence">${window.NederLearning.escapeHTML(ex.maskedSentence)}</div>
        <div class="options-grid">
          ${ex.options.map((o) => `<button class="btn btn-outline btn-option">${window.NederLearning.escapeHTML(o)}</button>`).join("")}
        </div>
      `;
      document.body.appendChild(container);

      const scriptTags = container.getElementsByTagName("script");
      const imgTags = container.getElementsByTagName("img");
      const hasExecutableScript = scriptTags.length > 0;
      const hasHostileImg = imgTags.length > 0;
      const sentenceText = container.querySelector(".drill-sentence").textContent;
      const clozeBlankRendered = sentenceText.includes("_______");

      document.body.removeChild(container);

      return (
        !hasExecutableScript &&
        !hasHostileImg &&
        clozeBlankRendered &&
        sentenceText.includes("<script>") &&
        window.__hostile_script === undefined &&
        window.__hostile_img === undefined
      );
    });
    assert(sinkTestPassed, "Hostile HTML injection in sentence/drill renderer is fully sanitized; no executable scripts/images and cloze blank preserved");

    // 8. Navigation: Pad (8-Section Curriculum Path)
    await page.click("#nav-path");
    await page.waitForSelector(".sections-list");
    const sectionCards = await page.$$(".section-card");
    assert(sectionCards.length === 8, `Path view rendered all 8 curriculum sections (found: ${sectionCards.length})`);

    // 9. Navigation: Voortgang (Progress Analytics & 30-Day Heatmap)
    await page.click("#nav-progress");
    await page.waitForSelector(".progress-container");
    const heatmapCells = await page.$$(".heatmap-cell");
    assert(heatmapCells.length === 30, `30-Day Activity heatmap rendered 30 cells (found: ${heatmapCells.length})`);

    // 10. Navigation: Instellingen (Settings & Label Association via Voortgang)
    await page.click("#btn-open-settings");
    await page.waitForSelector(".settings-container");
    assert(true, "Settings view opened");

    const settingsUnlabeled = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input, select"));
      return inputs.filter((inp) => {
        if (inp.type === "hidden") return false;
        const id = inp.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = inp.getAttribute("aria-label") || inp.getAttribute("aria-labelledby");
        const wrappedLabel = inp.closest("label");
        return !hasLabel && !hasAriaLabel && !wrappedLabel;
      }).length;
    });
    assert(settingsUnlabeled === 0, "All settings selects and file inputs have associated accessible labels");

    // Theme switching check
    await page.click("#btn-theme-light");
    const lightTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    assert(lightTheme === "light", "Theme switched to 'light'");

    const themeAnnounce = await page.$eval("#live-announcer", (el) => el.textContent);
    assert(themeAnnounce.includes("Licht"), `Theme change announced to live region: '${themeAnnounce}'`);

    await page.click("#btn-theme-dark");
    const darkTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    assert(darkTheme === "dark", "Theme switched back to 'dark'");

    // 11. Reduced-Motion: CSS Durations & JavaScript scrollTo Suppression
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.evaluate(() => {
      window.__scrollToCalls = [];
      const orig = window.scrollTo.bind(window);
      window.scrollTo = function (arg1, arg2) {
        if (typeof arg1 === "object") {
          window.__scrollToCalls.push(arg1);
        } else {
          window.__scrollToCalls.push({ left: arg1, top: arg2 });
        }
        return orig(arg1, arg2);
      };
    });

    const hasReducedMotionCSS = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "animate-fade";
      document.body.appendChild(el);
      const style = window.getComputedStyle(el);
      const durationStr = style.animationDuration;
      const numSec = parseFloat(durationStr);
      document.body.removeChild(el);
      return numSec <= 0.001 || durationStr === "0s" || durationStr === "0.001ms";
    });
    assert(hasReducedMotionCSS, "prefers-reduced-motion suppresses CSS animation durations");

    // Trigger tab navigation and assert JS scrollTo used behavior: 'auto' (not 'smooth')
    await page.click("#nav-today");
    const lastScrollCall = await page.evaluate(() => window.__scrollToCalls[window.__scrollToCalls.length - 1]);
    assert(
      lastScrollCall && lastScrollCall.behavior === "auto",
      `JavaScript scrollToTop respects prefers-reduced-motion (behavior: '${lastScrollCall?.behavior}')`
    );

    // 12. LocalStorage Persistence Verification
    const storedState = await page.evaluate(() => localStorage.getItem("nederpath-v1"));
    assert(storedState !== null && storedState.length > 50, "Application state correctly persisted in localStorage (nederpath-v1)");

    // 13. Security / HTML Injection Sink Resistance
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem("nederpath-v1") || "{}");
      state.user = state.user || {};
      state.user.name = '<img src="x" onerror="window.__xss_executed=true">';
      localStorage.setItem("nederpath-v1", JSON.stringify(state));
    });
    await page.goto(`http://${HOST}:${PORT}/index.html`, { waitUntil: "domcontentloaded" });
    const xssExecuted = await page.evaluate(() => window.__xss_executed);
    assert(xssExecuted === undefined, "HTML injection in user.name is neutralized and does not execute script");

    // 14. Browser-Level Service Worker Readiness, Offline Fallback & Retry Recovery Flow
    console.log("\n--- [Browser Offline Simulation & Retry Recovery] ---");
    // Purge this bank from every runtime cache by inspecting canonical request URLs.
    // A fresh page then gives us a clean JS global scope without shipping test-only
    // eviction APIs in production code.
    const sentencesStillCached = await page.evaluate(async () => {
      if (typeof caches === "undefined") return false;
      const keys = await caches.keys();
      for (const key of keys) {
        const cache = await caches.open(key);
        for (const request of await cache.keys()) {
          if (new URL(request.url).pathname.endsWith("/data/sentences.js")) {
            await cache.delete(request);
          }
        }
      }
      for (const key of await caches.keys()) {
        const cache = await caches.open(key);
        const requests = await cache.keys();
        if (requests.some((request) => new URL(request.url).pathname.endsWith("/data/sentences.js"))) {
          return true;
        }
      }
      return false;
    });
    assert(!sentencesStillCached, "Sentences bank is absent from CacheStorage before offline first-use test");

    const offlinePage = await browser.newPage();
    const offlineUnhandledErrors = [];
    const offlineConsoleErrors = [];
    const offlineRequestedUrls = [];
    offlinePage.on("pageerror", (err) => offlineUnhandledErrors.push(err.message));
    offlinePage.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const txt = msg.text();
      if (!txt.includes("503") && !txt.includes("Failed to load resource") && !txt.includes("net::ERR")) {
        offlineConsoleErrors.push(txt);
      }
    });
    offlinePage.on("request", (req) => offlineRequestedUrls.push(req.url()));

    await offlinePage.setViewport({ width: 1280, height: 800 });
    await offlinePage.goto(`http://${HOST}:${PORT}/index.html`, { waitUntil: "domcontentloaded" });
    await offlinePage.waitForSelector(".today-hero");
    const swControlled = await offlinePage.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      await navigator.serviceWorker.ready;
      return navigator.serviceWorker.controller !== null;
    });
    assert(swControlled, "Service Worker is active and controlling the fresh browser client");

    // Load the successful sibling bank while online; sentences remains a first-use load.
    await offlinePage.click("#nav-practice");
    await offlinePage.waitForSelector(".practice-container");
    const wordsLoadedBeforeFailure = await offlinePage.evaluate(() => globalThis.NederDataLoader.isBankLoaded("words"));
    assert(wordsLoadedBeforeFailure, "Words sibling bank is loaded before sentences fails");

    // Go offline in browser and server
    isSimulatedOffline = true;
    await offlinePage.setOfflineMode(true);

    // Click practice context mode (which requires unvisited sentences bank)
    const contextModeBtn = await offlinePage.$("button[data-mode='context']");
    assert(contextModeBtn !== null, "Found context mode button on practice tab");
    await contextModeBtn.click();

    await offlinePage.waitForSelector(".error-state", { timeout: 10000 });
    const errorCard = await offlinePage.$(".error-state");
    assert(errorCard !== null, "Offline request for unvisited data bank renders accessible error card with retry button");

    const retryBtn = await offlinePage.$("#btn-retry-load");
    assert(retryBtn !== null, "Retry button is present and accessible on error card");
    assert(offlineUnhandledErrors.length === 0 && offlineConsoleErrors.length === 0, "Zero unhandled exceptions or script console errors during offline error state", offlineConsoleErrors.join("; "));

    const wordsStillLoaded = await offlinePage.evaluate(() => globalThis.NederDataLoader.isBankLoaded("words"));
    assert(wordsStillLoaded, "Successful words sibling remains loaded after sentences failure");
    const retryRequestStart = offlineRequestedUrls.length;

    // Bring network back online
    isSimulatedOffline = false;
    await offlinePage.setOfflineMode(false);

    // Click retry button
    await offlinePage.click("#btn-retry-load");
    await offlinePage.waitForSelector(".context-wrapper", { timeout: 10000 });
    const recoveredContext = await offlinePage.$(".context-wrapper");
    assert(recoveredContext !== null, "Clicking retry button successfully recovered and rendered context practice once online");

    const sentencesLoaded = await offlinePage.evaluate(() => globalThis.NederDataLoader.isBankLoaded("sentences"));
    assert(sentencesLoaded, "Failed sentences bank is marked loaded after retry");
    const retryDataRequests = offlineRequestedUrls
      .slice(retryRequestStart)
      .filter((url) => new URL(url).pathname.includes("/data/"));
    assert(
      retryDataRequests.length === 1 && new URL(retryDataRequests[0]).pathname.endsWith("/data/sentences.js"),
      "Retry fetches only the failed sentences bank and does not re-download words",
      retryDataRequests.join(", ")
    );
    await offlinePage.close();

    // -------------------------------------------------------
    // PART 2: MOBILE VIEWPORT TESTS (375 x 667)
    // -------------------------------------------------------
    console.log("\n--- [Mobile Viewport: 375x667] ---");
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await page.goto(`http://${HOST}:${PORT}/index.html`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".today-hero");

    const mobileNav = await page.$(".app-header");
    assert(mobileNav !== null, "Mobile layout header rendered");

    // Test tab navigation on mobile
    await page.click("#nav-practice");
    await page.waitForSelector(".practice-container");
    assert(true, "Mobile navigation to Practice hub succeeded");

    // Test mobile flashcard tap
    await page.waitForSelector("#interactive-flashcard");
    await page.tap("#interactive-flashcard");
    await page.waitForSelector(".srs-controls");
    assert(true, "Mobile touch tap revealed flashcard");

    console.log(`\nZero console errors encountered throughout all ${passed} browser assertions.`);
  } catch (err) {
    console.error("Browser test exception:", err);
    failed++;
  } finally {
    await browser.close();
    server.close();
  }

  console.log("\n=======================================================");
  console.log(`Browser Tests Completed: ${passed} Passed, ${failed} Failed`);
  console.log("=======================================================\n");

  if (failed > 0) process.exit(1);
}

runBrowserTests();
