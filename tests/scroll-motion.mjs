import puppeteer from "puppeteer-core";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "127.0.0.1";
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

function browserPath() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.BROWSER_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome-stable"
  ].filter(Boolean);
  const found = candidates.find((path) => existsSync(path));
  if (!found) throw new Error("No Chrome/Chromium executable found");
  return found;
}

const server = createServer((req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || HOST}`);
    const relative = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname).replace(/^\//, "");
    const path = join(ROOT, relative);
    if (!existsSync(path) || statSync(path).isDirectory()) {
      res.writeHead(404); res.end("Not found"); return;
    }
    const data = readFileSync(path);
    res.writeHead(200, { "Content-Type": MIME[extname(path).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  } catch (error) {
    res.writeHead(500); res.end(error.message);
  }
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`  ✓ ${message}`);
}

await new Promise((resolve) => server.listen(0, HOST, resolve));
const port = server.address().port;
const browser = await puppeteer.launch({
  executablePath: browserPath(),
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
});
const page = await browser.newPage();

try {
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await page.goto(`http://${HOST}:${port}/index.html`, { waitUntil: "domcontentloaded" });
  const finish = await page.$("#ob-finish");
  if (finish) await finish.click();
  await page.waitForSelector(".staged-learn-home .hub-tiles", { timeout: 15000 });

  // HanaPath's runtime choreography should now be active, not merely dormant CSS.
  await page.click("#nav-grammar");
  await page.waitForFunction(() => {
    const pane = document.querySelector("#screen-grammar");
    return pane && (pane.classList.contains("screen-motion-enter") || pane.querySelector(".motion-enter"));
  }, { timeout: 1500 });
  assert(true, "navigation applies HanaPath screen/item motion classes");

  await page.waitForSelector(".grammar-catalog-container[data-ui-stage='grammar'] [data-filter-lvl='A1']", { timeout: 15000 });
  await page.click(".grammar-catalog-container [data-filter-lvl='A1']");
  await page.waitForSelector(".grammar-catalog-container button[data-rule-id]", { timeout: 15000 });
  await page.click(".grammar-catalog-container button[data-rule-id]");
  await page.waitForSelector("#btn-start-grammar-lesson", { timeout: 15000 });
  await page.click("#btn-start-grammar-lesson");
  await page.waitForSelector("#btn-next-grammar-teach", { timeout: 15000 });

  const scrollState = await page.evaluate(() => {
    const main = document.getElementById("app-main");
    main.scrollTop = main.scrollHeight;
    return {
      top: main.scrollTop,
      max: main.scrollHeight - main.clientHeight,
      windowTop: window.scrollY
    };
  });
  assert(scrollState.max > 100 && scrollState.top > 100, `#app-main is the real lesson scroller (max ${Math.round(scrollState.max)}px)`);

  const oldTitle = await page.$eval("#grammar-step-title", (el) => el.textContent);
  await page.click("#btn-next-grammar-teach");
  await page.waitForFunction((previous) => {
    const title = document.getElementById("grammar-step-title");
    return title && title.textContent !== previous;
  }, { timeout: 3000 }, oldTitle);
  await page.waitForFunction(() => document.getElementById("app-main").scrollTop <= 8, { timeout: 2500 });
  const after = await page.evaluate(() => ({
    appTop: document.getElementById("app-main").scrollTop,
    windowTop: window.scrollY,
    motionKind: document.querySelector("#screen-grammar")?.dataset.motionKind || ""
  }));
  assert(after.appTop <= 8, `Verder scrolls the app container smoothly back to top (${Math.round(after.appTop)}px)`);
  assert(after.motionKind === "forward", `lesson progression uses HanaPath forward motion (${after.motionKind})`);

  // Verify the full HanaPath motion vocabulary used by the runtime exists in CSS.
  const motionCss = readFileSync(join(ROOT, "css", "styles.css"), "utf8");
  for (const token of [
    "screen-motion-enter", "screen-motion-forward", "screen-motion-back", "screen-motion-completion",
    "motion-rise", "motion-cascade", "motion-focus", "motion-return", "motion-lesson-forward",
    "motion-lesson-back", "motion-lesson-section", "motion-answer", "motion-complete"
  ]) {
    assert(motionCss.includes(token), `HanaPath motion token is present: ${token}`);
  }
} finally {
  await browser.close();
  server.close();
}

console.log("\nScroll + motion integration passed.\n");
