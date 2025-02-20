import Featured from "@/components/Featured";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import UpComingLessons from "@/components/UpcomingLessons";

export default function Home() {
  return (
    <main className="">
      <Hero />
      <Featured />
      <Testimonials />
      <UpComingLessons />
    </main>
  );
}
