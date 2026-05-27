/**
 * Wrapper fetch authentifié pour l'API Twitch Helix.
 *
 * Gère automatiquement :
 *   - L'ajout du Bearer token et du Client-Id sur chaque requête
 *   - Le retry sur 401 (refresh du token + retry une fois)
 *
 * Usage :
 *   const res = await twitchFetch("https://api.twitch.tv/helix/streams?user_id=...");
 */

import { env } from "@/lib/env";
import { getTwitchToken } from "./auth";

type FetchOptions = RequestInit & {
  next?: { revalidate?: number; tags?: string[] };
};

/**
 * Fetch authentifié vers l'API Twitch.
 *
 * En cas de 401 (token expiré ou révoqué), refresh le token et retry une fois.
 * Si le 2e essai échoue, on remonte la réponse 401 au caller.
 */
export async function twitchFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  if (!env.twitch.clientId) {
    throw new Error("TWITCH_CLIENT_ID missing");
  }

  const doFetch = async (token: string): Promise<Response> => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Client-Id": env.twitch.clientId as string,
      },
    });
  };

  let token = await getTwitchToken();
  let res = await doFetch(token);

  // Token expiré/révoqué → refresh + retry une fois
  if (res.status === 401) {
    token = await getTwitchToken(true);
    res = await doFetch(token);
  }

  return res;
}
