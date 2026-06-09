"use client";

/**
 * Dropdown "Nos prochains events" (zone droite de la navbar).
 *
 * Panel ouvert : fond vert acide, typo vert foncé, SANS border ni border-radius.
 * (Le bouton trigger garde son style actuel.)
 *
 * Affiche les events Shotgun à venir. Click item → page event Shotgun.
 * Fallback : "Pas d'event à venir" + lien archives.
 *
 * Client Component (état ouvert/fermé, fermeture clic dehors + Échap).
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Event } from "@/types/domain/event";

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
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-80 bg-[var(--color-brew-acid)] text-[var(--color-brew-black)]"
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
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden bg-[#A6FF3E] text-[#05180A]"
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
                      className="block px-4 py-2.5 transition-colors hover:bg-[#05180A]/10"
                    >
                      <span className="block text-sm font-semibold uppercase leading-snug">
                        {event.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-[#05180A]/70">
                        {formatEventDate(event.startTime)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href="https://shotgun.live/fr/venues/brew"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block border-t border-[#05180A]/15 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wide transition-colors hover:bg-[#05180A]/10"
              >
                Voir tous nos events →
              </a>
            </>
          ) : (
            <div className="px-4 py-5 text-center">
              <p className="text-sm text-[#05180A]/70">Pas d&apos;event à venir</p>
              <Link
                href="/events"
                onClick={() => setOpen(false)}
                className="mt-1 inline-block text-xs font-bold uppercase tracking-wide underline-offset-2 hover:underline"
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
