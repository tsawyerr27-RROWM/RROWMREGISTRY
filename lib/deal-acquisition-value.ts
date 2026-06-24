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

/** Record sale valuation from deal terms when acquisition completes (service role). */
export async function recordAcquisitionDealValue(
  service: SupabaseClient,
  args: {
    deal: DealRow;
    artworkId: string;
    ownershipEventId?: string | null;
  }
): Promise<string | null> {
  const artworkId = String(args.artworkId ?? "").trim();
  const dealId = String(args.deal.id ?? "").trim();
  if (!artworkId || !dealId) return null;

  const price = parseDealPriceTerms(
    args.deal.terms as Record<string, unknown> | null | undefined
  );
  if (!price) return null;

  if (args.ownershipEventId) {
    const { data: oe } = await service
      .from("ownership_events")
      .select("value_event_id, sale_price")
      .eq("id", args.ownershipEventId)
      .maybeSingle();
    if (oe?.value_event_id) return String(oe.value_event_id);
    if (oe?.sale_price != null) return null;
  }

  const now = new Date().toISOString();
  const { data: inserted, error } = await service
    .from("value_events")
    .insert({
      artwork_id: artworkId,
      declared_value: price.amount,
      currency: price.currency,
      value_type: "sale",
      visibility_level: "private",
      ownership_resolved: true,
      created_at: now,
    })
    .select("id")
    .single();

  if (error || !inserted?.id) {
    console.error("[deal-acquisition-value] insert", error?.message);
    return null;
  }

  const valueEventId = String(inserted.id);
  if (args.ownershipEventId) {
    await service
      .from("ownership_events")
      .update({
        value_event_id: valueEventId,
        sale_price: price.amount,
        sale_currency: price.currency,
        sale_date: now,
      })
      .eq("id", args.ownershipEventId);
  }

  return valueEventId;
}
