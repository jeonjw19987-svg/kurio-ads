import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BLEED, COLORS, FONT_FAMILY, GREYSCALE_TEXT, PUSH_IN_END_SCALE, SHADOW, STAGE, VIDEO } from "./tokens";
import type { CutRole, CutVisual, Rect, Silhouette, SourceImage } from "./types";

/** One very slow push-in over the whole cut, constant speed (storyboard §4). */
const PushIn: React.FC<{ origin: string; children: React.ReactNode }> = ({ origin, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        transformOrigin: origin,
        scale: interpolate(frame, [0, durationInFrames - 1], [1, PUSH_IN_END_SCALE], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const toPath = (points: [number, number][], s: number) =>
  `path('M ${points.map(([x, y]) => `${(x * s).toFixed(1)} ${(y * s).toFixed(1)}`).join(" L ")} Z')`;

/** Soft elliptical shadow. Light comes from the left, so it falls to the right. */
const Shadow: React.FC<{ cx: number; cy: number; w: number; h: number; opacity: number; blur: number }> = ({ cx, cy, w, h, opacity, blur }) => (
  <div
    style={{
      position: "absolute",
      left: cx - w / 2,
      top: cy - h / 2,
      width: w,
      height: h,
      borderRadius: "50%",
      background: `radial-gradient(ellipse at center, rgba(${SHADOW.color}, ${opacity}) 0%, rgba(${SHADOW.color}, ${opacity * 0.55}) 45%, rgba(${SHADOW.color}, 0) 72%)`,
      filter: `blur(${blur}px)`,
    }}
  />
);

/** ① PRODUCT / ② DETAIL: the cut-out product standing on the off-white ground. */
const CutoutStage: React.FC<{ image: SourceImage; silhouette: Silhouette; focus?: [number, number]; detail: boolean }> = ({
  image,
  silhouette,
  focus,
  detail,
}) => {
  const { bbox } = silhouette;
  const productScale = STAGE.productHeight / bbox.h;
  const s = detail ? productScale * STAGE.detailMagnification : productScale;
  const [fx, fy] = focus ?? [bbox.x + bbox.w / 2, bbox.y + bbox.h / 2];

  const left = detail ? STAGE.detailAnchor.x - fx * s : STAGE.centerX - (bbox.x + bbox.w / 2) * s;
  const top = detail ? STAGE.detailAnchor.y - fy * s : STAGE.floorY - (bbox.y + bbox.h) * s;

  // Where the product stands, on screen.
  const footX = left + (bbox.x + bbox.w / 2) * s;
  const footY = top + (bbox.y + bbox.h) * s;
  const pw = bbox.w * s;
  const origin = detail ? `${STAGE.detailAnchor.x}px ${STAGE.detailAnchor.y}px` : `${footX}px ${top + (bbox.y + bbox.h / 2) * s}px`;

  return (
    <PushIn origin={origin}>
      <Shadow
        cx={footX + pw * SHADOW.cast.offsetX}
        cy={footY - pw * 0.015}
        w={pw * SHADOW.cast.width}
        h={pw * SHADOW.cast.height}
        opacity={SHADOW.cast.opacity}
        blur={pw * SHADOW.cast.blur}
      />
      <Shadow
        cx={footX + pw * SHADOW.contact.offsetX}
        cy={footY - pw * 0.006}
        w={pw * SHADOW.contact.width}
        h={pw * SHADOW.contact.height}
        opacity={SHADOW.contact.opacity}
        blur={pw * SHADOW.contact.blur}
      />
      <Img
        src={staticFile(image.src)}
        style={{
          position: "absolute",
          left,
          top,
          width: image.width * s,
          height: image.height * s,
          maxWidth: "none",
          clipPath: toPath(silhouette.points, s),
        }}
      />
    </PushIn>
  );
};

/** ③ MAKING / ④ IN PLACE: a photo with its own setting, full width from the top, fading into the ground. */
const BleedPhoto: React.FC<{ image: SourceImage; crop: Rect }> = ({ image, crop }) => {
  const s = VIDEO.width / crop.w;
  const h = crop.h * s;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: BLEED.top, width: VIDEO.width, height: h, overflow: "hidden" }}>
        <PushIn origin="50% 50%">
          <Img
            src={staticFile(image.src)}
            style={{
              position: "absolute",
              left: -crop.x * s,
              top: -crop.y * s,
              width: image.width * s,
              height: image.height * s,
              maxWidth: "none",
            }}
          />
        </PushIn>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: VIDEO.width,
          top: BLEED.top + h - BLEED.fade,
          height: BLEED.fade + 2,
          background: `linear-gradient(to bottom, rgba(244, 241, 236, 0) 0%, rgba(244, 241, 236, 0.55) 45%, ${COLORS.ground} 100%)`,
        }}
      />
    </>
  );
};

/** A cut with no cleared material yet. Plain and obvious, so it is never mistaken for a finished cut. */
const MissingNote: React.FC<{ role: CutRole; need: string }> = ({ role, need }) => (
  <div
    style={{
      ...GREYSCALE_TEXT,
      position: "absolute",
      left: 140,
      right: 140,
      top: 470,
      textAlign: "center",
      fontFamily: FONT_FAMILY,
      fontWeight: 400,
      color: COLORS.note,
    }}
  >
    <div style={{ fontSize: 26, letterSpacing: "0.24em", textTransform: "uppercase" }}>{role} · photo needed</div>
    <div style={{ fontSize: 32, lineHeight: 1.35, marginTop: 28 }}>{need}</div>
  </div>
);

export const CutVisualView: React.FC<{ role: CutRole; visual: CutVisual }> = ({ role, visual }) => {
  switch (visual.kind) {
    case "cutout":
      return <CutoutStage image={visual.image} silhouette={visual.silhouette} focus={visual.focus} detail={role === "DETAIL"} />;
    case "bleed":
      return <BleedPhoto image={visual.image} crop={visual.crop} />;
    case "missing":
      return <MissingNote role={role} need={visual.need} />;
  }
};
