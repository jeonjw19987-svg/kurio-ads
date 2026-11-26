// Ad D — put the REAL plate back into the operator's AI-staged scenes (final copy review, 2026-11-26).
//
//   node tools/composite/d-plate.mjs
//
// The operator's ② and ④ images (02_detail_v3, 04_in_place_v3) were generated with ChatGPT and redraw the plate's
// mother-of-pearl motif. This keeps each scene (surface, light, composition) and replaces the plate itself with the
// seller's own photograph of the plate, mapped onto the AI plate's top face:
// - ②: the seller's top-down photo of the plate → the AI plate's face, by a plane-to-plane perspective map.
// - ④: the same top-down photo for the plate, the seller's front photo on its stand for the stand's legs.
// Inputs (not in this repository, git-ignored): public/assets/D_najeon/02_detail_v3.png, 04_in_place_v3.png and the
// two seller photos copied as src_top_down.jpg and src_front_on_stand.jpg (their origin: docs/internal/).
// The real photo's pixels are only resampled (bicubic) and masked — never retouched, recoloured or generated.
// The map is fixed by the plate's mother-of-pearl border (an ellipse in each image) and by the motif's layout
// (searched by luminance correlation). Output: public/assets/D_najeon/0{2,4}_*_final.png at 2× the AI image size.
import fs from "node:fs";
import path from "node:path";
import { fitEllipse, lum, px, readImage, sample, writePng } from "./img.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const ASSETS = path.join(root, "public/assets/D_najeon");
const OUT = process.env.D_PLATE_OUT ?? ASSETS; // output folder (default: next to the inputs)

// ── Geometry ──────────────────────────────────────────────────────────────────────────────────────────────────
// Walk rays out from c. The plate edge is the first pixel of a ≥ 25 px background run; the mother-of-pearl border's
// outer edge is the last bright pixel before the dark lacquer rim that precedes it.
function borderPoints(img, c, isBg, rmin, angles = [0, 360]) {
  const pts = [];
  for (let a = angles[0]; a < angles[1]; a += 1) {
    const t = (a * Math.PI) / 180, dx = Math.cos(t), dy = Math.sin(t);
    const L = [], B = [];
    for (let r = 0; ; r++) {
      const x = Math.round(c[0] + dx * r), y = Math.round(c[1] + dy * r);
      if (x < 0 || y < 0 || x >= img.w || y >= img.h) break;
      L.push(lum(img, x, y));
      B.push(isBg(px(img, x, y)));
    }
    let e = -1;
    for (let r = rmin; r < B.length - 25 && e < 0; r++) {
      let ok = true;
      for (let k = 0; k < 25 && ok; k++) ok = B[r + k];
      if (ok) e = r;
    }
    if (e < 0) continue;
    let r = e - 1;
    while (r > 0 && L[r] >= 55) r--;
    let dark = 0;
    while (r > 0 && L[r] < 55) { r--; dark++; }
    if (dark >= 4 && L[r] > 100) pts.push([c[0] + dx * r, c[1] + dy * r]);
  }
  return pts;
}

// 3×3 helpers (row-major arrays of 9).
const mul = (A, B) => {
  const C = new Array(9).fill(0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) C[i * 3 + j] += A[i * 3 + k] * B[k * 3 + j];
  return C;
};
const inv = (m) => {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map((v) => v / det);
};
const apply = (m, x, y) => {
  const w = m[6] * x + m[7] * y + m[8];
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w];
};
/** Unit circle → ellipse. */
const ellipseAffine = (e) => {
  // Symmetric stretch R(θ)·diag(a,b)·R(−θ): the disc's axes stay aligned with the image's, so for a near-circle
  // (whose fitted θ means nothing) the search angle below is the plate's actual rotation in the image.
  const c = Math.cos(e.theta), s = Math.sin(e.theta);
  return [e.a * c * c + e.b * s * s, (e.a - e.b) * c * s, e.cx, (e.a - e.b) * c * s, e.a * s * s + e.b * c * c, e.cy, 0, 0, 1];
};
const rot = (t) => [Math.cos(t), -Math.sin(t), 0, Math.sin(t), Math.cos(t), 0, 0, 0, 1];
/** A projective map of the unit disc onto itself: rotate by theta, then move the centre towards direction alpha. */
const discMap = (theta, eta, alpha) =>
  mul(rot(alpha), mul([Math.cosh(eta), 0, Math.sinh(eta), 0, 1, 0, Math.sinh(eta), 0, Math.cosh(eta)], mul(rot(-alpha), rot(theta))));

