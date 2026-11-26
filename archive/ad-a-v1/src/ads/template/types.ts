/**
 * Data model for a KURIO product ad (A–D share one template).
 * A product file (src/ads/products/*.ts) fills these types; the template decides
 * cut length, caption position, fonts, motion curves and the end card.
 */

/** A rectangle in the source image's own pixels. Its aspect should match the frame it fills. */
export type CropRect = { x: number; y: number; w: number; h: number };

/** Slow camera moves. Strength, easing and timing are fixed in the template (motion.ts). */
export type MotionKind = "push-in" | "pull-back" | "drift-left" | "drift-right" | "rise";

export type ImageShot = {
  /** Path inside public/, e.g. "products/a-moon-jar/01-cover.jpg". */
  src: string;
  /** Source image size in pixels. */
  width: number;
  height: number;
  crop: CropRect;
  motion: MotionKind;
};

export type SceneLayout =
  /** One photo in the editorial frame. */
  | { kind: "single"; shot: ImageShot }
  /** Two photos stacked inside the same frame area (detail pairs). */
  | { kind: "diptych"; top: ImageShot; bottom: ImageShot };

export type AdScene = {
  /** Short id used for still file names, e.g. "s01-hero". */
  id: string;
  caption: {
    /** Main English line. */
    headline: string;
    /** Optional small label under the headline (shown in tracked capitals). */
    label?: string;
  };
  layout: SceneLayout;
};

/** Where an image came from and on what basis it is used. Not rendered; kept with the data. */
export type ImageSourceRecord = {
  file: string;
  sourceUrl: string;
  source: string;
  basis: string;
  note?: string;
};

export type ProductAd = {
  /** "A" | "B" | "C" | "D" */
  code: string;
  /** Composition id, e.g. "KURIO-AD-A-MOON-JAR". */
  compositionId: string;
  productName: string;
  /** Exactly four content scenes; the fifth cut is always the shared EndCard. */
  scenes: [AdScene, AdScene, AdScene, AdScene];
  imageSources: ImageSourceRecord[];
};
