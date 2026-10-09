import { MongoClient } from "mongodb";
import { afterAll, describe, expect, it } from "vitest";
import { createMongoStore } from "@/lib/store/mongo-store";

/*
 * Runs against a real MongoDB when MONGODB_TEST_URI is set (CI starts a
 * mongo service container). Each run uses a throwaway database.
 *   MONGODB_TEST_URI=mongodb://127.0.0.1:27017 npm test
 */
const base = process.env.MONGODB_TEST_URI;
const dbName = `cadence_test_${Date.now()}`;

describe.skipIf(!base)("mongo store", () => {
  // Swap whatever database the base URI names for a throwaway one.
  const uri = base ? withDatabase(base, dbName) : "";
  const store = base ? createMongoStore(uri) : null!;

  afterAll(async () => {
    const admin = new MongoClient(uri);
    await admin.db().dropDatabase();
    await admin.close();
    await store.close();
  });

  it("uses the database named in the connection string", async () => {
    const admin = new MongoClient(uri);
    expect(admin.db().databaseName).toBe(dbName);
    await admin.close();
  });

  it("creates users and rejects duplicate emails case-insensitively", async () => {
    const user = await store.createUser({ name: "A", email: "A@x.com", passwordHash: "h" });
    expect(user).toMatchObject({ email: "a@x.com", name: "A" });
    expect(await store.createUser({ name: "B", email: "a@X.com", passwordHash: "h" })).toBe("email-taken");
    const found = await store.findUserByEmail("A@X.COM");
    expect(found?.name).toBe("A");
    expect(await store.findUserById(found!.id)).toMatchObject({ email: "a@x.com" });
    expect(await store.findUserById("not-an-object-id")).toBeNull();
  });

  it("enrolls once per course, even under concurrency", async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => store.enroll("u1", "jazz")));
    expect(results.filter(Boolean)).toHaveLength(1);
    await Promise.all(["u2", "u3"].map((u) => store.enroll(u, "jazz")));
    expect(await store.countEnrollments("jazz")).toBe(3);

    expect((await store.listEnrollments("u1")).map((e) => e.courseSlug)).toEqual(["jazz"]);
    await store.unenroll("u1", "jazz");
    expect(await store.listEnrollments("u1")).toEqual([]);
    expect(await store.countEnrollments("jazz")).toBe(2);
  });

  it("deduplicates the waitlist", async () => {
    expect(await store.addToWaitlist({ email: "x@y.com", instrument: "Piano" })).toBe("added");
    expect(await store.addToWaitlist({ email: "X@Y.com", instrument: "Drums" })).toBe("exists");
    expect(await store.countWaitlist()).toBe(1);
  });
});

function withDatabase(uri: string, db: string) {
  const [main, query] = uri.split("?");
  const hostEnd = main.indexOf("/", main.indexOf("://") + 3);
  const root = hostEnd === -1 ? main : main.slice(0, hostEnd);
  return `${root}/${db}${query ? `?${query}` : ""}`;
}
