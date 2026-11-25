/**
 * Data model for a KURIO product ad. A, B, C and D share one template; a product file fills these types.
 * Spec: KURIO_광고_스토리보드_4종_261125_v2.docx (2026-11-25) + the A v2 revision brief (2026-11-26).
 * Only the product, its photos and its caption lines change between ads. Sizes, positions, timing,
 * motion, type and the end card are fixed in the template (tokens.ts) — the data cannot change them.
 */

export type Rect = { x: number; y: number; w: number; h: number };

export type SourceImage = {
  /** Path inside public/, e.g. "products/a-moon-jar/01-cover.jpg". */
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

export type CutVisual =
  /**
   * The product cut out of its photo and set on the off-white ground with a soft side-light shadow,
   * like a studio shot. ① PRODUCT shows it whole at a fixed height; ② DETAIL shows the same cut-out at
   * a fixed 2× magnification, with `focus` (source px) placed at the template's detail anchor.
   */
  | { kind: "cutout"; image: SourceImage; silhouette: Silhouette; focus?: [number, number] }
  /**
   * A photo that keeps its own setting (making traces, a room). Full screen width from the top edge,
   * fading into the off-white ground towards the caption: no rectangle edge anywhere.
   */
  | { kind: "bleed"; image: SourceImage; crop: Rect }
  /** No cleared material yet. Renders a plain "photo needed" note so the gap is never hidden. */
  | { kind: "missing"; need: string };

export type AdScene = {
  role: CutRole;
  /** Short id used for still file names, e.g. "s01-product". */
  id: string;
  caption: {
    /** The English line. */
    text: string;
    /** ① PRODUCT only: the product name line (same size and weight). */
    productName?: string;
  };
  visual: CutVisual;
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
  /** Exactly four content cuts (PRODUCT, DETAIL, MAKING, IN PLACE); the fifth is always the shared end card. */
  scenes: [AdScene, AdScene, AdScene, AdScene];
  imageSources: ImageSourceRecord[];
};
