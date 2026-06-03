"use client";

/**
 * ArtistList — Vue tableau alphabétique des artistes invités.
 *
 * Layout desktop/tablet : 2/3 (liste) + 1/3 (image sticky centrée verticalement).
 * Layout mobile : liste seule (pas d'image).
 *
 * Fonctionnalités :
 *   - Champ recherche en haut filtre les noms à la volée (insensible casse/accents)
 *   - Lignes opacité 40% par défaut, 100% au hover (transition douce)
 *   - Image de l'artiste hover affichée dans la colonne droite, sticky centrée
 *   - Crossfade entre deux photos (transition de 500ms)
 *   - Clic "Voir" : URL YouTube du passage le plus récent (nouvel onglet)
 */

import { useEffect, useMemo, useState } from "react";
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

/** Normalise une chaîne pour matching insensible accent/casse. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function ArtistList({ artists }: { artists: Artist[] }) {
  const [query, setQuery] = useState("");
  const [hoveredArtist, setHoveredArtist] = useState<Artist | null>(null);

  // Tri alphabétique stable
  const sorted = useMemo(
    () => [...artists].sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" })),
    [artists],
  );

  // Filtre par recherche
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return sorted;
    return sorted.filter((a) => normalize(a.name).includes(q));
  }, [sorted, query]);

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {/* COLONNE GAUCHE : image sticky centrée (desktop/tablet uniquement) */}
      <aside className="hidden md:block">
        <div className="sticky top-[50vh] -translate-y-1/2">
          <StickyArtistImage artist={hoveredArtist} />
        </div>
      </aside>
      {/* COLONNE DROITE : recherche + liste (2/3 sur md+) */}
      <div className="md:col-span-2">
        {/* Champ recherche */}
        <div className="mb-6">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un artiste…"
            className="w-full rounded-full border border-foreground/15 bg-transparent px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground/40 focus:border-foreground/40"
            aria-label="Rechercher un artiste"
          />
          {query && (
            <p className="mt-2 text-xs text-foreground/50">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm italic text-foreground/40">
            Aucun artiste ne correspond à « {query} »
          </p>
        ) : (
          <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
            {filtered.map((artist) => {
              const lastPassage = artist.passageVideos[0];
              const hasYoutube = Boolean(lastPassage?.urls[0]);
              const isHovered = hoveredArtist?.id === artist.id;

              return (
                <li
                  key={artist.id}
                  onMouseEnter={() => setHoveredArtist(artist)}
                  onMouseLeave={() => setHoveredArtist(null)}
                  className={`transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-2 py-3 sm:grid-cols-[2fr_2fr_auto] sm:gap-6 sm:py-4">
                    {/* Nom */}
                    <div className="font-semibold uppercase tracking-wide">{artist.name}</div>

                    {/* Passage récent (caché en mobile) */}
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

                    {/* CTA */}
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
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sous-composant : image sticky avec crossfade entre 2 artistes
// ---------------------------------------------------------------------------

/**
 * Affiche la photo de l'artiste hover avec un crossfade fluide.
 *
 * Technique : on garde 2 layers superposés (A et B). Quand l'artiste change,
 * on écrit la nouvelle photo dans le layer "caché" puis on bascule l'opacité.
 * Ainsi l'ancienne image s'estompe pendant que la nouvelle apparaît, sans
 * remount du DOM (transition CSS native, GPU-accelerated).
 */
function StickyArtistImage({ artist }: { artist: Artist | null }) {
  const [layerA, setLayerA] = useState<{ src: string; name: string } | null>(null);
  const [layerB, setLayerB] = useState<{ src: string; name: string } | null>(null);
  const [showA, setShowA] = useState(true);

  // Crossfade : à chaque changement d'artiste, on écrit dans le layer caché
  // puis on bascule l'opacité.
  // biome-ignore lint/correctness/useExhaustiveDependencies: showA est volontairement hors deps (on lit la valeur courante et on inverse)
  useEffect(() => {
    if (!artist?.photoUrl) return;
    const newLayer = { src: artist.photoUrl, name: artist.name };
    if (showA) {
      setLayerB(newLayer);
    } else {
      setLayerA(newLayer);
    }
    setShowA(!showA);
  }, [artist?.id, artist?.photoUrl]);

  return (
    <div className="relative aspect-[287/346] w-full overflow-hidden rounded-md bg-foreground/5">
      {/* Layer A */}
      {layerA && (
        // biome-ignore lint/performance/noImgElement: image externe
        <img
          src={layerA.src}
          alt={layerA.name}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            showA ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      {/* Layer B */}
      {layerB && (
        // biome-ignore lint/performance/noImgElement: image externe
        <img
          src={layerB.src}
          alt={layerB.name}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            showA ? "opacity-0" : "opacity-100"
          }`}
        />
      )}
      {/* État vide : aucune hover encore */}
      {!layerA && !layerB && (
        <div className="absolute inset-0 flex items-center justify-center text-center text-xs uppercase tracking-wide text-foreground/30">
          Survole un artiste
        </div>
      )}
    </div>
  );
}
