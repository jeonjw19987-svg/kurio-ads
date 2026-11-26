// Measures caption lines in the real content font (SUIT, as loaded by tokens.ts) inside Remotion's own browser.
// The measuring happens in calculateMetadata, so tools/copy-fit.mjs gets the widths back from selectComposition()
// without rendering a frame.
import React from "react";
import { Composition, registerRoot } from "remotion";
import { TYPE_V7 } from "../../src/ads/template/tokens";

type Role = "title" | "subtitle" | "body";
type Line = { id: string; role: Role; text: string; fontSize?: number };
type Result = Line & { width: number };

const measure = async (lines: Line[]): Promise<Result[]> => {
  const st = TYPE_V7;
  for (const role of ["title", "subtitle", "body"] as const) {
    await document.fonts.load(`${st[role].fontWeight} ${st[role].fontSize}px "${st[role].fontFamily}"`);
  }
  await document.fonts.ready;
  return lines.map((l) => {
    const s = st[l.role];
    const el = document.createElement("span");
    Object.assign(el.style, {
      fontFamily: `"${s.fontFamily}"`,
      fontWeight: String(s.fontWeight),
      fontSize: `${l.fontSize ?? s.fontSize}px`,
      letterSpacing: s.letterSpacing,
      whiteSpace: "pre",
      position: "absolute",
      left: "0px",
      top: "0px",
      visibility: "hidden",
    });
    el.textContent = l.text;
    document.body.appendChild(el);
    const width = el.getBoundingClientRect().width;
    el.remove();
    return { ...l, width };
  });
};

const Empty: React.FC<{ lines: Line[]; results: Result[] }> = () => null;

registerRoot(() => (
  <Composition
    id="CopyFit"
    component={Empty}
    width={2}
    height={2}
    fps={30}
    durationInFrames={1}
    defaultProps={{ lines: [] as Line[], results: [] as Result[] }}
    calculateMetadata={async ({ props }) => ({ props: { ...props, results: await measure(props.lines) } })}
  />
));
