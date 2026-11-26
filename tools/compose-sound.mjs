// KURIO ad sound v5 — composed and synthesised entirely in code (no samples, no third-party audio).
// Original work made for KURIO; free of third-party rights. Same file for every ad on design "v5".
//
//   node tools/compose-sound.mjs            → public/audio/kurio-sound-v5.wav (15 s, 48 kHz, 24-bit stereo)
//
// Structure (80 BPM, one 4/4 bar = one 3 s cut, so harmony changes exactly on the hard cuts):
//   0–3 s  ① PRODUCT   Fmaj9        soft piano line over a warm pad
//   3–6 s  ② DETAIL    Dm9          + a faint air accent on the cut
//   6–9 s  ③ MAKING    B♭maj9       + air accent
//   9–12 s ④ IN PLACE  Gm9          + air accent, the line rises
//  12–13.5 ⑤ tagline   Csus (add9)  suspended, quiet — + air accent at 12 s
//  13.5–15 ⑤ wordmark  Fmaj9        resolution + the signature: a rolled piano chord and a soft bell, fading by 15 s
// Mix: piano and pad through one room reverb ("공간감"); integrated loudness normalised to −20 LUFS
// (deliberately low — the product leads), true peak kept under −3 dBTP.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SR = 48000;
const DURATION = 15;
const N = SR * DURATION;
const TARGET_LUFS = -20;
const root = path.resolve(import.meta.dirname, "..");
const outFile = path.join(root, "public/audio/kurio-sound-v5.wav");

// ── helpers ───────────────────────────────────────────────────────────────────────────────────────────
const L = new Float32Array(N);
const R = new Float32Array(N);
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
let seed = 0x6b75726f; // "kuro" — deterministic: the same file every time
const rand = () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const add = (bufL, bufR, i, v, pan) => {
  // equal-power pan, pan ∈ [−1, 1]
  const a = ((pan + 1) * Math.PI) / 4;
  bufL[i] += v * Math.cos(a);
  bufR[i] += v * Math.sin(a);
};

// ── soft piano (additive, slightly inharmonic, two detuned strings, felt-like attack) ────────────────
const piano = (bufL, bufR, t0, midi, vel) => {
  const f0 = mtof(midi);
  const start = Math.round(t0 * SR);
  const T0 = Math.min(7, Math.max(1.6, 3.6 * (261.6 / f0) ** 0.4)); // longer ring for lower notes
  const B = 0.00022;
  const partials = [];
  for (let n = 1; n <= 10; n++) {
    const f = n * f0 * Math.sqrt(1 + B * n * n);
    if (f > 9000) break;
    const amp = (1 / n ** 1.25) * Math.exp(-(n - 1) * (0.62 - 0.45 * vel)); // softer touch → darker tone
    const tau = T0 / (1 + 0.45 * (n - 1));
    partials.push({ f, amp, tau, ph: rand() * Math.PI * 2 });
  }
  const pan = Math.max(-0.45, Math.min(0.45, (midi - 62) / 40));
  const len = Math.min(N - start, Math.round(T0 * 3 * SR));
  const detune = 2 ** (0.8 / 1200);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const attack = t < 0.006 ? t / 0.006 : 1;
    let v = 0;
    for (const p of partials) {
      const e = Math.exp(-t / p.tau);
      if (e < 1e-4) continue;
      const w = 2 * Math.PI * p.f * t;
      v += p.amp * e * 0.5 * (Math.sin(w + p.ph) + Math.sin(w * detune + p.ph * 1.3));
    }
    add(bufL, bufR, start + k, v * attack * vel * 0.22, pan);
  }
};

// ── warm pad (detuned sines, slow swell, crossfaded on the cut) ──────────────────────────────────────
const pad = (bufL, bufR, t0, t1, notes, level) => {
  const a = 0.9; // swell in
  const r = 1.3; // release past the next cut, under the new chord
  const start = Math.round(t0 * SR);
  const end = Math.min(N, Math.round((t1 + r) * SR));
  const voices = notes.map((m, j) => ({ f: mtof(m), ph: rand() * 6.28, pan: (j / Math.max(1, notes.length - 1)) * 0.9 - 0.45 }));
  for (let i = start; i < end; i++) {
    const t = i / SR - t0;
    const tt = i / SR;
    let env = t < a ? 0.5 - 0.5 * Math.cos((Math.PI * t) / a) : 1;
    if (tt > t1) env *= Math.max(0, 1 - (tt - t1) / r) ** 2;
    if (env <= 0) continue;
    for (const v of voices) {
      const w = 2 * Math.PI * v.f * tt;
      const s = Math.sin(w * 2 ** (4 / 1200) + v.ph) + Math.sin(w * 2 ** (-4 / 1200) + v.ph * 0.7) + 0.12 * Math.sin(2 * w + v.ph);
      add(bufL, bufR, i, s * env * level, v.pan);
    }
  }
};

