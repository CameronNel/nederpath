import puppeteer from "puppeteer-core";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "127.0.0.1";
let PORT = 0;

function findBrowserExecutable() {
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.BROWSER_PATH;
  if (envPath && existsSync(envPath)) return envPath;
  const CANDIDATES = [
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome-stable",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
  ];
  for (const p of CANDIDATES) if (existsSync(p)) return p;
  console.error("No browser found for viewport tests.");
  process.exit(1);
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".woff2": "font/woff2"
};

const server = createServer((req, res) => {
  let pathname = "/index.html";
  try { pathname = new URL(req.url, `http://${HOST}`).pathname; } catch {}
  if (pathname === "/" || pathname === "") pathname = "/index.html";
  const filePath = join(ROOT, decodeURIComponent(pathname).replace(/^\//, ""));
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.writeHead(404); res.end("404"); return;
  }
  const data = readFileSync(filePath);
  res.writeHead(200, { "Content-Type": MIME_TYPES[extname(filePath).toLowerCase()] || "application/octet-stream" });
  res.end(data);
});

const VIEWPORTS = [
  { w: 360, h: 800 },
  { w: 375, h: 812 },
  { w: 390, h: 844 },
  { w: 412, h: 915 },
  { w: 768, h: 1024 },
  { w: 1024, h: 768 },
  { w: 1280, h: 800 },
  { w: 1440, h: 900 }
];

async function waitHome(page) {
  await page.waitForSelector("body");
  const finish = await page.$("#ob-finish");
  if (finish) await finish.click();
  await page.waitForSelector(".staged-learn-home .hub-tiles");
}

async function openReview(page) {
  await page.evaluate(() => globalThis.NederApp.openLearnItem("review"));
  await page.waitForSelector(".review-hub");
}

let passed = 0;
let failed = 0;
function assert(cond, name) {
  if (cond) { passed += 1; console.log(`  ✓ [PASS] ${name}`); }
  else { failed += 1; console.error(`  ✗ [FAIL] ${name}`); }
}

await new Promise((resolve) => server.listen(0, HOST, resolve));
PORT = server.address().port;
const browser = await puppeteer.launch({
  executablePath: findBrowserExecutable(),
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});
const page = await browser.newPage();

try {
  console.log("\nNederPath viewport overflow suite\n");
  for (const { w, h } of VIEWPORTS) {
    await page.setViewport({ width: w, height: h });
    await page.goto(`http://${HOST}:${PORT}/index.html`, { waitUntil: "domcontentloaded" });
    await waitHome(page);
    const overflowLearn = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflowLearn <= 1, `${w}x${h} Learn home has no document overflow (${overflowLearn}px)`);

    await page.click("#nav-words");
    await page.waitForSelector(".words-search-card");
    const overflowWords = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflowWords <= 1, `${w}x${h} Words has no document overflow (${overflowWords}px)`);

    await page.click("#nav-learn");
    await waitHome(page);
    await openReview(page);
    const overflowReview = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflowReview <= 1, `${w}x${h} Review has no document overflow (${overflowReview}px)`);

    await page.click("#nav-exam");
    await page.waitForSelector(".exam-hub");
    const overflowExam = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflowExam <= 1, `${w}x${h} Exam has no document overflow (${overflowExam}px)`);

    await page.click("#nav-progress");
    await page.waitForSelector(".progress-container");
    const overflowProgress = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflowProgress <= 1, `${w}x${h} Progress has no document overflow (${overflowProgress}px)`);

    const navUsable = await page.evaluate(() => {
      const nav = document.querySelector(".bottom-nav");
      if (!nav) return false;
      const r = nav.getBoundingClientRect();
      return r.height >= 44 && r.bottom <= (window.innerHeight + 1);
    });
    assert(navUsable, `${w}x${h} bottom navigation remains usable`);
  }

  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`http://${HOST}:${PORT}/index.html`, { waitUntil: "domcontentloaded" });
  await waitHome(page);
  await openReview(page);
  await page.click('[data-mode="flashcards"]');
  await page.waitForSelector("#interactive-flashcard");
  await page.evaluate(() => {
    const el = document.querySelector(".flashcard-dutch");
    if (el) el.textContent = "tweehonderdeenentwintigste";
  });
  const compoundFits = await page.evaluate(() => {
    const card = document.querySelector("#interactive-flashcard");
    const controls = document.querySelector(".flashcard-wrapper");
    if (!card || !controls) return false;
    return controls.getBoundingClientRect().bottom <= window.innerHeight + 8;
  });
  assert(compoundFits, "long Dutch compound stays inside flashcard/player viewport");
} finally {
  await browser.close();
  server.close();
}

console.log(`\nViewport tests: ${passed} passed, ${failed} failed\n`);
if (failed) process.exit(1);
