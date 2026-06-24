"use client";

import type { DealIntent, DealIntentId } from "@/lib/deal-intents";
import { DEAL_INTENTS } from "@/lib/deal-intents";

type Props = {
  selectedId: DealIntentId | null;
  onSelect: (intent: DealIntent) => void;
};

export function DealIntentSelector({ selectedId, onSelect }: Props) {
  return (
    <div className="space-y-3">
      {DEAL_INTENTS.map((intent) => {
        const selected = intent.id === selectedId;
        return (
          <button
            key={intent.id}
            type="button"
            onClick={() => onSelect(intent)}
            className={[
              "w-full rounded-2xl border px-5 py-4 text-left transition duration-300",
              selected
                ? "border-neutral-900/[0.14] bg-white shadow-[0_12px_32px_-20px_rgba(15,23,42,0.18)]"
                : "border-neutral-900/[0.06] bg-white/70 hover:border-neutral-900/[0.1] hover:bg-white",
            ].join(" ")}
          >
            <h3 className="font-serif text-lg font-normal tracking-tight text-neutral-950">
              {intent.label}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">
              {intent.summary}
            </p>
          </button>
        );
      })}
    </div>
  );
}
