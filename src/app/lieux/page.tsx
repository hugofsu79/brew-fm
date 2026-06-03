/**
 * Page Lieux — /lieux
 *
 * Server Component : fetch tous les lieux Notion côté serveur (caching natif),
 * puis délègue l'interactivité (toggle + galerie) à LieuxPageClient.
 *
 * Le filtrage par format se fait côté client pour une bascule instantanée.
 */

import { LieuxPageClient } from "@/components/venues/LieuxPageClient";
import { fetchVenues } from "@/lib/notion/venues";

export default async function LieuxPage() {
  const venues = await fetchVenues();

  return <LieuxPageClient venues={venues} />;
}
