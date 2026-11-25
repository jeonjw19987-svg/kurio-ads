import type { ProductAd } from "../template/types";

/**
 * Ad A — Korean moon jar (white porcelain). v4, 2026-11-26 — the design baseline for B, C and D.
 *
 * Images are NOT in this repository (see RENDER_GUIDE.md → "Assets not in this repo"); they are expected at the
 * paths below. Two planner files carry a doubled extension on disk (".png.png"); the paths use the real names.
 * Images are only cropped, placed and pushed in slowly — never generated, retouched or colour-graded here.
 * Source and rights records: docs/internal/PRODUCT_SOURCES.md (local, not public).
 */

const DIR = "assets/A_moonjar";
const PRODUCT = { src: `${DIR}/01_product_v4.png.png`, width: 941, height: 1672 } as const;
const MAKING = { src: `${DIR}/03_making.png`, width: 384, height: 492 } as const;
const IN_PLACE = { src: `${DIR}/04_in_place_v4.png.png`, width: 941, height: 1672 } as const;
// 02_detail.png (385 × 487) is this file's left half scaled to 0.54×. The original pixels are used so the
// close-up is not enlarged from a thumbnail: same photo, same crop, 1.9× the resolution.
const DETAIL_ORIGINAL = { src: "products/a-moon-jar/02-detail.png", width: 1440, height: 900 } as const;

export const adAMoonJar: ProductAd = {
  code: "A",
  compositionId: "KURIO-AD-A-MOON-JAR",
  slug: "a-moon-jar",
  productName: "Korean moon jar",
  status: "final",
  scenes: [
    {
      role: "PRODUCT",
      id: "s01-product",
      caption: { title: "Korean moon jar.", subtitle: "Dalhangari.", body: ["Shaped like the moon."] },
      // Full frame: the jar's centre sits below the frame's centre, the caption on the light backdrop above it.
      // Push-in centred near the rim, so the jar grows downward and never towards the caption.
      visual: { kind: "photo", layout: "full", image: PRODUCT, focus: [468, 600] },
    },
    {
      role: "DETAIL",
      id: "s02-detail",
      caption: { body: ["An 18th-century Joseon form —", "never perfectly round."] },
      // Inside the jar: glossy pale-blue glaze, the rings left by shaping, the white rim curving across the bottom.
      // x 4–716 drops the store file's light edge column and the divider between its two halves.
      visual: { kind: "photo", layout: "plate", image: DETAIL_ORIGINAL, crop: { x: 4, y: 0, w: 712, h: 900 }, focus: [380, 560] },
    },
    {
      role: "MAKING",
      id: "s03-making",
      // "Thrown in two halves, joined by hand" (storyboard) is NOT used: WA YU JAE's page does not say how the jar
      // is formed, and joining halves is usually a large-jar method. This line is the page's own wording
      // ("도예가가 처음부터 끝까지 손으로 빚고 직접 만든 유약을 입힌 백자 화병").
      caption: { body: ["Shaped by hand,", "glazed by the potter."] },
      // The potter's hands shaping the jar on the wheel — face already removed in the supplied file.
      // The round body sits where ②'s rim curve was: form leads to form across the hard cut.
      visual: { kind: "photo", layout: "plate", image: MAKING, focus: [215, 245] },
    },
    {
      role: "IN PLACE",
      id: "s04-in-place",
      caption: { body: ["Quiet on a console."] },
      // Full frame: caption on the sunlit wall, clear of the jar and the dark console.
      visual: { kind: "photo", layout: "full", image: IN_PLACE, focus: [452, 1040] },
    },
  ],
};
