import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isSaleCompletionValueEvent } from "@/lib/has-completed-sale";

describe("isSaleCompletionValueEvent", () => {
  it("detects deal_execution sale_value", () => {
    assert.equal(
      isSaleCompletionValueEvent({
        value_type: "sale_value",
        source: "deal_execution",
      }),
      true
    );
  });

  it("detects marketplace sale rows", () => {
    assert.equal(
      isSaleCompletionValueEvent({
        value_type: "sale",
        source: null,
      }),
      true
    );
  });

  it("detects acquisition metadata", () => {
    assert.equal(
      isSaleCompletionValueEvent({
        value_type: "sale_value",
        metadata: { acquisition: true, deal_id: "x" },
      }),
      true
    );
  });

  it("ignores manual valuation events", () => {
    assert.equal(
      isSaleCompletionValueEvent({
        value_type: "initial_valuation",
        source: "studio",
      }),
      false
    );
  });
});
