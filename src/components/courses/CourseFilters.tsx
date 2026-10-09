"use client";

import Form from "next/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { INSTRUMENTS, LEVELS } from "@/lib/types";

const SORT_LABELS = {
  featured: "Featured first",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  duration: "Shortest first",
} as const;

const fieldClass =
  "h-11 rounded-lg border border-neutral-800 bg-neutral-950 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-teal-600";

/**
 * Filters live in the URL (shareable, back-button friendly, and readable by
 * the Server Component that renders results). <Form> from next/form keeps it
 * working without JavaScript; with JS we build a clean URL and navigate in a
 * transition so the current results stay visible while new ones load.
 */
export function CourseFilters({ instructors }: { instructors: { slug: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const navigate = (form: HTMLFormElement) => {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      if (typeof value === "string" && value.trim()) params.set(key, value.trim());
    }
    const query = params.toString();
    startTransition(() => router.replace(query ? `/courses?${query}` : "/courses", { scroll: false }));
  };

  return (
    <Form
      action="/courses"
      role="search"
      aria-label="Filter courses"
      // Remount when the URL changes elsewhere (e.g. a navbar link) so the
      // uncontrolled fields pick up the new defaults.
      key={searchParams.toString()}
      onSubmit={(e) => {
        e.preventDefault();
        navigate(e.currentTarget);
      }}
      className="mx-auto grid max-w-5xl grid-cols-1 gap-3 px-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
    >
      <label className="sr-only" htmlFor="q">Search courses</label>
      <input
        id="q"
        name="q"
        type="search"
        placeholder="Search courses…"
        defaultValue={searchParams.get("q") ?? ""}
        className={fieldClass}
      />
      <Select name="instrument" label="Instrument" defaultValue={searchParams.get("instrument")} onPick={navigate}>
        <option value="">All instruments</option>
        {INSTRUMENTS.map((i) => <option key={i} value={i}>{i}</option>)}
      </Select>
      <Select name="level" label="Level" defaultValue={searchParams.get("level")} onPick={navigate}>
        <option value="">All levels</option>
        {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
      </Select>
      <Select name="instructor" label="Instructor" defaultValue={searchParams.get("instructor")} onPick={navigate}>
        <option value="">All instructors</option>
        {instructors.map((i) => <option key={i.slug} value={i.slug}>{i.name}</option>)}
      </Select>
      <Select name="sort" label="Sort" defaultValue={searchParams.get("sort")} onPick={navigate}>
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value === "featured" ? "" : value}>{label}</option>
        ))}
      </Select>
      <button
        type="submit"
        className="h-11 rounded-lg bg-teal-600 px-5 text-sm font-semibold text-black transition hover:bg-teal-500 disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Searching…" : "Search"}
      </button>
    </Form>
  );
}

function Select({
  name,
  label,
  defaultValue,
  onPick,
  children,
}: {
  name: string;
  label: string;
  defaultValue: string | null;
  onPick: (form: HTMLFormElement) => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <label className="sr-only" htmlFor={name}>{label}</label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        onChange={(e) => e.currentTarget.form && onPick(e.currentTarget.form)}
        className={fieldClass}
      >
        {children}
      </select>
    </>
  );
}
