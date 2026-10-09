import Link from "next/link";
import { Spotlight } from "@/components/ui/SpotLight";

// Rendered for unknown URLs and whenever a page calls notFound()
// (e.g. an album slug that doesn't exist).
export default function NotFound() {
  return (
    <main className="relative flex min-h-[40rem] w-full flex-col items-center justify-center overflow-hidden bg-black px-4 text-center">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      <h1 className="relative z-10 text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
        404
      </h1>
      <p className="relative z-10 mt-4 text-base md:text-lg text-neutral-300 max-w-lg">
        This track skipped. The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="relative z-10 mt-8 text-white inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-7 font-medium transition-colors focus:outline-none"
      >
        Back home
      </Link>
    </main>
  );
}
