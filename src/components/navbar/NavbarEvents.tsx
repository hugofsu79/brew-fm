"use client";

/**
 * Dropdown "Nos prochains events" (zone droite de la navbar).
 *
 * Affiche la liste des events Shotgun à venir. Au click sur un item → ouvre la
 * page event Shotgun (nouvel onglet). Lien "Voir tous nos events" en bas →
 * page organisateur Shotgun.
 *
 * Fallback (aucun event à venir) : message "Pas d'event à venir" + lien archives.
 *
 * Client Component car interactif (état ouvert/fermé, fermeture au clic dehors
 * et touche Échap). Reçoit les données déjà résolues côté serveur en props →
 * aucun credential ni fetch ici.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Event } from "@/types/domain/event";

/** Lien vers la page organisateur Shotgun (à ajuster avec ton slug réel). */
const SHOTGUN_ORGANIZER_URL = "https://shotgun.live/fr/organizers/brew-fm";

/** Formate une date ISO → "Sam. 14 juin · 21h00". */
function formatEventDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function NavbarEvents({ events }: { events: Event[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fermeture au clic en dehors + touche Échap
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const hasEvents = events.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 rounded-full border border-foreground/15 px-3 py-1.5 text-sm font-medium transition-colors hover:border-foreground/40 hover:bg-foreground/5"
      >
        <span>Nos prochains events</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-xl border border-foreground/10 bg-background shadow-xl"
        >
          {hasEvents ? (
            <>
              <ul className="max-h-80 overflow-y-auto py-1">
                {events.map((event) => (
                  <li key={event.id}>
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2.5 transition-colors hover:bg-foreground/5"
                    >
                      <span className="block text-sm font-medium leading-snug">{event.name}</span>
                      <span className="mt-0.5 block text-xs text-foreground/60">
                        {formatEventDate(event.startTime)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href={SHOTGUN_ORGANIZER_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block border-t border-foreground/10 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                Voir tous nos events →
              </a>
            </>
          ) : (
            <div className="px-4 py-5 text-center">
              <p className="text-sm text-foreground/60">Pas d&apos;event à venir</p>
              <Link
                href="/events"
                onClick={() => setOpen(false)}
                className="mt-1 inline-block text-xs font-semibold uppercase tracking-wide text-foreground/80 underline-offset-2 hover:underline"
              >
                Voir les archives →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
