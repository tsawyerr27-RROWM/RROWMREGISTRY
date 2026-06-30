import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isCacheDerivedGenesisDefect,
  planCacheDerivedGenesisCorrection,
  planGenesisOwnershipBackfill,
} from "@/lib/genesis-ownership-backfill";

describe("planGenesisOwnershipBackfill", () => {
  it("returns single registration when artist is sole holder", () => {
    const rows = planGenesisOwnershipBackfill({
      id: "art-1",
      artist_id: "artist-a",
      current_owner_id: "artist-a",
      created_at: "2024-01-01T00:00:00.000Z",
    });

    assert.equal(rows?.length, 1);
    assert.equal(rows?.[0].transfer_type, "registration");
    assert.equal(rows?.[0].to_user_id, "artist-a");
    assert.equal(rows?.[0].from_user_id, null);
  });

  it("returns registration + transfer when cache shows sale without ledger", () => {
    const rows = planGenesisOwnershipBackfill({
      id: "art-1",
      artist_id: "artist-a",
      current_owner_id: "collector-b",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-06-01T00:00:00.000Z",
    });

    assert.equal(rows?.length, 2);
    assert.equal(rows?.[0].transfer_type, "registration");
    assert.equal(rows?.[0].to_user_id, "artist-a");
    assert.equal(rows?.[1].transfer_type, "ownership_transfer");
    assert.equal(rows?.[1].from_user_id, "artist-a");
    assert.equal(rows?.[1].to_user_id, "collector-b");
    assert.equal(rows?.[1].created_at, "2024-06-01T00:00:00.000Z");
  });

  it("returns null when no holder can be derived", () => {
    assert.equal(
      planGenesisOwnershipBackfill({
        id: "art-1",
        artist_id: null,
        current_owner_id: null,
        created_at: "2024-01-01T00:00:00.000Z",
      }),
      null
    );
  });
});

describe("cache-derived genesis defect", () => {
  it("detects PR-BETA.7 single-row cache genesis", () => {
    assert.equal(
      isCacheDerivedGenesisDefect({
        artist_id: "artist-a",
        genesis_to_user_id: "collector-b",
        genesis_notes: "Backfilled genesis ownership event (PR-BETA.7)",
        transfer_type: "registration",
      }),
      true
    );
  });

  it("ignores corrected PR-BETA.7.2 backfill", () => {
    assert.equal(
      isCacheDerivedGenesisDefect({
        artist_id: "artist-a",
        genesis_to_user_id: "collector-b",
        genesis_notes: "Backfilled transfer for legacy sale without ledger row (PR-BETA.7.2)",
        transfer_type: "ownership_transfer",
      }),
      false
    );
  });
});

describe("planCacheDerivedGenesisCorrection", () => {
  it("files forward without changing current holder", () => {
    const row = planCacheDerivedGenesisCorrection({
      artwork_id: "art-1",
      artist_id: "artist-a",
      current_holder_id: "collector-b",
      references_event_id: "oe-99",
    });

    assert.equal(row.transfer_type, "record_correction");
    assert.equal(row.from_user_id, "artist-a");
    assert.equal(row.to_user_id, "collector-b");
    assert.match(row.notes, /references_event=oe-99/);
  });
});
