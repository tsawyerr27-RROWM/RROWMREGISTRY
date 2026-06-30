"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ActivateLicenseModal } from "@/components/Studio/Deals/ActivateLicenseModal";
import { RecordExhibitionModal } from "@/components/Studio/Deals/RecordExhibitionModal";
import { RecordRepresentationModal } from "@/components/Studio/Deals/RecordRepresentationModal";
import {
  dealExecutionKind,
  type DealExecutionKind,
  type DealExecutionPanelState,
} from "@/lib/deal-execution";
import type { DealRow } from "@/lib/deals";
import { rrowmButton, rrowmDealSurface } from "@/styles/rrowm-theme";

type Props = {
  deal: DealRow;
  onExecuted?: () => void;
};

function executionEndpointFor(kind: DealExecutionKind | null, dealId: string): string {
  const base = `/api/deals/${encodeURIComponent(dealId)}/execution`;
  if (kind === "exhibition") return `${base}/exhibition`;
  if (kind === "representation") return `${base}/representation`;
  if (kind === "licensing") return `${base}/licensing`;
  return base;
}

function recordedCopy(kind: DealExecutionKind | null): string {
  switch (kind) {
    case "exhibition":
      return "This exhibition has been filed on the registry chronology for the linked work.";
    case "representation":
      return "The artist–organisation relationship is on file from this accepted deal.";
    case "licensing":
      return "The rights license is on file in the canonical rights ledger.";
    default:
      return "Transfer initiated. Ownership on the registry ledger updates when the buyer confirms receipt.";
  }
}

function pendingCopy(kind: DealExecutionKind | null): string {
  switch (kind) {
    case "exhibition":
      return "Record this accepted exhibition as a provenance milestone on the registry chronology.";
    case "representation":
      return "Record the active representation relationship between the artist and organisation for this accepted deal.";
    case "licensing":
      return "Activate the rights grant for this accepted licensing deal and file it on the rights ledger.";
    default:
      return "Execute the acquisition transfer. The buyer will see a pending acquisition immediately and can confirm receipt to complete ownership.";
  }
}

function ctaLabel(kind: DealExecutionKind | null, busy: boolean): string {
  if (busy) return "Recording execution…";
  switch (kind) {
    case "exhibition":
      return "Record exhibition";
    case "representation":
      return "Record representation";
    case "licensing":
      return "Activate license";
    default:
      return "Execute transfer";
  }
}

function ownershipLoopTitle(
  loop: NonNullable<DealExecutionPanelState["ownership_loop"]>
): string {
  if (loop.status === "completed") return "Transfer complete";
  if (loop.role === "buyer") return "Confirm receipt";
  return "Transfer initiated";
}

