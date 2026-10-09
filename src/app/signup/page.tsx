import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell, FormSkeleton } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" subtitle="Free to join. Enroll in courses and track your progress.">
      <Suspense fallback={<FormSkeleton fields={3} />}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
