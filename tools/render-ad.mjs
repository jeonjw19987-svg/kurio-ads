// Renders one KURIO ad from a single bundle (one bundle, no bundle cache → minimal disk use).
//
//   node tools/render-ad.mjs <compositionId> <outDir> <baseName> [options]
//     --stills-only            scene stills + thumbnail only (review before the MP4)
//     --keyframes              also export Higgsfield start images (KF-<code>-0N.png)
//     --thumbnail=<file name>  thumbnail file name (default <baseName>_THUMBNAIL.png)
//     --endcard-version=v4     which shared end-card master to use / create (default v4)
//     --rebuild-endcard        re-render that master (only when the end card itself changed)
//     --endcard=<id>           end-card composition (default KURIO-EndCard; v5: KURIO-EndCard-v5)
//     --quality=master         v5 master settings: lossless PNG frame capture (no JPEG step before H.264),
//                              x264 CRF 14, preset slow (default: v4 settings — JPEG capture, CRF 18, medium)
//     --audio=shared|<path>    track muxed under the 15 s video as AAC: "shared" = src/ads/sound.json (all v5 ads),
//                              or a public path (default src/ads/audio.json, the v4 setting)
//     --silent-master          also write <baseName>_SILENT.mp4: the same video stream with a silent AAC track
//     --review-still=<id>:<frame>:<name>   also render one still of another composition (e.g. an alternative line)
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
  console.error("usage: node tools/render-ad.mjs <compositionId> <outDir> <baseName> [--stills-only] [--keyframes] [--thumbnail=<name>] [--endcard-version=v4] [--rebuild-endcard] [--endcard=<id>] [--quality=master] [--audio=<path>] [--silent-master] [--review-still=<id>:<frame>:<name>]");
  process.exit(1);
}
const flag = (name) => flags.find((f) => f.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
const stillsOnly = flags.includes("--stills-only");
const keyframes = flags.includes("--keyframes");
const rebuildEndcard = flags.includes("--rebuild-endcard");
const endcardVersion = flag("endcard-version") ?? "v4";
const endcardId = flag("endcard") ?? "KURIO-EndCard";
const master = flag("quality") === "master";
const silentMaster = flags.includes("--silent-master");
const reviewStill = flag("review-still");

const root = path.resolve(import.meta.dirname, "..");
const audioJson = JSON.parse(fs.readFileSync(path.join(root, "src/ads/audio.json"), "utf8"));
// --audio=shared: the one shared track for every v5 ad (src/ads/sound.json); --audio=<public path>: that file.
const shared = JSON.parse(fs.readFileSync(path.join(root, "src/ads/sound.json"), "utf8"));
const audio = flag("audio") === "shared" ? { src: shared.track, volume: shared.volume } : flag("audio") ? { src: flag("audio"), volume: 1 } : audioJson;
const bundleDir = fs.mkdtempSync(path.join(os.tmpdir(), "kurio-ad-bundle-"));
// Same encoder settings for body and end card, so the two streams can be joined without re-encoding.
// master: frames are captured as lossless PNG, so H.264 is the only lossy step (no double compression).
const VIDEO_OPTS = master
  ? { codec: "h264", crf: 14, pixelFormat: "yuv420p", colorSpace: "bt709", x264Preset: "slow", imageFormat: "png", muted: true }
  : { codec: "h264", crf: 18, pixelFormat: "yuv420p", colorSpace: "bt709", x264Preset: "medium", muted: true };
const AUDIO_ENC = ["-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2"];

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
  // A two-phase end card (v5: tagline, then wordmark) also gets a still of its first phase.
  if (endcardId !== "KURIO-EndCard") shots.push([392, "Scene_05_END-CARD_tagline"]);
  for (const [frame, name] of shots) {
    const output = path.join(stillsDir, `${baseName}_${name}.png`);
    await renderStill({ serveUrl, composition: full, frame, output, overwrite: true, imageFormat: "png" });
    console.log("still", output);
  }
  if (reviewStill) {
    const [id, frame, name] = reviewStill.split(":");
    const comp = await selectComposition({ serveUrl, id });
    const output = path.join(stillsDir, `${baseNameIn}_REVIEW_${name}.png`);
    await renderStill({ serveUrl, composition: comp, frame: Number(frame), output, overwrite: true, imageFormat: "png" });
    console.log("review still", output);
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
      const ec = await selectComposition({ serveUrl, id: endcardId });
      await renderMedia({ serveUrl, composition: ec, outputLocation: endcard, ...VIDEO_OPTS, overwrite: true });
      await renderStill({ serveUrl, composition: ec, frame: ec.durationInFrames - 1, output: endcard.replace(/\.mp4$/, ".png"), overwrite: true, imageFormat: "png" });
      if (endcardId !== "KURIO-EndCard") {
        await renderStill({ serveUrl, composition: ec, frame: 26, output: endcard.replace(/\.mp4$/, "_tagline.png"), overwrite: true, imageFormat: "png" });
      }
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
    /** Mux a track under the joined video: video stream copied (not re-encoded), audio encoded once to AAC. */
    const mux = (track, output, volume = 1) =>
      npx(["remotion", "ffmpeg", "-v", "error", "-y", "-i", `"${joined}"`, "-i", `"${track}"`, "-map", "0:v", "-map", "1:a", "-c:v", "copy", ...AUDIO_ENC, "-af", `"volume=${volume}"`, "-t", "15", "-movflags", "+faststart", `"${output}"`]);
    if (audio.src) {
      mux(path.join(root, "public", audio.src), final, audio.volume);
      console.log("audio muxed", audio.src);
    }
    const outputs = [final];
    if (silentMaster) {
      // Same video stream, with a silent AAC track (some placements expect an audio stream).
      const silence = path.join(bundleDir, "silence.wav");
      const n = 48000 * 15;
      const h = Buffer.alloc(44);
      h.write("RIFF", 0); h.writeUInt32LE(36 + n * 4, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16);
      h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(48000, 24); h.writeUInt32LE(48000 * 4, 28);
      h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(n * 4, 40);
      fs.writeFileSync(silence, Buffer.concat([h, Buffer.alloc(n * 4)]));
      const silent = path.join(outDir, `${baseName}_SILENT.mp4`);
      mux(silence, silent);
      outputs.push(silent);
      console.log("silent master", silent);
    }
    fs.rmSync(body);
    console.log("final", final);

    // ── Spec check of what was actually written ──────────────────────────────────────────────────────
    const report = {};
    for (const file of [...outputs, endcard]) {
      const j = JSON.parse(
        npx(["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration,bit_rate,size:stream=codec_type,codec_name,profile,width,height,r_frame_rate,nb_frames,pix_fmt,color_space,bit_rate,sample_rate,channels", "-of", "json", `"${file}"`]),
      );
      const v = j.streams.find((s) => s.codec_type === "video");
      const a = j.streams.find((s) => s.codec_type === "audio");
      report[path.basename(file)] = {
        video: `${v.codec_name} ${v.profile}, ${v.width}×${v.height}, ${v.r_frame_rate} fps, ${v.nb_frames} frames, ${v.pix_fmt}, ${v.color_space}, ${(v.bit_rate / 1e6).toFixed(2)} Mbps`,
        audio: a ? `${a.codec_name} ${a.profile ?? ""}, ${a.sample_rate} Hz, ${a.channels} ch, ${(a.bit_rate / 1e3).toFixed(0)} kbps` : "none",
        duration: `${Number(j.format.duration).toFixed(3)} s`,
        size: `${(j.format.size / 1e6).toFixed(2)} MB`,
        overall: `${(j.format.bit_rate / 1e6).toFixed(2)} Mbps`,
        settings: master ? "PNG capture → x264 CRF 14, preset slow (one lossy encode); end card joined by stream copy" : "JPEG capture → x264 CRF 18, preset medium",
      };
    }
    fs.writeFileSync(path.join(outDir, `${baseName}_render-report.json`), JSON.stringify(report, null, 2));
    console.log("\nspec check:", JSON.stringify(report, null, 2));
  }
} finally {
  fs.rmSync(bundleDir, { recursive: true, force: true });
}
