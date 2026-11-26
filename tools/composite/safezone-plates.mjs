// SAFEZONE (2026-11-26): the image layer of each FINAL2 cut, taken from the FINAL2 MP4 itself, for the cuts whose
// source images are not on this computer (FINAL2 was rendered elsewhere; FINAL2.zip carries the renders only).
//
//   node tools/composite/safezone-plates.mjs <FINAL2 _render folder>      (npm run composite:safezone-plates -- <dir>)
//
// A cut's first frame is its image layer at the start of its push-in (scale 1), drawn by the same template:
// - ② ③ ④: the caption only rises in 0.3 s after the cut, so frame 0 of the cut is clean.
// - ①: the name block is on screen from frame 0 — on plain ground, so it is removed: B ① and C ① sit on KURIO's flat
//   ground (filled with that ground's own colour), D ① on the photo's smooth light ground (harmonic fill from the
//   box's border plus the ground's own grain, as tools/composite/e-room.mjs). The products are not touched.
// - ③ (cuts with a 16 px drift): the right edge column is repeated 24 px further, so the drift never uncovers the
//   frame's edge (FINAL2's ③ ended with a 2 px light line there).
// Frames are decoded with exact rounding (BT.709, limited → full range): measured against this computer's own render of
// the same frames (A ②, A ④), bias ≤ 0.1 level and mean difference 0.6 level — the H.264 noise of the FINAL2 master.
// Output (git-ignored): public/assets/SAFEZONE_plates/<name>.png. src/ads/products/safezone.ts places them with each
// cut's own camera (push-in origin, amount and drift), so the motion is FINAL2's.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { lum, readImage, writePng } from "./img.mjs";

const final2 = process.argv[2];
if (!final2) {
  console.error("usage: node tools/composite/safezone-plates.mjs <FINAL2 _render folder>");
  process.exit(1);
}
const root = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(root, "public/assets/SAFEZONE_plates");
const FF = fs
  .readdirSync(path.join(root, "node_modules/@remotion"))
  .filter((d) => d.startsWith("compositor-"))
  .map((d) => path.join(root, "node_modules/@remotion", d, process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"))
  .find((p) => fs.existsSync(p));

// FINAL2 folders use the request's letters of that day: B = mother-of-pearl plate, D = gat.
const A = "A-moon-jar/KURIO_AD_A_261126_v2_SILENT.mp4";
const GAT = "D-traditional-gat/KURIO_AD_D_261126_v2_SILENT.mp4";
const GOTAE = "C-gotae/KURIO_AD_C_261126_v2_SILENT.mp4";
const PLATE = "B-mother-of-pearl-plate/KURIO_AD_B_261126_v2_SILENT.mp4";
/** [plate name, video, frame, ① clean-up, right padding] */
const CUTS = [
  ["A_03_making", A, 180, null, 24],
  ["B_01_product", GAT, 0, "ground", 0],
  ["B_02_detail", GAT, 90, null, 0],
  ["B_03_making", GAT, 180, null, 24],
  ["B_04_in_place", GAT, 270, null, 0],
  ["C_01_product", GOTAE, 0, "ground", 0],
  ["C_02_detail", GOTAE, 90, null, 0],
  ["C_03_making", GOTAE, 180, null, 24],
  ["C_04_in_place", GOTAE, 270, null, 0],
  ["D_01_product", PLATE, 0, "harmonic", 0],
  ["D_02_detail", PLATE, 90, null, 0],
  ["D_03_making", PLATE, 180, null, 24],
  ["D_04_in_place", PLATE, 270, null, 0],
];

/**
 * The ① name block: pixels in the caption area that stand off the row's own ground. Returns its box + margin `M` —
 * 36 px for a photographic ground, beyond the caption's soft 28 px light halo (TYPE_V5.tone.ink.halo).
 */
function captionBox(img, M) {
  const R = { x0: 60, x1: 1040, y0: 170, y1: 470 };
  let bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1;
  for (let y = R.y0; y < R.y1; y++) {
    const row = [];
    for (let x = R.x0; x < R.x1; x += 2) row.push(lum(img, x, y));
    row.sort((a, b) => a - b);
    const bg = row[row.length >> 1];
    for (let x = R.x0; x < R.x1; x++)
      if (bg - lum(img, x, y) > 14) {
        bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y);
      }
  }
  if (bx1 < 0) throw new Error("no caption found");
  return { x0: bx0 - M, x1: bx1 + M, y0: by0 - M, y1: by1 + M };
}

/** Flat ground: the box takes the median colour of the ground just outside it (above and below). */
function fillGround(img, b) {
  const { w, data } = img;
  const samples = [[], [], []];
  for (const y of [b.y0 - 24, b.y0 - 16, b.y0 - 8, b.y1 + 8, b.y1 + 16, b.y1 + 24])
    for (let x = b.x0; x <= b.x1; x += 3) for (let c = 0; c < 3; c++) samples[c].push(data[(y * w + x) * 3 + c]);
  const med = samples.map((s) => s.sort((p, q) => p - q)[s.length >> 1]);
  const spread = samples.map((s) => s[Math.floor(s.length * 0.95)] - s[Math.floor(s.length * 0.05)]);
  if (Math.max(...spread) > 4) throw new Error(`ground around the caption is not flat (5–95 % spread ${spread.join("/")})`);
  for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) for (let c = 0; c < 3; c++) data[(y * w + x) * 3 + c] = med[c];
  return `ground ${med.join(",")} (spread ${spread.join("/")})`;
}

