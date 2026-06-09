"use client";

/**
 * RadioPlayerProvider — élément <audio> UNIQUE et global de la radio.
 *
 * Monté une seule fois au niveau du layout → ne se démonte JAMAIS entre les
 * pages. La musique continue donc en naviguant, et le mini-player + le grand
 * player partagent le même flux via ce contexte.
 *
 * Expose :
 *   - track       : morceau courant (artiste/titre/pochette)
 *   - isPlaying   : lecture en cours ?
 *   - toggle()    : play/pause
 *   - currentTime / duration : pour la progression (waveform mini)
 *
 * Le morceau courant est fourni par le serveur (now playing) et injecté via
 * setTrack au montage. Avec AzuraCast réel, on rafraîchira track au polling.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type RadioTrackInfo = {
  artist: string;
  title: string;
  artUrl?: string;
};

type RadioPlayerContextValue = {
  track: RadioTrackInfo | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  toggle: () => void;
  setTrack: (t: RadioTrackInfo) => void;
};

const RadioPlayerContext = createContext<RadioPlayerContextValue | null>(null);

export function useRadioPlayer() {
  const ctx = useContext(RadioPlayerContext);
  if (!ctx) throw new Error("useRadioPlayer doit être utilisé dans RadioPlayerProvider");
  return ctx;
}

export function RadioPlayerProvider({
  streamUrl,
  children,
}: {
  streamUrl: string;
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<RadioTrackInfo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Synchronise l'état React avec les événements de l'élément audio.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;
    if (audio.paused) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [streamUrl]);

  return (
    <RadioPlayerContext.Provider
      value={{ track, isPlaying, currentTime, duration, toggle, setTrack }}
    >
      {/* L'unique élément audio de toute l'app */}
      {/* biome-ignore lint/a11y/useMediaCaption: flux radio live, pas de sous-titres */}
      <audio ref={audioRef} src={streamUrl || undefined} preload="none" />
      {children}
    </RadioPlayerContext.Provider>
  );
}
