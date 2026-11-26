import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { KurioWordmark } from "./KurioWordmark";
import { COLORS_V5, END_V5, FONT_FAMILY, GREYSCALE_TEXT, MOTION_V5 } from "./tokens";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/**
 * ⑤ END CARD v5 — shared by every ad on design "v5". No props on purpose: one master, identical in every ad.
 *
 * Black (#000) ground, white type, two phases that never overlap:
 *   12.0–13.5 s  "Curious about Korea" rises into the centre (same motion as the captions), then lifts away.
 *   13.5–15.0 s  the KURIO wordmark fades in while its tracking settles to the site's 0.32em, then holds.
 * No button: the clickable CTA is set in Meta Ads Manager. The signature sound at 13.5 s is in the shared
 * sound track (tools/compose-sound.mjs), timed to `END_V5.markIn`.
 */
export const EndCardV5: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // A one-frame still (e.g. a thumbnail) shows the final state: the wordmark.
  const f = durationInFrames < 2 ? 89 : frame;

  const tIn = interpolate(f, [END_V5.taglineIn, END_V5.taglineIn + END_V5.taglineInFrames], [0, 1], { ...clamp, easing: MOTION_V5.captionInEase });
  const tOut = interpolate(f, [END_V5.taglineOutStart, END_V5.taglineOutEnd], [0, 1], { ...clamp, easing: MOTION_V5.captionOutEase });
  const tagOpacity = tIn * (1 - tOut);
  const tagY = (1 - tIn) * END_V5.taglineRise - tOut * END_V5.taglineOutLift;

  const m = interpolate(f, [END_V5.markIn, END_V5.markIn + END_V5.markInFrames], [0, 1], { ...clamp, easing: MOTION_V5.captionInEase });
  const tracking = END_V5.markTrackingFrom + (END_V5.markTracking - END_V5.markTrackingFrom) * m;

  const centred: React.CSSProperties = {
    ...GREYSCALE_TEXT,
    position: "absolute",
    left: 0,
    right: 0,
    top: END_V5.centerY,
    display: "flex",
    justifyContent: "center",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS_V5.endCard }}>
      {tagOpacity > 0 ? (
        <div style={{ ...centred, opacity: tagOpacity, translate: `0px calc(-50% + ${tagY}px)` }}>
          <div style={{ fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: END_V5.taglineSize, lineHeight: 1.15, letterSpacing: "-0.005em", color: COLORS_V5.paper }}>
            Curious about Korea
          </div>
        </div>
      ) : null}
      {m > 0 ? (
        <div style={{ ...centred, opacity: m, translate: "0px -50%" }}>
          <KurioWordmark size={END_V5.markSize} color={COLORS_V5.paper} tracking={tracking} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
