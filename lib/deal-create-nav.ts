import type { DealIntentId } from "@/lib/deal-intents";

export type NewDealDraftPreset = {
  counterpartyUserId: string | null;
  counterpartyLabel: string | null;
  artworkId: string | null;
  artworkTitle: string | null;
  galleryId: string | null;
  initialIntentId: DealIntentId | null;
};

export type NewDealHrefInput = {
  counterpartyUserId?: string | null;
  counterpartyLabel?: string | null;
  artworkId?: string | null;
  artworkTitle?: string | null;
  galleryId?: string | null;
  initialIntentId?: DealIntentId | null;
};

export function buildStudioNewDealHref(input: NewDealHrefInput = {}): string {
  const params = new URLSearchParams();
  const counterparty = String(input.counterpartyUserId ?? "").trim();
  const label = String(input.counterpartyLabel ?? "").trim();
  const artwork = String(input.artworkId ?? "").trim();
  const artworkTitle = String(input.artworkTitle ?? "").trim();
  const gallery = String(input.galleryId ?? "").trim();
  const intent = String(input.initialIntentId ?? "").trim();

  if (counterparty) params.set("counterparty", counterparty);
  if (label) params.set("counterparty_label", label);
  if (artwork) params.set("artwork", artwork);
  if (artworkTitle) params.set("artwork_title", artworkTitle);
  if (gallery) params.set("gallery", gallery);
  if (intent) params.set("intent", intent);

  const qs = params.toString();
  return qs ? `/studio/deals/new?${qs}` : "/studio/deals/new";
}

export function parseNewDealDraftPreset(
  searchParams: URLSearchParams
): NewDealDraftPreset {
  const intent = String(searchParams.get("intent") ?? "").trim();
  return {
    counterpartyUserId: String(searchParams.get("counterparty") ?? "").trim() || null,
    counterpartyLabel: String(searchParams.get("counterparty_label") ?? "").trim() || null,
    artworkId: String(searchParams.get("artwork") ?? "").trim() || null,
    artworkTitle: String(searchParams.get("artwork_title") ?? "").trim() || null,
    galleryId: String(searchParams.get("gallery") ?? "").trim() || null,
    initialIntentId: (intent || null) as DealIntentId | null,
  };
}
