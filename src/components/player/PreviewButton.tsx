"use client";

import { cn } from "@/lib/utils";
import { usePlayer, type Track } from "./PlayerProvider";
import { PauseIcon, PlayIcon } from "./icons";

/**
 * Small client island: everything around it stays a Server Component and
 * passes plain track data in as props.
 */
export function PreviewButton({ track, className, label = true }: { track: Track; className?: string; label?: boolean }) {
  const { track: current, playing, toggle } = usePlayer();
  const active = current?.id === track.id && playing;

  return (
    <button
      type="button"
      onClick={(e) => {
        // Cards wrap this button in a link; don't navigate when it's clicked.
        e.preventDefault();
        e.stopPropagation();
        toggle(track);
      }}
      aria-pressed={active}
      aria-label={`${active ? "Pause" : "Play"} preview of ${track.title}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:border-teal-400 hover:text-teal-300",
        active && "border-teal-400 text-teal-300",
        className
      )}
    >
      {active ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
      {label && <span>{active ? "Pause" : "Preview"}</span>}
    </button>
  );
}
