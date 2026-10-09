"use client";

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface Track {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  href: string;
}

interface PlayerState {
  track: Track | null;
  playing: boolean;
  currentTime: number;
  duration: number;
}

interface PlayerApi extends PlayerState {
  /** Play a track, or toggle play/pause if it's already loaded. */
  toggle: (track: Track) => void;
  pause: () => void;
  seek: (seconds: number) => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerApi | null>(null);

/**
 * Lives in the root layout, which Next.js never remounts on navigation, so the
 * single <audio> element (and whatever it is playing) survives route changes.
 */
export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<PlayerState>({ track: null, playing: false, currentTime: 0, duration: 0 });

  // Mirrors state.track so toggle() can stay stable and side effects stay out
  // of state updaters (which React may call twice).
  const trackRef = useRef<Track | null>(null);

  const toggle = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (trackRef.current?.id === track.id) {
      if (audio.paused) void audio.play();
      else audio.pause();
      return;
    }
    trackRef.current = track;
    audio.src = track.src;
    void audio.play().catch(() => undefined); // autoplay can be refused; the UI just stays paused
    setState({ track, playing: true, currentTime: 0, duration: 0 });
  }, []);

  const pause = useCallback(() => audioRef.current?.pause(), []);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) audioRef.current.currentTime = seconds;
  }, []);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    trackRef.current = null;
    setState({ track: null, playing: false, currentTime: 0, duration: 0 });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const sync = () =>
      setState((prev) => ({
        ...prev,
        playing: !audio.paused && !audio.ended,
        currentTime: audio.currentTime,
        duration: Number.isFinite(audio.duration) ? audio.duration : prev.duration,
      }));
    const events = ["play", "pause", "ended", "timeupdate", "loadedmetadata"] as const;
    events.forEach((e) => audio.addEventListener(e, sync));
    return () => events.forEach((e) => audio.removeEventListener(e, sync));
  }, []);

  const api = useMemo(() => ({ ...state, toggle, pause, seek, close }), [state, toggle, pause, seek, close]);

  return (
    <PlayerContext value={api}>
      {children}
      <audio ref={audioRef} preload="none" />
    </PlayerContext>
  );
}

export function usePlayer() {
  const ctx = use(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
