import Link from "next/link";

import { FieldCreativePracticeChips } from "@/components/Field/FieldCreativePracticeChips";
import type { RecordExplorerRow } from "@/lib/fetch-record-explorer-list";
import {
  fieldVerifyHref,
  fieldVerifyRecordHref,
} from "@/lib/field-nav";
import { registryLedgerHref } from "@/lib/registry-nav";
import { semanticStampClass } from "@/lib/registry-semantic-signals";
import { registryV2 } from "@/styles/registry-v2";

type Props = {
  row: RecordExplorerRow;
};

function verificationSummary(row: RecordExplorerRow): string {
  const parts: string[] = [];
  if (row.recordVerified) {
    parts.push("Verified Registry record");
  } else {
    parts.push("Registered on file");
  }
  if (row.artistConfirmationOnFile) {
    parts.push("Artist confirmation on file");
  }
  if (row.organisationName) {
    parts.push(
      row.organisationVerified
        ? "Organisation verification on file"
        : "Organisation linked"
    );
  }
  if (row.hasCertificate) {
    parts.push(
      row.certificateRevoked ? "Certificate revoked" : "Certificate on file"
    );
  }
  return parts.join(" · ");
}

export function RecordExplorerCard({ row }: Props) {
  const title = (row.title || "").trim() || "Untitled";
  const verifyHref = fieldVerifyRecordHref(row.registry_id);
  const ledgerHref = registryLedgerHref(row.registry_id);
  const yearMedium = [row.year, row.medium].filter(Boolean).join(" · ");

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden ${registryV2.surface.filing} ${registryV2.motion.hover}`}
    >
      <Link href={row.href} className="relative block aspect-[4/5] overflow-hidden bg-[var(--v2-cool-grey)]/10">
        {row.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.image_url}
            alt=""
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className={registryV2.type.monoId}>No image</span>
          </div>
        )}
        <div className="absolute left-4 top-4">
          <span
            className={semanticStampClass(
              row.recordVerified ? "certification" : "registration"
            )}
          >
            {row.recordVerified ? "Verified" : "On file"}
          </span>
        </div>
        {row.hasCertificate ? (
          <div className="absolute right-4 top-4">
            <span
              className={semanticStampClass(
                row.certificateRevoked ? "correction" : "certification"
              )}
            >
              {row.certificateRevoked ? "Revoked" : "Certificate"}
            </span>
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-6 md:p-7">
        <p className={registryV2.type.monoId}>{row.registry_id}</p>
        <h2 className={`${registryV2.type.sectionTitle} mt-3 text-xl md:text-[1.45rem]`}>
          <Link
            href={row.href}
            className="transition hover:text-[var(--v2-cool-grey)]"
          >
            {title}
          </Link>
        </h2>

        <div className={`${registryV2.surface.metadataField} mt-5`}>
          <p className={registryV2.type.metaLabel}>Verification</p>
          <p className={`${registryV2.type.monoId} mt-2 text-[11px] leading-relaxed`}>
            {verificationSummary(row)}
          </p>
        </div>

        {row.artistName ? (
          <p className={`${registryV2.type.metaValue} mt-4 text-sm`}>
            <span className={registryV2.type.metaLabel}>Creative · </span>
            {row.creativeHref ? (
              <Link
                href={row.creativeHref}
                className="font-medium text-[var(--v2-ink)] underline decoration-[var(--v2-border)] underline-offset-2"
              >
                {row.artistName}
              </Link>
            ) : (
              row.artistName
            )}
          </p>
        ) : null}

        {row.organisationName ? (
          <p className={`${registryV2.type.metaValue} mt-2 text-sm`}>
            <span className={registryV2.type.metaLabel}>Organisation · </span>
            {row.organisationHref ? (
              <Link
                href={row.organisationHref}
                className="font-medium text-[var(--v2-ink)] underline decoration-[var(--v2-border)] underline-offset-2"
              >
                {row.organisationName}
              </Link>
            ) : (
              row.organisationName
            )}
          </p>
        ) : null}

        {yearMedium ? (
          <p className={`${registryV2.type.monoId} mt-3`}>{yearMedium}</p>
        ) : null}

        {row.practices.length > 0 ? (
          <div className="mt-4">
            <FieldCreativePracticeChips practices={row.practices.slice(0, 3)} />
          </div>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 border-t border-[var(--v2-border)] pt-5">
          <div className="flex flex-wrap gap-2">
            <Link
              href={row.href}
              className="v2-cta-primary inline-flex flex-1 !min-h-0 justify-center px-4 py-2.5 text-[10px]"
            >
              View record
            </Link>
            <Link
              href={verifyHref}
              className="v2-cta-secondary inline-flex flex-1 !min-h-0 justify-center px-4 py-2.5 text-[10px]"
            >
              Verify
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={ledgerHref} className={`${registryV2.type.monoId} hover:text-[var(--v2-ink)]`}>
              Registry ledger
            </Link>
            <Link href={fieldVerifyHref()} className={`${registryV2.type.monoId} hover:text-[var(--v2-ink)]`}>
              Verify hub
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
