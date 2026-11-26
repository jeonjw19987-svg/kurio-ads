import React from "react";
import { AbsoluteFill, Composition, Img, registerRoot, staticFile } from "remotion";
import "../../src/ads/template/tokens"; // loads LINE Seed Sans

/** Review sheet: one row of five stills per ad or version (before/after, or A–D). Used by tools/compare-sheet.mjs only. */
type Props = { title: string; rows: { label: string; files: string[] }[]; columns: string[] };

const W = 216; // one still at 1/5 scale
const H = 384;
const GAP = 24;
const LEFT = 90;

const Sheet: React.FC<Props> = ({ title, rows, columns }) => (
  <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily: "LINE Seed Sans", color: "#111" }}>
    <div style={{ position: "absolute", left: LEFT, top: 28, fontSize: 26, fontWeight: 700 }}>{title}</div>
    {columns.map((c, i) => (
      <div key={c} style={{ position: "absolute", left: LEFT + i * (W + GAP), top: 74, fontSize: 17 }}>{c}</div>
    ))}
    {rows.map((row, r) => (
      <React.Fragment key={row.label}>
        <div style={{ position: "absolute", left: 24, top: 110 + r * (H + 48) + H / 2 - 12, fontSize: 22, fontWeight: 700 }}>{row.label}</div>
        {row.files.map((f, i) => (
          <Img
            key={f}
            src={staticFile(f)}
            style={{ position: "absolute", left: LEFT + i * (W + GAP), top: 110 + r * (H + 48), width: W, height: H, outline: "1px solid #ddd" }}
          />
        ))}
      </React.Fragment>
    ))}
  </AbsoluteFill>
);

/** Contact sheet: every image of a folder in a grid, contained, with its file name and size. */
type ContactProps = { title: string; items: { file: string; label: string }[]; cols: number };
const CELL = 300;
const Contact: React.FC<ContactProps> = ({ title, items, cols }) => (
  <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily: "LINE Seed Sans", color: "#111" }}>
    <div style={{ position: "absolute", left: 20, top: 14, fontSize: 22, fontWeight: 700 }}>{title}</div>
    {items.map((it, i) => (
      <div key={it.file} style={{ position: "absolute", left: 20 + (i % cols) * (CELL + 16), top: 56 + Math.floor(i / cols) * (CELL + 40), width: CELL }}>
        <Img src={staticFile(it.file)} style={{ width: CELL, height: CELL, objectFit: "contain", backgroundColor: "#eee" }} />
        <div style={{ fontSize: 13, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden" }}>{it.label}</div>
      </div>
    ))}
  </AbsoluteFill>
);

const Root: React.FC = () => (
  <>
  <Composition
    id="ContactSheet"
    component={Contact}
    width={1300}
    height={1400}
    fps={30}
    durationInFrames={1}
    defaultProps={{ title: "", items: [], cols: 4 } as ContactProps}
    calculateMetadata={({ props }) => ({ width: 20 + props.cols * (CELL + 16), height: 70 + Math.ceil(props.items.length / props.cols) * (CELL + 40) })}
  />
  <Composition
    id="CompareSheet"
    component={Sheet}
    width={LEFT + 5 * (W + GAP)}
    height={110 + 2 * (H + 48)}
    fps={30}
    durationInFrames={1}
    defaultProps={{ title: "", rows: [], columns: [] } as Props}
    calculateMetadata={({ props }) => ({ height: 110 + Math.max(1, props.rows.length) * (H + 48) })}
  />
  </>
);

registerRoot(Root);
