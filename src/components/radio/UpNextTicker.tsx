/**
 * UpNextQueue — File d'attente "UP NEXT" en bas du hero radio.
 *
 * PAS de défilement animé : liste statique des prochains morceaux.
 *   - Le 1er (tout prochain) → opacité 100%
 *   - Les suivants           → opacité 40% (effet "ça arrive mais flou",
 *                              l'auditeur ne lit pas précisément l'avenir)
 *
 * Quand un morceau se termine, c'est la donnée now playing qui se met à jour
 * (le prochain devient le courant) — pas d'animation de remplacement ici.
 *
 * Fond vert clair, label "UP NEXT →" fixe à gauche.
 * Server Component (aucune interactivité).
 */

import type { RadioTrack } from "@/types/domain/radio";

const ACID = "#A6FF3E";
const BREW_BLACK = "#05180A";

export function UpNextTicker({ tracks }: { tracks: RadioTrack[] }) {
  if (tracks.length === 0) return null;

  return (
    <div
      className="flex items-center gap-2 overflow-hidden border-t border-black/10 py-3"
      style={{ backgroundColor: "#EAFBD4", color: BREW_BLACK }}
    >
      {/* Label fixe "UP NEXT →" */}
      <span className="shrink-0 px-4 text-sm font-black uppercase italic tracking-tight sm:px-6 sm:text-base">
        Up next →
      </span>

      {/* File statique : 1er à 100%, le reste à 40% */}
      <div className="flex min-w-0 items-center gap-5 overflow-hidden whitespace-nowrap sm:gap-8">
        {tracks.map((track, i) => (
          <span
            key={`${track.artist}-${track.title}`}
            className="flex shrink-0 items-center gap-5 text-sm font-bold uppercase tracking-tight transition-opacity sm:gap-8 sm:text-base"
            style={{ opacity: i === 0 ? 1 : 0.4 }}
          >
            <span>
              {track.artist} <span className="opacity-50">·</span> {track.title}
            </span>
            {/* séparateur acide entre les morceaux (pas après le dernier) */}
            {i < tracks.length - 1 && (
              <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: ACID }} />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
