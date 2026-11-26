// A–D review sheet: the five representative stills of every v5 ad in one image (npm run sheet:all).
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const rows = [
  ["A", "out/FINAL2/_render/A-moon-jar/stills"],
  ["B", "out/FINAL2/_render/B-mother-of-pearl-plate/stills"],
  ["C", "out/FINAL2/_render/C-gotae/stills"],
  ["D", "out/FINAL2/_render/D-traditional-gat/stills"],
];
execFileSync("node", ["tools/compare-sheet.mjs", "out/FINAL2/KURIO_ADS_A-D_261126_v2_review.png", '"KURIO Meta ads — A, B, C, D v2 (revision request, 2026-11-26)"', ...rows.flat().map((v) => `"${v}"`)], { cwd: root, stdio: "inherit", shell: true });
