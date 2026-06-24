"use client";

import type { ReactNode } from "react";

import type { DealIntent } from "@/lib/deal-intents";
import { formatTermValue } from "@/lib/deal-intents";

type Props = {
  intent: DealIntent;
  title: string;
  terms: Record<string, string>;
  correspondence: string;
  counterpartyLabel: string;
};

function section(title: string, children: ReactNode) {
  return (
    <div className="rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-7">
      <h3 className="font-serif text-lg font-normal tracking-tight text-neutral-950">
        {title}
      </h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function DealProposalReview({
  intent,
  title,
  terms,
  correspondence,
  counterpartyLabel,
}: Props) {
  const filledFields = intent.fields.filter((field) => {
    const raw = String(terms[field.key] ?? "").trim();
    return Boolean(raw);
  });

  return (
    <div className="space-y-5">
      {section(
        "Proposal",
        <dl className="space-y-4">
          <div className="grid grid-cols-1 gap-1 border-b border-neutral-900/[0.06] pb-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="text-[13px] font-medium text-neutral-600">Intent</dt>
            <dd className="text-[14px] leading-relaxed text-neutral-900">{intent.label}</dd>
          </div>
          <div className="grid grid-cols-1 gap-1 border-b border-neutral-900/[0.06] pb-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="text-[13px] font-medium text-neutral-600">Title</dt>
            <dd className="text-[14px] leading-relaxed text-neutral-900">{title}</dd>
          </div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="text-[13px] font-medium text-neutral-600">Counterparty</dt>
            <dd className="text-[14px] leading-relaxed text-neutral-900">
              {counterpartyLabel}
            </dd>
          </div>
        </dl>
      )}

      {section(
        "Terms",
        filledFields.length === 0 ? (
          <p className="text-[14px] leading-relaxed text-neutral-500">
            No additional terms recorded.
          </p>
        ) : (
          <dl className="space-y-4">
            {filledFields.map((field) => (
              <div
                key={field.key}
                className="grid grid-cols-1 gap-1 border-b border-neutral-900/[0.06] pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[9rem_1fr] sm:gap-4"
              >
                <dt className="text-[13px] font-medium text-neutral-600">{field.label}</dt>
                <dd className="text-[14px] leading-relaxed text-neutral-900">
                  {formatTermValue(field, terms[field.key])}
                </dd>
              </div>
            ))}
          </dl>
        )
      )}

      {section(
        "Opening correspondence",
        <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-neutral-800">
          {correspondence.trim() || "No opening message recorded."}
        </p>
      )}
    </div>
  );
}
