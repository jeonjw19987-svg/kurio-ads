import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { ImageShot, MotionKind } from "./types";

/**
 * One photo, cropped to `shot.crop` and filling a frame of `width` × `height`,
 * with a slow camera move. The move is the same for every ad: only its kind
 * comes from the product data.
 */

/** Slow, even camera speed. No overshoot, no bounce. */
const CAMERA_EASE = Easing.bezier(0.3, 0, 0.7, 1);

const io = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: CAMERA_EASE,
};

const Motion: React.FC<{ kind: MotionKind; children: React.ReactNode }> = ({ kind, children }) => {
  const frame = useCurrentFrame();
  // The move runs the whole cut, so each hard cut lands on motion, not on a pause.
  const { durationInFrames } = useVideoConfig();
  const end = durationInFrames - 1;

  const base: React.CSSProperties = { position: "absolute", inset: 0, transformOrigin: "50% 50%" };

  switch (kind) {
    case "push-in":
      return (
        <div style={{ ...base, scale: interpolate(frame, [0, end], [1, 1.05], { ...io, output: "perceptual-scale" }) }}>
          {children}
        </div>
      );
    case "pull-back":
      return (
        <div style={{ ...base, scale: interpolate(frame, [0, end], [1.07, 1], { ...io, output: "perceptual-scale" }) }}>
          {children}
        </div>
      );
    case "drift-left":
      return (
        <div style={{ ...base, scale: 1.06, translate: interpolate(frame, [0, end], ["16px 0px", "-16px 0px"], io) }}>
          {children}
        </div>
      );
    case "drift-right":
      return (
        <div style={{ ...base, scale: 1.06, translate: interpolate(frame, [0, end], ["-16px 0px", "16px 0px"], io) }}>
          {children}
        </div>
      );
    case "rise":
      return (
        <div style={{ ...base, scale: 1.06, translate: interpolate(frame, [0, end], ["0px 14px", "0px -14px"], io) }}>
          {children}
        </div>
      );
  }
};

export const ShotImage: React.FC<{
  shot: ImageShot;
  width: number;
  height: number;
  style?: React.CSSProperties;
}> = ({ shot, width, height, style }) => {
  const { crop } = shot;
  // Cover the frame with the crop rectangle (uses the larger scale if aspects differ slightly).
  const s = Math.max(width / crop.w, height / crop.h);
  const offsetX = (width - crop.w * s) / 2;
  const offsetY = (height - crop.h * s) / 2;

  return (
    <div style={{ position: "absolute", width, height, overflow: "hidden", ...style }}>
      <Motion kind={shot.motion}>
        <Img
          src={staticFile(shot.src)}
          style={{
            position: "absolute",
            left: -crop.x * s + offsetX,
            top: -crop.y * s + offsetY,
            width: shot.width * s,
            height: shot.height * s,
            maxWidth: "none",
          }}
        />
      </Motion>
    </div>
  );
};
