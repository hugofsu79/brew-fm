"use client";

/**
 * VenueFormatToggle — Titre slot-machine cliquable.
 *
 * Effet : "in the" reste fixe au centre. Les deux mots variables (la partie
 * haute et la partie basse) s'échangent verticalement à chaque clic, dans des
 * conteneurs overflow-hidden. Le mouvement "roule" d'un bloc (haut et bas vont
 * dans le même sens) pour un effet cohérent.
 *
 *   coffee_in_club              club_in_coffee
 *   ┌──────────────┐            ┌──────────────┐
 *   │ Coffee shop  │  ←→ swap   │    Club      │
 *   │   in the     │  (fixe)    │   in the     │
 *   │    Club      │  ←→ swap   │ Coffee shop  │
 *   └──────────────┘            └──────────────┘
 *
 * Tout le bloc est cliquable → bascule le format (remonte au parent via onToggle).
 *
 * Accessibilité : role=button, aria-pressed, focus visible, déclenchable au clavier.
 */

import { AnimatePresence, motion } from "motion/react";
import type { VenueFormat } from "@/types/domain/venue";

/** Mots affichés en haut / bas selon le format actif. */
const WORDS: Record<VenueFormat, { top: string; bottom: string }> = {
  coffee_in_club: { top: "Coffee shop", bottom: "Club" },
  club_in_coffee: { top: "Club", bottom: "Coffee shop" },
};

/** Hauteur d'entrée/sortie du slot (en %). Les deux mots roulent vers le haut. */
const SLOT_VARIANTS = {
  enter: { y: "100%", opacity: 0 },
  center: { y: "0%", opacity: 1 },
  exit: { y: "-100%", opacity: 0 },
};

const SLOT_TRANSITION = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
};

/** Une ligne de mot qui s'anime verticalement dans un masque overflow-hidden. */
function AnimatedWord({ word }: { word: string }) {
  return (
    <span className="block overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={word}
          variants={SLOT_VARIANTS}
          initial="enter"
          animate="center"
          exit="exit"
          transition={SLOT_TRANSITION}
          className="block"
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function VenueFormatToggle({
  format,
  onToggle,
}: {
  format: VenueFormat;
  onToggle: () => void;
}) {
  const { top, bottom } = WORDS[format];

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={format === "club_in_coffee"}
      aria-label="Basculer entre Club in the Coffee shop et Coffee shop in the Club"
      className="group block text-left focus:outline-none"
    >
      <span className="block text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
        {/* Mot du haut (variable) */}
        <AnimatedWord word={top} />

        {/* "in the" — fixe, ne bouge jamais */}
        <span className="block text-foreground/40">in the</span>

        {/* Mot du bas (variable) */}
        <AnimatedWord word={bottom} />
      </span>

      {/* Indice cliquable discret */}
      <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-widest text-foreground/40 transition-colors group-hover:text-foreground/70">
        ↕ Clique pour basculer
      </span>
    </button>
  );
}
