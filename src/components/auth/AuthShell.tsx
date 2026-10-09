import { BackgroundBeams } from "@/components/ui/background-beams";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-neutral-950 px-4 pb-16 pt-36">
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-black/70 p-8 shadow-2xl backdrop-blur">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-neutral-400">{subtitle}</p>
        {children}
      </div>
      <BackgroundBeams />
    </main>
  );
}

export function FormSkeleton({ fields }: { fields: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: fields + 1 }).map((_, i) => (
        <div key={i} className="h-11 animate-pulse rounded-lg bg-neutral-900" />
      ))}
    </div>
  );
}
