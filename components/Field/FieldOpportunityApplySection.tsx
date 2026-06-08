"use client";

import { useState } from "react";

import { OpportunityApplicationModal } from "@/components/Field/OpportunityApplicationModal";
import type { FieldOpportunityApplyContext } from "@/lib/field-opportunity-applications";
import { opportunityApplicationStatusLabel } from "@/lib/field-opportunity-applications";

type Props = {
  briefId: string;
  briefTitle: string;
  acceptingResponses: boolean;
  initialApplyContext: FieldOpportunityApplyContext;
};

function formatSubmissionDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function FieldOpportunityApplySection({
  briefId,
  briefTitle,
  acceptingResponses,
  initialApplyContext,
}: Props) {
  const [applyContext, setApplyContext] =
    useState<FieldOpportunityApplyContext>(initialApplyContext);
  const [modalOpen, setModalOpen] = useState(false);

  const showApplyButton =
    applyContext.viewerRole === "artist" &&
    !applyContext.application &&
    acceptingResponses;

  const showSubmittedState =
    applyContext.viewerRole === "artist" && Boolean(applyContext.application);

  if (!showApplyButton && !showSubmittedState) {
    return null;
  }

  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="font-serif text-2xl text-neutral-950">Apply</h2>

      {showSubmittedState && applyContext.application ? (
        <div className="mt-4 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-5">
          <p className="text-sm font-medium text-emerald-950">
            Application submitted
          </p>
          <dl className="mt-4 grid gap-3 text-sm text-emerald-950/90 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-emerald-900/70">
                Submitted
              </dt>
              <dd className="mt-1 font-medium">
                {formatSubmissionDate(applyContext.application.created_at)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-emerald-900/70">
                Status
              </dt>
              <dd className="mt-1 font-medium">
                {opportunityApplicationStatusLabel(applyContext.application.status)}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      {showApplyButton ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex rounded-2xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Apply
          </button>
        </div>
      ) : null}

      <OpportunityApplicationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        opportunityId={briefId}
        opportunityTitle={briefTitle}
        onSubmitted={(application) => {
          setApplyContext((prev) => ({
            ...prev,
            application,
          }));
        }}
      />
    </section>
  );
}
