/**
 * Fetch & mapping des artistes depuis Notion.
 *
 * Source : base Notion "Artistes" (résidents + invités).
 *
 * Mapping des colonnes Notion (FR) → champs Artist (EN) :
 *   Nom               → name
 *   Slug              → slug
 *   Statut            → status (Résident / Invité)
 *   Photo Artiste     → photoUrl
 *   Photo cover       → coverUrl
 *   Bio               → bioShort
 *   Genre             → genres
 *   Date d'arrivée    → arrivedAt
 *   Instagram         → instagram
 *   Soundcloud        → soundcloud
 *   Spotify           → spotify
 *   Shotgun URL       → shotgunUrl
 *   PassageBrew       → passageBrewUrl
 *   Shotgun Artist ID → shotgunArtistId
 *   Évènements        → eventIds (relation)
 *   Émission          → episodeIds (relation)
 */

import { env } from "@/lib/env";
import type { Artist, ArtistStatus } from "@/types/domain/artist";
import { type NotionPage, queryNotionDatabase } from "./client";
import {
  extractDate,
  extractMultiSelect,
  extractNumber,
  extractRelationIds,
  extractRichText,
  extractSelect,
  extractTitle,
  extractUrl,
} from "./helpers";

/**
 * Mappe une page Notion brute vers le type Artist du domaine.
 * Garde un nom inconnu si le title est vide (au lieu de crasher).
 */
function mapNotionArtist(page: NotionPage): Artist {
  const props = page.properties;

  const statusRaw = extractSelect(props.Statut);
  const status: ArtistStatus = statusRaw?.toLowerCase().includes("résident") ? "resident" : "guest";

  return {
    id: page.id,
    slug: extractRichText(props.Slug) ?? page.id,
    name: extractTitle(props.Nom) ?? "Sans nom",
    status,

    photoUrl: extractUrl(props["Photo Artiste"]),
    coverUrl: undefined, // Colonne "Photo cover" type files — à activer plus tard

    bioShort: extractRichText(props.Bio),

    genres: extractMultiSelect(props.Genre),
    arrivedAt: extractDate(props["Date d'arrivée"]),

    instagram: extractUrl(props.Instagram),
    soundcloud: extractUrl(props.Soundcloud),
    spotify: extractUrl(props.Spotify),
    shotgunUrl: extractUrl(props["Shotgun URL"]),

    passageBrewUrl: extractUrl(props.PassageBrew),

    shotgunArtistId: extractNumber(props["Shotgun Artist ID"]),

    eventIds: extractRelationIds(props["Évènements"]),
    episodeIds: extractRelationIds(props["Émission"]),
  };
}

/**
 * Récupère tous les artistes Brew FM depuis Notion.
 * Caching : 1h via le tag "notion-artistes".
 */
export async function fetchArtists(): Promise<Artist[]> {
  const pages = await queryNotionDatabase(env.notion.dbArtistes, "notion-artistes");
  return pages.map(mapNotionArtist);
}

/**
 * Récupère uniquement les résidents Brew FM.
 */
export async function fetchResidents(): Promise<Artist[]> {
  const all = await fetchArtists();
  return all.filter((a) => a.status === "resident");
}

/**
 * Trouve un artiste Brew FM par son Shotgun Artist ID.
 * Utile pour la fusion line-up Shotgun ↔ artistes Brew FM.
 */
export async function findArtistByShotgunId(shotgunArtistId: number): Promise<Artist | undefined> {
  const all = await fetchArtists();
  return all.find((a) => a.shotgunArtistId === shotgunArtistId);
}
