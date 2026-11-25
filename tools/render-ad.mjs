// Renders one KURIO ad from a single bundle (one bundle → less disk cache than repeated `npx remotion` calls).
//
//   node tools/render-ad.mjs <compositionId> <outDir> <baseName> [--stills-only] [--keyframes]
//                            [--endcard-version=v2] [--rebuild-endcard]
//
// Outputs in <outDir>:
//   stills/<baseName>_S01..S05_*.png  1080×1920, mid-cut frames (S05 = last end-card frame)
//   <baseName>_THUMBNAIL.png          ① PRODUCT, frame 60
//   <baseName>.mp4                    12 s body + the shared end-card master, joined without re-encoding
//   keyframes/KF-<code>-0N.png        (--keyframes) Higgsfield start images, no caption
// If any cut has no generated clip yet (public/clips/<slug>/0N-*.mp4), it shows its fallback visual and every
// output name gets "_DRAFT", so a draft can never be mistaken for the final ad.
// The end-card master lives at out/shared/KURIO_ENDCARD_<version>.mp4 and is rendered only if missing
// (or with --rebuild-endcard), so every ad carries the byte-identical end-card stream (storyboard §6).
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [compositionId, outDir, baseNameIn, ...flags] = process.argv.slice(2);
if (!compositionId || !outDir || !baseNameIn) {
  console.error("usage: node tools/render-ad.mjs <compositionId> <outDir> <baseName> [--stills-only] [--keyframes] [--endcard-version=v2] [--rebuild-endcard]");
  process.exit(1);
}
const stillsOnly = flags.includes("--stills-only");
const keyframes = flags.includes("--keyframes");
const rebuildEndcard = flags.includes("--rebuild-endcard");
const endcardVersion = (flags.find((f) => f.startsWith("--endcard-version=")) ?? "--endcard-version=v2").split("=")[1];

const root = path.resolve(import.meta.dirname, "..");
const bundleDir = fs.mkdtempSync(path.join(os.tmpdir(), "kurio-ad-bundle-"));
// Same encoder settings for body and end card, so the two streams can be joined without re-encoding.
const VIDEO_OPTS = { codec: "h264", crf: 18, pixelFormat: "yuv420p", colorSpace: "bt709", x264Preset: "medium", muted: true };

const npx = (args) => execFileSync("npx", args, { cwd: root, encoding: "utf8", shell: true, stdio: ["ignore", "pipe", "pipe"] });

/** Width, height, duration, fps of a clip, via Remotion's bundled ffprobe. */
const probe = (file) => {
  const out = npx(["remotion", "ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate:format=duration", "-of", "json", `"${file}"`]);
  const j = JSON.parse(out);
  const s = j.streams?.[0] ?? {};
  const [n, d] = String(s.r_frame_rate ?? "0/1").split("/").map(Number);
  return { width: s.width, height: s.height, duration: Number(j.format?.duration ?? 0), fps: d ? n / d : 0 };
};

