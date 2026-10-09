"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import type { FormState } from "@/lib/validation";
import { Field, FormMessage } from "./Field";

const initial = { status: "idle" } as const;

function useNext() {
  const next = useSearchParams().get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "";
}

function withNext(path: string, next: string) {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

const submitClass =
  "h-11 w-full rounded-lg bg-teal-500 text-sm font-semibold text-black transition hover:bg-teal-400 disabled:cursor-wait disabled:opacity-60";

/*
 * useActionState wires the form to a Server Action: the form posts even
 * before hydration (progressive enhancement), `pending` drives the button,
 * and the action's return value (field errors, echoed values) comes back as
 * `state` without any client-side fetch code.
 */

export function LoginForm() {
  const next = useNext();
  const [state, action, pending] = useActionState<FormState<"email" | "password">, FormData>(login, initial);

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      {state.message && <FormMessage status="error">{state.message}</FormMessage>}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-neutral-400">
        No account yet?{" "}
        <Link href={withNext("/signup", next)} className="text-teal-400 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const next = useNext();
  const [state, action, pending] = useActionState<FormState<"name" | "email" | "password">, FormData>(
    signup,
    initial
  );

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      {state.message && <FormMessage status="error">{state.message}</FormMessage>}
      <Field
        label="Name"
        name="name"
        autoComplete="name"
        required
        defaultValue={state.values?.name}
        error={state.fieldErrors?.name}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 8 characters, with a letter and a number."
        error={state.fieldErrors?.password}
      />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-neutral-400">
        Already have an account?{" "}
        <Link href={withNext("/login", next)} className="text-teal-400 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
