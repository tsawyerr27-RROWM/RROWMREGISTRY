"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type { DealMessageRow, DealRevisionRow, DealRow } from "@/lib/deals";
import { isNegotiableDealStatus } from "@/lib/deal-status";
import { acquisitionDealStatusLabel } from "@/lib/acquisition-deal-labels";
import { resolveAcquisitionFilingUiState } from "@/lib/deal-action-state";
import { canActorRespondToDealTerms } from "@/lib/deal-permissions";
import { useAcquisitionDealExecution } from "@/hooks/useAcquisitionDealExecution";
import { primeCreativeSectionFromUrlQuery } from "@/lib/studio-nav/creative-nav";
import { AcquisitionFilingHero } from "@/components/Studio/Deals/AcquisitionFilingHero";
import { CounterProposalModal } from "@/components/Studio/Deals/CounterProposalModal";
import { DealCounterpartyPanel } from "@/components/Studio/Deals/DealCounterpartyPanel";
import { DealExecutionPanel } from "@/components/Studio/Deals/DealExecutionPanel";
import { DealNegotiationLedger } from "@/components/Studio/Deals/DealNegotiationLedger";
import { DealTermsPanel } from "@/components/Studio/Deals/DealTermsPanel";
import { studioV2 } from "@/styles/studio-v2";
import { semanticStampClass } from "@/lib/registry-semantic-signals";
import { triggerConsequenceFeedback } from "@/lib/consequence-feedback-runtime";

type Props = {
  userId: string;
  deal: DealRow | null;
  onDealUpdated: () => void;
};

type DealDetailPayload = {
  deal: DealRow;
  messages: DealMessageRow[];
  revisions: DealRevisionRow[];
};

function counterpartyUserId(userId: string, deal: DealRow): string | null {
  const a = String(deal.participant_a_user_id ?? "").trim();
  const b = String(deal.participant_b_user_id ?? "").trim();
  const other = userId === a ? b : userId === b ? a : "";
  return other || null;
}

function titleLine(deal: DealRow): string {
  const title = String(deal.title ?? "").trim();
  if (title) return title;
  const type = String(deal.type ?? "").trim();
  return type ? type[0]?.toUpperCase() + type.slice(1) : "Deal";
}

