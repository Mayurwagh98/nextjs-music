import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getCurrentUser } from "./auth/dal";
import { getCourses } from "./catalog";
import { getStore } from "./store";

export const tags = {
  courseCount: (slug: string) => `enrollments:course:${slug}`,
  user: (userId: string) => `enrollments:user:${userId}`,
  waitlist: "waitlist",
};

/** Public "N students enrolled" counter, shared by every visitor. */
export async function getEnrollmentCount(courseSlug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.courseCount(courseSlug));
  return getStore().countEnrollments(courseSlug);
}

/**
 * The signed-in user's enrollments joined with catalog data. The session is
 * read here, and only the user id is passed into the cached function, so a
 * caller can never ask for someone else's enrollments.
 */
export async function getMyEnrollments() {
  const user = await getCurrentUser();
  if (!user) return [];
  return enrollmentsForUser(user.id);
}

async function enrollmentsForUser(userId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(tags.user(userId));
  const [records, courses] = await Promise.all([getStore().listEnrollments(userId), getCourses()]);
  return records.flatMap((record) => {
    const course = courses.find((c) => c.slug === record.courseSlug);
    return course ? [{ course, enrolledAt: record.enrolledAt }] : [];
  });
}

export async function isEnrolled(courseSlug: string) {
  const mine = await getMyEnrollments();
  return mine.some((e) => e.course.slug === courseSlug);
}

export async function getWaitlistCount() {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.waitlist);
  return getStore().countWaitlist();
}
