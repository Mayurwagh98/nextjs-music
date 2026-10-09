import { getTestimonials } from "@/lib/catalog";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

export default async function Testimonials() {
  const testimonials = await getTestimonials();
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative flex h-[40rem] w-full flex-col items-center justify-center bg-black bg-grid-white/[0.1] px-3 text-center"
    >
      <h2
        id="testimonials-heading"
        className="mb-3 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl font-bold text-transparent"
      >
        Voices of our students
      </h2>
      <p className="mb-8 max-w-2xl text-center text-lg text-neutral-400">
        What learners say after finishing a course
      </p>
      <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
    </section>
  );
}
