/**
 * Menu hamburger plein écran — Brew FM.
 *
 * Architecture :
 *   - Bouton dans le flux du container droit de Navbar.tsx (pas de fixed)
 *   - Panel monté via createPortal sur document.body (z-50)
 *
 * Animation d'ouverture "de part et d'autre" :
 *   clipPath "inset(0 50% 0 50%)"  → réduit au centre
 *   clipPath "inset(0 0% 0 0%)"    → plein écran
 *
 * Reveal des liens :
 *   clipPath vertical inset(0 0 100% 0) → inset(0 0 0% 0) + translateY
 *   Tous les items à opacity-30 au repos, opacity-100 au hover.
 *
 * Logo : NavbarLogo en brew-black (pas de texte "BREW FM").
 * Padding : px-6 py-4 mobile, px-12 py-6 desktop.
 */

"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useState } from "react";
import { EXTERNAL_LINKS, INTERNAL_LINKS } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";
import { NavbarLogo } from "./NavbarLogo";
import { NavbarMenuButton } from "./NavbarMenuButton";

const SUBTITLES: Record<string, string> = {
  Radio: "Le live, le stream, le programme",
  Évènements: "Passés + à venir + coffee shops",
  Résidents: "Les résidents + les artistes qui sont venus",
  Lieux: "Nos coffee shops + nos clubs",
  About: "L'histoire, la vision",
};

// ─── Easing ──────────────────────────────────────────────────────────────────

const EASE_EXPO = [0.76, 0, 0.24, 1] as const;
const EASE_OUT  = [0.22, 1, 0.36, 1] as const;

// ─── Variants ────────────────────────────────────────────────────────────────

