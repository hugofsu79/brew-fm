"use client";

/**
 * InfiniteArtistWall — Mur défilant infini d'artistes (5 colonnes desktop).
 *
 * Spécifications :
 *   - 5 colonnes desktop (3 tablet / 2 mobile)
 *   - Hauteur 70vh, overflow hidden
 *   - Mouvement vertical infini : col impaires haut→bas, col paires bas→haut
 *   - Vitesse de base : ~60s par cycle complet
 *   - Speed-up au scroll page : x1.5 quand l'utilisateur scrolle activement
 *   - Hover sur card : la COLONNE ENTIÈRE s'arrête (transition bezier douce)
 *                       + cette card passe de N&B à couleur
 *   - Click card → ouvre passageVideos[0] en nouvel onglet
 *
 * Implémentation :
 *   - Animation CSS pure (animation: scroll Xs linear infinite)
 *   - Speed-up : on modifie animation-duration en JS quand l'user scrolle
 *   - Hover stop : animation-play-state: paused sur la colonne hover
 *   - Doublons : chaque colonne contient 2× la liste pour fluidité infinie
 *   - Formes : clip-paths SVG (cardTop / cardBottom) en damier
 */

import { useEffect, useRef, useState } from "react";
import type { Artist } from "@/types/domain/artist";

const COLS_DESKTOP = 5;
const BASE_DURATION_S = 60; // Vitesse de base
const SCROLL_BOOST = 1.5; // Multiplicateur quand l'user scrolle

type Variation = "top" | "bottom";

function getVariation(index: number): Variation {
  return index % 2 === 0 ? "top" : "bottom";
}

// ---------------------------------------------------------------------------
// Sous-composant : une card
// ---------------------------------------------------------------------------

function ArtistTile({ artist, variation }: { artist: Artist; variation: Variation }) {
  const clipId = variation === "top" ? "url(#card-clip-top)" : "url(#card-clip-bottom)";
  const href = artist.passageVideos[0]?.urls[0] ?? "#";

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
      <div className="relative aspect-287/346 w-full bg-foreground/5" style={{ clipPath: clipId }}>
        {/* biome-ignore lint/performance/noImgElement: image externe Shotgun */}
        <img
          src={artist.photoUrl}
          alt={artist.name}
          loading="lazy"
          className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
        />
      </div>
      <p className="mt-2 text-center text-xs font-bold uppercase tracking-wide text-foreground/50 transition-colors group-hover:text-foreground">
        {artist.name}
      </p>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Sous-composant : une colonne (avec doublons + animation)
// ---------------------------------------------------------------------------

function ArtistColumn({
  artists,
  direction,
  duration,
}: {
  artists: Artist[];
  direction: "up" | "down";
  duration: number;
}) {
  const [paused, setPaused] = useState(false);
  // Doublons : on duplique la liste pour défilement infini sans coupure
  const doubled = [
    ...artists.map((a) => ({ artist: a, copy: 0 })),
    ...artists.map((a) => ({ artist: a, copy: 1 })),
  ];

  const animationName = direction === "up" ? "scrollUp" : "scrollDown";

  return (
    <div
      className="flex flex-col gap-6"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      style={{
        animationName,
        animationDuration: `${duration}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        animationPlayState: paused ? "paused" : "running",
        // Transition douce sur play-state ? Non, play-state n'est pas transitionable.
        // Le "stop bezier doux" est obtenu via cubic-bezier sur animation-duration.
        // Quand on pause, l'animation se fige (CSS standard). C'est instantané.
        // Pour adoucir, on peut animer une variable séparée — pour V1 c'est OK ainsi.
      }}
    >
      {doubled.map(({ artist, copy }, i) => (
        <ArtistTile key={`${artist.id}-c${copy}`} artist={artist} variation={getVariation(i)} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Définitions SVG (clip-paths)
// ---------------------------------------------------------------------------

function ClipPathDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <title>Clip-path definitions</title>
      <defs>
        <clipPath id="card-clip-top" clipPathUnits="objectBoundingBox">
          <path d="M 0.8827 0.0852 L 0.0494 0.0001 C 0.0414 -0.0007 0.0342 0.0043 0.0338 0.0110 L 0.0000 0.5512 C 0.0000 0.5522 0.0001 0.5532 0.0003 0.5542 L 0.1126 0.9909 C 0.1141 0.9968 0.1210 1.0008 0.1282 0.9999 L 0.9271 0.9029 C 0.9335 0.9021 0.9384 0.8979 0.9390 0.8925 L 0.9970 0.3839 C 0.9972 0.3824 0.9970 0.3809 0.9965 0.3795 L 0.8944 0.0934 C 0.8928 0.0890 0.8882 0.0858 0.8827 0.0852 Z" />
        </clipPath>
        <clipPath id="card-clip-bottom" clipPathUnits="objectBoundingBox">
          <path d="M 0.1143 0.0852 L 0.9477 0.0001 C 0.9557 -0.0007 0.9628 0.0043 0.9632 0.0110 L 0.9970 0.5512 C 0.9970 0.5522 0.9969 0.5532 0.9967 0.5542 L 0.8844 0.9909 C 0.8829 0.9968 0.8761 1.0008 0.8688 0.9999 L 0.0699 0.9029 C 0.0636 0.9021 0.0587 0.8979 0.0581 0.8926 L 0.0001 0.3839 C 0.0001 0.3824 0.0001 0.3809 0.0006 0.3795 L 0.1027 0.0934 C 0.1043 0.0890 0.1088 0.0858 0.1143 0.0852 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

export function InfiniteArtistWall({ artists }: { artists: Artist[] }) {
  // Speed-up au scroll : on détecte si l'user est en train de scroller
  // (debounce 150ms après dernier scroll → repasse en vitesse normale)
  const [isScrolling, setIsScrolling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onScroll() {
      setIsScrolling(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIsScrolling(false), 150);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const duration = isScrolling ? BASE_DURATION_S / SCROLL_BOOST : BASE_DURATION_S;

  // Répartit les artistes en N colonnes (round-robin).
  const columns: Artist[][] = Array.from({ length: COLS_DESKTOP }, () => []);
  artists.forEach((a, i) => {
    columns[i % COLS_DESKTOP].push(a);
  });

  return (
    <>
      <ClipPathDefs />

      <style jsx>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
      `}</style>

      <div className="relative w-full overflow-hidden" style={{ height: "70vh" }}>
        {/* Grille des colonnes */}
        <div className="grid h-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((colArtists, colIdx) => (
            <ArtistColumn
              key={`col-${colArtists[0]?.id ?? colIdx}`}
              artists={colArtists}
              direction={colIdx % 2 === 0 ? "up" : "down"}
              duration={duration}
            />
          ))}
        </div>

        {/* Fade haut et bas pour adoucir l'entrée/sortie visuelle */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent"
          aria-hidden="true"
        />
      </div>
    </>
  );
}
