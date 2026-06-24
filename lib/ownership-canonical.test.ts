import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  pickLatestOwnershipEvent,
  resolveHolderUserIdFromEvent,
  ownershipCacheMatchesLedger,
} from "@/lib/ownership-canonical";

describe("ownership-canonical", () => {
  it("reads to_user_id as ledger holder", () => {
    assert.equal(
      resolveHolderUserIdFromEvent({
        to_user_id: "user-a",
      }),
      "user-a"
    );
    assert.equal(
      resolveHolderUserIdFromEvent({ to_owner_id: "user-b" } as never),
      null
    );
  });

  it("picks latest event by created_at then id", () => {
    const latest = pickLatestOwnershipEvent([
      { created_at: "2024-01-01", id: "1", to_user_id: "old" },
      { created_at: "2024-06-01", id: "2", to_user_id: "new" },
    ]);
    assert.equal(resolveHolderUserIdFromEvent(latest), "new");
  });

  it("detects cache/ledger mismatch", () => {
    assert.equal(
      ownershipCacheMatchesLedger({
        cachedOwnerId: "a",
        ledgerHolderId: "b",
      }),
      false
    );
    assert.equal(
      ownershipCacheMatchesLedger({
        cachedOwnerId: "a",
        ledgerHolderId: "a",
      }),
      true
    );
  });
});
