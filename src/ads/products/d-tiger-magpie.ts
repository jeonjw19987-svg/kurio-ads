import type { ProductAd } from "../template/types";

/**
 * Ad D — Tiger & Magpie mother-of-pearl plate (najeonchilgi, Ø 18 cm, with its stand; 박씨상방). v2, 2026-11-26,
 * design "v6" — the same typography (SUIT content type, ① caption raised), motion, end card and sound as A v6.
 *
 * v2 (planner feedback on v1): less "the same photo, zoomed in and out". Every cut now uses a different photo and
 * viewpoint — front on its stand → front close-up of the motif → raking angle on the table → the room:
 * - 01_hero.png     1000 × 1000  the plate on its stand, front, the lamp behind — framed close       ① ×1.80
 * - 02_detail.png   1000 × 1000  front close-up: tiger, magpie, pine — the shell's colours          ② ×1.80
 * - 03_craft.png    1000 × 1000  the plate lying flat at an angle: raking light across the inlay,
 *                                the black lacquer's gloss, the stand's inlaid peony                ③ ×1.80
 * - 04_in_place.png 1000 × 1000  the plate on its stand in the seller's room (white table, lamp) — wide ④ ×1.42
 * All are the seller's own photos of this exact plate (max 1000 px → the "soft" layout throughout). Every crop
 * leaves out the third-party book that appears as a prop in the seller's photos.
 *
 * No photo of this plate being made exists on the seller's page, so ③ shows the finished craft (lacquer and shell)
 * and uses the planner's line for that case — no artisan image is generated or borrowed from another product.
 * Copy (seller's page, checked 2026-11-26): 나전칠기 (mother-of-pearl inlaid in lacquer), mother-of-pearl and wood,
 * Ø 180 mm, made in Korea (박씨상방), "숙련된 장인의 손길로" / "Handmade"; the tiger drives away bad luck, the magpie
 * brings good news (길상과 수호). Source and rights records: docs/internal/ (local, not public).
 */

const DIR = "assets/D_najeon";
const HERO = { src: `${DIR}/01_hero.png`, width: 1000, height: 1000 } as const;
const CLOSE = { src: `${DIR}/02_detail.png`, width: 1000, height: 1000 } as const;
const ANGLE = { src: `${DIR}/03_craft.png`, width: 1000, height: 1000 } as const;
const ROOM = { src: `${DIR}/04_in_place.png`, width: 1000, height: 1000 } as const;

export const adDTigerMagpie: ProductAd = {
  code: "D",
  compositionId: "KURIO-AD-D-TIGER-MAGPIE",
  slug: "d-tiger-magpie",
  productName: "Tiger & Magpie mother-of-pearl plate",
  status: "final",
  design: "v6",
  scenes: [
    {
      role: "PRODUCT",
      id: "s01-product",
      caption: { title: "Tiger & Magpie.", subtitle: "Najeonchilgi.", body: ["Korean mother-of-pearl art."] },
      // Close and frontal: the plate and its stand fill the width (the hero); the white wall continues out of focus
      // behind the name block. ④ is framed wide, so the two on-stand cuts read differently.
      visual: { kind: "photo", layout: "soft", image: HERO, crop: { x: 195, y: 211, w: 600, h: 789 }, focus: [495, 540] },
    },
    {
      role: "DETAIL",
      id: "s02-detail",
      // The folk motif's meaning (호작도), in three lines.
      caption: { body: ["A Korean folk motif.", "The tiger wards off bad luck.", "The magpie brings good news."] },
      // Closer than ①, a different photo: the magpie on the pine and the tiger's head in iridescent shell; the white
      // ground above the rim continues behind the caption.
      visual: { kind: "photo", layout: "soft", image: CLOSE, crop: { x: 260, y: 0, w: 600, h: 789 }, focus: [560, 420] },
    },
    {
      role: "MAKING",
      id: "s03-making",
      // No making photo of this plate exists → the planner's line for that case; two lines on purpose.
      caption: { body: ["Layers of lacquer", "and mother-of-pearl."] },
      // A different angle: the plate lying flat in raking light — the lacquer's gloss along the rim, the shell catching
      // the light, the stand's inlaid peony behind. Same camera as every ③ (3% push-in, 16 px drift).
      visual: { kind: "photo", layout: "soft", image: ANGLE, crop: { x: 40, y: 211, w: 600, h: 789 }, focus: [380, 640], pushIn: 1.03, drift: [-16, 0] },
    },
    {
      role: "IN PLACE",
      id: "s04-in-place",
      caption: { body: ["A touch of Korean artistry."] },
      // Wide: the seller's room — the plate smaller on its stand on a white table, window light, the lamp beside it.
      visual: { kind: "photo", layout: "soft", image: ROOM, crop: { x: 0, y: 0, w: 760, h: 1000 }, focus: [480, 540] },
    },
  ],
};
