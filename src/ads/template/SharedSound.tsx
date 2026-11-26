import { Audio } from "@remotion/media";
import React from "react";
import { staticFile } from "remotion";
import sound from "../sound.json";

/**
 * The one sound track shared by every ad on design "v5" (src/ads/sound.json): same file, same 15 s from 0 s, same
 * level, same accents and end-card signature in A, B, C and D. Change sound.json to change the music for all four.
 * Used for the Studio preview; delivered files get the same track muxed by tools/render-ad.mjs (--audio=shared).
 */
export const SharedSound: React.FC = () => <Audio src={staticFile(sound.track)} volume={sound.volume} />;
