import type { DealStatus, DealType } from "@/lib/deal-status";

export type DealRow = {
  id: string;
  created_at: string;
  updated_at: string;
  type: DealType | string;
  status: DealStatus | string;
  created_by_user_id: string;
  participant_a_user_id: string;
  participant_b_user_id: string;
  artwork_id: string | null;
  gallery_id: string | null;
  title: string | null;
  terms: Record<string, unknown>;
};

export type DealMessageRow = {
  id: string;
  deal_id: string;
  sender_user_id: string;
  body: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type DealRevisionRow = {
  id: string;
  deal_id: string;
  revision_number: number;
  created_by_user_id: string;
  terms: Record<string, unknown>;
  summary: string | null;
  created_at: string;
};

export function mapDealRow(row: Record<string, unknown>): DealRow {
  return {
    id: String(row.id ?? ""),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
    type: String(row.type ?? ""),
    status: String(row.status ?? ""),
    created_by_user_id: String(row.created_by_user_id ?? ""),
    participant_a_user_id: String(row.participant_a_user_id ?? ""),
    participant_b_user_id: String(row.participant_b_user_id ?? ""),
    artwork_id: row.artwork_id ? String(row.artwork_id) : null,
    gallery_id: row.gallery_id ? String(row.gallery_id) : null,
    title: row.title != null ? String(row.title) : null,
    terms:
      row.terms && typeof row.terms === "object" && !Array.isArray(row.terms)
        ? (row.terms as Record<string, unknown>)
        : {},
  };
}

export function mapDealMessageRow(row: Record<string, unknown>): DealMessageRow {
  return {
    id: String(row.id ?? ""),
    deal_id: String(row.deal_id ?? ""),
    sender_user_id: String(row.sender_user_id ?? ""),
    body: String(row.body ?? ""),
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    created_at: String(row.created_at ?? ""),
  };
}

export function mapDealRevisionRow(row: Record<string, unknown>): DealRevisionRow {
  return {
    id: String(row.id ?? ""),
    deal_id: String(row.deal_id ?? ""),
    revision_number: Number(row.revision_number ?? 0),
    created_by_user_id: String(row.created_by_user_id ?? ""),
    terms:
      row.terms && typeof row.terms === "object" && !Array.isArray(row.terms)
        ? (row.terms as Record<string, unknown>)
        : {},
    summary: row.summary != null ? String(row.summary) : null,
    created_at: String(row.created_at ?? ""),
  };
}

