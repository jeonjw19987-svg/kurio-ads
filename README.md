# kurio-ads

Vertical video templates for KURIO product ads (Instagram / Facebook Reels), built with [Remotion](https://www.remotion.dev).

Each ad is 15 seconds, 1080×1920, 30 fps, made of five 3-second cuts with hard cuts:

| Cut | Time | Role |
|---|---|---|
| ① PRODUCT | 0–3 s | The whole product and its name |
| ② DETAIL | 3–6 s | Material and form, close up |
| ③ MAKING | 6–9 s | Hands or traces of making |
| ④ IN PLACE | 9–12 s | The product in a living space |
| ⑤ END CARD | 12–15 s | Brand and call to action (one shared file for every ad) |

Only the product images and the English lines change from ad to ad. Type, colour, layout and motion are fixed in one
design system — see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Quick start

```bash
npm ci          # install (Node 20.19+)
npm run dev     # Remotion Studio → pick an ad under "KURIO-Ads"
```

Rendering, file names and the asset folders are described in [RENDER_GUIDE.md](RENDER_GUIDE.md).

**Product photos are not part of this repository.** Without them the compositions render with empty image areas.

## Structure

```
src/ads/template/   shared design system and components (captions, layouts, motion, end card)
src/ads/products/   one file per ad: images, crops, push-in focus, English lines
src/Root.tsx        registers every ad in Remotion Studio
tools/              render script (one bundle, stills, MP4, shared end card), clip watcher
public/fonts/       LINE Seed Sans (brand) and SUIT (content), both SIL Open Font License 1.1 (see each OFL.txt)
```

## Licences

- Code: all rights reserved by KURIO unless stated otherwise.
- LINE Seed Sans: © LY Corporation, SIL Open Font License 1.1 (`public/fonts/line-seed/OFL.txt`).
- SUIT: © SUNN (sun.fo/suit), SIL Open Font License 1.1 (`public/fonts/suit/OFL.txt`).
- Remotion is used under its own licence terms ([remotion.dev/license](https://www.remotion.dev/license)).
