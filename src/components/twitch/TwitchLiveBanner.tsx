/**
 * TwitchLiveBanner — Bannière sticky globale "🔴 LIVE EN COURS".
 *
 * Affichée en haut de TOUTES les pages UNIQUEMENT quand un live Twitch est actif.
 * Click → redirige vers la chaîne Twitch (nouvel onglet, max boost chaîne).
 *
 * Distincte de la zone Twitch dans la navbar :
 *   - Navbar = zone discrète (live OU countdown upcoming)
 *   - Bannière = bandeau pleine largeur, voyant, live SEULEMENT
 *
 * Ne s'affiche QUE pour kind="live". Pour "upcoming" ou null → rien
 * (le composant renvoie null, le countdown reste géré par la navbar).
 *
 * Server Component : reçoit le statut déjà résolu (pas de fetch ici).
 * Tracking analytics : data-source="brewfm-site-banner".
 */

import type { TwitchStatus } from "@/types/domain/twitch-status";

export function TwitchLiveBanner({ status }: { status: TwitchStatus | null }) {
  // N'affiche la bannière QUE si un live est réellement en cours.
  if (status?.kind !== "live") return null;

  return (
    <a
      href={status.channelUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-source="brewfm-site-banner"
      className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-red-600 px-4 py-2.5 text-center text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700"
    >
      {/* Point clignotant */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
      </span>

      <span>Live en cours</span>

      {/* Titre du stream, tronqué si trop long */}
      <span className="hidden max-w-[40ch] truncate font-normal normal-case opacity-90 sm:inline">
        — {status.title}
      </span>

      <span className="shrink-0 underline underline-offset-2">Regarder →</span>
    </a>
  );
}
