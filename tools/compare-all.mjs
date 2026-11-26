// A–D review sheet: the five representative stills of every v5 ad in one image (npm run sheet:all).
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const rows = [
  ["A", "out/A-moon-jar-v6/stills"],
  ["B", "out/B-traditional-gat-v2/stills"],
  ["C", "out/C-gotae-gat-v2/stills"],
  ["D", "out/D-tiger-magpie-v3/stills"],
];
execFileSync("node", ["tools/compare-sheet.mjs", "out/KURIO_ADS_A-D_review.png", '"KURIO Meta ads — A, B, C, D (all four on design v6)"', ...rows.flat()], { cwd: root, stdio: "inherit", shell: true });
