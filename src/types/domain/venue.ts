/**
 * Lieu Brew FM.
 *
 * Source : base Notion "Lieux".
 *
 * Modèle minimaliste : un lieu = catalogue visuel.
 * Toutes les données contextuelles (adresse, line-up, date) appartiennent
 * aux évènements qui s'y passent, pas au lieu lui-même.
 *
 * Au clic sur un lieu, redirection vers la playlist YouTube associée
 * (1 playlist par lieu sur la chaîne Brew FM).
 */

export type VenueType = "coffee_shop" | "club" | "vinyl" | "other";
export type VenueFormat = "club_in_coffee" | "coffee_in_club";

export type Venue = {
  // Identifiants
  id: string; // Notion page ID
  slug?: string; // URL-friendly, si défini

  // Affichage
  name: string; // ex: "Miniwax"
  coverUrl?: string; // Photo principale du lieu

  // Classification
  type?: VenueType; // ☕ Coffee shop / 🎉 Club / 🎵 Vinyle / 🤝 Autre
  format?: VenueFormat; // 🌅 Club in the Coffee shop / 🌙 Coffee shop in the Club

  // CTA principal de la card lieu
  youtubePlaylistUrl?: string; // URL playlist YouTube du lieu

  // Relations Notion (vers Event Enrichments)
  eventIds?: string[];
};
