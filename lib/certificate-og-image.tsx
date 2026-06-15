import { ImageResponse } from "next/og";

import {
  certificateOgSealTier,
  type CertificateOgBundle,
} from "@/lib/certificate-og";
import { registryPremium } from "@/styles/registry-premium";

const { og } = registryPremium;

function sealColors(tier: ReturnType<typeof certificateOgSealTier>) {
  switch (tier) {
    case "attested":
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

function OgSeal({ tier }: { tier: ReturnType<typeof certificateOgSealTier> }) {
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
      {tier === "attested" ? (
        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: "50%",
            border: `1px solid ${colors.inner}`,
            opacity: 0.65,
          }}
        />
      ) : null}
      <div
        style={{
          position: "relative",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: og.ink.muted,
          fontWeight: 500,
        }}
      >
        RROWM
      </div>
    </div>
  );
}

export function certificateOgImageSize() {
  return { width: og.width, height: og.height };
}

export function certificateOgImageContentType() {
  return "image/png" as const;
}

function formatIssuedDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function renderCertificateOgImage(bundle: CertificateOgBundle) {
  const tier = certificateOgSealTier(bundle.context);
  const showFull = bundle.context.publicity === "full";
  const headline = showFull
    ? bundle.context.artworkTitle.trim() || "Work on file"
    : "Registry certificate";
  const artist = showFull ? bundle.context.artistName?.trim() : null;
  const issued = showFull ? formatIssuedDate(bundle.context.issuedAt) : null;

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
                    fontSize: 18,
                    color: og.ink.muted,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  Registry certificate
                </div>
                <div
                  style={{
                    marginTop: 28,
                    fontSize: 58,
                    lineHeight: 1.06,
                    color: og.ink.primary,
                    maxWidth: 760,
                  }}
                >
                  {headline}
                </div>
                {artist ? (
                  <div
                    style={{
                      marginTop: 20,
                      fontSize: 28,
                      lineHeight: 1.3,
                      color: og.ink.secondary,
                      maxWidth: 700,
                    }}
                  >
                    {artist}
                  </div>
                ) : null}
                {issued ? (
                  <div
                    style={{
                      marginTop: 18,
                      fontSize: 22,
                      lineHeight: 1.4,
                      color: og.ink.muted,
                    }}
                  >
                    Issued {issued}
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
                    textTransform: "uppercase",
                    color: og.ink.faint,
                  }}
                >
                  {og.wordmark}
                </div>
                <div style={{ fontSize: 15, color: og.ink.muted }}>
                  {tier === "revoked" ? "Revoked" : "The Registry"}
                </div>
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

export function renderCertificateOgFallbackImage() {
  return renderCertificateOgImage({
    context: {
      registryId: "—",
      artworkTitle: "Registry certificate",
      publicity: "restricted",
    },
    indexable: false,
  });
}
