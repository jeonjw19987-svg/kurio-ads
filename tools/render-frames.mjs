// Review stills of chosen frames of one composition, from one bundle (e.g. the cuts whose images are present).
//
//   node tools/render-frames.mjs <compositionId> <outDir> <prefix> <frame>[:<name>] …
//
// Writes <outDir>/<prefix>_<name or frame>.png (1080 × 1920 PNG). Nothing else is rendered.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [compositionId, outDir, prefix, ...frames] = process.argv.slice(2);
if (!frames.length) {
  console.error("usage: node tools/render-frames.mjs <compositionId> <outDir> <prefix> <frame>[:<name>] …");
  process.exit(1);
}
const root = path.resolve(import.meta.dirname, "..");
const bundleDir = fs.mkdtempSync(path.join(os.tmpdir(), "kurio-frames-"));
try {
  const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), outDir: bundleDir, enableCaching: false });
  const composition = await selectComposition({ serveUrl, id: compositionId });
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of frames) {
    const [frame, name] = f.split(":");
    const output = path.join(outDir, `${prefix}_${name ?? frame}.png`);
    await renderStill({ serveUrl, composition, frame: Number(frame), output, overwrite: true, imageFormat: "png" });
    console.log("still", output);
  }
} finally {
  fs.rmSync(bundleDir, { recursive: true, force: true });
}
