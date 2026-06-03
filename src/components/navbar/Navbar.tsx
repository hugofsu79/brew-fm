/**
 * Navbar racine (Server Component).
 *
 * Layout :
 *   [Logo Brew FM] ←space-between→ [ events · Twitch · ☰ ]  (un seul container droit)
 *
 * Le hamburger fait partie du container de droite (aligné avec events + Twitch),
 * il n'est plus positionné en fixed indépendant.
 *
 * Navbar en OVERLAY (fixed) via NavbarScrollWrapper :
 *   - se superpose au contenu (player plein écran sur la home)
 *   - cachée en scrollant vers le bas, visible vers le haut (+ toujours visible en haut)
 *
 * Fetch côté serveur (resolveNavbarItems) ; enfants interactifs en "use client".
 */

import { resolveNavbarItems } from "@/lib/cascade/resolve-navbar";
import { Logo } from "./Logo";
import { NavbarEvents } from "./NavbarEvents";
import { NavbarMenuPanel } from "./NavbarMenuPanel";
import { NavbarScrollWrapper } from "./NavbarScrollWrapper";
import { NavbarTwitch } from "./NavbarTwitch";

export async function Navbar() {
  const { events, twitch } = await resolveNavbarItems();

  return (
    <NavbarScrollWrapper>
      {/* Gauche : logo */}
      <Logo />

      {/* Droite : un seul container → events · Twitch · hamburger */}
      <div className="flex items-center gap-3">
        <NavbarEvents events={events} />
        {twitch && <NavbarTwitch status={twitch} />}
        {/* Le hamburger (trigger + panel en portail) fait partie du container */}
        <NavbarMenuPanel />
      </div>
    </NavbarScrollWrapper>
  );
}
