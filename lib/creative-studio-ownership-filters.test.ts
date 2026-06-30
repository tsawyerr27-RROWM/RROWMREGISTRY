import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CREATIVE_OWNERSHIP_FILTER_DEFAULT,
  isSoldOrTransferredArtwork,
  passesCreativeOwnershipFilter,
} from "@/lib/creative-studio-ownership-filters";

describe("creative studio ownership filters", () => {
  const userId = "artist-1";
  const buyerId = "buyer-1";
  const artworkId = "art-1";
  const transferred = new Set([artworkId]);
  const outbound = new Set<string>();

  it("defaults to owned_by_you", () => {
    assert.equal(CREATIVE_OWNERSHIP_FILTER_DEFAULT, "owned_by_you");
  });

  it("sold_transferred includes transferred and outbound pending ids", () => {
    assert.equal(
      isSoldOrTransferredArtwork({
        artworkId,
        transferredArtworkIds: transferred,
        outboundPendingArtworkIds: outbound,
      }),
      true
    );
    assert.equal(
      isSoldOrTransferredArtwork({
        artworkId: "pending-1",
        transferredArtworkIds: new Set(),
        outboundPendingArtworkIds: new Set(["pending-1"]),
      }),
      true
    );
  });

  it("owned_by_you uses canonical holder only", () => {
    assert.equal(
      passesCreativeOwnershipFilter({
        artworkId,
        filter: "owned_by_you",
        canonicalHolderId: userId,
        viewerUserId: userId,
        hasSaleSignal: false,
        transferredArtworkIds: new Set(),
        outboundPendingArtworkIds: outbound,
      }),
      true
    );
    assert.equal(
      passesCreativeOwnershipFilter({
        artworkId,
        filter: "owned_by_you",
        canonicalHolderId: buyerId,
        viewerUserId: userId,
        hasSaleSignal: false,
        transferredArtworkIds: transferred,
        outboundPendingArtworkIds: outbound,
      }),
      false
    );
  });

  it("full_catalogue includes all authored rows", () => {
    assert.equal(
      passesCreativeOwnershipFilter({
        artworkId,
        filter: "full_catalogue",
        canonicalHolderId: buyerId,
        viewerUserId: userId,
        hasSaleSignal: false,
        transferredArtworkIds: transferred,
        outboundPendingArtworkIds: outbound,
      }),
      true
    );
  });
});
