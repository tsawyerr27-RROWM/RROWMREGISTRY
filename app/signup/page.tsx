import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { SignupClient } from "./SignupClient";

function SignupFallback() {
  return (
    <AuthPageShell title="Create account" subtitle="Loading…">
      <p className="text-center text-[14px] text-neutral-500 sm:text-[15px]">
        One moment.
      </p>
    </AuthPageShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupClient />
    </Suspense>
  );
}
