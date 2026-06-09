/**
 * Évènement Brew FM.
 *
 * Source primaire : API Shotgun (nom, date, line-up, billetterie, lieu brut).
 * Source d'enrichissement : base Notion "Event Enrichments" (lieu Notion,
 * artistes Brew FM, recap, photos, statut éditorial).
 *
 * Clé pivot : `Shotgun Event ID` (présent dans les deux sources).
 * La règle V1 : tout event Brew FM est créé sur Shotgun, même gratuit.
 */

import type { Artist } from "./artist";
import type { Venue } from "./venue";

export type EventTypeOfPlace =
  | "coffee_shop" // ☕ (Shotgun null OU override Notion)
  | "club" // 🎉
  | "concert"
  | "festival"
  | "warehouse"
  | "open_air"
  | "other";

export type EventEditorialStatus = "to_document" | "in_progress" | "published";

/**
 * Artiste tel qu'il apparaît sur un event.
 * Vient de Shotgun (line-up officiel) avec enrichissement Notion possible.
 */
export type EventArtist = {
  id: number; // Shotgun artist ID
  name: string;
  slug?: string; // Slug Shotgun
  avatarUrl?: string; // Avatar Shotgun (Cloudinary)
  shotgunUrl?: string; // Page Shotgun de l'artiste

  // Si match avec base Notion Artistes (via shotgunArtistId)
  isBrewArtist?: boolean; // true si présent dans Notion Artistes
  brewArtist?: Artist; // La fiche Notion complète si match
};

export type Event = {
  // Identifiants
  id: number; // Shotgun Event ID (clé pivot)
  notionEnrichmentId?: string; // >ID page Notion EE si enrichi

  // Données Shotgun
  name: string;
  slug: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime?: string;
  url: string; // URL Shotgun publique (CTA principal)
  coverUrl?: string;

  // Lieu (Shotgun = brut, Notion = enrichi)
  shotgunVenueName?: string; // ex: "Le POPUP du Label"
  shotgunVenueAddress?: string; // ex: "14 Rue Abel, 75012 Paris"
  shotgunVenueCity?: string; // ex: "Paris"
  brewVenue?: Venue; // Si match avec base Lieux Notion

  // Type de lieu
  typeOfPlace: EventTypeOfPlace;
  typeOfPlaceOverridden?: boolean; // true si overridé via Notion

  // Artistes (fusion Shotgun + Notion EE)
  artists: EventArtist[];

  // Enrichissements Notion
  recap?: string; // Texte rétrospectif
  photoUrls?: string[]; // Photos d'archives
  editorialStatus?: EventEditorialStatus;
  youtubeUrl?: string; // V1.5 — usage à définir (aftermovie ?)

  // Métadonnées dérivées
  isCancelled: boolean;
  isPast: boolean; // Dérivé de startTime vs now
};
