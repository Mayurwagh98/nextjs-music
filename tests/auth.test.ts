import { describe, expect, it } from "vitest";
import { signSession, verifySession } from "@/lib/auth/token";
import { loginSchema, signupSchema, waitlistSchema } from "@/lib/validation";

describe("session tokens", () => {
  it("round-trips a signed session", async () => {
    const token = await signSession({ userId: "u1", name: "Mayur" });
    expect(await verifySession(token)).toEqual({ userId: "u1", name: "Mayur" });
  });

  it("rejects tampered, garbage and missing tokens", async () => {
    const token = await signSession({ userId: "u1", name: "Mayur" });
    const [h, , s] = token.split(".");
    const forged = `${h}.${Buffer.from(JSON.stringify({ sub: "admin", name: "x" })).toString("base64url")}.${s}`;
    expect(await verifySession(forged)).toBeNull();
    expect(await verifySession("not.a.jwt")).toBeNull();
    expect(await verifySession(undefined)).toBeNull();
  });
});

describe("validation", () => {
  it("normalises email case and whitespace", () => {
    expect(loginSchema.parse({ email: "  Mayur@Example.COM ", password: "x" }).email).toBe("mayur@example.com");
  });

  it("enforces password rules on signup", () => {
    const result = signupSchema.safeParse({ name: "Mayur", email: "m@example.com", password: "lettersonly" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Password must contain a number.");
  });

  it("only accepts known instruments on the waitlist", () => {
    expect(waitlistSchema.safeParse({ email: "a@b.co", instrument: "Kazoo" }).success).toBe(false);
    expect(waitlistSchema.safeParse({ email: "a@b.co", instrument: "Not sure yet" }).success).toBe(true);
  });
});
