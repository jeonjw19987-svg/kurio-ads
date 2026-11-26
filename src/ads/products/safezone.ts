import type { AdScene, CutVisual, Placement, ProductAd, Rect } from "../template/types";
import { adAMoonJar } from "./a-moon-jar";
import { adBTraditionalGat } from "./b-traditional-gat";
import { adCGotaeGat } from "./c-gotae-gat";
import { adDTigerMagpie } from "./d-tiger-magpie";

/**
 * SAFEZONE delivery (2026-11-26): A–D on design "v8" — every caption inside Reels, Stories and the Feed 4:5 crop
 * (tokens.ts → CAPTION_V8, PLACEMENTS). Lines, type, motion, end card and sound are FINAL2's.
 *
 * Images. FINAL2 was rendered on another computer; only A's ① ② ④ sources are on this one (a-moon-jar.ts, v8).
 * Every other cut is a "final2" cut (types.ts): FINAL2's own frames of that cut, frame for frame — the same picture,
 * detail and camera as delivered — with FINAL2's old caption area covered by the cut's clean first frame moving through
 * FINAL2's camera (public/assets/SAFEZONE_plates/, tools/composite/safezone-plates.mjs). The FINAL2 masters are copied
 * to public/assets/SAFEZONE_final2/ (git-ignored). `focus` is FINAL2's push-in origin on screen, computed below from
 * FINAL2's layout data (commit daa87ed). Cuts that the new caption position meets move down with it (`shift`).
 * The product files (a-moon-jar.ts …) hold the same v8 layout on the original sources, for a computer that has them.
 *
 * Letters follow the SAFEZONE request: A moon jar, B traditional gat, C GOTAE, D tiger & magpie (FINAL2's B and D
 * were the other way round).
 */

type Pt = [number, number];
const MASTER = {
  A: "assets/SAFEZONE_final2/FINAL2_A_moon_jar.mp4",
  B: "assets/SAFEZONE_final2/FINAL2_B_traditional_gat.mp4",
  C: "assets/SAFEZONE_final2/FINAL2_C_gotae.mp4",
  D: "assets/SAFEZONE_final2/FINAL2_D_tiger_magpie.mp4",
} as const;
/** Clean first frame: 1080 × 1920; ③ layers carry 24 px more on the right for the drift (edge column repeated). */
const plate = (name: string, wide: boolean) => ({ src: `assets/SAFEZONE_plates/${name}.png`, width: wide ? 1104 : 1080, height: 1920 });

// FINAL2's push-in origins on screen, from its layout rules (VisualsV5 / Visuals, SOFT.top 500).
const soft = (crop: Rect, focus: Pt): Pt => {
  const s = Math.max(1080 / crop.w, (1920 - 500) / crop.h);
  return [(1080 - crop.w * s) / 2 - crop.x * s + focus[0] * s, 500 - crop.y * s + focus[1] * s];
};
const full = (w: number, h: number, focus: Pt): Pt => {
  const s = Math.max(1080 / w, 1920 / h);
  return [(1080 - w * s) / 2 + focus[0] * s, (1920 - h * s) / 2 + focus[1] * s];
};
const placed = (p: Placement, focus: Pt): Pt => [p.left + focus[0] * p.scale, p.top + focus[1] * p.scale];
const THIRD = { pushIn: 1.03, drift: [-16, 0] as Pt };

/**
 * FINAL2's old caption area (FINAL2 frame px) that the clean frame covers: the caption's last line + its 26 px rise-in
 * + its 28 px halo, + the 60 px feather. ① (name block + one line), and ②–④ by line count.
 */
const UNTIL = { first: 560, lines1: 485, lines2: 560, lines3: 630 } as const;

const cut = (
  ad: keyof typeof MASTER,
  index: number,
  name: string,
  origin: Pt,
  patchUntil: number,
  extra: { shift?: number; camera?: typeof THIRD } = {},
): CutVisual => ({
  kind: "final2",
  video: MASTER[ad],
  from: index * 90,
  plate: plate(name, Boolean(extra.camera)),
  focus: origin,
  patchUntil,
  shift: extra.shift,
  ...extra.camera,
});

const withVisuals = (ad: ProductAd, visuals: (CutVisual | null)[]): ProductAd => ({
  ...ad,
  compositionId: `${ad.compositionId}-SZ`,
  design: "v8",
  scenes: ad.scenes.map((scene, i): AdScene => (visuals[i] ? { ...scene, visual: visuals[i] } : scene)) as ProductAd["scenes"],
});

/** A: ① ② ④ from the sources (a-moon-jar.ts, v8 — ① the jar lowered under the name block); ③ FINAL2, lowered 91 px. */
export const adAMoonJarSZ = withVisuals(adAMoonJar, [
  null,
  null,
  cut("A", 2, "A_03_making", soft({ x: 724, y: 0, w: 716, h: 900 }, [1180, 200]), UNTIL.lines2, { shift: 91, camera: THIRD }),
  null,
]);

/** B: ③ lowered 91 px (the iron and the hands keep their distance to the line); ① ② ④ where they were. */
export const adBTraditionalGatSZ = withVisuals(adBTraditionalGat, [
  cut("B", 0, "B_01_product", placed({ scale: 1.7, left: -74, top: 470 }, [361, 300]), UNTIL.first),
  cut("B", 1, "B_02_detail", soft({ x: 372, y: 239, w: 1250, h: 1621 }, [997, 1049]), UNTIL.lines2),
  cut("B", 2, "B_03_making", soft({ x: 833, y: 100, w: 1370, h: 1676 }, [1300, 700]), UNTIL.lines2, { shift: 91, camera: THIRD }),
  cut("B", 3, "B_04_in_place", placed({ scale: 1.15, left: 125, top: 427 }, [361, 300]), UNTIL.lines1),
]);

/** C: every picture where it was (the set sits centred between the caption and the Reels UI; ②–④ stay inside 4:5). */
export const adCGotaeGatSZ = withVisuals(adCGotaeGat, [
  cut("C", 0, "C_01_product", placed({ scale: 1.4, left: 10, top: 669 }, [378, 180]), UNTIL.first),
  cut("C", 1, "C_02_detail", soft({ x: 120, y: 0, w: 760, h: 1000 }, [520, 600]), UNTIL.lines3),
  cut("C", 2, "C_03_making", soft({ x: 90, y: 0, w: 570, h: 750 }, [375, 420]), UNTIL.lines1, { camera: THIRD }),
  cut("C", 3, "C_04_in_place", soft({ x: 0, y: 0, w: 522, h: 654 }, [300, 360]), UNTIL.lines1),
]);

/** D: ① lowered 90 px under the name block (the stand stays inside 4:5); ③ lowered 91 px; ② ④ where they were. */
export const adDTigerMagpieSZ = withVisuals(adDTigerMagpie, [
  cut("D", 0, "D_01_product", full(1080, 1920, [552, 950]), UNTIL.first, { shift: 90 }),
  cut("D", 1, "D_02_detail", soft({ x: 0, y: 300, w: 1882, h: 2474 }, [960, 1400]), UNTIL.lines2),
  cut("D", 2, "D_03_making", soft({ x: 0, y: 0, w: 941, h: 1237 }, [525, 990]), UNTIL.lines1, { shift: 91, camera: THIRD }),
  cut("D", 3, "D_04_in_place", full(1882, 3344, [940, 1860]), UNTIL.lines1),
]);

export const SAFEZONE_ADS = [adAMoonJarSZ, adBTraditionalGatSZ, adCGotaeGatSZ, adDTigerMagpieSZ];
