"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

/** Submit button that disables itself and shows progress while its <form>'s action runs. */
export function SubmitButton({
  children,
  pendingLabel,
  className,
  variant = "primary",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
  variant?: "primary" | "ghost";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60",
        variant === "primary"
          ? "bg-teal-500 text-black hover:bg-teal-400"
          : "border border-white/15 text-neutral-300 hover:border-red-400/60 hover:text-red-300",
        className
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
