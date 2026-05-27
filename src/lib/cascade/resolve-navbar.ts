/**
 * Orchestrateur de la cascade navbar.
 *
 * Construit la liste des items affichés dans la navbar à partir
 * de 3 sources en parallèle :
 *   1. Live Twitch en cours (priorité absolue, badge 🔴)
 *   2. Émissions Notion programmées (badge 📻)
 *   3. Events Shotgun à venir (badge 🎫)
 *
 * Si tout est vide → fallback sur le dernier event passé (badge ☕).
 *
 * Pattern UI :
 *   - `primary` = item principal affiché dans la navbar
 *   - `agenda`  = liste complète triée pour le dropdown
 */

import { fetchUpcomingEpisodes } from "@/lib/notion/episodes";
import { fetchShotgunEvents } from "@/lib/shotgun/client";
import { mapShotgunEvents } from "@/lib/shotgun/mapper";
import { getCurrentStream } from "@/lib/twitch/stream";
import type { Event } from "@/types/domain/event";
import type { NavbarItem } from "@/types/domain/navbar-item";

const TWITCH_CHANNEL = "https://twitch.tv/brew_fm";

/**
 * Formate une date ISO pour affichage navbar.
 * Ex: "2026-06-14T21:00:00Z" → "Sam. 14 juin · 21h00"
 */
function formatDate(iso: string): string {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return iso;
  }
}

/**
 * Récupère le dernier event Shotgun passé (pour le fallback navbar).
 */
async function getLastPastEvent(): Promise<Event | null> {
  const raws = await fetchShotgunEvents({ pastEvents: true, limit: 1 });
  const events = mapShotgunEvents(raws);
  return events[0] ?? null;
}

/**
 * Récupère les events Shotgun futurs.
 */
async function getUpcomingShotgunEvents(): Promise<Event[]> {
  const raws = await fetchShotgunEvents({ pastEvents: false, limit: 20 });
  const events = mapShotgunEvents(raws);
  return events.filter((e) => !e.isPast && !e.isCancelled);
}

/**
 * Construit l'item navbar pour un stream Twitch live.
 */
function buildLiveItem(streamTitle: string): NavbarItem {
  return {
    kind: "live",
    badge: "🔴",
    title: `EN DIRECT — ${streamTitle}`,
    url: TWITCH_CHANNEL,
    // pas de startTime → flotte en tête au tri
  };
}

/**
 * Construit l'item navbar pour une émission Notion.
 */
function buildEpisodeItem(args: {
  displayTitle: string;
  date: string;
  twitchUrl?: string;
}): NavbarItem {
  return {
    kind: "episode",
    badge: "📻",
    title: args.displayTitle,
    subtitle: formatDate(args.date),
    url: args.twitchUrl ?? TWITCH_CHANNEL,
    startTime: args.date,
  };
}

/**
 * Construit l'item navbar pour un event Shotgun.
 */
function buildEventItem(event: Event): NavbarItem {
  return {
    kind: "event",
    badge: "🎫",
    title: event.name,
    subtitle: formatDate(event.startTime),
    url: event.url,
    startTime: event.startTime,
  };
}

/**
 * Construit l'item fallback "Retour sur [event passé]".
 */
function buildPastEventItem(event: Event): NavbarItem {
  return {
    kind: "past_event",
    badge: "☕",
    title: `Retour sur ${event.name}`,
    subtitle: formatDate(event.startTime),
    url: event.url,
  };
}

/**
 * Résultat de la cascade : item principal + agenda complet.
 */
export type NavbarResolution = {
  primary: NavbarItem | null;
  agenda: NavbarItem[];
};

/**
 * Orchestre la cascade navbar.
 *
 * Caching : hérité des sources (Twitch 30s, Notion 1h, Shotgun 5min).
 * Cette fonction n'ajoute pas de cache supplémentaire.
 */
export async function resolveNavbarItems(): Promise<NavbarResolution> {
  // 1. Fetch en parallèle (les caches Next.js gèrent le reste)
  const [live, episodes, upcomingEvents] = await Promise.all([
    getCurrentStream(),
    fetchUpcomingEpisodes(),
    getUpcomingShotgunEvents(),
  ]);

  const items: NavbarItem[] = [];

  // 2. Item live (priorité absolue, pas de startTime)
  if (live) {
    items.push(buildLiveItem(live.title));
  }

  // 3. Items émissions
  for (const ep of episodes) {
    items.push(
      buildEpisodeItem({
        displayTitle: ep.displayTitle,
        date: ep.date,
        twitchUrl: ep.twitchUrl,
      }),
    );
  }

  // 4. Items events Shotgun
  for (const ev of upcomingEvents) {
    items.push(buildEventItem(ev));
  }

  // 5. Tri par date croissante (live en tête car pas de startTime)
  const sorted = items.sort((a, b) => {
    if (!a.startTime) return -1;
    if (!b.startTime) return 1;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  // 6. Fallback si tout est vide → dernier event passé
  if (sorted.length === 0) {
    const lastPast = await getLastPastEvent();
    if (lastPast) {
      const fallback = buildPastEventItem(lastPast);
      return { primary: fallback, agenda: [] };
    }
    return { primary: null, agenda: [] };
  }

  return {
    primary: sorted[0],
    agenda: sorted,
  };
}