/** Real → AI map for given parameters: real ellipse → unit disc → (theta, eta, alpha) → AI ellipse. */
const realToAi = (eReal, eAi, p) => mul(ellipseAffine(eAi), mul(discMap(p.theta, p.eta, p.alpha), inv(ellipseAffine(eReal))));

// Correlation of the AI image and the mapped real image over the AI plate face (luminance, a fixed point grid).
function searchMap(real, ai, eReal, eAi, ranges) {
  const A = ellipseAffine(eAi);
  const pts = [], aiL = [];
  for (let v = -0.95; v <= 0.95; v += 0.025)
    for (let u = -0.95; u <= 0.95; u += 0.025) {
      if (u * u + v * v > 0.95 * 0.95) continue;
      const [x, y] = apply(A, u, v);
      if (x < 0 || y < 0 || x >= ai.w - 1 || y >= ai.h - 1) continue;
      pts.push([x, y]);
      aiL.push(lum(ai, Math.round(x), Math.round(y)));
    }
  const mA = aiL.reduce((s, v) => s + v, 0) / aiL.length;
  const score = (p) => {
    const back = inv(realToAi(eReal, eAi, p));
    let sxy = 0, sxx = 0, syy = 0, sy = 0;
    const rl = new Float64Array(pts.length);
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = apply(back, pts[i][0], pts[i][1]);
      const xi = Math.round(x), yi = Math.round(y);
      rl[i] = xi < 0 || yi < 0 || xi >= real.w || yi >= real.h ? 0 : lum(real, xi, yi);
      sy += rl[i];
    }
    const mR = sy / pts.length;
    for (let i = 0; i < pts.length; i++) {
      const a = aiL[i] - mA, b = rl[i] - mR;
      sxy += a * b; sxx += a * a; syy += b * b;
    }
    return sxy / Math.sqrt(sxx * syy);
  };
  let best = { s: -2 };
  for (let theta = ranges.theta[0]; theta <= ranges.theta[1]; theta += ranges.theta[2])
    for (let eta = 0; eta <= ranges.eta[1]; eta += ranges.eta[2])
      for (let alpha = 0; alpha < (eta === 0 ? 1e-9 : 2 * Math.PI); alpha += Math.PI / 12) {
        const p = { theta, eta, alpha }, s = score(p);
        if (s > best.s) best = { ...p, s };
      }
  // Local refinement.
  let step = { theta: ranges.theta[2] / 2, eta: ranges.eta[2] / 2, alpha: Math.PI / 24 };
  for (let it = 0; it < 40; it++) {
    let improved = false;
    for (const k of ["theta", "eta", "alpha"])
      for (const d of [-1, 1]) {
        const p = { theta: best.theta, eta: best.eta, alpha: best.alpha, [k]: best[k] + d * step[k] };
        if (p.eta < 0) continue;
        const s = score(p);
        if (s > best.s) { best = { ...p, s }; improved = true; }
      }
    if (!improved) step = { theta: step.theta / 2, eta: step.eta / 2, alpha: step.alpha / 2 };
  }
  return best;
}

// ── Compositing ───────────────────────────────────────────────────────────────────────────────────────────────
/** AI image ×scale (bicubic), with the real image mapped in where `alpha(xAi, yAi, uvReal)` > 0. */
function composite(ai, real, H, scale, alphaAt) {
  const out = { w: ai.w * scale, h: ai.h * scale, data: new Float32Array(ai.w * scale * ai.h * scale * 3) };
  const back = inv(H);
  const a = [0, 0, 0], r = [0, 0, 0];
  for (let y = 0; y < out.h; y++)
    for (let x = 0; x < out.w; x++) {
      // pixel centre in AI pixel coordinates
      const xa = (x + 0.5) / scale - 0.5, ya = (y + 0.5) / scale - 0.5;
      sample(ai, xa, ya, a);
      const [xr, yr] = apply(back, xa, ya);
      const k = alphaAt(xa, ya, xr, yr);
      if (k > 0) sample(real, xr, yr, r);
      const i = (y * out.w + x) * 3;
      for (let c = 0; c < 3; c++) out.data[i + c] = k > 0 ? a[c] * (1 - k) + r[c] * k : a[c];
    }
  return out;
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));
/** Coverage of the real disc (radius rho in the real border ellipse's unit space), ~1 px soft edge. */
const discAlpha = (eReal, rho, soft) => {
  const back = inv(ellipseAffine(eReal));
  return (xr, yr) => {
    const [u, v] = apply(back, xr, yr);
    return clamp01((rho - Math.hypot(u, v)) / soft + 0.5);
  };
};

