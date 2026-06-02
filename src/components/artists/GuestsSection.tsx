"use client";

import { useState } from "react";
import { ArtistList } from "@/components/artists/ArtistList";
import { InfiniteArtistWall } from "@/components/artists/InfiniteArtistWall";
import type { Artist } from "@/types/domain/artist";

type ViewMode = "wall" | "list";

export function GuestsSection({ artists }: { artists: Artist[] }) {
  const [view, setView] = useState<ViewMode>("wall");

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ont passé chez Brew</h2>
          <p className="mt-1 text-sm text-foreground/60">{artists.length} artistes</p>
        </div>

        <div
          role="tablist"
          aria-label="Mode d'affichage"
          className="hidden rounded-full border border-foreground/15 p-1 sm:flex"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "wall"}
            onClick={() => setView("wall")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              view === "wall"
                ? "bg-foreground text-background"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Mur
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "list"}
            onClick={() => setView("list")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              view === "list"
                ? "bg-foreground text-background"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Liste
          </button>
        </div>
      </div>

      <div className="hidden sm:block">
        {view === "wall" ? (
          <InfiniteArtistWall artists={artists} />
        ) : (
          <ArtistList artists={artists} />
        )}
      </div>
      <div className="block sm:hidden">
        <ArtistList artists={artists} />
      </div>
    </section>
  );
}
