/**
 * EventCard — tuile événement Brew FM.
 *
 * Direction : brutaliste éditorial, inspiré Motion.js / Awwwards.
 *   - Zéro border-radius (angles droits partout)
 *   - Image plein cadre avec overlay texte en bas (pas de section "infos" séparée)
 *   - Hover : image zoom + ligne acide qui sweep de gauche à droite sous le titre
 *   - Badge type de lieu : typographie pure, uppercase, pas de pill
 *   - Titre en font-black large, date + lieu en petit tracking large
 *   - Ratio carré (1/1) — plus éditorial que 4/3
 *
 * Server Component — un simple <a>.
 */

import type { Event, EventTypeOfPlace } from "@/types/domain/event";

const PLACE_BADGE: Record<EventTypeOfPlace, { label: string }> = {
  coffee_shop: { label: "Coffee shop" },
  club: { label: "Club" },
  concert: { label: "Concert" },
  festival: { label: "Festival" },
  warehouse: { label: "Warehouse" },
  open_air: { label: "Open air" },
  other: { label: "Event" },
};

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

function resolveVenueName(event: Event): string | null {
  return event.brewVenue?.name ?? event.shotgunVenueName ?? null;
}

export default function EventCard({ event }: { event: Event }) {
  const badge = PLACE_BADGE[event.typeOfPlace];
  const venueName = resolveVenueName(event);

  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden bg-foreground/5"
    >
      {/* ── Image plein cadre ── */}
      <div className="relative aspect-square overflow-hidden">
        {event.coverUrl ? (
          // biome-ignore lint/performance/noImgElement: image externe Shotgun
          <img
            src={event.coverUrl}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          /* Fallback : fond texturé avec initiale */
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: "var(--color-brew-black)" }}
          >
            <span
              className="text-[8rem] font-black uppercase leading-none opacity-10"
              style={{ color: "var(--color-brew-acid)" }}
            >
              {event.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Voile dégradé bas → haut pour lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badge annulé */}
        {event.isCancelled && (
          <div className="absolute right-0 top-0 bg-red-600 px-2.5 py-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">
              Annulé
            </span>
          </div>
        )}

        {/* ── Infos superposées en bas ── */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          {/* Badge type de lieu — typographie pure, sans pill */}
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
            {badge.label}
          </p>

          {/* Titre + ligne sweep acide */}
          <div className="relative">
            <h3 className="text-xl font-black uppercase leading-tight tracking-tight text-white sm:text-2xl">
              {event.name}
            </h3>
            {/* Ligne acide — sweep gauche→droite au hover */}
            <span
              className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
              style={{ backgroundColor: "var(--color-brew-acid)" }}
              aria-hidden="true"
            />
          </div>

          {/* Date + lieu */}
          <div className="mt-3 flex items-center gap-3">
            <p className="text-[11px] font-medium uppercase tracking-widest text-white/60">
              {formatEventDate(event.startTime)}
            </p>
            {venueName && (
              <>
                <span className="h-px w-3 bg-white/30" aria-hidden="true" />
                <p className="truncate text-[11px] font-medium uppercase tracking-widest text-white/60">
                  {venueName}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
