import { Suspense } from "react";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import ResetPasswordClient from "./ResetPasswordClient";

function ResetPasswordFallback() {
  return (
    <AuthPageShell title="Set new password" subtitle="Verifying your session…">
      <p className="text-center text-[14px] text-neutral-500 sm:text-[15px]">
        One moment.
      </p>
    </AuthPageShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
