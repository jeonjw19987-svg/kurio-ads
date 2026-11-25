import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { EndCard } from "./EndCard";
import { ProductScene } from "./ProductScene";
import { COLORS, VIDEO } from "./tokens";
import type { ProductAd } from "./types";

/**
 * The KURIO 15-second product ad: ① PRODUCT ② DETAIL ③ MAKING ④ IN PLACE ⑤ END CARD, 90 frames each,
 * hard cuts only, silent. Same structure for A, B, C and D — only the product data changes.
 *
 * withEndCard=false → the 12-second body (①–④). The delivered MP4 is this body joined, without
 * re-encoding, to the end-card master rendered once (tools/render-ad.mjs).
 * withEndCard=true → the full 15 s, for previewing in Studio.
 */
export const ProductAdVideo: React.FC<{ ad: ProductAd; withEndCard: boolean }> = ({ ad, withEndCard }) => {
  const cut = VIDEO.sceneFrames;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ground }}>
      {ad.scenes.map((scene, i) => (
        <Sequence key={scene.id} name={`${i + 1} ${scene.role}`} from={i * cut} durationInFrames={cut}>
          <ProductScene scene={scene} />
        </Sequence>
      ))}
      {withEndCard ? (
        <Sequence name="5 END CARD" from={4 * cut} durationInFrames={cut}>
          <EndCard />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
