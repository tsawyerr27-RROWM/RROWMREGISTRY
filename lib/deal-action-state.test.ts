import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  resolveAcquisitionFilingUiState,
  resolveAcquisitionHeaderAction,
} from "@/lib/deal-action-state";
import type { DealExecutionPanelState } from "@/lib/deal-execution";
import type { DealRow } from "@/lib/deals";

const seller = "11111111-1111-4111-8111-111111111111";
const buyer = "22222222-2222-4222-8222-222222222222";

const baseDeal: DealRow = {
  id: "deal-1",
  created_at: "",
  updated_at: "",
  type: "acquisition",
  status: "accepted",
  created_by_user_id: seller,
  participant_a_user_id: seller,
  participant_b_user_id: buyer,
  artwork_id: "art-1",
  gallery_id: null,
  title: "Test acquisition",
  terms: {},
};

function mockExecutionState(
  overrides: Partial<DealExecutionPanelState> &
    Pick<DealExecutionPanelState, "canInitiate" | "reason">
): DealExecutionPanelState {
  return {
    visible: true,
    recorded: false,
    execution_kind: "acquisition",
    execution: null,
    registry_id: "RR-1",
    artwork_title: null,
    ledger_href: null,
    rights_ledger_href: null,
    reason_code: null,
    can_resolve_verification: false,
    ownership_loop: null,
    acquisition_transfer: null,
    ...overrides,
  };
}

describe("resolveAcquisitionHeaderAction", () => {
  it("prioritises file transfer for seller", () => {
    assert.deepEqual(
      resolveAcquisitionHeaderAction({
        executionUnavailable: false,
        showSellerExecuteCta: true,
        showBuyerCta: false,
        showVerifyArtworkCta: false,
        allComplete: false,
        buyerAcceptHref: null,
        verifyArtworkHref: "/studio/creative?artwork=art-1",
      }),
      { kind: "file_transfer" }
    );
  });

  it("shows confirm receipt for buyer awaiting transfer", () => {
    assert.deepEqual(
      resolveAcquisitionHeaderAction({
        executionUnavailable: false,
        showSellerExecuteCta: false,
        showBuyerCta: true,
        showVerifyArtworkCta: false,
        allComplete: false,
        buyerAcceptHref: "/accept/tok",
        verifyArtworkHref: "/studio/creative?artwork=art-1",
        buyerActionLabel: "Confirm receipt",
      }),
      {
        kind: "confirm_receipt",
        href: "/accept/tok",
        label: "Confirm receipt",
      }
    );
  });

  it("shows verify artwork when seller is blocked", () => {
    assert.deepEqual(
      resolveAcquisitionHeaderAction({
        executionUnavailable: false,
        showSellerExecuteCta: false,
        showBuyerCta: false,
        showVerifyArtworkCta: true,
        allComplete: false,
        buyerAcceptHref: null,
        verifyArtworkHref: "/studio/creative?artwork=art-1&section=artworks",
      }),
      {
        kind: "verify_artwork",
        href: "/studio/creative?artwork=art-1&section=artworks",
      }
    );
  });

  it("shows ownership recorded badge when complete", () => {
    assert.deepEqual(
      resolveAcquisitionHeaderAction({
        executionUnavailable: false,
        showSellerExecuteCta: true,
        showBuyerCta: true,
        showVerifyArtworkCta: true,
        allComplete: true,
        buyerAcceptHref: "/accept/tok",
        verifyArtworkHref: "/studio/creative?artwork=art-1",
      }),
      { kind: "ownership_recorded" }
    );
  });
});

describe("resolveAcquisitionFilingUiState", () => {
  it("derives seller file transfer CTA from execution state", () => {
    const execution = mockExecutionState({
      canInitiate: true,
      reason: null,
    });

    const ui = resolveAcquisitionFilingUiState({
      deal: baseDeal,
      userId: seller,
      executionState: execution,
      loadingExecution: false,
    });

    assert.equal(ui.showSellerExecuteCta, true);
    assert.deepEqual(ui.headerAction, { kind: "file_transfer" });
  });

  it("derives verify artwork CTA for unverified block", () => {
    const execution = mockExecutionState({
      canInitiate: false,
      reason: "Artwork must be verified before transfer.",
      reason_code: "artwork_unverified",
      can_resolve_verification: true,
    });

    const ui = resolveAcquisitionFilingUiState({
      deal: baseDeal,
      userId: seller,
      executionState: execution,
      loadingExecution: false,
    });

    assert.equal(ui.showVerifyArtworkCta, true);
    assert.equal(ui.headerAction.kind, "verify_artwork");
  });
});
