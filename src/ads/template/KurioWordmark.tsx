import React from "react";
import { FONT_FAMILY } from "./tokens";

/**
 * The KURIO wordmark, drawn exactly as the KURIO site draws it today (kurio-public-web SiteHeader): the word
 * "KURIO" in LINE Seed Sans Regular with 0.32em tracking. The site itself marks this as a text wordmark until a
 * confirmed logo file exists — when one does, replace the body of this component with that file; every ad and
 * the end card pick it up from here.
 */
export const KurioWordmark: React.FC<{ size: number; color: string; tracking?: number }> = ({ size, color, tracking = 0.32 }) => (
  <div
    style={{
      fontFamily: FONT_FAMILY,
      fontWeight: 400,
      fontSize: size,
      lineHeight: 1,
      color,
      letterSpacing: `${tracking}em`,
      // Tracking adds space after the last letter; pad the left by the same amount so the word stays centred.
      paddingLeft: `${tracking}em`,
      whiteSpace: "nowrap",
    }}
  >
    KURIO
  </div>
);
