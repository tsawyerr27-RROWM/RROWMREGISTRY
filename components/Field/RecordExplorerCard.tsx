import Link from "next/link";

import { FieldCreativePracticeChips } from "@/components/Field/FieldCreativePracticeChips";
import type { RecordExplorerRow } from "@/lib/fetch-record-explorer-list";
import {
  fieldVerifyHref,
  fieldVerifyRecordHref,
} from "@/lib/field-nav";

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
  const registryHref = `/registry/${encodeURIComponent(row.registry_id)}`;
  const yearMedium = [row.year, row.medium].filter(Boolean).join(" · ");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/90 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.14)] transition duration-300 hover:-translate-y-0.5 hover:border-neutral-900/[0.09] hover:shadow-[0_24px_48px_-28px_rgba(15,23,42,0.18)]">
      <Link href={row.href} className="relative block aspect-[4/5] overflow-hidden bg-neutral-100">
        {row.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.image_url}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            No image
          </div>
        )}
        <div className="absolute left-4 top-4">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-medium backdrop-blur-md ${
              row.recordVerified
                ? "bg-emerald-950/85 text-white/95"
                : "bg-black/45 text-white/90"
            }`}
          >
            {row.recordVerified ? "Verified record" : "On file"}
          </span>
        </div>
        {row.hasCertificate ? (
          <div className="absolute right-4 top-4">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium backdrop-blur-md ${
                row.certificateRevoked
                  ? "bg-neutral-950/80 text-white/90"
                  : "bg-white/90 text-neutral-900"
              }`}
            >
              {row.certificateRevoked ? "Cert revoked" : "Certificate"}
            </span>
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-6 md:p-7">
        <p className="font-mono text-[11px] text-neutral-400">{row.registry_id}</p>
        <h2 className="mt-2 font-serif text-xl font-normal leading-snug text-neutral-950">
          <Link href={row.href} className="transition hover:text-neutral-600">
            {title}
          </Link>
        </h2>

        <div className="mt-4 rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-3.5 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-500">
            Verification
          </p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-700">
            {verificationSummary(row)}
          </p>
        </div>

        {row.artistName ? (
          <p className="mt-4 text-sm text-neutral-600">
            <span className="text-neutral-500">Creative · </span>
            {row.creativeHref ? (
              <Link
                href={row.creativeHref}
                className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500"
              >
                {row.artistName}
              </Link>
            ) : (
              row.artistName
            )}
          </p>
        ) : null}

        {row.organisationName ? (
          <p className="mt-2 text-sm text-neutral-600">
            <span className="text-neutral-500">Organisation · </span>
            {row.organisationHref ? (
              <Link
                href={row.organisationHref}
                className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500"
              >
                {row.organisationName}
              </Link>
            ) : (
              row.organisationName
            )}
          </p>
        ) : null}

        {yearMedium ? (
          <p className="mt-3 text-xs text-neutral-500">{yearMedium}</p>
        ) : null}

        {row.practices.length > 0 ? (
          <div className="mt-4">
            <FieldCreativePracticeChips practices={row.practices.slice(0, 3)} />
          </div>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 border-t border-neutral-900/[0.05] pt-5">
          <div className="flex flex-wrap gap-2">
            <Link
              href={row.href}
              className="inline-flex flex-1 items-center justify-center rounded-2xl bg-neutral-950 px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-neutral-800"
            >
              View record
            </Link>
            <Link
              href={verifyHref}
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-center text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
            >
              Verify
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-[11px]">
            <Link
              href={registryHref}
              className="font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500"
            >
              Registry ledger
            </Link>
            <Link
              href={fieldVerifyHref()}
              className="font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500"
            >
              Verify hub
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
