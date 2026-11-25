import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

/**
 * KURIO ad design system — v4 (2026-11-26). Fixed for every ad (A–D): only product data and images change.
 * Art direction: "Contemporary Korean Collectibles" — quiet, editorial, object-first.
 * Brand source: C:\CLAUDE\KRUIO\kurio-public-web (fonts, colours, SiteHeader wordmark).
 */

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  /** 3 s per cut × 5 cuts = 450 frames. No per-cut changes. */
  sceneFrames: 90,
  sceneCount: 5,
} as const;

export const COLORS = {
  /** Ground / band colour. */
  ground: "#F4F1EC",
  /** Primary text. */
  ink: "#111111",
  /** Secondary text (product name in Korean romanisation). */
  inkSoft: "#57534E",
  /** End card. */
  endCard: "#B04A3A",
  /** End card text. */
  paper: "#FFFFFF",
  /** "Photo needed" note on a missing cut (drafts only). */
  note: "#8a857d",
} as const;

/** Meta Reels: the top 14% and bottom 35% are covered by Reels UI, ~6% at each side. Text stays inside. */
export const SAFE = { top: 270, bottom: 1248, side: 72 } as const;

// ── Typography ─────────────────────────────────────────────────────────────────────────────────────────
/** LINE Seed Sans (EN), official V1.003 web build, SIL OFL 1.1 — the KURIO site typeface. No Medium exists. */
export const FONT_FAMILY = "LINE Seed Sans";
loadFont({ family: FONT_FAMILY, url: staticFile("fonts/line-seed/LINESeedSans_W_Th.woff2"), weight: "100" });
loadFont({ family: FONT_FAMILY, url: staticFile("fonts/line-seed/LINESeedSans_W_Rg.woff2"), weight: "400" });
loadFont({ family: FONT_FAMILY, url: staticFile("fonts/line-seed/LINESeedSans_W_Bd.woff2"), weight: "700" });

/** Headless Chrome on Windows draws LCD-coloured text edges; a composited layer forces greyscale AA. */
export const GREYSCALE_TEXT = { willChange: "transform" } as const;

/**
 * Caption block: top-left, on the light upper part of every cut (backdrop, wall, or the ground band).
 * Same place in every cut of every ad, so captions read as one continuous line of thought.
 */
export const CAPTION = {
  left: 88,
  right: 88,
  top: 284,
} as const;

export const TYPE = {
  /** ① product name — "Korean moon jar." */
  title: { fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 84, lineHeight: 1.08, letterSpacing: "-0.02em", color: COLORS.ink },
  /** ① name in its own language — "Dalhangari." Tied to the title as one name block. */
  subtitle: { fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 48, lineHeight: 1.25, letterSpacing: "-0.005em", color: COLORS.inkSoft },
  /** Every descriptive line (① ② ③ ④). */
  body: { fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 48, lineHeight: 1.3, letterSpacing: "-0.01em", color: COLORS.ink },
  /** Gap between the name block and the description in ①. */
  nameToBodyGap: 34,
  /** Gap between title and subtitle. */
  titleToSubtitleGap: 8,
} as const;

// ── Motion ─────────────────────────────────────────────────────────────────────────────────────────────
/** One motion language for every cut: slow, eased-out, upward. */
export const MOTION = {
  /** Image push-in over the whole cut (2.5%), easing out — settles instead of drifting on. */
  pushInScale: 1.025,
  pushEase: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  /** ② ③ ④ captions: appear 0.3 s after the cut, rising 20 px over 0.3 s. ① is on screen from frame 0. */
  captionInDelay: 9,
  captionInFrames: 9,
  captionRise: 20,
  captionInEase: Easing.bezier(0.16, 1, 0.3, 1),
  /** Every caption lifts 10 px over the last 8 frames before the hard cut — hands over to the next line. */
  captionOutFrames: 8,
  captionOutLift: 10,
  captionOutEase: Easing.bezier(0.55, 0, 1, 0.45),
} as const;

// ── Image layouts ──────────────────────────────────────────────────────────────────────────────────────
/**
 * "full": the photo covers the whole 1080×1920 frame (① ④ — supplied 9:16 images with a light upper area).
 * "plate": the photo bleeds off left, right and bottom from PLATE.top and softens into a ground band above it,
 * where the caption sits (② ③ — close-ups whose sources are too small to fill 1920 px of height cleanly).
 */
export const PLATE = {
  top: 520,
  /** Upper edge: a short soft line (not a haze) between the ground band and the photo. */
  fade: 28,
} as const;

/**
 * Shared IN PLACE set (staged composite) — warm plaster wall, window light from the LEFT (same light direction as
 * every other cut), slim walnut shelf. Fixed for every ad that needs it; only the shelf height comes from the data.
 */
export const SET = {
  wall: "#E7DED1",
  wallLight: "rgba(255, 250, 241, 0.7)",
  wallShade: "#D6CBBB",
  windowLight: [
    { x: -60, y: 90, w: 210, h: 980 },
    { x: 210, y: 40, w: 180, h: 1000 },
    { x: 450, y: -10, w: 120, h: 900 },
  ],
  shelfDepth: 96,
  shelfFace: 46,
  /** Display stand (rod, base) in px. */
  standRod: 14,
  standBase: 190,
  woodTopBack: "#5E412D",
  woodTopFront: "#7A5639",
  woodFace: "#4B3222",
  woodFaceDark: "#3A2619",
} as const;

/** Cast shadow of matte photos and set objects: light from the LEFT → shadow right and slightly down. */
export const CAST_SHADOW = { dx: 64, dy: 26, blur: 14, opacity: 0.2 } as const;

// ── Generated clips (Higgsfield pipeline, v3+) ─────────────────────────────────────────────────────────
/**
 * One fixed file name per cut in public/clips/<slug>/. A file there replaces the cut's still image; clips are
 * scaled to cover 1080×1920, muted, first 3 s. Generation rule: keep the top quarter light and calm (caption).
 */
export const CLIP_SLOTS = ["01-product.mp4", "02-detail.mp4", "03-making.mp4", "04-in-place.mp4"] as const;
export const clipPath = (slug: string, index: number) => `clips/${slug}/${CLIP_SLOTS[index]}`;

// ── v2/v3 draft stage (cut-out product on the ground) — kept for drafts and Higgsfield keyframes ─────
export const STAGE = {
  productHeight: 760,
  floorY: 1000,
  centerX: 540,
  detailMagnification: 2,
  detailAnchor: { x: 540, y: 600 },
} as const;
export const BLEED = { top: 0, fade: 380 } as const;
export const SHADOW = {
  contact: { width: 0.4, height: 0.055, offsetX: 0.02, opacity: 0.42, blur: 0.014 },
  cast: { width: 0.95, height: 0.14, offsetX: 0.2, opacity: 0.22, blur: 0.045 },
  color: "58, 48, 38",
} as const;
