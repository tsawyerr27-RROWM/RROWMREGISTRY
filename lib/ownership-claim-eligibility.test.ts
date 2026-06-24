import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  OWNERSHIP_CLAIM_NOTE_MIN_LENGTH,
  isOwnershipClaimNoteValid,
} from "@/lib/ownership-claim-eligibility";

describe("ownership claim note validation", () => {
  it("requires substantiated notes", () => {
    assert.equal(OWNERSHIP_CLAIM_NOTE_MIN_LENGTH, 12);
    assert.equal(isOwnershipClaimNoteValid("short"), false);
    assert.equal(
      isOwnershipClaimNoteValid("Purchased at gallery exhibition."),
      true
    );
  });
});
