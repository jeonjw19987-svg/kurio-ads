/**
 * Data model for a KURIO product ad. A, B, C and D share one template; a product file fills these types.
 * Spec: storyboard v2 (2026-11-25) + v4 art direction (2026-11-26).
 * Only the product, its images and its caption lines change between ads. Sizes, positions, timing,
 * motion, type and the end card are fixed in the template (tokens.ts) — the data cannot change them.
 */

export type Rect = { x: number; y: number; w: number; h: number };

export type SourceImage = {
  /** Path inside public/, e.g. "assets/A_moonjar/01_product_v4.png.png". */
  src: string;
  /** Source image size in pixels. */
  width: number;
  height: number;
};

/** The product's outline in the source image's own pixels (tools/trace-silhouette.cjs → tools/contour-to-ts.cjs). */
export type Silhouette = {
  bbox: Rect;
  points: [number, number][];
};

/** The four content cuts, in storyboard order (§3). */
export type CutRole = "PRODUCT" | "DETAIL" | "MAKING" | "IN PLACE";

/** Explicit image placement (screen px, relative to the layout's area) instead of cover-fit. */
export type Placement = { scale: number; left: number; top: number };

export type CutVisual =
  /**
   * v4: a photo in one of the two template layouts (tokens.ts → PLATE).
   * - "full": covers the whole frame (supplied 9:16 images with a light upper area for the caption).
   * - "plate": bleeds off left/right/bottom from PLATE.top and softens into the ground band above.
   * `crop` (source px) limits which part of the source is used; `focus` (source px) is the push-in centre.
   * `matte` (brightness factor): studio shot on a flat light background, multiplied onto the ground — lets a
   * product sit lower or smaller in the frame on KURIO's ground with no seam. Needs `placement`.
   */
  | {
      kind: "photo";
      /** v5 adds "soft" (tokens.ts → SOFT): photo from SOFT.top down, its own top rows as a soft field above. */
      layout: "full" | "plate" | "soft";
      image: SourceImage;
      crop?: Rect;
      focus: [number, number];
      matte?: number;
      placement?: Placement;
      /** v5: static crop-in (e.g. 1.12 = the product 12% larger), centred on `focus`, before the push-in. */
      zoom?: number;
      /** v5: the source point (px) that stays fixed when zooming (default `focus`). The bottom edge lifts the product. */
      zoomAnchor?: [number, number];
      /** v5: slow camera drift over the cut, screen px [x, y], alongside the push-in (e.g. towards the hands). */
      drift?: [number, number];
      /** v5: push-in amount for this cut (default MOTION_V5.pushInScale, 2.5%). */
      pushIn?: number;
    }
  /**
   * IN PLACE composite for a product with no photo of itself in a room: the shared set (tokens.ts → SET) with the
   * matte product photo placed on the shelf. `surfaceY` is the shelf's back edge on screen. Always a staged composite.
   */
  | {
      kind: "set";
      image: SourceImage;
      matte: number;
      placement: Placement;
      focus: [number, number];
      surfaceY: number;
      contact?: { x: number; y: number; w: number };
      /** Optional walnut display stand (screen px): rod from `top` down to a round base at `baseY`. */
      stand?: { x: number; top: number; baseY: number };
    }
  /** v2/v3 drafts: cut-out product on the ground (also the Higgsfield keyframe source). */
  | { kind: "cutout"; image: SourceImage; silhouette: Silhouette; focus?: [number, number] }
  /** v2/v3 drafts: photo from the top edge fading into the ground. */
  | { kind: "bleed"; image: SourceImage; crop: Rect }
  /** No cleared material yet: a plain "photo needed" note, so a gap is never hidden. */
  | { kind: "missing"; need: string };

export type AdScene = {
  role: CutRole;
  /** Short id used for still file names, e.g. "s01-product". */
  id: string;
  caption: {
    /** ① PRODUCT only: product name (Bold, largest). */
    title?: string;
    /** ① PRODUCT only: name in its own language (secondary colour), one name block with the title. */
    subtitle?: string;
    /** Descriptive lines, one entry per line break as the storyboard sets them. */
    body: string[];
    /** v5: "ink" (#111, default) on light images, "paper" (white) on dark ones. */
    tone?: "ink" | "paper";
  };
  /** The cut's image. A generated clip in public/clips/<slug>/ replaces it when present. */
  visual: CutVisual;
  /** Seconds to skip at the start of a generated clip (default 0). The cut always uses 3 s. */
  clipTrimSec?: number;
};

export type ProductAd = {
  /** "A" | "B" | "C" | "D" */
  code: string;
  /** Composition id, e.g. "KURIO-AD-A-MOON-JAR". */
  compositionId: string;
  /** Folder name for this ad's generated clips: public/clips/<slug>/. */
  slug: string;
  productName: string;
  /** Exactly four content cuts (PRODUCT, DETAIL, MAKING, IN PLACE); the fifth is always the shared end card. */
  scenes: [AdScene, AdScene, AdScene, AdScene];
  /**
   * "final": every cut has its approved image. "review": an internal review template — renders get "_INTERNAL_REVIEW"
   * in their names and must not be used as an ad (e.g. image rights or a key scene still open).
   */
  status: "final" | "review";
  /**
   * Design system version (tokens.ts). Default "v4". "v5" = v5 captions, soft photo layout, black end card and
   * the shared v5 sound. Switch an ad only together with its review; all four should end on the same version.
   */
  // "v6" = v5 with SUIT content typography (TYPE_V6) and the ① caption block raised (CAPTION_V6).
  design?: "v4" | "v5" | "v6";
};

/** Props of the ad compositions. `clips` is filled by calculateMetadata (which slot files exist). */
export type AdProps = {
  ad: ProductAd;
  withEndCard: boolean;
  /** Per cut: the public/ path of its generated clip, or null when the slot is empty (the still image is shown). */
  clips?: (string | null)[];
};
