import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createFileStore } from "@/lib/store/file-store";

async function freshStore() {
  const dir = await mkdtemp(path.join(tmpdir(), "cadence-"));
  const file = path.join(dir, "db.json");
  return { store: createFileStore(file), file };
}

describe("file store", () => {
  it("creates users and rejects duplicate emails case-insensitively", async () => {
    const { store } = await freshStore();
    const user = await store.createUser({ name: "A", email: "A@x.com", passwordHash: "h" });
    expect(user).toMatchObject({ email: "a@x.com" });
    expect(await store.createUser({ name: "B", email: "a@X.com", passwordHash: "h" })).toBe("email-taken");
    expect(await store.findUserByEmail("A@X.COM")).toMatchObject({ name: "A" });
  });

  it("enrolls once per course and counts correctly under concurrency", async () => {
    const { store, file } = await freshStore();
    const results = await Promise.all(Array.from({ length: 5 }, () => store.enroll("u1", "jazz")));
    expect(results.filter(Boolean)).toHaveLength(1);
    await Promise.all(["u2", "u3"].map((u) => store.enroll(u, "jazz")));
    expect(await store.countEnrollments("jazz")).toBe(3);

    await store.unenroll("u1", "jazz");
    expect(await store.listEnrollments("u1")).toEqual([]);
    // Persisted to disk as valid JSON.
    expect(JSON.parse(await readFile(file, "utf8")).enrollments).toHaveLength(2);
  });

  it("deduplicates the waitlist", async () => {
    const { store } = await freshStore();
    expect(await store.addToWaitlist({ email: "x@y.com", instrument: "Piano" })).toBe("added");
    expect(await store.addToWaitlist({ email: "X@Y.com", instrument: "Drums" })).toBe("exists");
    expect(await store.countWaitlist()).toBe(1);
  });
});
