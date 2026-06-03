"use client";

/**
 * NavbarScrollWrapper — Positionne la navbar en OVERLAY (fixed) et gère sa
 * visibilité selon le sens du scroll.
 *
 * Comportement demandé (classique) :
 *   - Scroll vers le BAS  → navbar CACHÉE
 *   - Scroll vers le HAUT → navbar VISIBLE
 *   - Tout en haut (y ~ 0) → toujours visible
 *
 * ⚠️ Si tu veux le comportement INVERSE (classique : cacher en descendant,
 *    montrer en remontant), inverse les deux setVisible() dans onScroll.
 *
 * La navbar est `fixed` → elle ne prend plus de place dans le flux, donc elle
 * se superpose au contenu (player plein écran sur la home, pages ailleurs).
 *
 * Reçoit en children le contenu déjà rendu côté serveur (Logo, events, etc.).
 */

import { useEffect, useRef, useState } from "react";

export function NavbarScrollWrapper({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;

      if (y < 10) {
        // Tout en haut → toujours visible.
        setVisible(true);
      } else if (y > lastY.current) {
        // Scroll vers le bas → cachée.
        setVisible(false);
      } else if (y < lastY.current) {
        // Scroll vers le haut → visible.
        setVisible(true);
      }

      lastY.current = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-4 px-4 py-4 backdrop-blur-sm transition-transform duration-300 supports-[backdrop-filter]:bg-background/70 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {children}
    </header>
  );
}
