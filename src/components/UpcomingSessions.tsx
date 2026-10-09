import { ACADEMY_TIMEZONE, getUpcomingSessions } from "@/lib/catalog";
import { formatSessionTime } from "@/lib/format";
import { HoverEffect } from "./ui/card-hover-effect";

/**
 * Weekly live sessions with their next date computed on the server.
 * getUpcomingSessions() is cached for an hour, so this section is still part
 * of the prerendered shell rather than being rendered per request.
 */
export default async function UpcomingSessions() {
  const sessions = await getUpcomingSessions();

  const items = sessions.map((session) => ({
    id: session.id,
    title: session.title,
    description: session.description,
    eyebrow: formatSessionTime(session.startsAt, ACADEMY_TIMEZONE),
    footer: `${session.durationMinutes} min · weekly · part of ${session.courseTitle}`,
    link: `/courses/${session.course}`,
  }));

  return (
    <section aria-labelledby="sessions-heading" className="w-full bg-[#1A1A1D] px-3 py-16">
      <div className="text-center">
        <p className="text-base font-semibold uppercase tracking-wide text-teal-500">Live every week</p>
        <h2 id="sessions-heading" className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-white sm:text-4xl">
          Upcoming live sessions
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-400">
          Included with every course. Times shown in India Standard Time.
        </p>
      </div>
      <HoverEffect items={items} />
    </section>
  );
}
