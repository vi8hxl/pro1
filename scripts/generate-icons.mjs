/**
 * Generates the PWA PNG icons for Rentless with no external dependencies.
 *
 * Draws the Rentless mark (indigo rounded tile + roofline + rupee) on a canvas,
 * supersamples it 4x for smooth edges, and writes a valid PNG via node:zlib.
 *
 *   node scripts/generate-icons.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "public", "icons");

const INDIGO = [79, 70, 229]; // #4f46e5
const WHITE = [255, 255, 255];

// Mark geometry in 48-unit space, matching src/app/icon.svg.
const SEGMENTS = [
  [15.5, 18.5, 24, 11.5],
  [24, 11.5, 32.5, 18.5],
  [19, 24.5, 29, 24.5],
  [19, 29.5, 27.5, 29.5],
  [19.5, 23.5, 19.5, 38.5],
  [25, 29.5, 31, 38],
];
const STROKE_UNIT = 3 / 48;
const CORNER_RADIUS_UNIT = 13 / 48;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuffer, data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter type: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function insideRoundedRect(x, y, radius) {
  if (x < 0 || y < 0 || x > 1 || y > 1) return false;
  const cx = Math.min(Math.max(x, radius), 1 - radius);
  const cy = Math.min(Math.max(y, radius), 1 - radius);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

function render(size, { maskable = false } = {}) {
  const SS = 4; // supersample factor
  const W = size * SS;
  const buffer = Buffer.alloc(W * W * 4);

  const scale = maskable ? 0.72 : 1;
  const radius = maskable ? 0 : CORNER_RADIUS_UNIT;
  const stroke = (STROKE_UNIT / 2) * scale;

  const glyph = SEGMENTS.map(([x1, y1, x2, y2]) => [
    0.5 + (x1 / 48 - 0.5) * scale,
    0.5 + (y1 / 48 - 0.5) * scale,
    0.5 + (x2 / 48 - 0.5) * scale,
    0.5 + (y2 / 48 - 0.5) * scale,
  ]);

  for (let py = 0; py < W; py += 1) {
    for (let px = 0; px < W; px += 1) {
      const x = (px + 0.5) / W;
      const y = (py + 0.5) / W;
      const index = (py * W + px) * 4;

      const onTile = maskable ? x >= 0 && x <= 1 && y >= 0 && y <= 1 : insideRoundedRect(x, y, radius);
      if (!onTile) {
        buffer[index + 3] = 0;
        continue;
      }

      let color = INDIGO;
      for (const [x1, y1, x2, y2] of glyph) {
        if (distanceToSegment(x, y, x1, y1, x2, y2) <= stroke) {
          color = WHITE;
          break;
        }
      }

      buffer[index] = color[0];
      buffer[index + 1] = color[1];
      buffer[index + 2] = color[2];
      buffer[index + 3] = 255;
    }
  }

  // Downsample SSxSS blocks with alpha-weighted averaging.
  const out = Buffer.alloc(size * size * 4);
  const block = SS * SS;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const src = ((y * SS + sy) * W + (x * SS + sx)) * 4;
          const alpha = buffer[src + 3] / 255;
          r += buffer[src] * alpha;
          g += buffer[src + 1] * alpha;
          b += buffer[src + 2] * alpha;
          a += alpha;
        }
      }
      const dest = (y * size + x) * 4;
      if (a > 0) {
        out[dest] = Math.round(r / a);
        out[dest + 1] = Math.round(g / a);
        out[dest + 2] = Math.round(b / a);
      }
      out[dest + 3] = Math.round((a / block) * 255);
    }
  }

  return encodePng(size, size, out);
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  ["icon-192.png", 192, {}],
  ["icon-512.png", 512, {}],
  ["icon-maskable-512.png", 512, { maskable: true }],
];

for (const [name, size, options] of targets) {
  const png = render(size, options);
  writeFileSync(resolve(OUT_DIR, name), png);
  console.log(`wrote public/icons/${name} (${size}x${size}, ${png.length} bytes)`);
}
