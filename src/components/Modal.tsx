"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Native <dialog> for the intercepted course route. showModal() gives focus
 * trapping, Escape-to-close and an inert background for free; closing goes
 * back in history, so the URL returns to the page underneath.
 */
export function Modal({ children, label }: { children: React.ReactNode; label: string }) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault();
        router.back();
      }}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (e.target === e.currentTarget) router.back();
      }}
      className="m-auto w-[min(42rem,calc(100vw-2rem))] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950 p-0 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Close"
        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-neutral-200 hover:bg-black"
      >
        ✕
      </button>
      {children}
    </dialog>
  );
}
