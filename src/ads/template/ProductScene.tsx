import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Caption } from "./Caption";
import { COLORS, VIDEO } from "./tokens";
import type { AdScene } from "./types";
import { CutVisualView } from "./Visuals";

/**
 * A generated clip (Higgsfield) covering the frame. Its own camera move is kept; no extra push-in.
 * Generation rule: the top quarter must stay light and calm, because the caption sits there.
 */
const ClipView: React.FC<{ src: string; trimSec: number }> = ({ src, trimSec }) => {
  const { fps } = useVideoConfig();
  return (
    <Video
      src={staticFile(src)}
      muted
      objectFit="cover"
      trimBefore={Math.round(trimSec * fps)}
      style={{ width: VIDEO.width, height: VIDEO.height }}
    />
  );
};

/** One content cut: the clip if its slot has a file, otherwise the still image; then the caption. */
export const ProductScene: React.FC<{ scene: AdScene; clip: string | null }> = ({ scene, clip }) => (
  <AbsoluteFill style={{ backgroundColor: COLORS.ground }}>
    {clip ? <ClipView src={clip} trimSec={scene.clipTrimSec ?? 0} /> : <CutVisualView role={scene.role} visual={scene.visual} />}
    <Caption
      title={scene.caption.title}
      subtitle={scene.caption.subtitle}
      body={scene.caption.body}
      fromFirstFrame={scene.role === "PRODUCT"}
    />
  </AbsoluteFill>
);

/** Start image for Higgsfield: the cut's image at frame 0, without caption. */
export const KeyframeScene: React.FC<{ scene: AdScene; productScene: AdScene }> = ({ scene, productScene }) => (
  <AbsoluteFill style={{ backgroundColor: COLORS.ground }}>
    {/* A cut with nothing yet gets the product image as its reference. */}
    <CutVisualView
      role={scene.visual.kind === "missing" ? productScene.role : scene.role}
      visual={scene.visual.kind === "missing" ? productScene.visual : scene.visual}
    />
  </AbsoluteFill>
);
