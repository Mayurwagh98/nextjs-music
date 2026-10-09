"use client";

import Link from "next/link";
import { usePlayer } from "./PlayerProvider";
import { PauseIcon, PlayIcon } from "./icons";

function clock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Fixed mini-player. Rendered once in the root layout. */
export function PlayerBar() {
  const { track, playing, currentTime, duration, toggle, seek, close } = usePlayer();
  if (!track) return null;

  return (
    <>
    {/* Spacer so the fixed bar never covers the end of the page. */}
    <div aria-hidden className="h-20" />
    <div
      role="region"
      aria-label="Audio player"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-black/85 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => toggle(track)}
          aria-label={playing ? "Pause preview" : "Play preview"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-500 text-black transition hover:bg-teal-400"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <Link href={track.href} className="truncate text-sm font-semibold text-white hover:underline">
              {track.title}
            </Link>
            <span className="shrink-0 text-xs tabular-nums text-neutral-400">
              {clock(currentTime)} / {clock(duration)}
            </span>
          </div>
          <p className="truncate text-xs text-neutral-400">{track.subtitle}</p>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
            className="mt-1 h-1 w-full cursor-pointer accent-teal-500"
          />
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close player"
          className="shrink-0 rounded-full p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
    </>
  );
}