/** Binary mask → per-pixel coverage, blurred by a small box (anti-aliasing). */
function softMask(w, h, inside, radius) {
  const m = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) m[y * w + x] = inside(x, y) ? 1 : 0;
  const tmp = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0, n = 0;
    for (let k = -radius; k <= radius; k++) { const xx = x + k; if (xx >= 0 && xx < w) { s += m[y * w + xx]; n++; } }
    tmp[y * w + x] = s / n;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0, n = 0;
    for (let k = -radius; k <= radius; k++) { const yy = y + k; if (yy >= 0 && yy < h) { s += tmp[yy * w + x]; n++; } }
    m[y * w + x] = s / n;
  }
  return (x, y) => {
    const xi = Math.round(x), yi = Math.round(y);
    return xi < 0 || yi < 0 || xi >= w || yi >= h ? 0 : m[yi * w + xi];
  };
}

/** Fill the holes of a binary mask (4-connected flood from the border). */
function fillHoles(w, h, mask) {
  const out = Uint8Array.from(mask), seen = new Uint8Array(w * h), q = [];
  for (let x = 0; x < w; x++) for (const y of [0, h - 1]) if (!mask[y * w + x]) { seen[y * w + x] = 1; q.push(y * w + x); }
  for (let y = 0; y < h; y++) for (const x of [0, w - 1]) if (!mask[y * w + x] && !seen[y * w + x]) { seen[y * w + x] = 1; q.push(y * w + x); }
  while (q.length) {
    const i = q.pop(), x = i % w, y = (i - x) / w;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const j = yy * w + xx;
      if (!seen[j] && !mask[j]) { seen[j] = 1; q.push(j); }
    }
  }
  for (let i = 0; i < w * h; i++) if (!mask[i] && !seen[i]) out[i] = 1;
  return out;
}

/** The plate's own outline in the top-down photo: everything not white table, holes (bright inlay) filled. */
function plateOutline(img) {
  const m = new Uint8Array(img.w * img.h);
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) { const [r, g, b] = px(img, x, y); m[y * img.w + x] = r > 200 && g > 200 && b > 200 ? 0 : 1; }
  const solid = fillHoles(img.w, img.h, m);
  return softMask(img.w, img.h, (x, y) => solid[y * img.w + x] === 1, 1);
}

const report = {};

// ── ② The plate lying on the warm surface ─────────────────────────────────────────────────────────────────────
{
  const ai = readImage(path.join(ASSETS, "02_detail_v3.png"));
  const real = readImage(path.join(ASSETS, "src_top_down.jpg"));
  const pink = ([r, g, b]) => r + g + b > 470 && r - b > 18;
  const white = ([r, g, b]) => r > 200 && g > 200 && b > 200;
  const eAi = fitEllipse(borderPoints(ai, [540, 820], pink, 200));
  const eReal = fitEllipse(borderPoints(real, [480, 520], white, 150));
  const p = searchMap(real, ai, eReal, eAi, { theta: [-Math.PI / 4, Math.PI / 4, Math.PI / 90], eta: [0, 0.5, 0.05] });
  const H = realToAi(eReal, eAi, p);
  // Real face out to its lacquer rim (border radius × 1.03), only where the AI image is plate, not the surface.
  const disc = discAlpha(eReal, 1.02, 0.004);
  const outline = plateOutline(real);
  const plate = softMask(ai.w, ai.h, (x, y) => !pink(px(ai, x, y)), 1);
  const out = composite(ai, real, H, 2, (xa, ya, xr, yr) => disc(xr, yr) * outline(xr, yr) * plate(xa, ya));
  writePng(path.join(OUT, "02_detail_final.png"), out);
  report.detail = { eAi, eReal, map: p };
}

