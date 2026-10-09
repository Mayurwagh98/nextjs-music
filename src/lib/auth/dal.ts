import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getStore } from "@/lib/store";
import type { SessionUser } from "@/lib/types";
import { SESSION_COOKIE, verifySession } from "./token";

/*
 * Data Access Layer: the only place that turns the session cookie into a user.
 * proxy.ts does an optimistic redirect for UX, but every page and Server Action
 * that needs a user calls these functions, so authorization never depends on
 * the proxy having run.
 */

/** The signed-in user, or null. Deduplicated per request with React cache(). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await getStore().findUserById(session.userId);
  if (!user) return null;
  // Return a narrow DTO: the password hash never leaves this module.
  return { id: user.id, name: user.name, email: user.email };
});

/** For pages that need a user: redirects to /login and comes back afterwards. */
export async function requireUser(returnTo: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const next = encodeURIComponent(returnTo);
    // A validly signed cookie for a user that no longer exists (e.g. the
    // database was reset): clear it first, or proxy.ts would bounce /login
    // straight back here.
    const hasCookie = (await cookies()).has(SESSION_COOKIE);
    redirect(hasCookie ? `/auth/reset?next=${next}` : `/login?next=${next}`);
  }
  return user;
}

/** Only allow same-site relative redirects after login (no open redirects). */
export function safeRedirectPath(value: unknown, fallback = "/dashboard") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}
