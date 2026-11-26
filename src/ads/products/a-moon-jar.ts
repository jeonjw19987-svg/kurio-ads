import type { ProductAd } from "../template/types";

/**
 * Ad A — Korean moon jar (white porcelain). v6, 2026-11-26: v5 (planner feedback on v4) + content typography in
 * SUIT and the ① caption block raised 70 px. Design "v6" (tokens.ts → TYPE_V6, CAPTION_V6); images, crops, motion,
 * end card and sound unchanged from v5 (the v5 source is commit ffdd783).
 *
 * Images are NOT in this repository (see RENDER_GUIDE.md → "Assets not in this repo"); they are expected at the
 * paths below. Two planner files carry a doubled extension on disk (".png.png"); the paths use the real names.
 * Images are only cropped, placed and moved slowly — never generated, retouched, sharpened or colour-graded here.
 * Source and rights records: docs/internal/PRODUCT_SOURCES.md (local, not public).
 *
 * Source resolution (px, as used):
 * - ① 01_product_v4      941 × 1672 → full frame ×1.15, cropped in ×1.04 → ×1.19
 * - ② store "| Detail"   left half 712 × 900 of the 1440 × 900 original → ×1.58 (soft layout)
 * - ③ store process      right half 716 × 900 of the 1440 × 900 original → ×1.58 (v4: 384 × 492 ×2.81)
 * - ④ 04_in_place_v4     941 × 1672 → full frame ×1.15, cropped in ×1.15 → ×1.32
 */

const DIR = "assets/A_moonjar";
const PRODUCT = { src: `${DIR}/01_product_v4.png.png`, width: 941, height: 1672 } as const;
const IN_PLACE = { src: `${DIR}/04_in_place_v4.png.png`, width: 941, height: 1672 } as const;
// The store's own originals (two photos side by side, divider at x 717–722). The planner's 02_detail.png
// (385 × 487) and 03_making.png (384 × 492) are downscaled copies of these halves.
const DETAIL_ORIGINAL = { src: "products/a-moon-jar/02-detail.png", width: 1440, height: 900 } as const;
const MAKING_ORIGINAL = { src: "products/a-moon-jar/03-making.png", width: 1440, height: 900 } as const;

export const adAMoonJar: ProductAd = {
  code: "A",
  compositionId: "KURIO-AD-A-MOON-JAR",
  slug: "a-moon-jar",
  productName: "Korean moon jar",
  status: "final",
  design: "v6",
  scenes: [
    {
      role: "PRODUCT",
      id: "s01-product",
      caption: { title: "Korean moon jar.", subtitle: "Dalhangari.", body: ["Shaped like the moon."] },
      // Full frame, cropped in 4% around the rim so the jar is a little larger and grows downward, never into the
      // name block above it.
      visual: { kind: "photo", layout: "full", image: PRODUCT, focus: [468, 500], zoom: 1.04 },
    },
    {
      role: "DETAIL",
      id: "s02-detail",
      caption: { body: ["An 18th-century Joseon form —", "never perfectly round."] },
      // Inside the jar: pale-blue glaze, the rings left by shaping, the white rim across the bottom. The glaze
      // continues upward out of focus behind the caption (soft layout) — no band.
      visual: { kind: "photo", layout: "soft", image: DETAIL_ORIGINAL, crop: { x: 4, y: 0, w: 712, h: 900 }, focus: [380, 560] },
    },
    {
      role: "MAKING",
      id: "s03-making",
      // "Thrown in two halves, joined by hand" (storyboard) is NOT used: WA YU JAE's page does not say how the jar
      // is formed. This line is the page's own wording ("도예가가 처음부터 끝까지 손으로 빚고 직접 만든 유약을 입힌 백자 화병").
      // Dark workshop photo → white caption.
      caption: { body: ["Shaped by hand,", "glazed by the potter."], tone: "paper" },
      // Right half only (hands on the wheel) — the left half shows the potter's face and is never used.
      // The camera eases toward the fingers at the rim (3% push-in + a 16 px drift), so the hands feel at work.
      visual: {
        kind: "photo",
        layout: "soft",
        image: MAKING_ORIGINAL,
        crop: { x: 724, y: 0, w: 716, h: 900 },
        focus: [1180, 200],
        pushIn: 1.03,
        drift: [-16, 0],
      },
    },
    {
      role: "IN PLACE",
      id: "s04-in-place",
      // Planner's line. Alternative for review only (not used): "A quiet beauty for your home." — see adAMoonJarAltCopy.
      caption: { body: ["Quiet on a console."] },
      // Full frame, cropped in 15% from the bottom edge: the jar reads larger and sits ~110 px higher, clear of the
      // Reels caption area; the wall light and the room's proportions are kept. Push-in centred on the jar.
      visual: { kind: "photo", layout: "full", image: IN_PLACE, focus: [468, 1030], zoom: 1.15, zoomAnchor: [470, 1672] },
    },
  ],
};

/** Review only: ④ with the alternative line. Not an ad; rendered as a still for the planner to compare. */
export const adAMoonJarAltCopy: ProductAd = {
  ...adAMoonJar,
  compositionId: "KURIO-AD-A-MOON-JAR-ALT-COPY",
  status: "review",
  scenes: [
    adAMoonJar.scenes[0],
    adAMoonJar.scenes[1],
    adAMoonJar.scenes[2],
    { ...adAMoonJar.scenes[3], caption: { body: ["A quiet beauty for your home."] } },
  ],
};
