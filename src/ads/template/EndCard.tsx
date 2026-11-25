import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_FAMILY, GREYSCALE_TEXT, MOTION, SAFE } from "./tokens";

/**
 * ⑤ END CARD — shared by every ad (A, B, C, D). No props on purpose.
 * Rendered ONCE to out/shared/KURIO_ENDCARD_v4.mp4; that file is joined, without re-encoding, to each ad's
 * 12-second body (storyboard §6: "1회 제작 후 네 편에 동일 파일 삽입, 재렌더 금지").
 *
 * v4 (2026-11-26): v3 layout kept. CTA set in LINE Seed Sans Bold (no Medium exists); each line now rises
 * 16 px as it appears — the same upward motion language as the captions.
 * Copy: Curious about Korea / KURIO / Learn More.
 * Wordmark: the KURIO site's own wordmark (kurio-public-web SiteHeader.tsx) is set text — LINE Seed Sans
 * Regular, tracking 0.32em; there is no logo file. Reproduced the same way.
 * Timing: the three lines start 0.3 s (9 frames) apart and stay fully visible to the last frame.
 * Learn More is a visual CTA only; the click target is set in Meta Ads Manager (no URL or QR code here).
 */

const STEP = 9;
const IN = 9;
const RISE = 16;

const Line: React.FC<{ index: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ index, children, style }) => {
  const frame = useCurrentFrame();
  const start = index * STEP;
  const opts = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const, easing: MOTION.captionInEase };
  return (
    <div
      style={{
        ...GREYSCALE_TEXT,
        opacity: interpolate(frame, [start, start + IN], [0, 1], opts),
        translate: `0px ${interpolate(frame, [start, start + IN], [RISE, 0], opts)}px`,
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
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "0.01em",
        }}
      >
        Learn More
      </Line>
    </div>
  </AbsoluteFill>
);
