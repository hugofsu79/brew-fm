/**
 * Navbar racine (Server Component).
 *
 * Responsabilités :
 *   - Fetch la cascade navbar côté serveur (Twitch + Notion + Shotgun)
 *   - Layout : NavbarMenuPanel (hamburger fixe top-left) + NavbarCascade (centre)
 *
 * Pourquoi Server Component :
 *   - Le fetch des données se fait côté serveur (caching Next.js natif)
 *   - Aucun JS envoyé au navigateur pour la résolution de la cascade
 *   - Les composants interactifs (Cascade, MenuPanel) sont "use client"
 *     mais ils n'embarquent que la logique UI, pas les credentials API
 *
 * Position : fixed top-0, full-width, z-40 (en dessous du menu z-50).
 * Le menu hamburger flotte par-dessus via NavbarMenuPanel.
 */

import { resolveNavbarItems } from "@/lib/cascade/resolve-navbar";
import { NavbarCascade } from "./NavbarCascade";
import { NavbarMenuPanel } from "./NavbarMenuPanel";

export async function Navbar() {
  const resolution = await resolveNavbarItems();

  return (
    <>
      {/* Menu hamburger (fixed top-left, z-50) */}
      <NavbarMenuPanel />

      {/* Zone centrale cascade (sticky en haut, mobile-first) */}
      <header className="sticky top-0 z-40 flex items-center justify-center bg-background/95 px-4 py-4 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <NavbarCascade resolution={resolution} />
      </header>
    </>
  );
}
