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
 *                                ground: 01_wall_cutout.png, npm run composite:e) and ④ (as photographed)
 * - 02_shelf.jpg    1428 × 1428  the clock on a metal shelf, books and a paper lantern — ③
 * - 03_detail.jpg   1320 × 1320  the black wooden centre over the patterned acrylic, close — ②
 * - 05_box.jpg      1320 × 1320  in its round box (not used; kept for review)
 * Not used: the page's photo with another publisher's book title large in frame.
 *
 * Copy (the page's detail image, read 2026-11-26): "GAT Wall Clock" reinterprets the heukrip (black gat) as an
 * interior object, inspired by national-museum artifacts; no hands — two acrylic layers patterned with straight and
 * curved lines turn as the hour and minute hands, their overlap making a moiré; precision laser and micro machining;
 * acrylic, solid wood, movement, neodymium magnets; 150 × 150 × 62 mm; made in Korea.
 * ④ "On the wall, keeping time." is the planner's line (2026-11-26); ①–③ follow the A–D pattern from those facts.
 * No price, maker name, warranty or museum affiliation claim. Image permission: none (owner's decision, as A–D).
 */

const DIR = "assets/E_gat_clock";
const WALL = { src: `${DIR}/01_wall.jpg`, width: 1428, height: 1428 } as const;
const SHELF = { src: `${DIR}/02_shelf.jpg`, width: 1428, height: 1428 } as const;
const CLOSE = { src: `${DIR}/03_detail.jpg`, width: 1320, height: 1320 } as const;
/** ①: the wall photo lifted onto COLORS.ground (tools/composite/e-clock.mjs); clock box x 346 y 386 w 701 h 760. */
const CUTOUT = { src: `${DIR}/01_wall_cutout.png`, width: 1428, height: 1428 } as const;

export const adEGatClock: ProductAd = {
  code: "E",
  compositionId: "KURIO-AD-E-GAT-CLOCK",
  slug: "e-gat-clock",
  productName: "GAT Wall Clock",
  status: "final",
  design: "v7",
  scenes: [
    {
      role: "PRODUCT",
      id: "s01-product",
      caption: { title: "Korean gat wall clock.", subtitle: "Gat sigye.", body: ["No hands. Two layers turn."] },
      // The clock on KURIO's ground, ×1.1: the disc ~770 px wide, centred, its middle near y 920 — below the caption
      // block, the disc's lower edge above the Reels UI (y 1248); only its soft shadow continues below.
      visual: { kind: "photo", layout: "full", image: CUTOUT, cutout: true, placement: { scale: 1.1, left: -226, top: 75 }, focus: [696, 720] },
    },
    {
      role: "DETAIL",
      id: "s02-detail",
      // The black wooden centre rising from the brim-like disc: the gat's crown and brim. The light wall above
      // continues out of focus behind the caption.
      caption: { body: ["Inspired by the gat,", "the hat of Joseon scholars."] },
      visual: { kind: "photo", layout: "soft", image: CLOSE, crop: { x: 0, y: 40, w: 958, h: 1260 }, focus: [350, 520] },
    },
    {
      role: "MAKING",
      id: "s03-making",
      // The patterned acrylic disc and the wooden centre, front on. Same camera as every ③ (3% push-in, 16 px drift).
      caption: { body: ["Precision-cut acrylic,", "solid wood."] },
      visual: { kind: "photo", layout: "soft", image: SHELF, crop: { x: 190, y: 200, w: 934, h: 1228 }, focus: [657, 657], pushIn: 1.03, drift: [-16, 0] },
    },
    {
      role: "IN PLACE",
      id: "s04-in-place",
      // The same wall photo as ①, as photographed: the clock on its plain wall, full frame.
      caption: { body: ["On the wall, keeping time."] },
      visual: { kind: "photo", layout: "full", image: WALL, focus: [696, 720] },
    },
  ],
};
