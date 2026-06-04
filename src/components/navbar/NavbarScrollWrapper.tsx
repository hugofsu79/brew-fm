"use client";

/**
 * NavbarScrollWrapper — Navbar en OVERLAY (fixed) + visibilité au scroll.
 *
 * Comportement scroll (classique) :
 *   - Scroll vers le BAS  → navbar cachée
 *   - Scroll vers le HAUT → navbar visible
 *   - Tout en haut (y ~ 0) → toujours visible
 *
 * Fond :
 *   - HOME ("/") : pas de couleur propre → FILTRE D'INVERSION sur la cover qui
 *     passe derrière (backdrop-filter: invert). Le bandeau inverse les couleurs
 *     du hero radio en temps réel, pleine largeur.
 *   - Autres pages : fond sombre semi-opaque + blur (style normal conservé).
 *
 * Le contenu (logo, texte) n'est PAS inversé par le backdrop-filter (qui n'agit
 * que sur l'arrière-plan) — il garde ses couleurs.
 *
 * ⚠️ Si tu veux le comportement scroll inverse, intervertis les setVisible().
 */

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NavbarScrollWrapper({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (y < 10) {
        setVisible(true);
      } else if (y > lastY.current) {
        setVisible(false); // scroll bas → cachée
      } else if (y < lastY.current) {
        setVisible(true); // scroll haut → visible
      }
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Home : pas de fond, contenu blanc en mix-blend difference (auto-contraste
  // sur la cover). Autres pages : fond sombre + blur (inchangé).
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <header
        className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-4 px-4 py-4 text-white mix-blend-difference transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {children}
      </header>
    );
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-4 bg-background/90 px-4 py-4 backdrop-blur-md transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {children}
    </header>
  );
}
