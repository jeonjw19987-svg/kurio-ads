import type { ProductAd } from "../template/types";

/**
 * Ad D — Tiger & Magpie mother-of-pearl plate (najeonchilgi, Ø 18 cm, with its stand; 박씨상방). v3, 2026-11-26,
 * design "v6" — the same typography (SUIT content type, ① caption raised), motion, cuts, end card and sound as A v6.
 *
 * v3 (operator's request, 2026-11-26): the four images the operator supplied replace v2's seller photos, one per cut.
 * Only crops, layouts and caption tones were set to fit them; the lines are v2's. Nothing was generated, retouched or
 * colour-graded here. Files are kept exactly as supplied:
 * - 01_product_v3.png   1080 × 1920  the plate on its stand, front, on a plain light ground. No embedded provenance
 *                                    data; the plate matches the seller's front photo on its stand (the lamp and
 *                                    book behind it are gone; the plate is about ×1.7 that photo's pixels).  ① full ×1.00
 * - 02_detail_v3.png     941 × 1672  the plate lying at an angle on a warm surface, window shadows.          ② soft ×1.15
 * - 03_making_v3.png     941 × 1672  hands setting mother-of-pearl strips (an orchid) into black lacquer.    ③ soft ×1.15
 * - 04_in_place_v3.png   941 × 1672  the plate on its stand on a walnut sideboard against a warm wall.        ④ full ×1.15
 * 02–04 carry C2PA content credentials: created with ChatGPT (gpt-image), digital source type
 * "trainedAlgorithmicMedia" — AI-generated images, not photographs. In 02 and 04 the plate's motif is redrawn
 * (the tiger's face, mouth and stripes differ from the seller's photos); 03 shows an orchid, not this plate, and not
 * this maker. The rendered MP4 does not carry the credentials. Recorded in docs/internal/PRODUCT_SOURCES_BCD.md.
 * Confirmed as D's final version by the operator on 2026-11-26, with these points known.
 *
 * Copy (seller's page, checked 2026-11-26): 나전칠기 (mother-of-pearl inlaid in lacquer), mother-of-pearl and wood,
 * Ø 180 mm, made in Korea (박씨상방), "Handmade"; the tiger drives away bad luck, the magpie brings good news
 * (길상과 수호). Source and rights records: docs/internal/ (local, not public).
 */

const DIR = "assets/D_najeon";
const HERO = { src: `${DIR}/01_product_v3.png`, width: 1080, height: 1920 } as const;
const LYING = { src: `${DIR}/02_detail_v3.png`, width: 941, height: 1672 } as const;
const INLAY = { src: `${DIR}/03_making_v3.png`, width: 941, height: 1672 } as const;
const ROOM = { src: `${DIR}/04_in_place_v3.png`, width: 941, height: 1672 } as const;

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
      // Already 9:16 with a plain light ground above the plate → full frame; the name block sits on the ground and the
      // plate starts below it.
      visual: { kind: "photo", layout: "full", image: HERO, focus: [552, 950] },
    },
    {
      role: "DETAIL",
      id: "s02-detail",
      // The folk motif's meaning (호작도), in three lines.
      caption: { body: ["A Korean folk motif.", "The tiger wards off bad luck.", "The magpie brings good news."] },
      // The rim starts high in this image, so full frame would put the motif under three lines → soft: the photo from
      // just above the rim (y 150), the warm surface continuing behind the caption. Ink caption on the light field.
      visual: { kind: "photo", layout: "soft", image: LYING, crop: { x: 0, y: 150, w: 941, h: 1237 }, focus: [480, 700] },
    },
    {
      role: "MAKING",
      id: "s03-making",
      // Two lines on purpose (v2's line).
      caption: { body: ["Layers of lacquer", "and mother-of-pearl."], tone: "paper" },
      // Soft from the image's top: the black lacquer continues behind the caption (white caption), the tool and the
      // inlay below it. Same camera as every ③ (3% push-in, 16 px drift), centred on the tool's tip.
      visual: { kind: "photo", layout: "soft", image: INLAY, crop: { x: 0, y: 0, w: 941, h: 1237 }, focus: [525, 990], pushIn: 1.03, drift: [-16, 0] },
    },
    {
      role: "IN PLACE",
      id: "s04-in-place",
      caption: { body: ["A touch of Korean artistry."] },
      // 9:16 with the wall above the plate → full frame, like A's ④; the line sits on the wall.
      visual: { kind: "photo", layout: "full", image: ROOM, focus: [470, 930] },
    },
  ],
};
