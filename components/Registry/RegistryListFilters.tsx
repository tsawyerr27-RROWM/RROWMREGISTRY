"use client";

import type { ArtworkStatusFilter, RegistrySort } from "@/lib/registry-list-params";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  /** Form action, e.g. `/registry` */
  action: string;
  q: string;
  sort: RegistrySort;
  /** Re-mount form when URL changes so defaultValue updates */
  formKey: string;
  /** Prefix for input ids when multiple filter bars exist on one site */
  idPrefix?: string;
  /** Artist page: filter by verification */
  showStatusFilter?: boolean;
  status?: ArtworkStatusFilter;
  /** `glass` = default frosted tile. `explorer` = public registry index shell. */
  variant?: "glass" | "explorer";
};

export function RegistryListFilters({
  action,
  q,
  sort,
  formKey,
  idPrefix = "registry",
  showStatusFilter = false,
  status = "all",
  variant = "glass",
}: Props) {
  const { t } = useLocalePreferences();
  const qId = `${idPrefix}-q`;
  const sortId = `${idPrefix}-sort`;
  const statusId = `${idPrefix}-status`;

  const shell =
    variant === "explorer"
      ? "rounded-[1.25rem] border border-neutral-900/[0.07] bg-white/55 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-[8px]"
      : "liquid-glass-tile";

  const inputClass =
    variant === "explorer"
      ? "mt-2 w-full rounded-xl border border-neutral-900/[0.08] bg-white/85 px-4 py-3.5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-900/12"
      : "liquid-glass-inset mt-2 w-full border-0 px-5 py-3.5 text-neutral-900 placeholder:text-neutral-400 shadow-none focus:outline-none focus:ring-1 focus:ring-neutral-900/15";

  const selectClass =
    variant === "explorer"
      ? "mt-2 w-full rounded-xl border border-neutral-900/[0.08] bg-white/85 px-4 py-3.5 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-900/12"
      : "liquid-glass-inset mt-2 w-full border-0 px-4 py-3.5 text-sm text-neutral-900 shadow-none focus:outline-none focus:ring-1 focus:ring-neutral-900/15";

  return (
    <form
      key={formKey}
      method="get"
      action={action}
      className={`${shell} flex flex-col gap-5 p-6 md:flex-row md:flex-wrap md:items-end md:gap-5 md:p-7`}
    >
      <div className="min-w-0 flex-1">
        <label
          htmlFor={qId}
          className="text-sm font-medium text-neutral-700"
        >
          {t("registry.filters.search")}
        </label>
        <input
          id={qId}
          name="q"
          type="search"
          defaultValue={q}
          placeholder={t("registry.filters.searchPlaceholder")}
          autoComplete="off"
          className={inputClass}
        />
      </div>
      {showStatusFilter ? (
        <div className="w-full md:w-48">
          <label
            htmlFor={statusId}
            className="text-sm font-medium text-neutral-700"
          >
            {t("registry.filters.status")}
          </label>
          <select
            id={statusId}
            name="status"
            defaultValue={status}
            className={selectClass}
          >
            <option value="all">{t("registry.filters.allWorks")}</option>
            <option value="filed">{t("trust.tier.filed.label")}</option>
            <option value="self_attested">{t("trust.tier.self_attested.label")}</option>
            <option value="verified">{t("trust.tier.verified.label")}</option>
          </select>
        </div>
      ) : null}
      <div className="w-full md:w-56">
        <label
          htmlFor={sortId}
          className="text-sm font-medium text-neutral-700"
        >
          {t("registry.filters.sort")}
        </label>
        <select
          id={sortId}
          name="sort"
          defaultValue={sort}
          className={selectClass}
        >
          <option value="newest">{t("registry.filters.sortNewest")}</option>
          <option value="oldest">{t("registry.filters.sortOldest")}</option>
          <option value="title_asc">{t("registry.filters.sortTitleAsc")}</option>
          <option value="title_desc">{t("registry.filters.sortTitleDesc")}</option>
        </select>
      </div>
      <input type="hidden" name="page" value="1" />
      <div className="flex gap-3 md:pb-0.5">
        <button
          type="submit"
          className="rounded-xl bg-neutral-950 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
        >
          {t("registry.filters.apply")}
        </button>
      </div>
    </form>
  );
}
