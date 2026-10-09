import Image from "next/image";
import Link from "next/link";
import { getFeaturedCourses, getInstructors } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { courseTrack } from "@/lib/tracks";
import { PreviewButton } from "./player/PreviewButton";
import { GlareCard } from "./ui/glare-card";

export default async function Featured() {
  const [featured, instructors] = await Promise.all([getFeaturedCourses(), getInstructors()]);

  return (
    <section aria-labelledby="featured-heading" className="w-full bg-[#1A1A1D] px-3 py-16">
      <div className="text-center">
        <p className="text-base font-semibold uppercase tracking-wide text-teal-500">Featured courses</p>
        <h2 id="featured-heading" className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-white sm:text-4xl">
          Learn with the best
        </h2>
      </div>
      <div className="mx-4 mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((course) => {
          const instructor = instructors.find((i) => i.slug === course.instructor);
          return (
            <GlareCard key={course.id} className="flex h-full w-full flex-col overflow-hidden rounded-md px-4 py-3">
              <div className="flex flex-col items-center space-y-3 text-center">
                <Image
                  src={course.image}
                  alt=""
                  width={360}
                  height={240}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  className="mt-2 aspect-[3/2] w-[90%] rounded-lg object-cover"
                />
                <h3 className="text-lg text-neutral-100 sm:text-xl">{course.title}</h3>
                <p className="text-sm text-neutral-400">{course.description}</p>
                <p className="text-sm font-semibold text-neutral-200">
                  {formatPrice(course.price)} · {course.durationWeeks} weeks · {course.level}
                </p>
                <div className="flex items-center gap-3 pb-2">
                  <PreviewButton track={courseTrack(course, instructor)} />
                  <Link
                    href={`/courses/${course.slug}`}
                    className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-teal-300"
                  >
                    View course<span className="sr-only">: {course.title}</span>
                  </Link>
                </div>
              </div>
            </GlareCard>
          );
        })}
      </div>

      <div className="mt-14 text-center">
        <Link
          href="/courses"
          className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-7 font-medium text-white transition-colors"
        >
          View all courses
        </Link>
      </div>
    </section>
  );
}
