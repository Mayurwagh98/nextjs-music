"use server";

import { updateTag } from "next/cache";
import { tags } from "@/lib/enrollments";
import { getStore } from "@/lib/store";
import { fieldErrors, waitlistSchema, type FormState } from "@/lib/validation";

type Field = "email" | "instrument";

export async function joinWaitlist(_prev: FormState<Field>, formData: FormData): Promise<FormState<Field>> {
  const raw = { email: String(formData.get("email") ?? ""), instrument: String(formData.get("instrument") ?? "") };
  const parsed = waitlistSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors<Field>(parsed.error), values: raw };
  }

  const result = await getStore().addToWaitlist(parsed.data);
  if (result === "exists") {
    return { status: "success", message: "You're already on the list. We'll be in touch soon." };
  }
  updateTag(tags.waitlist);
  return { status: "success", message: "You're on the list! We'll email you when the next cohort opens." };
}
