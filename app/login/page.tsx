import { Suspense } from "react";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginClient } from "./LoginClient";

function LoginFallback() {
  return (
    <AuthPageShell
      title="Sign in"
      subtitle="Loading…"
      showAccessRail={false}
      showEnterRail={false}
      showEnterBody={false}
    >
      <p className="text-center text-[14px] text-neutral-500 sm:text-[15px]">
        One moment.
      </p>
    </AuthPageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}
