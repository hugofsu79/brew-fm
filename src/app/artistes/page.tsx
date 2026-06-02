/**
 * Page /artistes — Mur infini d'artistes invités.
 *
 * Server Component : fetch côté serveur (caching Notion 1h),
 * délègue le rendu animé au composant client InfiniteArtistWall.
 *
 * V1 : section "Ont passé chez Brew" (guests uniquement).
 * Les résidents (accordion) viendront dans une 2e itération.
 */

import { InfiniteArtistWall } from "@/components/artists/InfiniteArtistWall";
import { fetchArtists } from "@/lib/notion/artists";

export default async function ArtistesPage() {
  const all = await fetchArtists();
  const guests = all.filter((a) => a.status === "guest" && a.photoUrl);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Ont passé chez Brew</h1>
      <p className="mb-10 text-sm text-foreground/60">
        {guests.length} artistes — survole pour découvrir, clique pour leur passage chez Brew.
      </p>

      <InfiniteArtistWall artists={guests} />
    </main>
  );
}
