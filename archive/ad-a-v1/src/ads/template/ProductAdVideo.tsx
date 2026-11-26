import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { EndCard } from "./EndCard";
import { ProductScene } from "./ProductScene";
import { COLORS, VIDEO } from "./tokens";
import type { ProductAd } from "./types";

/**
 * The KURIO 15-second product ad: 4 content cuts + the shared end card, 90 frames each, hard cuts.
 * Silent (v1). Same structure for A, B, C and D — only the product data changes.
 */
export const ProductAdVideo: React.FC<{ ad: ProductAd }> = ({ ad }) => {
  const cut = VIDEO.sceneFrames;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ground }}>
      {ad.scenes.map((scene, i) => (
        <Sequence key={scene.id} name={`${String(i + 1).padStart(2, "0")} ${scene.caption.headline}`} from={i * cut} durationInFrames={cut}>
          {/* First cut: caption on screen from frame 0 so the opening frame already reads. */}
          <ProductScene scene={scene} captionIntro={i === 0 ? "none" : "fade"} />
        </Sequence>
      ))}
      <Sequence name="05 End card" from={4 * cut} durationInFrames={cut}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};
