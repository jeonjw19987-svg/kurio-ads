# Render guide

## Requirements
- Node.js 20.19 or newer.
- `npm ci` (do not copy `node_modules` between machines).
- The first render downloads Remotion's Chrome Headless Shell (about 130 MB) automatically.

## Assets not in this repo
Product images are kept outside git. Put them at these paths before rendering:

```
public/assets/A_moonjar/            01_product_v4.png.png, 04_in_place_v4.png.png   (v4 also used 02_detail.png, 03_making.png)
public/products/a-moon-jar/         02-detail.png, 03-making.png   (the store's 1440×900 originals; A v5 uses both)
public/assets/B_traditional_gat/    01_product.jpg (also used by ④), 02_detail.jpg, 03_making.jpg
public/assets/C_gotae/              01_product.jpg, 02_detail.jpg, 03_making.jpg   (④ not yet available)
public/assets/D_najeon/             01_product.jpg, 02_detail.jpg (also used by ③), 04_in_place.jpg
```

The exact file list and sizes are in each product file under `src/ads/products/`.

## Preview
```bash
npm run dev
```
Remotion Studio opens at http://localhost:3000. Every ad has:
- `<id>`: the full 15 s ad
- `<id>-BODY`: cuts ①–④, used for delivery
- `KF-<code>-0N`: start images for generated clips

`KURIO-EndCard` is the shared v4 end card (B, C, D); `KURIO-EndCard-v5` is the black v5 end card (A).
`KURIO-AD-A-MOON-JAR-ALT-COPY` is a review-only variant of A with the alternative ④ line.

## Render
```bash
npm run a:render      # Ad A v5 → out/A-moon-jar-v5/ (master quality, sound, silent master)
npm run b:render      # Ad B → out/B-traditional-gat-v1/
npm run c:stills      # Ad C → stills only (internal review template)
npm run d:render      # Ad D → out/D-tiger-magpie-v1/
npm run <x>:stills    # stills + thumbnail only, for a quick review
```

`tools/render-ad.mjs` does the following:
- Bundles once and renders five representative stills and a thumbnail.
- Renders the 12 s body, then joins it **without re-encoding** to the shared end-card master `out/shared/KURIO_ENDCARD_<version>.mp4` (v4, or v5 for A). That master is rendered only if it is missing, so every ad carries the byte-identical end card.

Output (v4: B, D): H.264, yuv420p, bt709, crf 18, 450 frames, silent.

Output (v5: A, `--quality=master`): frames captured as lossless PNG, then H.264 High, yuv420p, bt709, **CRF 14**,
preset slow — one lossy encode only. The v5 end-card master `out/shared/KURIO_ENDCARD_v5.mp4` uses the same settings,
so the join is still a stream copy. Files:

| File | Content |
|---|---|
| `KURIO_AD_A_MOON_JAR_v5.mp4` | 15 s with the shared v5 sound (AAC 256 kbps, 48 kHz) |
| `KURIO_AD_A_MOON_JAR_v5_SILENT.mp4` | the same video stream with a silent AAC track |
| `stills/…_Scene_01…05` (+ `_tagline`, `_REVIEW_Scene_04_ALT-COPY`) | representative frames |
| `…_render-report.json` | resolution, fps, profile, bitrate and audio of what was actually written (ffprobe) |

Sound: `npm run sound` rewrites `public/audio/kurio-sound-v5.wav` from `tools/compose-sound.mjs` (deterministic).

Output name suffixes:

| Suffix | Meaning |
|---|---|
| `_INTERNAL_REVIEW` | The product file has `status: "review"`. Not an ad; for internal review only |
| `_DRAFT` | At least one cut still uses a draft visual |

## Generated clips (optional)
A video file at `public/clips/<slug>/01-product.mp4` … `04-in-place.mp4` replaces that cut's image.
`npm run a:watch` re-renders automatically whenever a clip is added or replaced.
