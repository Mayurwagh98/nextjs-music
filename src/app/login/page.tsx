import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell, FormSkeleton } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your courses.">
      {/* LoginForm reads ?next= with useSearchParams, so it sits in Suspense. */}
      <Suspense fallback={<FormSkeleton fields={2} />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
