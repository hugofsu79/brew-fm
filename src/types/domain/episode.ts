/**
 * Émission Brew FM (Twitch).
 *
 * Source : base Notion "Émissions".
 * Une émission = un live Twitch programmé avec un (ou plusieurs) invité(s).
 *
 * Title Notion = identifiant numéroté ("Émission #4").
 * Format = type de format (select Notion : "Un café avec", futurs formats...).
 * Le displayTitle est construit côté code : "{format} avec {guest.name}".
 *
 * Miniature dérivée du Youtube Interview URL (fallback DJ Set).
 */

import type { Artist } from "./artist";

export type EpisodeStatus =
  | "upcoming" // 📅 À venir
  | "live" // 🔴 Live en cours
  | "replay_available" // 📼 Replay disponible
  | "archived"; // 🗄️ Archivé

export type EpisodeEditorialStatus = "draft" | "scheduled" | "published";

export type Episode = {
  // Identifiants
  id: string; // Notion page ID
  number: string; // Title Notion brut, ex: "Émission #4"

  // Format & invités
  format?: string; // ex: "Un café avec"
  guests: Artist[]; // Relation Invité(s) → Artistes (résolue par le mapper)

  // Date
  date: string; // ISO date (YYYY-MM-DD)

  // Statuts
  status: EpisodeStatus;
  editorialStatus?: EpisodeEditorialStatus;

  // Contenu
  twitchUrl?: string;
  youtubeInterviewUrl?: string;
  youtubeDjSetUrl?: string;

  // Dérivés (calculés par le mapper)
  thumbnailUrl?: string; // Dérivé de youtubeInterviewUrl (fallback DJ Set)
  displayTitle: string; // "Un café avec Mathilde" (format + " avec " + guest.name)
  isPast: boolean; // Dérivé de date vs now
};
