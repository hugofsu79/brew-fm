/**
 * Récupération du live Twitch en cours.
 *
 * Endpoint : GET https://api.twitch.tv/helix/streams?user_id={broadcasterId}
 *
 * Comportement :
 *   - Si data[0] existe → stream en cours, on renvoie ses infos
 *   - Si data est vide → pas de live, on renvoie null
 *   - Si Twitch n'est pas configuré (credentials absents) → null
 *
 * Caching : 30s — compromis entre fraîcheur et quota.
 * Pour passer en quasi-temps réel : remplacer revalidate par un webhook
 * EventSub Twitch (V2+, hors scope V1).
 */

import { env, isTwitchConfigured } from "@/lib/env";
import { twitchFetch } from "./client";

/**
 * Données minimales d'un stream live exposées par notre API.
 * Le mapping vers NavbarItem se fait dans le module cascade.
 */
export type TwitchStream = {
  id: string;
  userId: string;
  userLogin: string;
  userName: string;
  title: string;
  gameName?: string;
  startedAt: string; // ISO 8601
  viewerCount: number;
  thumbnailUrl?: string;
  channelUrl: string;
};

type TwitchStreamsResponse = {
  data: Array<{
    id: string;
    user_id: string;
    user_login: string;
    user_name: string;
    game_name?: string;
    type?: string;
    title: string;
    viewer_count: number;
    started_at: string;
    thumbnail_url?: string;
  }>;
};

/**
 * Récupère le live Twitch en cours pour le broadcaster Brew FM.
 * Retourne null si pas de live, ou si Twitch n'est pas configuré.
 */
export async function getCurrentStream(): Promise<TwitchStream | null> {
  if (!isTwitchConfigured()) return null;

  const broadcasterId = env.twitch.broadcasterId as string;

  const res = await twitchFetch(`https://api.twitch.tv/helix/streams?user_id=${broadcasterId}`, {
    next: { revalidate: 30, tags: ["twitch-live"] },
  });

  if (!res.ok) return null;

  const json = (await res.json()) as TwitchStreamsResponse;
  const raw = json.data[0];
  if (!raw) return null;

  return {
    id: raw.id,
    userId: raw.user_id,
    userLogin: raw.user_login,
    userName: raw.user_name,
    title: raw.title,
    gameName: raw.game_name,
    startedAt: raw.started_at,
    viewerCount: raw.viewer_count,
    thumbnailUrl: raw.thumbnail_url,
    channelUrl: `https://twitch.tv/${raw.user_login}`,
  };
}
