/**
 * Client de fetch pour l'API Shotgun.
 *
 * Endpoint : https://smartboard-api.shotgun.live/api/shotgun/organizers/{id}/events
 * Auth : query param `key`
 *
 * Retourne les events bruts (format Shotgun raw).
 * La conversion en type `Event` du domaine se fait dans `mapper.ts`.
 */

import { env } from "@/lib/env";

const SHOTGUN_BASE_URL = "https://smartboard-api.shotgun.live/api/shotgun";

/**
 * Type brut tel que renvoyé par l'API Shotgun.
 * Ne pas utiliser hors du module shotgun — utilise le type `Event` du domaine.
 */
export type ShotgunRawEvent = {
  id: number;
  name: string;
  slug: string;
  visibility: string;
  updatedAt: string;
  startTime: string;
  endTime: string;
  timezone: string;
  description?: string;
  coverUrl?: string;
  coverThumbnailUrl?: string;
  url: string;
  addressVisibility: string;
  publishedAt: string;
  launchedAt: string;
  cancelledAt: string | null;
  isFestival: boolean;
  typeOfPlace: string | null;
  artists: Array<{
    id: number;
    name: string;
    slug: string;
    avatar?: string;
    url?: string;
  }>;
  genres: string[];
  leftTicketsCount?: number;
  geolocation?: {
    street?: string;
    venue?: string;
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
    countryIsoCode?: string;
    zipCode?: string;
  };
  organizer?: {
    name: string;
    slug: string;
  };
};

type ShotgunResponse = {
  data: ShotgunRawEvent[];
};

type FetchOptions = {
  pastEvents?: boolean; // true = events passés, false/undefined = futurs
  limit?: number;
};

/**
 * Fetch les events bruts depuis l'API Shotgun.
 *
 * Caching : 5 minutes (revalidate: 300).
 * Côté serveur uniquement (Server Components, API routes).
 */
export async function fetchShotgunEvents(options: FetchOptions = {}): Promise<ShotgunRawEvent[]> {
  const params = new URLSearchParams({
    key: env.shotgun.key,
  });

  if (options.pastEvents) params.set("past_events", "true");
  if (options.limit) params.set("limit", String(options.limit));

  const url = `${SHOTGUN_BASE_URL}/organizers/${env.shotgun.orgId}/events?${params.toString()}`;

  const res = await fetch(url, {
    next: { revalidate: 300, tags: ["shotgun-events"] },
  });

  if (!res.ok) {
    throw new Error(`Shotgun fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as ShotgunResponse;
  return json.data ?? [];
}
