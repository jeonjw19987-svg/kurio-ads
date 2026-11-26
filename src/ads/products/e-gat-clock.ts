import type { ProductAd } from "../template/types";

/**
 * Ad E — GAT Wall Clock (갓 벽시계), sold at the MU:DS museum shop (museumshop.or.kr). Added 2026-11-26 (owner's
 * request): the homepage's ad piece C since that day, in place of GOTAE's set (deleted from the site). Design "v7",
 * same template, type, motion, end card ("Shop now") and sound as A–D — only the images and lines differ.
 *
 * Images (not in this repository): public/assets/E_gat_clock/. The museum shop sends automated browsers to a block
 * page (not bypassed), so the owner saved the page's images; the homepage cut the photos out of them and enlarged them
 * 2x (Lanczos + a light sharpen, no AI). These are the homepage's files (media/products/p-muds-gat-wall-clock/):
 * - 01_wall.jpg     1428 × 1428  the clock on a plain wall (from the page's detail image) — ① (lifted onto KURIO's
 *                                ground: 01_wall_cutout.png, npm run composite:e)
 * - 02_shelf.jpg    1428 × 1428  the clock on a metal shelf, books and a paper lantern (v1 ③; not used in v2)
 * - 03_detail.jpg   1320 × 1320  the black wooden centre over the patterned acrylic, close — ②
 * - 05_box.jpg      1320 × 1320  in its round box (not used; kept for review)
 * - 06_lid.jpg      1320 × 1320  the tin lid with the engraved [갓] mark (homepage 06-packaging.jpg) — ③
 * - 07_room.png     1024 × 1536  the owner's image of the clock on a room wall, caption removed — ④ (see below)
 * Not used: the page's photo with another publisher's book title large in frame.
 *
 * Copy (the page's detail image, read 2026-11-26): "GAT Wall Clock" reinterprets the heukrip (black gat) as an
 * interior object, inspired by national-museum artifacts; no hands — two acrylic layers patterned with straight and
 * curved lines turn as the hour and minute hands, their overlap making a moiré; precision laser and micro machining;
 * acrylic, solid wood, movement, neodymium magnets; 150 × 150 × 62 mm; made in Korea.
 * v2 (2026-11-26, the planner's storyboard for E): ① "Korean gat wall clock." / "Gat." / "A hat that tells time."
 * ② "The gat marked a scholar’s standing." / "Now it marks the hour." ③ "Designed and made in Korea."
 * ④ "On the wall, keeping time." ⑤ the shared end card (Curious about Korea · KURIO · Shop now).
 * Images: ① the wall photo on KURIO's ground, ② the wooden crown over the brim-like disc, ③ the tin lid with the
 * engraved [갓] mark and its line pattern (06_lid.jpg, 1320 × 1320), ④ the clock mounted on a room wall beside a
 * wooden shelf — the owner's image (2026-11-26, "벽에 직접 설치된 미니멀 시계.png", 1024 × 1536), saved as
 * 07_room_original.png; 07_room.png is the same image with the caption its generator baked in removed
 * (tools/composite/e-room.mjs, npm run composite:e-room), because the template draws that caption itself.
 * No price, maker name, warranty or museum affiliation claim. Image permission: none (owner's decision, as A–D).
 * SAFEZONE (2026-11-26, Meta placements Reels · Stories · Feed 4:5 crop, as A–D): design "v8" — every caption from
 * y ≈ 391. ① the clock moves down 170 px under the name block, same size (disc y ≈ 670–1450, inside the 4:5 crop);
 * ② ③ ④: caption only.
 */

const DIR = "assets/E_gat_clock";
/** ④: the owner's room image without its baked caption (tools/composite/e-room.mjs). */
const ROOM = { src: `${DIR}/07_room.png`, width: 1024, height: 1536 } as const;
const LID = { src: `${DIR}/06_lid.jpg`, width: 1320, height: 1320 } as const;
const CLOSE = { src: `${DIR}/03_detail.jpg`, width: 1320, height: 1320 } as const;
/** ①: the wall photo lifted onto COLORS.ground (tools/composite/e-clock.mjs); clock box x 346 y 386 w 701 h 760. */
const CUTOUT = { src: `${DIR}/01_wall_cutout.png`, width: 1428, height: 1428 } as const;

export const adEGatClock: ProductAd = {
  code: "E",
  compositionId: "KURIO-AD-E-GAT-CLOCK",
  slug: "e-gat-clock",
  productName: "GAT Wall Clock",
  status: "final",
  design: "v8",
  scenes: [
    {
      role: "PRODUCT",
      id: "s01-product",
      caption: { title: "Korean gat wall clock.", subtitle: "Gat.", body: ["A hat that tells time."] },
      // The clock on KURIO's ground, ×1.1: the disc ~770 px wide, centred. v8: 170 px lower (top 75 → 245), under the
      // caption block that now ends at y ≈ 600 — clock y ≈ 670–1450, inside the 4:5 crop (FINAL2: middle near y 920).
      visual: { kind: "photo", layout: "full", image: CUTOUT, cutout: true, placement: { scale: 1.1, left: -226, top: 245 }, focus: [696, 720] },
    },
    {
      role: "DETAIL",
      id: "s02-detail",
      // The black wooden centre rising from the brim-like disc: the gat's crown and brim. The light wall above
      // continues out of focus behind the caption.
      caption: { body: ["The gat marked a scholar’s standing.", "Now it marks the hour."] },
      visual: { kind: "photo", layout: "soft", image: CLOSE, crop: { x: 0, y: 40, w: 958, h: 1260 }, focus: [350, 520] },
    },
    {
      role: "MAKING",
      id: "s03-making",
      // The tin lid: the engraved [갓] mark centred in the upper photo, the fine line pattern below.
      // Same camera as every ③ (3% push-in, slow drift).
      caption: { body: ["Designed and made in Korea."] },
      visual: { kind: "photo", layout: "soft", image: LID, crop: { x: 176, y: 40, w: 958, h: 1260 }, focus: [655, 480], pushIn: 1.03, drift: [0, -12] },
    },
    {
      role: "IN PLACE",
      id: "s04-in-place",
      // The clock mounted on the wall, a wooden shelf to its right. 2:3 source → 9:16 frame: an even 80 px off each
      // side (the plain wall left of the clock and the shelf's outer edge), so the caption keeps its wall and the
      // shelf's post stays ~70 px clear of the line's end. Push-in centred on the clock.
      caption: { body: ["On the wall, keeping time."] },
      visual: { kind: "photo", layout: "full", image: ROOM, crop: { x: 80, y: 0, w: 864, h: 1536 }, focus: [556, 868] },
    },
  ],
};
