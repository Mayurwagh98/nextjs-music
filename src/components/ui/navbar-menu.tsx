"use client";
import React from "react";
import { motion } from "motion/react";
import Link from "next/link";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  href,
  current,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  /** The label itself is a link (no Link-wrapping-a-div nesting). */
  href: string;
  current?: boolean;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} onFocus={() => setActive(item)} className="relative">
      <Link
        href={href}
        aria-current={current ? "page" : undefined}
        className={`text-sm sm:text-base hover:opacity-90 ${current ? "text-teal-300" : "text-white"}`}
      >
        {item}
      </Link>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && children && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active" // layoutId ensures smooth animation
                className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
              >
                <motion.div
                  layout // layout ensures smooth animation
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      aria-label="Main"
      onMouseLeave={() => setActive(null)} // resets the state
      className="relative rounded-full border border-white/[0.2] bg-black/90 backdrop-blur shadow-input flex items-center justify-center gap-4 sm:gap-6 px-5 sm:px-8 py-4"
    >
      {children}
    </nav>
  );
};

export const HoveredLink = ({
  children,
  ...rest
}: React.ComponentProps<typeof Link>) => {
  return (
    <Link
      {...rest}
      className="text-neutral-300 hover:text-teal-300 transition-colors"
    >
      {children}
    </Link>
  );
};
