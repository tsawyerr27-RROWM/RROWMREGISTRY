"use client";

import Link from "next/link";

import { studioCollectorArtworkHref } from "@/lib/studio-nav";

export type StudioAttentionLink = {
  registryId: string;
  title: string;
};

type Props = {
  claimed: StudioAttentionLink[];
  unresolvedSales: StudioAttentionLink[];
  unverifiedOwnership: StudioAttentionLink[];
};

function AttentionCard({
  label,
  count,
  items,
  emptyHint,
}: {
  label: string;
  count: number;
  items: StudioAttentionLink[];
  emptyHint: string;
}) {
  const preview = items.slice(0, 3);
  const more = Math.max(0, items.length - preview.length);

  return (
    <div className="liquid-glass-tile flex min-h-[7.5rem] flex-col px-4 py-4 transition hover:-translate-y-0.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-neutral-700">
          {label}
        </p>
        <span className="font-serif text-2xl font-normal tabular-nums text-neutral-900">
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="mt-3 text-xs leading-relaxed text-neutral-500">{emptyHint}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {preview.map((it) => (
            <li key={it.registryId}>
              <Link
                href={studioCollectorArtworkHref(it.registryId)}
                className="block truncate text-sm text-neutral-700 decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:underline"
              >
                {it.title}
              </Link>
            </li>
          ))}
          {more > 0 ? (
            <li className="text-[11px] text-neutral-400">+{more} more</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

export function StudioStatusBar({
  claimed,
  unresolvedSales,
  unverifiedOwnership,
}: Props) {
  const total =
    claimed.length + unresolvedSales.length + unverifiedOwnership.length;

  return (
    <section className="mt-10 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-normal text-neutral-950">
            Attention
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            What needs a moment of your time across your holdings.
          </p>
        </div>
        {total > 0 ? (
          <span className="bg-neutral-100/95 px-3 py-1 text-[11px] font-medium text-neutral-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
            {total} open {total === 1 ? "item" : "items"}
          </span>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <AttentionCard
          label="Ownership claims"
          count={claimed.length}
          items={claimed}
          emptyHint="No claimed ownership steps awaiting follow-up."
        />
        <AttentionCard
          label="Pending sales"
          count={unresolvedSales.length}
          items={unresolvedSales}
          emptyHint="Sale records are matched to transfers."
        />
        <AttentionCard
          label="Verification not recorded"
          count={unverifiedOwnership.length}
          items={unverifiedOwnership}
          emptyHint="Latest ledger step is verified when possible."
        />
      </div>
    </section>
  );
}
