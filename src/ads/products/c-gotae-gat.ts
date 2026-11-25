import type { ProductAd } from "../template/types";

/**
 * Ad C — GAT tableware (plate + cup, black). INTERNAL REVIEW TEMPLATE, 2026-11-26.
 *
 * ON HOLD: the storyboard makes C conditional on the brand's image permission and on how far the brand name may be
 * shown. Until both are confirmed this is a layout/copy template only: renders are named _INTERNAL_REVIEW and no MP4
 * is produced (npm run c:stills). When approval arrives: replace images if needed, set status to "final", render.
 *
 * Known gaps for approval day:
 * - ④ IN PLACE: no photo of the set in use on a dining table.
 * - The seller's photos have a dark grey gradient at the top, where the caption sits: #111 text does not read there.
 *   An approved photo with a light upper area (or an agreed layout change for C) is needed.
 * - Sources are 750×750; ① is enlarged ~2.6×.
 * Copy: GOTAE states the set is handmade in Icheon, Korea, by its domestic partner → "Designed and made in Korea."
 * Source and rights records: docs/internal/PRODUCT_SOURCES.md (local, not public).
 */

const DIR = "assets/C_gotae";
const STACKED = { src: `${DIR}/01_product.jpg`, width: 750, height: 750 } as const;
const PARTS = { src: `${DIR}/02_detail.jpg`, width: 750, height: 750 } as const;
const PLATE_SURFACE = { src: `${DIR}/03_making.jpg`, width: 750, height: 750 } as const;

export const adCGotaeGat: ProductAd = {
  code: "C",
  compositionId: "KURIO-AD-C-GOTAE-GAT",
  slug: "c-gotae-gat",
  productName: "GAT tableware",
  status: "review",
  scenes: [
    {
      role: "PRODUCT",
      id: "s01-product",
      caption: { title: "GAT Tableware.", subtitle: "A plate and a cup.", body: ["Stack them. It becomes a hat."] },
      // Cup upturned on the plate: the gat's silhouette.
      visual: { kind: "photo", layout: "full", image: STACKED, crop: { x: 164, y: 0, w: 422, h: 750 }, focus: [375, 470] },
    },
    {
      role: "DETAIL",
      id: "s02-detail",
      caption: { body: ["The brim is the plate.", "The crown is the cup."] },
      // Plate and cup apart (with the folded paper box behind).
      visual: { kind: "photo", layout: "plate", image: PARTS, crop: { x: 120, y: 0, w: 578, h: 750 }, focus: [420, 420] },
    },
    {
      role: "MAKING",
      id: "s03-making",
      caption: { body: ["Designed and made in Korea."] },
      // The plate's glazed surface and form.
      visual: { kind: "photo", layout: "plate", image: PLATE_SURFACE, crop: { x: 86, y: 0, w: 578, h: 750 }, focus: [375, 400] },
    },
    {
      role: "IN PLACE",
      id: "s04-in-place",
      caption: { body: ["On the table, every day."] },
      visual: { kind: "missing", need: "approved photo of the plate and cup in use on a dining table" },
    },
  ],
};