export function DealExecutionPanel({ deal, onExecuted }: Props) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<DealExecutionPanelState | null>(null);
  const [exhibitionModalOpen, setExhibitionModalOpen] = useState(false);
  const [representationModalOpen, setRepresentationModalOpen] = useState(false);
  const [licensingModalOpen, setLicensingModalOpen] = useState(false);

  const executionKind = useMemo(() => dealExecutionKind(deal), [deal]);
  const executionEndpoint = useMemo(
    () => executionEndpointFor(executionKind, deal.id),
    [deal.id, executionKind]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(executionEndpoint, {
        credentials: "include",
      });
      const payload = (await res.json().catch(() => ({}))) as DealExecutionPanelState & {
        error?: string;
      };
      if (!res.ok) {
        setState(null);
        setError(payload.error || `Could not load execution state (${res.status}).`);
        return;
      }
      setState(payload);
    } catch {
      setState(null);
      setError("Could not load execution state.");
    } finally {
      setLoading(false);
    }
  }, [executionEndpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className={rrowmDealSurface.referencePanel}>
        <p className="text-[12px] text-neutral-500">Loading execution state.</p>
      </div>
    );
  }

  if (!state?.visible) {
    return null;
  }

  const kind = state.execution_kind;

  if (kind === "acquisition") {
    return null;
  }

  const openModal = () => {
    if (kind === "exhibition") {
      setExhibitionModalOpen(true);
      return;
    }
    if (kind === "representation") {
      setRepresentationModalOpen(true);
      return;
    }
    if (kind === "licensing") {
      setLicensingModalOpen(true);
    }
  };

  return (
    <>
      <div className={rrowmDealSurface.referencePanel}>
        <h3 className="font-serif text-base font-normal tracking-tight text-neutral-950">
          Filing on record
        </h3>
        <p className="mt-1 text-[12px] text-neutral-500">Registry execution</p>

        {state.artwork_title ? (
          <p className="mt-2 text-[12px] leading-relaxed text-neutral-600">
            {state.artwork_title}
          </p>
        ) : null}

        {state.ownership_loop ? (
          <div className="mt-3 space-y-3 rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/70 via-white to-white p-4 shadow-[0_8px_24px_-16px_rgba(120,90,40,0.16)]">
            <p className="text-[13px] font-medium text-neutral-900">
              {ownershipLoopTitle(state.ownership_loop)}
            </p>
            <p className="text-[12px] leading-relaxed text-neutral-600">
              {state.ownership_loop.message}
            </p>
            {state.ownership_loop.action_href &&
            state.ownership_loop.action_label ? (
              <Link
                href={state.ownership_loop.action_href}
                className={`${rrowmButton.primaryEconomic} inline-flex w-full justify-center sm:w-auto`}
              >
                {state.ownership_loop.action_label}
              </Link>
            ) : null}
          </div>
        ) : null}

        {state.recorded ? (
          <div className="mt-3 space-y-2">
            <p className="text-[13px] font-medium text-neutral-800">
              {state.ownership_loop?.status === "completed"
                ? "Execution complete"
                : "Execution recorded"}
            </p>
            <p className="text-[12px] leading-relaxed text-neutral-600">
              {recordedCopy(kind)}
            </p>
            {kind === "licensing" && state.rights_ledger_href ? (
              <Link
                href={state.rights_ledger_href}
                className="inline-flex text-[13px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
              >
                View rights ledger
              </Link>
            ) : state.ledger_href ? (
              <Link
                href={state.ledger_href}
                className="inline-flex text-[13px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
              >
                View registry ledger
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-[12px] leading-relaxed text-neutral-600">{pendingCopy(kind)}</p>

            {state.reason && !state.canInitiate ? (
              <p className="text-[12px] leading-relaxed text-neutral-600">{state.reason}</p>
            ) : null}

            {state.canInitiate ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => openModal()}
                className={`${rrowmButton.primaryEconomic} w-full sm:w-auto`}
              >
                {ctaLabel(kind, busy)}
              </button>
            ) : null}
          </div>
        )}

        {error ? (
          <p className="mt-3 text-[12px] leading-relaxed text-neutral-700">{error}</p>
        ) : null}
      </div>

      {kind === "exhibition" ? (
        <RecordExhibitionModal
          isOpen={exhibitionModalOpen}
          onClose={() => setExhibitionModalOpen(false)}
          deal={deal}
          onRecorded={(nextState) => {
            setState(nextState);
            onExecuted?.();
          }}
        />
      ) : null}

      {kind === "representation" ? (
        <RecordRepresentationModal
          isOpen={representationModalOpen}
          onClose={() => setRepresentationModalOpen(false)}
          deal={deal}
          onRecorded={(nextState) => {
            setState(nextState);
            onExecuted?.();
          }}
        />
      ) : null}

      {kind === "licensing" ? (
        <ActivateLicenseModal
          isOpen={licensingModalOpen}
          onClose={() => setLicensingModalOpen(false)}
          deal={deal}
          onRecorded={(nextState) => {
            setState(nextState);
            onExecuted?.();
          }}
        />
      ) : null}
    </>
  );
}
