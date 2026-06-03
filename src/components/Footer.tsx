/**
 * Footer — pied de page global Brew FM.
 *
 * Style : sobre, fond noir, 3 colonnes + watermark logo géant à droite.
 *   - NOUS SUIVRE    : réseaux sociaux (réutilise EXTERNAL_LINKS)
 *   - À PROPOS       : liens de contact qui génèrent un mailto pré-rempli
 *                      (destinataire + objet selon le contexte)
 *   - NOUS CONTACTER : tél, email, localisation
 *
 * Titres de colonnes en vert acide, liens en gris clair (hover → blanc/acide).
 * Bas de page : copyright (acide) + mention légale (gris foncé).
 *
 * Server Component (aucune interactivité JS).
 */

import { EXTERNAL_LINKS } from "@/lib/config/navigation";

/** Email de contact du collectif. */
const CONTACT_EMAIL = "brewfm.contact@gmail.com";

/**
 * Liens "À propos" → mailto pré-remplis.
 * Chaque entrée ouvre le client mail avec destinataire + objet adaptés.
 */
const ABOUT_CONTACT_LINKS: { label: string; subject: string }[] = [
  { label: "J'ai un coffee shop", subject: "Partenariat — J'ai un coffee shop" },
  { label: "J'ai un club", subject: "Partenariat — J'ai un club" },
  { label: "On recrute", subject: "Recrutement — Proposition" },
  { label: "Je suis DJ", subject: "Booking — Je suis DJ" },
];

/** Construit une URL mailto avec objet pré-rempli. */
function buildMailto(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

/** Logo Brew FM géant, en watermark très sombre (fond droite). */
function WatermarkLogo() {
  return (
    <svg
      viewBox="0 0 36 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="pointer-events-none absolute -right-10 top-1/2 h-[140%] w-auto -translate-y-1/2 select-none text-foreground/20 opacity-15"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.3257 0.0267197C7.66029 -0.328638 0.329513 2.71855 0.329513 17.7502C0.329513 20.7929 0.234566 23.6434 0.146605 26.2842C-0.308615 39.9509 -0.576721 48 13.4713 48C30.2337 48 36 42.6696 36 34.1411C36 30.4312 33.7534 27.0786 31.0925 24.4773C27.6125 21.0754 24.8974 16.5883 25.3496 11.7582C25.5616 9.49273 25.1775 7.14739 23.6321 5.46864C21.2241 2.85291 17.0891 0.0267197 11.3257 0.0267197ZM16.61 16.2521C16.8863 17.92 15.5914 19.436 13.8904 19.436C9.79977 19.436 9.3883 11.2144 13.7041 11.2144C16.2528 11.2144 16.3689 13.0825 16.4813 14.892C16.5104 15.3604 16.5393 15.825 16.61 16.2521ZM15.5355 37.8427C15.8552 37.8821 16.1778 37.9074 16.4923 37.9769C16.8528 38.0566 17.2264 38.0566 17.5869 37.9769L17.6257 37.9683C17.9144 37.9045 18.2102 37.8803 18.5041 37.8482C20.552 37.6246 22.1462 35.874 22.1462 33.7805C22.1462 31.787 20.5201 30.1433 18.514 30.1433H16.0192C13.8714 30.1433 12.1303 31.8735 12.1303 34.0078C12.1303 35.9794 13.616 37.6061 15.5355 37.8427Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Style commun des liens de colonne. */
const LINK_CLASS = "text-lg text-foreground/70 transition-colors hover:text-foreground sm:text-xl";

/** Style commun des titres de colonne (vert acide). */
const HEADING_CLASS = "mb-5 text-sm font-semibold uppercase tracking-widest text-[#A6FF3E]";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-background px-8 py-12">
      <WatermarkLogo />

      {/* 3 colonnes */}
      <div className="relative grid gap-12 sm:grid-cols-3 sm:gap-8">
        {/* NOUS SUIVRE */}
        <nav className="text-center sm:text-left">
          <p className={HEADING_CLASS}>Nous suivre</p>
          <ul className="space-y-3">
            {EXTERNAL_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* À PROPOS — mailto pré-remplis */}
        <nav className="text-center">
          <p className={HEADING_CLASS}>À propos</p>
          <ul className="space-y-3">
            {ABOUT_CONTACT_LINKS.map((item) => (
              <li key={item.label}>
                <a href={buildMailto(item.subject)} className={LINK_CLASS}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* NOUS CONTACTER */}
        <nav className="text-center sm:text-right">
          <p className={HEADING_CLASS}>Nous contacter</p>
          <ul className="space-y-3">
            <li>
              <a href="tel:+33000000000" className={LINK_CLASS}>
                00 00 00 00 00
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className={LINK_CLASS}>
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <span className="text-lg text-foreground/70 sm:text-xl">Paris, France</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Bas de page : copyright + mention légale */}
      <div className="relative mt-20 flex flex-col gap-2 text-xs uppercase tracking-wide sm:flex-row sm:items-center sm:gap-4">
        <span className="font-bold text-[#A6FF3E]">
          © {new Date().getFullYear()} Brew SAS. Tous droits réservés.
        </span>
        <span className="text-foreground/30">Sip, listen, dance — Brew FM, Paris.</span>
      </div>
    </footer>
  );
}
