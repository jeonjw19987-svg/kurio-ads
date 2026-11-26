// Placement check for one ad: every scene as Reels (9:16 + UI), Stories (9:16 + UI) and Feed (4:5 centre crop).
//
//   node tools/safezone-sheet.mjs <output.png> "<title>" "<subtitle>" <stillsDir> [--feed-crops=<dir>] [--text-top=380]
//
// <stillsDir> holds tools/render-ad.mjs stills: *_Scene_01_PRODUCT.png … *_Scene_04_IN-PLACE.png,
// *_Scene_05_END-CARD_tagline.png and *_Scene_05_END-CARD.png (both end-card phases are checked).
// --allow-missing leaves out scenes without a still (e.g. a cut whose image is not on this computer yet).
// --feed-crops=<dir> also writes each scene's 4:5 Feed crop at full size (1080 × 1350) to <dir>.
// UI zones come from src/ads/template/tokens.ts → PLACEMENTS; the UI drawn is a simulation, not Meta's own.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith("--"));
const [output, title, subtitle, dir] = args.filter((a) => !a.startsWith("--"));
if (!dir) {
  console.error('usage: node tools/safezone-sheet.mjs <output.png> "<title>" "<subtitle>" <stillsDir> [--feed-crops=<dir>] [--text-top=380]');
  process.exit(1);
}
const flag = (name) => flags.find((f) => f.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
const textTop = Number(flag("text-top") ?? 380);
const cropsDir = flag("feed-crops");
const allowMissing = flags.includes("--allow-missing");

const root = path.resolve(import.meta.dirname, "..");
const FEED = { top: 285, height: 1350 }; // tokens.ts → PLACEMENTS.feedCrop
const scenes = [
  ["Scene_01_PRODUCT", "① PRODUCT"],
  ["Scene_02_DETAIL", "② DETAIL"],
  ["Scene_03_MAKING", "③ MAKING"],
  ["Scene_04_IN-PLACE", "④ IN PLACE"],
  ["Scene_05_END-CARD_tagline", "⑤ END CARD (12.0–13.5 s)"],
  ["Scene_05_END-CARD", "⑤ END CARD (13.5–15 s)"],
];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kurio-safezone-"));
const pub = path.join(tmp, "public");
fs.mkdirSync(path.join(pub, "fonts"), { recursive: true });
fs.cpSync(path.join(root, "public/fonts"), path.join(pub, "fonts"), { recursive: true });

try {
  const all = fs.readdirSync(dir);
  const present = scenes.filter(([s]) => all.some((n) => n.endsWith(`_${s}.png`)));
  if (present.length < scenes.length && !allowMissing) throw new Error(`missing stills in ${dir}`);
  const files = present.map(([s], i) => {
    const f = all.find((n) => n.endsWith(`_${s}.png`));
    const name = `${i + 1}.png`;
    fs.copyFileSync(path.join(dir, f), path.join(pub, name));
    if (cropsDir) {
      fs.mkdirSync(cropsDir, { recursive: true });
      const out = path.join(cropsDir, f.replace(/\.png$/, "_FEED_4x5.png"));
      execFileSync("npx", ["remotion", "ffmpeg", "-v", "error", "-y", "-i", `"${path.join(dir, f)}"`, "-vf", `"crop=1080:${FEED.height}:0:${FEED.top}"`, `"${out}"`], { cwd: root, shell: true });
    }
    return name;
  });
  const serveUrl = await bundle({ entryPoint: path.join(root, "tools/compare/entry.tsx"), outDir: path.join(tmp, "bundle"), publicDir: pub, enableCaching: false });
  const inputProps = { title, subtitle, files, columns: present.map(([, c]) => c), textTop };
  const composition = await selectComposition({ serveUrl, id: "SafeZoneSheet", inputProps });
  await renderStill({ serveUrl, composition, output: path.resolve(output), inputProps, imageFormat: "png", overwrite: true });
  console.log("placement sheet", output, cropsDir ? `(+ 4:5 crops in ${cropsDir})` : "");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
