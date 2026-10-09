import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { courseTrack } from "@/lib/tracks";
import type { Course, Instructor } from "@/lib/types";
import { PreviewButton } from "../player/PreviewButton";

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-neutral-300">
      {children}
    </span>
  );
}

/**
 * Server Component card. The link goes to /courses/[slug]; on client-side
 * navigation that URL is intercepted by app/@modal/(.)courses/[slug] and
 * opens as a modal over the list.
 */
export function CourseCard({
  course,
  instructor,
  priority = false,
  footer,
}: {
  course: Course;
  instructor?: Instructor;
  priority?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 transition hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-500/10">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={course.image}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <Badge>{course.instrument}</Badge>
          <Badge>{course.level}</Badge>
          <Badge>{course.durationWeeks} weeks</Badge>
        </div>
        <h2 className="mt-3 text-lg font-bold text-white">
          {/* Stretched link: the whole card is clickable, the preview button stays separate. */}
          <Link href={`/courses/${course.slug}`} className="after:absolute after:inset-0 focus:outline-none">
            {course.title}
          </Link>
        </h2>
        {instructor && <p className="mt-1 text-sm text-neutral-400">with {instructor.name}</p>}
        <p className="mt-3 flex-1 text-sm text-neutral-400">{course.description}</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-base font-semibold text-white">{formatPrice(course.price)}</span>
          <PreviewButton track={courseTrack(course, instructor)} className="relative z-10" />
        </div>
        {footer && <div className="relative z-10 mt-4 border-t border-white/10 pt-4">{footer}</div>}
      </div>
    </article>
  );
}
