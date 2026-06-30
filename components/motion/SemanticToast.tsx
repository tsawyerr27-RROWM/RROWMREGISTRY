"use client";

import type { RegistrySemanticEvent } from "@/lib/registry-semantic-signals";
import { semanticMotionClassForEvent } from "@/styles/semantic-motion";

type Props = {
  message: string;
  event: RegistrySemanticEvent;
  className?: string;
};

/** Filing confirmation toast — inherits semantic motion from registry event type */
export function SemanticToast({ message, event, className = "" }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-6 top-24 z-[120] max-w-sm rounded-2xl border border-[var(--v2-border)] bg-white px-4 py-3 text-sm leading-snug text-[var(--v2-ink)] shadow-[var(--v2-shadow-glass-float)] ${semanticMotionClassForEvent(event)} ${className}`}
    >
      {message}
    </div>
  );
}
