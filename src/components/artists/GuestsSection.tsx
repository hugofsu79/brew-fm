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
          className="hidden rounded-full p-1 sm:flex"
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
            <svg width="24" viewBox="0 0 171 208" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M70.7737 7.84673L7.08603 0.0302866C4.78374 -0.252275 2.72461 1.47635 2.60416 3.79279L0.00539664 53.7708C-0.0128242 54.1212 0.0151422 54.4725 0.0885751 54.8156L8.6911 95.0112C9.132 97.0714 11.0952 98.4363 13.1799 98.1322L74.0655 89.2502C75.8898 88.984 77.2958 87.5056 77.4702 85.6704L81.9838 38.161C82.0323 37.6503 81.9821 37.1351 81.836 36.6434L74.1208 10.6776C73.6675 9.15224 72.3532 8.04058 70.7737 7.84673Z"
                fill="currentcolor"
              />
              <path
                d="M158.853 7.84673L95.1653 0.0302866C92.863 -0.252275 90.8039 1.47635 90.6834 3.79279L88.0847 53.7708C88.0665 54.1212 88.0944 54.4725 88.1679 54.8156L96.7704 95.0112C97.2113 97.0714 99.1745 98.4363 101.259 98.1322L162.145 89.2502C163.969 88.984 165.375 87.5056 165.549 85.6704L170.063 38.161C170.112 37.6503 170.061 37.1351 169.915 36.6434L162.2 10.6776C161.747 9.15224 160.432 8.04058 158.853 7.84673Z"
                fill="currentcolor"
              />
              <path
                d="M11.2614 116.887L74.9492 109.07C77.2514 108.788 79.3106 110.516 79.431 112.833L82.0298 162.811C82.048 163.161 82.02 163.512 81.9466 163.856L73.3441 204.051C72.9032 206.111 70.9399 207.476 68.8552 207.172L7.96964 198.29C6.14542 198.024 4.73934 196.546 4.56497 194.71L0.0513947 147.201C0.00287937 146.69 0.0530426 146.175 0.199146 145.683L7.9144 119.718C8.36765 118.192 9.68198 117.081 11.2614 116.887Z"
                fill="currentcolor"
              />
              <path
                d="M99.3407 116.887L163.028 109.07C165.331 108.788 167.39 110.516 167.51 112.833L170.109 162.811C170.127 163.161 170.099 163.512 170.026 163.856L161.423 204.051C160.982 206.111 159.019 207.476 156.935 207.172L96.0489 198.29C94.2247 198.024 92.8186 196.546 92.6443 194.71L88.1307 147.201C88.0822 146.69 88.1323 146.175 88.2784 145.683L95.9937 119.718C96.4469 118.192 97.7613 117.081 99.3407 116.887Z"
                fill="currentcolor"
              />
            </svg>
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
