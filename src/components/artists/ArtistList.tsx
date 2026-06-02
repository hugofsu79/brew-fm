"use client";

import { useState } from "react";
import type { Artist } from "@/types/domain/artist";

function formatPassageDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ArtistList({ artists }: { artists: Artist[] }) {
  const sorted = [...artists].sort((a, b) =>
    a.name.localeCompare(b.name, "fr", { sensitivity: "base" }),
  );

  const [hoveredArtist, setHoveredArtist] = useState<Artist | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent) {
    setMousePos({ x: e.clientX, y: e.clientY });
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: tracking pour la miniature, pas une vraie interaction
    <div className="relative" onMouseMove={handleMouseMove}>
      <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
        {sorted.map((artist) => {
          const lastPassage = artist.passageVideos[0];
          const hasYoutube = Boolean(lastPassage?.urls[0]);

          return (
            <li
              key={artist.id}
              onMouseEnter={() => setHoveredArtist(artist)}
              onMouseLeave={() => setHoveredArtist(null)}
              className="group transition-colors hover:bg-foreground/5"
            >
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-2 py-3 sm:grid-cols-[2fr_2fr_auto] sm:gap-6 sm:py-4">
                <div className="font-semibold uppercase tracking-wide">{artist.name}</div>

                <div className="hidden text-sm text-foreground/60 sm:block">
                  {lastPassage ? (
                    <>
                      <span className="font-medium text-foreground/80">
                        {lastPassage.sourceName}
                      </span>
                      <span className="ml-2 text-xs text-foreground/50">
                        · {formatPassageDate(lastPassage.date)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs italic text-foreground/40">
                      Pas encore de passage publié
                    </span>
                  )}
                </div>

                <div className="justify-self-end">
                  {hasYoutube ? (
                    <a
                      href={lastPassage.urls[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 px-3 py-1 text-xs font-medium uppercase tracking-wide transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                    >
                      Voir
                      <span aria-hidden="true">→</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-foreground/30">
                      —
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {hoveredArtist?.photoUrl && (
        <div
          className="pointer-events-none fixed z-50 hidden h-32 w-24 overflow-hidden rounded-md shadow-2xl ring-1 ring-foreground/10 sm:block"
          style={{
            left: `${mousePos.x + 20}px`,
            top: `${mousePos.y + 20}px`,
            transition: "transform 0.15s ease-out",
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: image externe */}
          <img
            src={hoveredArtist.photoUrl}
            alt={hoveredArtist.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
