import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BLEED, CAST_SHADOW, COLORS, MOTION, PLATE, SET, SHADOW, STAGE, VIDEO } from "./tokens";
import type { CutRole, CutVisual, Placement, Rect, Silhouette, SourceImage } from "./types";

/**
 * "Matte" photos: studio shots on a perfectly flat light background. A small brightness lift maps that background
 * to pure white (e.g. 245 → 255 = ×1.0408); multiplying then leaves whatever is behind it untouched, so the product
 * sits on KURIO's ground or in the shared set with no seam. The product itself moves by the same tiny factor.
 */
const matteStyle = (matte?: number): React.CSSProperties =>
  matte ? { mixBlendMode: "multiply", filter: `brightness(${matte})` } : {};

/**
 * Cast shadow for matte photos (tokens.ts → CAST_SHADOW): the photo's dark pixels become the shadow's alpha
 * (alpha = 1 − luminance), blurred and offset away from the light (window on the LEFT → shadow to the right).
 * The shape therefore follows the real product — its woven brim, strap — not an approximation.
 */
const CastShadowFilter: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id="kurio-cast" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
      {/* alpha = 1 − luminance × (255/245): the flat studio background maps to 0, dark product pixels to ~1 */}
      <feColorMatrix type="matrix" values="0 0 0 0 0.16  0 0 0 0 0.11  0 0 0 0 0.07  -0.347 -0.347 -0.348 0 1" result="dark" />
      {/* only inside the photo (transparent pixels outside it would otherwise turn opaque) */}
      <feComposite in="dark" in2="SourceAlpha" operator="in" result="clipped" />
      <feGaussianBlur in="clipped" stdDeviation={CAST_SHADOW.blur / 2} />
    </filter>
  </svg>
);

const CastShadow: React.FC<{ image: SourceImage; s: number; left: number; top: number }> = ({ image, s, left, top }) => (
  <>
    <CastShadowFilter />
    <Img
      src={staticFile(image.src)}
      style={{
        position: "absolute",
        left: left + CAST_SHADOW.dx,
        top: top + CAST_SHADOW.dy,
        width: image.width * s,
        height: image.height * s,
        maxWidth: "none",
        opacity: CAST_SHADOW.opacity,
        filter: "url(#kurio-cast)",
      }}
    />
  </>
);

