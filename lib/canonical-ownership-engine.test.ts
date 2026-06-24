import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  pickLatestOwnershipEvent,
  resolveHolderUserIdFromEvent,
} from "@/lib/ownership-canonical";

describe("canonical-ownership-engine invariants", () => {
  it("holder is ownership_events.to_user_id on latest row", () => {
    const latest = pickLatestOwnershipEvent([
      { artwork_id: "art-1", created_at: "2024-01-01", id: "1", to_user_id: "seller" },
      { artwork_id: "art-1", created_at: "2024-06-01", id: "2", to_user_id: "buyer" },
    ]);
    assert.equal(resolveHolderUserIdFromEvent(latest), "buyer");
  });

  it("null to_user_id means unassigned holder", () => {
    assert.equal(
      resolveHolderUserIdFromEvent({
        to_user_id: null,
        created_at: "2024-01-01",
        id: "1",
      }),
      null
    );
  });

  it("tie-breaks latest row by id when created_at equal", () => {
    const latest = pickLatestOwnershipEvent([
      { created_at: "2024-06-01", id: "1", to_user_id: "a" },
      { created_at: "2024-06-01", id: "2", to_user_id: "b" },
    ]);
    assert.equal(resolveHolderUserIdFromEvent(latest), "b");
  });
});
