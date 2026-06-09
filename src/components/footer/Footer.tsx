/**
 * Footer — Brew FM V1.
 *
 * Direction : brutaliste éditorial.
 *   - Titres de colonnes en taille display (text-4xl→6xl), uppercase, tracking serré
 *   - Liens en petit corps (text-sm), serré, avec underline sweep au hover
 *   - Séparateur ligne full-width en haut
 *   - Watermark logo repositionné (déborde en bas à droite)
 *   - Animations Motion :
 *       · Chaque colonne révèle ses liens en stagger via useInView
 *       · Ligne de séparation se dessine de gauche à droite à l'entrée
 *       · Liens : underline sweep CSS + translateY micro au hover
 *
 * Server/Client : "use client" uniquement pour les animations scroll.
 * Toute la data reste statique (pas de fetch).
 */

"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { EXTERNAL_LINKS } from "@/lib/config/navigation";

const CONTACT_EMAIL = "brewfm.contact@gmail.com";

const ABOUT_CONTACT_LINKS: { label: string; subject: string }[] = [
  { label: "J'ai un coffee shop", subject: "Partenariat — J'ai un coffee shop" },
  { label: "J'ai un club", subject: "Partenariat — J'ai un club" },
  { label: "On recrute", subject: "Recrutement — Proposition" },
  { label: "Je suis DJ", subject: "Booking — Je suis DJ" },
];

const CONTACT_ITEMS: { label: string; href: string }[] = [
  { label: "00 00 00 00 00", href: "tel:+33000000000" },
  { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { label: "Paris, France", href: "#" },
];

function buildMailto(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

// ─── Easing ──────────────────────────────────────────────────────────────────

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// ─── Composant lien avec underline sweep ─────────────────────────────────────

/**
 * Lien avec underline animé "sweep de gauche à droite" au hover.
 * Technique : pseudo-élément via bg-gradient + scaleX(0→1) en CSS.
 * Wrappé dans motion.li pour le stagger parent.
 */
function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE_OUT } },
      }}
    >
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="
          group relative inline-flex items-center gap-1.5
          text-sm font-medium tracking-wide
          text-foreground/50
          transition-colors duration-200
          hover:text-foreground
        "
      >
        {/* Underline sweep */}
        <span
          className="
            absolute -bottom-px left-0 h-px w-full origin-left
            scale-x-0 bg-[var(--color-brew-acid)]
            transition-transform duration-300 ease-out
            group-hover:scale-x-100
          "
          aria-hidden="true"
        />
        {children}
      </a>
    </motion.li>
  );
}

// ─── Colonne animée ───────────────────────────────────────────────────────────

function FooterColumn({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06, delayChildren: delay } },
      }}
    >
      {/* Titre display */}
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 16, clipPath: "inset(0 0 100% 0)" },
          visible: {
            opacity: 1,
            y: 0,
            clipPath: "inset(0 0 0% 0)",
            transition: { duration: 0.9, ease: EASE_OUT },
          },
        }}
        className="
          mb-6 overflow-hidden
          text-4xl font-black uppercase leading-none tracking-tight
          text-foreground text-center
          sm:text-5xl lg:text-6xl
        "
      >
        {title}
      </motion.p>

      {/* Liste des liens */}
      <ul className="flex flex-col items-center space-y-3">{children}</ul>
    </motion.div>
  );
}

// ─── Footer principal ─────────────────────────────────────────────────────────

export function Footer() {
  const lineRef = useRef<HTMLDivElement>(null);
  const lineInView = useInView(lineRef, { once: true });

  return (
    <footer className="relative overflow-hidden bg-background">
      {/* ── Ligne de séparation animée ── */}
      <div ref={lineRef} className="px-8">
        <motion.div
          className="h-px bg-foreground/20"
          initial={{ scaleX: 0, originX: 0 }}
          animate={lineInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.4, ease: EASE_OUT }}
          style={{ transformOrigin: "left" }}
        />
      </div>

      {/* ── Contenu ── */}
      <div className="relative px-8 pb-12 pt-16">
        {/* Watermark logo — déborde en bas à droite */}
        <svg
          viewBox="0 0 36 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="
            pointer-events-none absolute
            -bottom-8 -right-8
            h-[55%] w-auto select-none
            text-foreground
            opacity-[0.04]
          "
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.3257 0.0267197C7.66029 -0.328638 0.329513 2.71855 0.329513 17.7502C0.329513 20.7929 0.234566 23.6434 0.146605 26.2842C-0.308615 39.9509 -0.576721 48 13.4713 48C30.2337 48 36 42.6696 36 34.1411C36 30.4312 33.7534 27.0786 31.0925 24.4773C27.6125 21.0754 24.8974 16.5883 25.3496 11.7582C25.5616 9.49273 25.1775 7.14739 23.6321 5.46864C21.2241 2.85291 17.0891 0.0267197 11.3257 0.0267197ZM16.61 16.2521C16.8863 17.92 15.5914 19.436 13.8904 19.436C9.79977 19.436 9.3883 11.2144 13.7041 11.2144C16.2528 11.2144 16.3689 13.0825 16.4813 14.892C16.5104 15.3604 16.5393 15.825 16.61 16.2521ZM15.5355 37.8427C15.8552 37.8821 16.1778 37.9074 16.4923 37.9769C16.8528 38.0566 17.2264 38.0566 17.5869 37.9769L17.6257 37.9683C17.9144 37.9045 18.2102 37.8803 18.5041 37.8482C20.552 37.6246 22.1462 35.874 22.1462 33.7805C22.1462 31.787 20.5201 30.1433 18.514 30.1433H16.0192C13.8714 30.1433 12.1303 31.8735 12.1303 34.0078C12.1303 35.9794 13.616 37.6061 15.5355 37.8427Z"
            fill="currentColor"
          />
        </svg>

        {/* ── 3 colonnes ── */}
        <div className="relative grid gap-16 sm:grid-cols-3 sm:gap-8">
          {/* NOUS SUIVRE */}
          <FooterColumn title="Nous suivre" delay={0}>
            {EXTERNAL_LINKS.map((link) => (
              <FooterLink key={link.href} href={link.href} external>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* À PROPOS */}
          <FooterColumn title="À propos" delay={0.08}>
            {ABOUT_CONTACT_LINKS.map((item) => (
              <FooterLink key={item.label} href={buildMailto(item.subject)}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* NOUS CONTACTER */}
          <FooterColumn title="Contact" delay={0.16}>
            {CONTACT_ITEMS.map((item) => (
              <FooterLink key={item.label} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        {/* ── Bas de page ── */}
        <div className="relative mt-20 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-brew-acid)]">
            © {new Date().getFullYear()} Brew SAS. Tous droits réservés.
          </span>
          <span className="font-black italic text-foreground/90 text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-none">
            Sip, listen, dance.
          </span>
        </div>
      </div>
    </footer>
  );
}
