/**
 * Fetcher + mapper Notion pour les artistes Brew FM.
 *
 * Orchestration en parallèle :
 *   1. Base Artistes  → fiches brutes (nom, photo, bio, IDs, etc.)
 *   2. Base Émissions → pour agréger les vidéos YouTube (interview + DJ set)
 *   3. Base Event Enrichments → pour agréger les vidéos YouTube des events
 *   4. Shotgun events  → pour récupérer les avatars Cloudinary des artistes
 *
 * Fusion photo (cf. décision Hugo) :
 *   - PRIORITÉ : avatar Shotgun (homogène, Cloudinary, stable)
 *   - FALLBACK : photoUrl Notion (pour artistes sans ID Shotgun)
 *
 * Pour chaque artiste, `passageVideos` est CONSTRUIT en parcourant les
 * émissions et events où l'artiste apparaît. Trié par date décroissante.
 *
 * Caching Next.js : revalidate 1h (la donnée change peu).
 */

import { fetchShotgunEvents } from "@/lib/shotgun/client";
import type { Artist, ArtistPassageVideo, ArtistStatus } from "@/types/domain/artist";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const REVALIDATE_SECONDS = 3600; // 1h

// ---------------------------------------------------------------------------
// Helpers de parsing Notion
// ---------------------------------------------------------------------------

type NotionPage = {
  id: string;
  properties: Record<string, NotionProp>;
};

type NotionProp =
  | { type: "title"; title: Array<{ plain_text: string }> }
  | { type: "rich_text"; rich_text: Array<{ plain_text: string }> }
  | { type: "url"; url: string | null }
  | { type: "number"; number: number | null }
  | { type: "select"; select: { name: string } | null }
  | { type: "multi_select"; multi_select: Array<{ name: string }> }
  | { type: "date"; date: { start: string } | null }
  | { type: "files"; files: unknown[] }
  | { type: "relation"; relation: Array<{ id: string }> }
  | { type: string; [key: string]: unknown };

function readTitle(prop: NotionProp | undefined): string | null {
  if (prop?.type !== "title") return null;
  const items = (prop as { title: Array<{ plain_text: string }> }).title;
  return items.length ? items.map((t) => t.plain_text).join("") : null;
}

function readRichText(prop: NotionProp | undefined): string | null {
  if (prop?.type !== "rich_text") return null;
  const items = (prop as { rich_text: Array<{ plain_text: string }> }).rich_text;
  return items.length ? items.map((t) => t.plain_text).join("") : null;
}

function readUrl(prop: NotionProp | undefined): string | null {
  if (!prop) return null;
  if (prop.type === "url") return (prop as { url: string | null }).url;
  if (prop.type === "rich_text") {
    const text = readRichText(prop);
    return text?.startsWith("http") ? text : null;
  }
  return null;
}

function readNumber(prop: NotionProp | undefined): number | null {
  if (prop?.type !== "number") return null;
  return (prop as { number: number | null }).number;
}

function readSelect(prop: NotionProp | undefined): string | null {
  if (prop?.type !== "select") return null;
  const select = (prop as { select: { name: string } | null }).select;
  return select?.name ?? null;
}

function readMultiSelect(prop: NotionProp | undefined): string[] {
  if (prop?.type !== "multi_select") return [];
  return (prop as { multi_select: Array<{ name: string }> }).multi_select.map((s) => s.name);
}

function readDate(prop: NotionProp | undefined): string | null {
  if (prop?.type !== "date") return null;
  return (prop as { date: { start: string } | null }).date?.start ?? null;
}

function readRelationIds(prop: NotionProp | undefined): string[] {
  if (prop?.type !== "relation") return [];
  return (prop as { relation: Array<{ id: string }> }).relation.map((r) => r.id);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapStatus(notionStatus: string | null): ArtistStatus {
  if (notionStatus?.toLowerCase().includes("résident")) {
    return "resident";
  }
  return "guest";
}

// ---------------------------------------------------------------------------
// Fetch Notion (avec pagination & caching Next.js)
// ---------------------------------------------------------------------------

async function queryNotionDatabase(databaseId: string): Promise<NotionPage[]> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN manquant dans .env.local");

  const all: NotionPage[] = [];
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(`${NOTION_API}/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Notion query failed (${res.status}) for db ${databaseId}: ${text}`);
    }

    const json = (await res.json()) as {
      results: NotionPage[];
      next_cursor: string | null;
      has_more: boolean;
    };

    all.push(...json.results);
    cursor = json.has_more ? (json.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return all;
}

// ---------------------------------------------------------------------------
// Index avatars Shotgun
// ---------------------------------------------------------------------------

/**
 * Construit un index Map<shotgunArtistId, avatarUrl> en agrégeant TOUS les
 * line-ups des events Shotgun (passés ET futurs). Dédoublonné par ID.
 *
 * Tolérant aux erreurs : si Shotgun plante, on retourne une Map vide et
 * la fusion ne fait rien (Notion gardé en fallback). Pas de crash global.
 */
async function buildShotgunAvatarIndex(): Promise<Map<number, string>> {
  const index = new Map<number, string>();
  try {
    const [past, upcoming] = await Promise.all([
      fetchShotgunEvents({ pastEvents: true, limit: 100 }),
      fetchShotgunEvents({ pastEvents: false, limit: 100 }),
    ]);

    for (const ev of [...past, ...upcoming]) {
      const artists = (ev as { artists?: Array<{ id: number; avatar?: string }> }).artists ?? [];
      for (const a of artists) {
        if (a.id && a.avatar && !index.has(a.id)) {
          index.set(a.id, a.avatar);
        }
      }
    }
  } catch (err) {
    console.warn(
      "[fetchArtists] Shotgun avatar index failed, falling back to Notion-only photos:",
      err,
    );
  }
  return index;
}

