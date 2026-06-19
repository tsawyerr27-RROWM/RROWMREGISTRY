"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { DealMessageRow, DealRevisionRow, DealRow } from "@/lib/deals";
import { isNegotiableDealStatus, dealStatusLabel } from "@/lib/deal-status";
import { CounterProposalModal } from "@/components/Studio/Deals/CounterProposalModal";
import { DealCounterpartyPanel } from "@/components/Studio/Deals/DealCounterpartyPanel";
import { DealExecutionPanel } from "@/components/Studio/Deals/DealExecutionPanel";
import { DealNegotiationLedger } from "@/components/Studio/Deals/DealNegotiationLedger";
import { DealTermsPanel } from "@/components/Studio/Deals/DealTermsPanel";
import { rrowmButton, rrowmDealSurface, rrowmEconomicSurface } from "@/styles/rrowm-theme";

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

  const dealId = deal?.id ?? null;

  const refresh = async () => {
    if (!dealId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/deals/${encodeURIComponent(dealId)}`, {
        credentials: "include",
      });
      const payload = (await res.json().catch(() => ({}))) as Partial<
        DealDetailPayload
      > & { error?: string };
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
      setDetail(null);
      setError("Could not load deal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    markedUnderReviewRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  const activeDeal = detail?.deal ?? deal;

  const header = useMemo(() => {
    const d = activeDeal;
    if (!d) return null;

    const dealType = String(d.type ?? "").trim();
    const status = String(d.status ?? "").trim();

    const ribbonLeft =
      dealType
        ? `${dealType[0]?.toUpperCase()}${dealType.slice(1)} proposal`
        : "Deal proposal";

    return {
      title: titleLine(d),
      type: dealType
        ? `${dealType[0]?.toUpperCase()}${dealType.slice(1)}`
        : "",
      status: dealStatusLabel(status),
      ribbon: `${ribbonLeft} · ${dealStatusLabel(status)}`,
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

  if (!deal) {
    return (
      <section
        className={`${rrowmDealSurface.workspace} flex min-h-[22rem] flex-col items-center justify-center px-8 py-16 text-center`}
        aria-label="Deal workspace"
      >
        <h2 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
          Select a deal
        </h2>
        <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-neutral-500">
          Choose an item from the inbox to review the negotiation ledger.
        </p>
      </section>
    );
  }

  const status = String(activeDeal?.status ?? "").toLowerCase().trim();
  const negotiable = isNegotiableDealStatus(status);
  const resolvedDeal = activeDeal ?? deal;

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
  } else if (negotiable) {
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
  } else if (status === "accepted") {
    actionButtons.push({
      key: "complete",
      label: "Record execution",
      tone: "primary",
      action: () => void transitionStatus("closed"),
    });
  }

  return (
    <section
      className={`${rrowmDealSurface.workspace} relative min-h-0`}
      aria-label="Selected deal"
    >
      <div className="flex min-h-0 flex-col">
        <div className={rrowmDealSurface.header}>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                Negotiation record
              </p>
              <h2 className="mt-2 truncate font-serif text-2xl font-normal tracking-tight text-neutral-950">
                {header?.title ?? "Deal"}
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
                {header?.ribbon ?? ""}
              </p>
            </div>
            <div className="shrink-0 rounded-xl border border-neutral-900/[0.06] bg-white/80 px-4 py-3 text-right shadow-[0_4px_14px_rgba(25,20,10,0.04)]">
              <p className="text-[12px] font-medium text-neutral-800">
                {header?.type ?? ""}
              </p>
              <p className="mt-1 text-[12px] text-neutral-500">{header?.status ?? ""}</p>
            </div>
          </div>

          {loading ? (
            <p className="mt-4 text-[13px] text-neutral-500">Loading record.</p>
          ) : null}
          {error ? (
            <p className="mt-4 text-[13px] leading-relaxed text-neutral-600">{error}</p>
          ) : null}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 px-7 py-8 lg:grid-cols-[1fr_20rem] lg:px-9">
          <div className="min-h-0">
            <DealNegotiationLedger
              userId={userId}
              deal={resolvedDeal}
              messages={detail?.messages ?? []}
              revisions={detail?.revisions ?? []}
              onSendMessage={sendMessage}
            />
          </div>

          <aside className="flex min-h-0 flex-col gap-6">
            <DealCounterpartyPanel
              counterpartyUserId={header?.counterpartyUserId ?? null}
            />
            <DealTermsPanel deal={resolvedDeal} />
            <DealExecutionPanel
              deal={resolvedDeal}
              onExecuted={() => {
                void refresh();
                onDealUpdated();
              }}
            />
          </aside>
        </div>

        <div className={rrowmEconomicSurface.actionBar}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[13px] text-neutral-500">
              Status actions update the record ledger.
            </p>
            <div className="flex flex-wrap gap-2">
              {actionButtons.length === 0 ? (
                <p className="text-[13px] text-neutral-500">No actions available.</p>
              ) : (
                actionButtons.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={a.action}
                    className={
                      a.tone === "primary"
                        ? rrowmButton.primaryEconomic
                        : rrowmButton.secondary
                    }
                  >
                    {a.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {negotiable ? (
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
