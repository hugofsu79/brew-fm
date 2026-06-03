/**
 * Statut Twitch pour la navbar.
 *
 * Câblé sur le vrai live Twitch via getCurrentStream() (stream.ts).
 *
 * Comportement actuel :
 *   - kind="live"  → un stream est EN COURS (data Twitch réelle)
 *   - null         → pas de live (la zone Twitch ne s'affiche pas)
 *
 * ⏳ La branche "upcoming" (prochain live programmé) n'est PAS encore câblée.
 *    Elle viendra de Notion Émissions (fetchUpcomingEpisodes) dans une passe
 *    dédiée. Tant qu'elle n'est pas branchée, on ne renvoie jamais "upcoming".
 *
 * La signature (Promise<TwitchStatus | null>) ne change pas → ZÉRO modif
 * côté UI (NavbarTwitch).
 *
 * Caching : hérité de getCurrentStream() (revalidate 30s côté Next.js).
 */

import { getCurrentStream } from "@/lib/twitch/stream";
import type { TwitchStatus } from "@/types/domain/twitch-status";

/**
 * Retourne le statut Twitch courant, ou null si rien à afficher.
 *
 * - Si un stream est en cours → kind="live" avec titre + URL chaîne.
 * - Sinon → null (pas de live, et upcoming pas encore câblé).
 */
export async function getTwitchStatus(): Promise<TwitchStatus | null> {
  const stream = await getCurrentStream();

  if (stream) {
    return {
      kind: "live",
      title: stream.title,
      channelUrl: stream.channelUrl,
    };
  }

  // Pas de live en cours.
  // TODO (passe Notion) : si pas de live, interroger fetchUpcomingEpisodes()
  // pour renvoyer un kind="upcoming" avec startsAt/title réels.
  return null;
}
