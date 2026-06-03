"use client";

/**
 * LieuxPageClient — Chef d'orchestre de la page Lieux.
 *
 * Tient l'état :
 *   - `format`    : côté du toggle actif (coffee_in_club par défaut)
 *   - `hoveredId` : lieu survolé → pilote le background plein écran ET l'opacité
 *
 * Structure visuelle :
 *   - Un background plein écran (fixed) qui crossfade vers la cover du lieu
 *     survolé. Invisible au repos (aucun hover).
 *   - Par-dessus : le titre toggle (slot-machine) + le mur de noms.
 *
 * Le background utilise un calque par lieu pour permettre un vrai crossfade
 * (pas de flash entre deux covers). Seul le calque du lieu hover est à
 * opacité 1, les autres à 0.
 *
 * Reçoit TOUS les lieux ; filtre par format côté client (bascule instantanée).
 */

import { useMemo, useState } from "react";
import type { Venue, VenueFormat } from "@/types/domain/venue";
import { VenueFormatToggle } from "./VenueFormatToggle";
import { VenueWall } from "./VenueWall";

const DEFAULT_FORMAT: VenueFormat = "coffee_in_club";

export function LieuxPageClient({ venues }: { venues: Venue[] }) {
  const [format, setFormat] = useState<VenueFormat>(DEFAULT_FORMAT);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => venues.filter((v) => v.format === format), [venues, format]);

  function toggleFormat() {
    setHoveredId(null);
    setFormat((prev) => (prev === "coffee_in_club" ? "club_in_coffee" : "coffee_in_club"));
  }

  const isHovering = hoveredId !== null;

  return (
    <div className="relative min-h-dvh">
      {/* ===== BACKGROUND PLEIN ÉCRAN (crossfade vers la cover hover) ===== */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-background">
        {filtered.map((venue) => (
          <div
            key={venue.id}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: hoveredId === venue.id ? 1 : 0 }}
          >
            {venue.coverUrl && (
              <>
                {/* biome-ignore lint/performance/noImgElement: image externe (Notion/Cloudinary) */}
                <img
                  src={venue.coverUrl}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
                {/* Voile sombre léger pour garder le texte lisible par-dessus */}
                <div className="absolute inset-0 bg-background/40" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* ===== CONTENU ===== */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        {/* Titre slot-machine */}
        <header className="mb-10">
          <VenueFormatToggle format={format} onToggle={toggleFormat} />
        </header>

        {/* Zone de texte / contexte */}
        <p
          className="mb-16 max-w-2xl text-base leading-relaxed text-foreground/60 transition-opacity duration-300 sm:text-lg"
          style={{ opacity: isHovering ? 0.3 : 1 }}
        >
          Brew FM s&apos;invite là où on ne l&apos;attend pas. On ramène l&apos;énergie du club dans
          les coffee shops de spécialité, et l&apos;esprit café dans les clubs. Chaque lieu est un
          terrain de jeu — survole un nom pour entrer dans l&apos;ambiance.
        </p>

        {/* Mur de noms */}
        <VenueWall venues={filtered} hoveredId={hoveredId} onHoverChange={setHoveredId} />
      </div>
    </div>
  );
}