/** The one camera move: a 2.5% push-in over the whole cut, easing out (tokens.ts → MOTION). */
const PushIn: React.FC<{ origin: string; children: React.ReactNode }> = ({ origin, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // A one-frame Still (Higgsfield keyframe) has no move: it is the cut's first frame.
  if (durationInFrames < 2) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill
      style={{
        transformOrigin: origin,
        scale: interpolate(frame, [0, durationInFrames - 1], [1, MOTION.pushInScale], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: MOTION.pushEase,
          output: "perceptual-scale",
        }),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * v4 photo layouts. "full" covers the whole frame; "plate" covers the area below PLATE.top, bleeding off three
 * edges, and fades in from the ground band at its top edge. The image always covers its area (never letterboxed);
 * the push-in is centred on `focus`.
 */
const PhotoView: React.FC<{
  layout: "full" | "plate";
  image: SourceImage;
  crop?: Rect;
  focus: [number, number];
  matte?: number;
  placement?: Placement;
}> = ({ layout, image, crop, focus, matte, placement }) => {
  const c = crop ?? { x: 0, y: 0, w: image.width, h: image.height };
  const areaTop = layout === "full" ? 0 : PLATE.top;
  const areaW = VIDEO.width;
  const areaH = VIDEO.height - areaTop;
  const s = placement ? placement.scale : Math.max(areaW / c.w, areaH / c.h);
  const left = placement ? placement.left : (areaW - c.w * s) / 2 - c.x * s;
  const top = placement ? placement.top : (areaH - c.h * s) / 2 - c.y * s;
  const origin = `${left + focus[0] * s}px ${top + focus[1] * s}px`;

  return (
    <>
      <div style={{ position: "absolute", left: 0, top: areaTop, width: areaW, height: areaH, overflow: "hidden" }}>
        <PushIn origin={origin}>
          {/* Matte photos are multiplied onto the ground; the backdrop must sit inside the same (transformed) group. */}
          {matte ? <AbsoluteFill style={{ backgroundColor: COLORS.ground }} /> : null}
          {matte ? <CastShadow image={image} s={s} left={left} top={top} /> : null}
          <Img
            src={staticFile(image.src)}
            style={{ position: "absolute", left, top, width: image.width * s, height: image.height * s, maxWidth: "none", ...matteStyle(matte) }}
          />
        </PushIn>
      </div>
      {layout === "plate" ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            width: VIDEO.width,
            top: PLATE.top - 1,
            height: PLATE.fade + 1,
            background: `linear-gradient(to bottom, ${COLORS.ground} 0%, rgba(244, 241, 236, 0.45) 45%, rgba(244, 241, 236, 0) 100%)`,
          }}
        />
      ) : null}
    </>
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

/**
 * A cut with no material yet: plain ground only. No working note is ever drawn on screen (brief, 2026-11-26);
 * the gap is recorded in the product file (`need`) and in the render log, and the output is named _DRAFT.
 */
const MissingCut: React.FC = () => null;

/** Soft-noise texture (plaster, wood grain) as an SVG filter, overlaid at low strength. */
const Grain: React.FC<{ id: string; top: number; height: number; freq: string; opacity: number; blend: React.CSSProperties["mixBlendMode"] }> = ({
  id,
  top,
  height,
  freq,
  opacity,
  blend,
}) => (
  <svg width={VIDEO.width} height={height} style={{ position: "absolute", left: 0, top, opacity, mixBlendMode: blend }}>
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={3} seed={11} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#${id})`} />
  </svg>
);

/**
 * The shared IN PLACE set (tokens.ts → SET): warm plaster wall with soft window light from the left and a slim
 * walnut shelf. Used only when a product has no photo of itself in a room; the product photo is composited onto it
 * without being altered (matte multiply). Recorded as a staged composite, never as a real interior photo.
 */
const InteriorSet: React.FC<{ surfaceY: number }> = ({ surfaceY }) => {
  const front = surfaceY + SET.shelfDepth;
  const bottom = front + SET.shelfFace;
  return (
    <AbsoluteFill>
      {/* Wall */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 60% at 18% 22%, ${SET.wallLight} 0%, rgba(0,0,0,0) 70%), linear-gradient(100deg, ${SET.wall} 0%, ${SET.wall} 55%, ${SET.wallShade} 100%)`,
        }}
      />
      {/* Window light falling across the wall from the left: bright panes with darker mullion gaps between them */}
      {SET.windowLight.map((w, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: w.x,
            top: w.y,
            width: w.w,
            height: w.h,
            background: "rgba(255, 248, 234, 0.62)",
            filter: "blur(16px)",
            transform: "skewX(-24deg)",
          }}
        />
      ))}
      <Grain id="kurio-plaster" top={0} height={VIDEO.height} freq="0.9" opacity={0.08} blend="multiply" />
      {/* Ambient occlusion where the shelf meets the wall */}
      <div style={{ position: "absolute", left: 0, width: VIDEO.width, top: surfaceY - 80, height: 80, background: "linear-gradient(to bottom, rgba(70,48,30,0) 0%, rgba(70,48,30,0.16) 100%)" }} />
      {/* Shelf top surface (seen slightly from above), front face, and the shelf's shadow on the wall below */}
      <div style={{ position: "absolute", left: 0, width: VIDEO.width, top: surfaceY, height: SET.shelfDepth, background: `linear-gradient(to bottom, ${SET.woodTopBack} 0%, ${SET.woodTopFront} 100%)` }} />
      <Grain id="kurio-wood-top" top={surfaceY} height={SET.shelfDepth} freq="0.002 0.16" opacity={0.5} blend="overlay" />
      {/* Light from the left: the shelf is brighter on the window side */}
      <div style={{ position: "absolute", left: 0, width: VIDEO.width, top: surfaceY, height: SET.shelfDepth + SET.shelfFace, background: "linear-gradient(to right, rgba(255,236,210,0.16) 0%, rgba(255,236,210,0) 55%, rgba(20,12,6,0.12) 100%)" }} />
      <div style={{ position: "absolute", left: 0, width: VIDEO.width, top: front, height: 2, background: "rgba(255, 226, 192, 0.3)" }} />
      <div style={{ position: "absolute", left: 0, width: VIDEO.width, top: front + 2, height: SET.shelfFace - 2, background: `linear-gradient(to bottom, ${SET.woodFace} 0%, ${SET.woodFaceDark} 100%)` }} />
      <Grain id="kurio-wood-face" top={front + 2} height={SET.shelfFace - 2} freq="0.002 0.25" opacity={0.45} blend="overlay" />
      <div style={{ position: "absolute", left: 0, width: VIDEO.width, top: bottom, height: 140, background: "linear-gradient(to bottom, rgba(60,40,25,0.28) 0%, rgba(60,40,25,0.08) 45%, rgba(60,40,25,0) 100%)" }} />
    </AbsoluteFill>
  );
};

/**
 * A slim walnut display stand (rod + knob + round base) — the only prop the storyboard allows. Drawn behind the
 * matte product photo, so it shows through translucent parts (a woven crown) exactly as a real stand would.
 */
const DisplayStand: React.FC<{ x: number; top: number; baseY: number }> = ({ x, top, baseY }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: x - SET.standRod / 2,
        top,
        width: SET.standRod,
        height: baseY - top,
        background: `linear-gradient(to right, ${SET.woodFaceDark} 0%, ${SET.woodTopFront} 35%, ${SET.woodFace} 70%, ${SET.woodFaceDark} 100%)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: x - SET.standBase / 2,
        top: baseY - SET.standBase * 0.13,
        width: SET.standBase,
        height: SET.standBase * 0.26,
        borderRadius: "50%",
        background: `radial-gradient(ellipse at 40% 30%, ${SET.woodTopFront} 0%, ${SET.woodFace} 60%, ${SET.woodFaceDark} 100%)`,
        boxShadow: "0 10px 18px rgba(30,18,10,0.35)",
      }}
    />
  </>
);

/** IN PLACE composite: the shared set + the matte product photo, pushed in together. */
const SetView: React.FC<{
  image: SourceImage;
  matte: number;
  placement: Placement;
  focus: [number, number];
  surfaceY: number;
  contact?: { x: number; y: number; w: number };
  stand?: { x: number; top: number; baseY: number };
}> = ({ image, matte, placement, focus, surfaceY, contact, stand }) => {
  const s = placement.scale;
  const origin = `${placement.left + focus[0] * s}px ${placement.top + focus[1] * s}px`;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PushIn origin={origin}>
        <InteriorSet surfaceY={surfaceY} />
        <CastShadow image={image} s={s} left={placement.left} top={placement.top} />
        {stand ? <DisplayStand x={stand.x} top={stand.top} baseY={stand.baseY} /> : null}
        {contact ? (
          <div
            style={{
              position: "absolute",
              left: contact.x - contact.w / 2,
              top: contact.y - contact.w * 0.06,
              width: contact.w,
              height: contact.w * 0.12,
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(40,26,16,0.38) 0%, rgba(40,26,16,0.15) 50%, rgba(40,26,16,0) 75%)",
              filter: `blur(${contact.w * 0.03}px)`,
            }}
          />
        ) : null}
        <Img
          src={staticFile(image.src)}
          style={{ position: "absolute", left: placement.left, top: placement.top, width: image.width * s, height: image.height * s, maxWidth: "none", ...matteStyle(matte) }}
        />
      </PushIn>
    </AbsoluteFill>
  );
};

export const CutVisualView: React.FC<{ role: CutRole; visual: CutVisual }> = ({ role, visual }) => {
  switch (visual.kind) {
    case "photo":
      return (
        <PhotoView layout={visual.layout} image={visual.image} crop={visual.crop} focus={visual.focus} matte={visual.matte} placement={visual.placement} />
      );
    case "set":
      return (
        <SetView
          image={visual.image}
          matte={visual.matte}
          placement={visual.placement}
          focus={visual.focus}
          surfaceY={visual.surfaceY}
          contact={visual.contact}
          stand={visual.stand}
        />
      );
    case "cutout":
      return <CutoutStage image={visual.image} silhouette={visual.silhouette} focus={visual.focus} detail={role === "DETAIL"} />;
    case "bleed":
      return <BleedPhoto image={visual.image} crop={visual.crop} />;
    case "missing":
      return <MissingCut />;
  }
};
