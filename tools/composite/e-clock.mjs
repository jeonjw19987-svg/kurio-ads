// Ad E ① — the GAT Wall Clock lifted off its grey wall onto KURIO's warm off-white ground (same idea as C ①).
//
//   node tools/composite/e-clock.mjs            (npm run composite:e)
//
// Input (git-ignored): public/assets/E_gat_clock/01_wall.jpg — the museum shop's photo of the clock on a plain wall
// (owner's capture, enlarged 2x with Lanczos on the homepage side; no AI).
// Output: public/assets/E_gat_clock/01_wall_cutout.png (RGBA) + 01_wall_cutout.json (product box, for placement).
// The clock is translucent (patterned acrylic over the wall), so it is not cut out with a hard edge. Instead the
// wall is modelled as a smooth 2D polynomial fitted away from the clock, and every pixel keeps its ratio to that wall:
// darker than the wall → black at alpha = 1 − L/B; lighter (the acrylic's bright rim) → white at the alpha that gives
// the same ratio on the new ground. On COLORS.ground the clock, its patterns and its shadow read exactly as on the
// wall, and the frame's edges are the ground itself (ratio 1 → alpha 0): no seam, nothing drawn or retouched.
import fs from "node:fs";
import path from "node:path";
import { lum, readImage, writePng } from "./img.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const DIR = path.join(root, "public/assets/E_gat_clock");
const src = readImage(path.join(DIR, "01_wall.jpg"));
const { w, h } = src;
const L = new Float32Array(w * h);
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) L[y * w + x] = lum(src, x, y);

// 1. Where the clock (and its shadow) is: rows/columns whose pixels differ from the frame's own edge levels.
const rowB = new Float32Array(h);
for (let y = 0; y < h; y++) {
  const v = [];
  for (let x = 0; x < 120; x++) v.push(L[y * w + x]);
  for (let x = w - 120; x < w; x++) v.push(L[y * w + x]);
  v.sort((a, b) => a - b);
  rowB[y] = v[v.length >> 1];
}
let x0 = w, y0 = h, x1 = 0, y1 = 0;
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++)
    if (Math.abs(L[y * w + x] / rowB[y] - 1) > 0.1) {
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
// The clock is round: an ellipse through that box, widened for the soft shadow, is kept out of the wall fit.
const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2 + 90, ry = (y1 - y0) / 2 + 90;
const away = (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1;

// 2. The wall: least-squares polynomial in x and y (each ≤ 3), fitted away from the clock.
const terms = [];
for (let i = 0; i <= 3; i++) for (let j = 0; j <= 3; j++) terms.push([i, j]);
const n = terms.length;
const basis = (x, y) => {
  const u = (2 * x) / (w - 1) - 1, v = (2 * y) / (h - 1) - 1;
  return terms.map(([i, j]) => u ** i * v ** j);
};
const A = Array.from({ length: n }, () => new Float64Array(n + 1));
for (let y = 0; y < h; y += 3)
  for (let x = 0; x < w; x += 3) {
    if (!away(x, y)) continue;
    const b = basis(x, y), z = L[y * w + x];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) A[r][c] += b[r] * b[c];
      A[r][n] += b[r] * z;
    }
  }
for (let i = 0; i < n; i++) {
  let p = i;
  for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[p][i])) p = k;
  [A[i], A[p]] = [A[p], A[i]];
  for (let k = 0; k < n; k++) if (k !== i) { const f = A[k][i] / A[i][i]; for (let c = i; c <= n; c++) A[k][c] -= f * A[i][c]; }
}
const coef = A.map((r, i) => r[n] / r[i]);
const wall = (x, y) => basis(x, y).reduce((s, b, k) => s + b * coef[k], 0);
let resid = 0, cnt = 0;
for (let y = 0; y < h; y += 5) for (let x = 0; x < w; x += 5) if (away(x, y)) { resid += Math.abs(L[y * w + x] - wall(x, y)); cnt++; }

// 3. Ratio to the wall → black (darker) or white (lighter) at the matching alpha on KURIO's ground.
// COLORS.ground #F4F1EC, luminance 241.4. Wall noise (2% darker, 5% lighter — the plaster's faint light streaks) is
// treated as wall (alpha 0), so the ground stays clean.
const G = 0.2126 * 0xf4 + 0.7152 * 0xf1 + 0.0722 * 0xec;
const out = { w, h, ch: 4, data: new Float32Array(w * h * 4) };
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    const i = y * w + x, o = i * 4;
    let r = L[i] / wall(x, y);
    if (r > 0.98 && r < 1.05) r = 1;
    if (r <= 1) {
      out.data[o + 3] = (1 - r) * 255;
    } else {
      out.data[o] = out.data[o + 1] = out.data[o + 2] = 255;
      out.data[o + 3] = Math.min(1, (G * r - G) / (255 - G)) * 255;
    }
  }
writePng(path.join(DIR, "01_wall_cutout.png"), out);
const box = { x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(y1 - y0) };
fs.writeFileSync(path.join(DIR, "01_wall_cutout.json"), JSON.stringify({ width: w, height: h, product: box, wallResidual: +(resid / cnt).toFixed(2) }, null, 2) + "\n");
console.log(`01_wall_cutout.png ${w}×${h}; clock box`, box, `wall fit residual ${(resid / cnt).toFixed(2)} (luminance)`);
