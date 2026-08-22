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

async function inspectNumberRail(page, selector) {
  return page.$eval(selector, (row) => {
    const label = row.querySelector(".number-rail-label");
    const copy = row.querySelector(".number-rail-copy");
    const rowRect = row.getBoundingClientRect();
    const copyRect = copy?.getBoundingClientRect();
    const labelRect = label?.getBoundingClientRect();
    const style = getComputedStyle(row);

    const probe = document.createElement("span");
    probe.style.color = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    document.body.appendChild(probe);
    const accentColor = getComputedStyle(probe).color;
    probe.remove();

    return {
      label: label?.textContent.trim() || "",
      labelColor: label ? getComputedStyle(label).color : "",
      accentColor,
      hasOldPill: Boolean(row.querySelector(":scope > .pill")),
      radius: parseFloat(style.borderRadius),
      railWidth: parseFloat(style.borderLeftWidth),
      copyWidthRatio: copyRect ? copyRect.width / Math.max(1, rowRect.width) : 0,
      labelAlignedLeft: Boolean(labelRect && copyRect && Math.abs(labelRect.left - copyRect.left) <= 2),
      fitsViewport: rowRect.right <= document.documentElement.clientWidth + 1,
      display: style.display
    };
  });
}

async function exerciseLearnTiles(page) {
  const subjectTabs = await page.$$eval(".staged-learn-home [data-learn-tab]", (buttons) => buttons.map((button) => button.dataset.learnTab));
  const homeTileCount = await page.$$eval(".staged-learn-home .hub-tile", (buttons) => buttons.length);
  assert(homeTileCount === 3, `Learn home is back to the three real study tiles (found ${homeTileCount})`);
  assert(JSON.stringify(subjectTabs) === JSON.stringify(["grammar", "words", "comprehension"]), `Study tiles remain Grammar, Words, Comprehension in the intended order (${subjectTabs.join(", ")})`);
  assert((await page.$(".staged-learn-home [data-tile-lab]")) === null, "Temporary Tile Test tile is removed after choosing the final concept");

  const homeText = await page.$eval(".staged-learn-home", (el) => el.textContent);
  assert(!/Vandaag|streak|dagelijkse voortgang|Uitdrukking van de dag/i.test(homeText), "Daily/streak/idiom-of-the-day clutter is absent from the Learn home");
  assert((await page.$("#nav-today")) === null && (await page.$("#nav-path")) === null && (await page.$("#nav-review")) === null, "Today, duplicate Path and standalone Review tiles are removed from the Learn home");

  await page.click("#nav-grammar");
  await page.waitForSelector(".grammar-catalog-container[data-ui-stage='grammar'] [data-filter-lvl='A1'][data-number-rail-applied='true']", { timeout: 15000 });
  const grammarLevels = await page.$$eval(".grammar-catalog-container [data-filter-lvl]", (buttons) => buttons.map((button) => button.dataset.filterLvl));
  assert(grammarLevels.includes("A1") && grammarLevels.includes("C1"), `Grammar opens on staged CEFR choices (${grammarLevels.join(", ")})`);
  assert((await page.$(".grammar-catalog-container [data-rule-id]")) === null, "Grammar does not dump lesson cards before a level is chosen");

  await page.click(".grammar-catalog-container [data-filter-lvl='A1']");
  await page.waitForSelector(".grammar-catalog-container[data-ui-stage='grammar'] button[data-rule-id][data-number-rail-applied='true']", { timeout: 15000 });
  const grammarLessonCount = await page.$$eval(".grammar-catalog-container button[data-rule-id]", (buttons) => buttons.length);
  assert(grammarLessonCount > 0 && grammarLessonCount < 120, `Choosing A1 reveals only that level's grammar lessons (${grammarLessonCount})`);

  const grammarRail = await inspectNumberRail(page, ".grammar-catalog-container button[data-rule-id]");
  assert(grammarRail.label === "Lesson 01", `First grammar tile says “Lesson 01” top-left (${grammarRail.label})`);
  assert(grammarRail.labelColor === grammarRail.accentColor, "Lesson identifier uses the active accent colour");
  assert(!grammarRail.hasOldPill, "Duplicate bottom Les 01 pill is removed");
  assert(grammarRail.railWidth >= 4, `Number Rail accent edge is present (${grammarRail.railWidth}px)`);
  assert(grammarRail.copyWidthRatio >= 0.82, `Lesson copy uses most of the tile width (${Math.round(grammarRail.copyWidthRatio * 100)}%)`);

  await page.click(".grammar-catalog-container button[data-rule-id]");
  await page.waitForSelector(".grammar-lesson-card, .grammar-flow-shell", { timeout: 15000 });
  assert(true, "Grammar level and lesson rows are clickable end-to-end");

  const startLesson = await page.$("#btn-start-grammar-lesson");
  if (startLesson) {
    await startLesson.click();
    await page.waitForSelector("#btn-next-grammar-teach", { timeout: 15000 });
    await page.evaluate(() => {
      const scroller = document.getElementById("app-main");
      if (scroller) scroller.scrollTop = 800;
    });
    await page.click("#btn-next-grammar-teach");
    await page.waitForFunction(() => {
      const scroller = document.getElementById("app-main");
      return scroller && scroller.scrollTop <= 2;
    }, { timeout: 15000 });
    const afterNext = await page.$eval("#app-main", (el) => el.scrollTop);
    assert(afterNext <= 2, `Lesson Next returns the pane to the top (scrollTop ${afterNext})`);
  }

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
  await page.waitForSelector(".comprehension-catalog-container[data-ui-stage='comprehension'] [data-filter-comp-lvl='A1'][data-number-rail-applied='true']", { timeout: 15000 });
  assert((await page.$(".comprehension-catalog-container [data-passage-id]")) === null, "Reading does not dump passage cards before a level is chosen");
  await page.click(".comprehension-catalog-container [data-filter-comp-lvl='A1']");
  await page.waitForSelector(".comprehension-catalog-container[data-ui-stage='comprehension'] button[data-passage-id][data-number-rail-applied='true']", { timeout: 15000 });
  const passageCount = await page.$$eval(".comprehension-catalog-container button[data-passage-id]", (buttons) => buttons.length);
  assert(passageCount > 0, `Choosing A1 reveals curated reading texts (${passageCount})`);
  const readingRail = await inspectNumberRail(page, ".comprehension-catalog-container button[data-passage-id]");
  assert(readingRail.label === "Text 01", `First reading tile uses the same top-left numbering system (${readingRail.label})`);
  assert(!readingRail.hasOldPill, "Reading tile also avoids a duplicate bottom number pill");
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

    await page.click("#nav-progress");
    await page.waitForSelector(".progress-container", { timeout: 15000 });
    await page.waitForFunction(() => !/streak/i.test(document.querySelector("#screen-progress .progress-container")?.textContent || ""), { timeout: 15000 });
    const progressText = await page.$eval("#screen-progress .progress-container", (el) => el.textContent);
    assert(!/streak/i.test(progressText), "Streak gamification is removed from Progress");

    console.log("\n--- NederPath production staged UI: mobile ---");
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await page.goto(`http://${HOST}:${PORT}/index.html`, { waitUntil: "domcontentloaded" });
    await waitForHome(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflow <= 1, `Clean Learn home fits a 375px mobile viewport (overflow ${overflow}px)`);
    const mobileTiles = await page.$$(".staged-learn-home .hub-tile");
    assert(mobileTiles.length === 3, "All three real Learn tiles remain present on mobile");

    await page.tap("#nav-grammar");
    await page.waitForSelector(".grammar-catalog-container[data-ui-stage='grammar'] [data-filter-lvl='A1'][data-number-rail-applied='true']", { timeout: 15000 });
    await page.tap(".grammar-catalog-container [data-filter-lvl='A1']");
    await page.waitForSelector(".grammar-catalog-container[data-ui-stage='grammar'] button[data-rule-id][data-number-rail-applied='true']", { timeout: 15000 });
    const mobileRail = await inspectNumberRail(page, ".grammar-catalog-container button[data-rule-id]");
    assert(mobileRail.display === "grid", `Mobile Number Rail lesson tile uses grid (${mobileRail.display})`);
    assert(mobileRail.radius >= 18, `Mobile lesson tiles stay rounder (${mobileRail.radius}px radius)`);
    assert(mobileRail.label === "Lesson 01", "Mobile lesson number is the accent label at top-left");
    assert(mobileRail.labelAlignedLeft, "Lesson 01 aligns with the wide lesson copy beneath it");
    assert(!mobileRail.hasOldPill, "Mobile lesson tile has no redundant bottom Lesson 01 pill");
    assert(mobileRail.copyWidthRatio >= 0.82, `Mobile lesson copy spans most of the tile (${Math.round(mobileRail.copyWidthRatio * 100)}%)`);
    assert(mobileRail.fitsViewport, "Wider Number Rail lesson copy still fits the viewport");
    assert(true, "Staged grammar navigation is touch-operable on mobile");

    console.log("\n--- Aurora layer: shell integrity & user-preference contracts ---");
    await page.setViewport({ width: 1280, height: 800 });

    // Settings control must remain a fixed overlay, never demoted to an
    // in-flow flex item by the ambient-surface layering rule.
    await page.goto(`http://${HOST}:${PORT}/index.html`, { waitUntil: "domcontentloaded" });
    await waitForHome(page);
    const settingsBtn = await page.evaluate(() => {
      const el = document.getElementById("app-settings-button");
      if (!el) return null;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        position: cs.position,
        zIndex: parseInt(cs.zIndex, 10),
        top: rect.top,
        rightGap: window.innerWidth - rect.right,
        fullyVisible: rect.top >= 0 && rect.right <= window.innerWidth && rect.width > 0 && rect.height > 0
      };
    });
    assert(settingsBtn !== null, "Settings control exists in the app shell");
    assert(settingsBtn.position === "fixed", `Settings control remains position:fixed (${settingsBtn.position})`);
    assert(settingsBtn.zIndex >= 70, `Settings control keeps its elevated z-index (${settingsBtn.zIndex})`);
    assert(settingsBtn.fullyVisible && settingsBtn.top >= 0, "Settings control stays pinned inside the top-right viewport corner");

    // Celebration effect must honor BOTH reduced-motion sources, and must
    // always tear itself down (canvas removed, nothing left behind).
    await page.evaluate(() => { window.NederApp.store.state.settings.reduceMotion = true; });
    const inAppReduceHonored = await page.evaluate(() => {
      window.NederApp.launchConfetti(document.querySelector("#app-main"));
      return !document.querySelector(".np-confetti-canvas");
    });
    assert(inAppReduceHonored, "In-app 'Reduce motion' setting suppresses celebration effects");

    const osReduceEmulated = await page.evaluate(() => window.NederApp.store.state.settings.reduceMotion = false)
      .then(async () => {
        await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
        const honored = await page.evaluate(() => window.NederApp.prefersReducedMotion() === true);
        await page.emulateMediaFeatures([]);
        return honored;
      });
    assert(osReduceEmulated, "OS prefers-reduced-motion alone suppresses motion preference checks");

    let confettiCleaned = false;
    await page.evaluate(() => {
      const s = window.NederApp.store.state.settings;
      s.reduceMotion = false;
      window.NederApp.launchConfetti(document.querySelector("#app-main"));
    });
    await page.waitForSelector(".np-confetti-canvas", { timeout: 5000 });
    await page.waitForFunction(() => !document.querySelector(".np-confetti-canvas"), { timeout: 6000 });
    confettiCleaned = await page.evaluate(() => !document.querySelector(".np-confetti-canvas"));
    assert(confettiCleaned, "Celebration canvas removes itself after its lifetime cap");

    // Haptics must be silenced by the persisted hapticFeedback=false setting.
    const haptics = await page.evaluate(() => {
      const results = {};
      let calls = 0;
      Object.defineProperty(Object.getPrototypeOf(navigator), "vibrate", {
        configurable: true,
        value: () => { calls += 1; return true; }
      });
      try {
        const app = window.NederApp;
        app.store.state.settings.hapticFeedback = true;
        app.haptic(10);
        results.enabledFires = calls === 1;
        app.store.state.settings.hapticFeedback = false;
        app.haptic(10);
        results.disabledSilent = calls === 1;
      } finally {
        delete Object.getPrototypeOf(navigator).vibrate;
      }
      return results;
    });
    assert(haptics.enabledFires, "Haptics fire when hapticFeedback is enabled");
    assert(haptics.disabledSilent, "Persisted hapticFeedback=false silences every vibration");

    await page.evaluate(() => {
      window.NederApp.store.state.settings.reduceMotion = false;
      window.NederApp.store.state.settings.hapticFeedback = true;
    });

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
