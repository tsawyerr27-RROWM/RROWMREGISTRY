"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { DealEditorWorkspace } from "@/components/Studio/Deals/DealEditorWorkspace";
import { StudioShell } from "@/components/Studio/StudioShell";
import { useStudioActorRole } from "@/hooks/useStudioActorRole";
import { parseNewDealDraftPreset } from "@/lib/deal-create-nav";
import { STUDIO_DEALS_NAV_ID } from "@/lib/studio-nav/studio-utility-nav";
import { workspace } from "@/styles/workspace-design";

function StudioNewDealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId, role, ready } = useStudioActorRole();
  const preset = parseNewDealDraftPreset(searchParams);

  const atmosphere =
    role === "artist" ? workspace.atmosphere.studio : workspace.atmosphere.environment;

  if (!ready || !userId || !role) {
    return (
      <div className={`min-h-[100dvh] ${workspace.atmosphere.environment}`}>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-serif text-3xl font-normal tracking-tight text-neutral-950">
            New deal
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
      <DealEditorWorkspace
        userId={userId}
        preset={preset}
        onBack={() => router.push("/studio/deals")}
      />
    </StudioShell>
  );
}

export default function StudioNewDealPage() {
  return (
    <Suspense
      fallback={
        <div className={`min-h-[100dvh] ${workspace.atmosphere.environment}`}>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="text-[15px] text-neutral-500">Loading proposal editor.</p>
          </div>
        </div>
      }
    >
      <StudioNewDealContent />
    </Suspense>
  );
}
