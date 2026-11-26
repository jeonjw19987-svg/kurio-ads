import type { ProductAd } from "../template/types";

/**
 * Ad D — Tiger & Magpie mother-of-pearl plate (najeonchilgi, a decorative plate, Ø 18 cm, with its stand; 박씨상방).
 * FINAL, 2026-11-26 (final copy review), design "v6" — the same typography (SUIT content type, ① caption raised),
 * motion, cuts, end card and sound as A, B and C.
 *
 * Images (not in this repository): public/assets/D_najeon/. The scenes are the operator's v3 compositions; wherever the
 * plate appears it is the seller's own photograph of this plate:
 * - ① 01_product_v3.png     1080 × 1920  the seller's front photo on its stand (the operator removed the lamp and book
 *                                         behind it; no embedded provenance data). The motif matches the seller's.
 * - ② 02_detail_final.png   1882 × 3344  composite: the operator's AI-generated scene (02_detail_v3, ChatGPT) with its
 *                                         redrawn plate replaced by the seller's top-down photo of the plate, mapped onto
 *                                         the plate's face (tools/composite/d-plate.mjs).
 * - ③ 03_making_v3.png       941 × 1672  AI-generated (ChatGPT) illustration of mother-of-pearl inlay: an orchid, not
 *                                         this plate, not this maker. The line speaks of the craft in general.
 * - ④ 04_in_place_final.png 1882 × 3344  composite: the operator's AI-generated room (04_in_place_v3, ChatGPT) with the
 *                                         plate replaced by the seller's top-down photo and the stand's legs by the
 *                                         seller's front photo on its stand (each leg moved onto the AI leg it replaces).
 * The composites only resample and mask the seller's pixels — no retouching, recolouring or generated detail on the
 * product. Sources, rights and the C2PA records: docs/internal/PRODUCT_SOURCES_BCD.md (local, not public).
 *
 * Copy (seller's page, checked 2026-11-26): 나전칠기 장식용 쟁반 (a decorative mother-of-pearl lacquer plate, not a minhwa
 * painting on hanji), mother-of-pearl and wood, Ø 180 mm, made in Korea (박씨상방), "Handmade"; the tiger drives away
 * bad luck, the magpie brings good news (길상과 수호).
 */

const DIR = "assets/D_najeon";
const HERO = { src: `${DIR}/01_product_v3.png`, width: 1080, height: 1920 } as const;
const LYING = { src: `${DIR}/02_detail_final.png`, width: 1882, height: 3344 } as const;
const INLAY = { src: `${DIR}/03_making_v3.png`, width: 941, height: 1672 } as const;
const ROOM = { src: `${DIR}/04_in_place_final.png`, width: 1882, height: 3344 } as const;

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
      caption: { title: "Tiger & Magpie.", subtitle: "Najeonchilgi.", body: ["Korean mother-of-pearl plate."] },
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
      // just above the rim, the warm surface continuing behind the caption. Ink caption on the light field.
      visual: { kind: "photo", layout: "soft", image: LYING, crop: { x: 0, y: 300, w: 1882, h: 2474 }, focus: [960, 1400] },
    },
    {
      role: "MAKING",
      id: "s03-making",
      // The craft in general, not this plate's making (the image is an illustration of the technique).
      caption: { body: ["The art of mother-of-pearl inlay."], tone: "paper" },
      // Soft from the image's top: the black lacquer continues behind the caption (white caption), the tool and the
      // inlay below it. Same camera as every ③ (3% push-in, 16 px drift), centred on the tool's tip.
      visual: { kind: "photo", layout: "soft", image: INLAY, crop: { x: 0, y: 0, w: 941, h: 1237 }, focus: [525, 990], pushIn: 1.03, drift: [-16, 0] },
    },
    {
      role: "IN PLACE",
      id: "s04-in-place",
      caption: { body: ["A wish for good fortune."] },
      // 9:16 with the wall above the plate → full frame, like A's ④; the line sits on the wall.
      visual: { kind: "photo", layout: "full", image: ROOM, focus: [940, 1860] },
    },
  ],
};
