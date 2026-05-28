/**
 * Page Événements (/events).
 *
 * Deux sections :
 *   - "À venir"  : events Shotgun futurs (non passés, non annulés)
 *   - "Archives" : events Shotgun passés (les plus récents d'abord)
 *
 * Données : fetch Shotgun côté serveur via fetchShotgunEvents + mapShotgunEvents.
 * Affichage : grille d'EventCard (4 col desktop / 2 tablet / 1 mobile).
 *
 * Server Component (async) : le fetch se fait côté serveur, caching Next.js natif.
 */

import { EventCard } from "@/components/cards/EventCard";
import { fetchShotgunEvents } from "@/lib/shotgun/client";
import { mapShotgunEvents } from "@/lib/shotgun/mapper";
import type { Event } from "@/types/domain/event";

/** Récupère et trie les events futurs (le plus proche d'abord). */
async function getUpcomingEvents(): Promise<Event[]> {
  const raws = await fetchShotgunEvents({ pastEvents: false, limit: 20 });
  return mapShotgunEvents(raws)
    .filter((e) => !e.isPast && !e.isCancelled)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

/** Récupère et trie les events passés (le plus récent d'abord). */
async function getPastEvents(): Promise<Event[]> {
  const raws = await fetchShotgunEvents({ pastEvents: true, limit: 50 });
  return mapShotgunEvents(raws)
    .filter((e) => e.isPast)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

/** Grille responsive d'EventCard. */
function EventGrid({ events }: { events: Event[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">Événements</h1>

      {/* À venir */}
      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold">À venir</h2>
        {upcoming.length > 0 ? (
          <EventGrid events={upcoming} />
        ) : (
          <p className="rounded-xl border border-foreground/10 bg-foreground/[0.02] px-4 py-8 text-center text-sm text-foreground/60">
            Pas d&apos;event à venir pour le moment. Reste connecté ☕
          </p>
        )}
      </section>

      {/* Archives */}
      <section>
        <h2 className="mb-6 text-xl font-semibold">Archives</h2>
        {past.length > 0 ? (
          <EventGrid events={past} />
        ) : (
          <p className="text-sm text-foreground/60">Aucune archive disponible.</p>
        )}
      </section>
    </main>
  );
}
