"use client";

/**
 * VenueWall — Mur de noms de lieux en flux typographique continu.
 *
 * Identique à l'original, seul changement : les noms sont centrés
 * (flex flex-wrap justify-center items-center sur le wrapper).
 */

import type { Venue } from "@/types/domain/venue";

/** Grain de café séparateur (vert Brew Acid, taille relative au texte). */
function CoffeeBean() {
  return (
    <svg
      width="0.7em"
      height="0.7em"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="mx-3 inline-block shrink-0 align-middle sm:mx-5"
    >
      <path
        d="M4.125 4.125C9.53255 -1.28255 19.2044 -0.594454 25.6924 5.89355C32.1801 12.3816 32.8674 22.0525 27.46 27.46C22.0525 32.8674 12.3816 32.1801 5.89355 25.6924C-0.594454 19.2044 -1.28255 9.53255 4.125 4.125ZM25.3174 6.26758C19.1472 0.0975223 9.79948 -0.815105 4.49121 4.49316L4.48438 4.5C3.98278 5.00333 3.64454 5.66225 3.55957 6.38184H3.55859C3.49508 6.92633 3.5074 7.48592 3.59668 8.05176C3.78452 9.24086 4.31417 10.4152 5.08789 11.3662H5.08887C5.1714 11.4673 5.16489 11.6202 5.06836 11.7168C5.06328 11.7219 5.05527 11.729 5.04297 11.7393C4.95636 11.8079 4.80961 11.8096 4.70508 11.7236L4.66309 11.6816C4.3675 11.3161 4.0593 10.7058 3.78516 10.0527C3.29877 8.89417 1.62221 9.06563 1.34863 10.2734C0.232905 15.2075 1.96609 21.0169 6.26758 25.3184C12.4377 31.4882 21.7846 32.401 27.0928 27.0928C27.3625 26.8231 27.4502 26.47 27.4639 26.1553C27.4776 25.8394 27.4206 25.504 27.3418 25.1934C27.1847 24.5741 26.9061 23.9292 26.75 23.5439C26.3877 22.6496 25.9177 21.802 25.3545 21.0244H25.3535C25.2617 20.8961 25.3035 20.7022 25.4688 20.626H25.4697C25.5687 20.5802 25.7088 20.6112 25.7871 20.7197C26.3717 21.5286 26.8593 22.4098 27.2363 23.3389L27.2383 23.3418L27.2432 23.3535V23.3545C27.6676 24.4051 29.149 24.3992 29.582 23.3623C31.796 18.0649 30.2283 11.1785 25.3174 6.26758Z"
        fill="#A6FF3E"
        stroke="#A6FF3E"
      />
    </svg>
  );
}

/** Un nom de lieu cliquable. <a> si playlist, <button> sinon. */
function VenueName({
  venue,
  isHovered,
  onHoverChange,
}: {
  venue: Venue;
  isHovered: boolean;
  onHoverChange: (id: string | null) => void;
}) {
  const handlers = {
    onMouseEnter: () => onHoverChange(venue.id),
    onMouseLeave: () => onHoverChange(null),
    onFocus: () => onHoverChange(venue.id),
    onBlur: () => onHoverChange(null),
    className: "inline cursor-pointer whitespace-nowrap transition-opacity duration-300",
    style: { opacity: isHovered ? 1 : 0.4 },
  };

  if (venue.youtubePlaylistUrl) {
    return (
      <a href={venue.youtubePlaylistUrl} target="_blank" rel="noopener noreferrer" {...handlers}>
        {venue.name}
      </a>
    );
  }

  return (
    <button type="button" {...handlers}>
      {venue.name}
    </button>
  );
}

export function VenueWall({
  venues,
  hoveredId,
  onHoverChange,
}: {
  venues: Venue[];
  hoveredId: string | null;
  onHoverChange: (id: string | null) => void;
}) {
  if (venues.length === 0) {
    return (
      <p className="text-center text-sm uppercase tracking-widest text-foreground/40">
        Aucun lieu dans ce format pour le moment.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-y-2 text-4xl font-medium uppercase leading-[1.15] tracking-tight sm:text-6xl sm:leading-[1.1]">
      {venues.map((venue, i) => (
        <span key={venue.id} className="flex items-center">
          <VenueName
            venue={venue}
            isHovered={hoveredId === venue.id}
            onHoverChange={onHoverChange}
          />
          {i < venues.length - 1 && <CoffeeBean />}
        </span>
      ))}
    </div>
  );
}
