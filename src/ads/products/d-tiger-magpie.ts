import type { ProductAd } from "../template/types";

/**
 * Ad D — Tiger & Magpie mother-of-pearl plate (najeonchilgi, Ø 18 cm, with its stand; 박씨상방). v1, 2026-11-26,
 * design "v5" (same template, type, motion, end card and sound as A v5 — only the images and lines differ).
 *
 * Images (not in this repository): public/assets/D_najeon/ — the seller's own photos of this exact plate. The page
 * has nothing larger than 1000 px, so every cut uses the "soft" layout (×1.4–1.9) instead of a full frame (×1.9+):
 * - 01_product.png  1000 × 1000  the plate on its stand on a white table
 * - 02_detail.png   1000 × 1000  close-up: tiger, magpie, pine, peonies
 * (③ uses a tighter crop of 02_detail: the inlaid fret border, pine and flowers in hand-cut shell.)
 * - 04_in_place.png 1000 × 1000  the plate on its stand in the seller's room (white table, lamp)
 * Every crop leaves out the third-party book that appears as a prop in the seller's photos.
 *
 * Copy (seller's page, checked 2026-11-26): mother-of-pearl and wood, Ø 180 mm, made in Korea (박씨상방); the tiger
 * drives away bad luck, the magpie brings good news; "Handmade". Not a folk painting.
 * Source and rights records: docs/internal/ (local, not public).
 */

const DIR = "assets/D_najeon";
const HERO = { src: `${DIR}/01_product.png`, width: 1000, height: 1000 } as const;
const CLOSE = { src: `${DIR}/02_detail.png`, width: 1000, height: 1000 } as const;
const ROOM = { src: `${DIR}/04_in_place.png`, width: 1000, height: 1000 } as const;

export const adDTigerMagpie: ProductAd = {
  code: "D",
  compositionId: "KURIO-AD-D-TIGER-MAGPIE",
  slug: "d-tiger-magpie",
  productName: "Tiger & Magpie mother-of-pearl plate",
  status: "final",
  design: "v5",
  scenes: [
    {
      role: "PRODUCT",
      id: "s01-product",
      caption: { title: "Tiger & Magpie.", subtitle: "Najeonchilgi.", body: ["Korean mother-of-pearl art."] },
      // The plate on its stand, whole; the white wall continues out of focus behind the name block (×1.58).
      visual: { kind: "photo", layout: "soft", image: HERO, crop: { x: 50, y: 100, w: 684, h: 900 }, focus: [500, 520] },
    },
    {
      role: "DETAIL",
      id: "s02-detail",
      caption: { body: ["The tiger wards off bad luck.", "The magpie brings good news."] },
      // Tiger and magpie close up: the shell's shifting colours (×1.42).
      visual: { kind: "photo", layout: "soft", image: CLOSE, crop: { x: 150, y: 0, w: 760, h: 1000 }, focus: [560, 470] },
    },
    {
      role: "MAKING",
      id: "s03-making",
      caption: { body: ["Korean mother-of-pearl craft."] },
      // Closer than ②, the upper left of the same close-up: the inlaid fret border, pine and flowers in hand-cut shell on
      // black lacquer (×1.89); the white ground above continues out of focus behind the caption. Same camera as every ③.
      visual: { kind: "photo", layout: "soft", image: CLOSE, crop: { x: 0, y: 0, w: 570, h: 750 }, focus: [320, 400], pushIn: 1.03, drift: [-16, 0] },
    },
    {
      role: "IN PLACE",
      id: "s04-in-place",
      caption: { body: ["A touch of Korean artistry."] },
      // The seller's room: on its stand on a white table, window light, a lamp beside it (×1.54).
      visual: { kind: "photo", layout: "soft", image: ROOM, crop: { x: 70, y: 80, w: 700, h: 920 }, focus: [500, 540] },
    },
  ],
};
