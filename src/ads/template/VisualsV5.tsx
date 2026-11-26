import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, MOTION_V5, SOFT, VIDEO } from "./tokens";
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

/**
 * "soft" layers are clipped EDGE px beyond the frame's left and right edges (v8, 2026-11-26): FINAL2's ③ cuts drift
 * 16 px sideways while pushing in, and a clip at the frame's own edge let the ground show as a 2 px line at the right
 * edge in their last frames. Inside the frame nothing changes.
 */
const EDGE = 48;

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
  // The clip box reaches EDGE px past both sides of the frame, so a sideways drift never uncovers the frame's edge.
  return (
    <div
      style={{ position: "absolute", left: -EDGE, top: 0, width: VIDEO.width + 2 * EDGE, height, overflow: "hidden", maskImage: mask, WebkitMaskImage: mask }}
    >
      <div style={{ position: "absolute", left: x0 + EDGE, top: -margin, width: w, height: fieldH, overflow: "hidden", filter: `blur(${blur}px)` }}>
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
const SoftField: React.FC<{ image: SourceImage; crop: Rect; s: number; left: number; photoTop: number }> = ({ photoTop, ...p }) => {
  const height = photoTop + SOFT.dissolve;
  // The far blur takes over the same distance above the photo as in v5 (SOFT.top − SOFT.farUntil), wherever it starts.
  const farUntil = photoTop - (SOFT.top - SOFT.farUntil);
  const far = `linear-gradient(to bottom, #000 0px, #000 ${farUntil}px, rgba(0,0,0,0) ${photoTop}px)`;
  // Grain only over the field, fading out where the (naturally grainy) photo takes over.
  const grainMask = `linear-gradient(to bottom, #000 0px, #000 ${photoTop}px, rgba(0,0,0,0) ${height}px)`;
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
    // v8: a cut may set its own photo top (softTop); the field above and the dissolve move with it.
    const photoTop = visual.softTop ?? SOFT.top;
    const areaH = VIDEO.height - photoTop;
    const s = Math.max(VIDEO.width / c.w, areaH / c.h);
    const left = (VIDEO.width - c.w * s) / 2 - c.x * s;
    const top = photoTop - c.y * s;
    const origin: [number, number] = [left + focus[0] * s, top + focus[1] * s];
    const mask = `linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0.5) ${SOFT.dissolve * 0.45}px, #000 ${SOFT.dissolve}px)`;
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Camera origin={origin} pushIn={pushIn} drift={visual.drift}>
          <SoftField image={image} crop={c} s={s} left={left} photoTop={photoTop} />
          <div
            style={{
              position: "absolute",
              left: -EDGE,
              top: photoTop,
              width: VIDEO.width + 2 * EDGE,
              height: VIDEO.height - photoTop + 120,
              overflow: "hidden",
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          >
            <Img
              src={staticFile(image.src)}
              style={{ position: "absolute", left: left + EDGE, top: top - photoTop, width: image.width * s, height: image.height * s, maxWidth: "none" }}
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

/**
 * v7 cut-out: an RGBA product image (its own alpha, shadow included) on KURIO's warm off-white ground, at an explicit
 * placement, with the same push-in as every cut. The product's pixels are drawn as they are (no blend mode).
 */
const CutoutV5: React.FC<{ visual: Extract<CutVisual, { kind: "photo" }> }> = ({ visual }) => {
  const { image, focus, placement } = visual;
  if (!placement) throw new Error(`cut-out ${image.src} needs a placement`);
  const { scale: s, left, top } = placement;
  const origin: [number, number] = [left + focus[0] * s, top + focus[1] * s];
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ground, overflow: "hidden" }}>
      <Camera origin={origin} pushIn={visual.pushIn ?? MOTION_V5.pushInScale} drift={visual.drift}>
        <Img src={staticFile(image.src)} style={{ position: "absolute", left, top, width: image.width * s, height: image.height * s, maxWidth: "none" }} />
      </Camera>
    </AbsoluteFill>
  );
};

/**
 * v8 "final2" cut (types.ts): FINAL2's own frames, moved down `shift` px, with the clean first frame through FINAL2's
 * camera over the old caption area (and the band above `shift`, and the right edge where a drift would uncover it).
 */
const PATCH_FEATHER = 60;
const Final2Cut: React.FC<{ visual: Extract<CutVisual, { kind: "final2" }> }> = ({ visual }) => {
  const shift = visual.shift ?? 0;
  const end = visual.patchUntil + shift;
  const frame: Rect = { x: 0, y: 0, w: VIDEO.width, h: VIDEO.height };
  const clean: Extract<CutVisual, { kind: "photo" }> = {
    kind: "photo",
    layout: shift ? "soft" : "full",
    image: visual.plate,
    crop: frame,
    focus: visual.focus,
    pushIn: visual.pushIn,
    drift: visual.drift,
    softTop: shift || undefined,
  };
  const top = `linear-gradient(to bottom, #000 0px, #000 ${end - PATCH_FEATHER}px, rgba(0,0,0,0) ${end}px)`;
  // A sideways drift: the clean layer (wider than the frame) also takes the frame's last 6 px on the right.
  const edge = visual.drift && visual.drift[0] !== 0 ? `, linear-gradient(to left, #000 0px, #000 6px, rgba(0,0,0,0) 10px)` : "";
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: shift, width: VIDEO.width, height: VIDEO.height }}>
        <Video src={staticFile(visual.video)} muted trimBefore={visual.from} style={{ width: VIDEO.width, height: VIDEO.height }} />
      </div>
      <AbsoluteFill style={{ maskImage: top + edge, WebkitMaskImage: top + edge }}>
        <PhotoV5 visual={clean} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** v5 cut visual: photos use the v5 layouts (v7: cut-outs too); any other kind (set, draft, missing) falls back to the v4 view. */
export const CutVisualViewV5: React.FC<{ role: CutRole; visual: CutVisual }> = ({ role, visual }) =>
  visual.kind === "final2" ? (
    <Final2Cut visual={visual} />
  ) : visual.kind === "photo" && visual.cutout ? (
    <CutoutV5 visual={visual} />
  ) : visual.kind === "photo" && !visual.matte && !visual.placement ? (
    <PhotoV5 visual={visual} />
  ) : (
    <CutVisualView role={role} visual={visual} />
  );
