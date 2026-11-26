// A–D review sheet: the five representative stills of every v5 ad in one image (npm run sheet:all).
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const rows = [
  ["A", "out/FINAL/INTERNAL_REVIEW/A-moon-jar/stills"],
  ["B", "out/FINAL/INTERNAL_REVIEW/B-traditional-gat/stills"],
  ["C", "out/FINAL/INTERNAL_REVIEW/C-gotae-gat-v2/stills"],
  ["D", "out/FINAL/INTERNAL_REVIEW/D-tiger-magpie/stills"],
];
execFileSync("node", ["tools/compare-sheet.mjs", "out/FINAL/KURIO_ADS_A-D_FINAL_review.png", '"KURIO Meta ads — A, B, C, D FINAL (final copy review, 2026-11-26)"', ...rows.flat()], { cwd: root, stdio: "inherit", shell: true });
