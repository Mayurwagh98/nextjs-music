import Link from "next/link";
import { enroll, unenroll } from "@/app/actions/enrollment";
import { getCurrentUser } from "@/lib/auth/dal";
import { isEnrolled } from "@/lib/enrollments";
import { SubmitButton } from "./SubmitButton";

/**
 * Per-user enrollment state. Reads the session cookie, so the course page
 * renders it inside <Suspense>: the rest of the page is static and served
 * instantly, and this panel streams in.
 */
export async function EnrollPanel({ slug }: { slug: string }) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="space-y-2">
        <Link
          href={`/login?next=/courses/${slug}`}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-teal-500 px-5 text-sm font-semibold text-black transition hover:bg-teal-400"
        >
          Log in to enroll
        </Link>
        <p className="text-center text-xs text-neutral-400">
          New here?{" "}
          <Link href={`/signup?next=/courses/${slug}`} className="text-teal-400 hover:underline">
            Create a free account
          </Link>
        </p>
      </div>
    );
  }

  if (await isEnrolled(slug)) {
    return (
      <div className="space-y-3">
        <p className="rounded-lg border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-sm text-teal-200" role="status">
          You&apos;re enrolled in this course.
        </p>
        <div className="flex gap-2">
          <Link
            href="/dashboard"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-black hover:bg-teal-200"
          >
            Go to dashboard
          </Link>
          <form action={unenroll}>
            <input type="hidden" name="slug" value={slug} />
            <SubmitButton variant="ghost" pendingLabel="Leaving…">Leave</SubmitButton>
          </form>
        </div>
      </div>
    );
  }

  return (
    <form action={enroll}>
      <input type="hidden" name="slug" value={slug} />
      <SubmitButton pendingLabel="Enrolling…" className="w-full">
        Enroll now
      </SubmitButton>
    </form>
  );
}

export function EnrollPanelSkeleton() {
  return <div className="h-11 w-full animate-pulse rounded-lg bg-white/10" aria-hidden />;
}
