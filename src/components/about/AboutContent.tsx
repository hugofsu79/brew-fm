"use client";

/**
 * AboutContent — Page About du collectif Brew FM (style brutaliste).
 *
 * ⚠️ CONTENU PLACEHOLDER : tous les textes marqués [À REMPLIR] sont à remplacer
 * par le vrai contenu de Hugo. La STRUCTURE et les ANIMATIONS sont définitives.
 *
 * Structure : 4 sections thématiques alternées
 *   1. ORIGINE  — l'histoire, comment c'est né
 *   2. CONCEPT  — "Club in the Coffee shop / Coffee shop in the Club"
 *   3. ÉQUIPE   — les membres du collectif
 *   4. VISION   — où on va
 *
 * DA brutaliste : bordures épaisses, blocs décalés, gros titres débordants,
 * grain de café récurrent, vert acide en accent. Animations via Motion
 * (reveal au scroll avec whileInView + stagger).
 *
 * Images/gifs : placeholders <div> avec ratio — remplace les src par tes médias.
 */

import { motion } from "motion/react";

/** Grain de café décoratif (vert Brew Acid). */
function CoffeeBean({ className = "" }: { className?: string }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4.125 4.125C9.53255 -1.28255 19.2044 -0.594454 25.6924 5.89355C32.1801 12.3816 32.8674 22.0525 27.46 27.46C22.0525 32.8674 12.3816 32.1801 5.89355 25.6924C-0.594454 19.2044 -1.28255 9.53255 4.125 4.125ZM25.3174 6.26758C19.1472 0.0975223 9.79948 -0.815105 4.49121 4.49316L4.48438 4.5C3.98278 5.00333 3.64454 5.66225 3.55957 6.38184H3.55859C3.49508 6.92633 3.5074 7.48592 3.59668 8.05176C3.78452 9.24086 4.31417 10.4152 5.08789 11.3662H5.08887C5.1714 11.4673 5.16489 11.6202 5.06836 11.7168C5.06328 11.7219 5.05527 11.729 5.04297 11.7393C4.95636 11.8079 4.80961 11.8096 4.70508 11.7236L4.66309 11.6816C4.3675 11.3161 4.0593 10.7058 3.78516 10.0527C3.29877 8.89417 1.62221 9.06563 1.34863 10.2734C0.232905 15.2075 1.96609 21.0169 6.26758 25.3184C12.4377 31.4882 21.7846 32.401 27.0928 27.0928C27.3625 26.8231 27.4502 26.47 27.4639 26.1553C27.4776 25.8394 27.4206 25.504 27.3418 25.1934C27.1847 24.5741 26.9061 23.9292 26.75 23.5439C26.3877 22.6496 25.9177 21.802 25.3545 21.0244H25.3535C25.2617 20.8961 25.3035 20.7022 25.4688 20.626H25.4697C25.5687 20.5802 25.7088 20.6112 25.7871 20.7197C26.3717 21.5286 26.8593 22.4098 27.2363 23.3389L27.2383 23.3418L27.2432 23.3535V23.3545C27.6676 24.4051 29.149 24.3992 29.582 23.3623C31.796 18.0649 30.2283 11.1785 25.3174 6.26758Z"
        fill="#A6FF3E"
        stroke="#A6FF3E"
      />
    </svg>
  );
}

/** Placeholder média : bloc avec ratio + label. Remplace par <img>/<video>. */
function MediaPlaceholder({ label, ratio = "4/3" }: { label: string; ratio?: string }) {
  return (
    <div
      className="relative grid place-items-center border-4 border-foreground bg-foreground/5"
      style={{ aspectRatio: ratio }}
    >
      <span className="px-4 text-center text-xs font-bold uppercase tracking-widest text-foreground/40">
        [MÉDIA] {label}
      </span>
      {/* Coin accent brutaliste */}
      <span className="absolute -right-2 -top-2 h-5 w-5 bg-[#A6FF3E]" />
    </div>
  );
}

/** Variantes d'animation reveal au scroll. */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const VIEWPORT = { once: true, margin: "-80px" };

