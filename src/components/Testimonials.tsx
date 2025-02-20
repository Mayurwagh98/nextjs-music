"use client";

import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "The structured learning approach and expert guidance helped me progress from a complete beginner to confidently performing my favorite pieces. The journey has been transformative!",
      name: "Sarah Chen",
      title: "Piano Student",
    },
    {
      quote:
        "Learning music theory here opened up a whole new world of understanding. Now I can compose my own pieces and appreciate music on a deeper level. It's been an incredible experience.",
      name: "Michael Rodriguez",
      title: "Music Theory Student",
    },
    {
      quote:
        "The community of fellow musicians and supportive instructors made learning enjoyable and motivating. I've grown so much as a guitarist in just a few months.",
      name: "James Wilson",
      title: "Guitar Enthusiast",
    },
    {
      quote:
        "From basic beats to complex rhythms, the drum lessons here have helped me develop my skills and confidence. The instructors are passionate and patient.",
      name: "Emma Thompson",
      title: "Drum Student",
    },
    {
      quote:
        "The vocal training techniques I learned here transformed my singing. The personalized feedback and practice routines were exactly what I needed to improve.",
      name: "David Kim",
      title: "Vocal Student",
    },
  ];
  return (
    <div className="h-[40rem] w-full dark:bg-black bg-white dark:bg-grid-white/[0.1] bg-grid-black/[0.2] relative flex flex-col items-center justify-center">
      <h3 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">
        Voices of Musical Excellence
      </h3>
      <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl text-center">
        Real stories from students who transformed their musical journey with us
      </p>
      <InfiniteMovingCards
        items={testimonials}
        direction="right"
        speed="slow"
      />
    </div>
  );
};

export default Testimonials;
