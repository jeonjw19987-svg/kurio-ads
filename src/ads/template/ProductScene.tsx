import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Caption } from "./Caption";
import { CLIP_FADE, COLORS, VIDEO } from "./tokens";
import type { AdScene } from "./types";
import { CutVisualView } from "./Visuals";

/** A generated clip (Higgsfield) filling the frame. Its own camera move is kept; no extra push-in. */
const ClipView: React.FC<{ src: string; trimSec: number }> = ({ src, trimSec }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Video
        src={staticFile(src)}
        muted
        objectFit="cover"
        trimBefore={Math.round(trimSec * fps)}
        style={{ width: VIDEO.width, height: VIDEO.height }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          width: VIDEO.width,
          top: CLIP_FADE.from,
          height: VIDEO.height - CLIP_FADE.from,
          background: `linear-gradient(to bottom, rgba(244, 241, 236, 0) 0px, rgba(244, 241, 236, 0.6) ${(CLIP_FADE.to - CLIP_FADE.from) * 0.55}px, ${COLORS.ground} ${CLIP_FADE.to - CLIP_FADE.from}px, ${COLORS.ground} 100%)`,
        }}
      />
    </>
  );
};

/**
 * One content cut: the generated clip if its slot has a file, otherwise the fallback visual;
 * then the caption at its fixed place (same for clips and fallbacks).
 */
export const ProductScene: React.FC<{ scene: AdScene; clip: string | null }> = ({ scene, clip }) => (
  <AbsoluteFill style={{ backgroundColor: COLORS.ground }}>
    {clip ? <ClipView src={clip} trimSec={scene.clipTrimSec ?? 0} /> : <CutVisualView role={scene.role} visual={scene.visual} />}
    <Caption text={scene.caption.text} productName={scene.caption.productName} fromFirstFrame={scene.role === "PRODUCT"} />
  </AbsoluteFill>
);

/** Start image for Higgsfield: the cut's fallback visual at frame 0, without caption. */
export const KeyframeScene: React.FC<{ scene: AdScene; productScene: AdScene }> = ({ scene, productScene }) => (
  <AbsoluteFill style={{ backgroundColor: COLORS.ground }}>
    {/* A cut with nothing yet (④) gets the product on the stage as its reference image. */}
    <CutVisualView
      role={scene.visual.kind === "missing" ? productScene.role : scene.role}
      visual={scene.visual.kind === "missing" ? productScene.visual : scene.visual}
    />
  </AbsoluteFill>
);
