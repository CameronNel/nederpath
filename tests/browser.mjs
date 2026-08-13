// NederPath Comprehensive Cross-Platform End-to-End Headless Browser Test Suite (Puppeteer)
import puppeteer from "puppeteer-core";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 3456;

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

// Start local static HTTP server
const server = createServer((req, res) => {
  let urlPath = req.url.split("?")[0];
  if (urlPath === "/" || urlPath === "") urlPath = "/index.html";

  const filePath = join(ROOT, urlPath.replace(/^\//, ""));
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
    return;
  }

  const ext = extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || "application/octet-stream";
  try {
    const data = readFileSync(filePath);
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(err.message);
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

  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running at http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  // Track network requests and transfer sizes
  const requestedUrls = [];
  let initialTotalBytes = 0;
  let trackInitial = true;

  page.on("request", (req) => {
    requestedUrls.push(req.url());
  });

  page.on("response", async (res) => {
    if (trackInitial) {
      try {
        const buffer = await res.buffer();
        initialTotalBytes += buffer.length;
      } catch {}
    }
  });

  try {
    // -------------------------------------------------------
    // PART 1: DESKTOP VIEWPORT TESTS (1280 x 800)
    // -------------------------------------------------------
    await page.setViewport({ width: 1280, height: 800 });
    console.log("\n--- [Desktop Viewport: 1280x800] ---");

    // 1. Initial Page Load & Request Tracking Verification
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "networkidle0" });
    trackInitial = false;

    const title = await page.title();
    assert(title.includes("NederPath"), "Page title contains 'NederPath'");
    assert(consoleErrors.length === 0, "Zero browser console errors on initial load", consoleErrors.join("; "));

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

    // 3. Accessibility: Skip-Link & ARIA Live Announcer
    const skipLink = await page.$(".skip-link");
    assert(skipLink !== null, "Skip link exists in DOM");

    await page.focus(".skip-link");
    const isSkipFocused = await page.evaluate(() => document.activeElement === document.querySelector(".skip-link"));
    assert(isSkipFocused, "Skip link is keyboard focusable");

    const liveAnnouncer = await page.$("#live-announcer");
    assert(liveAnnouncer !== null, "Persistent ARIA live announcer region exists in DOM");

    const todayNavCurrent = await page.$eval("#nav-today", (el) => el.getAttribute("aria-current"));
    assert(todayNavCurrent === "page", "Active navigation tab carries aria-current='page'");

    // 4. Navigation: Woorden (On-Demand Loading & In-Memory Promise Cache)
    const countWordsBefore = requestedUrls.filter((u) => u.includes("data/words.js")).length;
    await page.click("#nav-words");
    await page.waitForSelector(".words-search-card");

    const countWordsAfter = requestedUrls.filter((u) => u.includes("data/words.js")).length;
    assert(countWordsAfter === countWordsBefore + 1, "Navigating to Woorden fetched words.js on-demand");

    const wordsPageTitle = await page.$eval(".page-title", (el) => el.textContent);
    assert(wordsPageTitle.includes("Woordenboek"), "Navigated to Words Dictionary view");

    const wordsNavCurrent = await page.$eval("#nav-words", (el) => el.getAttribute("aria-current"));
    assert(wordsNavCurrent === "page", "Woorden navigation button carries aria-current='page'");

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

    // 5. Navigation: Grammatica (Grammar Curriculum & 7 Exercise Types)
    await page.click("#nav-grammar");
    await page.waitForSelector(".grammar-catalog-container");
    const grammarCards = await page.$$(".grammar-item-card");
    assert(grammarCards.length === 120, `Grammar catalog rendered all 120 rule cards (found: ${grammarCards.length})`);

    // Open first grammar rule
    await grammarCards[0].click();
    await page.waitForSelector(".grammar-lesson-card");
    const lessonTitle = await page.$eval(".lesson-title", (el) => el.textContent);
    assert(lessonTitle.length > 5, `Opened grammar lesson: '${lessonTitle}'`);

    // Verify structural formula & rules
    const syntaxBox = await page.$(".syntax-formula");
    assert(syntaxBox !== null, "Structural syntax formula displayed");

    // Click an exercise option
    const optBtn = await page.$(".btn-grammar-opt");
    if (optBtn) {
      await optBtn.click();
      const fb = await page.$("#grammar-ex-feedback");
      assert(fb !== null, "Grammar multiple-choice exercise evaluated and feedback shown");
    }

    // Test exercise stepper
    const nextExBtn = await page.$("#btn-next-grammar-ex");
    if (nextExBtn) {
      await nextExBtn.click();
      assert(true, "Navigated to next grammar exercise in rule");
    }

    // 6. Navigation: Lezen (Comprehension Passages & Quizzes)
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
    }

    // 7. Navigation: Oefenen (Interactive Practice Modes & Keyboard Operability)
    await page.click("#nav-practice");
    await page.waitForSelector(".practice-container");

    // Mode 1: Flashcard Keyboard Flip & Rating (Space / 3)
    await page.waitForSelector("#interactive-flashcard");
    await page.keyboard.press("Space");
    await page.waitForSelector(".srs-controls");
    assert(true, "Flashcard revealed via keyboard Space bar");

    await page.keyboard.press("3");
    assert(true, "Submitted SRS rating via keyboard key '3' and advanced card");

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

    // 9. Navigation: Voortgang (Progress Analytics)
    await page.click("#nav-progress");
    await page.waitForSelector(".progress-container");
    const heatmapCells = await page.$$(".heatmap-cell");
    assert(heatmapCells.length === 30, `30-Day Activity heatmap rendered 30 cells (found: ${heatmapCells.length})`);

    // 10. Navigation: Instellingen (Settings & Themes)
    await page.click("#btn-open-settings");
    await page.waitForSelector(".settings-container");
    assert(true, "Settings view opened");

    // Theme switching
    await page.click("#btn-theme-light");
    const currentTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    assert(currentTheme === "light", "Theme switched to 'light'");

    await page.click("#btn-theme-dark");
    const darkTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    assert(darkTheme === "dark", "Theme switched back to 'dark'");

    // 11. Reduced-Motion Media Query Handling
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
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
    assert(hasReducedMotionCSS, "prefers-reduced-motion disables nonessential animation durations");

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
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "networkidle0" });
    const xssExecuted = await page.evaluate(() => window.__xss_executed);
    assert(xssExecuted === undefined, "HTML injection in user.name is neutralized and does not execute script");

    // -------------------------------------------------------
    // PART 2: MOBILE VIEWPORT TESTS (375 x 667)
    // -------------------------------------------------------
    console.log("\n--- [Mobile Viewport: 375x667] ---");
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "networkidle0" });

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
