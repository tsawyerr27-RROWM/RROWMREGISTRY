import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DisputeEvidenceSection } from "@/components/disputes/DisputeEvidenceSection";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

export const dynamic = "force-dynamic";

export default async function DisputeViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const disputeId = String(id || "").trim();
  if (!disputeId) {
    redirect("/account");
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  const nextPath = `/disputes/${encodeURIComponent(disputeId)}`;
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return (
    <div className="ds-page-environment relative min-h-screen pb-28 pt-16 text-neutral-900 sm:pt-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-900/10 to-transparent"
        aria-hidden
      />
      <main className="relative mx-auto max-w-[min(100%,88rem)] px-4 sm:px-6 lg:px-8">
        <header className="mt-8 max-w-2xl border-b border-neutral-900/[0.06] pb-8">
          <InfoTooltip text="Review status, add file evidence or external links, and keep materials ready for registry staff. This view is private to you." />
          <h1 className="font-serif text-2xl font-normal tracking-tight text-neutral-950 md:text-[1.75rem]">
            Dispute
          </h1>
        </header>

        <div className="mt-10">
          <DisputeEvidenceSection disputeId={disputeId} />
        </div>
      </main>
    </div>
  );
}

