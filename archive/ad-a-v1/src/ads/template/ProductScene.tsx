import React from "react";
import { AbsoluteFill } from "remotion";
import { Caption } from "./Caption";
import { ShotImage } from "./ShotImage";
import { COLORS, LAYOUT } from "./tokens";
import type { AdScene } from "./types";

/** One content cut: ground colour, the editorial image frame, and the caption at its fixed place. */
export const ProductScene: React.FC<{ scene: AdScene; captionIntro: "none" | "fade" }> = ({ scene, captionIntro }) => {
  const { frame, diptychGap } = LAYOUT;
  const { layout } = scene;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ground }}>
      {layout.kind === "single" ? (
        <ShotImage shot={layout.shot} width={frame.width} height={frame.height} style={{ left: frame.left, top: frame.top }} />
      ) : (
        <>
          <ShotImage
            shot={layout.top}
            width={frame.width}
            height={(frame.height - diptychGap) / 2}
            style={{ left: frame.left, top: frame.top }}
          />
          <ShotImage
            shot={layout.bottom}
            width={frame.width}
            height={(frame.height - diptychGap) / 2}
            style={{ left: frame.left, top: frame.top + (frame.height + diptychGap) / 2 }}
          />
        </>
      )}
      <Caption headline={scene.caption.headline} label={scene.caption.label} intro={captionIntro} />
    </AbsoluteFill>
  );
};
