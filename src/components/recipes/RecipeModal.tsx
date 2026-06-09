"use client";

/**
 * RecipeModal — Ticket de reçu qui dépasse du bord droit, puis se centre au clic.
 *
 * 3 états (pilotés par Motion) :
 *   - peek  : ticket collé au bord droit, tourné -90°, seul le HAUT visible
 *             (en-tête → sous-titre). Remplace l'ancien bouton "Recette du mois".
 *   - hover : se révèle un peu plus (glisse vers l'intérieur).
 *   - open  : au clic, la rotation s'annule en fluide et le ticket se centre,
 *             révélant l'intégralité (scrollable). Overlay + croix de fermeture.
 *
 * Réglages rapides (constantes ci-dessous) :
 *   PEEK_REVEAL   : largeur visible au repos (px)
 *   HOVER_EXTRA   : révélation supplémentaire au hover (px)
 *   PEEK_MAX_VH   : hauteur visible du ticket au repos (vh) → "que le haut"
 *   ROTATION      : -90 par défaut (passe à 90 pour tourner dans l'autre sens)
 *
 * Pas de border ni border-radius. Image en N&B normal (sans bitmap/contraste).
 */

import { AnimatePresence, motion, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Recipe } from "@/types/domain/recipe";

const PEEK_REVEAL = 36; // px visibles au repos
const HOVER_EXTRA = 90; // px révélés en plus au hover
const PEEK_MAX_VH = 22; // hauteur visible au repos (vh)
const HOVER_MAX_VH = 34;
const OPEN_MAX_VH = 86;
const ROTATION = -90; // sens de rotation au repos

const TICKET_WIDTH = 340; // px

const SPRING = { type: "spring" as const, stiffness: 210, damping: 26 };

/** Ligne pointillée de séparation. */
function Dots() {
  return <div className="my-3 border-t border-dashed border-black/40" />;
}

/** Ligne "label ....... valeur" style reçu. */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="shrink-0 uppercase">{label}</span>
      <span className="min-w-0 flex-1 translate-y-[-3px] border-b border-dotted border-black/30" />
      <span className="shrink-0 text-right">{value}</span>
    </div>
  );
}

/** Bloc texte multi-lignes. */
function Block({ title, content }: { title: string; content?: string }) {
  if (!content) return null;
  return (
    <div className="my-3">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-widest">{title}</p>
      <p className="whitespace-pre-line text-[13px] leading-relaxed">{content}</p>
    </div>
  );
}

function TicketBody({ recipe }: { recipe: Recipe }) {
  return (
    <div className="font-mono text-black">
      {/* En-tête */}
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.3em]">Brew FM</p>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-black/50">
          Recette du mois — Reçu n°{recipe.id.slice(0, 6).toUpperCase()}
        </p>
      </div>

      <Dots />

      {/* Titre surligné vert acide */}
      <h2 className="text-center text-lg font-bold uppercase leading-tight">
        <span className="box-decoration-clone bg-[#A6FF3E] px-1 text-[#05180A]">
          {recipe.title}
        </span>
      </h2>
      {(recipe.drinkBase || recipe.drinkType) && (
        <p className="mt-2 text-center text-[11px] uppercase tracking-wide text-black/60">
          {[recipe.drinkBase, recipe.drinkType].filter(Boolean).join(" · ")}
        </p>
      )}

      {/* --- Tout ce qui suit n'est révélé qu'en mode open --- */}
      <Dots />

      <div className="space-y-1 text-[12px]">
        {recipe.difficulty && <Row label="Difficulté" value={recipe.difficulty} />}
        {recipe.temperature && <Row label="Température" value={recipe.temperature} />}
        {recipe.prepTimeMin != null && (
          <Row label="Préparation" value={`${recipe.prepTimeMin} min`} />
        )}
        {recipe.finalVolume && <Row label="Volume" value={recipe.finalVolume} />}
      </div>

      <Dots />

      <Block title="Ingrédients" content={recipe.ingredients} />
      <Block title="Préparation" content={recipe.steps} />
      <Block title="Astuce pro" content={recipe.proTip} />
      <Block title="Histoire" content={recipe.story} />

      {recipe.material && recipe.material.length > 0 && (
        <>
          <Dots />
          <Row label="Matériel" value={recipe.material.join(", ")} />
        </>
      )}

      <Dots />

      <div className="space-y-1 text-[11px] uppercase tracking-wide text-black/60">
        {recipe.author && <Row label="Barista" value={recipe.author} />}
        {recipe.partnerShop && <Row label="Lieu" value={recipe.partnerShop} />}
      </div>

      {recipe.vibeTags && recipe.vibeTags.length > 0 && (
        <p className="mt-3 text-center text-[10px] uppercase tracking-widest text-black/40">
          {recipe.vibeTags.map((t) => `#${t}`).join(" ")}
        </p>
      )}

      <p className="mt-3 text-center text-[10px] uppercase tracking-[0.3em] text-black/40">
        Merci · Sip, listen, dance
      </p>

      {/* Image en bas, fusionnée au ticket via multiply (le fond clair du
          bitmap disparaît, seul le dessin sombre reste sur le papier crème) */}
      {recipe.photoUrl && (
        <div className="mt-4 overflow-hidden">
          {/* biome-ignore lint/performance/noImgElement: image externe (Notion) */}
          <img
            src={recipe.photoUrl}
            alt={recipe.title}
            className="w-full object-cover mix-blend-multiply"
          />
        </div>
      )}
    </div>
  );
}

