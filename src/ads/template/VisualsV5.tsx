import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MOTION_V5, SOFT, VIDEO } from "./tokens";
import type { CutRole, CutVisual, Rect, SourceImage } from "./types";
import { CutVisualView } from "./Visuals";

/**
 * v5 image layouts. Images are only cropped, placed and moved — never generated, retouched or colour-graded.
 * "full": covers the frame (optionally cropped in by `zoom`, centred on `focus`).
 * "soft": the photo fills the width from SOFT.top and bleeds off the bottom; above it, the photo's own top rows
 *   continue upward as an out-of-focus field and the sharp photo dissolves into it — one image, no band or edge.
 * Camera: one slow push-in per cut (2.5% default, ease-out) centred on `focus`, plus an optional slow drift.
 */

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const Camera: React.FC<{ origin: [number, number]; pushIn: number; drift?: [number, number]; children: React.ReactNode }> = ({
  origin,
  pushIn,
  drift,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  if (durationInFrames < 2) return <AbsoluteFill>{children}</AbsoluteFill>;
  const t = interpolate(frame, [0, durationInFrames - 1], [0, 1], { ...clamp, easing: MOTION_V5.pushEase });
  const [dx, dy] = drift ?? [0, 0];
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${origin[0]}px ${origin[1]}px`,
        scale: interpolate(t, [0, 1], [1, pushIn], { output: "perceptual-scale" }),
        translate: `${dx * t}px ${dy * t}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** The out-of-focus field above a "soft" photo: the crop's top SOFT.edgeRows rows, stretched upward and blurred. */
const FieldLayer: React.FC<{ image: SourceImage; crop: Rect; s: number; left: number; height: number; blur: number; margin: number; mask?: string }> = ({
  image,
  crop,
  s,
  left,
  height,
  blur,
  margin,
  mask,
}) => {
  // Horizontal: the crop's columns span the photo's own screen span, widened by `margin` on each side so the blur
  // never fades to transparent inside the frame.
  const x0 = left + crop.x * s - margin;
  const w = crop.w * s + margin * 2;
  const sx = w / crop.w;
  // Vertical: rows [crop.y, crop.y + edgeRows] stretched over the whole field height (plus the same margin).
  const fieldH = height + margin * 2;
  const sy = fieldH / SOFT.edgeRows;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: VIDEO.width, height, overflow: "hidden", maskImage: mask, WebkitMaskImage: mask }}>
      <div style={{ position: "absolute", left: x0, top: -margin, width: w, height: fieldH, overflow: "hidden", filter: `blur(${blur}px)` }}>
        <Img
          src={staticFile(image.src)}
          style={{ position: "absolute", left: -crop.x * sx, top: -crop.y * sy, width: image.width * sx, height: image.height * sy, maxWidth: "none" }}
        />
      </div>
    </div>
  );
};

/**
 * The out-of-focus field above a "soft" photo, in two depths: near the photo, its top rows blurred (SOFT.blur) so
 * shapes continue naturally; higher up, the same rows blurred much further (SOFT.farBlur) so the area behind the
 * caption settles into a calm, even tone instead of vertical streaks.
 */
const SoftField: React.FC<{ image: SourceImage; crop: Rect; s: number; left: number }> = (p) => {
  const height = SOFT.top + SOFT.dissolve;
  const far = `linear-gradient(to bottom, #000 0px, #000 ${SOFT.farUntil}px, rgba(0,0,0,0) ${SOFT.top}px)`;
  // Grain only over the field, fading out where the (naturally grainy) photo takes over.
  const grainMask = `linear-gradient(to bottom, #000 0px, #000 ${SOFT.top}px, rgba(0,0,0,0) ${height}px)`;
  return (
    <>
      <FieldLayer {...p} height={height} blur={SOFT.blur} margin={90} />
      <FieldLayer {...p} height={height} blur={SOFT.farBlur} margin={SOFT.farBlur * 3} mask={far} />
      <FieldGrain height={height} mask={grainMask} />
    </>
  );
};

/**
 * Fine monochrome grain over the blurred field (tokens.ts → SOFT.grain). A blur this wide is a perfectly smooth
 * 8-bit gradient whose one-level steps H.264 turns into visible blocks; a photo's own sensor grain dithers them.
 * This restores that grain on the field only — it adds no detail to the product.
 */
const FieldGrain: React.FC<{ height: number; mask: string }> = ({ height, mask }) => (
  <svg
    width={VIDEO.width}
    height={height}
    style={{ position: "absolute", left: 0, top: 0, opacity: SOFT.grain, mixBlendMode: "overlay", maskImage: mask, WebkitMaskImage: mask }}
  >
    <filter id="kurio-field-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#kurio-field-grain)" />
  </svg>
);

const PhotoV5: React.FC<{ visual: Extract<CutVisual, { kind: "photo" }> }> = ({ visual }) => {
  const { image, layout, focus } = visual;
  const c = visual.crop ?? { x: 0, y: 0, w: image.width, h: image.height };
  const pushIn = visual.pushIn ?? MOTION_V5.pushInScale;

  if (layout === "soft") {
    const areaH = VIDEO.height - SOFT.top;
    const s = Math.max(VIDEO.width / c.w, areaH / c.h);
    const left = (VIDEO.width - c.w * s) / 2 - c.x * s;
    const top = SOFT.top - c.y * s;
    const origin: [number, number] = [left + focus[0] * s, top + focus[1] * s];
    const mask = `linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0.5) ${SOFT.dissolve * 0.45}px, #000 ${SOFT.dissolve}px)`;
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Camera origin={origin} pushIn={pushIn} drift={visual.drift}>
          <SoftField image={image} crop={c} s={s} left={left} />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: SOFT.top,
              width: VIDEO.width,
              height: VIDEO.height - SOFT.top + 120,
              overflow: "hidden",
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          >
            <Img
              src={staticFile(image.src)}
              style={{ position: "absolute", left, top: top - SOFT.top, width: image.width * s, height: image.height * s, maxWidth: "none" }}
            />
          </div>
        </Camera>
      </AbsoluteFill>
    );
  }

  // "full" (and v4 "plate" data shown in v5 is treated as full-frame cover).
  const s0 = Math.max(VIDEO.width / c.w, VIDEO.height / c.h);
  const left0 = (VIDEO.width - c.w * s0) / 2 - c.x * s0;
  const top0 = (VIDEO.height - c.h * s0) / 2 - c.y * s0;
  // Crop-in: the anchor stays where cover-fit put it; everything else scales away from it.
  const anchor = visual.zoomAnchor ?? focus;
  const a: [number, number] = [left0 + anchor[0] * s0, top0 + anchor[1] * s0];
  const s = s0 * (visual.zoom ?? 1);
  const left = a[0] - anchor[0] * s;
  const top = a[1] - anchor[1] * s;
  const origin: [number, number] = [left + focus[0] * s, top + focus[1] * s];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Camera origin={origin} pushIn={pushIn} drift={visual.drift}>
        <Img src={staticFile(image.src)} style={{ position: "absolute", left, top, width: image.width * s, height: image.height * s, maxWidth: "none" }} />
      </Camera>
    </AbsoluteFill>
  );
};

/** v5 cut visual: photos use the v5 layouts; any other kind (set, draft, missing) falls back to the v4 view. */
export const CutVisualViewV5: React.FC<{ role: CutRole; visual: CutVisual }> = ({ role, visual }) =>
  visual.kind === "photo" && !visual.matte && !visual.placement ? <PhotoV5 visual={visual} /> : <CutVisualView role={role} visual={visual} />;
