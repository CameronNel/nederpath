// NederPath zero-dependency local static HTTP server
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

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
    res.writeHead(200, {
      "Content-Type": mime,
      "Cache-Control": "no-cache"
    });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("500 Server Error: " + err.message);
  }
});

server.listen(PORT, () => {
  console.log(`NederPath local dev server running at: http://localhost:${PORT}`);
});
