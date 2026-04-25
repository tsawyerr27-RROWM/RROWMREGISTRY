"use client";

import { useState, type ReactNode } from "react";

type TabId = "provenance" | "value" | "verification";

const tabs: { id: TabId; label: string }[] = [
  { id: "provenance", label: "Provenance" },
  { id: "value", label: "Value" },
  { id: "verification", label: "Verification" },
];

export function RegistryRecordTabs({
  provenance,
  valuePanel,
  verificationPanel,
}: {
  provenance: ReactNode;
  valuePanel: ReactNode;
  verificationPanel: ReactNode;
}) {
  const [active, setActive] = useState<TabId>("provenance");

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-2xl border border-black/[0.06] bg-white/80 p-1 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`rounded-xl px-4 py-2.5 text-xs font-medium transition ${
              active === t.id
                ? "bg-neutral-900 text-white shadow-sm"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-8">{active === "provenance" && provenance}</div>
      <div className="mt-8">{active === "value" && valuePanel}</div>
      <div className="mt-8">{active === "verification" && verificationPanel}</div>
    </div>
  );
}
