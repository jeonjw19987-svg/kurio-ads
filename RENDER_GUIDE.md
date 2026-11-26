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
public/assets/B_traditional_gat/    01_product.png (also ④), 02_detail.png, 03_making.png
public/assets/C_gotae/              01_product.png, 02_detail.png, 03_making.png, 04_in_use_alt.png (④), 04_in_place.png (④ review alternative)
public/assets/D_najeon/             01_product.png, 02_detail.png (also ③), 04_in_place.png
```

The exact file list and sizes are in each product file under `src/ads/products/`.

Audio files are not in git either: run `npm run sound` once to write `public/audio/kurio-sound-v5.wav` (the same file every time)
before previewing or rendering.

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
npm run composite:d   # D only: put the real plate into the operator's ② ④ scenes → public/assets/D_najeon/*_final.png
npm run a:render      # Ad A FINAL → out/FINAL/INTERNAL_REVIEW/A-moon-jar/
npm run b:render      # Ad B FINAL → out/FINAL/INTERNAL_REVIEW/B-traditional-gat/
npm run c:render      # Ad C FINAL → out/FINAL/INTERNAL_REVIEW/C-gotae-gat/
npm run d:render      # Ad D FINAL → out/FINAL/INTERNAL_REVIEW/D-tiger-magpie/
npm run render:all    # all four, one after another
npm run <x>:stills    # stills + thumbnail only, for a quick review (stills:all for all four)
npm run sheet:all     # out/FINAL/KURIO_ADS_A-D_FINAL_review.png — the five stills of every ad in one image
npm run sound:apply   # swap src/ads/sound.json into all four renders (no frames re-rendered)
```

The renders go to `out/FINAL/INTERNAL_REVIEW/<ad>/` (image rights not confirmed); the finished files are also copied
flat into `out/FINAL/`. Earlier versions stay in `out/<ad>-v*/`. See STORYBOARD_FINAL.md for the final state.

`tools/render-ad.mjs` does the following:
- Bundles once and renders five representative stills and a thumbnail.
- Renders the 12 s body, then joins it **without re-encoding** to the shared end-card master `out/shared/KURIO_ENDCARD_<version>.mp4` (v4, or v5 for A). That master is rendered only if it is missing, so every ad carries the byte-identical end card.

Output (v4: B, D): H.264, yuv420p, bt709, crf 18, 450 frames, silent.

Output (v5: A, `--quality=master`): frames captured as lossless PNG, then H.264 High, yuv420p, bt709, **CRF 14**,
preset slow — one lossy encode only. The v5 end-card master `out/shared/KURIO_ENDCARD_v5.mp4` uses the same settings,
so the join is still a stream copy. Files:

| File | Content |
|---|---|
| `KURIO_AD_A_MOON_JAR_v6.mp4` | 15 s with the shared v5 sound (AAC 256 kbps, 48 kHz) |
| `KURIO_AD_A_MOON_JAR_v6_SILENT.mp4` | the same video stream with a silent AAC track |
| `stills/…_Scene_01…05` (+ `_tagline`, `_REVIEW_Scene_04_ALT-COPY`) | representative frames |
| `…_render-report.json` | resolution, fps, profile, bitrate and audio of what was actually written (ffprobe) |

All four use design v6 (SUIT content type) and the same render settings (`--quality=master --audio=shared --silent-master`).
Sound: `src/ads/sound.json` is the one setting for all four. `npm run sound` rewrites `public/audio/kurio-sound-v5.wav` from `tools/compose-sound.mjs` (deterministic).

Output name suffixes:

| Suffix | Meaning |
|---|---|
| `_INTERNAL_REVIEW` | The product file has `status: "review"`. Not an ad; for internal review only |
| `_DRAFT` | At least one cut still uses a draft visual |

## Generated clips (optional)
A video file at `public/clips/<slug>/01-product.mp4` … `04-in-place.mp4` replaces that cut's image.
`npm run a:watch` re-renders automatically whenever a clip is added or replaced.

## Choosing source images
`node tools/contact-sheet.mjs <out.png> "<title>" <folder> [cols]` puts every image of a folder (long detail-page strips cut into
squares) on one sheet with file names and sizes. Working images are made from the originals by crop and downscale only.
