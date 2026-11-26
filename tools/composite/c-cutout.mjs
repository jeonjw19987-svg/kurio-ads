// Ad C ① — the GOTAE set cut out of its grey studio backdrop, for KURIO's warm off-white ground (revision request
// 2026-11-26: "C 배경을 따뜻한 오프화이트로 교체").
//
//   node tools/composite/c-cutout.mjs            (npm run composite:c)
//
// Input (git-ignored): public/assets/C_gotae/01_product.png — GOTAE's studio photo, product on a grey gradient.
// Output: public/assets/C_gotae/01_product_cutout.png (RGBA) + 01_product_cutout.json (product box, for placement).
// - The backdrop is modelled as a smooth 2D polynomial fitted to the pixels away from the product.
// - The product itself (its dark silhouette, holes filled) keeps its own pixels, fully opaque — not recoloured.
// - Everything the product darkens around it (its contact shadow) becomes black at alpha = 1 − photo/backdrop, so on
//   the new ground the shadow darkens it by the same ratio as in the photo.
// The template draws the result on COLORS.ground (VisualsV5 → cutout).
import fs from "node:fs";
import path from "node:path";
import { lum, readImage, writePng } from "./img.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const DIR = path.join(root, "public/assets/C_gotae");
const src = readImage(path.join(DIR, "01_product.png"));
const { w, h } = src;
const L = new Float32Array(w * h);
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) L[y * w + x] = lum(src, x, y);

// 1. Rough object mask from a per-row backdrop level taken at the frame's left and right edges.
const rowB = new Float32Array(h);
for (let y = 0; y < h; y++) {
  const v = [];
  for (let x = 0; x < 110; x++) v.push(L[y * w + x]);
  for (let x = w - 100; x < w; x++) v.push(L[y * w + x]);
  v.sort((a, b) => a - b);
  rowB[y] = v[v.length >> 1];
}
const rough = new Uint8Array(w * h);
for (let i = 0; i < w * h; i++) rough[i] = L[i] / rowB[Math.floor(i / w)] < 0.9 ? 1 : 0;
const dist = (mask, max) => {
  const d = new Int32Array(w * h).fill(max + 1);
  const q = [];
  for (let i = 0; i < w * h; i++) if (mask[i]) { d[i] = 0; q.push(i); }
  for (let k = 0; k < q.length; k++) {
    const i = q[k], x = i % w, y = (i - x) / w;
    if (d[i] >= max) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const j = yy * w + xx;
      if (d[j] > d[i] + 1) { d[j] = d[i] + 1; q.push(j); }
    }
  }
  return d;
};
const nearObject = dist(rough, 30);

// 2. Backdrop: least-squares polynomial in x (≤ 2) and y (≤ 6), fitted away from the object.
const terms = [];
for (let i = 0; i <= 2; i++) for (let j = 0; j <= 6; j++) terms.push([i, j]);
const n = terms.length;
const basis = (x, y) => {
  const u = (2 * x) / (w - 1) - 1, v = (2 * y) / (h - 1) - 1;
  return terms.map(([i, j]) => u ** i * v ** j);
};
const A = Array.from({ length: n }, () => new Float64Array(n + 1));
for (let y = 0; y < h; y += 3)
  for (let x = 0; x < w; x += 3) {
    if (nearObject[y * w + x] <= 30) continue;
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
const backdrop = (x, y) => basis(x, y).reduce((s, b, k) => s + b * coef[k], 0);
let resid = 0, cnt = 0;
for (let y = 0; y < h; y += 5) for (let x = 0; x < w; x += 5) if (nearObject[y * w + x] > 30) { resid += Math.abs(L[y * w + x] - backdrop(x, y)); cnt++; }

// 3. The product: clearly dark against the backdrop (ratio < 0.42), its largest connected part, holes filled.
const ratio = new Float32Array(w * h);
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) ratio[y * w + x] = L[y * w + x] / backdrop(x, y);
const dark = new Uint8Array(w * h);
for (let i = 0; i < w * h; i++) dark[i] = ratio[i] < 0.42 ? 1 : 0;
const label = new Int32Array(w * h).fill(-1);
let best = { size: 0, id: -1 };
for (let s = 0, id = 0; s < w * h; s++) {
  if (!dark[s] || label[s] >= 0) continue;
  const q = [s];
  label[s] = id;
  for (let k = 0; k < q.length; k++) {
    const i = q[k], x = i % w, y = (i - x) / w;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const j = yy * w + xx;
      if (dark[j] && label[j] < 0) { label[j] = id; q.push(j); }
    }
  }
  if (q.length > best.size) best = { size: q.length, id };
  id++;
}
const core = new Uint8Array(w * h);
for (let i = 0; i < w * h; i++) core[i] = label[i] === best.id ? 1 : 0;
{
  // fill holes: background reachable from the border stays 0
  const seen = new Uint8Array(w * h), q = [];
  for (let x = 0; x < w; x++) for (const y of [0, h - 1]) if (!core[y * w + x]) { seen[y * w + x] = 1; q.push(y * w + x); }
  for (let y = 0; y < h; y++) for (const x of [0, w - 1]) if (!core[y * w + x] && !seen[y * w + x]) { seen[y * w + x] = 1; q.push(y * w + x); }
  for (let k = 0; k < q.length; k++) {
    const i = q[k], x = i % w, y = (i - x) / w;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const j = yy * w + xx;
      if (!seen[j] && !core[j]) { seen[j] = 1; q.push(j); }
    }
  }
  for (let i = 0; i < w * h; i++) if (!core[i] && !seen[i]) core[i] = 1;
}
const fromCore = dist(core, 80);
// The set casts its shadow down onto the table, not onto the wall behind it: shadow only from the brim's widest row
// down (above it, faint backdrop texture would otherwise read as smudges).
let brimRow = 0, brimWidth = 0;
for (let y = 0; y < h; y++) {
  let c = 0;
  for (let x = 0; x < w; x++) c += core[y * w + x];
  if (c > brimWidth) { brimWidth = c; brimRow = y; }
}

