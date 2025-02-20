import Featured from "@/components/Featured";
import Hero from "@/components/Hero";
import Instructors from "@/components/Instructors";
import Testimonials from "@/components/Testimonials";
import UpComingLessons from "@/components/UpcomingLessons";

export default function Home() {
  return (
    <main className="">
      <Hero />
      <Featured />
      <Testimonials />
      <UpComingLessons />
      <Instructors />
    </main>
  );
}
