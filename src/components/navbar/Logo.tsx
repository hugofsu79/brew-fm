/**
 * Logo Brew FM (gauche de la navbar).
 *
 * Server Component (pas d'interactivité). Wrappé dans un <Link> vers la home.
 *
 * Notes :
 *   - Le SVG est décoratif (le <Link aria-label> porte déjà le texte alternatif),
 *     donc marqué aria-hidden="true" → satisfait la règle a11y de Biome.
 *   - fill="currentColor" : le logo hérite de la couleur du texte → s'adapte au
 *     thème (clair/sombre) et au hover. Remets "#05180A" si tu veux la teinte fixe.
 *   - Taille : h-8 w-auto pour rester aligné dans la barre. Ajuste si besoin.
 */

import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Brew FM — accueil"
      className="flex items-center gap-2 transition-opacity hover:opacity-80"
    >
      <svg
        viewBox="0 0 36 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="h-8 w-auto"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.3257 0.0267197C7.66029 -0.328638 0.329513 2.71855 0.329513 17.7502C0.329513 20.7929 0.234566 23.6434 0.146605 26.2842C-0.308615 39.9509 -0.576721 48 13.4713 48C30.2337 48 36 42.6696 36 34.1411C36 30.4312 33.7534 27.0786 31.0925 24.4773C27.6125 21.0754 24.8974 16.5883 25.3496 11.7582C25.5616 9.49273 25.1775 7.14739 23.6321 5.46864C21.2241 2.85291 17.0891 0.0267197 11.3257 0.0267197ZM16.61 16.2521C16.8863 17.92 15.5914 19.436 13.8904 19.436C9.79977 19.436 9.3883 11.2144 13.7041 11.2144C16.2528 11.2144 16.3689 13.0825 16.4813 14.892C16.5104 15.3604 16.5393 15.825 16.61 16.2521ZM15.5355 37.8427C15.8552 37.8821 16.1778 37.9074 16.4923 37.9769C16.8528 38.0566 17.2264 38.0566 17.5869 37.9769L17.6257 37.9683C17.9144 37.9045 18.2102 37.8803 18.5041 37.8482C20.552 37.6246 22.1462 35.874 22.1462 33.7805C22.1462 31.787 20.5201 30.1433 18.514 30.1433H16.0192C13.8714 30.1433 12.1303 31.8735 12.1303 34.0078C12.1303 35.9794 13.616 37.6061 15.5355 37.8427Z"
          fill="currentColor"
        />
      </svg>

      <span className="text-lg font-bold tracking-tight">
        Brew<span className="opacity-60">FM</span>
      </span>
    </Link>
  );
}
