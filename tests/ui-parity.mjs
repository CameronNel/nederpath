// Focused production-UI E2E coverage for the clean staged Learn experience.
import puppeteer from "puppeteer-core";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "127.0.0.1";
let PORT = 0;

function findBrowserExecutable() {
  const configured = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.BROWSER_PATH;
  const candidates = [
    configured,
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome-stable",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  ].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("No compatible Chrome/Chromium/Edge executable found for UI tests.");
  return found;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".woff2": "font/woff2"
};

const server = createServer((req, res) => {
  try {
    const parsed = new URL(req.url || "/", `http://${req.headers.host || HOST}`);
    const clean = decodeURIComponent(parsed.pathname === "/" ? "/index.html" : parsed.pathname).replace(/^\//, "");
    const path = join(ROOT, clean);
    if (!existsSync(path) || statSync(path).isDirectory()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const data = readFileSync(path);
    res.writeHead(200, { "Content-Type": MIME[extname(path).toLowerCase()] || "application/octet-stream", "Content-Length": data.length });
    res.end(data);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(error.message);
  }
});

let passed = 0;
let failed = 0;
function assert(condition, label, details = "") {
  if (condition) {
    passed += 1;
    console.log(`  ✓ [PASS] ${label}`);
  } else {
    failed += 1;
    console.error(`  ✗ [FAIL] ${label}${details ? ` - ${details}` : ""}`);
  }
}

async function finishOnboarding(page) {
  const finish = await page.$("#ob-finish");
  if (finish) await finish.click();
  await page.waitForSelector(".staged-learn-home .hub-tiles", { timeout: 15000 });
}

async function waitForHome(page) {
  await page.waitForSelector(".staged-learn-home .hub-tiles", { timeout: 15000 });
}

async function exerciseLearnTiles(page) {
  const tabs = await page.$$eval(".staged-learn-home .hub-tile", (buttons) => buttons.map((button) => button.dataset.learnTab));
  assert(tabs.length === 3, `Learn home exposes exactly three subject tiles (found ${tabs.length})`);
  assert(JSON.stringify(tabs) === JSON.stringify(["grammar", "words", "comprehension"]), `Learn tiles are Grammar, Words, Comprehension in the intended order (${tabs.join(", ")})`);

  const homeText = await page.$eval(".staged-learn-home", (el) => el.textContent);
  assert(!/Vandaag|streak|dagelijkse voortgang|Uitdrukking van de dag/i.test(homeText), "Daily/streak/idiom-of-the-day clutter is absent from the Learn home");
  assert((await page.$("#nav-today")) === null && (await page.$("#nav-path")) === null && (await page.$("#nav-review")) === null, "Today, duplicate Path and standalone Review tiles are removed from the Learn home");

  await page.click("#nav-grammar");
  await page.waitForSelector(".grammar-catalog-container[data-ui-stage='grammar'] [data-filter-lvl='A1']", { timeout: 15000 });
  const grammarLevels = await page.$$eval(".grammar-catalog-container [data-filter-lvl]", (buttons) => buttons.map((button) => button.dataset.filterLvl));
  assert(grammarLevels.includes("A1") && grammarLevels.includes("C1"), `Grammar opens on staged CEFR choices (${grammarLevels.join(", ")})`);
  assert((await page.$(".grammar-catalog-container [data-rule-id]")) === null, "Grammar does not dump lesson cards before a level is chosen");

  await page.click(".grammar-catalog-container [data-filter-lvl='A1']");
  await page.waitForSelector(".grammar-catalog-container[data-ui-stage='grammar'] button[data-rule-id]", { timeout: 15000 });
  const grammarLessonCount = await page.$$eval(".grammar-catalog-container button[data-rule-id]", (buttons) => buttons.length);
  assert(grammarLessonCount > 0 && grammarLessonCount < 120, `Choosing A1 reveals only that level's grammar lessons (${grammarLessonCount})`);
  await page.click(".grammar-catalog-container button[data-rule-id]");
  await page.waitForSelector(".grammar-lesson-card, .grammar-flow-shell", { timeout: 15000 });
  assert(true, "Grammar level and lesson rows are clickable end-to-end");

  await page.click("#nav-learn");
  await waitForHome(page);

  await page.click("#nav-words");
  await page.waitForSelector(".words-search-card", { timeout: 20000 });
  const wordSearch = await page.$("#words-search-input");
  assert(wordSearch !== null, "Vocabulary tile opens the functional dictionary/search screen");
  const wordLevel = await page.$eval("#select-filter-level", (select) => select.value);
  assert(wordLevel === "all", `Vocabulary opens unfiltered after leaving Grammar (level: ${wordLevel})`);

  await page.click("#nav-learn");
  await waitForHome(page);

  await page.click("#nav-comprehension");
  await page.waitForSelector(".comprehension-catalog-container[data-ui-stage='comprehension'] [data-filter-comp-lvl='A1']", { timeout: 15000 });
  assert((await page.$(".comprehension-catalog-container [data-passage-id]")) === null, "Reading does not dump passage cards before a level is chosen");
  await page.click(".comprehension-catalog-container [data-filter-comp-lvl='A1']");
  await page.waitForSelector(".comprehension-catalog-container[data-ui-stage='comprehension'] button[data-passage-id]", { timeout: 15000 });
  const passageCount = await page.$$eval(".comprehension-catalog-container button[data-passage-id]", (buttons) => buttons.length);
  assert(passageCount > 0, `Choosing A1 reveals curated reading texts (${passageCount})`);
  await page.click(".comprehension-catalog-container button[data-passage-id]");
  await page.waitForSelector(".passage-reader-card", { timeout: 15000 });
  assert(true, "Reading level and text rows are clickable end-to-end");
}

async function run() {
  await new Promise((resolve) => server.listen(0, HOST, resolve));
  PORT = server.address().port;
  const browser = await puppeteer.launch({
    executablePath: findBrowserExecutable(),
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Failed to load resource")) errors.push(message.text());
  });

  try {
    console.log("\n--- NederPath production staged UI: desktop ---");
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`http://${HOST}:${PORT}/index.html`, { waitUntil: "domcontentloaded" });
    await finishOnboarding(page);
    await exerciseLearnTiles(page);

    await page.click("#nav-learn");
    await waitForHome(page);
    await page.click("#app-settings-button");
    await page.waitForSelector(".settings-container", { timeout: 15000 });
    await page.waitForFunction(() => !document.querySelector("#select-daily-goal"), { timeout: 15000 });
    assert((await page.$("#select-daily-goal")) === null, "Daily-goal selector is removed from Settings");

    console.log("\n--- NederPath production staged UI: mobile ---");
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await page.goto(`http://${HOST}:${PORT}/index.html`, { waitUntil: "domcontentloaded" });
    await waitForHome(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflow <= 1, `Clean Learn home fits a 375px mobile viewport (overflow ${overflow}px)`);
    const mobileTiles = await page.$$(".staged-learn-home .hub-tile");
    assert(mobileTiles.length === 3, "All three Learn tiles remain present on mobile");
    await page.tap("#nav-grammar");
    await page.waitForSelector(".grammar-catalog-container[data-ui-stage='grammar'] [data-filter-lvl='A1']", { timeout: 15000 });
    await page.tap(".grammar-catalog-container [data-filter-lvl='A1']");
    await page.waitForSelector(".grammar-catalog-container[data-ui-stage='grammar'] button[data-rule-id]", { timeout: 15000 });
    assert(true, "Staged grammar navigation is touch-operable on mobile");

    assert(errors.length === 0, "No uncaught browser errors in the production staged UI flow", errors.join("; "));
  } catch (error) {
    failed += 1;
    console.error("Staged UI test exception:", error);
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\nStaged UI tests completed: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

run();
