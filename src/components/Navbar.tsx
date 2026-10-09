"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { INSTRUMENTS } from "@/lib/types";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";

/**
 * Client Component for the hover menu. The auth area (which reads the session
 * cookie on the server) is passed in as a slot, so this file never touches
 * auth and the rest of the navbar stays in the static shell.
 */
function Navbar({ authSlot, className }: { authSlot: React.ReactNode; className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <header className={cn("fixed top-4 sm:top-8 inset-x-0 max-w-2xl mx-auto z-50 px-3", className)}>
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Home" href="/" current={pathname === "/"} />
        <MenuItem
          setActive={setActive}
          active={active}
          item="Courses"
          href="/courses"
          current={pathname.startsWith("/courses")}
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <HoveredLink href="/courses">All courses</HoveredLink>
            {INSTRUMENTS.map((instrument) => (
              <HoveredLink key={instrument} href={`/courses?instrument=${instrument}`}>
                {instrument}
              </HoveredLink>
            ))}
          </div>
        </MenuItem>
        <MenuItem
          setActive={setActive}
          active={active}
          item="Waitlist"
          href="/waitlist"
          current={pathname === "/waitlist"}
        />
        <div className="ml-1 border-l border-white/15 pl-4 sm:pl-6" onMouseEnter={() => setActive(null)}>
          {authSlot}
        </div>
      </Menu>
    </header>
  );
}

export default Navbar;