// ── air accent on a hard cut: a short, filtered breath of noise that swells into the cut ─────────────
const air = (bufL, bufR, tc, level) => {
  const pre = 0.22;
  const post = 0.45;
  const start = Math.round((tc - pre) * SR);
  const len = Math.round((pre + post) * SR);
  let hpL = 0, hpR = 0, lpL = 0, lpR = 0, xL = 0, xR = 0;
  const aHP = Math.exp((-2 * Math.PI * 900) / SR);
  const aLP = Math.exp((-2 * Math.PI * 4200) / SR);
  for (let k = 0; k < len; k++) {
    const t = k / SR - pre;
    const env = t < 0 ? (1 + t / pre) ** 2.2 : Math.exp(-t / 0.13);
    const nL = rand() * 2 - 1;
    const nR = rand() * 2 - 1;
    // one-pole high-pass then low-pass → a soft band of air
    hpL = aHP * (hpL + nL - xL); xL = nL;
    hpR = aHP * (hpR + nR - xR); xR = nR;
    lpL = (1 - aLP) * hpL + aLP * lpL;
    lpR = (1 - aLP) * hpR + aLP * lpR;
    const i = start + k;
    if (i >= 0 && i < N) {
      bufL[i] += lpL * env * level;
      bufR[i] += lpR * env * level;
    }
  }
};

// ── soft bell for the signature (inharmonic partials, long gentle decay) ─────────────────────────────
const bell = (bufL, bufR, t0, midi, level) => {
  const f0 = mtof(midi);
  const ratios = [1, 2.0, 2.76, 4.07, 5.43];
  const amps = [1, 0.32, 0.22, 0.09, 0.05];
  const taus = [2.4, 1.6, 1.1, 0.7, 0.45];
  const start = Math.round(t0 * SR);
  for (let k = 0; start + k < N; k++) {
    const t = k / SR;
    const att = t < 0.004 ? t / 0.004 : 1;
    let v = 0;
    for (let j = 0; j < ratios.length; j++) v += amps[j] * Math.exp(-t / taus[j]) * Math.sin(2 * Math.PI * f0 * ratios[j] * t);
    add(bufL, bufR, start + k, v * att * level, 0.15);
  }
};

// ── score ─────────────────────────────────────────────────────────────────────────────────────────────
const dryL = new Float32Array(N);
const dryR = new Float32Array(N);

const bars = [
  { t: 0, bass: 41, pad: [57, 60, 64, 67], line: [[0.05, 69, 0.46], [0.8, 72, 0.4], [1.55, 79, 0.36], [2.3, 76, 0.3]] }, // Fmaj9
  { t: 3, bass: 38, pad: [53, 57, 60, 64], line: [[0.05, 69, 0.42], [0.8, 76, 0.38], [1.55, 74, 0.34], [2.3, 72, 0.3]] }, // Dm9
  { t: 6, bass: 34, pad: [53, 57, 60, 62], line: [[0.05, 74, 0.42], [0.8, 77, 0.38], [1.55, 72, 0.34], [2.3, 69, 0.3]] }, // B♭maj9
  { t: 9, bass: 43, pad: [58, 62, 65, 69], line: [[0.05, 70, 0.4], [0.8, 74, 0.37], [1.55, 77, 0.34], [2.3, 81, 0.3]] }, // Gm9
];
for (const b of bars) {
  piano(dryL, dryR, b.t, b.bass, 0.5);
  pad(dryL, dryR, b.t, b.t + 3, b.pad, 0.016);
  for (const [dt, m, v] of b.line) piano(dryL, dryR, b.t + dt, m, v);
}
// ⑤ tagline: suspended, sparse
piano(dryL, dryR, 12, 48, 0.42);
pad(dryL, dryR, 12, 13.5, [53, 55, 58, 62], 0.014);
piano(dryL, dryR, 12.05, 77, 0.3);
piano(dryL, dryR, 12.8, 79, 0.26);
// ⑤ wordmark (13.5 s): resolution + signature
const SIG = 13.5;
piano(dryL, dryR, SIG, 41, 0.5);
pad(dryL, dryR, SIG, 15, [57, 60, 64, 67], 0.015);
[[0, 69], [0.035, 72], [0.07, 76], [0.11, 81]].forEach(([dt, m]) => piano(dryL, dryR, SIG + dt, m, 0.38));
bell(dryL, dryR, SIG + 0.11, 89, 0.05); // F6, soft
bell(dryL, dryR, SIG + 0.11, 96, 0.018); // C7, very soft shimmer

