import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Fixed values shared by every KURIO ad (A–D). Storyboard v2 §3–§4, §6, §8 + A v2 revision brief.
 * Brand source: C:\CLAUDE\KRUIO\kurio-public-web (app/fonts.ts, app/globals.css, SiteHeader wordmark).
 */

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  /** 3 s per cut × 5 cuts. No per-cut changes. */
  sceneFrames: 90,
  sceneCount: 5,
} as const;

export const COLORS = {
  /** Ground for cuts ①–④. */
  ground: "#F4F1EC",
  /** End card. */
  endCard: "#B04A3A",
  /** Captions ①–④. */
  ink: "#111111",
  /** End card text. */
  paper: "#ffffff",
  /** "Photo needed" note on a missing cut (not a caption). */
  note: "#8a857d",
} as const;

/**
 * Meta Reels safe area for text: the top 14% and bottom 35% are covered by Reels UI, plus ~6% each side.
 * The brief's "하단 1/3" (y ≥ 1280) lies entirely inside the covered bottom 35%, so captions sit at the
 * lowest uncovered place instead: bottom-aligned at y = 1240.
 */
export const SAFE = { top: 270, bottom: 1248, side: 72 } as const;

export const CAPTION = {
  left: SAFE.side,
  right: SAFE.side,
  /** Bottom edge of the caption block, in every cut of every ad. */
  bottom: 1240,
  /** ② ③ ④ appear 0.3 s after the cut starts; ① is on screen from the first frame. */
  delayFrames: 9,
  fadeFrames: 4,
} as const;

/** One sans-serif family (LINE Seed Sans, SIL OFL 1.1 — the KURIO site typeface), English only. */
export const FONT_FAMILY = "LINE Seed Sans";

loadFont({ family: FONT_FAMILY, url: staticFile("fonts/line-seed/LINESeedSans_W_Th.woff2"), weight: "100" });
loadFont({ family: FONT_FAMILY, url: staticFile("fonts/line-seed/LINESeedSans_W_Rg.woff2"), weight: "400" });

/** Mobile-readable: Regular weight, 64 px (≈ 23 pt on a 390 pt-wide phone). One size for every cut. */
export const CAPTION_TYPE = {
  fontFamily: FONT_FAMILY,
  fontWeight: 400,
  fontSize: 64,
  lineHeight: 1.2,
  letterSpacing: "-0.01em",
  color: COLORS.ink,
  textWrap: "balance" as const,
} as const;

/**
 * Headless Chrome on Windows draws text with coloured (LCD) edges. A composited layer forces greyscale
 * anti-aliasing, so every text block gets this.
 */
export const GREYSCALE_TEXT = { willChange: "transform" } as const;

/** Stage for cut-out products (① PRODUCT, ② DETAIL). */
export const STAGE = {
  /** ① PRODUCT: product height on screen, and where its lowest point stands. */
  productHeight: 760,
  floorY: 1000,
  centerX: 540,
  /** ② DETAIL: fixed magnification of the ① PRODUCT size, for every product ("소재마다 같은 배율"). */
  detailMagnification: 2,
  /** ② DETAIL: where the product data's `focus` point lands. */
  detailAnchor: { x: 540, y: 600 },
} as const;

/** Photos that keep their own setting (③ MAKING, ④ IN PLACE): full width from the top, fading out above the caption. */
export const BLEED = {
  top: 0,
  /** The image fades into the ground over this many px at its lower end. */
  fade: 380,
} as const;

/**
 * Generated clips (Higgsfield → Remotion). One fixed file name per cut. Drop or replace a file here and the next
 * render (or tools/watch-clips.mjs) picks it up; an empty slot falls back to the cut's `visual`.
 * Clips are scaled to cover 1080×1920 (9:16 sources fill exactly), muted, and cut to 90 frames.
 */
export const CLIP_SLOTS = ["01-product.mp4", "02-detail.mp4", "03-making.mp4", "04-in-place.mp4"] as const;

/**
 * Every clip fades into the off-white ground above the caption band, so the #111111 caption always reads and
 * the lower band (mostly under the Reels UI anyway) is identical in every cut of every ad.
 * Generation rule that follows: keep the subject in the upper part of the frame (y ≈ 160–1000 of 1920).
 */
export const CLIP_FADE = { from: 820, to: 1080 } as const;
export const clipPath = (slug: string, index: number) => `clips/${slug}/${CLIP_SLOTS[index]}`;

/** One very slow push-in per cut (storyboard §4), constant speed. Scale at the cut's last frame. */
export const PUSH_IN_END_SCALE = 1.04;

/**
 * Side light from the left, so shadows fall to the right — the same in every ad (storyboard §4).
 * Sizes are fractions of the product's on-screen width.
 */
export const SHADOW = {
  contact: { width: 0.4, height: 0.055, offsetX: 0.02, opacity: 0.42, blur: 0.014 },
  cast: { width: 0.95, height: 0.14, offsetX: 0.2, opacity: 0.22, blur: 0.045 },
  color: "58, 48, 38",
} as const;
