import { ImageResponse } from "next/og";

import {
  profileOgSealTier,
  resolveProfileOgLines,
  type ProfileOgBundle,
} from "@/lib/profile-og";
import { registryPremium } from "@/styles/registry-premium";

const { og } = registryPremium;

function sealColors(tier: ReturnType<typeof profileOgSealTier>) {
  switch (tier) {
    case "established":
      return {
        fill: og.seal.fillEstablished,
        outer: og.seal.ringEstablished,
        inner: og.seal.ringEstablished,
      };
    case "verified":
      return {
        fill: og.seal.fillVerified,
        outer: og.seal.ringVerified,
        inner: og.seal.ringVerified,
      };
    case "private":
      return {
        fill: og.seal.fillRegistered,
        outer: og.seal.ringRegistered,
        inner: og.seal.ringRegistered,
      };
    default:
      return {
        fill: og.seal.fillRegistered,
        outer: og.seal.ringRegistered,
        inner: og.seal.ringRegistered,
      };
  }
}

function OgSeal({ tier }: { tier: ReturnType<typeof profileOgSealTier> }) {
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
      {(tier === "established" || tier === "verified") && (
        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: "50%",
            border: `1px solid ${colors.inner}`,
            opacity: tier === "established" ? 1 : 0.65,
          }}
        />
      )}
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

export function profileOgImageSize() {
  return { width: og.width, height: og.height };
}

export function profileOgImageContentType() {
  return "image/png" as const;
}

export function renderProfileOgImage(bundle: ProfileOgBundle) {
  const lines = resolveProfileOgLines(bundle.context);
  const tier = profileOgSealTier(bundle.context);

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
                    letterSpacing: "0.02em",
                  }}
                >
                  {lines.surfaceLabel} · Registry presence
                </div>
                <div
                  style={{
                    marginTop: 28,
                    fontSize: 64,
                    lineHeight: 1.05,
                    color: og.ink.primary,
                    maxWidth: 760,
                  }}
                >
                  {bundle.context.displayName}
                </div>
                {lines.trust ? (
                  <div
                    style={{
                      marginTop: 22,
                      fontSize: 30,
                      lineHeight: 1.25,
                      color: og.ink.primary,
                      maxWidth: 720,
                    }}
                  >
                    {lines.trust}
                  </div>
                ) : null}
                {lines.detail ? (
                  <div
                    style={{
                      marginTop: 18,
                      fontSize: 22,
                      lineHeight: 1.45,
                      color: og.ink.secondary,
                      maxWidth: 700,
                    }}
                  >
                    {lines.detail}
                  </div>
                ) : null}
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
