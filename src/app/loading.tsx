// Shown instantly during navigation while a route's Server Components render.
export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading"
      className="w-full min-h-[40rem] bg-[#1A1A1D] pt-40 px-4"
    >
      <div className="mx-auto h-8 w-64 animate-pulse rounded-md bg-slate-800" />
      <div className="mx-auto mt-4 h-4 w-96 max-w-full animate-pulse rounded-md bg-slate-900" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12 mx-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl border border-slate-800 bg-slate-950" />
        ))}
      </div>
    </main>
  );
}
