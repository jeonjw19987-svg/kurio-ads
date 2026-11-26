// Copy-fit check: does every caption line of the four ads fit its width, in the real font?
//
//   node tools/copy-fit.mjs ["extra line|title|body" …]
//
// Reads the product files (src/ads/products/*.ts, Node strips their types), measures every line in Remotion's
// browser (tools/copy-fit/entry.tsx → calculateMetadata) and prints the width against the caption width
// (1080 − CAPTION.left − CAPTION.right). Also prints the largest shared title size at which every ① title fits one
// line (design v7 sizes). Extra lines on the command line are measured too (role after "|", default body).
import { bundle } from "@remotion/bundler";
import { selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const AVAILABLE = 1080 - 88 - 88; // tokens.ts → CAPTION.left / right
const TITLE_SIZE = 66; // tokens.ts → TYPE_V7.title.fontSize (the size the widths below are measured at)

const files = ["a-moon-jar", "b-traditional-gat", "c-gotae-gat", "d-tiger-magpie", "e-gat-clock"];
const lines = [];
for (const f of files) {
  const mod = await import(pathToFileURL(path.join(root, "src/ads/products", `${f}.ts`)).href);
  const ad = Object.values(mod).find((v) => v && typeof v === "object" && v.status === "final");
  ad.scenes.forEach((s, i) => {
    const tag = `${ad.code} ${"①②③④"[i]}`;
    if (s.caption.title) s.caption.title.split("\n").forEach((t) => lines.push({ id: tag, role: "title", text: t }));
    if (s.caption.subtitle) lines.push({ id: tag, role: "subtitle", text: s.caption.subtitle });
    s.caption.body.forEach((t) => lines.push({ id: tag, role: "body", text: t }));
  });
}
for (const arg of process.argv.slice(2)) {
  const [text, role = "body"] = arg.split("|");
  lines.push({ id: "extra", role, text });
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kurio-copyfit-"));
const pub = path.join(tmp, "public");
fs.mkdirSync(path.join(pub, "fonts"), { recursive: true });
fs.cpSync(path.join(root, "public/fonts"), path.join(pub, "fonts"), { recursive: true });
try {
  const serveUrl = await bundle({ entryPoint: path.join(root, "tools/copy-fit/entry.tsx"), outDir: path.join(tmp, "bundle"), publicDir: pub, enableCaching: false });
  const comp = await selectComposition({ serveUrl, id: "CopyFit", inputProps: { lines, results: [] } });
  const results = comp.props.results;
  console.log(`caption width ${AVAILABLE}px\n`);
  for (const r of results) {
    const flag = r.width > AVAILABLE ? `  ✗ wraps (${Math.round(r.width - AVAILABLE)} px over)` : "";
    console.log(`${r.id.padEnd(6)} ${r.role.padEnd(8)} ${String(Math.round(r.width)).padStart(5)}px  ${r.text}${flag}`);
  }
  const titles = results.filter((r) => r.role === "title" && r.id !== "extra");
  const widest = titles.reduce((a, b) => (b.width > a.width ? b : a));
  const fit = Math.floor((TITLE_SIZE * AVAILABLE) / widest.width);
  console.log(`\nwidest title: "${widest.text}" ${Math.round(widest.width)}px at ${TITLE_SIZE}px → one shared size that fits every title: ${Math.min(TITLE_SIZE, fit)}px`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
