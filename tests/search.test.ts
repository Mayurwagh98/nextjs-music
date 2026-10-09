import { describe, expect, it } from "vitest";
import courseData from "@/data/courses.json";
import { filterCourses, hasActiveFilters, parseFilters } from "@/lib/search";
import type { Course } from "@/lib/types";

const courses = courseData.courses as Course[];

describe("parseFilters", () => {
  it("normalises known values case-insensitively", () => {
    expect(parseFilters({ instrument: "guitar", level: "BEGINNER", sort: "price-asc" })).toEqual({
      q: undefined,
      instrument: "Guitar",
      level: "Beginner",
      instructor: undefined,
      sort: "price-asc",
    });
  });

  it("drops unknown or malformed values instead of throwing", () => {
    const f = parseFilters({ instrument: "kazoo", level: "", sort: "random", instructor: "../etc" });
    expect(f).toEqual({ q: undefined, instrument: undefined, level: undefined, instructor: undefined, sort: undefined });
    expect(hasActiveFilters(f)).toBe(false);
  });

  it("takes the first value of repeated params and trims the query", () => {
    expect(parseFilters({ q: ["  jazz  ", "rock"] }).q).toBe("jazz");
  });
});

describe("filterCourses", () => {
  it("returns every course, featured first, with no filters", () => {
    const result = filterCourses(courses, {});
    expect(result).toHaveLength(courses.length);
    const firstNonFeatured = result.findIndex((c) => !c.isFeatured);
    expect(result.slice(firstNonFeatured).every((c) => !c.isFeatured)).toBe(true);
  });

  it("combines instrument and level", () => {
    const result = filterCourses(courses, { instrument: "Guitar", level: "Intermediate" });
    expect(result.map((c) => c.slug)).toEqual(["blues-guitar-techniques"]);
  });

  it("matches every search term", () => {
    expect(filterCourses(courses, { q: "music production" }).map((c) => c.slug)).toEqual([
      "music-production-fundamentals",
      "electronic-music-production",
    ]);
    expect(filterCourses(courses, { q: "guitar piano" })).toHaveLength(0);
  });

  it("sorts by price both ways without mutating the input", () => {
    const before = courses.map((c) => c.slug);
    const asc = filterCourses(courses, { sort: "price-asc" }).map((c) => c.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const desc = filterCourses(courses, { sort: "price-desc" }).map((c) => c.price);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
    expect(courses.map((c) => c.slug)).toEqual(before);
  });
});
