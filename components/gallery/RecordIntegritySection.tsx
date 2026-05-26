"use client";

import Link from "next/link";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import {
  aggregateIntegrityCounts,
  computeRecordIntegrity,
  integrityRowTitle,
  type IntegrityArtworkFields,
  type RecordIntegrityStatus,
} from "@/lib/gallery-record-integrity";

type Props = {
  artworks: IntegrityArtworkFields[];
  galleryIsVerified: boolean;
  ownershipEventCountByArtworkId: Record<string, number>;
  ownershipLastToUserIdByArtworkId: Record<string, string | null>;
  hasAnyValueEventByArtworkId: Record<string, boolean>;
  hasGalleryVerificationByArtworkId: Record<string, boolean>;
  hasLiveCertificateByArtworkId: Record<string, boolean>;
  hasRevokedCertificateByArtworkId: Record<string, boolean>;
  onGoToRoster: () => void;
  onVerifyArtwork: (artworkId: string) => void;
  onIssueCertificate: (artworkId: string) => void;
};

function statusPillClass(status: RecordIntegrityStatus): string {
  if (status === "complete")
    return "bg-emerald-500/10 text-emerald-900 ring-1 ring-emerald-900/10";
  if (status === "needs_attention")
    return "bg-amber-500/10 text-amber-950 ring-1 ring-amber-900/12";
  return "bg-neutral-900/[0.06] text-neutral-800 ring-1 ring-black/[0.06]";
}

function statusLabel(status: RecordIntegrityStatus): string {
  if (status === "complete") return "Complete";
  if (status === "needs_attention") return "Needs attention";
  return "Incomplete";
}

export function RecordIntegritySection({
  artworks,
  galleryIsVerified,
  ownershipEventCountByArtworkId,
  ownershipLastToUserIdByArtworkId,
  hasAnyValueEventByArtworkId,
  hasGalleryVerificationByArtworkId,
  hasLiveCertificateByArtworkId,
  hasRevokedCertificateByArtworkId,
  onGoToRoster,
  onVerifyArtwork,
  onIssueCertificate,
}: Props) {
  if (artworks.length === 0) return null;

  const rows = artworks.map((w) => {
    const r = computeRecordIntegrity(w, {
      ownershipEventCount: ownershipEventCountByArtworkId[w.id] ?? 0,
      ownershipLastToUserId: ownershipLastToUserIdByArtworkId[w.id] ?? null,
      hasAnyValueEvent: Boolean(hasAnyValueEventByArtworkId[w.id]),
      hasGalleryVerification: Boolean(hasGalleryVerificationByArtworkId[w.id]),
      hasLiveCertificate: Boolean(hasLiveCertificateByArtworkId[w.id]),
      hasRevokedCertificate: Boolean(hasRevokedCertificateByArtworkId[w.id]),
      galleryIsVerified,
    });
    return { artwork: w, ...r };
  });

  const counts = aggregateIntegrityCounts(rows);
  const affected = rows
    .filter((r) => r.status !== "complete")
    .sort((a, b) => {
      const order: Record<RecordIntegrityStatus, number> = {
        incomplete: 0,
        needs_attention: 1,
        complete: 2,
      };
      return order[a.status] - order[b.status];
    });

  return (
    <section className="mb-8 rounded-2xl border border-neutral-900/[0.06] bg-white/50 p-6 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:p-7">
      <InfoTooltip text="Provenance integrity and completeness signals derived from your existing records." />
      <h2 className="font-serif text-lg font-normal text-neutral-950 md:text-xl">
        Record integrity
      </h2>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] tabular-nums text-neutral-700">
        <span>
          <span className="font-medium text-emerald-900/90">{counts.complete}</span>{" "}
          complete
        </span>
        <span>
          <span className="font-medium text-amber-950/90">
            {counts.needs_attention}
          </span>{" "}
          needs attention
        </span>
        <span>
          <span className="font-medium text-neutral-900">{counts.incomplete}</span>{" "}
          incomplete
        </span>
      </div>

      {affected.length === 0 ? (
        <p className="mt-5 text-[13px] text-neutral-600">
          All catalogue records meet integrity checks.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-900/[0.06] border-t border-neutral-900/[0.06] pt-4">
          {affected.map(({ artwork, status, reasons, action }) => (
            <li
              key={artwork.id}
              className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-neutral-950">
                  {integrityRowTitle(artwork)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusPillClass(status)}`}
                  >
                    {status === "needs_attention" ? "⚠ " : null}
                    {statusLabel(status)}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] leading-snug text-neutral-600">
                  {reasons.join(" · ")}
                </p>
              </div>
              <div className="shrink-0 sm:pt-0.5">
                {action?.kind === "link" ? (
                  <Link
                    href={action.href}
                    className="text-[12px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-500"
                  >
                    {action.label}
                  </Link>
                ) : action?.kind === "roster" ? (
                  <button
                    type="button"
                    onClick={onGoToRoster}
                    className="text-left text-[12px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-500"
                  >
                    {action.label}
                  </button>
                ) : action?.kind === "verify" ? (
                  <button
                    type="button"
                    onClick={() => onVerifyArtwork(artwork.id)}
                    className="text-left text-[12px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-500"
                  >
                    {action.label}
                  </button>
                ) : action?.kind === "issue_certificate" ? (
                  <button
                    type="button"
                    onClick={() => onIssueCertificate(artwork.id)}
                    className="text-left text-[12px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-500"
                  >
                    {action.label}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

