import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTION, GREYSCALE_TEXT, MOTION_V5, TYPE_V5, TYPE_V6, TYPE_V7 } from "./tokens";

/** A caption typography set (TYPE_V5, TYPE_V6 or TYPE_V7): title / subtitle / body styles, gaps and tones. */
type TypeSet = typeof TYPE_V5 | typeof TYPE_V6 | typeof TYPE_V7;

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** Rise into place: `delay` frames after the cut, MOTION_V5.captionRise px over captionInFrames, ease-out. */
const useRiseIn = (delay: number) => {
  const frame = useCurrentFrame();
  const range = [delay, delay + MOTION_V5.captionInFrames];
  return {
    opacity: interpolate(frame, range, [0, 1], { ...clamp, easing: MOTION_V5.captionInEase }),
    y: interpolate(frame, range, [MOTION_V5.captionRise, 0], { ...clamp, easing: MOTION_V5.captionInEase }),
  };
};

/**
 * v5 caption block — shared by every ad on design "v5" (tokens.ts → CAPTION, TYPE_V5, MOTION_V5).
 *
 * ① PRODUCT: the name block (title Bold + romanised name) is on screen from the first frame and settles 8 px
 *   upward over the cut; the description follows 0.4 s in, rising into place.
 * ② ③ ④: the lines rise into place 0.3 s after the hard cut.
 * Every cut: over the last 8 frames the whole block lifts 24 px and fades, handing over to the next line, which
 * rises into the same place. Images never cross-fade; only the type moves.
 */
export const CaptionV5: React.FC<{
  title?: string;
  subtitle?: string;
  body: string[];
  tone?: "ink" | "paper";
  isFirstCut: boolean;
  /** Typography set: TYPE_V5 (default, LINE Seed Sans) or TYPE_V6 (SUIT content type). Same shape. */
  type?: TypeSet;
  /** Block top (px); default CAPTION.top. v6 raises the ① block (CAPTION_V6.firstCutTop). */
  top?: number;
}> = ({ title, subtitle, body, tone = "ink", isFirstCut, type = TYPE_V5, top = CAPTION.top }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const colours = type.tone[tone];

  // Hand-over to the next cut (skipped in one-frame stills).
  const outStart = durationInFrames - MOTION_V5.captionOutFrames;
  const hasOut = durationInFrames > MOTION_V5.captionOutFrames + 1;
  const out = hasOut ? interpolate(frame, [outStart, durationInFrames - 1], [0, 1], { ...clamp, easing: MOTION_V5.captionOutEase }) : 0;

  const settle = isFirstCut
    ? interpolate(frame, [0, MOTION_V5.nameSettleFrames], [MOTION_V5.nameSettle, 0], { ...clamp, easing: MOTION_V5.captionInEase })
    : 0;
  const bodyIn = useRiseIn(isFirstCut ? MOTION_V5.firstBodyDelay : MOTION_V5.captionInDelay);
  // A one-frame still shows the settled layout.
  const still = durationInFrames < 2;

  return (
    <div
      style={{
        ...GREYSCALE_TEXT,
        position: "absolute",
        left: CAPTION.left,
        right: CAPTION.right,
        top,
        color: colours.color,
        textShadow: colours.halo,
        opacity: 1 - out,
        translate: `0px ${-out * MOTION_V5.captionOutLift}px`,
      }}
    >
      {title || subtitle ? (
        <div style={{ translate: `0px ${still ? 0 : settle}px` }}>
          {/* "\n" in a title is a deliberate line break (pre-line), for names wider than the frame. */}
          {title ? <div style={{ ...type.title, whiteSpace: "pre-line" }}>{title}</div> : null}
          {subtitle ? <div style={{ ...type.subtitle, color: colours.soft, marginTop: type.titleToSubtitleGap }}>{subtitle}</div> : null}
        </div>
      ) : null}
      <div
        style={{
          ...type.body,
          marginTop: title || subtitle ? type.nameToBodyGap : 0,
          opacity: still ? 1 : bodyIn.opacity,
          translate: `0px ${still ? 0 : bodyIn.y}px`,
        }}
      >
        {body.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  );
};
