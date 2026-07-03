"use client";

import { useEffect } from "react";

import { reportClientRuntimeError } from "@/lib/runtime-errors-client";

type Props = {
  reset: () => void;
  message?: string;
  error?: Error & { digest?: string };
  surface?: string;
};

export function RouteErrorShell({
  reset,
  message = "This page could not be loaded. Check your connection and try again.",
  error,
  surface = "route",
}: Props) {
  useEffect(() => {
    if (!error) return;
    reportClientRuntimeError(error, { surface });
  }, [error, surface]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 pt-20 text-center">
      <p className="max-w-md text-sm leading-relaxed text-neutral-700">{message}</p>
      <button
        type="button"
        onClick={reset}
        className="v2-cta-secondary mt-6 min-h-[44px] px-6 py-2.5 text-xs"
      >
        Try again
      </button>
    </div>
  );
}
