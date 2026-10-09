import "server-only";
import path from "node:path";
import { createFileStore } from "./file-store";
import { createMongoStore } from "./mongo-store";
import type { Store } from "./types";

export type { Store, UserRecord, EnrollmentRecord } from "./types";

// Keep one instance across hot reloads in development (and one Mongo
// connection pool per server process in production).
const globalForStore = globalThis as unknown as { __cadenceStore?: Store };

function createStore(): Store {
  const uri = process.env.MONGODB_URI;
  if (uri) return createMongoStore(uri);
  const file = process.env.DATA_FILE ?? path.join(process.cwd(), ".data", "db.json");
  return createFileStore(file);
}

export function getStore(): Store {
  globalForStore.__cadenceStore ??= createStore();
  return globalForStore.__cadenceStore;
}
