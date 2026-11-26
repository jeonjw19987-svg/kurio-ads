import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { GREYSCALE_TEXT, LAYOUT, TYPE } from "./tokens";

/**
 * English caption, always at the same place (top of the Reels safe area, left margin).
 * `intro="none"` shows it fully from frame 0 (first scene: copy is readable on the first frame).
 * `intro="fade"` brings it in over 9 frames with a 14px rise — quiet, no slide or typewriter effect.
 */
export const Caption: React.FC<{
  headline: string;
  label?: string;
  intro: "none" | "fade";
}> = ({ headline, label, intro }) => {
  const frame = useCurrentFrame();
  const fade = intro === "fade";

  return (
    <div
      style={{
        ...GREYSCALE_TEXT,
        position: "absolute",
        left: LAYOUT.marginX,
        right: LAYOUT.marginX,
        top: LAYOUT.captionTop,
        opacity: fade
          ? interpolate(frame, [2, 11], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })
          : 1,
        translate: fade
          ? interpolate(frame, [2, 14], ["0px 14px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })
          : "0px 0px",
      }}
    >
      <div style={{ ...TYPE.headline, margin: 0 }}>{headline}</div>
      {label ? <div style={{ ...TYPE.label, marginTop: 28 }}>{label}</div> : null}
    </div>
  );
};
