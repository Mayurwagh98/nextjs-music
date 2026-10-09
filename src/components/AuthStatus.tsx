import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { initials } from "@/lib/format";

/** Reads the session, so it's rendered inside <Suspense> and streams in. */
export async function AuthStatus() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link href="/login" className="text-sm sm:text-base text-white hover:text-teal-300">
        Log in
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 text-sm sm:text-base text-white hover:text-teal-300"
      title={`Signed in as ${user.name}`}
    >
      <span
        aria-hidden
        className="grid h-7 w-7 place-items-center rounded-full bg-teal-600 text-xs font-bold text-black"
      >
        {initials(user.name)}
      </span>
      <span className="hidden sm:inline">Dashboard</span>
      <span className="sr-only sm:hidden">Dashboard</span>
    </Link>
  );
}

export function AuthStatusFallback() {
  return <span className="block h-7 w-14 animate-pulse rounded-full bg-white/10" aria-hidden />;
}
