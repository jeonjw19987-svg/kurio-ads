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

// ══ v5 (2026-11-26) ═══════════════════════════════════════════════════════════════════════════════════
// A v5 refinement (planner feedback). Used by ads whose data says `design: "v5"` — today only A. B, C and D stay
// on the v4 values above until A v5 is approved; then they switch by setting `design: "v5"` in their data.

/** v5 end card: all black (the red card is retired), white type. */
export const COLORS_V5 = {
  ...COLORS,
  endCard: "#000000",
} as const;

/**
 * v5 type: clearer hierarchy — product name (Bold) › description (Regular, larger than v4 for legibility) ›
 * romanised name (Regular, secondary colour). Same family, same top-left block position as v4.
 */
export const TYPE_V5 = {
  title: { fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 88, lineHeight: 1.05, letterSpacing: "-0.025em" },
  subtitle: { fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 46, lineHeight: 1.2, letterSpacing: "-0.005em" },
  body: { fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 54, lineHeight: 1.28, letterSpacing: "-0.012em" },
  titleToSubtitleGap: 6,
  nameToBodyGap: 30,
  /** Caption colour per cut: "ink" on light images, "paper" on dark ones (chosen in the product data). */
  tone: {
    ink: { color: COLORS.ink, soft: COLORS.inkSoft, halo: "0 0 28px rgba(244, 241, 236, 0.55)" },
    paper: { color: "#FFFFFF", soft: "rgba(255, 255, 255, 0.78)", halo: "0 0 28px rgba(0, 0, 0, 0.25)" },
  },
} as const;

/**
 * v5 motion — one language for every cut: text rises into place and lifts away; images only push in slowly.
 * - ① name block: on screen from frame 0, settling 8 px upward over the cut (barely perceptible).
 * - ① description: appears 0.4 s in, rising 26 px over 0.37 s.
 * - ② ③ ④: appear 0.3 s after the hard cut, rising 26 px over 0.37 s, ease-out (no overshoot, no bounce).
 * - Every caption lifts 24 px and fades over the last 8 frames before the cut, so the next line reads as its
 *   continuation. Images themselves always hard-cut.
 */
export const MOTION_V5 = {
  pushInScale: 1.025,
  pushEase: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  nameSettle: 8,
  nameSettleFrames: 75,
  firstBodyDelay: 12,
  captionInDelay: 9,
  captionInFrames: 11,
  captionRise: 26,
  captionInEase: Easing.bezier(0.22, 1, 0.36, 1),
  captionOutFrames: 8,
  captionOutLift: 24,
  captionOutEase: Easing.bezier(0.55, 0, 0.75, 0.4),
} as const;

/**
 * v5 "soft" photo layout (② ③): the photo fills the width and bleeds off the bottom; above it, the photo's own top
 * rows continue as an out-of-focus field (stretched + blurred — no new detail is drawn), and the sharp photo
 * dissolves into it like shallow depth of field. Caption sits on that field: no band, no edge line.
 */
export const SOFT = {
  /** Photo top on screen (px). The field fills everything above it. */
  top: 500,
  /** Source rows (px) that are stretched into the field. */
  edgeRows: 10,
  /** Blur of the field near the photo (px). */
  blur: 44,
  /** Blur of the field higher up, behind the caption (px) — fully used above `farUntil` (px from the top). */
  farBlur: 150,
  farUntil: 260,
  /** Height (px) over which the sharp photo fades into the field. */
  dissolve: 220,
  /** Strength of the photographic grain restored on the field (overlay opacity) — dithers 8-bit banding. */
  grain: 0.1,
} as const;

/** v5 end card: black; tagline 12.0–13.5 s, then the wordmark 13.5–15.0 s — never both at once. */
export const END_V5 = {
  /** Optical centre of both elements (frame centre is 960; slightly higher clears the Reels caption area). */
  centerY: 910,
  taglineSize: 64,
  taglineIn: 6,
  taglineInFrames: 11,
  taglineRise: 26,
  /** Tagline is gone at frame 45 (13.5 s) … */
  taglineOutStart: 36,
  taglineOutEnd: 45,
  taglineOutLift: 24,
  /** … and the wordmark appears from frame 45, settling its tracking, then holds to the last frame. */
  markIn: 45,
  markInFrames: 21,
  markSize: 168,
  /** Wordmark tracking: settles from this value to the site's 0.32em. */
  markTrackingFrom: 0.4,
  markTracking: 0.32,
} as const;

