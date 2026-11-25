import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CAPTION, CAPTION_TYPE, GREYSCALE_TEXT } from "./tokens";

/**
 * Burned-in English caption. Same place, size, weight and timing in every cut of every ad:
 * bottom-aligned at y = 1240 (lowest place the Reels UI does not cover), Regular 64 px, #111111.
 * ① PRODUCT: on screen from the first frame. ② ③ ④: appear 0.3 s (9 frames) after the cut starts.
 */
export const Caption: React.FC<{ text: string; productName?: string; fromFirstFrame: boolean }> = ({ text, productName, fromFirstFrame }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        ...GREYSCALE_TEXT,
        ...CAPTION_TYPE,
        position: "absolute",
        left: CAPTION.left,
        right: CAPTION.right,
        bottom: 1920 - CAPTION.bottom,
        opacity: fromFirstFrame
          ? 1
          : interpolate(frame, [CAPTION.delayFrames, CAPTION.delayFrames + CAPTION.fadeFrames], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
      }}
    >
      <div>{text}</div>
      {productName ? <div>{productName}</div> : null}
    </div>
  );
};
