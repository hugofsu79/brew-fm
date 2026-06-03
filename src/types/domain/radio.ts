/**
 * Types domaine pour la radio (now playing AzuraCast).
 *
 * Calqués sur la forme de l'API AzuraCast "now playing" pour que le passage
 * du mock au réel ne change RIEN côté UI :
 *   GET https://{azuracast}/api/nowplaying/{station}
 *
 * Mapping prévu (API AzuraCast → domaine) :
 *   now_playing.song.artist        → current.artist
 *   now_playing.song.title         → current.title
 *   now_playing.song.art           → current.artUrl
 *   now_playing.song.genre         → current.genre
 *   now_playing.duration           → current.durationSec
 *   now_playing.elapsed            → current.elapsedSec
 *   playing_next.song.{artist,title} → next[0]
 *   song_history[].song.{...}      → history[]
 *   live.is_live                   → isLive
 *   listeners.current              → listeners
 */

/** Un morceau (courant, historique ou à venir). */
export type RadioTrack = {
  artist: string;
  title: string;
  artUrl?: string; // pochette
  genre?: string;
};

/** Morceau en cours avec progression. */
export type RadioCurrentTrack = RadioTrack & {
  durationSec: number; // durée totale
  elapsedSec: number; // temps écoulé (pour barre de progression)
};

/** État complet du now playing. */
export type RadioNowPlaying = {
  /** Morceau actuellement diffusé. */
  current: RadioCurrentTrack;
  /** Prochains morceaux (pour le ticker "UP NEXT"). */
  next: RadioTrack[];
  /** Historique des derniers morceaux joués (pour le dropdown). */
  history: RadioTrack[];
  /** True si un DJ est en live (vs playlist auto). */
  isLive: boolean;
  /** Nombre d'auditeurs actuels. */
  listeners: number;
  /** URL du flux audio à lire (mp3/aac). */
  streamUrl: string;
};
