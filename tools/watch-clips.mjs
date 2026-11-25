// Watches one ad's clip folder and re-renders the ad whenever a clip is added or replaced.
//
//   node tools/watch-clips.mjs <compositionId> <slug> <outDir> <baseName>
//   e.g. node tools/watch-clips.mjs KURIO-AD-A-MOON-JAR a-moon-jar out/A-moon-jar-v3 KURIO_AD_A_MOON_JAR_v3
//
// Save the Higgsfield downloads as public/clips/<slug>/01-product.mp4, 02-detail.mp4, 03-making.mp4,
// 04-in-place.mp4. The watcher waits until a file stops growing (download finished), then runs
// tools/render-ad.mjs once. Changes during a render queue one more render afterwards. Ctrl+C to stop.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [compositionId, slug, outDir, baseName] = process.argv.slice(2);
if (!compositionId || !slug || !outDir || !baseName) {
  console.error("usage: node tools/watch-clips.mjs <compositionId> <slug> <outDir> <baseName>");
  process.exit(1);
}
const root = path.resolve(import.meta.dirname, "..");
const dir = path.join(root, "public/clips", slug);
fs.mkdirSync(dir, { recursive: true });

let timer = null;
let running = false;
let again = false;

const sizes = () => fs.readdirSync(dir).filter((f) => f.endsWith(".mp4")).map((f) => `${f}:${fs.statSync(path.join(dir, f)).size}`).join("|");

const render = () => {
  if (running) {
    again = true;
    return;
  }
  running = true;
  console.log(`\n[${new Date().toLocaleTimeString()}] rendering ${compositionId}…`);
  const child = spawn("node", [path.join(root, "tools/render-ad.mjs"), compositionId, outDir, baseName], { cwd: root, stdio: "inherit" });
  child.on("exit", (code) => {
    console.log(`[${new Date().toLocaleTimeString()}] render finished (exit ${code}). Watching ${dir}`);
    running = false;
    if (again) {
      again = false;
      schedule();
    }
  });
};

// Wait until the folder's file sizes are unchanged for 3 s (a download in progress keeps growing).
const schedule = () => {
  clearTimeout(timer);
  const before = sizes();
  timer = setTimeout(() => (sizes() === before ? render() : schedule()), 3000);
};

fs.watch(dir, (_, file) => {
  if (file && file.endsWith(".mp4")) schedule();
});
console.log(`Watching ${dir} — drop or replace 01-product.mp4 / 02-detail.mp4 / 03-making.mp4 / 04-in-place.mp4`);
