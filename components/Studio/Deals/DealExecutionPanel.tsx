"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ActivateLicenseModal } from "@/components/Studio/Deals/ActivateLicenseModal";
import { RecordExhibitionModal } from "@/components/Studio/Deals/RecordExhibitionModal";
import { RecordRepresentationModal } from "@/components/Studio/Deals/RecordRepresentationModal";
import { fetchRegistryCsrfToken } from "@/lib/registry-action-security/fetch-csrf";
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
      return "Stewardship transfer has been filed against this acquisition. The continuation remains on the registry ledger.";
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
      return "Record the transfer of stewardship for this accepted acquisition. This uses the existing provenance continuation flow and invites the acquiring participant to accept custody on the registry.";
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
      return "Record transfer of stewardship";
  }
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
      <div className={rrowmDealSurface.sidePanel}>
        <p className="text-[13px] text-neutral-500">Loading execution state.</p>
      </div>
    );
  }

  if (!state?.visible) {
    return null;
  }

  const kind = state.execution_kind;

  const executeAcquisition = async () => {
    setBusy(true);
    setError(null);
    try {
      const csrfToken = await fetchRegistryCsrfToken();
      if (!csrfToken) {
        setError("Could not prepare a secure session. Refresh and try again.");
        return;
      }

      const res = await fetch(executionEndpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({}),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        state?: DealExecutionPanelState;
      };
      if (!res.ok) {
        setError(payload.error || `Could not record transfer (${res.status}).`);
        return;
      }
      if (payload.state) {
        setState(payload.state);
      } else {
        await load();
      }
      onExecuted?.();
    } catch {
      setError("Could not record transfer.");
    } finally {
      setBusy(false);
    }
  };

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
      <div className={rrowmDealSurface.sidePanel}>
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
          Registry execution
        </p>
        <h3 className="mt-2 font-serif text-lg font-normal tracking-tight text-neutral-950">
          Filing on record
        </h3>

        {state.artwork_title ? (
          <p className="mt-2 text-[13px] text-neutral-600">{state.artwork_title}</p>
        ) : null}

        {state.recorded ? (
          <div className="mt-4 space-y-3">
            <p className="text-[14px] leading-relaxed text-neutral-800">
              Execution recorded
            </p>
            <p className="text-[13px] leading-relaxed text-neutral-600">
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
          <div className="mt-4 space-y-4">
            <p className="text-[13px] leading-relaxed text-neutral-600">
              {pendingCopy(kind)}
            </p>

            {state.reason && !state.canInitiate ? (
              <p className="text-[13px] leading-relaxed text-neutral-600">{state.reason}</p>
            ) : null}

            {state.canInitiate ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (kind === "acquisition") {
                    void executeAcquisition();
                    return;
                  }
                  openModal();
                }}
                className={`${rrowmButton.primaryEconomic} w-full`}
              >
                {ctaLabel(kind, busy)}
              </button>
            ) : null}
          </div>
        )}

        {error ? (
          <p className="mt-4 text-[13px] leading-relaxed text-neutral-700">{error}</p>
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
