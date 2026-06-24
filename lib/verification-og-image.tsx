import { ImageResponse } from "next/og";

import {
  trustLevelLabelForOg,
  verificationOgSealTier,
  type VerificationOgBundle,
} from "@/lib/verification-og";
import { registryPremium } from "@/styles/registry-premium";

const { og } = registryPremium;

function sealColors(tier: ReturnType<typeof verificationOgSealTier>) {
  switch (tier) {
    case "layered":
      return {
        fill: og.seal.fillEstablished,
        outer: og.seal.ringEstablished,
        inner: og.seal.ringEstablished,
      };
    case "attested":
    case "established":
      return {
        fill: og.seal.fillVerified,
        outer: og.seal.ringVerified,
        inner: og.seal.ringVerified,
      };
    case "revoked":
      return {
        fill: "#fef2f2",
        outer: "rgba(185, 28, 28, 0.55)",
        inner: "rgba(185, 28, 28, 0.4)",
      };
    default:
      return {
        fill: og.seal.fillRegistered,
        outer: og.seal.ringRegistered,
        inner: og.seal.ringRegistered,
      };
  }
}

function OgSeal({ tier }: { tier: ReturnType<typeof verificationOgSealTier> }) {
  const colors = sealColors(tier);
  const size = 148;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: colors.fill,
          border: `1.5px solid ${colors.outer}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 14,
          borderRadius: "50%",
          border: `1px solid ${colors.inner}`,
        }}
      />
      {(tier === "layered" || tier === "attested" || tier === "established") && (
        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: "50%",
            border: `1px solid ${colors.inner}`,
            opacity: tier === "layered" ? 1 : 0.65,
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          fontSize: 11,
          letterSpacing: "0.04em",
                    color: og.ink.muted,
          fontWeight: 500,
        }}
      >
        RROWM
      </div>
    </div>
  );
}

export function verificationOgImageSize() {
  return { width: og.width, height: og.height };
}

export function verificationOgImageContentType() {
  return "image/png" as const;
}

function formatVerificationDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function renderVerificationOgImage(bundle: VerificationOgBundle) {
  const tier = verificationOgSealTier(bundle.context);
  const showFull = bundle.context.publicity === "full";
  const headline = showFull
    ? bundle.context.artworkTitle.trim() || "Work on file"
    : "Registry verification";
  const kicker = showFull ? "Verification approved" : "Registry verification";
  const trustLabel = showFull
    ? trustLevelLabelForOg(bundle.context.trustLevel)
    : null;
  const verifier = showFull ? bundle.context.verifierName?.trim() : null;
  const verifiedDate = showFull
    ? formatVerificationDate(bundle.context.verifiedAt)
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: `linear-gradient(135deg, ${og.paper.top} 0%, ${og.paper.mid} 52%, ${og.paper.bottom} 100%)`,
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            margin: 28,
            border: `1px solid ${og.frame.outer}`,
            background: "rgba(255,255,255,0.42)",
            boxShadow: "0 28px 80px -48px rgba(15, 23, 42, 0.22)",
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              margin: 10,
              border: `1px solid ${og.frame.inner}`,
              padding: "52px 56px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    fontSize: 17,
                    color: og.ink.muted,
                    letterSpacing: "0.02em",
                                      }}
                >
                  {kicker}
                </div>
                {trustLabel ? (
                  <div
                    style={{
                      marginTop: 16,
                      fontSize: 22,
                      color: og.ink.secondary,
                      letterSpacing: "0.04em",
                    }}
                  >
                    Trust level · {trustLabel}
                  </div>
                ) : null}
                <div
                  style={{
                    marginTop: 24,
                    fontSize: 56,
                    lineHeight: 1.06,
                    color: og.ink.primary,
                    maxWidth: 760,
                  }}
                >
                  {headline}
                </div>
                {verifier ? (
                  <div
                    style={{
                      marginTop: 20,
                      fontSize: 26,
                      lineHeight: 1.3,
                      color: og.ink.secondary,
                      maxWidth: 700,
                    }}
                  >
                    Verified by {verifier}
                  </div>
                ) : null}
                {verifiedDate ? (
                  <div
                    style={{
                      marginTop: 16,
                      fontSize: 22,
                      lineHeight: 1.4,
                      color: og.ink.muted,
                    }}
                  >
                    {verifiedDate}
                  </div>
                ) : null}
                <div
                  style={{
                    marginTop: 28,
                    fontSize: 16,
                    letterSpacing: "0.12em",
                    fontFamily: "ui-monospace, monospace",
                    color: og.ink.faint,
                  }}
                >
                  {bundle.context.registryId}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 36,
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    letterSpacing: "0.24em",
                                        color: og.ink.faint,
                  }}
                >
                  {og.wordmark}
                </div>
                <div style={{ fontSize: 15, color: og.ink.muted }}>The Field</div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 32,
              }}
            >
              <OgSeal tier={tier} />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: og.width,
      height: og.height,
    }
  );
}

export function renderVerificationOgFallbackImage() {
  return renderVerificationOgImage({
    context: {
      registryId: "—",
      artworkTitle: "Registry verification",
      verifierName: null,
      trustLevel: "registered",
      verifiedAt: null,
      publicity: "restricted",
    },
    indexable: false,
  });
}
