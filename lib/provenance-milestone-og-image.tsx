import { ImageResponse } from "next/og";

import {
  milestoneOgCategoryLabel,
  type ProvenanceMilestoneOgBundle,
} from "@/lib/provenance-milestone-og";
import { registryPremium } from "@/styles/registry-premium";

const { og } = registryPremium;

function ChronologyMotif() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        width: 40,
        minHeight: 180,
        marginRight: 28,
        paddingTop: 8,
        paddingBottom: 8,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: i === 1 ? 18 : 10,
            height: i === 1 ? 18 : 10,
            borderRadius: "50%",
            border: `1.5px solid ${i === 1 ? og.ink.secondary : og.ink.faint}`,
            background: i === 1 ? og.paper.top : og.paper.mid,
            flexShrink: 0,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 48,
          top: 72,
          bottom: 72,
          width: 2,
          background: `linear-gradient(180deg, ${og.ink.faint}, ${og.ink.muted}, ${og.ink.faint})`,
        }}
      />
    </div>
  );
}

export function provenanceMilestoneOgImageSize() {
  return { width: og.width, height: og.height };
}

export function provenanceMilestoneOgImageContentType() {
  return "image/png" as const;
}

function formatEventDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function renderProvenanceMilestoneOgImage(bundle: ProvenanceMilestoneOgBundle) {
  const showFull = bundle.context.publicity === "full";
  const categoryLabel = milestoneOgCategoryLabel(bundle.context);
  const headline = showFull
    ? bundle.context.eventTitle
    : "Provenance milestone";
  const participant = showFull ? bundle.context.participantContext : null;
  const eventDate = showFull ? formatEventDate(bundle.context.eventDate) : null;
  const artworkLine = showFull
    ? bundle.context.artworkTitle.trim() || "Work on file"
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
              padding: "48px 52px",
              position: "relative",
            }}
          >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "stretch",
                  flex: 1,
                }}
              >
                <ChronologyMotif />

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
                      fontSize: 16,
                      color: og.ink.muted,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                    }}
                  >
                    Provenance milestone
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      fontSize: 20,
                      color: og.ink.secondary,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {categoryLabel}
                  </div>
                  <div
                    style={{
                      marginTop: 24,
                      fontSize: 52,
                      lineHeight: 1.08,
                      color: og.ink.primary,
                      maxWidth: 700,
                    }}
                  >
                    {headline}
                  </div>
                  {artworkLine ? (
                    <div
                      style={{
                        marginTop: 18,
                        fontSize: 24,
                        lineHeight: 1.35,
                        color: og.ink.secondary,
                        maxWidth: 640,
                      }}
                    >
                      {artworkLine}
                    </div>
                  ) : null}
                  {participant ? (
                    <div
                      style={{
                        marginTop: 18,
                        fontSize: 22,
                        lineHeight: 1.4,
                        color: og.ink.muted,
                        maxWidth: 620,
                      }}
                    >
                      {participant}
                    </div>
                  ) : null}
                  {eventDate ? (
                    <div
                      style={{
                        marginTop: 16,
                        fontSize: 20,
                        color: og.ink.muted,
                      }}
                    >
                      {eventDate}
                    </div>
                  ) : null}
                  <div
                    style={{
                      marginTop: 24,
                      fontSize: 15,
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
                    marginTop: 32,
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      color: og.ink.faint,
                    }}
                  >
                    {og.wordmark}
                  </div>
                  <div style={{ fontSize: 14, color: og.ink.muted }}>
                    Registry chronology
                  </div>
                </div>
              </div>
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
