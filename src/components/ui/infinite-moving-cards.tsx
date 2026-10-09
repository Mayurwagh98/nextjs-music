import { cn } from "@/lib/utils";
import NextLink from "next/link";
import React from "react";

// Rewritten from the original cloneNode-in-useEffect version: the list is now
// duplicated in JSX (second copy aria-hidden), so it renders on the server, needs
// no client JS, and links inside it keep Next's client-side navigation (cloned DOM
// nodes did a full page reload, which would stop the persistent audio player).
const DURATION = { fast: "20s", normal: "40s", slow: "80s" } as const;

export type MovingCardItem = {
  quote: string;
  name: string;
  title: string;
  href?: string;
};

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: MovingCardItem[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const style = {
    "--animation-direction": direction === "left" ? "forwards" : "reverse",
    "--animation-duration": DURATION[speed],
  } as React.CSSProperties;

  return (
    <div
      style={style}
      className={cn(
        "scroller relative z-20  max-w-7xl overflow-hidden  [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        className={cn(
          " flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {[false, true].map((duplicate) =>
          items.map((item) => (
            <li
              className="w-[350px] max-w-full relative rounded-2xl border border-b-0 flex-shrink-0 border-slate-700 px-8 py-6 md:w-[450px]"
              style={{
                background:
                  "linear-gradient(180deg, var(--slate-800), var(--slate-900)",
              }}
              key={`${duplicate}-${item.name}`}
              aria-hidden={duplicate || undefined}
            >
              <CardBody item={item} tabIndex={duplicate ? -1 : undefined} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

function CardBody({ item, tabIndex }: { item: MovingCardItem; tabIndex?: number }) {
  const content = (
    <blockquote>
      <div
        aria-hidden="true"
        className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
      ></div>
      <span className=" relative z-20 text-sm leading-[1.6] text-gray-100 font-normal">
        {item.quote}
      </span>
      <div className="relative z-20 mt-6 flex flex-row items-center">
        <span className="flex flex-col gap-1">
          <span className=" text-sm leading-[1.6] text-gray-400 font-normal">
            {item.name}
          </span>
          <span className=" text-sm leading-[1.6] text-gray-400 font-normal">
            {item.title}
          </span>
        </span>
      </div>
    </blockquote>
  );
  if (!item.href) return content;
  return (
    <NextLink href={item.href} tabIndex={tabIndex} className="block">
      {content}
    </NextLink>
  );
}

