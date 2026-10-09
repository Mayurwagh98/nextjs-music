import type { Metadata } from "next";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { getWaitlistCount } from "@/lib/enrollments";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description: "Be first to hear when new cohorts, workshops and live sessions open.",
};

export default async function WaitlistPage() {
  // Cached and tagged: joinWaitlist() calls updateTag("waitlist") so the
  // number updates immediately after someone signs up.
  const count = await getWaitlistCount();

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-neutral-950 px-4 pb-16 pt-36">
      <div className="relative z-10 mx-auto w-full max-w-xl text-center">
        <h1 className="bg-gradient-to-b from-neutral-200 to-neutral-600 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
          Join the waitlist
        </h1>
        <p className="mx-auto my-4 max-w-lg text-sm text-neutral-400">
          New cohorts open every month. Tell us what you want to learn and we&apos;ll email you when there&apos;s a
          place, with early access to new workshops and live sessions.
        </p>
        {count > 0 && (
          <p className="text-sm font-medium text-teal-300" data-testid="waitlist-count">
            {count} {count === 1 ? "musician is" : "musicians are"} already waiting
          </p>
        )}
        <WaitlistForm />
      </div>
      <BackgroundBeams />
    </main>
  );
}
