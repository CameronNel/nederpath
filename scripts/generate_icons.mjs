// NederPath icon generator - dependency-free PNG encoder (RGBA, zlib via node:zlib).
// Draws a calm dark rounded tile with a lime "N" monogram.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "icons");
mkdirSync(OUT, { recursive: true });

const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const png = (w, h, pixels) => {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    pixels.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
};

const BG = [0x0e, 0x12, 0x18, 255];      // calm near-black blue
const BG2 = [0x16, 0x1d, 0x27, 255];     // top sheen
const LIME = [0xa3, 0xe6, 0x35, 255];    // progress/accent lime
const LIME_SOFT = [0x74, 0x9c, 0x2c, 255];

function inN(x, y, w, h) {
  const t = Math.max(4, Math.round(w * 0.13));
  const x0 = w * 0.24, x1 = w * 0.76;
  const bar = (cx) => x >= cx - t / 2 && x <= cx + t / 2;
  const diag = Math.abs(x - (x0 + ((y / h) * (x1 - x0)))) < t * 0.62;
  const inset = h * 0.22;
  if (y < inset || y > h - inset) return false;
  return bar(x0) || bar(x1) || diag;
}

function draw(size, { rounded = true, maskable = false } = {}) {
  const w = size, h = size;
  const px = Buffer.alloc(w * h * 4);
  const radius = rounded ? (maskable ? 0 : Math.round(size * 0.22)) : 0;
  const safe = maskable ? Math.round(size * 0.18) : Math.round(size * 0.06);
  const cx = w / 2, cy = h / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let a = 255;
      if (radius > 0) {
        const rx = Math.min(x, w - 1 - x), ry = Math.min(y, h - 1 - y);
        if (rx < radius && ry < radius) {
          const dx = radius - rx, dy = radius - ry;
          if (dx * dx + dy * dy > radius * radius) a = 0;
        }
      }
      const i = (y * w + x) * 4;
      if (a === 0) continue;
      const t = y / h;
      let col = BG;
      if (!maskable && t < 0.45) col = BG2;
      if (inN(x, y, w - safe * 2, h - safe * 2) && !maskable) {
        col = LIME;
      } else if (maskable && inN(x, y, w - safe * 2.4, h - safe * 2.4)) {
        col = LIME;
      }
      // soft shadow line under N
      if (!maskable && inN(x, y + 1, w - safe * 2, h - safe * 2) && col[3] === 255 && !inN(x, y, w - safe * 2, h - safe * 2)) {
        col = LIME_SOFT;
      }
      px[i] = col[0]; px[i + 1] = col[1]; px[i + 2] = col[2]; px[i + 3] = a;
    }
  }
  return px;
}

const targets = [
  ["favicon-32.png", 32],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["maskable-512.png", 512, { maskable: true }],
  ["apple-touch-icon.png", 180],
];
for (const [name, size, opts] of targets) {
  writeFileSync(join(OUT, name), png(size, size, draw(size, opts)));
  console.log("wrote icons/" + name);
}
