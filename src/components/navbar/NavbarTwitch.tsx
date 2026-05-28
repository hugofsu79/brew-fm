"use client";

/**
 * Zone Twitch (droite de la navbar) — desktop uniquement.
 *
 * Trois cas selon le statut résolu côté serveur :
 *   1. kind="live"                  → badge 🔴 LIVE clignotant, click → chaîne
 *   2. kind="upcoming" & ≤ 7 jours  → countdown JJ:HH:MM:SS qui défile
 *   3. kind="upcoming" & > 7 jours  → date simple "DD/MM · HHhMM" (pas de countdown)
 *   (null côté parent → ce composant n'est pas rendu)
 *
 * Perf : le countdown vit dans <Countdown/>, son propre composant. Lui seul
 * re-render chaque seconde ; le reste de la navbar reste statique.
 *
 * Responsive : masqué sous le breakpoint `md` (cf. ta spec — mobile ne garde
 * que [Dropdown] [☰]). La bannière sticky "🔴 LIVE" globale couvre le mobile.
 */

import { useEffect, useState } from "react";
import type { TwitchStatus } from "@/types/domain/twitch-status";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** "2026-06-14T21:00:00Z" → "14/06 · 21h00". */
function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month} · ${h}h${m}`;
  } catch {
    return iso;
  }
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

  // Cas 2 & 3 — prochain live
  const msUntil = new Date(status.startsAt).getTime() - Date.now();
  const showCountdown = msUntil > 0 && msUntil <= SEVEN_DAYS_MS;

  return (
    <a
      href={status.channelUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-source="brewfm-site-banner"
      className="hidden items-center gap-2 rounded-full border border-foreground/15 px-3 py-1.5 text-sm transition-colors hover:border-foreground/40 hover:bg-foreground/5 md:flex"
    >
      <span aria-hidden="true">🟣</span>
      <span className="text-foreground/70">{status.title}</span>
      <span className="font-medium">
        {showCountdown ? <Countdown target={status.startsAt} /> : formatShortDate(status.startsAt)}
      </span>
    </a>
  );
}
