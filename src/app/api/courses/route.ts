import type { NextRequest } from "next/server";
import { getInstructors, searchCourses } from "@/lib/catalog";
import { parseFilters } from "@/lib/search";

/**
 * Public read-only JSON API, e.g. GET /api/courses?instrument=Guitar&level=Beginner
 * Uses the same parser and cached search as the /courses page.
 */
export async function GET(request: NextRequest) {
  const filters = parseFilters(Object.fromEntries(request.nextUrl.searchParams));
  const [courses, instructors] = await Promise.all([searchCourses(filters), getInstructors()]);

  const data = courses.map((course) => ({
    slug: course.slug,
    title: course.title,
    description: course.description,
    instrument: course.instrument,
    level: course.level,
    price: course.price,
    durationWeeks: course.durationWeeks,
    instructor: instructors.find((i) => i.slug === course.instructor)?.name ?? null,
    url: new URL(`/courses/${course.slug}`, request.nextUrl.origin).toString(),
  }));

  return Response.json(
    { filters, count: data.length, courses: data },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" } }
  );
}
