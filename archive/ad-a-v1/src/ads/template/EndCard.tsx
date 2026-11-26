import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_FAMILY, GREYSCALE_TEXT, SAFE } from "./tokens";

/**
 * KURIO end card — shared, unchanged, by every ad (A, B, C, D). It takes no props on purpose:
 * edit it here and all four ads change together.
 *
 * Wordmark: the KURIO site's own wordmark (SiteHeader.tsx) is set text —
 * LINE Seed Sans Regular, tracking 0.32em. It is reproduced here the same way.
 */

const ease = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const, easing: Easing.bezier(0.16, 1, 0.3, 1) };

const Reveal: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        ...GREYSCALE_TEXT,
        opacity: interpolate(frame, [delay, delay + 12], [0, 1], ease),
        translate: interpolate(frame, [delay, delay + 16], ["0px 12px", "0px 0px"], ease),
      }}
    >
      {children}
    </div>
  );
};

export const EndCard: React.FC = () => {
  return (
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
        }}
      >
        <Reveal delay={2}>
          <div style={{ fontWeight: 100, fontSize: 60, lineHeight: 1.15, letterSpacing: "-0.005em" }}>Curious about Korea</div>
        </Reveal>

        <Reveal delay={8}>
          <div
            style={{
              marginTop: 88,
              fontWeight: 400,
              fontSize: 112,
              lineHeight: 1,
              letterSpacing: "0.32em",
              // Tracking adds space after the last letter; pad the left by the same amount to keep it centred.
              paddingLeft: "0.32em",
            }}
          >
            KURIO
          </div>
        </Reveal>

        <Reveal delay={16}>
          <div
            style={{
              marginTop: 112,
              border: `1.5px solid ${COLORS.paper}`,
              padding: "26px 60px 24px 66px",
              fontWeight: 400,
              fontSize: 26,
              lineHeight: 1,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            Learn More
          </div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
