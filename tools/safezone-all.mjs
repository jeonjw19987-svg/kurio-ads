// SAFEZONE delivery (2026-11-26): placement sheets, 4:5 Feed crops and the five MP4s (A–E) side by side in out/SAFEZONE/.
//
//   node tools/safezone-all.mjs            (npm run safezone:sheets — after npm run a:render … d:render)
//
// For each ad with stills in out/SAFEZONE/_render/<dir>/stills:
//   out/SAFEZONE/preview/<X>_after.png                 Reels · Stories · Feed 4:5 sheet (tools/safezone-sheet.mjs)
//   out/SAFEZONE/preview/feed-4x5/<X>/…_FEED_4x5.png   each scene's 4:5 Feed crop at full size (1080 × 1350)
//   out/SAFEZONE/<baseName>.mp4                        the delivered MP4, copied from its _render folder
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const OUT = path.join(root, "out/SAFEZONE");
const ADS = [
  ["A_MOON_JAR", "A-moon-jar", "KURIO_AD_A_MOON_JAR_SAFEZONE", "A · Korean Moon Jar"],
  ["B_TRADITIONAL_GAT", "B-traditional-gat", "KURIO_AD_B_TRADITIONAL_GAT_SAFEZONE", "B · Traditional Korean Gat"],
  ["C_GOTAE", "C-gotae", "KURIO_AD_C_GOTAE_GAT_SAFEZONE", "C · GOTAE Tableware"],
  ["D_TIGER_MAGPIE", "D-tiger-magpie", "KURIO_AD_D_TIGER_MAGPIE_SAFEZONE", "D · Tiger & Magpie — Najeonchilgi"],
  ["E_GAT_WALL_CLOCK", "E-gat-clock", "KURIO_AD_E_GAT_WALL_CLOCK_SAFEZONE", "E · GAT Wall Clock"],
];
const SUB = "Pink: UI / crop-out zones (simulated, after Meta's safe-zone guidance). Green dashed: shared text area (x 80–1000, y 380–1248).";

for (const [key, dir, base, title] of ADS) {
  const render = path.join(OUT, "_render", dir);
  const stills = path.join(render, "stills");
  if (!fs.existsSync(stills)) {
    console.log(`${key}: no stills yet (${path.relative(root, stills)})`);
    continue;
  }
  execFileSync(
    "node",
    [
      path.join(root, "tools/safezone-sheet.mjs"),
      path.join(OUT, "preview", `${key}_after.png`),
      `${title} — SAFEZONE (design v8)`,
      SUB,
      stills,
      `--feed-crops=${path.join(OUT, "preview", "feed-4x5", key)}`,
    ],
    { cwd: root, stdio: "inherit" },
  );
  const mp4 = path.join(render, `${base}.mp4`);
  if (fs.existsSync(mp4)) {
    fs.copyFileSync(mp4, path.join(OUT, `${base}.mp4`));
    console.log("delivered", path.relative(root, path.join(OUT, `${base}.mp4`)));
  }
}
