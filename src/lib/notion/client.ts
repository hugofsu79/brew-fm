/**
 * Client générique pour l'API Notion.
 *
 * Endpoint : POST https://api.notion.com/v1/databases/{db_id}/query
 * Auth : Bearer token + header Notion-Version
 *
 * Renvoie la réponse brute (objets `NotionPage` non typés métier).
 * Le typage et la conversion vers le domaine se font dans les modules
 * spécifiques (artists.ts, venues.ts, etc.).
 */

import { env } from "@/lib/env";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

/**
 * Une page Notion = une ligne de base de données.
 * `properties` contient les colonnes (typage propre fait dans les helpers).
 */
export type NotionPage = {
  object: "page";
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, NotionProperty>;
  url?: string;
};

/**
 * Une propriété Notion = une cellule de base.
 * Chaque type Notion (title, rich_text, url, select...) a sa structure.
 * On laisse en `unknown` ici car les helpers spécifiques traitent ça.
 */
export type NotionProperty = {
  id: string;
  type: string;
  [key: string]: unknown;
};

type NotionQueryResponse = {
  object: "list";
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
};

type QueryOptions = {
  pageSize?: number;
  startCursor?: string;
  filter?: Record<string, unknown>;
  sorts?: Array<Record<string, unknown>>;
};

/**
 * Query une base Notion.
 *
 * Gère la pagination automatiquement (concatène toutes les pages).
 * Caching : 1 heure (revalidate: 3600) — Notion bouge peu.
 *
 * @param databaseId UUID de la base Notion
 * @param tag Tag de cache Next.js (ex: "notion-artistes")
 */
export async function queryNotionDatabase(
  databaseId: string,
  tag: string,
  options: QueryOptions = {},
): Promise<NotionPage[]> {
  const allResults: NotionPage[] = [];
  let cursor: string | undefined = options.startCursor;

  do {
    const body: Record<string, unknown> = {
      page_size: options.pageSize ?? 100,
    };
    if (cursor) body.start_cursor = cursor;
    if (options.filter) body.filter = options.filter;
    if (options.sorts) body.sorts = options.sorts;

    const res = await fetch(`${NOTION_API_BASE}/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.notion.token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      next: { revalidate: 3600, tags: [tag] },
    });

    if (!res.ok) {
      throw new Error(`Notion query failed (db: ${databaseId}): ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as NotionQueryResponse;
    allResults.push(...json.results);

    cursor = json.next_cursor ?? undefined;
  } while (cursor);

  return allResults;
}
