import type { ProductAd } from "../template/types";
import { coverSilhouette } from "./a-moon-jar.silhouette";

/**
 * Ad A — WA YU JAE (와유재) white porcelain moon jar, by Shin Dong-beom (Shindongbeom Ceramic Studio). v2, 2026-11-26.
 * Product page: https://wayujae.com/shop/?idx=115
 *
 * Photos: WA YU JAE's own photos, already registered in the KURIO site project
 * (kurio-public-web/media/products/p-wayujae-white-moon-jar/), copied unchanged — no colour grading or retouching.
 * Basis: KURIO site owner's decision of 2026-11-25 (`publishDecision`, US demand test 01) — NOT written
 * permission from WA YU JAE or the potter. Get that permission before this runs as a public ad.
 */

const COVER = { src: "products/a-moon-jar/01-cover.jpg", width: 3000, height: 3000 } as const;
const DETAIL = { src: "products/a-moon-jar/02-detail.png", width: 1440, height: 900 } as const;

export const adAMoonJar: ProductAd = {
  code: "A",
  compositionId: "KURIO-AD-A-MOON-JAR",
  productName: "Korean moon jar",
  scenes: [
    {
      role: "PRODUCT",
      id: "s01-product",
      caption: { text: "Shaped like the moon.", productName: "Korean moon jar (dalhangari)" },
      visual: { kind: "cutout", image: COVER, silhouette: coverSilhouette },
    },
    {
      role: "DETAIL",
      id: "s02-detail",
      // Non-breaking space keeps the dash at the end of line 1, not the start of line 2.
      caption: { text: "An 18th-century Joseon form — never perfectly round." },
      // Rim, shoulder curve and the semi-matte glaze catching light; the right-hand silhouette stays in view.
      visual: { kind: "cutout", image: COVER, silhouette: coverSilhouette, focus: [1900, 1300] },
    },
    {
      role: "MAKING",
      id: "s03-making",
      // Storyboard line "Thrown in two halves, joined by hand" is NOT used: WA YU JAE's page does not say how the
      // jar is formed (two halves or one piece), and joining halves is usually a large-jar method. Replacement,
      // from the page's own words ("도예가가 처음부터 끝까지 손으로 빚고 직접 만든 유약을 입힌 백자 화병"):
      caption: { text: "Shaped by hand, glazed by the potter." },
      // Store detail photo, left half only: glossy glaze inside and the rings left by shaping.
      // x 4–716: drops the store file's light edge column and the white divider between its two halves.
      visual: { kind: "bleed", image: DETAIL, crop: { x: 4, y: 0, w: 712, h: 900 } },
    },
    {
      role: "IN PLACE",
      id: "s04-in-place",
      caption: { text: "Quiet on a console." },
      // No cleared photo of this jar in a home. Not replaced by a product close-up or a generated room.
      visual: { kind: "missing", need: "This moon jar on a console or shelf in a modern home — real photo, not yet supplied" },
    },
  ],
  imageSources: [
    {
      file: "public/products/a-moon-jar/01-cover.jpg",
      sourceUrl: "https://cdn.imweb.me/upload/S20241015519c1144276b8/454902a9bbc08.jpg",
      source: "wayujae.com/shop/?idx=115 — description, '16cm Semi-matte' option box",
      basis: "KURIO owner's publishDecision 2026-11-25; permission from WA YU JAE: unverified",
      note: "① and ②. Cut out along a traced silhouette (tools/trace-silhouette.cjs); the jar's own pixels are unchanged.",
    },
    {
      file: "public/products/a-moon-jar/02-detail.png",
      sourceUrl: "https://cdn.imweb.me/upload/S20241015519c1144276b8/b9bbf1a24010e.png",
      source: "wayujae.com/shop/?idx=115 — description, '| Detail' section",
      basis: "KURIO owner's publishDecision 2026-11-25; permission from WA YU JAE: unverified",
      note: "③, left half (inside of the jar). Shown at 1.5× — the store file is 1440 × 900.",
    },
  ],
};
