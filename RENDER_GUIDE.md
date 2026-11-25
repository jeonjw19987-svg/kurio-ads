# Render guide

## Requirements
- Node.js 20.19 or newer.
- `npm ci` (do not copy `node_modules` between machines).
- The first render downloads Remotion's Chrome Headless Shell (about 130 MB) automatically.

## Assets not in this repo
Product images are kept outside git. Put them at these paths before rendering:

```
public/assets/A_moonjar/            01_product_v4.png.png, 02_detail.png, 03_making.png, 04_in_place_v4.png.png
public/products/a-moon-jar/         02-detail.png
public/assets/B_traditional_gat/    01_product.jpg, 02_detail.jpg, 03_making.jpg, 04_in_place_source.jpg
public/assets/C_gotae/              01_product.jpg, 02_detail.jpg, 03_making.jpg, 04_in_place.jpg
public/assets/D_najeon/             01_product.jpg, 02_detail.jpg, 03_making.jpg, 04_in_place.jpg
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

`KURIO-EndCard` is the shared end card.

## Render
```bash
npm run a:render      # Ad A → out/A-moon-jar-v4/
npm run b:render      # Ad B → out/B-traditional-gat-v1/
npm run c:stills      # Ad C → stills only (internal review template)
npm run d:render      # Ad D → out/D-tiger-magpie-v1/
npm run <x>:stills    # stills + thumbnail only, for a quick review
```

`tools/render-ad.mjs` does the following:
- Bundles once and renders five representative stills and a thumbnail.
- Renders the 12 s body, then joins it **without re-encoding** to the shared end-card master `out/shared/KURIO_ENDCARD_v4.mp4`. That master is rendered only if it is missing, so every ad carries the byte-identical end card.

Output: H.264, yuv420p, bt709, crf 18, 450 frames, silent.

Output name suffixes:

| Suffix | Meaning |
|---|---|
| `_INTERNAL_REVIEW` | The product file has `status: "review"`. Not an ad; for internal review only |
| `_DRAFT` | At least one cut still uses a draft visual |

## Generated clips (optional)
A video file at `public/clips/<slug>/01-product.mp4` … `04-in-place.mp4` replaces that cut's image.
`npm run a:watch` re-renders automatically whenever a clip is added or replaced.
