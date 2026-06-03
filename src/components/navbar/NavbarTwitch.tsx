"use client";

/**
 * Zone Twitch (droite de la navbar) — desktop uniquement.
 *
 * Deux cas selon le statut résolu côté serveur :
 *   1. kind="live"      → badge 🔴 LIVE clignotant, click → chaîne
 *   2. kind="upcoming"  → logo Twitch + titre + countdown JJ:HH:MM:SS qui défile
 *   (null côté parent → ce composant n'est pas rendu)
 *
 * Le countdown s'affiche TOUJOURS pour un live à venir (peu importe la distance).
 *
 * Perf : le countdown vit dans <Countdown/>, son propre composant. Lui seul
 * re-render chaque seconde ; le reste de la navbar reste statique.
 *
 * Responsive : masqué sous le breakpoint `md` (cf. spec — mobile ne garde
 * que [Dropdown] [☰]). La bannière sticky "🔴 LIVE" globale couvre le mobile.
 */

import { useEffect, useState } from "react";
import type { TwitchStatus } from "@/types/domain/twitch-status";

/** Logo Twitch officiel, teinté via currentColor (suit la couleur du texte). */
function TwitchLogo() {
  return (
    <svg
      width="16"
      height="19"
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 0L0 5V23H6V28L11 23H15L24 14V0H5ZM22 13L18 17H14L10.5 20.5V17H6V2H22V13Z"
        fill="currentColor"
      />
      <path d="M19 5.5H17V11.5H19V5.5Z" fill="currentColor" />
      <path d="M13.5 5.5H11.5V11.5H13.5V5.5Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Countdown isolé. Re-render chaque seconde sans toucher au reste de la navbar.
 * Affiche "JJ HH:MM:SS" (jours omis si 0).
 */
function Countdown({ target }: { target: string }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(target).getTime() - Date.now()),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, new Date(target).getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const totalSec = Math.floor(remaining / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span className="font-mono tabular-nums">
      {days > 0 && `${days}j `}
      {pad(hours)}:{pad(mins)}:{pad(secs)}
    </span>
  );
}

export function NavbarTwitch({ status }: { status: TwitchStatus }) {
  // Cas 1 — live en cours
  if (status.kind === "live") {
    return (
      <a
        href={status.channelUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-source="brewfm-site-banner"
        className="hidden items-center gap-2 rounded-full bg-red-600/10 px-3 py-1.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-600/20 md:flex"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        <span>LIVE</span>
        <span className="max-w-[16ch] truncate font-normal text-foreground/70">{status.title}</span>
      </a>
    );
  }

  // Cas 2 — prochain live : logo Twitch + titre + countdown (toujours affiché)
  return (
    <a
      href={status.channelUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-source="brewfm-site-banner"
      className="hidden items-center gap-2 rounded-full border border-foreground/15 px-3 py-1.5 text-sm transition-colors hover:border-foreground/40 hover:bg-foreground/5 md:flex"
    >
      <TwitchLogo />
      <span className="text-foreground/70">{status.title}</span>|
      <span className="font-medium">
        <Countdown target={status.startsAt} />
      </span>
    </a>
  );
}
