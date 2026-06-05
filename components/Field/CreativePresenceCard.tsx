import Link from "next/link";

import type { CreativeExplorerRow } from "@/lib/fetch-creative-explorer-list";

type Props = {
  row: CreativeExplorerRow;
};

function PracticeChip({
  label,
  source,
}: {
  label: string;
  source: "registry" | "declared";
}) {
  const base =
    "inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium leading-tight";
  if (source === "registry") {
    return (
      <span
        className={`${base} border border-emerald-200/80 bg-emerald-50/90 text-emerald-950/85`}
        title="Inferred from verified registry records"
      >
        {label}
      </span>
    );
  }
  return (
    <span
      className={`${base} border border-neutral-200/80 bg-neutral-50/95 text-neutral-700`}
      title="Declared on profile"
    >
      {label}
    </span>
  );
}

export function CreativePresenceCard({ row }: Props) {
  const verificationParts: string[] = [];
  if (row.verifiedWorkCount > 0) {
    verificationParts.push(
      `${row.verifiedWorkCount} verified on file`
    );
  } else if (row.artistVerified) {
    verificationParts.push("Artist confirmation on file");
  }
  if (row.institutionVerified) {
    verificationParts.push("Institution-linked");
  }

  return (
    <article className="flex h-full flex-col rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/90 p-6 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.14)] transition duration-300 hover:-translate-y-0.5 hover:border-neutral-900/[0.09] hover:shadow-[0_24px_48px_-28px_rgba(15,23,42,0.18)] md:p-7">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
        Creative
      </p>

      <h2 className="mt-2 font-serif text-2xl font-normal leading-snug tracking-tight text-neutral-950">
        <Link href={row.href} className="transition hover:text-neutral-600">
          {row.displayName}
        </Link>
      </h2>

      {row.practices.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {row.practices.slice(0, 4).map((practice) => (
            <PracticeChip
              key={`${practice.slug}-${practice.source}`}
              label={practice.label}
              source={practice.source}
            />
          ))}
          {row.practices.length > 4 ? (
            <span className="self-center text-[11px] text-neutral-400">
              +{row.practices.length - 4}
            </span>
          ) : null}
        </div>
      ) : null}

      {verificationParts.length > 0 ? (
        <p className="mt-4 text-[11px] leading-relaxed text-neutral-500">
          {verificationParts.join(" · ")}
        </p>
      ) : null}

      {row.bioExcerpt ? (
        <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-600">
          {row.bioExcerpt}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-6 flex items-end justify-between gap-4 border-t border-neutral-900/[0.05] pt-5">
        <p className="text-[11px] text-neutral-500">
          {row.totalWorkCount > 0
            ? `${row.totalWorkCount} ${row.totalWorkCount === 1 ? "work" : "works"} on registry`
            : "Registry footprint forming"}
        </p>
        <Link
          href={row.href}
          className="shrink-0 text-sm font-medium text-emerald-900 underline decoration-emerald-900/25 underline-offset-[3px] hover:decoration-emerald-900/50"
        >
          View profile
        </Link>
      </div>
    </article>
  );
}
