import type { ProductAd } from "../template/types";

/**
 * Ad B — Traditional Korean gat (heuklip, black; National Intangible Heritage maker). v2, 2026-11-26, design "v6"
 * (same template, type, motion, end card and sound as A v6 — only the images and lines differ). v2 = v1 with the
 * A v6 typography (SUIT content type, ① caption block raised 70 px); images, crops and lines unchanged.
 *
 * Images (not in this repository): public/assets/B_traditional_gat/, prepared from the maker's own photos on the
 * product page (tools: crop / Lanczos downscale only — nothing enlarged, retouched or generated):
 * - 01_product.png  667 × 1001  the studio photo of this gat (the largest the page has) — ① and ④
 * - 02_detail.png  2000 × 2072  the brim from above, from the 4700 × 4870 original (downscaled)
 * - 03_making.png  2400 × 1776  the maker's hands shaping the woven brim with a heated iron, from the 4918 × 3638
 *                               original (downscaled). Hands only; no face.
 * Only photos of THIS gat and of its maker's process are used; the maker's other gats (feathered, red) and the
 * portrait are excluded.
 *
 * Copy (the product page, checked 2026-11-26): material "대나무" (bamboo) in the listing; the brim (양태) is woven from
 * bamboo split into thread (죽사), shaped with an iron, lacquered black; all handmade. Horsehair is mentioned only in
 * the page's general text about gat, not for this piece → ③ "Split bamboo, woven by hand." (not "…and horsehair").
 * Source and rights records: docs/internal/ (local, not public).
 * FINAL2 (2026-11-26, planner's revision request v2 — request letter D): design "v7" (one shared 66 px title,
 * end card with "Shop now"); lines per the request's §5 table.
 * ① 3rd line: the request asked for "Woven from horsehair."; horsehair is not confirmed for this gat (the page lists
 * bamboo), so — operator's decision, 2026-11-26 — "Finely woven, lacquered black." (woven bamboo brim, black lacquer).
 */

const DIR = "assets/B_traditional_gat";
const STUDIO = { src: `${DIR}/01_product.png`, width: 667, height: 1001 } as const;
const WEAVE = { src: `${DIR}/02_detail.png`, width: 2000, height: 2072 } as const;
const MAKING = { src: `${DIR}/03_making.png`, width: 2400, height: 1776 } as const;
/** 255 / 245: the studio photo's flat background → white. */
const MATTE = 1.0408;

export const adBTraditionalGat: ProductAd = {
  code: "B",
  compositionId: "KURIO-AD-B-TRADITIONAL-GAT",
  slug: "b-traditional-gat",
  productName: "Traditional Korean gat",
  status: "final",
  design: "v7",
  scenes: [
    {
      role: "PRODUCT",
      id: "s01-product",
      caption: { title: "Traditional Korean hat.", subtitle: "Gat.", body: ["Finely woven, lacquered black."] },
      // v7: the name on one line (881 px at 88 px in SUIT; 66 px now, shared by all four ads).
      // Whole gat with its strap on KURIO's warm ground (matte), centred below the name block. ×1.7 is the most this
      // 667 px studio photo allows; a larger original is on the "needed" list.
      visual: { kind: "photo", layout: "full", image: STUDIO, matte: MATTE, placement: { scale: 1.7, left: -74, top: 470 }, focus: [361, 300] },
    },
    {
      role: "DETAIL",
      id: "s02-detail",
      caption: { body: ["Worn by Joseon scholars —", "light enough to see through."] },
      // The brim from above: fine bamboo weave radiating from the crown, light passing through. Shown at ×0.88.
      visual: { kind: "photo", layout: "soft", image: WEAVE, crop: { x: 372, y: 239, w: 1250, h: 1621 }, focus: [997, 1049] },
    },
    {
      role: "MAKING",
      id: "s03-making",
      caption: { body: ["Split bamboo,", "shaped by hand."] },
      // Cropped 100 px below the photo's top edge so the out-of-focus field behind the caption comes from the light
      // cloth, not the hand at the very top (which smeared). Light field → ink caption.
      // Hands shaping the woven, still unlacquered brim with a heated iron. Same camera as every ③: 3% push-in and a
      // 16 px drift toward the hands. The brim's circle continues ②'s circular weave across the hard cut.
      visual: { kind: "photo", layout: "soft", image: MAKING, crop: { x: 833, y: 100, w: 1370, h: 1676 }, focus: [1300, 700], pushIn: 1.03, drift: [-16, 0] },
    },
    {
      role: "IN PLACE",
      id: "s04-in-place",
      caption: { body: ["On display, not in a box."] },
      // Staged composite (recorded as such): the same studio photo on the shared wall-and-walnut-shelf set, on a slim
      // walnut display stand — a collectible object in a modern room, not worn.
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
