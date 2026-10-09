import type { LiveSession } from "./types";

/**
 * Offset of `timeZone` from UTC, in minutes, at the given instant.
 * Uses Intl so it works for any IANA zone (including ones with DST).
 */
function zoneOffsetMinutes(at: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value])
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return Math.round((asUtc - at.getTime()) / 60000);
}

/**
 * Next start time of a weekly session, strictly after `now`.
 * A session that has already started today rolls over to next week.
 */
export function nextOccurrence(session: Pick<LiveSession, "weekday" | "time">, timeZone: string, now: Date) {
  const [hour, minute] = session.time.split(":").map(Number);
  const offset = zoneOffsetMinutes(now, timeZone);
  // Wall-clock "now" in the academy's timezone, expressed as a UTC date.
  const local = new Date(now.getTime() + offset * 60000);
  const daysAhead = (session.weekday - local.getUTCDay() + 7) % 7;

  for (const extra of [0, 7]) {
    const candidateLocal = Date.UTC(
      local.getUTCFullYear(),
      local.getUTCMonth(),
      local.getUTCDate() + daysAhead + extra,
      hour,
      minute
    );
    // Recompute the offset at the candidate instant so DST transitions are handled.
    const guess = new Date(candidateLocal - offset * 60000);
    const start = new Date(candidateLocal - zoneOffsetMinutes(guess, timeZone) * 60000);
    if (start.getTime() > now.getTime()) return start;
  }
  throw new Error("unreachable");
}

export function upcomingSessions<T extends LiveSession>(sessions: T[], timeZone: string, now: Date) {
  return sessions
    .map((session) => ({ ...session, startsAt: nextOccurrence(session, timeZone, now) }))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}
