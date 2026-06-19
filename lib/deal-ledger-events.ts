import type { DealMessageRow, DealRevisionRow, DealRow } from "@/lib/deals";
import { dealStatusLabel } from "@/lib/deal-status";

export type DealLedgerEventType =
  | "created"
  | "proposal_sent"
  | "message"
  | "revision"
  | "status_change";

export type DealLedgerEventTier = "major" | "minor" | "terminal";

export type DealLedgerEvent = {
  id: string;
  type: DealLedgerEventType;
  tier: DealLedgerEventTier;
  timestamp: string;
  actorUserId: string | null;
  summary: string;
  body: string | null;
  metadata: Record<string, unknown>;
};

const TYPE_SORT_ORDER: Record<DealLedgerEventType, number> = {
  created: 0,
  proposal_sent: 1,
  revision: 2,
  message: 3,
  status_change: 4,
};

function parseTime(value: string): number {
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

function isCounterproposalMessage(message: DealMessageRow): boolean {
  return String(message.metadata?.kind ?? "").trim() === "counterproposal";
}

function statusChangeTier(status: string): DealLedgerEventTier {
  const s = String(status ?? "").toLowerCase().trim();
  if (s === "closed" || s === "accepted") return "terminal";
  if (s === "rejected") return "major";
  if (s === "under_review") return "minor";
  if (s === "cancelled") return "major";
  return "minor";
}

function statusChangeSummary(status: string): string {
  const label = dealStatusLabel(status);
  const s = String(status ?? "").toLowerCase().trim();
  if (s === "under_review") return "Record marked under review";
  if (s === "accepted") return label;
  if (s === "rejected") return label;
  if (s === "closed") return label;
  if (s === "cancelled") return "Deal cancelled";
  return `Status recorded: ${label}`;
}

function sortEvents(events: DealLedgerEvent[]): DealLedgerEvent[] {
  return events.slice().sort((a, b) => {
    const ta = parseTime(a.timestamp);
    const tb = parseTime(b.timestamp);
    if (ta !== tb) return ta - tb;
    const oa = TYPE_SORT_ORDER[a.type] ?? 99;
    const ob = TYPE_SORT_ORDER[b.type] ?? 99;
    if (oa !== ob) return oa - ob;
    return a.id.localeCompare(b.id);
  });
}

export function buildDealLedgerEvents(args: {
  deal: DealRow;
  messages: DealMessageRow[];
  revisions: DealRevisionRow[];
}): DealLedgerEvent[] {
  const { deal, messages, revisions } = args;
  const events: DealLedgerEvent[] = [];

  const dealId = String(deal.id ?? "");
  const createdAt = String(deal.created_at ?? "");
  const updatedAt = String(deal.updated_at ?? "");
  const status = String(deal.status ?? "").toLowerCase().trim();
  const createdBy = String(deal.created_by_user_id ?? "").trim() || null;

  events.push({
    id: `${dealId}:created`,
    type: "created",
    tier: "major",
    timestamp: createdAt,
    actorUserId: createdBy,
    summary: "Deal record opened",
    body: null,
    metadata: {
      deal_type: deal.type,
      title: deal.title,
    },
  });

  const orderedMessages = messages
    .slice()
    .sort((a, b) => String(a.created_at ?? "").localeCompare(String(b.created_at ?? "")));

  const correspondenceMessages = orderedMessages.filter((m) => !isCounterproposalMessage(m));
  const firstCorrespondence = correspondenceMessages[0] ?? null;

  if (status !== "draft") {
    const proposalTimestamp =
      String(firstCorrespondence?.created_at ?? "").trim() || updatedAt || createdAt;

    events.push({
      id: `${dealId}:proposal_sent`,
      type: "proposal_sent",
      tier: "major",
      timestamp: proposalTimestamp,
      actorUserId: createdBy,
      summary: dealStatusLabel("proposed"),
      body: firstCorrespondence?.body ?? null,
      metadata: {
        status: "proposed",
        message_id: firstCorrespondence?.id ?? null,
      },
    });
  }

  for (const revision of revisions) {
    const revisionNumber = Number(revision.revision_number ?? 0);
    events.push({
      id: `revision:${revision.id}`,
      type: "revision",
      tier: "major",
      timestamp: String(revision.created_at ?? ""),
      actorUserId: String(revision.created_by_user_id ?? "").trim() || null,
      summary:
        String(revision.summary ?? "").trim() ||
        `Counterproposal issued · revision ${revisionNumber}`,
      body: null,
      metadata: {
        revision_number: revisionNumber,
        status: "countered",
        archived_terms: revision.terms,
      },
    });
  }

  const counterproposalMessageIds = new Set(
    orderedMessages.filter(isCounterproposalMessage).map((m) => m.id)
  );

  const proposalMessageId = events.find((e) => e.type === "proposal_sent")?.metadata
    .message_id as string | null | undefined;

  for (const message of orderedMessages) {
    if (counterproposalMessageIds.has(message.id)) continue;
    if (proposalMessageId && message.id === proposalMessageId) continue;

    events.push({
      id: `message:${message.id}`,
      type: "message",
      tier: "minor",
      timestamp: String(message.created_at ?? ""),
      actorUserId: String(message.sender_user_id ?? "").trim() || null,
      summary: "Correspondence recorded",
      body: String(message.body ?? ""),
      metadata: message.metadata ?? {},
    });
  }

  const inferableStatuses = new Set([
    "under_review",
    "accepted",
    "rejected",
    "closed",
    "cancelled",
  ]);

  const skipSyntheticStatus =
    status === "proposed" ||
    status === "countered" ||
    status === "draft";

  if (
    !skipSyntheticStatus &&
    inferableStatuses.has(status) &&
    updatedAt &&
    updatedAt !== createdAt
  ) {
    events.push({
      id: `${dealId}:status:${status}`,
      type: "status_change",
      tier: statusChangeTier(status),
      timestamp: updatedAt,
      actorUserId: null,
      summary: statusChangeSummary(status),
      body: null,
      metadata: {
        status,
        label: dealStatusLabel(status),
      },
    });
  }

  return sortEvents(events);
}

export function dealLedgerEventTitle(event: DealLedgerEvent): string {
  switch (event.type) {
    case "created":
      return "Deal opened";
    case "proposal_sent":
      return "Proposal issued";
    case "revision":
      return "Counterproposal issued";
    case "message":
      return "Correspondence";
    case "status_change":
      return String(event.metadata.label ?? "Status update");
    default:
      return "Record entry";
  }
}