// ---------------------------------------------------------------------------
// Construction des passageVideos
// ---------------------------------------------------------------------------

function buildPassageIndex(
  episodes: NotionPage[],
  eventEnrichments: NotionPage[],
): Map<string, ArtistPassageVideo[]> {
  const index = new Map<string, ArtistPassageVideo[]>();

  function pushFor(artistId: string, video: ArtistPassageVideo) {
    const list = index.get(artistId) ?? [];
    list.push(video);
    index.set(artistId, list);
  }

  // Émissions
  for (const ep of episodes) {
    const props = ep.properties;
    const name = readTitle(props["Nom de l'émission"]);
    const date = readDate(props["Date émission"]);
    const interview = readUrl(props["Youtube Interview URL"]);
    const djSet = readUrl(props["Youtube DJ Set URL"]);
    const invitéIds = readRelationIds(props.Invités);

    if (!name || !date) continue;
    const urls = [interview, djSet].filter((u): u is string => Boolean(u));
    if (urls.length === 0) continue;

    const video: ArtistPassageVideo = {
      type: "episode",
      sourceName: name,
      date,
      urls,
    };
    for (const id of invitéIds) pushFor(id, video);
  }

  // Event Enrichments
  for (const ee of eventEnrichments) {
    const props = ee.properties;
    const name = readTitle(props["Nom évènement"]);
    const date = readDate(props.Date);
    const url = readUrl(props["Youtube URL"]);
    const artistIds = readRelationIds(props.Artistes);

    if (!name || !date || !url) continue;

    const video: ArtistPassageVideo = {
      type: "event",
      sourceName: name,
      date,
      urls: [url],
    };
    for (const id of artistIds) pushFor(id, video);
  }

  // Tri par date décroissante
  for (const list of index.values()) {
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return index;
}

// ---------------------------------------------------------------------------
// Mapper Notion page → Artist (avec fusion photo Shotgun)
// ---------------------------------------------------------------------------

function mapNotionPageToArtist(
  page: NotionPage,
  passages: ArtistPassageVideo[],
  shotgunAvatars: Map<number, string>,
): Artist | null {
  const p = page.properties;

  const name = readTitle(p.Nom);
  if (!name) return null;

  const shotgunArtistId = readNumber(p["ID Shotgun"]) ?? undefined;
  const notionPhotoUrl = readUrl(p["Photo Artiste"]) ?? undefined;

  // ★ Fusion photo : Shotgun PRIORITAIRE, Notion en fallback ★
  // Décision actée Hugo : homogénéité Cloudinary > photo Notion personnalisée.
  const shotgunAvatar =
    shotgunArtistId !== undefined ? shotgunAvatars.get(shotgunArtistId) : undefined;
  const photoUrl = shotgunAvatar ?? notionPhotoUrl;

  return {
    id: page.id,
    slug: slugify(name),
    name,
    status: mapStatus(readSelect(p.Statut)),

    photoUrl,
    coverUrl: undefined, // V1 : Photo cover Notion ignorée (URLs Files expirent)

    bioShort: readRichText(p.Bio) ?? undefined,
    bioLong: undefined,

    genres: readMultiSelect(p.Genre).length ? readMultiSelect(p.Genre) : undefined,
    arrivedAt: readDate(p["Date d'arrivée"]) ?? undefined,

    instagram: readUrl(p.Instagram) ?? undefined,
    soundcloud: readUrl(p.Soundcloud) ?? undefined,
    spotify: readUrl(p.Spotify) ?? undefined,
    linktree: readUrl(p.linktree) ?? undefined,
    tiktok: undefined,
    youtube: undefined,
    shotgunUrl: readUrl(p["Shotgun URL"]) ?? undefined,

    passageVideos: passages,

    shotgunArtistId,

    eventIds: readRelationIds(p.Évènements),
    episodeIds: readRelationIds(p.Émissions),
  };
}

// ---------------------------------------------------------------------------
// Point d'entrée public
// ---------------------------------------------------------------------------

export async function fetchArtists(): Promise<Artist[]> {
  const artistesId = process.env.NOTION_DB_ARTISTES_ID;
  const emissionsId = process.env.NOTION_DB_EMISSIONS_ID;
  const eeId = process.env.NOTION_DB_EVENT_ENRICHMENTS_ID;

  if (!artistesId || !emissionsId || !eeId) {
    throw new Error(
      "Variables Notion manquantes (.env.local): NOTION_DB_ARTISTES_ID, NOTION_DB_EMISSIONS_ID, NOTION_DB_EVENT_ENRICHMENTS_ID",
    );
  }

  // 1. Fetch en parallèle : 3 bases Notion + index avatars Shotgun
  const [artistPages, episodePages, eePages, shotgunAvatars] = await Promise.all([
    queryNotionDatabase(artistesId),
    queryNotionDatabase(emissionsId),
    queryNotionDatabase(eeId),
    buildShotgunAvatarIndex(),
  ]);

  // 2. Construit l'index passages YouTube
  const passageIndex = buildPassageIndex(episodePages, eePages);

  // 3. Mappe chaque artiste avec ses passages + photo fusionnée
  const artists: Artist[] = [];
  for (const page of artistPages) {
    const passages = passageIndex.get(page.id) ?? [];
    const artist = mapNotionPageToArtist(page, passages, shotgunAvatars);
    if (artist) artists.push(artist);
  }

  return artists;
}
