import type { SupabaseClient } from "@supabase/supabase-js";

import type { DealRow } from "@/lib/deals";

export type DealPriceTerms = {
  amount: number;
  currency: string;
};

export function parseDealPriceTerms(
  terms: Record<string, unknown> | null | undefined
): DealPriceTerms | null {
  if (!terms || typeof terms !== "object" || Array.isArray(terms)) return null;

  const rawAmount = terms.price ?? terms.amount ?? terms.purchase_price;
  const amount =
    rawAmount != null && !Number.isNaN(Number(rawAmount))
      ? Number(rawAmount)
      : null;
  if (amount == null || amount <= 0) return null;

  const currency = String(
    terms.currency ?? terms.price_currency ?? "USD"
  )
    .trim()
    .toUpperCase();
  if (!currency) return null;

  return { amount, currency };
}

export function isSaleLikeValueType(valueType: string | null | undefined): boolean {
  const v = String(valueType || "")
    .toLowerCase()
    .trim()
    .replaceAll("_", " ");
  return (
    v === "sale" ||
    v === "sale value" ||
    v === "auction" ||
    v === "primary sale" ||
    v === "secondary sale"
  );
}

/** Record sale valuation from deal terms when acquisition completes (service role). */
export async function recordAcquisitionDealValue(
  service: SupabaseClient,
  args: {
    deal: DealRow;
    artworkId: string;
    ownershipEventId?: string | null;
    sellerUserId?: string | null;
    buyerUserId?: string | null;
    completedAt?: string | null;
  }
): Promise<string | null> {
  const artworkId = String(args.artworkId ?? "").trim();
  const dealId = String(args.deal.id ?? "").trim();
  if (!artworkId || !dealId) return null;

  const price = parseDealPriceTerms(
    args.deal.terms as Record<string, unknown> | null | undefined
  );
  if (!price) return null;

  const { data: existingDealValue } = await service
    .from("value_events")
    .select("id")
    .eq("artwork_id", artworkId)
    .eq("source", "deal_execution")
    .eq("metadata->>deal_id", dealId)
    .maybeSingle();

  if (existingDealValue?.id) {
    return String(existingDealValue.id);
  }

  let recordedAt = String(args.completedAt ?? "").trim() || new Date().toISOString();
  let ownershipEventId = args.ownershipEventId ?? null;

  if (ownershipEventId) {
    const { data: oe } = await service
      .from("ownership_events")
      .select("value_event_id, created_at")
      .eq("id", ownershipEventId)
      .maybeSingle();

    if (oe?.value_event_id) {
      return String(oe.value_event_id);
    }
    if (oe?.created_at) {
      recordedAt = String(oe.created_at);
    }
  }

  const sellerId =
    String(args.sellerUserId ?? "").trim() ||
    String(args.deal.participant_a_user_id ?? "").trim() ||
    null;
  const buyerId =
    String(args.buyerUserId ?? "").trim() ||
    String(args.deal.participant_b_user_id ?? "").trim() ||
    null;

  const metadata = {
    acquisition: true,
    deal_id: dealId,
    seller_id: sellerId,
    buyer_id: buyerId,
  };

  const { data: inserted, error } = await service
    .from("value_events")
    .insert({
      artwork_id: artworkId,
      declared_value: price.amount,
      currency: price.currency,
      value_type: "sale_value",
      visibility_level: "private",
      ownership_resolved: true,
      source: "deal_execution",
      metadata,
      note: `Acquisition consideration recorded (deal ${dealId}).`,
      created_at: recordedAt,
    })
    .select("id")
    .single();

  if (error || !inserted?.id) {
    console.error("[deal-acquisition-value] insert", error?.message);
    return null;
  }

  const valueEventId = String(inserted.id);
  if (ownershipEventId) {
    await service
      .from("ownership_events")
      .update({
        value_event_id: valueEventId,
        sale_price: price.amount,
        sale_currency: price.currency,
        sale_date: recordedAt,
      })
      .eq("id", ownershipEventId);
  }

  return valueEventId;
}