try {
  console.log("bundling…");
  const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), outDir: bundleDir, enableCaching: false });

  const full = await selectComposition({ serveUrl, id: compositionId });
  const { ad, clips = [] } = full.props;

  // ── Clip report ──────────────────────────────────────────────────────────────────────────────────────
  console.log(`\nclips for ${ad.compositionId} (public/clips/${ad.slug}/):`);
  const missing = [];
  ad.scenes.forEach((scene, i) => {
    const clip = clips[i];
    if (!clip) {
      missing.push(`${i + 1} ${scene.role}`);
      console.log(`  ${i + 1} ${scene.role.padEnd(9)} — no clip → fallback (${scene.visual.kind})`);
      return;
    }
    const p = probe(path.join(root, "public", clip));
    const need = 3 + (scene.clipTrimSec ?? 0);
    const warn = [];
    if (p.duration < need) warn.push(`too short: ${p.duration.toFixed(2)} s < ${need} s`);
    if (Math.abs(p.width / p.height - 9 / 16) > 0.01) warn.push(`not 9:16 (${p.width}×${p.height}) — will be cropped to cover`);
    if (p.width < 1080) warn.push(`below 1080 wide (${p.width}) — will be upscaled`);
    console.log(`  ${i + 1} ${scene.role.padEnd(9)} — ${clip}  ${p.width}×${p.height} ${p.fps.toFixed(2)}fps ${p.duration.toFixed(2)}s${warn.length ? "  ⚠ " + warn.join("; ") : "  ok"}`);
  });
  const draft = missing.length > 0;
  const baseName = draft ? `${baseNameIn}_DRAFT` : baseNameIn;
  if (draft) console.log(`\n⚠ DRAFT — fallback used for: ${missing.join(", ")}. Output names end in _DRAFT.\n`);

  // ── Keyframes (Higgsfield start images) ──────────────────────────────────────────────────────────────
  if (keyframes) {
    const kfDir = path.join(outDir, "keyframes");
    fs.mkdirSync(kfDir, { recursive: true });
    const all = await getCompositions(serveUrl);
    for (const comp of all.filter((c) => c.id.startsWith(`KF-${ad.code}-`))) {
      const output = path.join(kfDir, `${comp.id}.png`);
      await renderStill({ serveUrl, composition: comp, frame: 0, output, overwrite: true });
      console.log("keyframe", output);
    }
  }

  // ── Stills + thumbnail ───────────────────────────────────────────────────────────────────────────────
  const stillsDir = path.join(outDir, "stills");
  fs.mkdirSync(stillsDir, { recursive: true });
  const shots = [
    [60, "S01_product"],
    [150, "S02_detail"],
    [240, "S03_making"],
    [330, "S04_in-place"],
    [449, "S05_endcard"],
  ];
  for (const [frame, name] of shots) {
    const output = path.join(stillsDir, `${baseName}_${name}.png`);
    await renderStill({ serveUrl, composition: full, frame, output, overwrite: true });
    console.log("still", output);
  }
  const thumb = path.join(outDir, `${baseName}_THUMBNAIL.png`);
  await renderStill({ serveUrl, composition: full, frame: 60, output: thumb, overwrite: true });
  console.log("thumbnail", thumb);

  // ── Video: body + end-card master ────────────────────────────────────────────────────────────────────
  if (!stillsOnly) {
    const sharedDir = path.join(root, "out/shared");
    fs.mkdirSync(sharedDir, { recursive: true });
    const endcard = path.join(sharedDir, `KURIO_ENDCARD_${endcardVersion}.mp4`);
    if (rebuildEndcard || !fs.existsSync(endcard)) {
      const ec = await selectComposition({ serveUrl, id: "KURIO-EndCard" });
      await renderMedia({ serveUrl, composition: ec, outputLocation: endcard, ...VIDEO_OPTS, overwrite: true });
      console.log("end card master rendered", endcard);
    } else {
      console.log("end card master reused (not re-rendered)", endcard);
    }

    const body = path.join(outDir, `${baseName}_body.mp4`);
    const bodyComp = await selectComposition({ serveUrl, id: `${compositionId}-BODY` });
    await renderMedia({ serveUrl, composition: bodyComp, outputLocation: body, ...VIDEO_OPTS, overwrite: true });
    console.log("body", body);

    const list = path.join(bundleDir, "concat.txt");
    fs.writeFileSync(list, [body, endcard].map((f) => `file '${path.resolve(f).replace(/\\/g, "/")}'`).join("\n"));
    const final = path.join(outDir, `${baseName}.mp4`);
    npx(["remotion", "ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", `"${list}"`, "-c", "copy", "-movflags", "+faststart", `"${final}"`]);
    fs.rmSync(body);
    console.log("final", final);
  }
} finally {
  fs.rmSync(bundleDir, { recursive: true, force: true });
}
