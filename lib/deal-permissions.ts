export function normalizeUuid(value: unknown): string | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  // Basic UUID v4-ish check; DB FK provides final validation.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function isDealParticipant(args: {
  userId: string;
  participantAUserId: string;
  participantBUserId: string;
}): boolean {
  const uid = String(args.userId ?? "").trim();
  return uid === args.participantAUserId || uid === args.participantBUserId;
}

export function otherDealParticipant(args: {
  userId: string;
  participantAUserId: string;
  participantBUserId: string;
}): string | null {
  const uid = String(args.userId ?? "").trim();
  if (uid === args.participantAUserId) return args.participantBUserId;
  if (uid === args.participantBUserId) return args.participantAUserId;
  return null;
}

const RESPONDABLE_DEAL_STATUSES = ["proposed", "under_review", "countered"] as const;

export type RespondableDealStatus = (typeof RESPONDABLE_DEAL_STATUSES)[number];

export function isRespondableDealStatus(
  value: unknown
): value is RespondableDealStatus {
  return (
    typeof value === "string" &&
    (RESPONDABLE_DEAL_STATUSES as readonly string[]).includes(value)
  );
}

/** User who issued the terms currently awaiting a response. */
export function resolveActiveProposalSenderUserId(args: {
  dealStatus: string;
  createdByUserId: string;
  latestRevisionCreatedByUserId?: string | null;
}): string | null {
  const status = String(args.dealStatus ?? "").toLowerCase().trim();
  const createdBy = String(args.createdByUserId ?? "").trim();

  if (status === "countered") {
    const reviser = String(args.latestRevisionCreatedByUserId ?? "").trim();
    return reviser || createdBy || null;
  }

  if (status === "proposed" || status === "under_review") {
    return createdBy || null;
  }

  return null;
}

export function canActorRespondToDealTerms(args: {
  actorUserId: string;
  dealStatus: string;
  participantAUserId: string;
  participantBUserId: string;
  createdByUserId: string;
  latestRevisionCreatedByUserId?: string | null;
}): boolean {
  const status = String(args.dealStatus ?? "").toLowerCase().trim();
  if (!isRespondableDealStatus(status)) return false;

  const actor = String(args.actorUserId ?? "").trim();
  if (
    !isDealParticipant({
      userId: actor,
      participantAUserId: args.participantAUserId,
      participantBUserId: args.participantBUserId,
    })
  ) {
    return false;
  }

  const sender = resolveActiveProposalSenderUserId({
    dealStatus: status,
    createdByUserId: args.createdByUserId,
    latestRevisionCreatedByUserId: args.latestRevisionCreatedByUserId,
  });
  if (!sender) return false;

  return actor !== sender;
}

export function canActorAcceptDealTerms(args: {
  actorUserId: string;
  dealStatus: string;
  participantAUserId: string;
  participantBUserId: string;
  createdByUserId: string;
  latestRevisionCreatedByUserId?: string | null;
}): boolean {
  const status = String(args.dealStatus ?? "").toLowerCase().trim();
  if (status !== "proposed" && status !== "countered" && status !== "under_review") {
    return false;
  }

  return canActorRespondToDealTerms(args);
}