export function RecipeModal({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  // peekX démarre à 0 (identique SSR/client → pas de mismatch d'hydratation).
  // La vraie valeur est calculée après montage, et l'entrée s'anime à ce
  // moment-là (offscreen → peek).
  const [peekX, setPeekX] = useState(0);
  // Désactive l'animation au tout premier rendu (placement direct).
  const [ready, setReady] = useState(false);
  const ticketRef = useRef<HTMLDivElement | null>(null);

  /** Ferme + remet le scroll du ticket en haut (revient au niveau du titre). */
  function closeTicket() {
    if (ticketRef.current) ticketRef.current.scrollTop = 0;
    setOpen(false);
  }

  // Recalcule au resize.
  useEffect(() => {
    function calc() {
      setPeekX(window.innerWidth / 2 - PEEK_REVEAL);
    }
    calc();
    setReady(true);
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // Verrouille le scroll du body quand la modale est ouverte.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const state = open ? "open" : hovered ? "hover" : "peek";

  const variants: Variants = {
    // Hors-champ : complètement à droite, hors écran (point de départ à l'entrée).
    offscreen: { rotate: ROTATION, x: peekX + TICKET_WIDTH, y: 0, maxHeight: `${PEEK_MAX_VH}vh` },
    // Entrée vers peek : lente et douce (tween bezier), pas de rebond.
    peek: {
      rotate: ROTATION,
      x: peekX,
      y: 0,
      maxHeight: `${PEEK_MAX_VH}vh`,
      transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const },
    },
    hover: {
      rotate: ROTATION,
      x: peekX - HOVER_EXTRA,
      y: 0,
      maxHeight: `${HOVER_MAX_VH}vh`,
      transition: SPRING,
    },
    open: { rotate: 0, x: 0, y: 0, maxHeight: `${OPEN_MAX_VH}vh`, transition: SPRING },
  };

  // Rendu client uniquement (après calcul de peekX) → pas de mismatch SSR, et
  // l'entrée part bien du hors-champ droit (peekX correct) vers peek.
  if (!ready) return null;

  return (
    <>
      {/* Overlay (seulement en open) */}
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label="Fermer la recette"
            className="absolute inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeTicket}
          />
        )}
      </AnimatePresence>

      {/* Wrapper centré (dans le hero, non sticky) ; le ticket s'anime dedans */}
      <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
        <motion.div
          ref={ticketRef}
          initial="offscreen"
          animate={state}
          variants={variants}
          className={`pointer-events-auto relative w-[340px] bg-[#FAF7F0] px-6 py-6 ${
            open ? "no-scrollbar overflow-y-auto" : "overflow-hidden"
          }`}
        >
          {/* Zone cliquable au repos (ouvre + gère le hover) */}
          {!open && (
            <button
              type="button"
              aria-label={`Ouvrir la recette : ${recipe.title}`}
              onClick={() => setOpen(true)}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="absolute inset-0 z-10"
            />
          )}

          {/* Croix de fermeture (seulement en open) */}
          {open && (
            <button
              type="button"
              aria-label="Fermer"
              onClick={closeTicket}
              className="absolute right-3 top-3 z-10 text-black/40 transition-colors hover:text-black"
            >
              ✕
            </button>
          )}

          <TicketBody recipe={recipe} />
        </motion.div>
      </div>
    </>
  );
}
