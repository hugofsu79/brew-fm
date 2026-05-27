/**
 * Mapper Shotgun raw → type Event du domaine.
 *
 * Transforme la réponse brute de l'API Shotgun en objet `Event`
 * exploitable par les composants UI.
 *
 * Notes :
 * - Le `typeOfPlace` null de Shotgun = "coffee_shop" par convention équipe
 *   (Shotgun ne propose pas Coffee shop dans son menu).
 * - `isPast` est calculé dynamiquement (pas stocké).
 * - L'enrichissement via Notion Event Enrichments se fait dans
 *   un mapper de niveau supérieur (cf. lib/cascade ou lib/notion/events).
 */

import type { Event, EventArtist, EventTypeOfPlace } from "@/types/domain/event";
import type { ShotgunRawEvent } from "./client";

/**
 * Convertit le champ Shotgun `typeOfPlace` (string | null) en enum domain.
 * Convention équipe : null = coffee shop (Shotgun n'a pas cette option).
 */
function mapTypeOfPlace(raw: string | null): EventTypeOfPlace {
  if (raw === null) return "coffee_shop";

  switch (raw.toLowerCase()) {
    case "club":
      return "club";
    case "concert":
      return "concert";
    case "festival":
      return "festival";
    case "warehouse":
      return "warehouse";
    case "open_air":
    case "open air":
      return "open_air";
    default:
      return "other";
  }
}

/**
 * Convertit un artiste Shotgun en EventArtist (sans enrichissement Notion).
 * L'enrichissement (isBrewArtist, brewArtist) est fait par le caller
 * qui croise avec la base Notion Artistes.
 */
function mapArtist(raw: ShotgunRawEvent["artists"][number]): EventArtist {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    avatarUrl: raw.avatar,
    shotgunUrl: raw.url,
  };
}

/**
 * Transforme un event Shotgun brut en Event du domaine.
 * Sans enrichissement Notion (à fusionner ensuite si besoin).
 */
export function mapShotgunEvent(raw: ShotgunRawEvent): Event {
  const startTime = raw.startTime;
  const isPast = new Date(startTime).getTime() < Date.now();

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    startTime,
    endTime: raw.endTime,
    url: raw.url,
    coverUrl: raw.coverUrl,

    shotgunVenueName: raw.geolocation?.venue,
    shotgunVenueAddress: raw.geolocation?.street,
    shotgunVenueCity: raw.geolocation?.city,

    typeOfPlace: mapTypeOfPlace(raw.typeOfPlace),

    artists: raw.artists.map(mapArtist),

    isCancelled: raw.cancelledAt !== null,
    isPast,
  };
}

/**
 * Mappe un tableau d'events Shotgun bruts en tableau d'Event domain.
 */
export function mapShotgunEvents(raws: ShotgunRawEvent[]): Event[] {
  return raws.map(mapShotgunEvent);
}
