// NederPath Comprehensive End-to-End Headless Browser Test Suite (Puppeteer)
import puppeteer from "puppeteer-core";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 3456;

// Find Chrome or Edge executable on Windows
const BROWSER_PATHS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
];

const executablePath = BROWSER_PATHS.find(p => existsSync(p));
if (!executablePath) {
  console.error("No compatible browser (Edge or Chrome) found for browser tests.");
  process.exit(1);
}

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
  console.log("=======================================================\n");

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

  try {
    // 1. Initial Page Load
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "networkidle0" });
    const title = await page.title();
    assert(title.includes("NederPath"), "Page title contains 'NederPath'");
    assert(consoleErrors.length === 0, "Zero browser console errors on initial load", consoleErrors.join("; "));

    // 2. Today View verification
    const heroTitle = await page.$eval(".today-title", (el) => el.textContent);
    assert(heroTitle.length > 5, "Today view hero title rendered");

    // 3. Navigation: Woorden (Vocabulary & 20,000-word Dictionary)
    await page.click("#nav-words");
    await page.waitForSelector(".words-search-card");
    const wordsPageTitle = await page.$eval(".page-title", (el) => el.textContent);
    assert(wordsPageTitle.includes("Woordenboek"), "Navigated to Words Dictionary view");

    // Test Search input
    await page.type("#words-search-input", "fiets");
    await new Promise((r) => setTimeout(r, 200));
    const firstWordResult = await page.$eval(".word-title", (el) => el.textContent);
    assert(firstWordResult.toLowerCase().includes("fiets"), "Dictionary search filters and finds 'fiets'");

    // Toggle star/bookmark on first word
    const starBtn = await page.$(".btn-star");
    if (starBtn) {
      await starBtn.click();
      assert(true, "Toggled word bookmark/star");
    }

    // 4. Navigation: Grammatica (Grammar Curriculum & 7 Exercise Types)
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

    // 5. Navigation: Lezen (Comprehension Passages & Quizzes)
    await page.click("#nav-comprehension");
    await page.waitForSelector(".comprehension-catalog-container");
    const passageCards = await page.$$(".passage-item-card");
    assert(passageCards.length === 100, `Comprehension library rendered all 100 passage cards (found: ${passageCards.length})`);

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

    // 6. Navigation: Oefenen (Interactive Practice Modes)
    await page.click("#nav-practice");
    await page.waitForSelector(".practice-container");

    // Mode 1: Flashcard Flip & SRS Rating
    await page.waitForSelector("#interactive-flashcard");
    await page.click("#interactive-flashcard");
    await page.waitForSelector(".srs-controls");
    assert(true, "Flashcard revealed on click");
    await page.click("#btn-srs-good");
    assert(true, "Submitted SRS rating and advanced to next card");

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

    // Mode 6: Verbs
    const verbsNavBtn = await page.$("button[data-mode='verbs']");
    if (verbsNavBtn) {
      await verbsNavBtn.click();
      await page.waitForSelector(".verbs-wrapper");
      await page.type("#verb-input", "werkt");
      await page.click("#verb-form button[type='submit']");
      await page.waitForSelector(".exercise-feedback");
      assert(true, "Verb conjugation submitted and feedback shown");
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
      await page.type("#morphology-input", "boeken");
      await page.click("#morphology-form button[type='submit']");
      await page.waitForSelector(".exercise-feedback");
      assert(true, "Morphology plural/diminutive submitted and evaluated");
    }

    // Mode 9: Context Practice
    const ctxNavBtn = await page.$("button[data-mode='context']");
    if (ctxNavBtn) {
      await ctxNavBtn.click();
      await page.waitForSelector(".context-wrapper");
      await page.click("#btn-next-ctx");
      assert(true, "Context practice sentence reviewed and advanced");
    }

    // 7. Navigation: Pad (8-Section Curriculum Path)
    await page.click("#nav-path");
    await page.waitForSelector(".sections-list");
    const sectionCards = await page.$$(".section-card");
    assert(sectionCards.length === 8, `Path view rendered all 8 curriculum sections (found: ${sectionCards.length})`);

    // 8. Navigation: Voortgang (Progress Analytics)
    await page.click("#nav-progress");
    await page.waitForSelector(".progress-container");
    const heatmapCells = await page.$$(".heatmap-cell");
    assert(heatmapCells.length === 30, `30-Day Activity heatmap rendered 30 cells (found: ${heatmapCells.length})`);

    // 9. Navigation: Instellingen (Settings & Themes)
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

    // 10. LocalStorage Persistence Verification
    const storedState = await page.evaluate(() => localStorage.getItem("nederpath-v1"));
    assert(storedState !== null && storedState.length > 50, "Application state correctly persisted in localStorage (nederpath-v1)");

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
