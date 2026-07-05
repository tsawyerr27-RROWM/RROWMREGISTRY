"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { StudioShell } from "@/components/Studio/StudioShell";
import { StudioDealsWorkspace } from "@/components/Studio/Deals/StudioDealsWorkspace";
import { useStudioActorRole } from "@/hooks/useStudioActorRole";
import { STUDIO_DEALS_NAV_ID } from "@/lib/studio-nav/studio-utility-nav";
import { workspace } from "@/styles/workspace-design";

function StudioDealsContent() {
  const { userId, role, ready } = useStudioActorRole();
  const searchParams = useSearchParams();
  const initialDealId = searchParams.get("deal");

  const atmosphere =
    role === "artist" ? workspace.atmosphere.studio : workspace.atmosphere.environment;

  if (!ready) {
    return (
      <div className={`min-h-[100dvh] ${workspace.atmosphere.environment}`}>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-serif text-3xl font-normal tracking-tight text-neutral-950">
            Deals
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">
            Loading workspace.
          </p>
        </div>
      </div>
    );
  }

  if (!userId || !role) {
    return (
      <div className={`min-h-[100dvh] ${workspace.atmosphere.environment}`}>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-serif text-3xl font-normal tracking-tight text-neutral-950">
            Deals
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
      activeId={STUDIO_DEALS_NAV_ID}
      atmosphereClassName={atmosphere}
      navigateOnSectionSelect
    >
      <StudioDealsWorkspace userId={userId} initialDealId={initialDealId} />
    </StudioShell>
  );
}

export default function StudioDealsPage() {
  return (
    <Suspense
      fallback={
        <div className={`min-h-[100dvh] ${workspace.atmosphere.environment}`}>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="text-[15px] text-neutral-500">Loading deals.</p>
          </div>
        </div>
      }
    >
      <StudioDealsContent />
    </Suspense>
  );
}
