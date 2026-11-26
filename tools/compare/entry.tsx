import React from "react";
import { AbsoluteFill, Composition, Img, registerRoot, staticFile } from "remotion";
import "../../src/ads/template/tokens"; // loads LINE Seed Sans

/** Before/after review sheet: two rows (before, after) of five stills. Used by tools/compare-sheet.mjs only. */
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

const Root: React.FC = () => (
  <Composition
    id="CompareSheet"
    component={Sheet}
    width={LEFT + 5 * (W + GAP)}
    height={110 + 2 * (H + 48)}
    fps={30}
    durationInFrames={1}
    defaultProps={{ title: "", rows: [], columns: [] } as Props}
  />
);

registerRoot(Root);
