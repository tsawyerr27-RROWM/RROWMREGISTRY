"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { RightsLicenseRow } from "@/components/Rights/RightsLicenseRow";
import { StudioContentSlab } from "@/components/Studio/StudioContentSlab";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { RightsLedgerLicenseView } from "@/lib/rights-ledger";
import { filterStudioRightsLicenses } from "@/lib/rights-ledger";
import {
  studioRightsTabLabel,
  type StudioRightsTabId,
} from "@/lib/rights-summary";
import { studioV2 } from "@/styles/studio-v2";

type Props = {
  userId: string;
  initialLicenseId?: string | null;
};

const TABS: StudioRightsTabId[] = ["active", "expiring", "historical"];

export function StudioRightsWorkspace({
  userId,
  initialLicenseId = null,
}: Props) {
  const { t } = useLocalePreferences();
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
    <div className={`${studioV2.scope} min-h-0`}>
      <header className="mb-8 max-w-2xl border-b border-[var(--v2-border)] pb-6">
        <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
          {t("footer.rightsLedger")}
        </p>
        <h1 className="mt-2 font-serif text-[1.75rem] font-normal tracking-tight text-[var(--v2-ink)] md:text-[2rem]">
          Rights ledger
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--v2-ink-muted)]">
          Active grants, approaching expiries, and historical rights agreements
          recorded across your studio participation.
        </p>
      </header>

      <div
        className="mb-6 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Rights ledger archive"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md border px-3.5 py-1.5 v2-type-mono text-[10px] uppercase tracking-[0.12em] transition motion-reduce:transition-none ${
                selected
                  ? "border-[var(--v2-ink)] bg-[var(--v2-ink)] text-white"
                  : "border-[var(--v2-border)] bg-white/80 text-[var(--v2-ink-muted)] hover:border-[var(--v2-border-strong)] hover:text-[var(--v2-ink)]"
              }`}
            >
              {studioRightsTabLabel(tab)}
              <span className="ml-1.5 tabular-nums opacity-80">({tabCounts[tab]})</span>
            </button>
          );
        })}
      </div>

      <StudioContentSlab title={studioRightsTabLabel(activeTab)}>
        {loading ? (
          <p className="text-[15px] text-[var(--v2-ink-muted)]">Loading rights ledger.</p>
        ) : loadError ? (
          <div className="rounded-lg border border-[var(--v2-amber-exception-dim)] bg-[var(--v2-amber-exception-dim)]/30 px-4 py-3">
            <p className="text-sm leading-relaxed text-[var(--v2-ink)]">{loadError}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="v2-cta-secondary mt-4 min-h-[44px] px-4 py-2 text-xs"
            >
              Try again
            </button>
          </div>
        ) : tabbed.length === 0 ? (
          <div className="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
              {t("studio.shell.onFile")}
            </p>
            <h2 className="mt-3 font-serif text-xl font-normal tracking-tight text-[var(--v2-ink)]">
              No {studioRightsTabLabel(activeTab).toLowerCase()} licenses on file
            </h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[var(--v2-ink-muted)]">
              Rights filed from accepted licensing deals will appear here once
              activated on the record.
            </p>
          </div>
        ) : (
          <ul className="studio-reveal-stagger space-y-4">
            {tabbed.map((license, index) => (
              <li
                key={license.id}
                style={{ "--reveal-index": index } as CSSProperties}
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
      </StudioContentSlab>
    </div>
  );
}
