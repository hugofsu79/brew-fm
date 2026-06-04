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
import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { RecipeModal } from "@/components/recipes/RecipeModal";
import type { RadioNowPlaying } from "@/types/domain/radio";
import type { Recipe } from "@/types/domain/recipe";
import { UpNextTicker } from "./UpNextTicker";

/** Historique des derniers morceaux (dropdown). */
function HistoryDropdown({ history }: { history: RadioNowPlaying["history"] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-[#A6FF3E] px-2 py-1 text-sm font-bold uppercase tracking-wide text-[#05180A] transition-opacity hover:opacity-80"
      >
        Historique
        <ChevronDownIcon
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul className="absolute right-0 z-20 mt-2 w-64 overflow-hidden bg-[#A6FF3E] text-[#05180A]">
          {history.map((track) => (
            <li
              key={`${track.artist}-${track.title}`}
              className="border-b border-[#05180A]/15 px-4 py-2.5 last:border-0"
            >
              <p className="text-sm font-semibold uppercase leading-tight">{track.artist}</p>
              <p className="text-xs text-[#05180A]/60">{track.title}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Format M:SS à partir de secondes. */
function fmt(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Waveform style SoundCloud (générée, stable).
 *   - barres écoulées : vert acide / restantes : vert foncé
 *   - hauteurs pseudo-aléatoires déterministes (stables entre les rendus)
 *   - à l'apparition : chaque barre monte de plat → sa hauteur avec un rebond
 *     (bezier overshoot), en cascade (stagger)
 *   - temps restant -M:SS sous la waveform
 *
 * En mock, le ratio écoulé est figé. Avec un vrai flux AzuraCast, on rebranchera
 * elapsed (timeupdate) pour faire avancer le remplissage.
 */
const BAR_COUNT = 48;
const BOUNCE = [0.34, 1.56, 0.64, 1] as const; // bezier "back out" (rebond)

function ProgressBar({ durationSec, elapsedSec }: { durationSec: number; elapsedSec: number }) {
  const ratio = durationSec > 0 ? Math.min(1, elapsedSec / durationSec) : 0;
  const remaining = Math.max(0, durationSec - elapsedSec);
  const filledCount = Math.round(ratio * BAR_COUNT);

  // Hauteurs déterministes (fract de sin) → stables, aspect aléatoire.
  const heights = useMemo(() => {
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      const noise = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
      return Math.round(25 + noise * 75); // 25..100, entier → stable SSR/client
    });
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-10 items-end gap-[2px]">
        {heights.map((h, i) => (
          <motion.div
            // biome-ignore lint/suspicious/noArrayIndexKey: waveform à longueur fixe, ordre stable
            key={i}
            className="flex-1 origin-bottom rounded-[1px]"
            style={{ height: `${h}%`, backgroundColor: i < filledCount ? "#A6FF3E" : "#05180A" }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5, ease: BOUNCE, delay: i * 0.012 }}
          />
        ))}
      </div>
      <span className="self-end font-mono text-xs font-semibold text-white mix-blend-difference">
        -{fmt(remaining)}
      </span>
    </div>
  );
}

export function RadioHero({ data, recipe }: { data: RadioNowPlaying; recipe: Recipe | null }) {
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

      {/* Cover plein écran (fond) + voile pour lisibilité du texte */}
      {current.artUrl && (
        <>
          {/* biome-ignore lint/performance/noImgElement: pochette externe (AzuraCast) */}
          <img
            src={current.artUrl}
            alt={`${current.artist} — ${current.title}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-background/20" />
        </>
      )}

      {/* Historique (haut droite, sous la navbar) */}
      <div className="absolute right-6 top-20 z-20 sm:right-10">
        <HistoryDropdown history={data.history} />
      </div>

      {/* Titre énorme (artiste) + sous-titre (morceau), sous la navbar */}
      <div className="relative z-10 px-6 pt-24 sm:px-10 sm:pt-28">
        <h1 className="max-w-5xl text-5xl font-black uppercase leading-[1.1] tracking-tighter sm:text-7xl md:text-8xl">
          <span className="box-decoration-clone bg-[#A6FF3E] px-2 text-[#05180A]">
            {current.artist}
          </span>
        </h1>
        <p className="mt-3 text-xl font-medium uppercase tracking-wide sm:text-2xl">
          <span className="box-decoration-clone bg-[#A6FF3E] px-1.5 text-[#05180A]">
            {current.title}
          </span>
        </p>
      </div>

      {/* Bouton play centré sur l'écran — pas d'ombre */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? "Mettre en pause" : "Lire le direct"}
        className="absolute left-1/2 top-1/2 z-10 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-[#A6FF3E] text-[#05180A] transition-transform hover:scale-105 active:scale-95 sm:size-24"
      >
        {playing ? (
          <PauseIcon className="size-9 sm:size-10" fill="currentColor" />
        ) : (
          <PlayIcon className="size-9 translate-x-0.5 sm:size-10" fill="currentColor" />
        )}
      </button>

      {/* Genre (bas gauche) — au-dessus du ticker */}
      {current.genre && (
        <div className="absolute bottom-16 left-6 z-10 sm:left-10">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest">
            <span className="box-decoration-clone bg-[#A6FF3E] px-1.5 py-0.5 text-[#05180A]">
              Genre
            </span>
          </p>
          <p className="text-lg font-medium uppercase tracking-wide">
            <span className="box-decoration-clone bg-[#A6FF3E] px-1.5 py-0.5 text-[#05180A]">
              {current.genre}
            </span>
          </p>
        </div>
      )}

      {/* Progression (bas droite) — à l'opposé du genre.
          Barre fine acide (écoulé) / vert foncé (restant) + temps restant -M:SS */}
      <div className="absolute bottom-16 right-6 z-10 w-48 sm:right-10 sm:w-64">
        <ProgressBar durationSec={current.durationSec} elapsedSec={current.elapsedSec} />
      </div>

      {/* Onglet vertical "Recette du mois" (droite) — modale au clic.
          Affiché seulement si une recette est mise en avant. */}
      {recipe && <RecipeModal recipe={recipe} />}

      {/* Ticker "UP NEXT" en overlay bas */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <UpNextTicker tracks={data.next} />
      </div>
    </section>
  );
}