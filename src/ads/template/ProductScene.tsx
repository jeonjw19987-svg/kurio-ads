import React from "react";
import { AbsoluteFill } from "remotion";
import { Caption } from "./Caption";
import { COLORS } from "./tokens";
import type { AdScene } from "./types";
import { CutVisualView } from "./Visuals";

/** One content cut: off-white ground, the visual for its role, and the caption at its fixed place. */
export const ProductScene: React.FC<{ scene: AdScene }> = ({ scene }) => (
  <AbsoluteFill style={{ backgroundColor: COLORS.ground }}>
    <CutVisualView role={scene.role} visual={scene.visual} />
    <Caption text={scene.caption.text} productName={scene.caption.productName} fromFirstFrame={scene.role === "PRODUCT"} />
  </AbsoluteFill>
);
