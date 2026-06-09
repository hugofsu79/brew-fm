"use client";

/**
 * MiniPlayer — carte flottante compacte (coin bas-droit) qui suit l'auditeur
 * de page en page. Affiché partout SAUF la home (où le grand player suffit).
 *
 * Pilote le même <audio> global (via useRadioPlayer) → la lecture continue
 * en naviguant, le mini-player ne fait que la refléter/contrôler.
 *
 * Affiche : pochette + titre/artiste + bouton play/pause.
 * N'apparaît que si un morceau est défini et qu'on n'est pas sur la home.
 */

import { PauseIcon, PlayIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRadioPlayer } from "./RadioPlayerProvider";

export function MiniPlayer() {
  const pathname = usePathname();
  const { track, isPlaying, toggle } = useRadioPlayer();

  // Pas sur la home, et seulement si un morceau est chargé.
  if (pathname === "/" || !track) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-[#A6FF3E] p-2 pr-4 text-[#05180A] shadow-lg">
      {/* Pochette + infos → retour à la page radio */}
      <Link
        href="/"
        className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
      >
        <div className="size-12 shrink-0 overflow-hidden bg-[#05180A]/10">
          {track.artUrl ? (
            // biome-ignore lint/performance/noImgElement: pochette externe (AzuraCast)
            <img src={track.artUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 max-w-[40vw] sm:max-w-44">
          <p className="truncate text-sm font-bold uppercase leading-tight">{track.artist}</p>
          <p className="truncate text-xs opacity-70">{track.title}</p>
        </div>
      </Link>

      {/* Play / pause */}
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? "Mettre en pause" : "Lire"}
        className="grid size-9 shrink-0 place-items-center rounded-full bg-[#05180A] text-[#A6FF3E] transition-transform hover:scale-105 active:scale-95"
      >
        {isPlaying ? (
          <PauseIcon className="size-4" fill="currentColor" />
        ) : (
          <PlayIcon className="size-4 translate-x-px" fill="currentColor" />
        )}
      </button>
    </div>
  );
}
