import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

// CRC32 implementation for valid PNG chunks
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter none
    rgba.copy(raw, rowStart + 1, y * stride, (y + 1) * stride);
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function mix(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = clamp(((px - x1) * dx + (py - y1) * dy) / lenSq, 0, 1);
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function renderKuSOPIcon(size, { maskable = false, rounded = false }) {
  const buf = Buffer.alloc(size * size * 4);
  // Safe zone scaling: maskable uses 0.72 emblem scale so 14% padding surrounds artwork
  const scale = maskable ? 0.72 : 0.86;
  const cornerRadius = rounded ? size * 0.22 : 0;

  // Colors
  const forest = [13, 74, 49]; // #0D4A31
  const forestMid = [17, 94, 63]; // #115E3F
  const fresh = [34, 197, 94]; // #22C55E
  const white = [255, 255, 255];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Normalized coords centered at 0,0 in [-1, 1]
      const nx = ((x + 0.5) / size) * 2 - 1;
      const ny = ((y + 0.5) / size) * 2 - 1;

      // Optional rounded rectangle mask
      let alpha = 1;
      if (rounded) {
        const half = size / 2;
        const bx = half - cornerRadius;
        const by = half - cornerRadius;
        const qx = Math.abs(x + 0.5 - half) - bx;
        const qy = Math.abs(y + 0.5 - half) - by;
        const sd = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - cornerRadius;
        alpha = clamp(0.5 - sd, 0, 1);
      }

      // Base forest background with subtle radial depth
      const rDist = Math.hypot(nx, ny);
      const bgMix = clamp(1 - rDist * 0.9, 0, 1);
      let r = mix(forest[0], forestMid[0], bgMix * 0.45);
      let g = mix(forest[1], forestMid[1], bgMix * 0.45);
      let b = mix(forest[2], forestMid[2], bgMix * 0.45);

      // Scaled artwork coords
      const ax = nx / scale;
      const ay = ny / scale;

      // Soft inner emblem disc
      const discDist = Math.hypot(ax, ay) - 0.78;
      const discAlpha = clamp(0.5 - discDist * size * 0.2, 0, 1);
      if (discAlpha > 0) {
        r = mix(r, 20, discAlpha * 0.2);
        g = mix(g, 112, discAlpha * 0.25);
        b = mix(b, 74, discAlpha * 0.2);
      }

      // Leaf silhouette (intersection of two smooth circles forming a modern leaf)
      const c1 = Math.hypot(ax - 0.12, ay - 0.14) - 0.62;
      const c2 = Math.hypot(ax + 0.18, ay + 0.18) - 0.64;
      const leafSd = Math.max(c1, c2);
      const leafAlpha = clamp(0.5 - leafSd * size * 0.28, 0, 1);
      if (leafAlpha > 0) {
        r = mix(r, fresh[0], leafAlpha);
        g = mix(g, fresh[1], leafAlpha);
        b = mix(b, fresh[2], leafAlpha);
      }

      // Crisp white leaf stem & energy bolt vein
      const veinDist =
        distToSegment(ax, ay, -0.34, 0.34, 0.26, -0.26) - 0.045;
      const veinAlpha = clamp(0.5 - veinDist * size * 0.32, 0, 1);
      if (veinAlpha > 0) {
        r = mix(r, white[0], veinAlpha);
        g = mix(g, white[1], veinAlpha);
        b = mix(b, white[2], veinAlpha);
      }

      const idx = (y * size + x) * 4;
      buf[idx] = Math.round(r);
      buf[idx + 1] = Math.round(g);
      buf[idx + 2] = Math.round(b);
      buf[idx + 3] = Math.round(alpha * 255);
    }
  }

  return encodePNG(size, size, buf);
}

const targets = [
  { name: 'pwa-192x192.png', size: 192, maskable: false, rounded: false },
  { name: 'pwa-512x512.png', size: 512, maskable: false, rounded: false },
  { name: 'pwa-maskable-512x512.png', size: 512, maskable: true, rounded: false },
  { name: 'apple-touch-icon.png', size: 180, maskable: false, rounded: false },
];

for (const t of targets) {
  const png = renderKuSOPIcon(t.size, { maskable: t.maskable, rounded: t.rounded });
  fs.writeFileSync(path.join(PUBLIC_DIR, t.name), png);
  console.log(`Generated public/${t.name} (${t.size}x${t.size}, ${png.length} bytes)`);
}
