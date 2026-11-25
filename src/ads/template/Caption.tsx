import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTION, GREYSCALE_TEXT, MOTION, TYPE } from "./tokens";

/**
 * Caption block — same place, type and motion in every cut of every ad (tokens.ts → CAPTION, TYPE, MOTION).
 *
 * ① PRODUCT: name block (title Bold 84 + subtitle Regular 48, secondary colour) and, after a gap, the
 *   description (Regular 48). On screen from the first frame, completely still.
 * ② ③ ④: description lines only. They appear 0.3 s after the cut, rising 20 px over 0.3 s, easing out.
 * Every cut: in the last 8 frames before the hard cut the block lifts 10 px, so the next caption, rising into
 * the same place, reads as the continuation of one line of thought.
 */
export const Caption: React.FC<{ title?: string; subtitle?: string; body: string[]; fromFirstFrame: boolean }> = ({
  title,
  subtitle,
  body,
  fromFirstFrame,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const inStart = MOTION.captionInDelay;
  const inEnd = inStart + MOTION.captionInFrames;
  const opacity = fromFirstFrame ? 1 : interpolate(frame, [inStart, inEnd], [0, 1], { ...clamp, easing: MOTION.captionInEase });
  const rise = fromFirstFrame ? 0 : interpolate(frame, [inStart, inEnd], [MOTION.captionRise, 0], { ...clamp, easing: MOTION.captionInEase });
  const outStart = durationInFrames - MOTION.captionOutFrames;
  const lift = durationInFrames > MOTION.captionOutFrames + 1
    ? interpolate(frame, [outStart, durationInFrames - 1], [0, -MOTION.captionOutLift], { ...clamp, easing: MOTION.captionOutEase })
    : 0;

  return (
    <div
      style={{
        ...GREYSCALE_TEXT,
        position: "absolute",
        left: CAPTION.left,
        right: CAPTION.right,
        top: CAPTION.top,
        opacity,
        translate: `0px ${rise + lift}px`,
      }}
    >
      {title ? <div style={TYPE.title}>{title}</div> : null}
      {subtitle ? <div style={{ ...TYPE.subtitle, marginTop: TYPE.titleToSubtitleGap }}>{subtitle}</div> : null}
      <div style={{ ...TYPE.body, marginTop: title || subtitle ? TYPE.nameToBodyGap : 0 }}>
        {body.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  );
};
