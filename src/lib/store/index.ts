import "server-only";
import { createMongoStore } from "./mongo-store";
import type { Store } from "./types";

export type { Store, UserRecord, EnrollmentRecord } from "./types";

// One MongoClient (and connection pool) per server process. Stored on
// globalThis so hot reloads in development don't open a new pool each time.
const globalForStore = globalThis as unknown as { __cadenceStore?: Store };

export function getStore(): Store {
  if (!globalForStore.__cadenceStore) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        "MONGODB_URI is not set. Add your MongoDB connection string to .env.local (see .env.example)."
      );
    }
    globalForStore.__cadenceStore = createMongoStore(uri);
  }
  return globalForStore.__cadenceStore;
}
