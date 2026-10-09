"use client";

// Error boundaries must be Client Components: they receive the error and a
// `reset` callback that re-renders the segment without a full page reload, so
// the audio player in the root layout keeps playing.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[40rem] w-full flex-col items-center justify-center bg-black px-4 text-center">
      <h2 className="text-base text-teal-600 font-semibold tracking-wide uppercase">
        Something went wrong
      </h2>
      <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
        We couldn&apos;t load this page
      </p>
      {error.digest && (
        <p className="mt-4 text-sm text-neutral-400">Error ID: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-8 text-white inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-7 font-medium transition-colors focus:outline-none"
      >
        Try again
      </button>
    </main>
  );
}
