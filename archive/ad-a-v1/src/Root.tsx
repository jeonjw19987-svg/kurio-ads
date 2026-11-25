import { Composition, Folder } from "remotion";
import { adAMoonJar } from "./ads/products/a-moon-jar";
import { EndCard } from "./ads/template/EndCard";
import { ProductAdVideo } from "./ads/template/ProductAdVideo";
import { VIDEO } from "./ads/template/tokens";
import { MyComposition } from "./Composition";
import { TestVideoComposition } from "./TestVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="KURIO-Ads">
        {/* Ad A — WA YU JAE white porcelain moon jar. B, C and D get one line each here with their own data file. */}
        <Composition
          id={adAMoonJar.compositionId}
          component={ProductAdVideo}
          defaultProps={{ ad: adAMoonJar }}
          durationInFrames={VIDEO.sceneFrames * VIDEO.sceneCount}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        {/* Shared end card on its own, for review. Identical in every ad. */}
        <Composition
          id="KURIO-EndCard"
          component={EndCard}
          durationInFrames={VIDEO.sceneFrames}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
      </Folder>
      <Folder name="Setup-Tests">
        <MyComposition />
        <TestVideoComposition />
      </Folder>
    </>
  );
};
