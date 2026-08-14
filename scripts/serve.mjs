// NederPath zero-dependency local static HTTP server
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname, normalize, resolve, sep } from "node:path";
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

/**
 * Resolves a raw request URL to a file path confined to the server root.
 * Returns null for malformed or traversal attempts (e.g. '/../package.json'
 * or URL-encoded '..' segments) instead of escaping the root directory.
 */
export function resolveRequestPath(requestUrl, root = ROOT) {
  const urlPath = (requestUrl || "").split("?")[0];
  if (urlPath === "/" || urlPath === "") return join(root, "index.html");

  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }

  const filePath = normalize(join(root, decoded.replace(/^\//, "")));
  if (filePath !== root && !filePath.startsWith(root + sep)) return null;
  return filePath;
}

const server = createServer((req, res) => {
  const filePath = resolveRequestPath(req.url, ROOT);

  if (!filePath || !existsSync(filePath) || statSync(filePath).isDirectory()) {
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

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  server.listen(PORT, () => {
    console.log(`NederPath local dev server running at: http://localhost:${PORT}`);
  });
}
