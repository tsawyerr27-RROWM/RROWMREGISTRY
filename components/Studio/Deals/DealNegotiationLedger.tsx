"use client";

import { useMemo, useState } from "react";

import type { DealLedgerEvent } from "@/lib/deal-ledger-events";
import { buildDealLedgerEvents, dealLedgerEventTitle } from "@/lib/deal-ledger-events";
import type { DealMessageRow, DealRevisionRow, DealRow } from "@/lib/deals";
import { rrowmButton, rrowmDealSurface, rrowmEconomicSurface } from "@/styles/rrowm-theme";

type Props = {
  userId: string;
  deal: DealRow;
  messages: DealMessageRow[];
  revisions: DealRevisionRow[];
  onSendMessage: (body: string) => Promise<void> | void;
};

function formatTimestamp(raw: string): string {
  const d = raw ? new Date(raw) : null;
  if (!d || Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actorLabel(userId: string, actorUserId: string | null): string {
  if (!actorUserId) return "Record";
  if (actorUserId === userId) return "You";
  return `User ${actorUserId.slice(0, 6)}…${actorUserId.slice(-4)}`;
}

function panelClass(tier: DealLedgerEvent["tier"]): string {
  if (tier === "terminal") return rrowmDealSurface.ledgerEventTerminal;
  if (tier === "major") return rrowmDealSurface.ledgerEventMajor;
  return rrowmDealSurface.ledgerEventMinor;
}

function LedgerEventEntry({
  event,
  userId,
}: {
  event: DealLedgerEvent;
  userId: string;
}) {
  const title = dealLedgerEventTitle(event);
  const body = String(event.body ?? "").trim();
  const isMinor = event.tier === "minor";

  return (
    <article className={panelClass(event.tier)}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h4
            className={
              isMinor
                ? "text-[13px] font-medium text-neutral-800"
                : "font-serif text-lg font-normal tracking-tight text-neutral-950"
            }
          >
            {title}
          </h4>
          <p className="mt-1 text-[12px] text-neutral-500">
            {actorLabel(userId, event.actorUserId)}
          </p>
        </div>
        <time
          className="text-[11px] tabular-nums text-neutral-500"
          dateTime={event.timestamp}
        >
          {formatTimestamp(event.timestamp)}
        </time>
      </div>

      <p
        className={
          isMinor
            ? "mt-2 text-[13px] leading-relaxed text-neutral-700"
            : "mt-3 text-[14px] leading-relaxed text-neutral-700"
        }
      >
        {event.summary}
      </p>

      {body && event.type !== "message" ? (
        <p className="mt-3 whitespace-pre-wrap border-t border-neutral-900/[0.06] pt-3 text-[14px] leading-relaxed text-neutral-800">
          {body}
        </p>
      ) : null}

      {body && event.type === "message" ? (
        <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-neutral-800">
          {body}
        </p>
      ) : null}

      {event.type === "revision" && event.metadata.revision_number != null ? (
        <p className="mt-3 text-[12px] text-neutral-500">
          Revision {String(event.metadata.revision_number)} archived on file.
        </p>
      ) : null}
    </article>
  );
}

export function DealNegotiationLedger({
  userId,
  deal,
  messages,
  revisions,
  onSendMessage,
}: Props) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const events = useMemo(
    () => buildDealLedgerEvents({ deal, messages, revisions }),
    [deal, messages, revisions]
  );

  const submit = async () => {
    const body = draft.trim();
    if (!body) return;
    setBusy(true);
    setError(null);
    try {
      await onSendMessage(body);
      setDraft("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not send message.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
          Negotiation ledger
        </h3>
        <p className="text-[12px] text-neutral-500">{events.length} entries</p>
      </div>

      <div
        className={`${rrowmDealSurface.ledger} mt-5 min-h-0 flex-1 overflow-y-auto`}
      >
        {events.length === 0 ? (
          <p className="text-[13px] leading-relaxed text-neutral-500">
            No ledger entries recorded yet.
          </p>
        ) : (
          <div className="space-y-5">
            {events.map((event) => (
              <LedgerEventEntry key={event.id} event={event} userId={userId} />
            ))}
          </div>
        )}
      </div>

      <div className={`${rrowmDealSurface.correspondence} mt-6`}>
        <h4 className="font-serif text-base font-normal tracking-tight text-neutral-950">
          Add correspondence
        </h4>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
          Record a note in the negotiation ledger. Counterproposals are filed
          separately through the action bar.
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className={`${rrowmEconomicSurface.input} min-h-[5.5rem] resize-none leading-relaxed placeholder:text-neutral-400`}
          placeholder="Write correspondence for the ledger."
        />
        {error ? (
          <p className="mt-3 text-[13px] leading-relaxed text-neutral-600">{error}</p>
        ) : null}
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={busy || !draft.trim()}
            onClick={() => void submit()}
            className={rrowmButton.primaryEconomic}
          >
            Send correspondence
          </button>
        </div>
      </div>
    </div>
  );
}
