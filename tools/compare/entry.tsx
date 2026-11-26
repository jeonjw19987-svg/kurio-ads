import React from "react";
import { AbsoluteFill, Composition, Img, registerRoot, staticFile } from "remotion";
import { PLACEMENTS } from "../../src/ads/template/tokens"; // also loads LINE Seed Sans

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

/**
 * Placement check: each still as Reels (9:16 + UI), Stories (9:16 + UI) and Feed (4:5 centre crop), at 1/4 scale.
 * UI zones (tokens.ts → PLACEMENTS) are tinted; the shared text area is the dashed green box. Used by
 * tools/safezone-sheet.mjs only. The UI is a simulation — the final check is the Ads Manager preview.
 */
type SafeZoneProps = { title: string; subtitle: string; files: string[]; columns: string[]; textTop: number };
const K = 0.25;
const PW = 1080 * K;
const PH = 1920 * K;
const FH = (PLACEMENTS.feedCrop.bottom - PLACEMENTS.feedCrop.top) * K;
const SG = 22;
const SLEFT = 150;
const ROW_TOP = 128;
const UI = "rgba(255, 30, 90, 0.20)";
const LINE = "1.5px dashed rgba(220, 0, 70, 0.9)";

const Zone: React.FC<{ x: number; y: number; w: number; h: number; edge?: "top" | "bottom" | "left" }> = ({ x, y, w, h, edge }) => (
  <div
    style={{
      position: "absolute",
      left: x * K,
      top: y * K,
      width: w * K,
      height: h * K,
      backgroundColor: UI,
      borderTop: edge === "top" ? LINE : undefined,
      borderBottom: edge === "bottom" ? LINE : undefined,
      borderLeft: edge === "left" ? LINE : undefined,
    }}
  />
);
const Pill: React.FC<{ x: number; y: number; w: number; h: number; round?: boolean; text?: string }> = ({ x, y, w, h, round, text }) => (
  <div
    style={{
      position: "absolute",
      left: x * K,
      top: y * K,
      width: w * K,
      height: h * K,
      borderRadius: round ? "50%" : 3,
      backgroundColor: "rgba(255,255,255,0.88)",
      boxShadow: "0 0 2px rgba(0,0,0,0.5)",
      color: "#111",
      fontSize: 9,
      lineHeight: `${h * K}px`,
      textAlign: "center",
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);
/** Shared text area: left/right 80 px, from the caption start to the Reels UI. */
const TextBox: React.FC<{ top: number; offset?: number }> = ({ top, offset = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: 80 * K,
      top: (top - offset) * K,
      width: (1080 - 160) * K,
      height: (PLACEMENTS.reels.bottom - top) * K,
      border: "1px dashed rgba(0, 150, 60, 0.95)",
    }}
  />
);

const ReelsUI: React.FC = () => {
  const r = PLACEMENTS.reels;
  return (
    <>
      <Zone x={0} y={0} w={1080} h={r.top} edge="bottom" />
      <Zone x={0} y={r.bottom} w={1080} h={1920 - r.bottom} edge="top" />
      <Zone x={r.actionsLeft} y={r.actionsTop} w={1080 - r.actionsLeft} h={r.bottom - r.actionsTop} edge="left" />
      <Pill x={44} y={120} w={170} h={56} text="Reels" />
      {[0, 1, 2, 3].map((i) => (
        <Pill key={i} x={966} y={1180 + i * 150} w={78} h={78} round />
      ))}
      <Pill x={44} y={1560} w={70} h={70} round />
      <Pill x={130} y={1568} w={420} h={54} text="kurio · Sponsored" />
      <Pill x={44} y={1660} w={760} h={44} text="caption …" />
      <Pill x={44} y={1736} w={880} h={84} text="Shop now ›" />
    </>
  );
};
const StoriesUI: React.FC = () => {
  const s = PLACEMENTS.stories;
  return (
    <>
      <Zone x={0} y={0} w={1080} h={s.top} edge="bottom" />
      <Zone x={0} y={s.bottom} w={1080} h={1920 - s.bottom} edge="top" />
      <Pill x={30} y={40} w={1020} h={10} />
      <Pill x={44} y={90} w={84} h={84} round />
      <Pill x={150} y={106} w={360} h={52} text="kurio · Sponsored" />
      <Pill x={340} y={1700} w={400} h={96} text="Shop now ›" />
    </>
  );
};

const SafeZoneSheet: React.FC<SafeZoneProps> = ({ title, subtitle, files, columns, textTop }) => {
  const rows = [
    { label: "Reels\n9:16", top: ROW_TOP, h: PH },
    { label: "Stories\n9:16", top: ROW_TOP + PH + 40, h: PH },
    { label: "Feed\n4:5 crop", top: ROW_TOP + 2 * (PH + 40), h: FH },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily: "LINE Seed Sans", color: "#111" }}>
      <div style={{ position: "absolute", left: 24, top: 22, fontSize: 26, fontWeight: 700 }}>{title}</div>
      <div style={{ position: "absolute", left: 24, top: 60, fontSize: 15, color: "#555" }}>{subtitle}</div>
      {columns.map((c, i) => (
        <div key={c} style={{ position: "absolute", left: SLEFT + i * (PW + SG), top: ROW_TOP - 26, fontSize: 15 }}>{c}</div>
      ))}
      {rows.map((row, r) => (
        <React.Fragment key={row.label}>
          <div style={{ position: "absolute", left: 24, top: row.top + row.h / 2 - 22, fontSize: 18, fontWeight: 700, whiteSpace: "pre-line" }}>{row.label}</div>
          {files.map((f, i) => (
            <div
              key={f}
              style={{ position: "absolute", left: SLEFT + i * (PW + SG), top: row.top, width: PW, height: row.h, overflow: "hidden", outline: "1px solid #bbb" }}
            >
              <Img
                src={staticFile(f)}
                style={{ position: "absolute", left: 0, top: r === 2 ? -PLACEMENTS.feedCrop.top * K : 0, width: PW, height: PH }}
              />
              {r === 0 ? <ReelsUI /> : r === 1 ? <StoriesUI /> : null}
              <TextBox top={textTop} offset={r === 2 ? PLACEMENTS.feedCrop.top : 0} />
            </div>
          ))}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

const Root: React.FC = () => (
  <>
  <Composition
    id="SafeZoneSheet"
    component={SafeZoneSheet}
    width={1600}
    height={1500}
    fps={30}
    durationInFrames={1}
    defaultProps={{ title: "", subtitle: "", files: [], columns: [], textTop: 380 } as SafeZoneProps}
    calculateMetadata={({ props }) => ({ width: SLEFT + props.files.length * (PW + SG), height: Math.ceil(ROW_TOP + 2 * (PH + 40) + FH + 30) })}
  />
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
