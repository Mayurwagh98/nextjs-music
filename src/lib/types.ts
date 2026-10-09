export const INSTRUMENTS = ["Guitar", "Piano", "Voice", "Drums", "Production", "Theory"] as const;
export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export const SORTS = ["featured", "price-asc", "price-desc", "duration"] as const;

export type Instrument = (typeof INSTRUMENTS)[number];
export type Level = (typeof LEVELS)[number];
export type SortKey = (typeof SORTS)[number];

export interface Lesson {
  title: string;
  minutes: number;
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  instrument: Instrument;
  level: Level;
  price: number;
  durationWeeks: number;
  /** Slug of the instructor teaching the course. */
  instructor: string;
  isFeatured: boolean;
  image: string;
  /** Path to a short audio preview under /public. */
  preview: string;
  curriculum: Lesson[];
  outcomes: string[];
}

export interface Instructor {
  slug: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  /** 0 = Sunday … 6 = Saturday, in the academy's timezone. */
  weekday: number;
  /** "HH:mm", 24h, in the academy's timezone. */
  time: string;
  durationMinutes: number;
  course: string;
}

export interface CourseFilters {
  q?: string;
  instrument?: Instrument;
  level?: Level;
  instructor?: string;
  sort?: SortKey;
}

/** What the app exposes about a signed-in user. Never includes the password hash. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
}
