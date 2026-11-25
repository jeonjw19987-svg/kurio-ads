import type { ProductAd } from "../template/types";

/**
 * Ad D — Tiger & Magpie mother-of-pearl plate (najeonchilgi, 18 cm). v1, 2026-11-26.
 *
 * Images (not in this repository): public/assets/D_najeon/ — the seller's own photos of this exact plate, 1000×1000.
 * Every crop leaves out the third-party book that appears as a prop in the seller's photos.
 * The sources are 1000 px, so the full-frame cuts are enlarged ~2×; higher-resolution originals would sharpen them.
 *
 * Copy notes (seller's listing, checked 2026-11-25): mother-of-pearl on a black lacquered surface, handmade in Korea;
 * the tiger stands for protection, the magpie for good news. Not a folk painting — the storyboard's
 * "Hand-painted on hanji paper" does not apply and is not used.
 * Source and rights records: docs/internal/PRODUCT_SOURCES.md (local, not public).
 */

const DIR = "assets/D_najeon";
const HERO = { src: `${DIR}/01_product.jpg`, width: 1000, height: 1000 } as const;
const CLOSE = { src: `${DIR}/02_detail.jpg`, width: 1000, height: 1000 } as const;
const ABOVE = { src: `${DIR}/03_making.jpg`, width: 1000, height: 1000 } as const;
const ROOM = { src: `${DIR}/04_in_place.jpg`, width: 1000, height: 1000 } as const;

export const adDTigerMagpie: ProductAd = {
  code: "D",
  compositionId: "KURIO-AD-D-TIGER-MAGPIE",
  slug: "d-tiger-magpie",
  productName: "Tiger & Magpie mother-of-pearl plate",
  status: "final",
  scenes: [
    {
      role: "PRODUCT",
      id: "s01-product",
      caption: { title: "Tiger & Magpie.", subtitle: "Najeonchilgi.", body: ["The tiger guards the door."] },
      // The plate on its stand, centred below the name block (×2.1 so the rim clears the caption).
      visual: { kind: "photo", layout: "full", image: HERO, placement: { scale: 2.1, left: -493, top: 0 }, focus: [492, 300] },
    },
    {
      role: "DETAIL",
      id: "s02-detail",
      caption: { body: ["The tiger wards off bad luck.", "The magpie brings good news."] },
      // Tiger and magpie close up: the shell's shifting colours.
      visual: { kind: "photo", layout: "plate", image: CLOSE, crop: { x: 150, y: 0, w: 771, h: 1000 }, focus: [560, 470] },
    },
    {
      role: "MAKING",
      id: "s03-making",
      caption: { body: ["Korean mother-of-pearl craft."] },
      // From above: hand-cut shell pieces — peony, butterflies, pine needles — and the inlaid fret border.
      visual: { kind: "photo", layout: "plate", image: ABOVE, crop: { x: 190, y: 300, w: 540, h: 700 }, focus: [380, 640] },
    },
    {
      role: "IN PLACE",
      id: "s04-in-place",
      caption: { body: ["A touch of Korean artistry."] },
      // The seller's room photo: on its stand on a white table, window light, a lamp beside it.
      visual: { kind: "photo", layout: "full", image: ROOM, crop: { x: 200, y: 0, w: 562, h: 1000 }, focus: [493, 540] },
    },
  ],
};