export function DealWorkspace({ userId, deal, onDealUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<DealDetailPayload | null>(null);
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const markedUnderReviewRef = useRef<string | null>(null);
  const currentDealIdRef = useRef<string | null>(deal?.id ?? null);
  currentDealIdRef.current = deal?.id ?? null;

  const dealId = deal?.id ?? null;
  const isAcquisitionDeal =
    String(deal?.type ?? "").toLowerCase() === "acquisition" &&
    Boolean(deal?.artwork_id);
  const acquisitionExecution = useAcquisitionDealExecution(
    dealId,
    isAcquisitionDeal
  );

  const refresh = async () => {
    const requestedDealId = dealId;
    if (!requestedDealId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/deals/${encodeURIComponent(requestedDealId)}`,
        {
          credentials: "include",
        }
      );
      const payload = (await res.json().catch(() => ({}))) as Partial<
        DealDetailPayload
      > & { error?: string };
      if (requestedDealId !== currentDealIdRef.current) return;

      if (!res.ok || !payload.deal) {
        setDetail(null);
        setError(payload.error || `Could not load deal (${res.status}).`);
        return;
      }
      setDetail({
        deal: payload.deal as DealRow,
        messages: Array.isArray(payload.messages)
          ? (payload.messages as DealMessageRow[])
          : [],
        revisions: Array.isArray(payload.revisions)
          ? (payload.revisions as DealRevisionRow[])
          : [],
      });
    } catch {
      if (requestedDealId !== currentDealIdRef.current) return;
      setDetail(null);
      setError("Could not load deal.");
    } finally {
      if (requestedDealId === currentDealIdRef.current) {
        setLoading(false);
      }
    }
  };

  const afterDealMutation = async (executingDealId: string | null) => {
    if (!executingDealId || executingDealId !== currentDealIdRef.current) {
      return;
    }
    await refresh();
    onDealUpdated();
  };

  useEffect(() => {
    setDetail(null);
    void refresh();
    markedUnderReviewRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  const activeDeal =
    detail?.deal?.id === dealId ? detail.deal : deal;

  const header = useMemo(() => {
    const d = activeDeal;
    if (!d) return null;

    const dealType = String(d.type ?? "").trim();
    const status = String(d.status ?? "").trim();
    const statusLabel = acquisitionDealStatusLabel(d);

    const ribbonLeft =
      dealType
        ? `${dealType[0]?.toUpperCase()}${dealType.slice(1)} proposal`
        : "Deal proposal";

    return {
      title: titleLine(d),
      type: dealType
        ? `${dealType[0]?.toUpperCase()}${dealType.slice(1)}`
        : "",
      status: statusLabel,
      ribbon: `${ribbonLeft} · ${statusLabel}`,
      counterpartyUserId: counterpartyUserId(userId, d),
    };
  }, [activeDeal, userId]);

  const sendMessage = async (body: string) => {
    if (!dealId) return;
    setError(null);
    const res = await fetch(`/api/deals/${encodeURIComponent(dealId)}/message`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(payload.error || `Could not send message (${res.status}).`);
      return;
    }
    await refresh();
    onDealUpdated();
  };

  const transitionStatus = async (nextStatus: string) => {
    if (!dealId) return;
    setError(null);
    const res = await fetch(`/api/deals/${encodeURIComponent(dealId)}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(payload.error || `Could not update status (${res.status}).`);
      return;
    }
    await refresh();
    onDealUpdated();
  };

  useEffect(() => {
    if (!detail?.deal || loading) return;
    const d = detail.deal;
    const currentStatus = String(d.status ?? "").toLowerCase().trim();
    const isIncoming = String(d.created_by_user_id ?? "") !== userId;
    if (currentStatus !== "proposed" || !isIncoming) return;
    if (markedUnderReviewRef.current === d.id) return;
    markedUnderReviewRef.current = d.id;
    void transitionStatus("under_review");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.deal?.id, detail?.deal?.status, userId, loading]);

  const acquisitionUi = useMemo(() => {
    if (!isAcquisitionDeal || !deal) return null;
    const resolved = activeDeal?.id === dealId ? activeDeal : deal;
    if (!resolved) return null;
    return resolveAcquisitionFilingUiState({
      deal: resolved,
      userId,
      executionState: acquisitionExecution.executionState,
      loadingExecution: acquisitionExecution.loadingExecution,
    });
  }, [
    isAcquisitionDeal,
    deal,
    activeDeal,
    dealId,
    userId,
    acquisitionExecution.executionState,
    acquisitionExecution.loadingExecution,
  ]);

  if (!deal) {
    return (
      <section
        className={`${studioV2.surface.filingSheetMajor} flex min-h-[22rem] flex-col items-center justify-center px-8 py-16 text-center`}
        aria-label="Deal workspace"
      >
        <h2 className={studioV2.type.sectionTitle}>Select a deal</h2>
        <p className={`${studioV2.type.metaValue} mt-3 max-w-sm`}>
          Choose an item from the inbox to open the negotiation record.
        </p>
      </section>
    );
  }

  const status = String(activeDeal?.status ?? "").toLowerCase().trim();
  const negotiable = isNegotiableDealStatus(status);
  const resolvedDeal = activeDeal ?? deal;
  const latestRevision = detail?.revisions?.[0] ?? null;
  const canRespondToTerms =
    Boolean(resolvedDeal) &&
    negotiable &&
    canActorRespondToDealTerms({
      actorUserId: userId,
      dealStatus: status,
      participantAUserId: String(resolvedDeal.participant_a_user_id ?? ""),
      participantBUserId: String(resolvedDeal.participant_b_user_id ?? ""),
      createdByUserId: String(resolvedDeal.created_by_user_id ?? ""),
      latestRevisionCreatedByUserId: latestRevision?.created_by_user_id ?? null,
    });

  const actionButtons: {
    key: string;
    label: string;
    tone: "primary" | "neutral";
    action: () => void;
  }[] = [];

  if (status === "draft") {
    actionButtons.push({
      key: "send",
      label: "Send proposal",
      tone: "primary",
      action: () => void transitionStatus("proposed"),
    });
  } else if (negotiable && canRespondToTerms) {
    actionButtons.push(
      {
        key: "accept",
        label: "Accept terms",
        tone: "primary",
        action: () => void transitionStatus("accepted"),
      },
      {
        key: "decline",
        label: "Decline",
        tone: "neutral",
        action: () => void transitionStatus("rejected"),
      },
      {
        key: "counter",
        label: "Counter proposal",
        tone: "neutral",
        action: () => setCounterModalOpen(true),
      }
    );
  } else if (status === "accepted" && !isAcquisitionDeal) {
    actionButtons.push({
      key: "complete",
      label: "Mark deal closed",
      tone: "primary",
      action: () => void transitionStatus("closed"),
    });
  }

  const acquisitionHeaderAction =
    isAcquisitionDeal && status === "accepted"
      ? acquisitionUi?.headerAction
      : null;

  const handleAcquisitionFileTransfer = async () => {
    const executingDealId = dealId;
    const ok = await acquisitionExecution.executeAcquisition();
    if (!ok) return;
    triggerConsequenceFeedback("marketCommit");
    await afterDealMutation(executingDealId);
  };

  return (
    <section
      className={`${studioV2.surface.commandCenter} min-w-0 w-full`}
      aria-label="Selected deal"
    >
      <div className={`${studioV2.surface.filingSheetMajor} relative min-w-0 w-full`}>
        <div className="border-b border-[var(--v2-border)] px-6 py-5 md:px-8 md:py-6">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <p className={studioV2.type.railLabel}>Negotiation record</p>
              <h2 className={`${studioV2.type.commandTitle} mt-2 truncate text-2xl md:text-[1.85rem]`}>
                {header?.title ?? "Deal"}
              </h2>
              <p className={`${studioV2.type.metaValue} mt-2`}>
                {header?.ribbon ?? "Negotiation record"}
              </p>
            </div>
            <div className={`${studioV2.surface.filingSheet} shrink-0 px-4 py-3 text-right`}>
              <span
                className={semanticStampClass(
                  isAcquisitionDeal ? "sale" : "registration"
                )}
              >
                {header?.type ?? "Deal"}
              </span>
              <p className={`${studioV2.type.inboxItem} mt-2`}>{header?.status ?? ""}</p>
            </div>
          </div>

          {loading ? (
            <p className={`${studioV2.type.metaValue} mt-4`}>Loading record.</p>
          ) : null}
          {error ? (
            <p className={`${studioV2.type.metaValue} mt-4`}>{error}</p>
          ) : null}
        </div>

        <div className="border-b border-[var(--v2-border)] px-6 py-4 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className={studioV2.type.metaLabel}>Status actions file to the ledger</p>
            <div className="flex flex-wrap gap-2">
              {actionButtons.length > 0 ? (
                actionButtons.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={a.action}
                    className={
                      a.tone === "primary"
                        ? "v2-cta-primary !min-h-0 px-4 py-2.5 text-[10px]"
                        : "v2-cta-secondary !min-h-0 px-4 py-2.5 text-[10px]"
                    }
                  >
                    {a.label}
                  </button>
                ))
              ) : acquisitionHeaderAction?.kind === "file_transfer" ? (
                <button
                  type="button"
                  disabled={acquisitionExecution.busy}
                  onClick={() => void handleAcquisitionFileTransfer()}
                  className="v2-cta-primary !min-h-0 px-4 py-2.5 text-[10px]"
                >
                  {acquisitionExecution.busy
                    ? "Filing transfer…"
                    : "File transfer on record"}
                </button>
              ) : acquisitionHeaderAction?.kind === "confirm_receipt" ? (
                <Link
                  href={acquisitionHeaderAction.href}
                  onClick={() => {
                    triggerConsequenceFeedback("custodyCommit");
                  }}
                  className="v2-cta-primary !min-h-0 px-4 py-2.5 text-[10px]"
                >
                  {acquisitionHeaderAction.label}
                </Link>
              ) : acquisitionHeaderAction?.kind === "verify_artwork" ? (
                <Link
                  href={acquisitionHeaderAction.href}
                  onClick={() => {
                    if (!resolvedDeal.artwork_id) {
                      primeCreativeSectionFromUrlQuery();
                    }
                  }}
                  className="v2-cta-secondary !min-h-0 px-4 py-2.5 text-[10px]"
                >
                  Verify artwork
                </Link>
              ) : acquisitionHeaderAction?.kind === "ownership_recorded" ? (
                <span className={semanticStampClass("transfer")}>
                  Ownership recorded
                </span>
              ) : isAcquisitionDeal &&
                status === "accepted" &&
                acquisitionExecution.loadingExecution ? (
                <p className={studioV2.type.metaValue}>Loading filing status…</p>
              ) : (
                <p className={studioV2.type.metaValue}>No actions available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="studio-deal-command-center__grid mt-6 min-w-0 w-full">
        <div className="studio-deal-command-center__main min-w-0 flex flex-col gap-6">
          {isAcquisitionDeal ? (
            <AcquisitionFilingHero
              deal={resolvedDeal}
              userId={userId}
              execution={acquisitionExecution}
              onExecuted={(executingDealId) => {
                void afterDealMutation(executingDealId);
              }}
            />
          ) : null}

          <div className={`${studioV2.surface.ledger} ${studioV2.surface.filingSheet} relative min-w-0 w-full p-6 md:p-8`}>
            <DealNegotiationLedger
              userId={userId}
              deal={resolvedDeal}
              messages={detail?.messages ?? []}
              revisions={detail?.revisions ?? []}
              onSendMessage={sendMessage}
            />
          </div>

          <div className="grid min-w-0 w-full grid-cols-1 gap-6 md:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
            <DealCounterpartyPanel
              counterpartyUserId={header?.counterpartyUserId ?? null}
            />
            <DealTermsPanel deal={resolvedDeal} />
          </div>
        </div>

        <aside className={`${studioV2.surface.executionRail} relative min-w-0`}>
          <p className={studioV2.type.railLabel}>Execution</p>
          <div
            className={`${studioV2.surface.filingSheetMajor} relative mt-4 min-h-0 min-w-0 w-full p-5 md:p-6`}
          >
            <DealExecutionPanel
              deal={resolvedDeal}
              onExecuted={() => {
                void refresh();
                onDealUpdated();
              }}
            />
          </div>
        </aside>
      </div>

      {negotiable && canRespondToTerms ? (
        <CounterProposalModal
          isOpen={counterModalOpen}
          onClose={() => setCounterModalOpen(false)}
          deal={resolvedDeal}
          onSubmitted={() => {
            void refresh();
            onDealUpdated();
          }}
        />
      ) : null}
    </section>
  );
}
