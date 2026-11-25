import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Environment smoke test: 3s, 1920x1080, animated title + progress bar.
export const TestVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const progress = frame / (durationInFrames - 1);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f172a",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          color: "white",
          fontSize: 140,
          fontWeight: 800,
          transform: `scale(${scale})`,
          opacity,
        }}
      >
        KURIO ADS
      </div>
      <div style={{ color: "#94a3b8", fontSize: 40, marginTop: 24, opacity }}>
        Remotion render test · frame {frame}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 160,
          width: 1600 * progress,
          height: 12,
          borderRadius: 6,
          backgroundColor: "#38bdf8",
        }}
      />
    </AbsoluteFill>
  );
};

export const TestVideoComposition = () => {
  return (
    <Composition
      id="KurioTest"
      component={TestVideo}
      durationInFrames={90}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
