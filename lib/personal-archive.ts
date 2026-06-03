import type { SupabaseClient } from "@supabase/supabase-js";

import type { ArchivalProvenanceBundle } from "@/lib/provenance-timeline";
import { verificationContinuitySummaryLines } from "@/lib/registry-continuity";

export const PERSONAL_ARCHIVE_NAV_ID = "personal-archive";

export const PERSONAL_ARCHIVE_SCHEMA_UNAVAILABLE =
  "Personal Archive is not available on this environment yet. Apply database migration 20260531160000_personal_archive.sql (see docs/personal-archive-deployment.md), then reload the Supabase API schema.";

export type ArchiveActionResult =
  | { ok: true; archived: boolean; count: number }
  | { ok: false; error: string; schemaUnavailable?: boolean };

type SupabaseErrorLike = { message?: string; code?: string } | null | undefined;

/** True when artwork_archives / archive RPCs are missing from the database or API cache. */
export function isPersonalArchiveSchemaError(error: SupabaseErrorLike): boolean {
  if (!error) return false;
  const code = String(error.code ?? "");
  const msg = String(error.message ?? "").toLowerCase();
  return (
    code === "PGRST205" ||
    code === "PGRST202" ||
    code === "42P01" ||
    msg.includes("schema cache") ||
    (msg.includes("artwork_archives") &&
      (msg.includes("could not find") ||
        msg.includes("does not exist") ||
        msg.includes("not found")))
  );
}

function schemaUnavailableResult(): ArchiveActionResult {
  return {
    ok: false,
    error: PERSONAL_ARCHIVE_SCHEMA_UNAVAILABLE,
    schemaUnavailable: true,
  };
}

/** Aggregate count via RPC — never loads archive members. */
export async function getArtworkArchiveCount(
  supabase: SupabaseClient,
  artworkId: string
): Promise<number> {
  const { data, error } = await supabase.rpc("get_artwork_archive_count", {
    p_artwork_id: artworkId,
  });
  if (error) {
    if (!isPersonalArchiveSchemaError(error)) {
      console.warn("[personal-archive] getArtworkArchiveCount", error.message);
    }
    return 0;
  }
  const n = Number(data);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export async function getArtworkArchiveCountsBatch(
  supabase: SupabaseClient,
  artworkIds: string[]
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (artworkIds.length === 0) return out;

  const { data, error } = await supabase.rpc("get_artwork_archive_counts_batch", {
    p_artwork_ids: artworkIds,
  });
  if (error) {
    if (!isPersonalArchiveSchemaError(error)) {
      console.warn("[personal-archive] batch counts", error.message);
    }
    return out;
  }
  for (const row of data ?? []) {
    const id = String((row as { artwork_id?: string }).artwork_id ?? "");
    const count = Number((row as { archive_count?: number }).archive_count ?? 0);
    if (id) out.set(id, Number.isFinite(count) ? count : 0);
  }
  return out;
}

export async function isArtworkArchived(
  supabase: SupabaseClient,
  artworkId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("artwork_archives")
    .select("id")
    .eq("artwork_id", artworkId)
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    if (!isPersonalArchiveSchemaError(error)) {
      console.warn("[personal-archive] isArtworkArchived", error.message);
    }
    return false;
  }
  return Boolean(data?.id);
}

export async function archiveArtwork(
  supabase: SupabaseClient,
  artworkId: string,
  userId: string
): Promise<ArchiveActionResult> {
  const { error } = await supabase.from("artwork_archives").insert({
    artwork_id: artworkId,
    user_id: userId,
  });

  if (error) {
    if (isPersonalArchiveSchemaError(error)) {
      return schemaUnavailableResult();
    }
    if (String((error as { code?: string }).code) === "23505") {
      const count = await getArtworkArchiveCount(supabase, artworkId);
      return { ok: true, archived: true, count };
    }
    return { ok: false, error: error.message || "Could not archive this work." };
  }

  const count = await getArtworkArchiveCount(supabase, artworkId);
  return { ok: true, archived: true, count };
}

export async function removeArtworkFromArchive(
  supabase: SupabaseClient,
  artworkId: string,
  userId: string
): Promise<ArchiveActionResult> {
  const { error } = await supabase
    .from("artwork_archives")
    .delete()
    .eq("artwork_id", artworkId)
    .eq("user_id", userId);

  if (error) {
    if (isPersonalArchiveSchemaError(error)) {
      return schemaUnavailableResult();
    }
    return {
      ok: false,
      error: error.message || "Could not remove this work from your archive.",
    };
  }

  const count = await getArtworkArchiveCount(supabase, artworkId);
  return { ok: true, archived: false, count };
}

/** One quiet continuity line for archive cards — not a feed. */
export function archiveContinuitySummaryLine(
  bundle: ArchivalProvenanceBundle | null | undefined
): string | null {
  const lines = verificationContinuitySummaryLines(bundle);
  return lines[0] ?? null;
}

export type ArchivedArtworkRow = {
  archiveId: string;
  archivedAt: string;
  artworkId: string;
  title: string;
  registryId: string;
  imageUrl: string | null;
  artistName: string;
  verificationStatus: string;
  continuitySummary: string | null;
};
