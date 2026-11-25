import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Sequence, staticFile } from "remotion";
import audio from "../audio.json";
import { EndCard } from "./EndCard";
import { ProductScene } from "./ProductScene";
import { clipPath, COLORS, VIDEO } from "./tokens";
import type { AdProps } from "./types";

/**
 * The KURIO 15-second product ad: ① PRODUCT ② DETAIL ③ MAKING ④ IN PLACE ⑤ END CARD, 90 frames each,
 * hard cuts only, silent. Same structure for A, B, C and D — only the product data and clips change.
 *
 * Cuts ①–④ show the generated clip from public/clips/<slug>/ when it exists, else the cut's still image.
 * withEndCard=false → the 12-second body. The delivered MP4 is this body joined, without re-encoding,
 * to the end-card master rendered once (tools/render-ad.mjs). withEndCard=true → full 15 s for Studio.
 * AudioTrack: src/ads/audio.json (shared by all ads; null = silent). Previewed here; muxed by render-ad.mjs.
 */
export const ProductAdVideo: React.FC<AdProps> = ({ ad, withEndCard, clips }) => {
  const cut = VIDEO.sceneFrames;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ground }}>
      {withEndCard && audio.src ? <Audio src={staticFile(audio.src)} volume={audio.volume} /> : null}
      {ad.scenes.map((scene, i) => (
        <Sequence key={scene.id} name={`${i + 1} ${scene.role}${clips?.[i] ? " · clip" : ` · ${scene.visual.kind}`}`} from={i * cut} durationInFrames={cut}>
          <ProductScene scene={scene} clip={clips?.[i] ?? null} />
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

/** Finds which clip slots have a file (HEAD request to the public folder), in Studio and when rendering. */
export const resolveClips: CalculateMetadataFunction<AdProps> = async ({ props, abortSignal }) => {
  const clips = await Promise.all(
    props.ad.scenes.map(async (_, i) => {
      const path = clipPath(props.ad.slug, i);
      try {
        const res = await fetch(staticFile(path), { method: "HEAD", cache: "no-store", signal: abortSignal });
        return res.ok ? path : null;
      } catch {
        return null;
      }
    }),
  );
  return { props: { ...props, clips } };
};
