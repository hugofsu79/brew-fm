/**
 * Fetch & mapping des Event Enrichments depuis Notion.
 *
 * Source : base Notion "Event Enrichments".
 *
 * Cette base ENRICHIT les events Shotgun (elle n'est pas une source autonome).
 * La clé pivot est `Shotgun Event ID`.
 *
 * Mapping des colonnes Notion (FR) → champs partiels Event (EN) :
 *   Nom évènement       → name (sert de fallback si Shotgun KO)
 *   Shotgun Event ID    → id pivot
 *   Date                → date (réplique Shotgun)
 *   Lieux               → brewVenue (relation, résolue ailleurs)
 *   Artistes            → brew artists (relation, résolue ailleurs)
 *   Recap               → recap
 *   Photo               → photoUrls
 *   Statut éditorial    → editorialStatus
 *   Youtube URL         → youtubeUrl (V1.5)
 *
 * Ce mapper retourne un objet PARTIEL (les champs Shotgun sont undefined).
 * La fusion finale Shotgun + Notion se fait dans `lib/cascade` ou similaire.
 */

import { env } from "@/lib/env";
import type { EventEditorialStatus } from "@/types/domain/event";
import { type NotionPage, queryNotionDatabase } from "./client";
import {
  extractDate,
  extractFirstFileUrl,
  extractNumber,
  extractRelationIds,
  extractRichText,
  extractSelect,
  extractTitle,
  extractUrl,
} from "./helpers";

/**
 * Données d'enrichissement Notion pour un event.
 * Indexées par `shotgunEventId` pour fusion avec Shotgun.
 */
export type EventEnrichment = {
  notionId: string; // ID page Notion
  shotgunEventId?: number; // Clé pivot
  name?: string; // Fallback si Shotgun KO
  date?: string; // Réplique Shotgun

  // Relations (IDs, à résoudre vers Venue / Artist)
  venueIds: string[];
  artistIds: string[];

  // Contenu enrichi
  recap?: string;
  photoUrl?: string;
  editorialStatus?: EventEditorialStatus;
  youtubeUrl?: string;
};

/**
 * Mappe le statut éditorial Notion vers l'enum domain.
 */
function mapEditorialStatus(raw?: string): EventEditorialStatus | undefined {
  if (!raw) return undefined;
  const normalized = raw.toLowerCase();
  if (normalized.includes("documenter")) return "to_document";
  if (normalized.includes("cours") || normalized.includes("progress")) return "in_progress";
  if (normalized.includes("publi")) return "published";
  return undefined;
}

/**
 * Mappe une page Notion Event Enrichment brute vers EventEnrichment.
 */
function mapNotionEventEnrichment(page: NotionPage): EventEnrichment {
  const props = page.properties;

  return {
    notionId: page.id,
    shotgunEventId: extractNumber(props["Shotgun Event ID"]),
    name: extractTitle(props["Nom évènement"]),
    date: extractDate(props.Date),

    venueIds: extractRelationIds(props.Lieux),
    artistIds: extractRelationIds(props.Artistes),

    recap: extractRichText(props.Recap),
    photoUrl: extractFirstFileUrl(props.Photo),
    editorialStatus: mapEditorialStatus(extractSelect(props["Statut éditorial"])),
    youtubeUrl: extractUrl(props["Youtube URL"]),
  };
}

/**
 * Récupère tous les enrichissements d'events depuis Notion.
 * Caching : 1h via le tag "notion-event-enrichments".
 */
export async function fetchEventEnrichments(): Promise<EventEnrichment[]> {
  const pages = await queryNotionDatabase(
    env.notion.dbEventEnrichments,
    "notion-event-enrichments",
  );
  return pages.map(mapNotionEventEnrichment);
}

/**
 * Récupère un enrichissement par son Shotgun Event ID.
 * Retourne undefined si l'event n'a pas (encore) d'enrichissement.
 */
export async function findEventEnrichmentByShotgunId(
  shotgunEventId: number,
): Promise<EventEnrichment | undefined> {
  const all = await fetchEventEnrichments();
  return all.find((e) => e.shotgunEventId === shotgunEventId);
}
