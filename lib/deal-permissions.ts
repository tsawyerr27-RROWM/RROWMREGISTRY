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

