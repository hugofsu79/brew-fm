"use client";

/**
 * RadioHero — Player radio plein écran (home).
 *
 * Surface : STRICTEMENT la hauteur de l'écran (h-dvh). La navbar (overlay
 * fixed) et le ticker "UP NEXT" (overlay bottom) se superposent par-dessus.
 *
 * Thème SOMBRE (cohérent avec le reste du site) : fond brew black, texte/accents
 * via les tokens (foreground = acid). Aucune ombre portée.
 *
 * Layout :
 *   - Haut : navbar (overlay, gérée par le layout — pas ici)
 *   - Titre énorme (artiste) + sous-titre (morceau), sous la navbar
 *   - Historique (dropdown) en haut à droite, sous la navbar
 *   - Pochette + bouton play acide (centre)
 *   - Genre (bas gauche)
 *   - Onglet vertical "RECETTE DU JOUR" (droite)
 *   - Ticker "UP NEXT" (overlay bottom, intégré ici)
 *
 * Le bouton play contrôle un <audio> (streamUrl vide en mock → toggle visuel).
 */

import { ChevronDownIcon, PauseIcon, PlayIcon } from "lucide-react";
import { useRef, useState } from "react";
import type { RadioNowPlaying } from "@/types/domain/radio";
import { UpNextTicker } from "./UpNextTicker";

/** Historique des derniers morceaux (dropdown). */
function HistoryDropdown({ history }: { history: RadioNowPlaying["history"] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-foreground transition-opacity hover:opacity-60"
      >
        Historique
        <ChevronDownIcon
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-lg border border-foreground/10 bg-background">
          {history.map((track) => (
            <li
              key={`${track.artist}-${track.title}`}
              className="border-b border-foreground/5 px-4 py-2.5 last:border-0"
            >
              <p className="text-sm font-semibold uppercase leading-tight text-foreground">
                {track.artist}
              </p>
              <p className="text-xs text-foreground/50">{track.title}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RadioHero({ data }: { data: RadioNowPlaying }) {
  const { current, streamUrl } = data;
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !streamUrl) {
      setPlaying((v) => !v); // mock : toggle visuel seulement
      return;
    }
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    }
  }

  return (
    <section className="relative h-dvh overflow-hidden bg-background text-foreground">
      {/* Audio (src vide en mock → inactif) */}
      {/* biome-ignore lint/a11y/useMediaCaption: flux radio live, pas de sous-titres */}
      <audio ref={audioRef} src={streamUrl || undefined} preload="none" />

      {/* Historique (haut droite, sous la navbar) */}
      <div className="absolute right-6 top-20 z-20 sm:right-10">
        <HistoryDropdown history={data.history} />
      </div>

      {/* Titre énorme (artiste) + sous-titre (morceau), sous la navbar */}
      <div className="px-6 pt-24 sm:px-10 sm:pt-28">
        <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-tighter sm:text-7xl md:text-8xl">
          {current.artist}
        </h1>
        <p className="mt-3 text-xl font-medium uppercase tracking-wide text-foreground/50 sm:text-2xl">
          {current.title}
        </p>
      </div>

      {/* Pochette + bouton play (centre) */}
      <div className="mx-auto mt-8 flex max-w-3xl items-center justify-center px-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-foreground/5">
          {current.artUrl ? (
            // biome-ignore lint/performance/noImgElement: pochette externe (AzuraCast)
            <img
              src={current.artUrl}
              alt={`${current.artist} — ${current.title}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-foreground/20">
              <span className="text-sm font-bold uppercase tracking-widest">[Pochette]</span>
            </div>
          )}

          {/* Bouton play centré — pas d'ombre */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Mettre en pause" : "Lire le direct"}
            className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-[#A6FF3E] text-[#05180A] transition-transform hover:scale-105 active:scale-95 sm:size-24"
          >
            {playing ? (
              <PauseIcon className="size-9 sm:size-10" fill="currentColor" />
            ) : (
              <PlayIcon className="size-9 translate-x-0.5 sm:size-10" fill="currentColor" />
            )}
          </button>
        </div>
      </div>

      {/* Genre (bas gauche) — au-dessus du ticker */}
      {current.genre && (
        <div className="absolute bottom-16 left-6 sm:left-10">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Genre</p>
          <p className="mt-1 text-lg font-medium uppercase tracking-wide">{current.genre}</p>
        </div>
      )}

      {/* Onglet vertical "RECETTE DU JOUR" (droite) */}
      {/* TODO : brancher l'offcanvas recette (Estelle) au click. Placeholder. */}
      <button
        type="button"
        aria-label="Voir la recette du jour"
        className="absolute right-0 top-1/2 z-20 -translate-y-1/2 bg-[#A6FF3E] px-3 py-6 text-sm font-black uppercase tracking-widest text-[#05180A] [writing-mode:vertical-rl] sm:px-4"
      >
        Recette du jour
      </button>

      {/* Ticker "UP NEXT" en overlay bas */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <UpNextTicker tracks={data.next} />
      </div>
    </section>
  );
}
