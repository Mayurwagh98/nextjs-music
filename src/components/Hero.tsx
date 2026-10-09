import Link from "next/link";
import { HeroHighlight } from "./ui/hero-highlight";
import { MovingBorderLink } from "./ui/moving-border";
import { Spotlight } from "./ui/SpotLight";

const Hero = () => {
  return (
    <HeroHighlight>
      <div className="relative mx-auto flex h-auto w-full flex-col items-center justify-center overflow-hidden py-10 md:h-[40rem] md:py-0">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20 lg:left-10" fill="white" />
        <div className="relative z-10 w-full p-4 text-center">
          <h1 className="mt-24 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl font-bold text-transparent md:mt-0 md:text-7xl">
            Master your music
          </h1>
          <p className="mx-auto mb-8 mt-4 max-w-lg text-base font-normal text-neutral-300 md:text-lg">
            Guitar, piano, voice, drums and production, taught by working musicians. Learn at your own pace,
            then play with others in weekly live sessions.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <MovingBorderLink href="/courses" className="bg-black text-white border-slate-800">
              Explore courses
            </MovingBorderLink>
            <Link
              href="/waitlist"
              className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-sm text-neutral-200 transition hover:border-teal-400 hover:text-teal-300"
            >
              Join the waitlist
            </Link>
          </div>
        </div>
      </div>
    </HeroHighlight>
  );
};

export default Hero;
