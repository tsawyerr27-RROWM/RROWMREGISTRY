import type { OwnershipTimelineEntry } from "@/lib/canonical-ownership-engine";
import { formatOwnershipTransferTypeLabel } from "@/lib/format-registry-labels";

type Props = {
  entries: OwnershipTimelineEntry[];
  className?: string;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function OwnershipEventsChronology({ entries, className = "" }: Props) {
  if (!entries.length) {
    return (
      <p className={`text-sm text-neutral-500 ${className}`}>
        No ownership events recorded yet.
      </p>
    );
  }

  return (
    <ol className={`space-y-4 ${className}`}>
      {entries.map((entry) => {
        const transferLabel = entry.transfer_type
          ? formatOwnershipTransferTypeLabel(entry.transfer_type)
          : "Transfer";
        const price =
          entry.sale_price != null && entry.sale_currency
            ? `${entry.sale_currency} ${entry.sale_price.toLocaleString()}`
            : null;

        return (
          <li
            key={entry.id}
            className="rounded-xl border border-neutral-200/90 bg-white/80 px-4 py-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium text-neutral-900">{transferLabel}</p>
              <time
                className="text-[12px] text-neutral-500"
                dateTime={entry.created_at}
              >
                {formatDate(entry.created_at)}
              </time>
            </div>
            <dl className="mt-3 grid gap-2 text-[13px] text-neutral-700 sm:grid-cols-2">
              <div>
                <dt className="text-neutral-500">Previous holder</dt>
                <dd className="mt-0.5 font-medium text-neutral-900">
                  {entry.from_label ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">New holder</dt>
                <dd className="mt-0.5 font-medium text-neutral-900">
                  {entry.to_label ?? "—"}
                </dd>
              </div>
              {price ? (
                <div className="sm:col-span-2">
                  <dt className="text-neutral-500">Recorded value</dt>
                  <dd className="mt-0.5 font-medium text-neutral-900">{price}</dd>
                </div>
              ) : null}
              {entry.deal_id ? (
                <div className="sm:col-span-2">
                  <dt className="text-neutral-500">Deal reference</dt>
                  <dd className="mt-0.5 font-mono text-[12px] text-neutral-800">
                    {entry.deal_id}
                  </dd>
                </div>
              ) : null}
              {entry.provenance_transfer_id ? (
                <div className="sm:col-span-2">
                  <dt className="text-neutral-500">Provenance transfer</dt>
                  <dd className="mt-0.5 font-mono text-[12px] text-neutral-800">
                    {entry.provenance_transfer_id}
                  </dd>
                </div>
              ) : null}
            </dl>
          </li>
        );
      })}
    </ol>
  );
}
