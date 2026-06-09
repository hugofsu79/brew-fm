"use client";

/**
 * AboutContent — Page About Brew FM.
 *
 * 3 sections :
 *   1. HERO      — titre display + texte, typographie seule, respirant
 *   2. LA TEAM   — section sticky plein écran, image background, titre
 *                  "LA TEAM" qui glisse de gauche vers sa position au scroll
 *                  (useScroll + useTransform Motion, équivalent GSAP ScrollTrigger)
 *   3. TROMBI    — grille portraits, zéro border-radius, hover opacity
 *
 * ⚠️ Remplace les placeholders src="" et les noms/rôles par tes vraies données.
 */

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

// ─── Data placeholders ────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  { name: "Louis",    role: "Co-fondateur · DJ Résident",  src: "" },
  { name: "Estelle",  role: "Co-fondatrice · DJ Résidente", src: "" },
  { name: "SERVYE",   role: "DJ Résident",                  src: "" },
  { name: "SØLE V",   role: "DJ Résident",                  src: "" },
  { name: "OZZMAN",   role: "DJ Résident",                  src: "" },
];

// ─── Easing ───────────────────────────────────────────────────────────────────

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// ─── Section 1 — Hero ────────────────────────────────────────────────────────

function SectionHero() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-40 pt-32 sm:px-12 sm:pt-40">
      <motion.div
        initial={{ opacity: 0, y: 30, clipPath: "inset(0 0 100% 0)" }}
        animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: 0.9, ease: EASE_OUT }}
      >
        <h1 className="mb-12 text-6xl font-black uppercase leading-[0.9] tracking-tighter sm:text-8xl lg:text-9xl">
          Brew
          <br />
          <span style={{ color: "var(--color-brew-acid)" }}>FM</span>
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT }}
        className="grid gap-10 md:grid-cols-2"
      >
        {/* Colonne gauche : phrase accroche */}
        <div>
          <p className="text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl">
            Club in the Coffee shop.
            <br />
            <span className="text-foreground/40">Coffee shop in the Club.</span>
          </p>
        </div>

        {/* Colonne droite : texte corpo */}
        <div className="space-y-4 text-base leading-relaxed text-foreground/60 sm:text-lg">
          <p>
            Brew FM est un collectif musical parisien né de l&apos;envie de briser les frontières
            entre deux mondes : le café de spécialité et la musique électronique.
          </p>
          <p>
            On organise des événements là où on ne nous attend pas — dans les coffee shops de
            quartier comme dans les clubs — pour créer des moments hybrides, intimes et dansants.
          </p>
          <p>
            UK Garage, Drum &amp; Bass, Jungle. Du son, du café, de l&apos;énergie.
          </p>
        </div>
      </motion.div>

      {/* Ligne séparatrice */}
      <motion.div
        className="mt-24 h-px w-full bg-foreground/10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.6, ease: EASE_OUT }}
        style={{ transformOrigin: "left" }}
      />
    </section>
  );
}

// ─── Section 2 — La Team (sticky scroll) ─────────────────────────────────────

/**
 * Effet scroll GSAP-style avec Motion :
 *   - Le container parent a une hauteur de 200vh → crée du scroll "interne"
 *   - useScroll({ target }) traque la progression de ce container
 *   - useTransform mappe [0, 1] → [translateX(-60vw), translateX(0)]
 *   - Résultat : le titre glisse de gauche vers sa position finale au scroll
 */
function SectionTeam() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Titre : entre de la gauche et se pose sur sa position finale
  const titleX = useTransform(scrollYProgress, [0, 0.5], ["-55vw", "0vw"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  // Sous-titre : fade in léger décalé
  const subtitleOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const subtitleY = useTransform(scrollYProgress, [0.2, 0.5], [20, 0]);

  // Parallaxe : l'image se déplace plus lentement que le scroll
  // → crée une impression de profondeur (effet classique)
  const imageY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    // Hauteur 200vh = zone de scroll pour l'animation
    <div ref={containerRef} className="relative h-[200vh]">
      {/* Sticky : reste fixé pendant tout le scroll du container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Image background plein écran avec parallaxe */}
        <div className="absolute inset-0">
          {/* Fallback fond sombre — EN DESSOUS de l'image (z-index bas) */}
          <div
            className="absolute inset-0 -z-10"
            style={{ backgroundColor: "var(--color-brew-black)" }}
          />
          {/* Conteneur élargi verticalement pour le parallaxe */}
          <motion.div
            style={{ y: imageY }}
            className="absolute inset-x-0 -bottom-[15%] -top-[15%]"
          >
            {/* biome-ignore lint/performance/noImgElement: image statique locale */}
            <img
              src="/images/team.jpg"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          </motion.div>
          {/* Voile sombre au-dessus de l'image pour lisibilité du texte */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Contenu superposé */}
        <div className="relative flex h-full flex-col justify-between p-8 sm:p-14">
          {/* Titre animé — coin haut gauche */}
          <div className="overflow-hidden">
            <motion.h2
              style={{ x: titleX, opacity: titleOpacity }}
              className="text-[clamp(3rem,10vw,8rem)] font-black uppercase leading-none tracking-tighter text-white"
            >
              La Team
            </motion.h2>
          </div>

          {/* Bas : tagline */}
          <motion.p
            style={{ opacity: subtitleOpacity, y: subtitleY }}
            className="max-w-sm text-sm font-medium uppercase tracking-widest text-white/50"
          >
            Le collectif derrière Brew FM — résidents, co-fondateurs, passionnés.
          </motion.p>
        </div>
      </div>
    </div>
  );
}

// ─── Section 3 — Trombinoscope ────────────────────────────────────────────────

function MemberCard({ name, role, src, index }: {
  name: string;
  role: string;
  src: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: EASE_OUT }}
      className="group"
    >
      {/* Photo — ratio carré, zéro border-radius */}
      <div className="relative aspect-square overflow-hidden bg-foreground/10">
        {src ? (
          // biome-ignore lint/performance/noImgElement: image externe
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          /* Fallback initiale */
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: "var(--color-brew-black)" }}
          >
            <span
              className="text-5xl font-black uppercase opacity-20"
              style={{ color: "var(--color-brew-acid)" }}
            >
              {name.charAt(0)}
            </span>
          </div>
        )}

        {/* Hover overlay — ligne acide en bas */}
        <div
          className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
          style={{ backgroundColor: "var(--color-brew-acid)" }}
        />
      </div>

      {/* Infos */}
      <div className="mt-3">
        <p className="text-sm font-black uppercase tracking-tight">{name}</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-widest text-foreground/40">{role}</p>
      </div>
    </motion.div>
  );
}

function SectionTrombi() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-32 sm:px-12">
      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
        className="mb-16"
      >
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/30">
          03 — Collectif
        </p>
        <h2 className="text-4xl font-black uppercase leading-none tracking-tighter sm:text-6xl">
          Les résidents
        </h2>
      </motion.div>

      {/* Grille */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {TEAM_MEMBERS.map((member, i) => (
          <MemberCard
            key={member.name}
            name={member.name}
            role={member.role}
            src={member.src}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function AboutContent() {
  return (
    <main>
      <SectionHero />
      <SectionTeam />
      <SectionTrombi />
    </main>
  );
}