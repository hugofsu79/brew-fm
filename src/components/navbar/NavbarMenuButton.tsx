/**
 * Bouton hamburger qui ouvre le menu plein écran.
 *
 * Visuel (mode dark) : carré blanc arrondi avec ☰ noir-vert.
 * Position : fixe en haut à gauche, sticky.
 * Taille tap target ≥ 44px (accessibilité mobile).
 *
 * Note : le déclenchement réel de l'ouverture est géré par le composant
 * Sheet de shadcn (parent : NavbarMenuPanel). Ce bouton sert juste de
 * trigger visuel.
 */

"use client";

import { MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavbarMenuButtonProps = {
  className?: string;
  onClick?: () => void;
  /** True quand le menu est ouvert (pour l'a11y). */
  isOpen?: boolean;
};

export function NavbarMenuButton({ className, onClick, isOpen = false }: NavbarMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
      aria-expanded={isOpen}
      className={cn(
        // Layout
        "inline-flex items-center justify-center",
        // Taille tap target (44px minimum)
        "size-12",
        // Apparence
        "rounded-lg bg-foreground text-background",
        // Animations
        "transition-colors duration-150",
        // Hover & focus
        "hover:bg-foreground/90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // Active state (pressed)
        "active:scale-95",
        className,
      )}
    >
      <MenuIcon className="size-5" strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}
