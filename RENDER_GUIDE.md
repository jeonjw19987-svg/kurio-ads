# Render guide

## Requirements
- Node.js 20.19 or newer.
- `npm ci` (do not copy `node_modules` between machines).
- The first render downloads Remotion's Chrome Headless Shell (about 130 MB) automatically.

## Assets
Since 2026-11-27 the product images are in git too (owner decision), so a fresh clone renders as is. They are at:

```
public/assets/A_moonjar/            01_product_v4.png.png, 04_in_place_v4.png.png   (v4 also used 02_detail.png, 03_making.png)
public/products/a-moon-jar/         02-detail.png, 03-making.png   (the store's 1440×900 originals; A v5 uses both)
public/assets/B_traditional_gat/    01_product.png (also ④), 02_detail.png, 03_making.png
public/assets/C_gotae/              01_product.png, 02_detail.png, 03_making.png, 04_in_use_alt.png (④), 04_in_place.png (④ review alternative)
public/assets/D_najeon/             01_product.png, 02_detail.png (also ③), 04_in_place.png
```

The exact file list and sizes are in each product file under `src/ads/products/`.

The audio is in git as well (`public/audio/kurio-sound-v5.wav`); `npm run sound` writes the same file byte for byte.

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
npm run composite:c   # C ①: cut the set out of its studio photo → public/assets/C_gotae/01_product_cutout.png
npm run composite:d   # D: put the real plate into the operator's ② ④ scenes → public/assets/D_najeon/*_final.png
npm run copy:fit      # every caption line measured in SUIT (Remotion's browser); flags lines that would wrap
npm run a:render      # request A (moon jar)          → out/FINAL2/_render/A-moon-jar/KURIO_AD_A_261126_v2
npm run d:render      # request B (mother-of-pearl)   → out/FINAL2/_render/B-mother-of-pearl-plate/KURIO_AD_B_261126_v2
npm run c:render      # request C (GOTAE)             → out/FINAL2/_render/C-gotae/KURIO_AD_C_261126_v2
npm run b:render      # request D (traditional gat)   → out/FINAL2/_render/D-traditional-gat/KURIO_AD_D_261126_v2
npm run render:all    # all four, one after another
npm run <x>:stills    # stills + thumbnail only, for a quick review (stills:all for all four)
npm run sheet:all     # out/FINAL2/KURIO_ADS_A-D_261126_v2_review.png — the five stills of every ad in one image
npm run sound:apply   # swap src/ads/sound.json into all four renders (no frames re-rendered)
```

The planner's revision request (2026-11-26) letters the ads A moon jar, B mother-of-pearl plate, C GOTAE, D gat — B
and D are swapped against this repo's codes, and the delivered file names follow the request. The finished files are
copied flat into `out/FINAL2/`. Earlier deliveries stay in `out/FINAL/` and `out/<ad>-v*/`. See STORYBOARD_FINAL2.md.

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

## SAFEZONE (design v8, 2026-11-26)
Delivered as `out/SAFEZONE/KURIO_AD_<A_MOON_JAR|B_TRADITIONAL_GAT|C_GOTAE_GAT|D_TIGER_MAGPIE|E_GAT_WALL_CLOCK>_SAFEZONE.mp4`.
Design rules: DESIGN_SYSTEM.md → v8.

```bash
npm run a:render          # … e:render. A–D render the "-SZ" compositions (src/ads/products/safezone.ts), E its own
npm run safezone:sheets   # Reels · Stories · Feed 4:5 sheets and 4:5 crops in out/SAFEZONE/preview, MP4s copied to out/SAFEZONE
```

FINAL2 (A–D) was rendered on another computer. On this one only A's ① ② ④ sources exist, so every other A–D cut is a
"final2" cut: FINAL2's own frames of that cut, frame for frame, with FINAL2's old caption area covered by the cut's clean
first frame moving through FINAL2's camera. These need, outside git:

```
public/assets/SAFEZONE_final2/   FINAL2_A_moon_jar.mp4, FINAL2_B_traditional_gat.mp4, FINAL2_C_gotae.mp4, FINAL2_D_tiger_magpie.mp4
                                 (FINAL2's *_SILENT.mp4 masters; FINAL2's own letters: B = the plate, D = the gat)
public/assets/SAFEZONE_plates/   npm run composite:safezone-plates -- <FINAL2 _render folder>
out/shared/KURIO_ENDCARD_v6_FINAL2.mp4
                                 FINAL2's end card, cut by stream copy:
                                 npx remotion ffmpeg -ss 12 -i <FINAL2 A>.mp4 -map 0:v -c:v copy -frames:v 90 out/shared/KURIO_ENDCARD_v6_FINAL2.mp4
```

On a computer with the original images, the product files (`a-moon-jar.ts` …) hold the same v8 layout on the sources.
