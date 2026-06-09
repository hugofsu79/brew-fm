/**
 * Configuration de navigation du hamburger menu.
 *
 * Liens statiques (pages internes + réseaux sociaux externes).
 * Pas de typage domain ici : c'est de la config, pas de la donnée métier.
 */
export type NavLink = {
  label: string;
  href: string;
};
/**
 * Liens vers les pages internes du site.
 * Ordre = ordre d'affichage dans le menu.
 */
export const INTERNAL_LINKS = [
  { href: "/", label: "Radio" },
  { href: "/events", label: "Évènements" },
  { href: "/artistes", label: "Résidents" },
  { href: "/lieux", label: "Lieux" },
  { href: "/about", label: "About" },
];
/**
 * Liens vers les profils externes de Brew FM.
 * URLs à confirmer avant déploiement prod.
 */
export const EXTERNAL_LINKS: NavLink[] = [
  { label: "Shotgun", href: "https://shotgun.live/organizers/brew-fm" },
  { label: "Instagram", href: "https://instagram.com/brewfm" },
  { label: "YouTube", href: "https://youtube.com/@brewfm" },
  { label: "Twitch", href: "https://twitch.tv/brew_fm" },
];
