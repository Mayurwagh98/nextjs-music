"use client";

import { HoverEffect } from "./ui/card-hover-effect";

const UpComingLessons = () => {
  const projects = [
    {
      title: "Mastering Music Theory Fundamentals",
      description: "Live Webinar on Feb 15, 2024 at 2:00 PM EST\nJoin our expert instructor for an intensive webinar covering essential music theory concepts. Perfect for beginners and intermediate musicians.\n\n🔴 Live on Zoom | Registration closes Feb 14",
      link: "https://zoom.us/j/123456789",
    },
    {
      title: "Digital Music Production Workshop",
      description: "Live Workshop on Feb 18, 2024 at 3:00 PM EST\nLearn the latest techniques in digital music production with hands-on experience.\n\n🔴 Live on Google Meet | Registration closes Feb 17",
      link: "https://meet.google.com/abc-defg-hij",
    },
    {
      title: "Songwriting Masterclass",
      description: "Live Session on Feb 20, 2024 at 1:00 PM EST\nDiscover the art of songwriting with our experienced composer in this interactive session.\n\n🔴 Live on Zoom | Registration closes Feb 19",
      link: "https://zoom.us/j/987654321",
    },
    {
      title: "Jazz Improvisation Techniques",
      description: "Live Workshop on Feb 22, 2024 at 4:00 PM EST\nExplore advanced jazz improvisation methods in this interactive session.\n\n🔴 Live on Zoom | Registration closes Feb 21",
      link: "https://zoom.us/j/456789123",
    },
    {
      title: "Classical Piano Performance Tips",
      description: "Live Masterclass on Feb 25, 2024 at 2:00 PM EST\nLearn essential techniques for classical piano performance from renowned pianist Sarah Chen.\n\n🔴 Live on Google Meet | Registration closes Feb 24",
      link: "https://meet.google.com/klm-nop-qrs",
    },
    {
      title: "Music Business Essentials",
      description: "Live Seminar on Feb 28, 2024 at 3:00 PM EST\nUnderstanding the music industry: copyright, licensing, and marketing essentials.\n\n🔴 Live on Zoom | Registration closes Feb 27",
      link: "https://zoom.us/j/321654987",
    },
  ];

  return (
    <div className="w-full bg-[#1A1A1D] min-h-[30rem] py-5 px-3">
      <div className="text-center mt-6">
        <h2 className="text-base text-teal-600 font-semibold tracking-wide uppercase">
          UPCOMING LESSONS
        </h2>
        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
          Learn With the Best
        </p>
      </div>
      <div>
        <HoverEffect items={projects} />
      </div>

      <div className="mt-10 text-center">
        <button className="text-white inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-7 font-medium transition-colors focus:outline-none">
          View All
        </button>
      </div>
    </div>
  );
};

export default UpComingLessons;
