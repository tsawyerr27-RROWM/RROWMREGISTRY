import { RightsLicenseRow } from "@/components/Rights/RightsLicenseRow";
import type { RightsLedgerGrouped } from "@/lib/rights-ledger";
import { rrowmRegistrySurface } from "@/styles/rrowm-theme";

type Props = {
  ledger: RightsLedgerGrouped;
  className?: string;
};

function RightsGroup({
  title,
  licenses,
  emptyCopy,
}: {
  title: string;
  licenses: RightsLedgerGrouped["active"];
  emptyCopy: string;
}) {
  return (
    <div>
      <h3 className="font-serif text-lg font-normal tracking-tight text-neutral-900">
        {title}
      </h3>
      {licenses.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {licenses.map((license) => (
            <li key={license.id}>
              <RightsLicenseRow variant="public" license={license} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[13px] leading-relaxed text-neutral-600">
          {emptyCopy}
        </p>
      )}
    </div>
  );
}

export function RightsLedgerSection({ ledger, className = "" }: Props) {
  const total =
    ledger.active.length + ledger.expired.length + ledger.revoked.length;

  return (
    <section
      id="rights-ledger"
      className={`${rrowmRegistrySurface.trustCompact} md:p-9 ${className}`}
    >
      <div className="border-b border-neutral-900/[0.06] pb-6">
        <h2 className="font-serif text-[1.75rem] font-normal tracking-tight text-neutral-950 md:text-2xl">
          Rights ledger
        </h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-neutral-600">
          Canonical rights grants filed against this work: active, expired, and
          revoked licenses on the archival record.
        </p>
      </div>

      {total === 0 ? (
        <p className="mt-8 text-[14px] leading-relaxed text-neutral-600">
          No rights licenses are on file for this work.
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          <RightsGroup
            title="Active licenses"
            licenses={ledger.active}
            emptyCopy="No active licenses on file."
          />
          <RightsGroup
            title="Expired licenses"
            licenses={ledger.expired}
            emptyCopy="No expired licenses on file."
          />
          <RightsGroup
            title="Revoked licenses"
            licenses={ledger.revoked}
            emptyCopy="No revoked licenses on file."
          />
        </div>
      )}
    </section>
  );
}
