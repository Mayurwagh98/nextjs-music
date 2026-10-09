import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge, CourseCard } from "@/components/courses/CourseCard";
import { EnrollPanel, EnrollPanelSkeleton } from "@/components/courses/EnrollPanel";
import { PreviewButton } from "@/components/player/PreviewButton";
import { ACADEMY_TIMEZONE, getCourse, getCourses, getInstructor, getUpcomingSessions } from "@/lib/catalog";
import { getEnrollmentCount } from "@/lib/enrollments";
import { formatDuration, formatPrice, formatSessionTime, totalMinutes } from "@/lib/format";
import { site } from "@/lib/site";
import { courseTrack } from "@/lib/tracks";

type Params = Promise<{ slug: string }>;

/** Every catalog course is prerendered at build time. */
export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: "Course not found" };
  return {
    title: course.title,
    description: course.description,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: { title: course.title, description: course.description, type: "website" },
  };
}

/*
 * Every known course is fully prerendered by generateStaticParams. params are
 * awaited at the top (outside <Suspense>) on purpose: an unknown slug then
 * renders on demand and notFound() can still send a real 404 status, because
 * nothing has been streamed yet. Only the per-user EnrollPanel streams.
 */
export default async function CoursePage({ params }: { params: Params }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  const [instructor, sessions, enrolledCount, allCourses] = await Promise.all([
    getInstructor(course.instructor),
    getUpcomingSessions(),
    getEnrollmentCount(course.slug),
    getCourses(),
  ]);
  const liveSessions = sessions.filter((s) => s.course === course.slug);
  const related = allCourses
    .filter((c) => c.slug !== course.slug && (c.instrument === course.instrument || c.instructor === course.instructor))
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.longDescription,
    url: `${site.url}/courses/${course.slug}`,
    provider: { "@type": "Organization", name: site.name, sameAs: site.url },
    offers: { "@type": "Offer", price: course.price, priceCurrency: "USD", category: "Paid" },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: `P${course.durationWeeks}W`,
      instructor: instructor ? { "@type": "Person", name: instructor.name } : undefined,
    },
  };

  return (
    <main className="min-h-screen w-full pb-24 pt-32">
    <article className="mx-auto max-w-6xl px-4">
      <script
        type="application/ld+json"
        // JSON.stringify output from our own catalog; `<` is escaped so content can't close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-neutral-400">
        <Link href="/courses" className="hover:text-white">Courses</Link>
        <span className="mx-2">/</span>
        <Link href={`/courses?instrument=${course.instrument}`} className="hover:text-white">{course.instrument}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge>{course.instrument}</Badge>
            <Badge>{course.level}</Badge>
            <Badge>{course.durationWeeks} weeks</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white md:text-5xl">{course.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-300">{course.longDescription}</p>

          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={course.image}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
          </div>

          <section aria-labelledby="learn-heading" className="mt-12">
            <h2 id="learn-heading" className="text-2xl font-bold text-white">What you&apos;ll learn</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {course.outcomes.map((outcome) => (
                <li key={outcome} className="rounded-xl border border-white/10 bg-neutral-950 p-4 text-sm text-neutral-300">
                  <span aria-hidden className="mr-2 text-teal-400">✓</span>
                  {outcome}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="curriculum-heading" className="mt-12">
            <div className="flex items-baseline justify-between">
              <h2 id="curriculum-heading" className="text-2xl font-bold text-white">Curriculum</h2>
              <p className="text-sm text-neutral-400">
                {course.curriculum.length} modules · {formatDuration(totalMinutes(course.curriculum))} of video
              </p>
            </div>
            <ol className="mt-4 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
              {course.curriculum.map((lesson, index) => (
                <li key={lesson.title} className="flex items-center justify-between gap-4 bg-neutral-950 px-4 py-3 text-sm">
                  <span className="text-neutral-200">
                    <span className="mr-3 tabular-nums text-neutral-400">{String(index + 1).padStart(2, "0")}</span>
                    {lesson.title}
                  </span>
                  <span className="shrink-0 tabular-nums text-neutral-400">{formatDuration(lesson.minutes)}</span>
                </li>
              ))}
            </ol>
          </section>

          {liveSessions.length > 0 && (
            <section aria-labelledby="live-heading" className="mt-12">
              <h2 id="live-heading" className="text-2xl font-bold text-white">Live sessions</h2>
              <ul className="mt-4 space-y-3">
                {liveSessions.map((session) => (
                  <li key={session.id} className="rounded-xl border border-white/10 bg-neutral-950 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-400">
                      Next: {formatSessionTime(session.startsAt, ACADEMY_TIMEZONE)}
                    </p>
                    <p className="mt-1 font-semibold text-white">{session.title}</p>
                    <p className="text-sm text-neutral-400">{session.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
            <p className="text-3xl font-bold text-white">{formatPrice(course.price)}</p>
            <p className="mt-1 text-sm text-neutral-400">
              {enrolledCount > 0
                ? `${enrolledCount} ${enrolledCount === 1 ? "student" : "students"} enrolled`
                : "Be the first to enroll"}
            </p>
            <div className="mt-5">
              <Suspense fallback={<EnrollPanelSkeleton />}>
                <EnrollPanel slug={course.slug} />
              </Suspense>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
              <span className="text-sm text-neutral-400">Hear a 15-second preview</span>
              <PreviewButton track={courseTrack(course, instructor)} />
            </div>
          </div>

          {instructor && (
            <div className="mt-6 flex gap-4 rounded-2xl border border-white/10 bg-neutral-950 p-6">
              <Image
                src={instructor.image}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 shrink-0 rounded-full object-cover object-top"
              />
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">Your instructor</p>
                <p className="font-semibold text-white">{instructor.name}</p>
                <p className="text-sm text-teal-400">{instructor.role}</p>
                <p className="mt-2 text-sm text-neutral-400">{instructor.bio}</p>
                <Link href={`/courses?instructor=${instructor.slug}`} className="mt-2 inline-block text-sm text-teal-400 hover:underline">
                  All courses by {instructor.name.split(" ")[0]} →
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-20">
          <h2 id="related-heading" className="mb-6 text-2xl font-bold text-white">You might also like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        </section>
      )}
    </article>
    </main>
  );
}
