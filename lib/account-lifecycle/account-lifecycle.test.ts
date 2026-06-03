import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DELETED_USER_LABEL,
  DELETION_CONFIRMATION_PHRASE,
  DELETION_GRACE_DAYS,
} from "@/lib/account-lifecycle/constants";
import { resolveParticipantDisplayName } from "@/lib/account-lifecycle/deleted-user-display";
import { buildExportBundle } from "@/lib/account-lifecycle/data-export";

describe("account-lifecycle constants", () => {
  it("defines 30-day grace period", () => {
    assert.equal(DELETION_GRACE_DAYS, 30);
  });

  it("uses explicit deletion confirmation phrase", () => {
    assert.equal(DELETION_CONFIRMATION_PHRASE, "DELETE MY ACCOUNT");
  });
});

describe("resolveParticipantDisplayName", () => {
  it("returns Deleted User for deleted status", () => {
    assert.equal(
      resolveParticipantDisplayName({
        userId: "abc",
        displayName: "Jane Artist",
        accountStatus: "deleted",
      }),
      DELETED_USER_LABEL
    );
  });

  it("returns display name for active users", () => {
    assert.equal(
      resolveParticipantDisplayName({
        userId: "abc",
        displayName: "Jane Artist",
        accountStatus: "active",
      }),
      "Jane Artist"
    );
  });

  it("maps legacy [deleted] marker", () => {
    assert.equal(
      resolveParticipantDisplayName({
        userId: "abc",
        displayName: "[deleted]",
        accountStatus: "active",
      }),
      DELETED_USER_LABEL
    );
  });
});

describe("buildExportBundle", () => {
  it("produces JSON and CSV slices", () => {
    const sample = {
      exported_at: new Date().toISOString(),
      user_id: "user-1",
      profile: { role: "artist" },
      role_specific: null,
      activity_events: [{ id: "1", type: "test", message: "hi" }],
      owned_artworks: [],
      certificates: [],
      ownership_events: [],
    };
    const bundle = buildExportBundle(sample);
    assert.ok(bundle.json.includes("user-1"));
    assert.ok(bundle.csv["activity_events.csv"]?.includes("test"));
  });
});
