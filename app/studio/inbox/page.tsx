"use client";

import { Suspense } from "react";

import { StudioShell } from "@/components/Studio/StudioShell";
import { NotificationInboxPanel } from "@/components/notifications/NotificationInboxPanel";
import { useStudioActorRole } from "@/hooks/useStudioActorRole";
import { STUDIO_INBOX_NAV_ID } from "@/lib/studio-nav/studio-utility-nav";
import { workspace } from "@/styles/workspace-design";

function StudioInboxContent() {
  const { userId, role, ready } = useStudioActorRole();

  const atmosphere =
    role === "artist" ? workspace.atmosphere.studio : workspace.atmosphere.environment;

  if (!ready || !userId || !role) {
    return (
      <div className={`min-h-[100dvh] ${workspace.atmosphere.environment}`}>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-serif text-3xl font-normal tracking-tight text-neutral-950">
            Inbox
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">
            Loading workspace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <StudioShell
      role={role}
      userId={userId}
      activeId={STUDIO_INBOX_NAV_ID}
      atmosphereClassName={atmosphere}
      navigateOnSectionSelect
    >
      <div className="max-w-3xl">
        <NotificationInboxPanel variant="page" limit={50} />
      </div>
    </StudioShell>
  );
}

export default function StudioInboxPage() {
  return (
    <Suspense
      fallback={
        <div className={`min-h-[100dvh] ${workspace.atmosphere.environment}`}>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="text-[15px] text-neutral-500">Loading inbox.</p>
          </div>
        </div>
      }
    >
      <StudioInboxContent />
    </Suspense>
  );
}
