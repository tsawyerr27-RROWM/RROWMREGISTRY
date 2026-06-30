import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isPendingAcquisitionTransferRecipient,
  resolveAcquisitionBuyerUserId,
  resolveOwnershipLoopPrompt,
  type TransferRow,
} from "@/lib/acquisition-ownership-loop";
import type { DealRow } from "@/lib/deals";

const deal: DealRow = {
  id: "deal-1",
  created_at: "",
  updated_at: "",
  type: "acquisition",
  status: "accepted",
  created_by_user_id: "seller-id",
  participant_a_user_id: "seller-id",
  participant_b_user_id: "buyer-id",
  artwork_id: "art-1",
  gallery_id: null,
  title: "Test deal",
  terms: {},
};

describe("resolveAcquisitionBuyerUserId", () => {
  it("prefers transfer recipient_user_id over deal counterparty", () => {
    const transfer: TransferRow = {
      id: "t-1",
      artwork_id: "art-1",
      from_user_id: "seller-id",
      recipient_user_id: "buyer-from-transfer",
      status: "pending_acceptance",
      invite_token: "tok",
      note: null,
    };

    assert.equal(
      resolveAcquisitionBuyerUserId({ deal, transfer, execution: null }),
      "buyer-from-transfer"
    );
  });

  it("falls back to deal counterparty of seller when transfer row missing recipient", () => {
    const transfer: TransferRow = {
      id: "t-1",
      artwork_id: "art-1",
      from_user_id: "seller-id",
      recipient_user_id: null,
      status: "pending_acceptance",
      invite_token: null,
      note: null,
    };

    assert.equal(
      resolveAcquisitionBuyerUserId({ deal, transfer, execution: null }),
      "buyer-id"
    );
  });
});

describe("isPendingAcquisitionTransferRecipient", () => {
  it("returns true for pending transfer recipient", () => {
    assert.equal(
      isPendingAcquisitionTransferRecipient({
        userId: "buyer-id",
        transfer: {
          provenance_transfer_id: "t-1",
          status: "pending_acceptance",
          from_user_id: "seller-id",
          recipient_user_id: "buyer-id",
          invite_token: "tok",
        },
      }),
      true
    );
  });

  it("returns false when user is not the transfer recipient", () => {
    assert.equal(
      isPendingAcquisitionTransferRecipient({
        userId: "seller-id",
        transfer: {
          provenance_transfer_id: "t-1",
          status: "pending_acceptance",
          from_user_id: "seller-id",
          recipient_user_id: "buyer-id",
          invite_token: "tok",
        },
      }),
      false
    );
  });
});

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
