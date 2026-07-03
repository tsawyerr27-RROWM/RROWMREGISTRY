"use client";

import type { CSSProperties } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { MessageKey } from "@/lib/locale-messages";
import type { StudioRole } from "@/components/Studio/StudioShell";
import { studioV2 } from "@/styles/studio-v2";

export type StudioRoleBandRole = "creative" | "collector" | "organisation";

export type StudioRoleBandMetric = {
  label: string;
  value: string | number | null | undefined;
};

type Props = {
  role: StudioRoleBandRole;
  title: string;
  subtitle: string;
  metrics?: readonly StudioRoleBandMetric[];
  className?: string;
};

const ROLE_STAMP_KEY: Record<StudioRoleBandRole, MessageKey> = {
  creative: "studio.roleBand.stamp.creative",
  collector: "studio.roleBand.stamp.collector",
  organisation: "studio.roleBand.stamp.organisation",
};

function formatMetricValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

export function studioRoleBandRoleFromStudioRole(
  role: StudioRole
): StudioRoleBandRole {
  if (role === "artist") return "creative";
  if (role === "collector") return "collector";
  return "organisation";
}

export function studioRoleBandCopy(
  role: StudioRoleBandRole,
  t: (key: MessageKey) => string
): { title: string; subtitle: string } {
  return {
    title: t(`studio.roleBand.${role}.title`),
    subtitle: t(`studio.roleBand.${role}.subtitle`),
  };
}

export function StudioRoleBand({
  role,
  title,
  subtitle,
  metrics,
  className = "",
}: Props) {
  const { t } = useLocalePreferences();
  const stamp = t(ROLE_STAMP_KEY[role]);

  return (
    <section
      className={`studio-reveal ${studioV2.scope} mb-6 md:mb-8 ${className}`.trim()}
      aria-label={title}
    >
      <div
        className={`${studioV2.surface.filingSheetMajor} relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7`}
      >
        <div className="relative z-[1] flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="min-w-0 max-w-2xl">
            <p className="flex flex-wrap items-center gap-2">
              <span className={`${studioV2.type.railLabel} text-[var(--v2-ink-muted)]`}>
                {t("studio.roleBand.rail")}
              </span>
              <span className="studio-execution-stamp studio-execution-stamp--active">
                {stamp}
              </span>
            </p>
            <h1 className={`${studioV2.type.commandTitle} mt-3 md:mt-4`}>{title}</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--v2-ink-muted)] md:text-[15px]">
              {subtitle}
            </p>
          </div>

          {metrics && metrics.length > 0 ? (
            <dl className="studio-reveal-stagger flex w-full flex-wrap gap-2 sm:gap-2.5 lg:max-w-md lg:justify-end xl:max-w-lg">
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  style={{ "--reveal-index": index } as CSSProperties}
                  className="min-w-[5.75rem] flex-1 rounded-lg border border-[var(--v2-border)] bg-white/85 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:min-w-[6.25rem] sm:flex-none"
                >
                  <dt className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                    {metric.label}
                  </dt>
                  <dd className="mt-1 font-serif text-xl tabular-nums leading-none tracking-tight text-[var(--v2-ink)] md:text-[1.35rem]">
                    {formatMetricValue(metric.value)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}
