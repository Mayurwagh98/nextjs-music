import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { EnrollmentRecord, Store, UserRecord, WaitlistRecord } from "./types";

interface Data {
  users: UserRecord[];
  enrollments: EnrollmentRecord[];
  waitlist: WaitlistRecord[];
}

const empty = (): Data => ({ users: [], enrollments: [], waitlist: [] });

/**
 * JSON-file store for local development and tests. Writes are serialised
 * through a promise chain and written atomically (temp file + rename) so
 * concurrent Server Actions can't interleave and corrupt the file.
 * If the filesystem is read-only (e.g. a serverless deploy without
 * MONGODB_URI) it keeps working in memory and logs a warning.
 */
export function createFileStore(file: string): Store {
  let cache: Data | null = null;
  let queue: Promise<unknown> = Promise.resolve();
  let readOnly = false;

  async function load(): Promise<Data> {
    if (cache) return cache;
    try {
      cache = { ...empty(), ...JSON.parse(await readFile(file, "utf8")) };
    } catch {
      cache = empty();
    }
    return cache!;
  }

  async function persist(data: Data) {
    if (readOnly) return;
    try {
      await mkdir(path.dirname(file), { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      await writeFile(tmp, JSON.stringify(data, null, 2));
      await rename(tmp, file);
    } catch (error) {
      readOnly = true;
      console.warn(`[store] could not write ${file}; keeping data in memory only.`, error);
    }
  }

  /** Run a read-modify-write against the data, one at a time. */
  function mutate<T>(fn: (data: Data) => T): Promise<T> {
    const run = queue.then(async () => {
      const data = await load();
      const result = fn(data);
      await persist(data);
      return result;
    });
    queue = run.catch(() => undefined);
    return run;
  }

  const normalise = (email: string) => email.trim().toLowerCase();

  return {
    kind: "file",

    createUser(input) {
      return mutate((data) => {
        const email = normalise(input.email);
        if (data.users.some((u) => u.email === email)) return "email-taken" as const;
        const user: UserRecord = { ...input, email, id: randomUUID(), createdAt: new Date().toISOString() };
        data.users.push(user);
        return user;
      });
    },

    async findUserByEmail(email) {
      const data = await load();
      return data.users.find((u) => u.email === normalise(email)) ?? null;
    },

    async findUserById(id) {
      const data = await load();
      return data.users.find((u) => u.id === id) ?? null;
    },

    enroll(userId, courseSlug) {
      return mutate((data) => {
        if (data.enrollments.some((e) => e.userId === userId && e.courseSlug === courseSlug)) return false;
        data.enrollments.push({ userId, courseSlug, enrolledAt: new Date().toISOString() });
        return true;
      });
    },

    async unenroll(userId, courseSlug) {
      await mutate((data) => {
        data.enrollments = data.enrollments.filter((e) => !(e.userId === userId && e.courseSlug === courseSlug));
      });
    },

    async listEnrollments(userId) {
      const data = await load();
      return data.enrollments
        .filter((e) => e.userId === userId)
        .sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt));
    },

    async countEnrollments(courseSlug) {
      const data = await load();
      return data.enrollments.filter((e) => e.courseSlug === courseSlug).length;
    },

    addToWaitlist(input) {
      return mutate((data) => {
        const email = normalise(input.email);
        if (data.waitlist.some((w) => w.email === email)) return "exists" as const;
        data.waitlist.push({ ...input, email, createdAt: new Date().toISOString() });
        return "added" as const;
      });
    },

    async countWaitlist() {
      return (await load()).waitlist.length;
    },
  };
}
