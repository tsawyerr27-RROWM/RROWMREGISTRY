"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { FieldOpportunityCard } from "@/lib/fetch-field-opportunities-list";
import { fillMessage } from "@/lib/locale-messages";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

export type OpportunityExplorerCardVariant = "featured" | "standard";

type Props = {
  row: FieldOpportunityCard;
  variant?: OpportunityExplorerCardVariant;
  accentIndex?: number;
};

const ATMOSPHERE_PALETTES = [
  { wash: "#e8e4df", glow: "#dfe8e3", veil: "rgba(74, 93, 82, 0.07)" },
  { wash: "#ebe6df", glow: "#e3dcd4", veil: "rgba(92, 74, 58, 0.08)" },
  { wash: "#e4e6eb", glow: "#d8dce6", veil: "rgba(58, 68, 92, 0.07)" },
  { wash: "#ebe4e8", glow: "#e6dce3", veil: "rgba(92, 58, 74, 0.07)" },
  { wash: "#e6ebe4", glow: "#dce6d8", veil: "rgba(58, 92, 68, 0.07)" },
] as const;

function formatDeadline(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function paletteForRow(row: FieldOpportunityCard, accentIndex: number) {
  const seed = `${row.sector}:${row.id}:${accentIndex}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % ATMOSPHERE_PALETTES.length;
  }
  return ATMOSPHERE_PALETTES[hash];
}

function QuietBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "open" | "closed" | "verified";
}) {
  const toneClass =
    tone === "open"
      ? "bg-emerald-950/[0.06] text-emerald-950/85 ring-emerald-900/[0.1]"
      : tone === "closed"
        ? "bg-neutral-950/[0.04] text-neutral-500 ring-neutral-900/[0.07]"
        : tone === "verified"
          ? "bg-neutral-950/[0.05] text-neutral-700 ring-neutral-900/[0.08]"
          : "bg-white/50 text-neutral-600 ring-neutral-900/[0.07]";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ring-1 backdrop-blur-sm ${toneClass}`}
    >
      {children}
    </span>
  );
}

export function OpportunityExplorerCard({
  row,
  variant = "standard",
  accentIndex = 0,
}: Props) {
  const { t } = useLocalePreferences();
  const deadline = formatDeadline(row.closesAt);
  const isFeatured = variant === "featured";
  const palette = paletteForRow(row, accentIndex);

  const deadlineLine = deadline
    ? fillMessage(t("field.opportunities.closesOn"), { date: deadline })
    : t("field.opportunities.deadlineNotSet");

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.75rem] ring-1 ring-neutral-900/[0.06] transition duration-500 ease-out hover:-translate-y-1 hover:ring-neutral-900/[0.1] ${
        isFeatured
          ? "min-h-[320px] shadow-[0_24px_70px_-48px_rgba(15,23,42,0.28)] hover:shadow-[0_36px_90px_-42px_rgba(15,23,42,0.32)] md:min-h-[380px] lg:min-h-[420px]"
          : "min-h-[240px] shadow-[0_18px_50px_-40px_rgba(15,23,42,0.22)] hover:shadow-[0_28px_70px_-38px_rgba(15,23,42,0.28)] md:min-h-[280px]"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition duration-700 ease-out group-hover:scale-[1.02]"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(145deg, ${palette.wash} 0%, rgba(255,255,255,0.92) 48%, ${palette.glow} 100%)`,
          }}
        />
        <div
          className="absolute -left-[12%] top-[-20%] h-[70%] w-[55%] rounded-full opacity-80 blur-[80px] transition duration-700 group-hover:opacity-100 group-hover:blur-[96px]"
          style={{ backgroundColor: palette.wash }}
        />
        <div
          className="absolute -right-[8%] bottom-[-25%] h-[65%] w-[50%] rounded-full opacity-70 blur-[72px] transition duration-700 group-hover:opacity-95 group-hover:blur-[88px]"
          style={{ backgroundColor: palette.glow }}
        />
        <div
          className="absolute inset-0 opacity-60 transition duration-500 group-hover:opacity-80"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 20% 100%, ${palette.veil}, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/10" />
      </div>

      <Link
        href={row.href}
        className="absolute inset-0 z-20 rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-4"
      >
        <span className="sr-only">
          {row.title}, {row.organisationName}
        </span>
      </Link>

      <div
        className={`relative z-10 flex h-full flex-col justify-between ${
          isFeatured ? "p-8 md:p-10 lg:p-12" : "p-6 md:p-7 lg:p-8"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <QuietBadge tone={row.acceptingResponses ? "open" : "closed"}>
            {row.acceptingResponses
              ? t("field.opportunities.windowOpen")
              : t("field.opportunities.windowClosed")}
          </QuietBadge>
          <QuietBadge>{row.briefTypeLabel}</QuietBadge>
          {row.sectorLabel ? (
            <span
              className={`text-[11px] font-medium text-neutral-500 transition duration-500 group-hover:text-neutral-600 ${
                isFeatured ? "md:ml-auto" : ""
              }`}
            >
              {row.sectorLabel}
            </span>
          ) : null}
        </div>

        <div className={isFeatured ? "mt-auto pt-10 md:pt-12" : "mt-auto pt-8"}>
          <h2
            className={`font-serif font-normal tracking-tight text-neutral-950 transition duration-500 group-hover:text-neutral-800 ${
              isFeatured
                ? "text-[2rem] leading-[1.06] md:text-[2.75rem] lg:text-[3.25rem]"
                : "text-[1.45rem] leading-[1.1] md:text-[1.65rem]"
            }`}
          >
            {row.title}
          </h2>

          <p
            className={`mt-4 font-medium text-neutral-800 transition duration-500 group-hover:text-neutral-900 ${
              isFeatured ? "text-base md:text-lg" : "text-sm md:text-[15px]"
            }`}
          >
            {row.organisationName}
            {row.organisationVerified ? (
              <span className="ml-2 inline-flex align-middle">
                <QuietBadge tone="verified">
                  {t("field.opportunities.verifiedOrganisation")}
                </QuietBadge>
              </span>
            ) : null}
          </p>

          <p
            className={`mt-3 text-neutral-600 transition duration-500 group-hover:text-neutral-700 ${
              isFeatured ? "text-sm md:text-base" : "text-sm"
            }`}
          >
            {deadlineLine}
          </p>

          {isFeatured && row.descriptionExcerpt ? (
            <p className="mt-6 line-clamp-3 max-w-3xl text-[15px] leading-[1.75] text-neutral-600 transition duration-500 group-hover:text-neutral-700 md:line-clamp-4 md:text-base md:leading-[1.7]">
              {row.descriptionExcerpt}
            </p>
          ) : null}

          {!isFeatured && row.descriptionExcerpt ? (
            <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-neutral-600 transition duration-500 group-hover:text-neutral-700">
              {row.descriptionExcerpt}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
