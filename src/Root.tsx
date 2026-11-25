import { Composition, Folder } from "remotion";
import { adAMoonJar } from "./ads/products/a-moon-jar";
import { EndCard } from "./ads/template/EndCard";
import { ProductAdVideo } from "./ads/template/ProductAdVideo";
import { VIDEO } from "./ads/template/tokens";
import { MyComposition } from "./Composition";
import { TestVideoComposition } from "./TestVideo";

const size = { fps: VIDEO.fps, width: VIDEO.width, height: VIDEO.height } as const;
const cut = VIDEO.sceneFrames;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="KURIO-Ads">
        {/* Ad A, full 15 s with the end card — for previewing in Studio. */}
        <Composition
          id={adAMoonJar.compositionId}
          component={ProductAdVideo}
          defaultProps={{ ad: adAMoonJar, withEndCard: true }}
          durationInFrames={cut * VIDEO.sceneCount}
          {...size}
        />
        {/* Ad A, cuts ①–④ only (12 s) — joined to the end-card master for delivery (tools/render-ad.mjs). */}
        <Composition
          id={`${adAMoonJar.compositionId}-BODY`}
          component={ProductAdVideo}
          defaultProps={{ ad: adAMoonJar, withEndCard: false }}
          durationInFrames={cut * 4}
          {...size}
        />
        {/* Shared end card. Rendered once; the same file goes into every ad. */}
        <Composition id="KURIO-EndCard" component={EndCard} durationInFrames={cut} {...size} />
      </Folder>
      <Folder name="Setup-Tests">
        <MyComposition />
        <TestVideoComposition />
      </Folder>
    </>
  );
};
