"use client";

import { useEffect, useMemo, useState } from "react";

import { RightsLicenseRow } from "@/components/Rights/RightsLicenseRow";
import type { RightsLedgerLicenseView } from "@/lib/rights-ledger";
import { filterStudioRightsLicenses } from "@/lib/rights-ledger";
import {
  studioRightsTabLabel,
  type StudioRightsTabId,
} from "@/lib/rights-summary";
import { workspace } from "@/styles/workspace-design";

type Props = {
  userId: string;
  initialLicenseId?: string | null;
};

const TABS: StudioRightsTabId[] = ["active", "expiring", "historical"];

export function StudioRightsWorkspace({
  userId,
  initialLicenseId = null,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [licenses, setLicenses] = useState<RightsLedgerLicenseView[]>([]);
  const [activeTab, setActiveTab] = useState<StudioRightsTabId>("active");

  const refresh = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/rights", { credentials: "include" });
      const payload = (await res.json().catch(() => ({}))) as {
        licenses?: RightsLedgerLicenseView[];
        error?: string;
      };
      if (!res.ok) {
        setLicenses([]);
        setLoadError(payload.error || `Could not load rights ledger (${res.status}).`);
        return;
      }
      setLicenses(Array.isArray(payload.licenses) ? payload.licenses : []);
    } catch {
      setLicenses([]);
      setLoadError("Could not load rights ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const tabbed = useMemo(
    () => filterStudioRightsLicenses(licenses, activeTab),
    [licenses, activeTab]
  );

  const tabCounts = useMemo(
    () =>
      TABS.reduce(
        (acc, tab) => {
          acc[tab] = filterStudioRightsLicenses(licenses, tab).length;
          return acc;
        },
        { active: 0, expiring: 0, historical: 0 } as Record<
          StudioRightsTabId,
          number
        >
      ),
    [licenses]
  );

  useEffect(() => {
    const highlight = String(initialLicenseId ?? "").trim();
    if (!highlight || licenses.length === 0) return;
    const match = licenses.find((license) => license.id === highlight);
    if (!match) return;
    if (match.status === "expired" || match.status === "revoked") {
      setActiveTab("historical");
      return;
    }
    const expiring = filterStudioRightsLicenses([match], "expiring").length > 0;
    setActiveTab(expiring ? "expiring" : "active");
  }, [initialLicenseId, licenses]);

  return (
    <div className="min-h-0">
      <div className="mb-8 max-w-2xl">
        <h1 className={workspace.type.sectionTitle}>Rights ledger</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">
          Active grants, approaching expiries, and historical rights agreements
          across your studio participation.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const selected = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
                selected
                  ? "border-neutral-900/[0.12] bg-neutral-950 text-white"
                  : "border-neutral-900/[0.08] bg-white/80 text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {studioRightsTabLabel(tab)}
              <span className="ml-1.5 text-[12px] opacity-80">
                ({tabCounts[tab]})
              </span>
            </button>
          );
        })}
      </div>

      <section className={`${workspace.panel.shell} min-h-[22rem] p-6 sm:p-8`}>
        {loading ? (
          <p className="text-[15px] text-neutral-500">Loading rights ledger.</p>
        ) : loadError ? (
          <p className="text-[15px] leading-relaxed text-neutral-700">{loadError}</p>
        ) : tabbed.length === 0 ? (
          <div className="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <h2 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
              No {studioRightsTabLabel(activeTab).toLowerCase()} licenses
            </h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-neutral-600">
              Rights filed from accepted licensing deals will appear here once
              activated.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {tabbed.map((license) => (
              <li
                key={license.id}
                id={
                  license.id === String(initialLicenseId ?? "").trim()
                    ? "highlighted-license"
                    : undefined
                }
              >
                <RightsLicenseRow variant="studio" license={license} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