// v5 sound: one shared, pre-mixed 15 s track for every ad (music bed + cut accents + end-card signature). Not a
// design token: see src/ads/sound.json (the single setting), SharedSound.tsx and tools/compose-sound.mjs.

// ══ v6 (2026-11-26) — content typography ════════════════════════════════════════════════════════════
// Two typefaces with two jobs, managed here:
// - BRAND  (LINE Seed Sans EN): KURIO's identity — the end card's line and the wordmark. Unchanged from v5.
// - CONTENT (SUIT): every product line in 0–12 s (name, romanised name, description). SUIT by SUNN, the face
//   GOTAE's site uses, SIL OFL 1.1 (public/fonts/suit/OFL.txt). Applied inside KURIO's system: same sizes,
//   colours, positions and motion as v5 — only family, weights, tracking and leading change.
// Design "v6" = v5 + TYPE_V6 + the ① caption block raised 70 px (planner feedback). Images, end card, motion and
// sound are shared with v5 unchanged.

export const FONTS = {
  /** Brand: end card and wordmark (EndCardV5, KurioWordmark). */
  brand: FONT_FAMILY,
  /** Content: product text 0–12 s (CaptionV5 with TYPE_V6). */
  content: "SUIT",
} as const;
loadFont({ family: FONTS.content, url: staticFile("fonts/suit/SUIT-Regular.woff2"), weight: "400" });
loadFont({ family: FONTS.content, url: staticFile("fonts/suit/SUIT-Medium.woff2"), weight: "500" });
loadFont({ family: FONTS.content, url: staticFile("fonts/suit/SUIT-SemiBold.woff2"), weight: "600" });

/**
 * v6 content type. Sizes and hierarchy as v5 (name 88 › description 54 › romanised name 46); SUIT weights
 * SemiBold / Regular / Medium; tracking within −0.01em…0; leading 1.2 for names, 1.35 for descriptions. The block's
 * inner gaps are reduced by the added half-leading so the visible rhythm stays as in v5.
 */
export const TYPE_V6 = {
  title: { fontFamily: FONTS.content, fontWeight: 600, fontSize: 88, lineHeight: 1.2, letterSpacing: "-0.01em" },
  subtitle: { fontFamily: FONTS.content, fontWeight: 500, fontSize: 46, lineHeight: 1.2, letterSpacing: "0em" },
  body: { fontFamily: FONTS.content, fontWeight: 400, fontSize: 54, lineHeight: 1.35, letterSpacing: "-0.005em" },
  titleToSubtitleGap: 0,
  nameToBodyGap: 26,
  tone: TYPE_V5.tone,
} as const;

/** v6 caption position: ② ③ ④ as v5; the ① block (name + description) sits 70 px higher, clear of the product. */
export const CAPTION_V6 = {
  ...CAPTION,
  firstCutTop: CAPTION.top - 70,
} as const;

// ── Design "v7" (planner's revision request, 2026-11-26) ─────────────────────────────────────────────────────────
// ① block = product name on ONE line + romanised name + one visible fact. The longest name ("Korean mother-of-pearl
// plate.") is 1178 px at 88 px (tools/copy-fit.mjs), so the shared title size is 66 px: every name fits one line and
// all four ads keep the same size. Everything else as v6.
export const TYPE_V7 = {
  ...TYPE_V6,
  title: { ...TYPE_V6.title, fontSize: 66 },
} as const;

/**
 * v6 end card = v5 + a "Shop now" outline button under the wordmark (revision request §4). Rendered once
 * (out/shared/KURIO_ENDCARD_v6.mp4) and joined, without re-encoding, to every ad.
 */
export const END_V6 = {
  ...END_V5,
  cta: "Shop now",
  /** 0.3 s after the wordmark starts (frame 45 → 54), same rise-in as the captions; holds to the last frame. */
  ctaIn: 54,
  ctaInFrames: 11,
  ctaRise: 16,
  /** Top of the button: below the wordmark (centred at 910), clear of the Reels UI (y ≥ 1248). */
  ctaTop: 1046,
  ctaSize: 42,
  ctaTracking: "0.04em",
  ctaPadX: 60,
  ctaPadY: 22,
  ctaBorder: 2,
} as const;

