/**
 * Résolution des données navbar.
 *
 * Deux zones INDÉPENDANTES (plus de cascade "primary" mélangée) :
 *   - `events` : events Shotgun à venir UNIQUEMENT → alimente le dropdown
 *                "Nos prochains events".
 *   - `twitch` : statut live OU prochain live → alimente la zone Twitch (droite).
 *
 * Pourquoi deux zones séparées :
 *   Le dropdown promet "events" → il ne doit donc contenir QUE des events
 *   Shotgun, pas d'émissions ni de badge live (sinon le label ment).
 *   Le live/countdown vit dans sa propre zone à droite.
 *
 * Sources :
 *   - Shotgun (events à venir) → réel, déjà audité
 *   - getTwitchStatus()       → MOCK pour l'instant (2FA équipe bloquée)
 *
 * NOTE : la date du "prochain live" (kind=upcoming) provient à terme de
 * Notion Émissions. Tant que le mock Twitch est en place, il fournit lui-même
 * une date factice. Quand on câblera Notion, on enrichira ici la branche
 * "upcoming" avec fetchUpcomingEpisodes() pour fixer startsAt/title réels.
 */

import { fetchShotgunEvents } from "@/lib/shotgun/client";
import { mapShotgunEvents } from "@/lib/shotgun/mapper";
import { getTwitchStatus } from "@/lib/twitch/status";
import type { Event } from "@/types/domain/event";
import type { TwitchStatus } from "@/types/domain/twitch-status";

/**
 * Récupère les events Shotgun futurs (non passés, non annulés), triés par
 * date croissante (le plus proche en premier).
 */
async function getUpcomingShotgunEvents(): Promise<Event[]> {
  const raws = await fetchShotgunEvents({ pastEvents: false, limit: 20 });
  const events = mapShotgunEvents(raws);
  return events
    .filter((e) => !e.isPast && !e.isCancelled)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

/**
 * Données prêtes pour la navbar.
 */
export type NavbarResolution = {
  /** Events Shotgun à venir (peut être vide → fallback géré côté UI). */
  events: Event[];
  /** Statut Twitch (live/upcoming) ou null si rien à afficher. */
  twitch: TwitchStatus | null;
};

/**
 * Orchestre les deux zones navbar en parallèle.
 *
 * Caching : hérité des sources (Shotgun ~5min, Twitch ~30s à terme).
 */
export async function resolveNavbarItems(): Promise<NavbarResolution> {
  const [events, twitch] = await Promise.all([getUpcomingShotgunEvents(), getTwitchStatus()]);

  return { events, twitch };
}
