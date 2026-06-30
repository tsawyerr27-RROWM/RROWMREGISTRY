import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canRecordValueEvent,
  isPriceDiscoveryManualValueType,
  resolveArtworkStewardshipRole,
  resolveValueChronologyPhase,
  resolveValuationDisabledMessage,
  VALUATION_ARTIST_PRIMARY_ONLY_MESSAGE,
  VALUATION_MARKET_DRIVEN_MESSAGE,
} from "@/lib/can-record-value-event";

const artist = "11111111-1111-4111-8111-111111111111";
const buyer = "22222222-2222-4222-8222-222222222222";
const gallery = "33333333-3333-4333-8333-333333333333";
const artwork = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("resolveValueChronologyPhase", () => {
  it("labels unsold work as price_discovery", () => {
    assert.equal(
      resolveValueChronologyPhase({ hasCompletedSale: false }),
      "price_discovery"
    );
  });

  it("labels sold work as market_evidence", () => {
    assert.equal(
      resolveValueChronologyPhase({ hasCompletedSale: true }),
      "market_evidence"
    );
  });
});

describe("canRecordValueEvent", () => {
  it("allows admin override", () => {
    assert.equal(
      canRecordValueEvent({
        userId: "any",
        artworkId: artwork,
        hasCompletedSale: true,
        isAdmin: true,
      }),
      true
    );
  });

  it("allows artist before any completed sale", () => {
    assert.equal(
      canRecordValueEvent({
        userId: artist,
        artworkId: artwork,
        artistId: artist,
        hasCompletedSale: false,
      }),
      true
    );
  });

  it("denies artist after completed sale even when reacquired", () => {
    assert.equal(
      canRecordValueEvent({
        userId: artist,
        artworkId: artwork,
        artistId: artist,
        hasCompletedSale: true,
      }),
      false
    );
  });

  it("denies collector after completed sale", () => {
    assert.equal(
      canRecordValueEvent({
        userId: buyer,
        artworkId: artwork,
        artistId: artist,
        hasCompletedSale: true,
      }),
      false
    );
  });

  it("denies non-artist during price discovery", () => {
    assert.equal(
      canRecordValueEvent({
        userId: buyer,
        artworkId: artwork,
        artistId: artist,
        hasCompletedSale: false,
      }),
      false
    );
  });
});

describe("resolveValuationDisabledMessage", () => {
  it("returns market-driven copy after completed sale", () => {
    assert.equal(
      resolveValuationDisabledMessage({
        userId: artist,
        artistId: artist,
        hasCompletedSale: true,
      }),
      VALUATION_MARKET_DRIVEN_MESSAGE
    );
  });

  it("returns artist-only copy for non-artist during price discovery", () => {
    assert.equal(
      resolveValuationDisabledMessage({
        userId: gallery,
        artistId: artist,
        hasCompletedSale: false,
      }),
      VALUATION_ARTIST_PRIMARY_ONLY_MESSAGE
    );
  });
});

describe("isPriceDiscoveryManualValueType", () => {
  it("accepts canonical price-discovery types", () => {
    assert.equal(isPriceDiscoveryManualValueType("initial_valuation"), true);
    assert.equal(isPriceDiscoveryManualValueType("listing_value"), true);
  });

  it("rejects sale-like manual types", () => {
    assert.equal(isPriceDiscoveryManualValueType("sale_value"), false);
    assert.equal(isPriceDiscoveryManualValueType("primary_sale"), false);
  });
});

describe("resolveArtworkStewardshipRole", () => {
  it("labels artist-only after sale", () => {
    assert.equal(
      resolveArtworkStewardshipRole({
        userId: artist,
        artistId: artist,
        canonicalOwnerUserId: buyer,
      }),
      "artist_only"
    );
  });

  it("labels artist and steward when still holder", () => {
    assert.equal(
      resolveArtworkStewardshipRole({
        userId: artist,
        artistId: artist,
        canonicalOwnerUserId: artist,
      }),
      "artist_and_steward"
    );
  });
});
