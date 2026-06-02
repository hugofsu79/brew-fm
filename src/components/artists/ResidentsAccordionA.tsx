"use client";

/**
 * ResidentsAccordionA — Variante "photo seule au repos".
 *
 * État repos  : 5 cards égales, juste la photo (aucun texte visible).
 * État hover  : la card hover s'étend à ~60% de largeur, révèle nom + bio + liens.
 *               Les autres se compressent à ~10% chacune.
 *
 * Pattern technique : flex avec flex-grow modulable par card.
 * - Au repos : toutes flex-grow:1 (parts égales)
 * - Au hover : la hover passe à flex-grow:6, les autres restent à 1
 *
 * Mobile : stack vertical, chaque card pleine largeur, contenu toujours visible.
 */

import { useState } from "react";
import type { Artist } from "@/types/domain/artist";

function ArtistLinks({ artist }: { artist: Artist }) {
  const links = [
    { label: "Instagram", url: artist.instagram },
    { label: "Soundcloud", url: artist.soundcloud },
    { label: "Spotify", url: artist.spotify },
    { label: "Shotgun", url: artist.shotgunUrl },
    { label: "Linktree", url: artist.linktree },
  ].filter((l) => l.url);

  return (
    <ul className="space-y-1 text-right text-xs font-semibold uppercase tracking-wider">
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 transition-colors hover:text-white"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ResidentsAccordionA({ residents }: { residents: Artist[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <>
      {/* DESKTOP : accordion horizontal */}
      <div className="hidden h-[70vh] gap-2 sm:flex">
        {residents.map((artist) => {
          const isHovered = hoveredId === artist.id;
          const isAnyHovered = hoveredId !== null;

          return (
            <button
              type="button"
              key={artist.id}
              onMouseEnter={() => setHoveredId(artist.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative overflow-hidden rounded-md bg-foreground/10 text-left transition-[flex-grow] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                flexGrow: isHovered ? 6 : 1,
                flexBasis: 0,
              }}
            >
              {/* Photo background */}
              {/* biome-ignore lint/performance/noImgElement: image externe */}
              <img
                src={artist.photoUrl}
                alt={artist.name}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Overlay sombre légère pour lisibilité au hover */}
              <div
                className={`absolute inset-0 from-black/80 via-black/30 to-transparent transition-opacity duration-500 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Contenu révélé au hover */}
              <div
                className={`absolute inset-0 flex flex-col justify-between p-6 transition-opacity duration-500 ${
                  isHovered ? "opacity-100 delay-200" : "opacity-0 delay-0"
                }`}
              >
                <h3 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                  {artist.name}
                </h3>

                <div className="flex items-end justify-between gap-6">
                  {artist.bioShort && (
                    <p className="max-w-md text-xs uppercase leading-relaxed tracking-wide text-white/90">
                      {artist.bioShort.slice(0, 280)}
                      {artist.bioShort.length > 280 && "…"}
                    </p>
                  )}
                  <ArtistLinks artist={artist} />
                </div>
              </div>

              {/* Hint nom en petit quand aucune card n'est hover */}
              <div
                className={`absolute bottom-3 left-3 text-xs font-bold uppercase tracking-wide text-white/0 transition-colors duration-300 ${
                  !isAnyHovered ? "text-white/40" : ""
                }`}
              >
                {/* invisible jusqu'au hover global */}
              </div>
            </button>
          );
        })}
      </div>

      {/* MOBILE : stack vertical */}
      <div className="flex flex-col gap-4 sm:hidden">
        {residents.map((artist) => (
          <div
            key={artist.id}
            className="relative aspect-[3/4] overflow-hidden rounded-md bg-foreground/10"
          >
            {/* biome-ignore lint/performance/noImgElement: image externe */}
            <img
              src={artist.photoUrl}
              alt={artist.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <h3 className="mb-2 text-2xl font-black uppercase text-white">{artist.name}</h3>
              {artist.bioShort && (
                <p className="mb-3 text-xs uppercase leading-relaxed tracking-wide text-white/90">
                  {artist.bioShort.slice(0, 200)}
                  {artist.bioShort.length > 200 && "…"}
                </p>
              )}
              <ArtistLinks artist={artist} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
