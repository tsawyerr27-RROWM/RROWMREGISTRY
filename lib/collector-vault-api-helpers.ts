import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCollectorVaultFlags } from "@/lib/collector-vault-access";

export async function artworkIdForRegistryId(
  supabase: SupabaseClient,
  registryId: string
): Promise<string | null> {
  const clean = registryId.trim();
  if (!clean) return null;
  const { data } = await supabase
    .from("artworks")
    .select("id")
    .eq("registry_id", clean)
    .maybeSingle();
  return data?.id ? String(data.id) : null;
}

export async function vaultSessionContext(registryId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      supabase,
      user: null as null,
      artworkId: null as string | null,
      flags: { canView: false, canWrite: false },
    };
  }
  const artworkId = await artworkIdForRegistryId(supabase, registryId);
  if (!artworkId) {
    return {
      supabase,
      user,
      artworkId: null as string | null,
      flags: { canView: false, canWrite: false },
    };
  }
  const flags = await getCollectorVaultFlags(supabase, artworkId);
  return { supabase, user, artworkId, flags };
}
