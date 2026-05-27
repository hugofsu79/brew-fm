/**
 * Fetch & mapping des lieux depuis Notion.
 *
 * Source : base Notion "Lieux".
 *
 * Mapping des colonnes Notion (FR) → champs Venue (EN) :
 *   Nom               → name   (⚠️ colonne historiquement nommée "Venue")
 *   Slug              → slug
 *   Type              → type   (Coffee Shop / Club / Vinyle / Autre)
 *   Format Brew FM    → format (Club in the Coffee shop / Coffee shop in the Club)
 *   Photo du lieu     → coverUrl
 *   Youtube Playlist  → youtubePlaylistUrl
 *   Évènements        → eventIds (relation)
 */

import { env } from "@/lib/env";
import type { Venue, VenueFormat, VenueType } from "@/types/domain/venue";
import { type NotionPage, queryNotionDatabase } from "./client";
import {
  extractFirstFileUrl,
  extractRelationIds,
  extractRichText,
  extractSelect,
  extractTitle,
  extractUrl,
} from "./helpers";

/**
 * Mappe le Select Notion "Type" vers l'enum VenueType.
 */
function mapVenueType(raw?: string): VenueType | undefined {
  if (!raw) return undefined;
  const normalized = raw.toLowerCase();
  if (normalized.includes("coffee")) return "coffee_shop";
  if (normalized.includes("club")) return "club";
  if (normalized.includes("vinyl")) return "vinyl";
  return "other";
}

/**
 * Mappe le Select Notion "Format Brew FM" vers l'enum VenueFormat.
 */
function mapVenueFormat(raw?: string): VenueFormat | undefined {
  if (!raw) return undefined;
  const normalized = raw.toLowerCase();
  if (normalized.includes("club in")) return "club_in_coffee";
  if (normalized.includes("coffee shop in")) return "coffee_in_club";
  return undefined;
}

/**
 * Mappe une page Notion brute vers le type Venue du domaine.
 *
 * Note : la colonne titre dans Notion s'appelle historiquement "Venue".
 * On la lit via `props.Venue` ou `props.Nom` (au cas où renommée).
 */
function mapNotionVenue(page: NotionPage): Venue {
  const props = page.properties;
  const name = extractTitle(props.Nom) ?? extractTitle(props.Venue) ?? "Sans nom";

  return {
    id: page.id,
    slug: extractRichText(props.Slug),
    name,
    coverUrl: extractFirstFileUrl(props["Photo du lieu"]),
    type: mapVenueType(extractSelect(props.Type)),
    format: mapVenueFormat(extractSelect(props["Format Brew FM"])),
    youtubePlaylistUrl: extractUrl(props["Youtube Playlist"]),
    eventIds: extractRelationIds(props["Évènements"]),
  };
}

/**
 * Récupère tous les lieux Brew FM depuis Notion.
 * Caching : 1h via le tag "notion-lieux".
 */
export async function fetchVenues(): Promise<Venue[]> {
  const pages = await queryNotionDatabase(env.notion.dbLieux, "notion-lieux");
  return pages.map(mapNotionVenue);
}

/**
 * Récupère un lieu par son ID Notion (utile pour résoudre les relations).
 */
export async function findVenueById(id: string): Promise<Venue | undefined> {
  const all = await fetchVenues();
  return all.find((v) => v.id === id);
}
