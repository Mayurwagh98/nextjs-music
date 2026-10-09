import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import { unenroll } from "@/app/actions/enrollment";
import { CourseCard } from "@/components/courses/CourseCard";
import { SubmitButton } from "@/components/courses/SubmitButton";
import { requireUser } from "@/lib/auth/dal";
import { getInstructors } from "@/lib/catalog";
import { getMyEnrollments } from "@/lib/enrollments";
import { formatDuration, formatPrice, totalMinutes } from "@/lib/format";

export const metadata: Metadata = { title: "My dashboard", robots: { index: false } };

/*
 * Protected route. proxy.ts redirects signed-out visitors before this renders,
 * but requireUser() re-checks the session here (defence in depth), inside
 * <Suspense> because it reads cookies.
 */
export default function DashboardPage() {
  return (
    <main className="min-h-screen w-full px-4 pb-24 pt-36">
      <div className="mx-auto max-w-6xl">
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard />
        </Suspense>
      </div>
    </main>
  );
}

async function Dashboard() {
  const user = await requireUser("/dashboard");
  const [enrollments, instructors] = await Promise.all([getMyEnrollments(), getInstructors()]);
  const minutes = enrollments.reduce((sum, e) => sum + totalMinutes(e.course.curriculum), 0);
  const value = enrollments.reduce((sum, e) => sum + e.course.price, 0);

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-teal-400">My dashboard</p>
          <h1 className="text-3xl font-bold text-white md:text-4xl">Hi, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-neutral-400">Signed in as {user.email}</p>
        </div>
        <form action={logout}>
          <SubmitButton variant="ghost" pendingLabel="Logging out…">Log out</SubmitButton>
        </form>
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Courses enrolled" value={String(enrollments.length)} />
        <Stat label="Hours of lessons" value={formatDuration(minutes)} />
        <Stat label="Course value" value={formatPrice(value)} />
      </dl>

      <h2 className="mb-6 mt-12 text-2xl font-bold text-white">My courses</h2>
      {enrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
          <p className="text-lg text-white">You haven&apos;t enrolled in a course yet.</p>
          <Link
            href="/courses"
            className="mt-4 inline-flex h-11 items-center rounded-lg bg-teal-500 px-5 text-sm font-semibold text-black hover:bg-teal-400"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map(({ course, enrolledAt }) => (
            <CourseCard
              key={course.slug}
              course={course}
              instructor={instructors.find((i) => i.slug === course.instructor)}
              footer={
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-neutral-400">
                    Enrolled {new Date(enrolledAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </span>
                  <form action={unenroll}>
                    <input type="hidden" name="slug" value={course.slug} />
                    <SubmitButton variant="ghost" pendingLabel="Leaving…" className="h-9 px-3 text-xs">
                      Leave course
                    </SubmitButton>
                  </form>
                </div>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950 p-5">
      <dt className="text-sm text-neutral-400">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-white">{value}</dd>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard" className="space-y-6">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-900" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-900" />)}
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-neutral-900" />
    </div>
  );
}