// ── ④ The plate on its stand on the sideboard ─────────────────────────────────────────────────────────────────
// The plate face comes from the top-down photo (no stand in front of it); the stand's two legs come from the front
// photo on its stand. Each leg is moved (translation only) onto the AI leg it replaces, so it meets the AI scene's
// contact shadow; the legs sit behind the plate.
{
  const ai = readImage(path.join(ASSETS, "04_in_place_v3.png"));
  const top = readImage(path.join(ASSETS, "src_top_down.jpg"));
  const front = readImage(path.join(ASSETS, "src_front_on_stand.jpg"));
  const wall = ([r, g, b]) => r + g + b > 420 && r - b > 20;
  const white = (t) => ([r, g, b]) => r > t && g > t && b > t;
  const eAi = fitEllipse(borderPoints(ai, [466, 915], wall, 150, [180, 360]));
  const eTop = fitEllipse(borderPoints(top, [480, 520], white(200), 150));
  const eFront = fitEllipse(borderPoints(front, [500, 530], white(190), 120, [180, 360]));
  const pTop = searchMap(top, ai, eTop, eAi, { theta: [-Math.PI / 6, Math.PI / 6, Math.PI / 180], eta: [0, 0.3, 0.05] });
  const pFront = searchMap(front, ai, eFront, eAi, { theta: [-Math.PI / 18, Math.PI / 18, Math.PI / 360], eta: [0, 0.3, 0.05] });
  const HTop = realToAi(eTop, eAi, pTop), HFront = realToAi(eFront, eAi, pFront);

  // Leg masks: lacquer below the plate, outside its rim, left or right of the centre strut.
  const legZone = (e) => {
    const toUnit = inv(ellipseAffine(e));
    return (x, y) => {
      const [u, v] = apply(toUnit, x, y);
      if (Math.hypot(u, v) <= 1.03 || v < 0.45 || v > 1.75 || Math.abs(u) < 0.3 || Math.abs(u) > 1.35) return 0;
      return u < 0 ? -1 : 1;
    };
  };
  const zFront = legZone(eFront), zAi = legZone(eAi);
  const legs = [-1, 1].map((side) => {
    // Front photo: lacquer (L < 100) and the inlays it encloses.
    const m = new Uint8Array(front.w * front.h);
    for (let y = 0; y < front.h; y++) for (let x = 0; x < front.w; x++) m[y * front.w + x] = zFront(x, y) === side && lum(front, x, y) < 100 ? 1 : 0;
    const solid = fillHoles(front.w, front.h, m);
    // Alignment: the strict lacquer (L < 45) of both, the front one mapped into the AI image; best overlap.
    const aiSet = new Set(), frontPts = [];
    for (let y = 0; y < ai.h; y++) for (let x = 0; x < ai.w; x++) if (zAi(x, y) === side && lum(ai, x, y) < 45) aiSet.add(y * ai.w + x);
    for (let y = 0; y < front.h; y++)
      for (let x = 0; x < front.w; x++)
        if (solid[y * front.w + x] && lum(front, x, y) < 45) frontPts.push(apply(HFront, x, y).map(Math.round));
    let best = { iou: -1 };
    for (let dy = -40; dy <= 40; dy++)
      for (let dx = -40; dx <= 40; dx++) {
        const moved = new Set();
        for (const [x, y] of frontPts) moved.add((y + dy) * ai.w + (x + dx));
        let inter = 0;
        for (const k of moved) if (aiSet.has(k)) inter++;
        const iou = inter / (aiSet.size + moved.size - inter);
        if (iou > best.iou) best = { iou, dx, dy };
      }
    return { side, mask: softMask(front.w, front.h, (x, y) => solid[y * front.w + x] === 1, 1), ...best };
  });

  const backTop = inv(HTop), backFront = inv(HFront);
  const disc = discAlpha(eTop, 1.02, 0.004);
  const outline = plateOutline(top);
  const plate = softMask(ai.w, ai.h, (x, y) => !wall(px(ai, x, y)), 1);
  const S2 = 2;
  const out = { w: ai.w * S2, h: ai.h * S2, data: new Float32Array(ai.w * S2 * ai.h * S2 * 3) };
  const c = [0, 0, 0], r = [0, 0, 0];
  for (let y = 0; y < out.h; y++)
    for (let x = 0; x < out.w; x++) {
      const xa = (x + 0.5) / S2 - 0.5, ya = (y + 0.5) / S2 - 0.5;
      sample(ai, xa, ya, c);
      for (const leg of legs) {
        const [xf, yf] = apply(backFront, xa - leg.dx, ya - leg.dy);
        const k = leg.mask(xf, yf);
        if (k > 0) { sample(front, xf, yf, r); for (let i = 0; i < 3; i++) c[i] = c[i] * (1 - k) + r[i] * k; }
      }
      const [xt, yt] = apply(backTop, xa, ya);
      const k = disc(xt, yt) * outline(xt, yt) * plate(xa, ya);
      if (k > 0) { sample(top, xt, yt, r); for (let i = 0; i < 3; i++) c[i] = c[i] * (1 - k) + r[i] * k; }
      const o = (y * out.w + x) * 3;
      out.data[o] = c[0]; out.data[o + 1] = c[1]; out.data[o + 2] = c[2];
    }
  writePng(path.join(OUT, "04_in_place_final.png"), out);
  report.inPlace = { eAi, eTop, eFront, plateMap: pTop, standMap: pFront, legs: legs.map(({ side, dx, dy, iou }) => ({ side, dx, dy, iou })) };
}

fs.writeFileSync(path.join(OUT, "composite-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, (k, v) => (typeof v === "number" ? +v.toFixed(4) : v)));
