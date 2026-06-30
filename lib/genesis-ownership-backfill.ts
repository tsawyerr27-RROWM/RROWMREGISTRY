/**
 * Genesis ownership backfill planning (PR-BETA.7.2).
 *
 * Ledger authority only — never infer holder from UI convenience.
 * Legacy artworks with zero ownership_events receive append-only genesis rows.
 */

export type GenesisBackfillArtwork = {
  id: string;
  artist_id: string | null;
  current_owner_id: string | null;
  created_at: string | null;
  updated_at?: string | null;
};

export type GenesisBackfillTransferType =
  | "registration"
  | "ownership_transfer"
  | "record_correction";

export type GenesisBackfillRow = {
  transfer_type: GenesisBackfillTransferType;
  from_user_id: string | null;
  to_user_id: string;
  notes: string;
  created_at: string;
};

function trimId(value: string | null | undefined): string | null {
  const trimmed = String(value ?? "").trim();
  return trimmed || null;
}

function baseTimestamp(artwork: GenesisBackfillArtwork): string {
  return artwork.created_at?.trim() || new Date(0).toISOString();
}

function transferTimestamp(artwork: GenesisBackfillArtwork): string {
  const updated = artwork.updated_at?.trim();
  const created = baseTimestamp(artwork);
  if (updated && updated > created) return updated;
  return created;
}

/**
 * Plan append-only genesis rows for an artwork with no ownership_events.
 * Returns null when no defensible holder can be derived.
 */
export function planGenesisOwnershipBackfill(
  artwork: GenesisBackfillArtwork
): GenesisBackfillRow[] | null {
  const artistId = trimId(artwork.artist_id);
  const currentOwnerId = trimId(artwork.current_owner_id);
  const createdAt = baseTimestamp(artwork);

  if (!artistId && !currentOwnerId) return null;

  // Sold without ledger: artist authored, cache shows downstream holder.
  if (artistId && currentOwnerId && artistId !== currentOwnerId) {
    return [
      {
        transfer_type: "registration",
        from_user_id: null,
        to_user_id: artistId,
        notes: "Backfilled registration genesis (PR-BETA.7.2)",
        created_at: createdAt,
      },
      {
        transfer_type: "ownership_transfer",
        from_user_id: artistId,
        to_user_id: currentOwnerId,
        notes:
          "Backfilled transfer for legacy sale without ledger row (PR-BETA.7.2)",
        created_at: transferTimestamp(artwork),
      },
    ];
  }

  const holderId = currentOwnerId ?? artistId;
  if (!holderId) return null;

  return [
    {
      transfer_type: "registration",
      from_user_id: null,
      to_user_id: holderId,
      notes: "Backfilled genesis ownership event (PR-BETA.7.2)",
      created_at: createdAt,
    },
  ];
}

/** Artworks that received a single-row PR-BETA.7 cache-derived genesis (chronology defect). */
export function isCacheDerivedGenesisDefect(args: {
  artist_id: string | null;
  genesis_to_user_id: string | null;
  genesis_notes: string | null;
  transfer_type: string | null;
}): boolean {
  const artistId = trimId(args.artist_id);
  const genesisHolder = trimId(args.genesis_to_user_id);
  if (!artistId || !genesisHolder || artistId === genesisHolder) return false;
  if (String(args.transfer_type ?? "").toLowerCase() !== "registration") {
    return false;
  }
  const notes = String(args.genesis_notes ?? "");
  return (
    notes.includes("PR-BETA.7") &&
    !notes.includes("PR-BETA.7.2")
  );
}

export function planCacheDerivedGenesisCorrection(args: {
  artwork_id: string;
  artist_id: string;
  current_holder_id: string;
  references_event_id: string;
}): GenesisBackfillRow {
  return {
    transfer_type: "record_correction",
    from_user_id: args.artist_id,
    to_user_id: args.current_holder_id,
    notes: `Chronology notice: genesis backfill PR-BETA.7 assigned holder from cache without transfer row; artist custody not recorded on ledger. references_event=${args.references_event_id}; artwork_id=${args.artwork_id}`,
    created_at: new Date().toISOString(),
  };
}
