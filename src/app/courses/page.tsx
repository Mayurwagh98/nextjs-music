import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { getInstructors, searchCourses } from "@/lib/catalog";
import { hasActiveFilters, parseFilters } from "@/lib/search";

export const metadata: Metadata = {
  title: "All courses",
  description: "Browse guitar, piano, voice, drums, production and theory courses. Filter by instrument, level and instructor.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/*
 * The heading and filter shell are prerendered. Results depend on
 * searchParams (request data), so they stream in behind <Suspense>; the
 * search itself is cached per distinct filter set in searchCourses().
 */
export default async function CoursesPage({ searchParams }: { searchParams: SearchParams }) {
  const instructors = await getInstructors();
  return (
    <main className="min-h-screen w-full pb-24 pt-36">
      <div className="mb-8 px-4 text-center">
        <h1 className="text-3xl font-bold text-white md:text-5xl">Find your next course</h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-400">
          Every course includes video lessons, practice plans and weekly live sessions.
        </p>
      </div>
      <Suspense fallback={<div className="mx-auto h-11 max-w-5xl animate-pulse rounded-lg bg-neutral-900" />}>
        <CourseFilters instructors={instructors.map(({ slug, name }) => ({ slug, name }))} />
      </Suspense>
      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseFilters(await searchParams);
  const [courses, instructors] = await Promise.all([searchCourses(filters), getInstructors()]);

  return (
    <section aria-live="polite" className="mx-auto mt-10 max-w-6xl px-4">
      <p className="mb-6 text-sm text-neutral-400">
        {courses.length} {courses.length === 1 ? "course" : "courses"}
        {hasActiveFilters(filters) && (
          <>
            {" "}match your filters ·{" "}
            <Link href="/courses" className="text-teal-400 hover:underline">
              Clear filters
            </Link>
          </>
        )}
      </p>
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
          <p className="text-lg text-white">No courses match those filters.</p>
          <p className="mt-2 text-sm text-neutral-400">Try a different instrument or level, or clear the search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <CourseCard
              key={course.slug}
              course={course}
              instructor={instructors.find((i) => i.slug === course.instructor)}
              priority={index < 3}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-96 animate-pulse rounded-2xl border border-white/10 bg-neutral-950" />
      ))}
    </div>
  );
}
