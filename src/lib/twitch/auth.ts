/**
 * Authentification Twitch via OAuth Client Credentials.
 *
 * Twitch émet un token applicatif (~60 jours de validité) à partir
 * du Client ID + Secret. On le cache en mémoire pour éviter de
 * regénérer un token à chaque requête.
 *
 * Le cache est partagé entre les requêtes du même process Node
 * (Server Components, route handlers). Il se reset à chaque cold start
 * serverless, mais ce n'est pas grave — un appel auth coûte 1 requête
 * et le quota Twitch est très large.
 *
 * Stratégie :
 *   1. On garde le token en mémoire avec sa date d'expiration
 *   2. On en demande un nouveau si le token expire dans < 60s
 *   3. Le wrapper fetch (client.ts) force un refresh si une requête 401
 */

import { env } from "@/lib/env";

const TWITCH_OAUTH_URL = "https://id.twitch.tv/oauth2/token";

type CachedToken = {
  value: string;
  expiresAt: number; // timestamp ms
};

let cachedToken: CachedToken | null = null;

/**
 * Retourne un token Twitch valide, en générant un nouveau si nécessaire.
 *
 * @param forceRefresh true pour ignorer le cache et forcer un nouveau token
 *                     (utilisé après un 401 par le client)
 * @throws si TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET manquent dans l'env
 */
export async function getTwitchToken(forceRefresh = false): Promise<string> {
  if (!env.twitch.clientId || !env.twitch.clientSecret) {
    throw new Error("Twitch credentials missing — set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET");
  }

  const now = Date.now();

  // Cache hit : token encore valide pour au moins 60s
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.value;
  }

  // Cache miss ou forceRefresh : on regénère
  const body = new URLSearchParams({
    client_id: env.twitch.clientId,
    client_secret: env.twitch.clientSecret,
    grant_type: "client_credentials",
  });

  const res = await fetch(TWITCH_OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store", // On ne cache jamais l'appel d'auth
  });

  if (!res.ok) {
    throw new Error(`Twitch auth failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    value: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return cachedToken.value;
}
