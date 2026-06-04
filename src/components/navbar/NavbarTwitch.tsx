"use client";

/**
 * Zone Twitch (droite de la navbar) — desktop uniquement.
 *
 * Deux cas selon le statut résolu côté serveur :
 *   1. kind="live"      → badge 🔴 LIVE clignotant, click → chaîne Twitch (regarder)
 *   2. kind="upcoming"  → logo + titre + countdown, click → menu "Ajouter au calendrier"
 *                         (Apple/Outlook .ics + Google Agenda)
 *
 * Le countdown s'affiche toujours pour un live à venir.
 *
 * Perf : le countdown vit dans <Countdown/>, son propre composant. Lui seul
 * re-render chaque seconde.
 *
 * Responsive : masqué sous `md`. Durée d'événement par défaut : 120 min.
 */

import { CalendarPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  buildGoogleCalendarUrl,
  buildIcs,
  type CalendarEvent,
  downloadIcs,
} from "@/lib/calendar/ics";
import type { TwitchStatus } from "@/types/domain/twitch-status";

/** Durée par défaut d'une émission (min) pour l'événement calendrier. */
const DEFAULT_DURATION_MIN = 120;

/** Logo Twitch officiel, teinté via currentColor. */
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

/** Countdown isolé. Re-render chaque seconde. Affiche "JJ HH:MM:SS".
 *  Calcul uniquement après montage (évite le mismatch d'hydratation : le temps
 *  restant diffère forcément entre le rendu serveur et le rendu client). */
function Countdown({ target }: { target: string }) {
  // null = pas encore monté → on rend un placeholder stable (identique SSR/client).
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, new Date(target).getTime() - Date.now()));
    tick(); // valeur initiale, côté client uniquement
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const pad = (n: number) => String(n).padStart(2, "0");

  // Avant montage : placeholder neutre (même chaîne côté serveur et client).
  if (remaining === null) {
    return <span className="font-mono tabular-nums">--:--:--</span>;
  }

  const totalSec = Math.floor(remaining / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  return (
    <span className="font-mono tabular-nums">
      {days > 0 && `${days}j `}
      {pad(hours)}:{pad(mins)}:{pad(secs)}
    </span>
  );
}

export function NavbarTwitch({ status }: { status: TwitchStatus }) {
  // Cas 1 — live en cours → lien direct vers la chaîne
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

  // Cas 2 — prochain live → CTA "Ajouter au calendrier"
  const start = new Date(status.startsAt);
  const end = new Date(start.getTime() + DEFAULT_DURATION_MIN * 60 * 1000);
  const event: CalendarEvent = {
    title: `Brew FM — ${status.title}`,
    start,
    end,
    description: `Live Brew FM : ${status.title}. Rendez-vous sur ${status.channelUrl}`,
    url: status.channelUrl,
  };

  function handleIcsDownload() {
    downloadIcs("brew-fm-live.ics", buildIcs(event));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-source="brewfm-site-banner"
          className="hidden items-center gap-2 rounded-full border border-foreground/15 px-3 py-1.5 text-sm transition-colors hover:border-foreground/40 hover:bg-foreground/5 md:flex"
        >
          <TwitchLogo />
          <span className="text-foreground/70">{status.title}</span>
          <span className="font-medium">
            <Countdown target={status.startsAt} />
          </span>
          <CalendarPlusIcon className="size-4 text-foreground/50" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-56 rounded-none border-none bg-[#A6FF3E] text-[#05180A]"
      >
        <DropdownMenuItem
          onSelect={() => handleIcsDownload()}
          className="rounded-none focus:bg-[#05180A]/10 focus:text-[#05180A]"
        >
          <CalendarPlusIcon className="size-4" aria-hidden="true" />
          Apple / Outlook (.ics)
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="rounded-none focus:bg-[#05180A]/10 focus:text-[#05180A]"
        >
          <a href={buildGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
            Google Agenda
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
