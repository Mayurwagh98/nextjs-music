import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Modal } from "@/components/Modal";
import { Badge } from "@/components/courses/CourseCard";
import { PreviewButton } from "@/components/player/PreviewButton";
import { getCourse, getCourses, getInstructor } from "@/lib/catalog";
import { formatDuration, formatPrice, totalMinutes } from "@/lib/format";
import { courseTrack } from "@/lib/tracks";

type Params = Promise<{ slug: string }>;

/*
 * Intercepting route: a client-side navigation to /courses/[slug] (clicking a
 * card) renders this quick view in the @modal slot over the current page.
 * A refresh or a shared link renders the full page at app/courses/[slug].
 */
export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((course) => ({ slug: course.slug }));
}

export default function CourseModal({ params }: { params: Params }) {
  return (
    <Suspense fallback={null}>
      <QuickView params={params} />
    </Suspense>
  );
}

async function QuickView({ params }: { params: Params }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();
  const instructor = await getInstructor(course.instructor);

  return (
    <Modal label={course.title}>
      <div className="relative aspect-[16/7]">
        <Image src={course.image} alt="" fill sizes="42rem" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />
      </div>
      <div className="-mt-10 p-6 pt-0">
        <div className="relative flex flex-wrap gap-2">
          <Badge>{course.instrument}</Badge>
          <Badge>{course.level}</Badge>
          <Badge>{course.durationWeeks} weeks</Badge>
        </div>
        <h2 className="mt-3 text-2xl font-bold">{course.title}</h2>
        {instructor && <p className="text-sm text-teal-400">with {instructor.name}</p>}
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">{course.longDescription}</p>
        <p className="mt-5 text-xs uppercase tracking-wide text-neutral-400">
          {course.curriculum.length} modules · {formatDuration(totalMinutes(course.curriculum))}
        </p>
        <ul className="mt-2 grid gap-1 text-sm text-neutral-300 sm:grid-cols-2">
          {course.curriculum.map((lesson) => (
            <li key={lesson.title} className="truncate">• {lesson.title}</li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <span className="text-xl font-bold">{formatPrice(course.price)}</span>
          <div className="flex items-center gap-3">
            <PreviewButton track={courseTrack(course, instructor)} />
            {/* A full page load (plain <a>) so the URL isn't intercepted again. */}
            <a
              href={`/courses/${course.slug}`}
              className="inline-flex h-10 items-center rounded-lg bg-teal-500 px-4 text-sm font-semibold text-black hover:bg-teal-400"
            >
              View full course
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
