import { MongoClient, MongoServerError, ObjectId } from "mongodb";
import type { EnrollmentRecord, Store, UserRecord, WaitlistRecord } from "./types";

type UserDoc = Omit<UserRecord, "id" | "createdAt"> & { _id: ObjectId; createdAt: Date };
type EnrollmentDoc = Omit<EnrollmentRecord, "enrolledAt"> & { enrolledAt: Date };
type WaitlistDoc = Omit<WaitlistRecord, "createdAt"> & { createdAt: Date };

const DUPLICATE_KEY = 11000;
const isDuplicate = (error: unknown) => error instanceof MongoServerError && error.code === DUPLICATE_KEY;

function toUser(doc: UserDoc): UserRecord {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    email: doc.email,
    passwordHash: doc.passwordHash,
    createdAt: doc.createdAt.toISOString(),
  };
}

/**
 * MongoDB store. Uniqueness (one account per email, one enrollment per
 * user+course, one waitlist entry per email) is enforced by unique indexes,
 * so concurrent requests can't create duplicates.
 */
export function createMongoStore(uri: string): Store {
  const client = new MongoClient(uri, { maxPoolSize: 10 });

  const ready = (async () => {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB ?? "cadence");
    const users = db.collection<UserDoc>("users");
    const enrollments = db.collection<EnrollmentDoc>("enrollments");
    const waitlist = db.collection<WaitlistDoc>("waitlist");
    await Promise.all([
      users.createIndex({ email: 1 }, { unique: true }),
      enrollments.createIndex({ userId: 1, courseSlug: 1 }, { unique: true }),
      enrollments.createIndex({ courseSlug: 1 }),
      waitlist.createIndex({ email: 1 }, { unique: true }),
    ]);
    return { users, enrollments, waitlist };
  })();

  // Avoid an unhandled rejection at import time; callers see the error on use.
  ready.catch((error) => console.error("[store] MongoDB connection failed", error));

  const col = async <K extends "users" | "enrollments" | "waitlist">(name: K) =>
    (await ready)[name] as Awaited<typeof ready>[K];

  const normalise = (email: string) => email.trim().toLowerCase();

  return {
    kind: "mongodb",

    async createUser(input) {
      const users = await col("users");
      const doc: UserDoc = { ...input, email: normalise(input.email), _id: new ObjectId(), createdAt: new Date() };
      try {
        await users.insertOne(doc);
        return toUser(doc);
      } catch (error) {
        if (isDuplicate(error)) return "email-taken";
        throw error;
      }
    },

    async findUserByEmail(email) {
      const doc = await (await col("users")).findOne({ email: normalise(email) });
      return doc ? toUser(doc) : null;
    },

    async findUserById(id) {
      if (!ObjectId.isValid(id)) return null;
      const doc = await (await col("users")).findOne({ _id: new ObjectId(id) });
      return doc ? toUser(doc) : null;
    },

    async enroll(userId, courseSlug) {
      try {
        await (await col("enrollments")).insertOne({ userId, courseSlug, enrolledAt: new Date() });
        return true;
      } catch (error) {
        if (isDuplicate(error)) return false;
        throw error;
      }
    },

    async unenroll(userId, courseSlug) {
      await (await col("enrollments")).deleteOne({ userId, courseSlug });
    },

    async listEnrollments(userId) {
      const docs = await (await col("enrollments")).find({ userId }).sort({ enrolledAt: -1 }).toArray();
      return docs.map((d) => ({ userId: d.userId, courseSlug: d.courseSlug, enrolledAt: d.enrolledAt.toISOString() }));
    },

    async countEnrollments(courseSlug) {
      return (await col("enrollments")).countDocuments({ courseSlug });
    },

    async addToWaitlist(input) {
      try {
        await (await col("waitlist")).insertOne({ ...input, email: normalise(input.email), createdAt: new Date() });
        return "added";
      } catch (error) {
        if (isDuplicate(error)) return "exists";
        throw error;
      }
    },

    async countWaitlist() {
      return (await col("waitlist")).estimatedDocumentCount();
    },
  };
}
