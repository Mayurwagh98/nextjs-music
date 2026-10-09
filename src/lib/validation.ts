import { z } from "zod";
import { INSTRUMENTS } from "./types";

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address."));

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(60, "Name is too long."),
  email,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be at most 72 characters.") // bcrypt only uses the first 72 bytes
    .regex(/[A-Za-z]/, "Password must contain a letter.")
    .regex(/[0-9]/, "Password must contain a number."),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const waitlistSchema = z.object({
  email,
  instrument: z.enum([...INSTRUMENTS, "Not sure yet"], { message: "Pick an instrument." }),
});

export const courseSlugSchema = z.string().regex(/^[a-z0-9-]{1,80}$/);

/** Shape returned by form Server Actions and consumed by useActionState. */
export interface FormState<Field extends string = string> {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<Field, string>>;
  /** Echo submitted values so the form isn't wiped on a validation error. */
  values?: Partial<Record<Field, string>>;
}

export function fieldErrors<Field extends string>(error: z.ZodError): Partial<Record<Field, string>> {
  const out: Partial<Record<Field, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as Field | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
