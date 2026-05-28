/**
 * Navbar racine (Server Component).
 *
 * Layout (cf. spec verrouillée) :
 *   Desktop : [Logo] ←space-between→ [Dropdown events · Zone Twitch] [☰ spacer]
 *   Mobile  : [Logo] ←space-between→ [Dropdown events]               [☰ spacer]
 *
 * Responsabilités :
 *   - Fetch les données navbar côté serveur (Shotgun + Twitch mock)
 *   - Disposer Logo / NavbarEvents / NavbarTwitch dans la barre
 *
 * Pourquoi Server Component :
 *   - Fetch côté serveur (caching Next.js natif), credentials jamais exposés
 *   - Les enfants interactifs (NavbarEvents, NavbarTwitch) sont "use client"
 *     et ne reçoivent que des données déjà résolues
 *
 * ⚠️ Le bouton hamburger reste géré par NavbarMenuPanel (fixed, on n'y touche pas).
 *    Il flotte par-dessus la barre. Pour qu'il soit À DROITE et que rien ne passe
 *    dessous :
 *      1. Dans NavbarMenuPanel, change la position du bouton de `left-*` → `right-*`
 *         (une seule classe à modifier).
 *      2. Le <div> spacer ci-dessous (w-10) réserve la place à droite dans la barre.
 *    Ajuste la largeur du spacer pour matcher exactement ton bouton ☰.
 */

import { resolveNavbarItems } from "@/lib/cascade/resolve-navbar";
import { Logo } from "./Logo";
import { NavbarEvents } from "./NavbarEvents";
import { NavbarMenuPanel } from "./NavbarMenuPanel";
import { NavbarTwitch } from "./NavbarTwitch";

export async function Navbar() {
  const { events, twitch } = await resolveNavbarItems();

  return (
    <>
      {/* Menu hamburger (fixed, géré par le Panel — non modifié ici) */}
      <NavbarMenuPanel />

      {/* Barre du haut */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 bg-background/95 px-4 py-4 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        {/* Gauche : logo */}
        <Logo />

        {/* Droite : dropdown events + zone twitch + spacer hamburger */}
        <div className="flex items-center gap-3">
          <NavbarEvents events={events} />
          {twitch && <NavbarTwitch status={twitch} />}

          {/* Spacer : réserve la place du bouton ☰ (fixed) pour éviter le chevauchement.
              Ajuste w-10 selon la taille réelle de ton hamburger. */}
          <div className="w-10 shrink-0" aria-hidden="true" />
        </div>
      </header>
    </>
  );
}
