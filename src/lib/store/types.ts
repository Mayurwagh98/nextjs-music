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
 * Persistence for user-generated data (accounts, enrollments, waitlist),
 * backed by MongoDB. The rest of the app depends only on this interface.
 */
export interface Store {
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
