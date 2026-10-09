"use server";

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { safeRedirectPath } from "@/lib/auth/dal";
import { createSession, deleteSession } from "@/lib/auth/session";
import { getStore } from "@/lib/store";
import { fieldErrors, loginSchema, signupSchema, type FormState } from "@/lib/validation";

type SignupField = "name" | "email" | "password";
type LoginField = "email" | "password";

// Compared against when the email doesn't exist, so a login attempt takes the
// same time whether or not the account exists (no user enumeration by timing).
const DUMMY_HASH = "$2b$10$AwiQg5GRJlOTJj8UMdim2uWCXOYVd4qqiXc1qA9RI.H7C8.Jmew2G";

export async function signup(_prev: FormState<SignupField>, formData: FormData): Promise<FormState<SignupField>> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const values = { name: raw.name, email: raw.email };
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors<SignupField>(parsed.error), values };
  }

  const { name, email, password } = parsed.data;
  const user = await getStore().createUser({ name, email, passwordHash: await hash(password, 10) });
  if (user === "email-taken") {
    return { status: "error", fieldErrors: { email: "An account with this email already exists." }, values };
  }

  await createSession({ userId: user.id, name: user.name });
  redirect(safeRedirectPath(formData.get("next")));
}

export async function login(_prev: FormState<LoginField>, formData: FormData): Promise<FormState<LoginField>> {
  const raw = { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") };
  const values = { email: raw.email };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors<LoginField>(parsed.error), values };
  }

  const user = await getStore().findUserByEmail(parsed.data.email);
  const valid = await compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) {
    return { status: "error", message: "Incorrect email or password.", values };
  }

  await createSession({ userId: user.id, name: user.name });
  redirect(safeRedirectPath(formData.get("next")));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
