/**
 * Fetch du now playing radio.
 *
 * ⚠️ MOCK TEMPORAIRE — AzuraCast n'est pas encore déployé (Phase 6, VPS Hetzner).
 *
 * Quand AzuraCast tournera :
 *   1. Mettre AZURACAST_BASE_URL + AZURACAST_STATION dans .env.local
 *   2. Remplacer UNIQUEMENT le corps de getNowPlaying() par le vrai fetch :
 *        GET {base}/api/nowplaying/{station}
 *        → mapper la réponse vers RadioNowPlaying (voir mapping dans radio.ts)
 *   3. La signature ne change pas → ZÉRO modif côté UI (RadioHero).
 *
 * Polling (côté client, à terme) : 10s pour le now playing.
 * Le mock, lui, renvoie une donnée figée.
 */

import type { RadioNowPlaying } from "@/types/domain/radio";

/** Active/désactive le mock. Passe à false quand AzuraCast est branché. */
const MOCK_ENABLED = true;

/** URL du flux audio (vide en mock → bouton play inactif tant qu'AzuraCast absent). */
const STREAM_URL = ""; // ex: "https://radio.brewfm.fr/listen/brew/radio.mp3"

/** Données mock calquées sur la forme AzuraCast réelle. */
const MOCK_NOW_PLAYING: RadioNowPlaying = {
  current: {
    artist: "Blawan",
    title: "Fires",
    genre: "Electronic",
    artUrl: "https://f4.bcbits.com/img/a3535857343_10.jpg", // pochette : vide en mock → fallback visuel
    durationSec: 222,
    elapsedSec: 84,
  },
  next: [
    { artist: "Bicep", title: "Glue" },
    { artist: "Overmono", title: "So U Kno" },
    { artist: "Special Request", title: "Vortex 150" },
    { artist: "Mall Grab", title: "Pool Party" },
    { artist: "Joy Orbison", title: "Hyph Mngo" },
  ],
  history: [
    { artist: "Burial", title: "Archangel" },
    { artist: "Four Tet", title: "Two Thousand and Seventeen" },
    { artist: "DJ Lag", title: "Ice Drop" },
    { artist: "Skee Mask", title: "Rev8617" },
  ],
  isLive: false,
  listeners: 42,
  streamUrl: STREAM_URL,
};

/**
 * Retourne le now playing courant.
 * Mock pour l'instant ; vrai fetch AzuraCast à terme (voir en-tête).
 */
export async function getNowPlaying(): Promise<RadioNowPlaying> {
  if (!MOCK_ENABLED) {
    // TODO: vrai fetch AzuraCast ici (voir en-tête du fichier)
    // const res = await fetch(`${base}/api/nowplaying/${station}`, { next: { revalidate: 10 } });
    // return mapAzuraCast(await res.json());
    throw new Error("AzuraCast non configuré");
  }

  return MOCK_NOW_PLAYING;
}
