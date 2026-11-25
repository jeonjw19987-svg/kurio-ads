import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_FAMILY, GREYSCALE_TEXT, SAFE } from "./tokens";

/**
 * ⑤ END CARD — shared by every ad (A, B, C, D). No props on purpose.
 * It is rendered ONCE to out/shared/KURIO_ENDCARD_<version>.mp4 and that file is joined, without
 * re-encoding, to each ad's 12-second body (storyboard §6: "1회 제작 후 네 편에 동일 파일 삽입, 재렌더 금지").
 *
 * Copy (planner's latest note, 2026-11-26): Curious about Korea / KURIO / Learn More.
 * Wordmark: the KURIO site's own wordmark (kurio-public-web SiteHeader.tsx) is set text — LINE Seed Sans
 * Regular, tracking 0.32em; there is no logo file. It is reproduced the same way, larger than line 1.
 * Timing: the three lines appear 0.3 s (9 frames) apart and stay fully visible to the last frame.
 */

const STEP = 9;
const FADE = 5;

const Line: React.FC<{ index: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ index, children, style }) => {
  const frame = useCurrentFrame();
  const start = index * STEP;
  return (
    <div
      style={{
        ...GREYSCALE_TEXT,
        opacity: interpolate(frame, [start, start + FADE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const EndCard: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.endCard }}>
    <div
      style={{
        position: "absolute",
        left: SAFE.side,
        right: SAFE.side,
        top: SAFE.top,
        bottom: 1920 - SAFE.bottom,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: COLORS.paper,
        fontFamily: FONT_FAMILY,
        fontWeight: 400,
      }}
    >
      <Line index={0} style={{ fontSize: 64, lineHeight: 1.15, letterSpacing: "-0.005em" }}>
        Curious about Korea
      </Line>
      <Line
        index={1}
        style={{
          marginTop: 80,
          fontSize: 176,
          lineHeight: 1,
          letterSpacing: "0.32em",
          // Tracking adds space after the last letter; pad the left by the same amount to keep it centred.
          paddingLeft: "0.32em",
        }}
      >
        KURIO
      </Line>
      <Line
        index={2}
        style={{
          marginTop: 110,
          border: `3px solid ${COLORS.paper}`,
          padding: "30px 76px 28px",
          fontSize: 46,
          lineHeight: 1,
          letterSpacing: "0.02em",
        }}
      >
        Learn More
      </Line>
    </div>
  </AbsoluteFill>
);
