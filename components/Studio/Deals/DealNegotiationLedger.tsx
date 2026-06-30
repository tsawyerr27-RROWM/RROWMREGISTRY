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

function isMajorTier(tier: DealLedgerEvent["tier"]): boolean {
  return tier === "major" || tier === "terminal";
}

function eventStackSpacing(
  event: DealLedgerEvent,
  index: number,
  events: DealLedgerEvent[]
): string {
  if (index === 0) return "";
  const prev = events[index - 1];
  if (isMajorTier(event.tier) || isMajorTier(prev.tier)) {
    return "mt-8 md:mt-10";
  }
  return "mt-2.5";
}

/** Editorial line length for correspondence and proposal bodies */
const manuscriptBodyClass =
  "max-w-[42rem] text-[15px] leading-[1.75] text-neutral-800 md:text-[16px] md:leading-[1.8]";

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
        <div className="min-w-0 max-w-[42rem]">
          <h4
            className={
              isMinor
                ? "text-[13px] font-medium text-neutral-800"
                : "font-serif text-xl font-normal tracking-tight text-neutral-950 md:text-[1.35rem]"
            }
          >
            {title}
          </h4>
          <p className="mt-1.5 text-[12px] text-neutral-500">
            {actorLabel(userId, event.actorUserId)}
          </p>
        </div>
        <time
          className="shrink-0 text-[11px] tabular-nums text-neutral-500"
          dateTime={event.timestamp}
        >
          {formatTimestamp(event.timestamp)}
        </time>
      </div>

      <p
        className={
          isMinor
            ? `mt-2.5 max-w-[42rem] text-[13px] leading-relaxed text-neutral-700`
            : `mt-4 max-w-[42rem] text-[15px] leading-[1.7] text-neutral-700`
        }
      >
        {event.summary}
      </p>

      {body && event.type !== "message" ? (
        <p
          className={`mt-4 whitespace-pre-wrap border-t border-neutral-900/[0.06] pt-4 ${manuscriptBodyClass}`}
        >
          {body}
        </p>
      ) : null}

      {body && event.type === "message" ? (
        <p className={`mt-3 whitespace-pre-wrap ${manuscriptBodyClass}`}>{body}</p>
      ) : null}

      {event.type === "revision" && event.metadata.revision_number != null ? (
        <p className="mt-4 max-w-[42rem] text-[12px] text-neutral-500">
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
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-2xl font-normal tracking-tight text-neutral-950 md:text-[1.65rem]">
          Negotiation ledger
        </h3>
        <p className="text-[12px] text-neutral-500">{events.length} entries</p>
      </div>

      <div className={`${rrowmDealSurface.ledger} mt-6 md:mt-7`}>
        {events.length === 0 ? (
          <p className="max-w-[42rem] text-[14px] leading-relaxed text-neutral-500">
            No ledger entries recorded yet.
          </p>
        ) : (
          <div>
            {events.map((event, index) => (
              <div key={event.id} className={eventStackSpacing(event, index, events)}>
                <LedgerEventEntry event={event} userId={userId} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`${rrowmDealSurface.correspondence} mt-8 max-w-[42rem] md:mt-10`}>
        <h4 className="font-serif text-lg font-normal tracking-tight text-neutral-950">
          Add correspondence
        </h4>
        <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">
          Record a note in the negotiation ledger. Counterproposals are filed
          separately through the action bar.
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          className={`${rrowmEconomicSurface.input} mt-4 min-h-[6.5rem] resize-y leading-[1.7] placeholder:text-neutral-400`}
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
