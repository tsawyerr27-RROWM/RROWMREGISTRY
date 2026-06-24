import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canActorAcceptDealTerms,
  canActorRespondToDealTerms,
  resolveActiveProposalSenderUserId,
} from "@/lib/deal-permissions";

const collector = "11111111-1111-4111-8111-111111111111";
const artist = "22222222-2222-4222-8222-222222222222";

describe("resolveActiveProposalSenderUserId", () => {
  it("uses deal creator for proposed terms", () => {
    assert.equal(
      resolveActiveProposalSenderUserId({
        dealStatus: "proposed",
        createdByUserId: collector,
      }),
      collector
    );
  });

  it("uses latest revision author after counterproposal", () => {
    assert.equal(
      resolveActiveProposalSenderUserId({
        dealStatus: "countered",
        createdByUserId: collector,
        latestRevisionCreatedByUserId: artist,
      }),
      artist
    );
  });
});

describe("canActorAcceptDealTerms", () => {
  it("allows counterparty to accept an incoming proposal", () => {
    assert.equal(
      canActorAcceptDealTerms({
        actorUserId: artist,
        dealStatus: "proposed",
        participantAUserId: collector,
        participantBUserId: artist,
        createdByUserId: collector,
      }),
      true
    );
  });

  it("blocks proposal sender from accepting their own proposal", () => {
    assert.equal(
      canActorAcceptDealTerms({
        actorUserId: collector,
        dealStatus: "proposed",
        participantAUserId: collector,
        participantBUserId: artist,
        createdByUserId: collector,
      }),
      false
    );
  });

  it("blocks counterparty from accepting their own counterproposal", () => {
    assert.equal(
      canActorAcceptDealTerms({
        actorUserId: artist,
        dealStatus: "countered",
        participantAUserId: collector,
        participantBUserId: artist,
        createdByUserId: collector,
        latestRevisionCreatedByUserId: artist,
      }),
      false
    );
  });

  it("allows original proposer to accept a counterproposal", () => {
    assert.equal(
      canActorAcceptDealTerms({
        actorUserId: collector,
        dealStatus: "countered",
        participantAUserId: collector,
        participantBUserId: artist,
        createdByUserId: collector,
        latestRevisionCreatedByUserId: artist,
      }),
      true
    );
  });

  it("rejects unrelated users", () => {
    assert.equal(
      canActorAcceptDealTerms({
        actorUserId: "33333333-3333-4333-8333-333333333333",
        dealStatus: "proposed",
        participantAUserId: collector,
        participantBUserId: artist,
        createdByUserId: collector,
      }),
      false
    );
  });
});

describe("canActorRespondToDealTerms", () => {
  it("blocks proposal sender from declining their own proposal", () => {
    assert.equal(
      canActorRespondToDealTerms({
        actorUserId: collector,
        dealStatus: "under_review",
        participantAUserId: collector,
        participantBUserId: artist,
        createdByUserId: collector,
      }),
      false
    );
  });
});
