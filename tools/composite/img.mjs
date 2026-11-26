// Minimal RGB image I/O and sampling for the D composites (ffmpeg from @remotion/compositor; no extra deps).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = path.resolve(import.meta.dirname, "../..");
const FF = fs
  .readdirSync(path.join(root, "node_modules/@remotion"))
  .filter((d) => d.startsWith("compositor-"))
  .map((d) => path.join(root, "node_modules/@remotion", d, process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"))
  .find((p) => fs.existsSync(p));

export function readImage(file) {
  // "ffmpeg -i <file>" with no output exits non-zero after printing the stream info.
  let w, h;
  try {
    execFileSync(FF, ["-hide_banner", "-i", file], { stdio: ["ignore", "ignore", "pipe"] });
  } catch (e) {
    const m = String(e.stderr).match(/, (\d{2,5})x(\d{2,5})[,\s]/);
    w = +m[1];
    h = +m[2];
  }
  const data = execFileSync(FF, ["-hide_banner", "-loglevel", "error", "-i", file, "-f", "image2pipe", "-c:v", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1 << 30 });
  if (data.length !== w * h * 3) throw new Error(`size mismatch for ${file}`);
  return { w, h, data: new Float32Array(data) };
}

// 8-bit RGB PNG (img.ch 3, default) or RGBA PNG (img.ch 4), written directly (the bundled ffmpeg has no rawvideo
// demuxer).
const CRC = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc32 = (buf) => {
  let c = -1;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
export function writePng(file, img) {
  const ch = img.ch ?? 3;
  const row = img.w * ch + 1;
  const raw = Buffer.alloc(row * img.h);
  for (let y = 0; y < img.h; y++)
    for (let i = 0; i < img.w * ch; i++) raw[y * row + 1 + i] = Math.max(0, Math.min(255, Math.round(img.data[y * img.w * ch + i])));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(img.w, 0);
  ihdr.writeUInt32BE(img.h, 4);
  ihdr[8] = 8;
  ihdr[9] = ch === 4 ? 6 : 2;
  fs.writeFileSync(
    file,
    Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]),
  );
}

export const lum = (img, x, y) => {
  const i = (y * img.w + x) * 3;
  return 0.2126 * img.data[i] + 0.7152 * img.data[i + 1] + 0.0722 * img.data[i + 2];
};
export const px = (img, x, y) => {
  const i = (y * img.w + x) * 3;
  return [img.data[i], img.data[i + 1], img.data[i + 2]];
};

// Catmull-Rom bicubic sample (x, y in pixel centres); edge-clamped.
const cr = (t) => {
  const a = Math.abs(t);
  return a < 1 ? 1.5 * a ** 3 - 2.5 * a ** 2 + 1 : a < 2 ? -0.5 * a ** 3 + 2.5 * a ** 2 - 4 * a + 2 : 0;
};
export function sample(img, x, y, out) {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  out[0] = out[1] = out[2] = 0;
  let ws = 0;
  for (let j = -1; j <= 2; j++) {
    const yy = Math.min(img.h - 1, Math.max(0, y0 + j));
    const wy = cr(y - (y0 + j));
    for (let i = -1; i <= 2; i++) {
      const xx = Math.min(img.w - 1, Math.max(0, x0 + i));
      const w = wy * cr(x - (x0 + i));
      const k = (yy * img.w + xx) * 3;
      out[0] += w * img.data[k];
      out[1] += w * img.data[k + 1];
      out[2] += w * img.data[k + 2];
      ws += w;
    }
  }
  out[0] /= ws; out[1] /= ws; out[2] /= ws;
  return out;
}

// Least-squares conic through points (coordinates shifted to their mean), as centre, semi-axes, angle.
export function fitEllipse(pts) {
  const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const my = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  // A x² + B xy + C y² + D x + E y = 1
  const N = Array.from({ length: 5 }, () => new Float64Array(6));
  for (const [px0, py0] of pts) {
    const x = px0 - mx, y = py0 - my;
    const r = [x * x, x * y, y * y, x, y];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) N[i][j] += r[i] * r[j];
      N[i][5] += r[i];
    }
  }
  for (let i = 0; i < 5; i++) {
    let p = i;
    for (let k = i + 1; k < 5; k++) if (Math.abs(N[k][i]) > Math.abs(N[p][i])) p = k;
    [N[i], N[p]] = [N[p], N[i]];
    for (let k = 0; k < 5; k++) if (k !== i) { const f = N[k][i] / N[i][i]; for (let j = i; j < 6; j++) N[k][j] -= f * N[i][j]; }
  }
  const [A, B, C, D, E] = N.map((r, i) => r[5] / r[i]);
  const F = -1;
  const den = B * B - 4 * A * C;
  const cx = (2 * C * D - B * E) / den, cy = (2 * A * E - B * D) / den;
  const F0 = A * cx * cx + B * cx * cy + C * cy * cy + D * cx + E * cy + F;
  const theta = 0.5 * Math.atan2(B, A - C);
  const ct = Math.cos(theta), st = Math.sin(theta);
  const Ap = A * ct * ct + B * ct * st + C * st * st;
  const Cp = A * st * st - B * ct * st + C * ct * ct;
  return { cx: cx + mx, cy: cy + my, a: Math.sqrt(-F0 / Ap), b: Math.sqrt(-F0 / Cp), theta };
}
