import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/auth/dal";
import { SESSION_COOKIE } from "@/lib/auth/token";

/** Clears a stale session cookie, then sends the visitor to log in again. */
export function GET(request: NextRequest) {
  const next = safeRedirectPath(request.nextUrl.searchParams.get("next"));
  const url = new URL("/login", request.url);
  url.searchParams.set("next", next);
  const response = NextResponse.redirect(url);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
