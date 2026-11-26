// Before/after sheet for a review: two rows of five scene stills (e.g. v4 vs v5), one PNG.
//
//   node tools/compare-sheet.mjs <output.png> "<title>" <beforeLabel> <beforeStillsDir> <afterLabel> <afterStillsDir>
//
// Each stills dir must contain *_Scene_01_PRODUCT.png … *_Scene_05_END-CARD.png (tools/render-ad.mjs output).
// The stills are copied to a temporary public folder for the render; nothing is written to public/.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [output, title, beforeLabel, beforeDir, afterLabel, afterDir] = process.argv.slice(2);
if (!afterDir) {
  console.error('usage: node tools/compare-sheet.mjs <output.png> "<title>" <beforeLabel> <beforeDir> <afterLabel> <afterDir>');
  process.exit(1);
}
const root = path.resolve(import.meta.dirname, "..");
const scenes = ["Scene_01_PRODUCT", "Scene_02_DETAIL", "Scene_03_MAKING", "Scene_04_IN-PLACE", "Scene_05_END-CARD"];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kurio-compare-"));
const pub = path.join(tmp, "public");
fs.mkdirSync(path.join(pub, "fonts"), { recursive: true });
fs.cpSync(path.join(root, "public/fonts"), path.join(pub, "fonts"), { recursive: true });

const pick = (dir, tag) =>
  scenes.map((s, i) => {
    const f = fs.readdirSync(dir).find((n) => n.endsWith(`_${s}.png`));
    if (!f) throw new Error(`missing *_${s}.png in ${dir}`);
    const name = `${tag}-${i + 1}.png`;
    fs.copyFileSync(path.join(dir, f), path.join(pub, name));
    return name;
  });

try {
  const rows = [
    { label: beforeLabel, files: pick(beforeDir, "before") },
    { label: afterLabel, files: pick(afterDir, "after") },
  ];
  const serveUrl = await bundle({ entryPoint: path.join(root, "tools/compare/entry.tsx"), outDir: path.join(tmp, "bundle"), publicDir: pub, enableCaching: false });
  const inputProps = { title, rows, columns: ["① PRODUCT", "② DETAIL", "③ MAKING", "④ IN PLACE", "⑤ END CARD"] };
  const composition = await selectComposition({ serveUrl, id: "CompareSheet", inputProps });
  await renderStill({ serveUrl, composition, output: path.resolve(output), inputProps, imageFormat: "png", overwrite: true });
  console.log("sheet", output);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
