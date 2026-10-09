import { describe, expect, it } from "vitest";
import { nextOccurrence, upcomingSessions } from "@/lib/schedule";

const IST = "Asia/Kolkata"; // UTC+05:30, no DST

describe("nextOccurrence", () => {
  it("finds the next weekday at the local time", () => {
    // Friday 9 Oct 2026, 10:00 IST
    const now = new Date("2026-10-09T04:30:00Z");
    // Tuesday 19:00 IST -> 13 Oct 2026 13:30 UTC
    expect(nextOccurrence({ weekday: 2, time: "19:00" }, IST, now).toISOString()).toBe("2026-10-13T13:30:00.000Z");
  });

  it("uses today if the session hasn't started yet", () => {
    const now = new Date("2026-10-09T04:30:00Z"); // Fri 10:00 IST
    expect(nextOccurrence({ weekday: 5, time: "18:30" }, IST, now).toISOString()).toBe("2026-10-09T13:00:00.000Z");
  });

  it("rolls over a week once today's session has started", () => {
    const now = new Date("2026-10-09T13:00:00Z"); // Fri 18:30 IST exactly
    expect(nextOccurrence({ weekday: 5, time: "18:30" }, IST, now).toISOString()).toBe("2026-10-16T13:00:00.000Z");
  });

  it("handles a timezone with daylight saving", () => {
    // Sunday 1 Nov 2026 is the US DST change; 09:00 New York is 14:00 UTC after it.
    const now = new Date("2026-10-31T12:00:00Z");
    expect(nextOccurrence({ weekday: 0, time: "09:00" }, "America/New_York", now).toISOString()).toBe(
      "2026-11-01T14:00:00.000Z"
    );
  });
});

describe("upcomingSessions", () => {
  it("sorts sessions by their next start", () => {
    const now = new Date("2026-10-09T04:30:00Z");
    const result = upcomingSessions(
      [
        { id: "a", title: "", description: "", weekday: 2, time: "19:00", durationMinutes: 60, course: "x" },
        { id: "b", title: "", description: "", weekday: 6, time: "11:00", durationMinutes: 60, course: "x" },
      ],
      IST,
      now
    );
    expect(result.map((s) => s.id)).toEqual(["b", "a"]);
  });
});
