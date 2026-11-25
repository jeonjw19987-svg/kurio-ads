// Renders one KURIO ad from a single bundle (one bundle, no bundle cache → minimal disk use).
//
//   node tools/render-ad.mjs <compositionId> <outDir> <baseName> [options]
//     --stills-only            scene stills + thumbnail only (review before the MP4)
//     --keyframes              also export Higgsfield start images (KF-<code>-0N.png)
//     --thumbnail=<file name>  thumbnail file name (default <baseName>_THUMBNAIL.png)
//     --endcard-version=v4     which shared end-card master to use / create (default v4)
//     --rebuild-endcard        re-render that master (only when the end card itself changed)
//
// Outputs in <outDir>:
//   stills/<baseName>_Scene_01_PRODUCT.png … _Scene_05_END-CARD.png   1080×1920 representative frames
//   <thumbnail>                                                       ① PRODUCT, frame 45
//   <baseName>.mp4                                                    12 s body + end-card master, joined without re-encoding
// A cut is "final" when it has a generated clip (public/clips/<slug>/) or a "photo" image. If any cut is still a
// draft visual (cut-out stage, bleed, or "photo needed"), every output name gets "_DRAFT".
// The end-card master lives at out/shared/KURIO_ENDCARD_<version>.mp4 and is rendered only if missing, so every
// ad carries the byte-identical end-card stream (storyboard §6). AudioTrack: src/ads/audio.json (null = silent).
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [compositionId, outDir, baseNameIn, ...flags] = process.argv.slice(2);
if (!compositionId || !outDir || !baseNameIn) {
  console.error("usage: node tools/render-ad.mjs <compositionId> <outDir> <baseName> [--stills-only] [--keyframes] [--thumbnail=<name>] [--endcard-version=v4] [--rebuild-endcard]");
  process.exit(1);
}
const flag = (name) => flags.find((f) => f.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
const stillsOnly = flags.includes("--stills-only");
const keyframes = flags.includes("--keyframes");
const rebuildEndcard = flags.includes("--rebuild-endcard");
const endcardVersion = flag("endcard-version") ?? "v4";

const root = path.resolve(import.meta.dirname, "..");
const audio = JSON.parse(fs.readFileSync(path.join(root, "src/ads/audio.json"), "utf8"));
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

  // ── Cut report ───────────────────────────────────────────────────────────────────────────────────────
  console.log(`\ncuts for ${ad.compositionId}:`);
  const drafts = [];
  ad.scenes.forEach((scene, i) => {
    const clip = clips[i];
    if (!clip) {
      // "photo" = approved image in a template layout; "set" = the shared staged IN PLACE composite.
      const final = scene.visual.kind === "photo" || scene.visual.kind === "set";
      if (!final) drafts.push(`${i + 1} ${scene.role}${scene.visual.need ? ` (needs: ${scene.visual.need})` : ""}`);
      const src = scene.visual.image?.src ?? "—";
      console.log(`  ${i + 1} ${scene.role.padEnd(9)} — ${scene.visual.kind}${scene.visual.layout ? `/${scene.visual.layout}` : ""}${scene.visual.matte ? " (matte)" : ""}  ${src}${final ? "" : "  (draft visual)"}`);
      return;
    }
    const p = probe(path.join(root, "public", clip));
    const need = 3 + (scene.clipTrimSec ?? 0);
    const warn = [];
    if (p.duration < need) warn.push(`too short: ${p.duration.toFixed(2)} s < ${need} s`);
    if (Math.abs(p.width / p.height - 9 / 16) > 0.01) warn.push(`not 9:16 (${p.width}×${p.height}) — will be cropped to cover`);
    if (p.width < 1080) warn.push(`below 1080 wide (${p.width}) — will be upscaled`);
    console.log(`  ${i + 1} ${scene.role.padEnd(9)} — clip ${clip}  ${p.width}×${p.height} ${p.fps.toFixed(2)}fps ${p.duration.toFixed(2)}s${warn.length ? "  ⚠ " + warn.join("; ") : "  ok"}`);
  });
  const draft = drafts.length > 0;
  const review = ad.status === "review";
  const suffix = `${review ? "_INTERNAL_REVIEW" : ""}${draft ? "_DRAFT" : ""}`;
  const baseName = `${baseNameIn}${suffix}`;
  if (draft) console.log(`\n⚠ DRAFT — draft visuals in: ${drafts.join(", ")}.`);
  if (review) console.log(`\n⚠ INTERNAL REVIEW — ${ad.code} is not approved as an ad (status "review"). Not for publishing.`);
  if (suffix) console.log(`  Output names end in ${suffix}.\n`);

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

  // ── Representative stills + thumbnail ────────────────────────────────────────────────────────────────
  const stillsDir = path.join(outDir, "stills");
  fs.mkdirSync(stillsDir, { recursive: true });
  const shots = [
    [45, "Scene_01_PRODUCT"],
    [135, "Scene_02_DETAIL"],
    [225, "Scene_03_MAKING"],
    [315, "Scene_04_IN-PLACE"],
    [449, "Scene_05_END-CARD"],
  ];
  for (const [frame, name] of shots) {
    const output = path.join(stillsDir, `${baseName}_${name}.png`);
    await renderStill({ serveUrl, composition: full, frame, output, overwrite: true });
    console.log("still", output);
  }
  const thumbName = flag("thumbnail") ?? `${baseNameIn}_THUMBNAIL.png`;
  const thumb = path.join(outDir, suffix ? thumbName.replace(/\.png$/, `${suffix}.png`) : thumbName);
  await renderStill({ serveUrl, composition: full, frame: 45, output: thumb, overwrite: true });
  console.log("thumbnail", thumb);

  // ── Video: body + end-card master (+ shared AudioTrack) ──────────────────────────────────────────────
  if (!stillsOnly) {
    const sharedDir = path.join(root, "out/shared");
    fs.mkdirSync(sharedDir, { recursive: true });
    const endcard = path.join(sharedDir, `KURIO_ENDCARD_${endcardVersion}.mp4`);
    if (rebuildEndcard || !fs.existsSync(endcard)) {
      const ec = await selectComposition({ serveUrl, id: "KURIO-EndCard" });
      await renderMedia({ serveUrl, composition: ec, outputLocation: endcard, ...VIDEO_OPTS, overwrite: true });
      await renderStill({ serveUrl, composition: ec, frame: ec.durationInFrames - 1, output: endcard.replace(/\.mp4$/, ".png"), overwrite: true });
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
    const joined = audio.src ? path.join(bundleDir, "joined.mp4") : final;
    npx(["remotion", "ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", `"${list}"`, "-c", "copy", "-movflags", "+faststart", `"${joined}"`]);
    if (audio.src) {
      // One shared licensed track under the whole 15 s; the video stream is copied, not re-encoded.
      const track = path.join(root, "public", audio.src);
      npx(["remotion", "ffmpeg", "-v", "error", "-y", "-i", `"${joined}"`, "-i", `"${track}"`, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-af", `"volume=${audio.volume}"`, "-t", "15", "-movflags", "+faststart", `"${final}"`]);
      console.log("audio muxed", audio.src);
    }
    fs.rmSync(body);
    console.log("final", final);
  }
} finally {
  fs.rmSync(bundleDir, { recursive: true, force: true });
}
