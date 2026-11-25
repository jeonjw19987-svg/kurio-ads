import type { ProductAd } from "../template/types";

/**
 * Ad A — WA YU JAE (와유재) white porcelain moon jar, by Shin Dong-beom (Shindongbeom Ceramic Studio).
 * Product page: https://wayujae.com/shop/?idx=115
 *
 * Photos: the three WA YU JAE photos already registered in the KURIO site project
 * (kurio-public-web/media/products/p-wayujae-white-moon-jar/), copied unchanged to public/products/a-moon-jar/.
 * Basis: KURIO site owner's decision of 2026-11-25 (US demand test 01, `publishDecision` in
 * content/catalog/us-demand-test.ts) — NOT written permission from WA YU JAE or the potter.
 * No colour grading, no retouching: only crops and slow camera moves.
 *
 * Crops are in each source image's own pixels. The frame is 888 × 1040 (single) or 888 × 508 (each diptych half).
 */

const COVER = { src: "products/a-moon-jar/01-cover.jpg", width: 3000, height: 3000 } as const;
const DETAIL = { src: "products/a-moon-jar/02-detail.png", width: 1440, height: 900 } as const;
const TEXTURE = { src: "products/a-moon-jar/03-texture.jpg", width: 2983, height: 2983 } as const;

export const adAMoonJar: ProductAd = {
  code: "A",
  compositionId: "KURIO-AD-A-MOON-JAR",
  productName: "Korean Moon Jar",
  scenes: [
    {
      id: "s01-shaped-like-the-moon",
      caption: { headline: "Shaped like the moon.", label: "Korean Moon Jar" },
      // Whole jar, centred, with room around it. Very slow push-in.
      layout: { kind: "single", shot: { ...COVER, crop: { x: 432, y: 335, w: 2135, h: 2500 }, motion: "push-in" } },
    },
    {
      id: "s02-beauty-in-imperfection",
      caption: { headline: "Beauty in imperfection." },
      // Close on the rim, the shoulder's curve and the semi-matte surface catching light.
      layout: { kind: "single", shot: { ...COVER, crop: { x: 1350, y: 450, w: 1200, h: 1405 }, motion: "drift-left" } },
    },
    {
      id: "s03-handcrafted-in-korea",
      caption: { headline: "Handcrafted in Korea." },
      // The store's detail photo: glossy glaze and throwing rings inside; the potter's mark in the foot ring.
      layout: {
        kind: "diptych",
        top: { ...DETAIL, crop: { x: 0, y: 330, w: 718, h: 411 }, motion: "drift-right" },
        bottom: { ...DETAIL, crop: { x: 724, y: 236, w: 716, h: 410 }, motion: "drift-left" },
      },
    },
    {
      id: "s04-a-quiet-statement",
      caption: { headline: "A quiet statement for your home." },
      // The only photo of a jar in a real space (WA YU JAE's shop, the 24 cm size). Slow pull-back.
      layout: { kind: "single", shot: { ...TEXTURE, crop: { x: 300, y: 0, w: 2548, h: 2983 }, motion: "pull-back" } },
    },
  ],
  imageSources: [
    {
      file: "public/products/a-moon-jar/01-cover.jpg",
      sourceUrl: "https://cdn.imweb.me/upload/S20241015519c1144276b8/454902a9bbc08.jpg",
      source: "wayujae.com/shop/?idx=115 — description, '16cm Semi-matte' option box",
      basis: "KURIO owner's publishDecision 2026-11-25; permission from WA YU JAE: unverified",
      note: "Used in scenes 01 and 02.",
    },
    {
      file: "public/products/a-moon-jar/02-detail.png",
      sourceUrl: "https://cdn.imweb.me/upload/S20241015519c1144276b8/b9bbf1a24010e.png",
      source: "wayujae.com/shop/?idx=115 — description, '| Detail' section",
      basis: "KURIO owner's publishDecision 2026-11-25; permission from WA YU JAE: unverified",
      note: "Scene 03. Two-panel store image (inside glaze; base with initials), each half cropped separately.",
    },
    {
      file: "public/products/a-moon-jar/03-texture.jpg",
      sourceUrl: "https://cdn.imweb.me/upload/S20241015519c1144276b8/7e9bcd01ab86f.jpg",
      source: "wayujae.com/shop/?idx=115 — description, '24cm Semi-matte' option box",
      basis: "KURIO owner's publishDecision 2026-11-25; permission from WA YU JAE: unverified",
      note: "Scene 04. Shows the 24 cm size in the store's space, not a home.",
    },
  ],
};
