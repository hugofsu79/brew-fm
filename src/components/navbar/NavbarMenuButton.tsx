/**
 * Bouton hamburger Brew FM — SVG V60 custom.
 *
 * Visuel : container carré bg-brew-acid, pas de border-radius.
 * SVG inline : 3 rectangles décroissants (filtre V60).
 *
 * Hover bouncy :
 *   whileHover="hovered" posé sur le bouton parent → propagé aux motion.rect
 *   enfants via variants. Rect 1 monte 1px, rect 2 reste fixe, rect 3 descend 1px.
 *   Spring stiffness élevée = rebond court et vif.
 *
 * Toggle hamburger ↔ X :
 *   Deux motion.div absolus qui fade/scale in/out selon isOpen.
 */

"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type NavbarMenuButtonProps = {
  className?: string;
  onClick?: () => void;
  isOpen?: boolean;
};

// Les 3 rects du SVG V60 (viewBox 0 0 28 13)
const RECTS = [
  { key: "r1", x: 0, y: 0, width: 27.4706 },
  { key: "r2", x: 4.8999, y: 4.47656, width: 17.6708 },
  { key: "r3", x: 6.70508, y: 8.95312, width: 14.0607 },
] as const;

// Décalages Y au hover (1px écartement de part et d'autre)
// y positif = vers le bas dans l'espace SVG
const HOVER_OFFSETS: [number, number, number] = [-1, 0, 1];

const spring = { type: "spring" as const, stiffness: 600, damping: 20, mass: 0.35 };

export function NavbarMenuButton({ className, onClick, isOpen = false }: NavbarMenuButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
      aria-expanded={isOpen}
      // whileHover ici → propagé automatiquement aux variants des enfants Motion
      whileHover="hovered"
      whileTap={{ scale: 0.9 }}
      initial="idle"
      animate="idle"
      className={cn(
        "relative inline-flex size-12 shrink-0 items-center justify-center",
        "bg-[var(--color-brew-acid)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brew-acid)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {/* ── Hamburger V60 (visible quand fermé) ── */}
      <motion.div
        animate={isOpen ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        className="absolute flex items-center justify-center"
      >
        <svg
          width="22"
          height="10"
          viewBox="0 0 28 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {RECTS.map((rect, i) => (
            <motion.rect
              key={rect.key}
              x={rect.x}
              width={rect.width}
              height={3.47675}
              rx={1}
              fill="var(--color-brew-black)"
              // variants reçoivent la propagation whileHover du bouton parent
              variants={{
                idle: { y: rect.y, transition: spring },
                hovered: { y: rect.y + HOVER_OFFSETS[i], transition: spring },
              }}
            />
          ))}
        </svg>
      </motion.div>

      {/* ── Croix (visible quand ouvert) ── */}
      <motion.div
        animate={
          isOpen ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.5, rotate: -45 }
        }
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="absolute flex items-center justify-center"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <line
            x1="1.5"
            y1="1.5"
            x2="16.5"
            y2="16.5"
            stroke="var(--color-brew-black)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="16.5"
            y1="1.5"
            x2="1.5"
            y2="16.5"
            stroke="var(--color-brew-black)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </motion.button>
  );
}
