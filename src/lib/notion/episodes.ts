/**
 * Fetch & mapping des émissions depuis Notion.
 *
 * Source : base Notion "Émissions".
 *
 * Mapping des colonnes Notion (FR) → champs Episode (EN) :
 *   Nom de l'émission       → number (ex: "Émission #4")
 *   Format                  → format (ex: "Un café avec")
 *   Date émission           → date
 *   Statut                  → status
 *   Statut éditorial        → editorialStatus
 *   Twitch URL              → twitchUrl
 *   Youtube Interview URL   → youtubeInterviewUrl
 *   Youtube DJ Set URL      → youtubeDjSetUrl
 *   Invités                 → guests (relation, résolue par le caller)
 *
 * Les champs dérivés (displayTitle, thumbnailUrl, isPast) sont calculés.
 * Les guests sont retournés vides au niveau de ce fetcher ;
 * le caller doit faire la jointure avec fetchArtists() si besoin.
 */

import { env } from "@/lib/env";
import type { Episode, EpisodeEditorialStatus, EpisodeStatus } from "@/types/domain/episode";
import { type NotionPage, queryNotionDatabase } from "./client";
import {
  extractDate,
  extractRelationIds,
  extractSelect,
  extractStatus,
  extractTitle,
  extractUrl,
} from "./helpers";

/**
 * Mappe le Status Notion vers l'enum domain.
 */
function mapEpisodeStatus(raw?: string): EpisodeStatus {
  if (!raw) return "upcoming";
  const normalized = raw.toLowerCase();
  if (normalized.includes("venir")) return "upcoming";
  if (normalized.includes("live")) return "live";
  if (normalized.includes("replay")) return "replay_available";
  if (normalized.includes("archiv")) return "archived";
  if (normalized.includes("termin")) return "archived";
  return "upcoming";
}

/**
 * Mappe le statut éditorial vers l'enum domain.
 */
function mapEditorialStatus(raw?: string): EpisodeEditorialStatus | undefined {
  if (!raw) return undefined;
  const normalized = raw.toLowerCase();
  if (normalized.includes("brouillon") || normalized.includes("draft")) return "draft";
  if (normalized.includes("programm") || normalized.includes("scheduled")) return "scheduled";
  if (normalized.includes("publi")) return "published";
  return undefined;
}

/**
 * Extrait l'ID YouTube depuis une URL.
 * Couvre les formats :
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *
 * @returns ID (11 chars) ou undefined
 */
function extractYouTubeId(url?: string): string | undefined {
  if (!url) return undefined;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1];
}

/**
 * Construit l'URL de miniature YouTube à partir d'une URL de vidéo.
 * Utilise `hqdefault` (480×360) — toujours disponible, qualité suffisante pour cards.
 */
function buildThumbnailUrl(youtubeUrl?: string): string | undefined {
  const id = extractYouTubeId(youtubeUrl);
  if (!id) return undefined;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/**
 * Données partielles d'une émission Notion (sans les guests résolus).
 * Utilisé en interne avant la jointure avec fetchArtists().
 */
type EpisodeWithGuestIds = Omit<Episode, "guests"> & {
  guestIds: string[];
};

/**
 * Mappe une page Notion brute vers Episode (sans guests résolus).
 */
function mapNotionEpisode(page: NotionPage): EpisodeWithGuestIds {
  const props = page.properties;

  const format = extractSelect(props.Format);
  // Colonne titre Notion : "Nom de l'émission"
  const number = extractTitle(props["Nom de l'émission"]) ?? "Émission";
  const date = extractDate(props["Date émission"]) ?? "";

  const youtubeInterviewUrl = extractUrl(props["Youtube Interview URL"]);
  const youtubeDjSetUrl = extractUrl(props["Youtube DJ Set URL"]);

  // Miniature : interview en priorité, fallback DJ set
  const thumbnailUrl = buildThumbnailUrl(youtubeInterviewUrl) ?? buildThumbnailUrl(youtubeDjSetUrl);

  const isPast = date ? new Date(date).getTime() < Date.now() : false;

  // displayTitle sera complété après la résolution des guests.
  // En attendant, on met le format (ou le numéro brut en fallback).
  const displayTitle = format ? `${format}` : number;

  return {
    id: page.id,
    number,
    format,
    date,
    status: mapEpisodeStatus(extractStatus(props.Statut)),
    editorialStatus: mapEditorialStatus(extractSelect(props["Statut éditorial"])),
    twitchUrl: extractUrl(props["Twitch URL"]),
    youtubeInterviewUrl,
    youtubeDjSetUrl,
    thumbnailUrl,
    displayTitle,
    isPast,
    // Colonne relation Notion : "Invités"
    guestIds: extractRelationIds(props.Invités),
  };
}

/**
 * Récupère toutes les émissions depuis Notion (sans guests résolus).
 * Pour les guests résolus, utiliser `fetchEpisodesWithGuests()`.
 */
export async function fetchEpisodes(): Promise<EpisodeWithGuestIds[]> {
  const pages = await queryNotionDatabase(env.notion.dbEmissions, "notion-emissions");
  return pages.map(mapNotionEpisode);
}

/**
 * Récupère les émissions à venir (status "upcoming" et date future).
 */
export async function fetchUpcomingEpisodes(): Promise<EpisodeWithGuestIds[]> {
  const all = await fetchEpisodes();
  return all.filter((e) => !e.isPast && e.status === "upcoming");
}
