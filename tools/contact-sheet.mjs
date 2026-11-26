// Contact sheet of a folder of source images (for choosing ad images): one PNG grid with file names and sizes.
//
//   node tools/contact-sheet.mjs <output.png> "<title>" <dir> [cols=4]
//
// Long detail-page strips (height > 1.6 × width) are shown as square slices "name #1, #2, …" so they stay legible.
// Images narrower than 300 px (icons, badges) are skipped. Nothing is written to public/.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [output, title, dir, colsArg] = process.argv.slice(2);
if (!dir) {
  console.error('usage: node tools/contact-sheet.mjs <output.png> "<title>" <dir> [cols]');
  process.exit(1);
}
const root = path.resolve(import.meta.dirname, "..");
const dim = (p) => {
  const b = fs.readFileSync(p);
  if (b[0] === 0x89) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    const l = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + l;
  }
  return [0, 0];
};
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kurio-contact-"));
const pub = path.join(tmp, "public");
fs.mkdirSync(path.join(pub, "fonts"), { recursive: true });
fs.cpSync(path.join(root, "public/fonts"), path.join(pub, "fonts"), { recursive: true });

try {
  const items = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
    const src = path.join(dir, f);
    const [w, h] = dim(src);
    if (w < 300) continue;
    if (h > w * 1.6) {
      const n = Math.ceil(h / w);
      for (let k = 0; k < n; k++) {
        const y = Math.min(k * w, h - w);
        const name = `${items.length}.jpg`;
        execFileSync("npx", ["remotion", "ffmpeg", "-v", "error", "-y", "-i", `"${src}"`, "-vf", `"crop=${w}:${w}:0:${y},scale=600:600"`, "-q:v", "3", `"${path.join(pub, name)}"`], { cwd: root, shell: true });
        items.push({ file: name, label: `${f} #${k + 1}/${n} (${w}×${h}, y ${y})` });
      }
    } else {
      const name = `${items.length}${path.extname(f)}`;
      fs.copyFileSync(src, path.join(pub, name));
      items.push({ file: name, label: `${f} (${w}×${h})` });
    }
  }
  const serveUrl = await bundle({ entryPoint: path.join(root, "tools/compare/entry.tsx"), outDir: path.join(tmp, "bundle"), publicDir: pub, enableCaching: false });
  const inputProps = { title, items, cols: Number(colsArg ?? 4) };
  const composition = await selectComposition({ serveUrl, id: "ContactSheet", inputProps });
  await renderStill({ serveUrl, composition, output: path.resolve(output), inputProps, imageFormat: "jpeg", jpegQuality: 85, overwrite: true });
  console.log("contact sheet", output, `(${items.length} items)`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