// 4. Edges: matting against the known backdrop. The interior (3 px inside the silhouette) keeps its pixels, fully
// opaque. Within 8 px of it, each pixel is a mix of the product's own colour F (its nearest interior pixel) and the
// backdrop B: alpha = (B − L) / (B − L_F), drawn in colour F. This keeps the cup's light rim and anti-aliased edges
// without a grey fringe. Below the brim, the shadow (black, alpha = 1 − L/B) is kept where it is darker.
const outside = new Uint8Array(w * h);
for (let i = 0; i < w * h; i++) outside[i] = core[i] ? 0 : 1;
const depth = dist(outside, 4); // distance into the silhouette
const nearest = new Int32Array(w * h).fill(-1); // nearest interior pixel, by multi-source BFS
const nd = new Int32Array(w * h).fill(1e9);
{
  const q = [];
  for (let i = 0; i < w * h; i++) if (core[i] && depth[i] >= 3) { nearest[i] = i; nd[i] = 0; q.push(i); }
  for (let k = 0; k < q.length; k++) {
    const i = q[k], x = i % w, y = (i - x) / w;
    if (nd[i] >= 8) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const j = yy * w + xx;
      if (nd[j] > nd[i] + 1) { nd[j] = nd[i] + 1; nearest[j] = nearest[i]; q.push(j); }
    }
  }
}
const rgba = new Float32Array(w * h * 4);
let bx0 = w, by0 = h, bx1 = 0, by1 = 0, ax0 = w, ay0 = h, ax1 = 0, ay1 = 0;
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    const i = y * w + x, o = i * 4;
    let a = 0, c = [0, 0, 0];
    if (core[i] && depth[i] >= 3) {
      a = 1;
      c = [src.data[i * 3], src.data[i * 3 + 1], src.data[i * 3 + 2]];
    } else {
      if (nearest[i] >= 0) {
        const f = nearest[i], B = backdrop(x, y), LF = L[f];
        if (B - LF > 20) {
          a = Math.max(0, Math.min(1, (B - L[i]) / (B - LF)));
          c = [src.data[f * 3], src.data[f * 3 + 1], src.data[f * 3 + 2]];
        }
      }
      const d = fromCore[i];
      const fade = d > 80 || y < brimRow ? 0 : d < 50 ? 1 : (80 - d) / 30;
      const s = Math.max(0, Math.min(1, (1 - ratio[i] - 0.06) / 0.94)) * fade;
      if (s > a) { a = s; c = [0, 0, 0]; }
    }
    if (core[i]) { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y); }
    rgba[o] = c[0]; rgba[o + 1] = c[1]; rgba[o + 2] = c[2]; rgba[o + 3] = a * 255;
    if (a > 0.004) { ax0 = Math.min(ax0, x); ax1 = Math.max(ax1, x); ay0 = Math.min(ay0, y); ay1 = Math.max(ay1, y); }
  }

// 5. Crop to what is visible (+ 4 px) and write.
const m = 4;
const cx0 = Math.max(0, ax0 - m), cy0 = Math.max(0, ay0 - m), cx1 = Math.min(w - 1, ax1 + m), cy1 = Math.min(h - 1, ay1 + m);
const cw = cx1 - cx0 + 1, chh = cy1 - cy0 + 1;
const out = { w: cw, h: chh, ch: 4, data: new Float32Array(cw * chh * 4) };
for (let y = 0; y < chh; y++) for (let x = 0; x < cw; x++) for (let k = 0; k < 4; k++) out.data[(y * cw + x) * 4 + k] = rgba[((y + cy0) * w + (x + cx0)) * 4 + k];
writePng(path.join(DIR, "01_product_cutout.png"), out);
const info = {
  source: "01_product.png",
  crop: { x: cx0, y: cy0, w: cw, h: chh },
  product: { x: bx0 - cx0, y: by0 - cy0, w: bx1 - bx0 + 1, h: by1 - by0 + 1 },
  backdropFitMeanError: +(resid / cnt).toFixed(2),
  shadowFromRow: brimRow,
};
fs.writeFileSync(path.join(DIR, "01_product_cutout.json"), JSON.stringify(info, null, 2));
console.log(JSON.stringify(info));

// Optional preview on the ground colour (C_CUTOUT_PREVIEW=<file.png>).
if (process.env.C_CUTOUT_PREVIEW) {
  const g = [244, 241, 236];
  const pv = { w: cw, h: chh, data: new Float32Array(cw * chh * 3) };
  for (let i = 0; i < cw * chh; i++) {
    const a = out.data[i * 4 + 3] / 255;
    for (let k = 0; k < 3; k++) pv.data[i * 3 + k] = g[k] * (1 - a) + out.data[i * 4 + k] * a;
  }
  writePng(process.env.C_CUTOUT_PREVIEW, pv);
}
