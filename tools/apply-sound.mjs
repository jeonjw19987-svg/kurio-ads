// Swap the shared sound into every ad that has already been rendered — no frame is re-rendered or re-encoded.
//
//   node tools/apply-sound.mjs            (npm run sound:apply)
//
// For each ad on design v5, takes the video stream of its silent master (<name>_SILENT.mp4, written by
// tools/render-ad.mjs --silent-master) and muxes the current src/ads/sound.json track under it as AAC, writing
// <name>.mp4 again. Change sound.json (or regenerate the track), run this once, and A, B, C and D all carry the new
// music, identically: same file, same 0–15 s, same level.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sound = JSON.parse(fs.readFileSync(path.join(root, "src/ads/sound.json"), "utf8"));
const track = path.join(root, "public", sound.track);
/** The v5 ads and their delivery files (same names as package.json → <x>:render). */
const ADS = [
  "out/A-moon-jar-v6/KURIO_AD_A_MOON_JAR_v6",
  "out/B-traditional-gat-v1/KURIO_AD_B_TRADITIONAL_GAT_v1",
  "out/C-gotae-gat-v1/KURIO_AD_C_GOTAE_GAT_v1",
  "out/D-tiger-magpie-v2/KURIO_AD_D_TIGER_MAGPIE_v2",
];
const npx = (args) => execFileSync("npx", args, { cwd: root, encoding: "utf8", shell: true, stdio: ["ignore", "pipe", "pipe"] });

for (const base of ADS) {
  const silent = path.join(root, `${base}_SILENT.mp4`);
  const final = path.join(root, `${base}.mp4`);
  if (!fs.existsSync(silent)) {
    console.log("skip (no silent master yet):", base);
    continue;
  }
  npx(["remotion", "ffmpeg", "-v", "error", "-y", "-i", `"${silent}"`, "-i", `"${track}"`, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", "-af", `"volume=${sound.volume}"`, "-t", "15", "-movflags", "+faststart", `"${final}"`]);
  console.log("sound applied:", path.relative(root, final), "←", sound.track);
}
