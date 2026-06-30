import type { SupabaseClient } from "@supabase/supabase-js";

export type ValueCorrectionInput = {
  artworkId: string;
  referencesEventId: string;
  correctedValue: number;
  currency: string;
  reason: string;
  visibilityLevel?: string;
};

/** Append a corrective valuation event (does not mutate the prior row). */
export async function recordValueCorrection(
  client: SupabaseClient,
  input: ValueCorrectionInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data, error } = await client.rpc("add_value_correction", {
    p_artwork_id: input.artworkId,
    p_references_event_id: input.referencesEventId,
    p_corrected_value: input.correctedValue,
    p_currency: String(input.currency || "").toUpperCase(),
    p_reason: input.reason,
    p_visibility_level: input.visibilityLevel ?? "private",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const id =
    data && typeof data === "object" && "id" in data
      ? String((data as { id: string }).id)
      : "";

  if (!id) {
    return { ok: false, error: "Correction was not recorded." };
  }

  return { ok: true, id };
}
