/**
 * Statut Twitch pour la navbar (zone droite).
 *
 * Cascade de résolution :
 *   1. Live Twitch en cours (API /streams réelle) → kind="live"  🔴
 *   2. Sinon, prochaine émission Notion à venir   → kind="upcoming"  ⏳ countdown
 *   3. Sinon                                       → null (zone masquée)
 *
 * Sources :
 *   - "live"     : getCurrentStream() (stream.ts) — API Twitch Helix réelle
 *   - "upcoming" : fetchUpcomingEpisodes() (episodes.ts) — base Notion Émissions
 *                  Twitch n'expose PAS son calendrier via API publique
 *                  (endpoint /schedule = OAuth user + scope, trop lourd pour
 *                  2 lives/mois), d'où Notion comme source de planning.
 *
 * Titre "upcoming" : on résout le 1er invité (guestId → base Artistes) pour
 * construire "{format} {nom}" → ex: "Un café avec Mathilde". Si pas d'invité
 * résolu, fallback sur le format seul, puis sur le numéro d'émission.
 *
 * La signature (Promise<TwitchStatus | null>) ne change pas → ZÉRO modif
 * côté UI (NavbarTwitch gère déjà live / countdown).
 *
 * Caching : hérité des sources (Twitch ~30s, Notion ~1h).
 */

import { fetchArtists } from "@/lib/notion/artists";
import { fetchUpcomingEpisodes } from "@/lib/notion/episodes";
import { getCurrentStream } from "@/lib/twitch/stream";
import type { TwitchStatus } from "@/types/domain/twitch-status";

const TWITCH_CHANNEL = "https://twitch.tv/brew_fm";

/**
 * Construit le titre d'une émission à venir.
 * Préférence : "{format} {nomInvité}" (ex: "Un café avec Mathilde").
 * Fallbacks : format seul → numéro d'émission.
 */
function buildEpisodeTitle(
  format: string | undefined,
  guestName: string | undefined,
  fallbackNumber: string,
): string {
  if (format && guestName) return `${format} ${guestName}`;
  if (format) return format;
  return fallbackNumber;
}

/**
 * Retourne le statut Twitch courant, ou null si rien à afficher.
 */
export async function getTwitchStatus(): Promise<TwitchStatus | null> {
  // --- 1. Live en cours ? (priorité absolue) ---
  const stream = await getCurrentStream();
  if (stream) {
    return {
      kind: "live",
      title: stream.title,
      channelUrl: stream.channelUrl,
    };
  }

  // --- 2. Prochaine émission programmée (Notion Émissions) ---
  const upcoming = await fetchUpcomingEpisodes();
  if (upcoming.length === 0) return null;

  // Tri par date croissante → la plus proche en premier
  const next = [...upcoming].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )[0];

  if (!next?.date) return null;

  // Résolution du nom du 1er invité (guestId → base Artistes)
  let guestName: string | undefined;
  const firstGuestId = next.guestIds[0];
  if (firstGuestId) {
    const artists = await fetchArtists();
    guestName = artists.find((a) => a.id === firstGuestId)?.name;
  }

  return {
    kind: "upcoming",
    title: buildEpisodeTitle(next.format, guestName, next.number),
    startsAt: next.date,
    channelUrl: TWITCH_CHANNEL,
  };
}
