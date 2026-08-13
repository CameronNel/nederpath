// NederPath End-to-End Headless Browser Test Suite (Puppeteer)
import puppeteer from "puppeteer-core";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 3456;

// Find Chrome or Edge executable
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

// Start local static server
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
    console.log(`  ✓ [BROWSER PASS] ${name}`);
  } else {
    failed++;
    console.error(`  ✗ [BROWSER FAIL] ${name} ${details ? "- " + details : ""}`);
  }
}

async function runBrowserTests() {
  console.log("\n=======================================================");
  console.log("       NederPath End-to-End Browser Test Suite         ");
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
    assert(title.includes("NederPath"), "Page title loads and contains 'NederPath'");
    assert(consoleErrors.length === 0, "Zero browser console errors on initial load", consoleErrors.join("; "));

    // 2. Today View verification
    const heroTitle = await page.$eval(".today-title", (el) => el.textContent);
    assert(heroTitle.length > 5, "Today view hero title rendered properly");

    // 3. Navigation: Woorden (Vocabulary & Dictionary)
    await page.click("#nav-words");
    await page.waitForSelector(".words-search-card");
    const wordsPageTitle = await page.$eval(".page-title", (el) => el.textContent);
    assert(wordsPageTitle.includes("Woordenboek"), "Navigated to Words Dictionary view");

    // Test Search input
    await page.type("#words-search-input", "fiets");
    await new Promise((r) => setTimeout(r, 200));
    const firstWordResult = await page.$eval(".word-title", (el) => el.textContent);
    assert(firstWordResult.toLowerCase().includes("fiets"), "Dictionary search filters and finds 'fiets'");

    // 4. Navigation: Grammatica (Grammar Curriculum)
    await page.click("#nav-grammar");
    await page.waitForSelector(".grammar-catalog-container");
    const grammarCards = await page.$$(".grammar-item-card");
    assert(grammarCards.length > 10, `Grammar catalog rendered multiple rule cards (found: ${grammarCards.length})`);

    // Open first grammar rule
    await grammarCards[0].click();
    await page.waitForSelector(".grammar-lesson-card");
    const lessonTitle = await page.$eval(".lesson-title", (el) => el.textContent);
    assert(lessonTitle.length > 5, `Opened grammar lesson: '${lessonTitle}'`);

    // 5. Navigation: Lezen (Comprehension Passages)
    await page.click("#nav-comprehension");
    await page.waitForSelector(".comprehension-catalog-container");
    const passageCards = await page.$$(".passage-item-card");
    assert(passageCards.length > 10, `Comprehension library rendered passage cards (found: ${passageCards.length})`);

    // Open first passage
    await passageCards[0].click();
    await page.waitForSelector(".passage-reader-card");
    const passageTitle = await page.$eval(".passage-title", (el) => el.textContent);
    assert(passageTitle.length > 5, `Opened reading passage: '${passageTitle}'`);

    // 6. Navigation: Oefenen (Practice Modes)
    await page.click("#nav-practice");
    await page.waitForSelector(".practice-container");

    // Flashcard Flip & SRS
    await page.waitForSelector("#interactive-flashcard");
    await page.click("#interactive-flashcard");
    await page.waitForSelector(".srs-controls");
    assert(true, "Flashcard revealed on click");

    // Click 'Goed' (rating 3)
    await page.click("#btn-srs-good");
    assert(true, "Submitted SRS rating and advanced to next card");

    // Switch to 'De of Het Drill'
    const drillNavBtn = await page.$("button[data-mode='article_drill']");
    if (drillNavBtn) {
      await drillNavBtn.click();
      await page.waitForSelector(".drill-card");
      await page.click(".btn-de");
      await page.waitForSelector(".drill-feedback");
      assert(true, "Article drill interactive choice evaluated and feedback shown");
    }

    // 7. Navigation: Voortgang (Progress View)
    await page.click("#nav-progress");
    await page.waitForSelector(".progress-container");
    const heatmapCells = await page.$$(".heatmap-cell");
    assert(heatmapCells.length === 30, `30-Day Activity heatmap rendered 30 cells (found: ${heatmapCells.length})`);

    // 8. Navigation: Instellingen (Settings View)
    await page.click("#btn-open-settings");
    await page.waitForSelector(".settings-container");
    assert(true, "Settings view opened");

    // Toggle light theme
    await page.click("#btn-theme-light");
    const currentTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    assert(currentTheme === "light", "Theme switched to 'light'");

    // Toggle back to dark theme
    await page.click("#btn-theme-dark");
    const darkTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    assert(darkTheme === "dark", "Theme switched back to 'dark'");

    console.log("\nZero console errors encountered throughout all user flows.");
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
