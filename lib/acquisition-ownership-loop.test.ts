import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveOwnershipLoopPrompt } from "@/lib/acquisition-ownership-loop";

describe("resolveOwnershipLoopPrompt", () => {
  it("prompts buyer to claim stewardship while transfer is pending", () => {
    const prompt = resolveOwnershipLoopPrompt({
      userId: "buyer-id",
      sellerUserId: "seller-id",
      buyerUserId: "buyer-id",
      executionStatus: "pending_acceptance",
      registryId: "RROWM-001",
      dealId: "deal-id",
      acceptHref: "/accept?token=abc",
    });

    assert.equal(prompt?.role, "buyer");
    assert.equal(prompt?.status, "awaiting_buyer");
    assert.match(prompt?.action_label ?? "", /Confirm receipt/i);
  });

  it("prompts seller to review transfer status while pending", () => {
    const prompt = resolveOwnershipLoopPrompt({
      userId: "seller-id",
      sellerUserId: "seller-id",
      buyerUserId: "buyer-id",
      executionStatus: "pending_acceptance",
      registryId: "RROWM-001",
      dealId: "deal-id",
      acceptHref: "/accept?token=abc",
    });

    assert.equal(prompt?.role, "seller");
    assert.equal(prompt?.status, "awaiting_seller");
  });
});
