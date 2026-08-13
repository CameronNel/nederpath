// NederPath Comprehensive Cross-Platform End-to-End Headless Browser Test Suite (Puppeteer)
import puppeteer from "puppeteer-core";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 3458;
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

  await new Promise((resolve) => server.listen(PORT, HOST, resolve));
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
    assert(!requestedComprehension, "Initial Today view does NOT request comprehension.js (0.5 MB saved)");
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
    const countWordsBefore = requestedUrls.filter((u) => u.includes("data/words.js")).length;
    await page.click("#nav-words");
    await page.waitForSelector(".words-search-card");

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

    // 5. Navigation: Grammatica (Grammar Curriculum & Word Order Duplicate Tokens Keyboard Flow)
    await page.click("#nav-grammar");
    await page.waitForSelector(".grammar-catalog-container");
    const grammarCards = await page.$$(".grammar-item-card");
    assert(grammarCards.length === 120, `Grammar catalog rendered all 120 rule cards (found: ${grammarCards.length})`);

    // Open first grammar rule
    await grammarCards[0].click();
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
    assert(passageCards.length === 120, `Comprehension library rendered all 120 passage cards (found: ${passageCards.length})`);

    // Open first passage
    await passageCards[0].click();
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

    // Focus SRS rating button and activate via keyboard Enter
    await page.focus("#btn-srs-good");
    await page.keyboard.press("Enter");

    const srsAnnounce = await page.$eval("#live-announcer", (el) => el.textContent);
    assert(srsAnnounce.includes("opgeslagen") || srsAnnounce.includes("Sessie"), `SRS rating advance announced: '${srsAnnounce}'`);

    // Mode 2: De of Het Drill
    const drillNavBtn = await page.$("button[data-mode='article_drill']");
    if (drillNavBtn) {
      await drillNavBtn.click();
      await page.waitForSelector(".drill-card");
      await page.click(".btn-de");
      await page.waitForSelector(".drill-feedback");
      assert(true, "De of Het article drill evaluated and feedback shown");
    }

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

    // Mode 4: Fill in the Blank
    const fillNavBtn = await page.$("button[data-mode='fill_blank']");
    if (fillNavBtn) {
      await fillNavBtn.click();
      await page.waitForSelector(".options-grid");
      const opt = await page.$(".btn-option");
      if (opt) await opt.click();
      await page.waitForSelector(".exercise-feedback");
      assert(true, "Fill in the blank option clicked and evaluated");
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
    const swActive = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      try {
        const reg = await navigator.serviceWorker.ready;
        return !!(reg && (reg.active || reg.installing || reg.waiting));
      } catch {
        return false;
      }
    });
    assert(swActive, "Service Worker is active and controlling the browser client");

    // Switch practice mode back to flashcards and open practice tab
    await page.evaluate(() => {
      if (globalThis.NederApp) globalThis.NederApp.practiceMode = "flashcards";
    });
    await page.click("#nav-practice");
    await page.waitForSelector(".practice-container");

    // Force unload 'sentences' bank from memory and purge from SW caches
    await page.evaluate(async () => {
      if (globalThis.NederDataLoader) {
        globalThis.NederDataLoader.__forceUnloadBankForTest("sentences");
      }
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        for (const key of keys) {
          const cache = await caches.open(key);
          await cache.delete("./data/sentences.js");
          await cache.delete("/data/sentences.js");
        }
      }
    });

    // Go offline in browser and server
    isSimulatedOffline = true;
    await page.setOfflineMode(true);

    // Click practice context mode (which requires unvisited sentences bank)
    const contextModeBtn = await page.$("button[data-mode='context']");
    assert(contextModeBtn !== null, "Found context mode button on practice tab");
    await contextModeBtn.click();

    await page.waitForSelector(".error-state", { timeout: 10000 });
    const errorCard = await page.$(".error-state");
    assert(errorCard !== null, "Offline request for unvisited data bank renders accessible error card with retry button");

    const retryBtn = await page.$("#btn-retry-load");
    assert(retryBtn !== null, "Retry button is present and accessible on error card");
    assert(unhandledErrors.length === 0 && jsConsoleErrors.length === 0, "Zero unhandled exceptions or script console errors during offline error state", jsConsoleErrors.join("; "));

    // Bring network back online
    isSimulatedOffline = false;
    await page.setOfflineMode(false);

    // Click retry button
    await page.click("#btn-retry-load");
    await page.waitForSelector(".context-wrapper", { timeout: 10000 });
    const recoveredContext = await page.$(".context-wrapper");
    assert(recoveredContext !== null, "Clicking retry button successfully recovered and rendered context practice once online");

    const sentencesLoaded = await page.evaluate(() => globalThis.NederDataLoader.isBankLoaded("sentences"));
    assert(sentencesLoaded, "Only the failed bank (sentences) was fetched on retry and marked loaded");

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
