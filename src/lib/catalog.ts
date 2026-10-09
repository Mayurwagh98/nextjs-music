import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import courseData from "@/data/courses.json";
import instructorData from "@/data/instructors.json";
import sessionData from "@/data/sessions.json";
import testimonialData from "@/data/testimonials.json";
import { filterCourses } from "./search";
import { upcomingSessions } from "./schedule";
import type { Course, CourseFilters, Instructor, LiveSession } from "./types";

/*
 * Catalog content (courses, instructors, schedule) is versioned with the code,
 * so it is read through `use cache` functions: it is prerendered into the static
 * shell at build time and tagged so it can be refreshed on demand with
 * revalidateTag("catalog") if it ever moves to a CMS or database.
 * User data (accounts, enrollments, waitlist) lives in the store instead.
 */

const courses = courseData.courses as Course[];
const instructors = instructorData.instructors as Instructor[];

export async function getCourses(): Promise<Course[]> {
  "use cache";
  cacheLife("days");
  cacheTag("catalog");
  return courses;
}

export async function getCourse(slug: string): Promise<Course | undefined> {
  "use cache";
  cacheLife("days");
  cacheTag("catalog", `course:${slug}`);
  return courses.find((course) => course.slug === slug);
}

export async function getFeaturedCourses(): Promise<Course[]> {
  "use cache";
  cacheLife("days");
  cacheTag("catalog");
  return courses.filter((course) => course.isFeatured);
}

export async function searchCourses(filters: CourseFilters): Promise<Course[]> {
  "use cache";
  cacheLife("days");
  cacheTag("catalog");
  // `filters` is part of the cache key, so each distinct search is cached once.
  return filterCourses(courses, filters);
}

export async function getInstructors(): Promise<Instructor[]> {
  "use cache";
  cacheLife("days");
  cacheTag("catalog");
  return instructors;
}

export async function getInstructor(slug: string): Promise<Instructor | undefined> {
  "use cache";
  cacheLife("days");
  cacheTag("catalog");
  return instructors.find((instructor) => instructor.slug === slug);
}

export const ACADEMY_TIMEZONE = sessionData.timezone;

/**
 * Next occurrence of each weekly live session. Depends on the current time, so
 * it's cached for an hour: every visitor in that hour shares one computation,
 * and the static shell is regenerated in the background after that.
 */
export async function getUpcomingSessions() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", "sessions");
  const sessions = sessionData.sessions as LiveSession[];
  return upcomingSessions(sessions, ACADEMY_TIMEZONE, new Date()).map((session) => ({
    ...session,
    courseTitle: courses.find((c) => c.slug === session.course)?.title ?? "",
  }));
}

export async function getTestimonials() {
  "use cache";
  cacheLife("days");
  return testimonialData.testimonials;
}
