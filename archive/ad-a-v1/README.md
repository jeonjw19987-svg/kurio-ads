# Ad A v1 source (2026-11-25) — reconstructed archive

v1 was rendered on 2026-11-25 (`out/A-moon-jar-v1/KURIO_AD_A_MOON_JAR_v1.mp4`). Its source was never committed: the repository's first commit failed, because git had no user identity set.

On 2026-11-26 the files below were rewritten from the session record. Each file is the final state as of the v1 render, including the later greyscale-text and balanced-wrap fixes. They were not re-rendered to compare pixels.

The archive is excluded from type-checking and the build (`tsconfig.json` → `exclude`). To render v1 again:
1. Copy `archive/ad-a-v1/src/ads/*` over `src/ads/`.
2. Copy `archive/ad-a-v1/src/Root.tsx` over `src/Root.tsx`.
3. Copy `archive/ad-a-v1/public/products/a-moon-jar/*` into `public/products/a-moon-jar/`.
4. Run:
   ```
   npx remotion render KURIO-AD-A-MOON-JAR out/…mp4 --codec=h264 --pixel-format=yuv420p --color-space=bt709
   ```

Do this on a separate branch or a scratch copy, not on the working branch.
