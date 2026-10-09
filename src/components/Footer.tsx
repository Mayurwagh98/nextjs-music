import Link from "next/link";
import { cacheLife } from "next/cache";
import { site } from "@/lib/site";
import { INSTRUMENTS } from "@/lib/types";

async function CopyrightYear() {
  "use cache"; // reading the clock must be cached or deferred under Cache Components
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-12 text-neutral-400">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">{site.shortName}</h2>
          <p className="text-sm leading-relaxed">
            Online music lessons taught by working musicians, with weekly live sessions to keep you playing.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="mb-4 text-lg font-semibold text-white">Explore</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/courses" className="hover:text-white">All courses</Link></li>
            <li><Link href="/waitlist" className="hover:text-white">Join the waitlist</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">My dashboard</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Instruments</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {INSTRUMENTS.map((instrument) => (
              <li key={instrument}>
                <Link href={`/courses?instrument=${instrument}`} className="hover:text-white">
                  {instrument}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm">
          <h2 className="mb-4 text-lg font-semibold text-white">Contact</h2>
          <p>{site.location}</p>
          <p className="mt-2">
            <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a>
          </p>
        </div>
      </div>
      <p className="pt-10 text-center text-xs">
        © <CopyrightYear /> {site.name}. A portfolio project built with Next.js.
      </p>
    </footer>
  );
}
