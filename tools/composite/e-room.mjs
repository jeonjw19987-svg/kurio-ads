// Ad E ④ — the owner's image of the clock on a room wall (2026-11-26), with the caption its generator baked in removed.
//
//   node tools/composite/e-room.mjs            (npm run composite:e-room)
//
// Input (git-ignored): public/assets/E_gat_clock/07_room_original.png — 1024 × 1536, supplied by the owner as cut ④
// ("벽에 직접 설치된 미니멀 시계.png"). It was made from the v2 ④ still, so it carries "On the wall, keeping time."
// as pixels. The template draws that caption itself (same type and motion as every cut), so the baked copy goes.
// Output: public/assets/E_gat_clock/07_room.png (RGB) — identical to the input outside the caption's box.
//
// The caption sits on plain wall. Inside its box (dark pixels + a margin for the anti-aliased edge) the wall is
// rebuilt as a harmonic (Laplace) fill from the box's own border — continuous with the wall on all four sides — and
// the wall's own grain is copied back from the band directly above the box. Nothing else in the image is touched.
import path from "node:path";
import { lum, readImage, writePng } from "./img.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const DIR = path.join(root, "public/assets/E_gat_clock");
const img = readImage(path.join(DIR, "07_room_original.png"));
const { w, h, data } = img;

// 1. The caption: dark pixels on the wall left of the shelf, in the upper part of the frame (x < 660: the shadow line
// where the wall meets the shelf's post starts near x 688).
const SEARCH = { x0: 20, x1: 660, y0: 120, y1: 420 };
let bx0 = w, by0 = h, bx1 = -1, by1 = -1;
for (let y = SEARCH.y0; y < SEARCH.y1; y++)
  for (let x = SEARCH.x0; x < SEARCH.x1; x++)
    if (lum(img, x, y) < 160) {
      bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y);
    }
if (bx1 < 0) throw new Error("no caption found");
const M = 8; // margin for the anti-aliased edge
const x0 = bx0 - M, x1 = bx1 + M, y0 = by0 - M, y1 = by1 + M;
const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
if (y0 - bh - 8 < 0) throw new Error("no clean band above the caption for the grain");

// 2. Harmonic fill per channel: border = the original pixels just outside the box; start from vertical interpolation.
const at = (x, y, c) => data[(y * w + x) * 3 + c];
const out = new Float32Array(data);
for (let c = 0; c < 3; c++) {
  const f = new Float32Array((bw + 2) * (bh + 2));
  const W2 = bw + 2;
  for (let j = 0; j < bh + 2; j++)
    for (let i = 0; i < bw + 2; i++) {
      const x = x0 - 1 + i, y = y0 - 1 + j;
      const border = i === 0 || j === 0 || i === bw + 1 || j === bh + 1;
      if (border) f[j * W2 + i] = at(x, y, c);
      else {
        const t = j / (bh + 1);
        f[j * W2 + i] = at(x, y0 - 1, c) * (1 - t) + at(x, y1 + 1, c) * t;
      }
    }
  const omega = 1.9;
  for (let it = 0; it < 1500; it++)
    for (let j = 1; j <= bh; j++)
      for (let i = 1; i <= bw; i++) {
        const k = j * W2 + i;
        const g = (f[k - 1] + f[k + 1] + f[k - W2] + f[k + W2]) / 4;
        f[k] += omega * (g - f[k]);
      }
  for (let j = 1; j <= bh; j++) for (let i = 1; i <= bw; i++) out[((y0 - 1 + j) * w + (x0 - 1 + i)) * 3 + c] = f[j * W2 + i];
}

// 3. Grain: the wall's own fine texture (pixel minus its 13 × 13 local mean) from the band of the same size directly
// above the box, added back so the filled area has the same noise as the wall around it.
const R = 6;
const localMean = (x, y, c) => {
  let s = 0, n = 0;
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { s += at(x + dx, y + dy, c); n++; }
  return s / n;
};
for (let j = 0; j < bh; j++)
  for (let i = 0; i < bw; i++) {
    const sx = x0 + i, sy = y0 - bh - 4 + j;
    for (let c = 0; c < 3; c++) out[((y0 + j) * w + (x0 + i)) * 3 + c] += at(sx, sy, c) - localMean(sx, sy, c);
  }

writePng(path.join(DIR, "07_room.png"), { w, h, data: out });
console.log(`07_room.png ${w}×${h}; caption box x ${x0}–${x1}, y ${y0}–${y1} (${bw} × ${bh}) rebuilt from the wall`);