export function AboutContent() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      {/* ===================== HERO ===================== */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        className="mb-32"
      >
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl font-black uppercase leading-[0.9] tracking-tighter sm:text-8xl md:text-9xl"
        >
          About
          <CoffeeBean className="ml-2 inline-block align-top text-3xl sm:text-5xl" />
        </motion.h1>
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-xl border-l-4 border-[#A6FF3E] pl-5 text-lg font-medium uppercase leading-snug tracking-tight text-foreground/70"
        >
          [À REMPLIR] Le tagline du collectif — une phrase qui claque, l&apos;ADN de Brew FM en une
          ligne.
        </motion.p>
      </motion.header>

      {/* ===================== 1. ORIGINE ===================== */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        className="mb-32 grid items-center gap-10 md:grid-cols-2"
      >
        <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
          <span className="mb-4 inline-block bg-foreground px-3 py-1 text-sm font-black uppercase tracking-widest text-background">
            01 — Origine
          </span>
          <h2 className="mb-6 text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl">
            [À REMPLIR] Comment tout a commencé
          </h2>
          <p className="text-base leading-relaxed text-foreground/70 sm:text-lg">
            [À REMPLIR] L&apos;histoire de la naissance du collectif. Le déclic, l&apos;année, les
            premières soirées. Pourquoi café + musique électronique. Deux ou trois paragraphes qui
            racontent d&apos;où vous venez.
          </p>
        </motion.div>
        <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
          <MediaPlaceholder label="Photo d'archive / première soirée" ratio="4/3" />
        </motion.div>
      </motion.section>

      {/* ===================== 2. CONCEPT ===================== */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        className="mb-32"
      >
        {/* Bandeau concept pleine largeur, brutaliste */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="border-4 border-foreground bg-[#A6FF3E] p-8 text-background sm:p-12"
        >
          <span className="mb-4 inline-block text-sm font-black uppercase tracking-widest">
            02 — Concept
          </span>
          <p className="text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">
            Club <span className="opacity-50">in the</span> Coffee shop
            <br />
            Coffee shop <span className="opacity-50">in the</span> Club
          </p>
        </motion.div>
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-8 grid gap-8 md:grid-cols-2"
        >
          <MediaPlaceholder label="GIF ambiance coffee shop" ratio="16/9" />
          <p className="self-center text-base leading-relaxed text-foreground/70 sm:text-lg">
            [À REMPLIR] Explique le concept. On ramène le club dans les coffee shops, et
            l&apos;esprit café dans les clubs. Ce que ça veut dire concrètement, l&apos;expérience
            qu&apos;on vit en venant à un event Brew FM.
          </p>
        </motion.div>
      </motion.section>

      {/* ===================== 3. ÉQUIPE ===================== */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="mb-32"
      >
        <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="mb-10">
          <span className="mb-4 inline-block bg-foreground px-3 py-1 text-sm font-black uppercase tracking-widest text-background">
            03 — Équipe
          </span>
          <h2 className="text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
            Le collectif
          </h2>
        </motion.div>

        {/* Grille de membres */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {["[MEMBRE 1]", "[MEMBRE 2]", "[MEMBRE 3]", "[MEMBRE 4]", "[MEMBRE 5]", "[MEMBRE 6]"].map(
            (name) => (
              <motion.div key={name} variants={fadeUp} transition={{ duration: 0.5 }}>
                <div className="border-4 border-foreground">
                  <MediaPlaceholder label="Portrait" ratio="1/1" />
                </div>
                <p className="mt-3 text-lg font-black uppercase tracking-tight">{name}</p>
                <p className="text-xs font-medium uppercase tracking-widest text-foreground/40">
                  [Rôle]
                </p>
              </motion.div>
            ),
          )}
        </div>
      </motion.section>

      {/* ===================== 4. VISION ===================== */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        className="mb-16"
      >
        <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
          <span className="mb-4 inline-block bg-foreground px-3 py-1 text-sm font-black uppercase tracking-widest text-background">
            04 — Vision
          </span>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-5xl font-black uppercase leading-[0.9] tracking-tighter sm:text-7xl md:text-8xl"
        >
          [À REMPLIR]
          <br />
          Où on <span className="text-[#A6FF3E]">va</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-8 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg"
        >
          [À REMPLIR] La vision long terme. Les ambitions du collectif, ce que vous voulez
          construire, l&apos;impact recherché sur la scène parisienne / au-delà.
        </motion.p>
      </motion.section>
    </div>
  );
}
