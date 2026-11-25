// Renders one KURIO ad from a single bundle (one bundle → less disk cache than repeated `npx remotion` calls).
//
//   node tools/render-ad.mjs <compositionId> <outDir> <baseName> [--stills-only] [--endcard-version=v2] [--rebuild-endcard]
//
// Outputs in <outDir>:
//   stills/<baseName>_S01..S05_*.png  (1080×1920, mid-cut frames; S05 = last end-card frame)
//   <baseName>_THUMBNAIL.png          (① PRODUCT, frame 60)
//   <baseName>.mp4                    (12 s body + the shared end-card master, joined without re-encoding)
// The end-card master lives at out/shared/KURIO_ENDCARD_<version>.mp4. It is rendered only if missing
// (or with --rebuild-endcard), so every ad gets the byte-identical end-card stream (storyboard §6).
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [compositionId, outDir, baseName, ...flags] = process.argv.slice(2);
if (!compositionId || !outDir || !baseName) {
  console.error("usage: node tools/render-ad.mjs <compositionId> <outDir> <baseName> [--stills-only] [--endcard-version=v2] [--rebuild-endcard]");
  process.exit(1);
}
const stillsOnly = flags.includes("--stills-only");
const rebuildEndcard = flags.includes("--rebuild-endcard");
const endcardVersion = (flags.find((f) => f.startsWith("--endcard-version=")) ?? "--endcard-version=v2").split("=")[1];

const root = path.resolve(import.meta.dirname, "..");
const bundleDir = fs.mkdtempSync(path.join(os.tmpdir(), "kurio-ad-bundle-"));
// Same encoder settings for body and end card, so the two streams can be joined without re-encoding.
const VIDEO_OPTS = { codec: "h264", crf: 18, pixelFormat: "yuv420p", colorSpace: "bt709", x264Preset: "medium", muted: true };

try {
  console.log("bundling…");
  const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), outDir: bundleDir, enableCaching: false });

  const full = await selectComposition({ serveUrl, id: compositionId });
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
    execFileSync("npx", ["remotion", "ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", final], {
      cwd: root,
      stdio: "inherit",
      shell: true,
    });
    fs.rmSync(body);
    console.log("final", final);
  }
} finally {
  fs.rmSync(bundleDir, { recursive: true, force: true });
}
