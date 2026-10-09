"use client";

import { useActionState } from "react";
import { joinWaitlist } from "@/app/actions/waitlist";
import { INSTRUMENTS } from "@/lib/types";
import type { FormState } from "@/lib/validation";
import { Field, FormMessage } from "./Field";

export function WaitlistForm() {
  const [state, action, pending] = useActionState<FormState<"email" | "instrument">, FormData>(joinWaitlist, {
    status: "idle",
  });

  if (state.status === "success") {
    return <FormMessage status="success">{state.message}</FormMessage>;
  }

  return (
    <form action={action} className="relative z-10 mt-6 space-y-4 text-left" noValidate>
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <div>
        <label htmlFor="instrument" className="block text-sm font-medium text-neutral-200">
          What do you want to learn?
        </label>
        <select
          id="instrument"
          name="instrument"
          defaultValue={state.values?.instrument ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.instrument)}
          aria-describedby={state.fieldErrors?.instrument ? "instrument-error" : undefined}
          className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-teal-600"
        >
          <option value="" disabled>
            Choose an instrument
          </option>
          {[...INSTRUMENTS, "Not sure yet"].map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        {state.fieldErrors?.instrument && (
          <p id="instrument-error" className="mt-1 text-xs text-red-400">{state.fieldErrors.instrument}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-lg bg-teal-500 text-sm font-semibold text-black transition hover:bg-teal-400 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Joining…" : "Join the waitlist"}
      </button>
    </form>
  );
}
