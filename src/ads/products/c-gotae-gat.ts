import type { ProductAd } from "../template/types";

/**
 * Ad C — GOTAE "GAT" tableware, 초립 (Chorip) black, plate + cup for one. v2, 2026-11-26, design "v6"
 * (same template, type, motion, end card and sound as A v6 — only the images and lines differ). v2 = v1 with the
 * A v6 typography (SUIT content type, ① caption block raised 70 px); images, crops and lines unchanged.
 *
 * Images (not in this repository): public/assets/C_gotae/, all of the BLACK set from GOTAE's own product page
 * (crop / downscale only; the white version and customers' photos are not used):
 * - 01_product.png   1000 × 1029  the set stacked into a hat, studio (crop of the page's long detail image)
 * - 02_detail.png    1000 × 1000  plate and cup apart, with the paper box (crop of the same detail image)
 * - 03_making.png     750 ×  750  the plate's matte glaze and rim (the page's own close-up; the largest it has)
 * - 04_in_place.png  1800 × 2400  the set on a dark wood table in a room, from the 3024 × 4032 original, MIRRORED
 *                                 left↔right so the plant is not behind the caption (the set is round and symmetric:
 *                                 its form is unchanged)
 * - 04_in_use_alt.png 522 ×  654  the set in use (bread on the plate, milk in the cup) — ④ (×2.2; a larger in-use
 *                                 photo is on the "needed" list). The room photo above is the review alternative.
 * Brand: GOTAE (the brand's own English spelling on gotae.kr); GAT is the collection's name. ① title "GOTAE Tableware."
 * (2026-11-26, was "GAT Tableware."). Copy (GOTAE product page, checked 2026-11-26): handmade in Icheon, Korea, by GOTAE's domestic partner →
 * ③ "Designed and made in Korea."
 * Source and rights records: docs/internal/ (local, not public).
 * FINAL2 (2026-11-26, planner's revision request v2 — request letter C): design "v7" (one shared 66 px title,
 * end card with "Shop now"); lines per the request's §5 table.
 * ① uses the cut-out (01_product_cutout.png), made from the studio photo 01_product.png (1000 × 1029, earlier ①).
 */

const DIR = "assets/C_gotae";
const APART = { src: `${DIR}/02_detail.png`, width: 1000, height: 1000 } as const;
const PLATE = { src: `${DIR}/03_making.png`, width: 750, height: 750 } as const;
const ROOM = { src: `${DIR}/04_in_place.png`, width: 1800, height: 2400 } as const;
const IN_USE = { src: `${DIR}/04_in_use_alt.png`, width: 522, height: 654 } as const;
/** FINAL2 ①: the set cut out of the studio photo (tools/composite/c-cutout.mjs), product box x 17 y 10 w 723 h 339. */
const CUTOUT = { src: `${DIR}/01_product_cutout.png`, width: 779, height: 359 } as const;

export const adCGotaeGat: ProductAd = {
  code: "C",
  compositionId: "KURIO-AD-C-GOTAE-GAT",
  slug: "c-gotae-gat",
  productName: "GOTAE GAT tableware",
  status: "final",
  design: "v7",
  scenes: [
    {
      role: "PRODUCT",
      id: "s01-product",
      caption: { title: "Korean gat tableware.", subtitle: "GOTAE.", body: ["A plate and a cup that stack."] },
      // FINAL2 (request: warm off-white ground, product centred, not cut): the cut-out set on KURIO's ground, ×1.40 —
      // the brim spans 1012 of 1080 px, so it cannot grow the requested 20–30 % without being cut. Centred
      // horizontally, its middle at y 920: below the caption, above the Reels UI (y ≥ 1248). Its own contact shadow.
      visual: { kind: "photo", layout: "full", image: CUTOUT, cutout: true, placement: { scale: 1.4, left: 10, top: 669 }, focus: [378, 180] },
    },
    {
      role: "DETAIL",
      id: "s02-detail",
      // Dark studio backdrop → white caption.
      caption: { body: ["The brim of a Korean hat", "becomes the plate.", "The crown becomes the cup."], tone: "paper" },
      visual: { kind: "photo", layout: "soft", image: APART, crop: { x: 120, y: 0, w: 760, h: 1000 }, focus: [520, 600] },
    },
    {
      role: "MAKING",
      id: "s03-making",
      caption: { body: ["Designed and made in Korea."] },
      // The plate's matte black glaze and its soft rim. Same camera as every ③ (3% push-in, 16 px drift).
      visual: { kind: "photo", layout: "soft", image: PLATE, crop: { x: 90, y: 0, w: 570, h: 750 }, focus: [375, 420], pushIn: 1.03, drift: [-16, 0] },
    },
    {
      role: "IN PLACE",
      id: "s04-in-place",
      caption: { body: ["Korean design, for every day."] },
      // GOTAE's own in-use photo: bread on the plate, milk in the cup — the set as everyday tableware (the brief's key
      // point for C). The light table continues out of focus behind the caption. ×2.2 — the page has nothing larger;
      // a larger in-use photo is on the "needed" list. The room photo is kept as a review alternative below.
      visual: { kind: "photo", layout: "soft", image: IN_USE, crop: { x: 0, y: 0, w: 522, h: 654 }, focus: [300, 360] },
    },
  ],
};

/** Review only: ④ as GOTAE's room photo (mirrored; sharp, but the set is displayed, not in use). */
export const adCGotaeGatRoom: ProductAd = {
  ...adCGotaeGat,
  compositionId: "KURIO-AD-C-GOTAE-GAT-ROOM",
  status: "review",
  scenes: [
    adCGotaeGat.scenes[0],
    adCGotaeGat.scenes[1],
    adCGotaeGat.scenes[2],
    {
      ...adCGotaeGat.scenes[3],
      // Mirrored, so the plant is not behind the caption; full frame, ×0.8 of the 1800 px file.
      visual: { kind: "photo", layout: "full", image: ROOM, crop: { x: 0, y: 0, w: 1350, h: 2400 }, focus: [908, 1710] },
    },
  ],
};
