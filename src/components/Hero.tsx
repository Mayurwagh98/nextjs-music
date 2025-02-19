"use client";

import { HeroHighlight } from "./ui/hero-highlight";
import { Button } from "./ui/moving-border";
import { Spotlight } from "./ui/SpotLight";

const Hero = () => {
  return (
    <>
      <HeroHighlight>
        <div className="flex flex-col justify-center items-center h-auto md:h-[40rem] relative overflow-hidden mx-auto py-10 md:py-0 w-screen">
          {/* <DotBackgroundDemo /> */}
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20 lg:left-10"
            fill="white"
          />
          <div className="p-4 relative z-10 w-full text-center">
            <h1 className="mt-20 md:mt-0 text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              Master your Music
            </h1>
            <p className="mt-4 font-normal text-base md:text-lg text-neutral-300 max-w-lg mx-auto mb-3">
              Unlock the full potential of MongoDB, Express.js, React, and
              Node.js. Join our comprehensive courses and become a full-stack
              development expert. Start your journey to becoming a MERN stack
              professional today.
            </p>
            <Button
              className="bg-white dark:bg-black text-black dark:text-white border-neutral-200 dark:border-slate-800"
              borderRadius="1.7rem"
            >
              Exlpore More
            </Button>
          </div>
        </div>
      </HeroHighlight>
    </>
  );
};

export default Hero;
