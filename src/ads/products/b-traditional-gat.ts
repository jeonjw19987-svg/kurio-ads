import type { ProductAd } from "../template/types";

/**
 * Ad B — Traditional Korean gat (black, heritage craft). v1, 2026-11-26.
 *
 * Images (not in this repository): public/assets/B_traditional_gat/. Only photos of THIS gat and of its maker's
 * process are used; the maker's other gats are excluded (no mixing of different designs as one product).
 * ① and ④ use the same studio photo: a flat #F5F5F5 background, mapped to white (×255/245) and multiplied onto
 * KURIO's ground (①) or the shared IN PLACE set (④, a staged composite). The gat itself is not altered.
 *
 * Copy notes (facts as the maker states them on the listing, checked 2026-11-25):
 * - Listed material is bamboo; horsehair is not stated → the storyboard lines "Woven from horsehair." and
 *   "Split bamboo and horsehair, woven by hand" are replaced by the brief's own fallback and a bamboo-only line.
 * Source and rights records: docs/internal/PRODUCT_SOURCES.md (local, not public).
 */

const DIR = "assets/B_traditional_gat";
const STUDIO = { src: `${DIR}/01_product.jpg`, width: 667, height: 1001 } as const;
const WEAVE = { src: `${DIR}/02_detail.jpg`, width: 1440, height: 1492 } as const;
const MAKING = { src: `${DIR}/03_making.jpg`, width: 1440, height: 1065 } as const;
/** 255 / 245: the studio photo's flat background → white. */
const MATTE = 1.0408;

export const adBTraditionalGat: ProductAd = {
  code: "B",
  compositionId: "KURIO-AD-B-TRADITIONAL-GAT",
  slug: "b-traditional-gat",
  productName: "Traditional Korean gat",
  status: "final",
  scenes: [
    {
      role: "PRODUCT",
      id: "s01-product",
      caption: { title: "Traditional Korean hat.", subtitle: "Gat.", body: ["A silhouette of Korean heritage."] },
      // Whole gat with its strap, centred, crown below the two-line name block. Push-in anchored at the crown.
      visual: { kind: "photo", layout: "full", image: STUDIO, matte: MATTE, placement: { scale: 1.7, left: -74, top: 376 }, focus: [361, 300] },
    },
    {
      role: "DETAIL",
      id: "s02-detail",
      caption: { body: ["Worn by Joseon scholars —", "light enough to see through."] },
      // The brim from above: fine bamboo weave radiating from the crown, light passing through.
      visual: { kind: "photo", layout: "plate", image: WEAVE, crop: { x: 268, y: 172, w: 900, h: 1167 }, focus: [718, 755] },
    },
    {
      role: "MAKING",
      id: "s03-making",
      caption: { body: ["Split bamboo,", "woven by hand."] },
      // The maker's hands shaping the woven, still unlacquered brim with a heated iron. Hands only, no face.
      // The brim's circle continues the circular weave of ② across the hard cut.
      visual: { kind: "photo", layout: "plate", image: MAKING, crop: { x: 500, y: 0, w: 822, h: 1065 }, focus: [780, 420] },
    },
    {
      role: "IN PLACE",
      id: "s04-in-place",
      caption: { body: ["An object on the shelf."] },
      // Staged composite: the same studio photo on the shared wall-and-shelf set, the gat on a slim walnut display
      // stand (seen through the woven crown), its strap trailing onto the shelf.
      visual: {
        kind: "set",
        image: STUDIO,
        matte: MATTE,
        placement: { scale: 1.15, left: 125, top: 427 },
        focus: [361, 300],
        surfaceY: 1350,
        contact: { x: 430, y: 1408, w: 380 },
        stand: { x: 540, top: 690, baseY: 1400 },
      },
    },
  ],
};
