import {
  INSTRUMENTS,
  LEVELS,
  SORTS,
  type Course,
  type CourseFilters,
  type Instrument,
  type Level,
  type SortKey,
} from "./types";

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function oneOf<T extends string>(list: readonly T[], value: string | undefined): T | undefined {
  return list.find((item) => item.toLowerCase() === value?.toLowerCase());
}

/**
 * Turns untrusted URL search params into typed filters. Unknown values are
 * dropped rather than rejected so a stale or hand-edited URL still renders.
 */
export function parseFilters(params: RawParams): CourseFilters {
  const q = first(params.q)?.trim().slice(0, 80);
  const instructor = first(params.instructor)?.trim();
  return {
    q: q || undefined,
    instrument: oneOf<Instrument>(INSTRUMENTS, first(params.instrument)),
    level: oneOf<Level>(LEVELS, first(params.level)),
    instructor: instructor && /^[a-z0-9-]+$/.test(instructor) ? instructor : undefined,
    sort: oneOf<SortKey>(SORTS, first(params.sort)),
  };
}

export function hasActiveFilters(filters: CourseFilters) {
  return Boolean(filters.q || filters.instrument || filters.level || filters.instructor);
}

/** Pure filter + sort over the catalog, shared by the /courses page and /api/courses. */
export function filterCourses(courses: Course[], filters: CourseFilters): Course[] {
  const terms = filters.q?.toLowerCase().split(/\s+/).filter(Boolean) ?? [];

  const matches = courses.filter((course) => {
    if (filters.instrument && course.instrument !== filters.instrument) return false;
    if (filters.level && course.level !== filters.level) return false;
    if (filters.instructor && course.instructor !== filters.instructor) return false;
    if (terms.length) {
      const haystack = [course.title, course.description, course.instrument, course.level]
        .join(" ")
        .toLowerCase();
      return terms.every((term) => haystack.includes(term));
    }
    return true;
  });

  const sorted = [...matches];
  switch (filters.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "duration":
      sorted.sort((a, b) => a.durationWeeks - b.durationWeeks);
      break;
    default:
      sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.id - b.id);
  }
  return sorted;
}
