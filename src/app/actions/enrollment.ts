"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { getCourse } from "@/lib/catalog";
import { tags } from "@/lib/enrollments";
import { getStore } from "@/lib/store";
import { courseSlugSchema } from "@/lib/validation";

/*
 * Server Actions are public HTTP endpoints, so each one re-checks the session
 * and validates its input instead of trusting the button that called it.
 */

async function authorise(slugInput: unknown, returnTo: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  const slug = courseSlugSchema.safeParse(slugInput);
  if (!slug.success || !(await getCourse(slug.data))) throw new Error("Unknown course");
  return { user, slug: slug.data };
}

export async function enroll(formData: FormData) {
  const slugInput = formData.get("slug");
  const { user, slug } = await authorise(slugInput, `/courses/${slugInput}`);
  await getStore().enroll(user.id, slug);
  // updateTag expires the entries immediately, so the next render
  // (triggered by this action) shows the new state: read-your-own-writes.
  updateTag(tags.user(user.id));
  updateTag(tags.courseCount(slug));
}

export async function unenroll(formData: FormData) {
  const { user, slug } = await authorise(formData.get("slug"), "/dashboard");
  await getStore().unenroll(user.id, slug);
  updateTag(tags.user(user.id));
  updateTag(tags.courseCount(slug));
}
