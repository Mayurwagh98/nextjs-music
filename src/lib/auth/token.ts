import { jwtVerify, SignJWT } from "jose";

/*
 * Stateless session token: a signed JWT (HS256) stored in an httpOnly cookie.
 * Kept free of next/headers so both proxy.ts and the server can use it.
 */

export const SESSION_COOKIE = "cadence_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  name: string;
}

const DEV_FALLBACK_SECRET = "dev-only-secret-change-me-dev-only-secret";

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set in production (at least 32 characters).");
    }
    return new TextEncoder().encode(DEV_FALLBACK_SECRET);
  }
  if (secret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters.");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getKey());
}

/** Returns the payload, or null for a missing, expired or tampered token. */
export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.name !== "string") return null;
    return { userId: payload.sub, name: payload.name };
  } catch {
    return null;
  }
}
