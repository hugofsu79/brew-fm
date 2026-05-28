/**
 * EventCard — tuile représentant un événement Brew FM.
 *
 * Brique réutilisable affichée en grille sur la page /events (à venir + archives).
 * Au click → ouvre la page Shotgun de l'event (nouvel onglet).
 *
 * Affiche : image de couverture, badge type de lieu (☕ coffee shop / 🎉 club…),
 * titre, date formatée, nom du lieu.
 *
 * Données : type `Event` (source Shotgun + enrichissement Notion).
 * Aucune dépendance aux artistes/relations Notion → utilisable dès maintenant.
 *
 * Server Component (pas d'interactivité JS) — un simple <a>.
 */

import type { Event, EventTypeOfPlace } from "@/types/domain/event";

/** Mapping type de lieu → badge (emoji + label). Tout sauf coffee_shop = 🎉. */
const PLACE_BADGE: Record<EventTypeOfPlace, { emoji: string; label: string }> = {
  coffee_shop: { emoji: "☕", label: "Coffee shop" },
  club: { emoji: "🎉", label: "Club" },
  concert: { emoji: "🎉", label: "Concert" },
  festival: { emoji: "🎉", label: "Festival" },
  warehouse: { emoji: "🎉", label: "Warehouse" },
  open_air: { emoji: "🎉", label: "Open air" },
  other: { emoji: "🎉", label: "Event" },
};

/** Formate une date ISO → "Sam. 14 juin 2026". */
function formatEventDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Résout le nom du lieu : priorité au lieu Notion enrichi, sinon nom Shotgun brut. */
function resolveVenueName(event: Event): string | null {
  return event.brewVenue?.name ?? event.shotgunVenueName ?? null;
}

export function EventCard({ event }: { event: Event }) {
  const badge = PLACE_BADGE[event.typeOfPlace];
  const venueName = resolveVenueName(event);

  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-xl border border-foreground/10 bg-background transition-colors hover:border-foreground/30"
    >
      {/* Image de couverture */}
      <div className="relative aspect-[4/3] overflow-hidden bg-foreground/5">
        {event.coverUrl ? (
          // biome-ignore lint/performance/noImgElement: image externe Shotgun, next/image optionnel en V1
          <img
            src={event.coverUrl}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-foreground/30">
            <span className="text-3xl">{badge.emoji}</span>
          </div>
        )}

        {/* Badge type de lieu */}
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
          {badge.emoji} {badge.label}
        </span>

        {/* Badge annulé (si applicable) */}
        {event.isCancelled && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600/90 px-2.5 py-1 text-xs font-semibold text-white">
            Annulé
          </span>
        )}
      </div>

      {/* Infos */}
      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">{event.name}</h3>
        <p className="mt-2 text-sm text-foreground/60">{formatEventDate(event.startTime)}</p>
        {venueName && <p className="mt-0.5 truncate text-sm text-foreground/60">{venueName}</p>}
      </div>
    </a>
  );
}