/** Smooth photographic ground: harmonic (Laplace) fill from the box's border + the ground's grain from the band above. */
function fillHarmonic(img, b) {
  const { w, data } = img;
  const bw = b.x1 - b.x0 + 1, bh = b.y1 - b.y0 + 1;
  if (b.y0 - bh - 8 < 0) throw new Error("no clean band above the caption for the grain");
  const at = (x, y, c) => data[(y * w + x) * 3 + c];
  const out = new Float32Array(data);
  for (let c = 0; c < 3; c++) {
    const W2 = bw + 2;
    const f = new Float32Array(W2 * (bh + 2));
    for (let j = 0; j < bh + 2; j++)
      for (let i = 0; i < W2; i++) {
        const x = b.x0 - 1 + i, y = b.y0 - 1 + j;
        const border = i === 0 || j === 0 || i === bw + 1 || j === bh + 1;
        const t = j / (bh + 1);
        f[j * W2 + i] = border ? at(x, y, c) : at(x, b.y0 - 1, c) * (1 - t) + at(x, b.y1 + 1, c) * t;
      }
    for (let it = 0; it < 1500; it++)
      for (let j = 1; j <= bh; j++)
        for (let i = 1; i <= bw; i++) {
          const k = j * W2 + i;
          f[k] += 1.9 * ((f[k - 1] + f[k + 1] + f[k - W2] + f[k + W2]) / 4 - f[k]);
        }
    for (let j = 1; j <= bh; j++) for (let i = 1; i <= bw; i++) out[((b.y0 - 1 + j) * w + (b.x0 - 1 + i)) * 3 + c] = f[j * W2 + i];
  }
  const R = 6;
  const mean = (x, y, c) => {
    let s = 0;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) s += at(x + dx, y + dy, c);
    return s / (2 * R + 1) ** 2;
  };
  for (let j = 0; j < bh; j++)
    for (let i = 0; i < bw; i++) {
      const sx = b.x0 + i, sy = b.y0 - bh - 4 + j;
      for (let c = 0; c < 3; c++) out[((b.y0 + j) * w + (b.x0 + i)) * 3 + c] += at(sx, sy, c) - mean(sx, sy, c);
    }
  data.set(out);
  return "harmonic fill + grain";
}

/** Repeat the right edge column `pad` px further (the image grows to w + pad). */
function padRight(img, pad) {
  const W = img.w + pad;
  const data = new Float32Array(W * img.h * 3);
  for (let y = 0; y < img.h; y++)
    for (let x = 0; x < W; x++) {
      const sx = Math.min(x, img.w - 1);
      for (let c = 0; c < 3; c++) data[(y * W + x) * 3 + c] = img.data[(y * img.w + sx) * 3 + c];
    }
  return { w: W, h: img.h, data };
}

fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kurio-plates-"));
try {
  for (const [name, video, frame, clean, pad] of CUTS) {
    const raw = path.join(tmp, `${name}.png`);
    execFileSync(FF, [
      "-v", "error", "-y", "-ss", (frame / 30).toFixed(6), "-i", path.join(final2, video), "-frames:v", "1",
      "-sws_flags", "accurate_rnd+full_chroma_int+full_chroma_inp+bitexact",
      "-vf", "scale=in_color_matrix=bt709:in_range=tv:out_range=pc,format=rgb24", raw,
    ]);
    let img = readImage(raw);
    if (img.w !== 1080 || img.h !== 1920) throw new Error(`${name}: ${img.w}×${img.h}`);
    let note = "";
    if (clean) {
      const b = captionBox(img, clean === "ground" ? 10 : 36);
      note = `caption box x ${b.x0}–${b.x1}, y ${b.y0}–${b.y1}: ` + (clean === "ground" ? fillGround(img, b) : fillHarmonic(img, b));
    }
    if (pad) img = padRight(img, pad);
    writePng(path.join(OUT, `${name}.png`), img);
    console.log(`${name}.png ${img.w}×${img.h} ← ${video} frame ${frame}${note ? ` — ${note}` : ""}`);
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