// air accents on the cuts (3, 6, 9 s and into the end card at 12 s) — barely there
for (const tc of [3, 6, 9, 12]) air(dryL, dryR, tc, 0.05);

// ── room reverb (Freeverb: 8 parallel combs + 4 series all-passes per channel) ───────────────────────
const freeverb = (inL, inR, { room = 0.82, damp = 0.32, wet = 0.3, dry = 0.78 } = {}) => {
  const scale = SR / 44100;
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const aps = [556, 441, 341, 225];
  const spread = 23;
  const mk = (len) => ({ buf: new Float32Array(Math.round(len * scale)), i: 0, store: 0 });
  const chans = [0, spread].map((sp) => ({ combs: combs.map((c) => mk(c + sp)), aps: aps.map((a) => mk(a + sp)) }));
  const outL = new Float32Array(N);
  const outR = new Float32Array(N);
  for (let n = 0; n < N; n++) {
    const input = (inL[n] + inR[n]) * 0.015;
    const res = [0, 0];
    chans.forEach((ch, c) => {
      let acc = 0;
      for (const cb of ch.combs) {
        const y = cb.buf[cb.i];
        cb.store = y * (1 - damp) + cb.store * damp;
        cb.buf[cb.i] = input + cb.store * room;
        cb.i = (cb.i + 1) % cb.buf.length;
        acc += y;
      }
      for (const ap of ch.aps) {
        const b = ap.buf[ap.i];
        ap.buf[ap.i] = acc + b * 0.5;
        ap.i = (ap.i + 1) % ap.buf.length;
        acc = b - acc;
      }
      res[c] = acc;
    });
    outL[n] = inL[n] * dry + res[0] * wet * 3;
    outR[n] = inR[n] * dry + res[1] * wet * 3;
  }
  return [outL, outR];
};

const [wetL, wetR] = freeverb(dryL, dryR);
for (let i = 0; i < N; i++) {
  L[i] = wetL[i];
  R[i] = wetR[i];
}
// Gentle fade-in (no click) and fade-out into silence by 15.0 s.
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let g = 1;
  if (t < 0.02) g = t / 0.02;
  if (t > 14.2) g = Math.max(0, (15 - t) / 0.8) ** 1.6;
  L[i] *= g;
  R[i] *= g;
}

// ── write WAV (24-bit PCM) ────────────────────────────────────────────────────────────────────────────
const writeWav = (file, gain) => {
  const bytes = 3;
  const data = Buffer.alloc(N * 2 * bytes);
  let o = 0;
  for (let i = 0; i < N; i++) {
    for (const ch of [L, R]) {
      const v = Math.max(-1, Math.min(1, ch[i] * gain));
      data.writeIntLE(Math.round(v * 8388607), o, 3);
      o += 3;
    }
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2 * bytes, 28);
  h.writeUInt16LE(2 * bytes, 32);
  h.writeUInt16LE(bytes * 8, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.concat([h, data]));
};

/** Integrated loudness and true peak, measured by Remotion's bundled ffmpeg (loudnorm analysis pass, on stderr). */
const measureJson = (file) => {
  const text = execFileSync("npx", ["remotion", "ffmpeg", "-hide_banner", "-nostats", "-i", `"${file}"`, "-af", "loudnorm=print_format=json", "-f", "null", "-", "2>&1"], {
    cwd: root,
    shell: true,
    encoding: "utf8",
  });
  const j = JSON.parse(text.slice(text.lastIndexOf("{"), text.lastIndexOf("}") + 1));
  return { i: Number(j.input_i), tp: Number(j.input_tp) };
};

const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "kurio-sound-")), "pass1.wav");
writeWav(tmp, 1);
const m1 = measureJson(tmp);
let gainDb = TARGET_LUFS - m1.i;
if (m1.tp + gainDb > -3) gainDb = -3 - m1.tp; // keep true peak under −3 dBTP
writeWav(outFile, 10 ** (gainDb / 20));
const m2 = measureJson(outFile);
fs.rmSync(path.dirname(tmp), { recursive: true, force: true });
console.log(`wrote ${path.relative(root, outFile)} — ${DURATION} s, ${SR} Hz, 24-bit stereo`);
console.log(`loudness ${m2.i.toFixed(1)} LUFS (target ${TARGET_LUFS}), true peak ${m2.tp.toFixed(1)} dBTP`);
