import {
  formatRightsDuration,
  rightsStatusLabel,
} from "@/lib/rights-summary";
import { exclusivityLabel, usageTypeLabel } from "@/lib/rights-licenses";
import type { PublicRightsLicenseView } from "@/lib/rights-publicity";
import type { RightsLedgerLicenseView } from "@/lib/rights-ledger";

type PublicProps = {
  variant: "public";
  license: PublicRightsLicenseView;
};

type StudioProps = {
  variant: "studio";
  license: RightsLedgerLicenseView;
};

type Props = PublicProps | StudioProps;

const rowClass =
  "rounded-xl border border-neutral-900/[0.06] bg-white/75 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]";

export function RightsLicenseRow(props: Props) {
  if (props.variant === "public") {
    const { license } = props;
    return (
      <article className={rowClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-serif text-[15px] font-normal text-neutral-950">
              {usageTypeLabel(license.usage_type)}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">
              Licensee: {license.licensee_label}
            </p>
          </div>
          <span className="rounded-full border border-neutral-900/[0.08] bg-[#f7f4ef] px-2.5 py-1 text-[11px] font-medium text-neutral-700">
            {rightsStatusLabel(license.status)}
          </span>
        </div>

        <dl className="mt-4 grid gap-3 text-[13px] sm:grid-cols-2">
          <div>
            <dt className="text-neutral-500">Territory</dt>
            <dd className="mt-0.5 text-neutral-900">{license.territory}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Exclusivity</dt>
            <dd className="mt-0.5 text-neutral-900">
              {exclusivityLabel(license.exclusivity)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-neutral-500">Duration</dt>
            <dd className="mt-0.5 text-neutral-900">
              {formatRightsDuration(license.starts_at, license.ends_at)}
            </dd>
          </div>
        </dl>
      </article>
    );
  }

  const { license } = props;
  const counterparty =
    license.licensor_label === "You"
      ? license.licensee_label
      : license.licensee_label === "You"
        ? license.licensor_label
        : `${license.licensor_label} → ${license.licensee_label}`;

  return (
    <article className={rowClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-serif text-[15px] font-normal text-neutral-950">
            {license.artwork_title || "Work on file"}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">
            {usageTypeLabel(license.usage_type)} · {counterparty}
          </p>
        </div>
        <span className="rounded-full border border-neutral-900/[0.08] bg-[#f7f4ef] px-2.5 py-1 text-[11px] font-medium text-neutral-700">
          {rightsStatusLabel(license.status)}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-[13px] sm:grid-cols-2">
        <div>
          <dt className="text-neutral-500">Territory</dt>
          <dd className="mt-0.5 text-neutral-900">{license.territory}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Exclusivity</dt>
          <dd className="mt-0.5 text-neutral-900">
            {exclusivityLabel(license.exclusivity)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-neutral-500">Duration</dt>
          <dd className="mt-0.5 text-neutral-900">
            {formatRightsDuration(license.starts_at, license.ends_at)}
          </dd>
        </div>
      </dl>

      {license.registry_href ? (
        <a
          href={license.registry_href}
          className="mt-4 inline-flex text-[13px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
        >
          View registry rights ledger
        </a>
      ) : null}
    </article>
  );
}
