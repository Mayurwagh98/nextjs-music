import Featured from "@/components/Featured";
import Hero from "@/components/Hero";
import Instructors from "@/components/Instructors";
import Testimonials from "@/components/Testimonials";
import UpcomingSessions from "@/components/UpcomingSessions";

// Everything on the home page is static or comes from `use cache` functions,
// so the whole route is prerendered at build time (no per-request rendering).
export default function Home() {
  return (
    <main>
      <Hero />
      <Featured />
      <Testimonials />
      <UpcomingSessions />
      <Instructors />
    </main>
  );
}
