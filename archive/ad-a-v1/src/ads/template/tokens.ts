import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Shared design tokens for every KURIO ad (A–D). Change here, and all ads follow.
 * Brand source: C:\CLAUDE\KRUIO\kurio-public-web (app/fonts.ts, app/globals.css, SiteHeader wordmark).
 */

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  /** Every cut is 3 s. 4 content scenes + end card = 450 frames. */
  sceneFrames: 90,
  sceneCount: 5,
} as const;

export const COLORS = {
  /** Ad background (brief). */
  ground: "#F4F1EC",
  /** End card, dancheong red (brief). */
  endCard: "#B04A3A",
  /** KURIO site ink and stone (globals.css). */
  ink: "#111111",
  stone: "#5e5e5a",
  paper: "#ffffff",
} as const;

/**
 * Meta Reels safe area for text: keep clear of the top 14% and bottom 35%,
 * and about 6% at each side. All captions and end-card text stay inside.
 */
export const SAFE = {
  top: 270,
  bottom: 1248,
  side: 72,
} as const;

/** Fixed layout of the content scenes. */
export const LAYOUT = {
  marginX: 96,
  /** Caption block top — the same for every scene of every ad. */
  captionTop: 300,
  /** Editorial image frame. */
  frame: { left: 96, top: 560, width: 888, height: 1040 },
  diptychGap: 24,
} as const;

/** LINE Seed Sans (SIL OFL 1.1) — the KURIO site typeface. Thin for display, Regular for labels. */
export const FONT_FAMILY = "LINE Seed Sans";

loadFont({
  family: FONT_FAMILY,
  url: staticFile("fonts/line-seed/LINESeedSans_W_Th.woff2"),
  weight: "100",
});
loadFont({
  family: FONT_FAMILY,
  url: staticFile("fonts/line-seed/LINESeedSans_W_Rg.woff2"),
  weight: "400",
});

/**
 * Headless Chrome on Windows draws text with coloured (LCD/subpixel) edges. A composited layer
 * forces greyscale anti-aliasing, so every text block gets this.
 */
export const GREYSCALE_TEXT = { willChange: "transform" } as const;

export const TYPE = {
  headline: {
    fontFamily: FONT_FAMILY,
    fontWeight: 100,
    fontSize: 76,
    lineHeight: 1.12,
    letterSpacing: "-0.01em",
    color: COLORS.ink,
    // Even line lengths ("A quiet statement / for your home."), never a one-word last line.
    textWrap: "balance" as const,
  },
  label: {
    fontFamily: FONT_FAMILY,
    fontWeight: 400,
    fontSize: 24,
    letterSpacing: "0.32em",
    textTransform: "uppercase" as const,
    color: COLORS.stone,
  },
} as const;
