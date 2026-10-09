import Link from "next/link";
import { getInstructors } from "@/lib/catalog";
import { AnimatedTooltip } from "./ui/animated-tooltip";
import { WavyBackground } from "./ui/wavy-background";

export default async function Instructors() {
  const instructors = await getInstructors();
  const people = instructors.map((instructor, index) => ({
    id: index + 1,
    name: instructor.name,
    designation: instructor.role,
    image: instructor.image,
    href: `/courses?instructor=${instructor.slug}`,
  }));

  return (
    <section aria-labelledby="instructors-heading" className="relative flex h-[35rem] w-full items-center justify-center overflow-hidden bg-black py-10">
      <WavyBackground className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-4">
        <h2 id="instructors-heading" className="text-center text-3xl font-bold text-white md:text-5xl lg:text-7xl">
          Meet our instructors
        </h2>
        <p className="mt-4 text-center text-base font-normal text-white md:text-lg">
          Working musicians who will guide your practice. Pick a face to see their courses.
        </p>
        <div className="mt-6 flex">
          <AnimatedTooltip items={people} />
        </div>
        <Link href="/courses" className="mt-8 text-sm text-neutral-200 underline-offset-4 hover:underline">
          Browse every course →
        </Link>
      </WavyBackground>
    </section>
  );
}