/** Overlay : clip horizontal depuis le centre vers les bords */
const overlayVariants = {
  closed: {
    clipPath: "inset(0 50% 0 50%)",
    transition: {
      duration: 0.4,
      ease: EASE_EXPO,
      when: "afterChildren" as const,
    },
  },
  open: {
    clipPath: "inset(0 0% 0 0%)",
    transition: {
      duration: 0.55,
      ease: EASE_EXPO,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
};

/** Item nav : reveal clipPath vertical + slide */
const itemVariants = {
  closed: {
    clipPath: "inset(0 0 100% 0)",
    y: 16,
    transition: { duration: 0.15, ease: "easeIn" as const },
  },
  open: (i: number) => ({
    clipPath: "inset(0 0 0% 0)",
    y: 0,
    transition: {
      duration: 0.55,
      ease: EASE_OUT,
      delay: i * 0.07,
    },
  }),
};

/** Sous-titre : fade + slide horizontal */
const subtitleVariants = {
  closed: { opacity: 0, x: -10, transition: { duration: 0.1 } },
  open: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" as const, delay: 0.1 },
  },
};

/** Footer : fade global */
const footerVariants = {
  closed: { opacity: 0, transition: { duration: 0.1 } },
  open:   { opacity: 1, transition: { duration: 0.4, delay: 0.45, ease: "easeOut" as const } },
};

// ─── Panel (portail) ─────────────────────────────────────────────────────────

function MenuPanel({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const panel = (
    <motion.div
      key="menu-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navigation Brew FM"
      variants={overlayVariants}
      initial="closed"
      animate="open"
      exit="closed"
      style={{ backgroundColor: "var(--color-brew-acid)" }}
      // Padding : px-6 py-4 mobile → px-12 py-6 desktop
      className="fixed inset-0 z-50 flex flex-col px-6 py-4 sm:px-12 sm:py-6"
    >
      {/* ── Header ── */}
      <header className="flex items-center justify-between py-2">
        {/* Logo seul (pas de texte "BREW FM"), en brew-black */}
        <Link
          href="/"
          onClick={onClose}
          aria-label="Accueil Brew FM"
          className="transition-opacity hover:opacity-60"
        >
          <NavbarLogo
            size={36}
            style={{ color: "var(--color-brew-black)" }}
          />
        </Link>

        {/* Bouton X pour fermer */}
        <NavbarMenuButton isOpen onClick={onClose} />
      </header>

      {/* ── Nav principale ── */}
      <nav className="flex flex-1 flex-col justify-center" aria-label="Navigation principale">
        {INTERNAL_LINKS.map((link, i) => (
          <motion.div
            key={link.href}
            custom={i}
            variants={itemVariants}
            className={cn("overflow-hidden", i > 0 && "border-t")}
            style={{ borderColor: "color-mix(in srgb, var(--color-brew-black) 18%, transparent)" }}
          >
            <Link
              href={link.href}
              onClick={onClose}
              // Tous les items à opacity basse au repos, pleine opacité au hover
              className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 py-5 opacity-30 transition-opacity duration-300 hover:opacity-100 sm:py-6"
            >
              {/* Titre display */}
              <span
                className="text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl lg:text-8xl"
                style={{ color: "var(--color-brew-black)" }}
              >
                {link.label}
              </span>

              {/* Sous-titre */}
              {SUBTITLES[link.label] && (
                <motion.span
                  variants={subtitleVariants}
                  className="hidden text-xs font-semibold uppercase tracking-widest sm:block"
                  style={{ color: "color-mix(in srgb, var(--color-brew-black) 50%, transparent)" }}
                >
                  {SUBTITLES[link.label]}
                </motion.span>
              )}
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* ── Footer liens externes ── */}
      <motion.footer
        variants={footerVariants}
        className="flex flex-wrap items-center justify-end gap-6 py-4 sm:gap-10"
      >
        {EXTERNAL_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-widest opacity-40 transition-opacity hover:opacity-100"
            style={{ color: "var(--color-brew-black)" }}
          >
            {link.label === "Shotgun" ? (
              <span className="inline-flex items-center gap-1.5">
                <svg
                  viewBox="0 0 9 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  style={{ height: "1em", width: "auto", display: "inline-block" }}
                >
                  <path
                    d="M8.80313 12.1733L1.89596 1.80321C1.7853 1.63706 1.90441 1.41462 2.10403 1.41462H6.89593C7.09556 1.41462 7.21467 1.63708 7.10399 1.80322L5.4498 4.28633C5.39389 4.37027 5.39388 4.47958 5.4498 4.56353L6.00689 5.39987C6.10583 5.54841 6.32407 5.54842 6.42302 5.39988L8.80361 1.82627C9.04485 1.46366 9.06539 1.00108 8.85664 0.619131C8.64788 0.237184 8.24518 0 7.80569 0H1.19431C0.754821 0 0.352118 0.237184 0.143363 0.619131C-0.065393 1.00108 -0.0448519 1.46366 0.196387 1.82627L7.10403 12.1968C7.2147 12.3629 7.09559 12.5854 6.89596 12.5854H2.10407C1.90444 12.5854 1.78533 12.3629 1.89601 12.1968L3.55021 9.71365C3.60612 9.62972 3.60613 9.52042 3.55024 9.43648L2.99311 8.59976C2.89418 8.45119 2.6759 8.45117 2.57695 8.59973L0.196387 12.1737C-0.0448519 12.5363 -0.065393 12.9989 0.143363 13.3809C0.352118 13.7628 0.754821 14 1.19431 14H7.80569C8.24518 14 8.64788 13.7628 8.85664 13.3809C9.06539 12.9989 9.04437 12.5359 8.80313 12.1733Z"
                    fill="currentColor"
                  />
                </svg>
                Shotgun
              </span>
            ) : (
              link.label
            )}
          </a>
        ))}
      </motion.footer>
    </motion.div>
  );

  return createPortal(panel, document.body);
}

// ─── Export principal ─────────────────────────────────────────────────────────

export function NavbarMenuPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const close  = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  return (
    <>
      {/* Trigger : dans le flux du container droit de Navbar.tsx */}
      <NavbarMenuButton isOpen={isOpen} onClick={toggle} />

      {/* Panel : portail sur document.body */}
      <AnimatePresence>
        {isOpen && <MenuPanel key="panel" onClose={close} />}
      </AnimatePresence>
    </>
  );
}