"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Artist } from "@/types/domain/artist";

const COLS_DESKTOP = 5;
const BASE_PX_PER_SECOND = 30;
const SCROLL_BOOST_FACTOR = 1.5;
const EASE_FACTOR = 0.08;

type Variation = "top" | "bottom";

function getVariation(index: number): Variation {
  return index % 2 === 0 ? "top" : "bottom";
}

function ArtistTile({ artist, variation }: { artist: Artist; variation: Variation }) {
  const clipId = variation === "top" ? "url(#card-clip-top)" : "url(#card-clip-bottom)";
  const href = artist.passageVideos[0]?.urls[0] ?? "#";

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
      <div className="relative aspect-287/346 w-full bg-foreground/5" style={{ clipPath: clipId }}>
        {/* biome-ignore lint/performance/noImgElement: image externe Shotgun */}
        <img
          src={artist.photoUrl}
          alt={artist.name}
          loading="lazy"
          className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
        />
      </div>
      <p className="mt-2 text-center text-xs font-bold uppercase tracking-wide text-foreground/50 transition-colors group-hover:text-foreground">
        {artist.name}
      </p>
    </a>
  );
}

function ClipPathDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <title>Clip-path definitions</title>
      <defs>
        <clipPath id="card-clip-top" clipPathUnits="objectBoundingBox">
          <path d="M 0.8827 0.0852 L 0.0494 0.0001 C 0.0414 -0.0007 0.0342 0.0043 0.0338 0.0110 L 0.0000 0.5512 C 0.0000 0.5522 0.0001 0.5532 0.0003 0.5542 L 0.1126 0.9909 C 0.1141 0.9968 0.1210 1.0008 0.1282 0.9999 L 0.9271 0.9029 C 0.9335 0.9021 0.9384 0.8979 0.9390 0.8925 L 0.9970 0.3839 C 0.9972 0.3824 0.9970 0.3809 0.9965 0.3795 L 0.8944 0.0934 C 0.8928 0.0890 0.8882 0.0858 0.8827 0.0852 Z" />
        </clipPath>
        <clipPath id="card-clip-bottom" clipPathUnits="objectBoundingBox">
          <path d="M 0.1143 0.0852 L 0.9477 0.0001 C 0.9557 -0.0007 0.9628 0.0043 0.9632 0.0110 L 0.9970 0.5512 C 0.9970 0.5522 0.9969 0.5532 0.9967 0.5542 L 0.8844 0.9909 C 0.8829 0.9968 0.8761 1.0008 0.8688 0.9999 L 0.0699 0.9029 C 0.0636 0.9021 0.0587 0.8979 0.0581 0.8926 L 0.0001 0.3839 C 0.0001 0.3824 0.0001 0.3809 0.0006 0.3795 L 0.1027 0.0934 C 0.1043 0.0890 0.1088 0.0858 0.1143 0.0852 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

type ColumnState = {
  positionY: number;
  currentSpeed: number;
  targetSpeed: number;
  contentHeight: number;
  isHovered: boolean;
  baseDirection: 1 | -1;
};

export function InfiniteArtistWall({ artists }: { artists: Artist[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stateRefs = useRef<ColumnState[]>([]);
  const rafIdRef = useRef<number | null>(null);

  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(0);
  const scrollVelocity = useRef(0);

  const [columns] = useState<Artist[][]>(() => {
    const cols: Artist[][] = Array.from({ length: COLS_DESKTOP }, () => []);
    artists.forEach((a, i) => {
      cols[i % COLS_DESKTOP].push(a);
    });
    return cols;
  });

  useEffect(() => {
    stateRefs.current = columns.map((_, colIdx) => ({
      positionY: 0,
      currentSpeed: 0,
      targetSpeed: 0,
      contentHeight: 0,
      isHovered: false,
      baseDirection: colIdx % 2 === 0 ? -1 : 1,
    }));
  }, [columns]);

  useEffect(() => {
    function measure() {
      stateRefs.current.forEach((state, i) => {
        const el = columnRefs.current[i];
        if (el) {
          state.contentHeight = el.scrollHeight / 2;
          state.targetSpeed = BASE_PX_PER_SECOND * state.baseDirection;
        }
      });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    function onScroll() {
      const now = performance.now();
      const dt = (now - lastScrollTime.current) / 1000;
      if (dt > 0) {
        const dy = window.scrollY - lastScrollY.current;
        scrollVelocity.current = dy / dt;
      }
      lastScrollY.current = window.scrollY;
      lastScrollTime.current = now;
    }
    lastScrollY.current = window.scrollY;
    lastScrollTime.current = performance.now();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let lastFrameTime = performance.now();

    function frame(now: number) {
      const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;

      scrollVelocity.current *= 0.9;
      if (Math.abs(scrollVelocity.current) < 1) scrollVelocity.current = 0;

      const scrollBoost = scrollVelocity.current * SCROLL_BOOST_FACTOR;

      stateRefs.current.forEach((state, i) => {
        const targetWithBoost = state.isHovered
          ? 0
          : BASE_PX_PER_SECOND * state.baseDirection + scrollBoost * state.baseDirection;

        state.targetSpeed = targetWithBoost;
        state.currentSpeed += (state.targetSpeed - state.currentSpeed) * EASE_FACTOR;
        state.positionY += state.currentSpeed * dt;

        if (state.contentHeight > 0) {
          while (state.positionY <= -state.contentHeight) {
            state.positionY += state.contentHeight;
          }
          while (state.positionY > 0) {
            state.positionY -= state.contentHeight;
          }
        }

        const el = columnRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(0, ${state.positionY}px, 0)`;
        }
      });

      rafIdRef.current = requestAnimationFrame(frame);
    }

    rafIdRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const handleEnter = useCallback((colIdx: number) => {
    if (stateRefs.current[colIdx]) {
      stateRefs.current[colIdx].isHovered = true;
    }
  }, []);
  const handleLeave = useCallback((colIdx: number) => {
    if (stateRefs.current[colIdx]) {
      stateRefs.current[colIdx].isHovered = false;
    }
  }, []);

  return (
    <>
      <ClipPathDefs />

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        style={{ height: "70vh" }}
      >
        <div className="grid h-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((colArtists, colIdx) => {
            const doubled = [
              ...colArtists.map((a) => ({ artist: a, copy: 0 })),
              ...colArtists.map((a) => ({ artist: a, copy: 1 })),
            ];

            return (
              <div
                key={`col-${colArtists[0]?.id ?? colIdx}`}
                ref={(el) => {
                  columnRefs.current[colIdx] = el;
                }}
                onPointerEnter={() => handleEnter(colIdx)}
                onPointerLeave={() => handleLeave(colIdx)}
                className="flex flex-col gap-6 will-change-transform"
              >
                {doubled.map(({ artist, copy }, i) => (
                  <ArtistTile
                    key={`${artist.id}-c${copy}`}
                    artist={artist}
                    variation={getVariation(i)}
                  />
                ))}
              </div>
            );
          })}
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent"
          aria-hidden="true"
        />
      </div>
    </>
  );
}
