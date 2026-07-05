"use client";

import { RouteErrorShell } from "@/components/ui/RouteErrorShell";

export default function StudioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorShell error={error} reset={reset} surface="studio" />;
}
