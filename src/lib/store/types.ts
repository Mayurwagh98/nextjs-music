export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface EnrollmentRecord {
  userId: string;
  courseSlug: string;
  enrolledAt: string;
}

export interface WaitlistRecord {
  email: string;
  instrument: string;
  createdAt: string;
}

/**
 * Persistence for user-generated data. Two implementations share this
 * contract: MongoDB (when MONGODB_URI is set) and a JSON file for local
 * development, so the app runs with zero setup.
 */
export interface Store {
  readonly kind: "mongodb" | "file";
  createUser(input: Omit<UserRecord, "id" | "createdAt">): Promise<UserRecord | "email-taken">;
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;

  /** Returns false if the user was already enrolled. */
  enroll(userId: string, courseSlug: string): Promise<boolean>;
  unenroll(userId: string, courseSlug: string): Promise<void>;
  listEnrollments(userId: string): Promise<EnrollmentRecord[]>;
  countEnrollments(courseSlug: string): Promise<number>;

  addToWaitlist(input: Omit<WaitlistRecord, "createdAt">): Promise<"added" | "exists">;
  countWaitlist(): Promise<number>;
}
