import { Composition, Folder, Still } from "remotion";
import { adAMoonJar } from "./ads/products/a-moon-jar";
import { adBTraditionalGat } from "./ads/products/b-traditional-gat";
import { adCGotaeGat, adCGotaeGatRoom } from "./ads/products/c-gotae-gat";
import { adDTigerMagpie } from "./ads/products/d-tiger-magpie";
import { adEGatClock } from "./ads/products/e-gat-clock";
import { SAFEZONE_ADS } from "./ads/products/safezone";
import { EndCard } from "./ads/template/EndCard";
import { EndCardV5, EndCardV6 } from "./ads/template/EndCardV5";
import { ProductAdVideo, resolveClips } from "./ads/template/ProductAdVideo";
import { KeyframeScene } from "./ads/template/ProductScene";
import { VIDEO } from "./ads/template/tokens";
import type { ProductAd } from "./ads/template/types";
import { MyComposition } from "./Composition";
import { TestVideoComposition } from "./TestVideo";

const size = { fps: VIDEO.fps, width: VIDEO.width, height: VIDEO.height } as const;
const cut = VIDEO.sceneFrames;

/** Every ad gets the same four registrations: full preview, 12 s body, and keyframes for Higgsfield. */
const AdCompositions: React.FC<{ ad: ProductAd }> = ({ ad }) => (
  <Folder name={`Ad-${ad.code}`}>
    {/* Full 15 s with the end card — for previewing in Studio. */}
    <Composition
      id={ad.compositionId}
      component={ProductAdVideo}
      defaultProps={{ ad, withEndCard: true }}
      calculateMetadata={resolveClips}
      durationInFrames={cut * VIDEO.sceneCount}
      {...size}
    />
    {/* Cuts ①–④ only (12 s) — joined to the end-card master for delivery (tools/render-ad.mjs). */}
    <Composition
      id={`${ad.compositionId}-BODY`}
      component={ProductAdVideo}
      defaultProps={{ ad, withEndCard: false }}
      calculateMetadata={resolveClips}
      durationInFrames={cut * 4}
      {...size}
    />
    {/* Higgsfield start images: same ground, light and framing for every ad. */}
    {ad.scenes.map((scene, i) => (
      <Still
        key={scene.id}
        id={`KF-${ad.code}-${String(i + 1).padStart(2, "0")}`}
        component={KeyframeScene}
        defaultProps={{ scene, productScene: ad.scenes[0] }}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    ))}
  </Folder>
);

/** SAFEZONE delivery (src/ads/products/safezone.ts): full preview and the 12 s body only — no keyframes. */
const SafeZoneCompositions: React.FC<{ ad: ProductAd }> = ({ ad }) => (
  <>
    <Composition
      id={ad.compositionId}
      component={ProductAdVideo}
      defaultProps={{ ad, withEndCard: true }}
      calculateMetadata={resolveClips}
      durationInFrames={cut * VIDEO.sceneCount}
      {...size}
    />
    <Composition
      id={`${ad.compositionId}-BODY`}
      component={ProductAdVideo}
      defaultProps={{ ad, withEndCard: false }}
      calculateMetadata={resolveClips}
      durationInFrames={cut * 4}
      {...size}
    />
  </>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* SAFEZONE (2026-11-26): A–D for every Meta placement — Reels, Stories, Feed 4:5. */}
      <Folder name="SAFEZONE">
        {SAFEZONE_ADS.map((ad) => (
          <SafeZoneCompositions key={ad.compositionId} ad={ad} />
        ))}
      </Folder>
      <Folder name="KURIO-Ads">
        <AdCompositions ad={adAMoonJar} />
        <AdCompositions ad={adBTraditionalGat} />
        <AdCompositions ad={adCGotaeGat} />
        <AdCompositions ad={adDTigerMagpie} />
        {/* E (2026-11-26): MU:DS GAT Wall Clock — the homepage's ad piece C since that day. */}
        <AdCompositions ad={adEGatClock} />
        {/* Shared end card. Rendered once; the same file goes into every ad. */}
        <Composition id="KURIO-EndCard" component={EndCard} durationInFrames={cut} {...size} />
        {/* v5 shared end card (black; tagline, then wordmark). Rendered once as out/shared/KURIO_ENDCARD_v5.mp4. */}
        <Composition id="KURIO-EndCard-v5" component={EndCardV5} durationInFrames={cut} {...size} />
        {/* v6 shared end card (design v7): v5 + "Shop now". Rendered once as out/shared/KURIO_ENDCARD_v6.mp4. */}
        <Composition id="KURIO-EndCard-v6" component={EndCardV6} durationInFrames={cut} {...size} />
        {/* Review only: C with GOTAE's room photo as ④ (sharp, not in use), for the planner to compare. Not an ad. */}
        <Composition
          id={adCGotaeGatRoom.compositionId}
          component={ProductAdVideo}
          defaultProps={{ ad: adCGotaeGatRoom, withEndCard: true }}
          calculateMetadata={resolveClips}
          durationInFrames={cut * VIDEO.sceneCount}
          {...size}
        />
      </Folder>
      <Folder name="Setup-Tests">
        <MyComposition />
        <TestVideoComposition />
      </Folder>
    </>
  );
};
