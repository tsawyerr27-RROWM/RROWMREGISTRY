"use client";

import { PRACTICE_TYPES } from "@/lib/practice-types";
import type {
  CreativeExplorerSort,
  CreativeExplorerVerifiedFilter,
} from "@/lib/field-creative-explorer-params";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  action: string;
  q: string;
  sort: CreativeExplorerSort;
  practice: string;
  verified: CreativeExplorerVerifiedFilter;
  formKey: string;
};

export function CreativeExplorerFilters({
  action,
  q,
  sort,
  practice,
  verified,
  formKey,
}: Props) {
  const { t } = useLocalePreferences();

  const inputClass =
    "mt-2 w-full rounded-xl border border-neutral-900/[0.08] bg-white/85 px-4 py-3.5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-900/12";
  const selectClass = inputClass;
  const labelClass = "text-sm font-medium text-neutral-700";

  return (
    <form
      key={formKey}
      method="get"
      action={action}
      className="rounded-[1.25rem] border border-neutral-900/[0.07] bg-white/55 p-6 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-[8px] md:p-7"
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-4">
          <label htmlFor="field-creative-q" className={labelClass}>
            {t("field.explorer.creatives.filter.search")}
          </label>
          <input
            id="field-creative-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder={t("field.explorer.creatives.filter.searchPlaceholder")}
            autoComplete="off"
            className={inputClass}
          />
        </div>

        <div className="lg:col-span-3">
          <label htmlFor="field-creative-practice" className={labelClass}>
            {t("field.explorer.creatives.filter.practice")}
          </label>
          <select
            id="field-creative-practice"
            name="practice"
            defaultValue={practice}
            className={selectClass}
          >
            <option value="">{t("field.explorer.creatives.filter.allPractices")}</option>
            {PRACTICE_TYPES.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-neutral-500">
            {t("field.explorer.creatives.filter.practiceHint")}
          </p>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="field-creative-verified" className={labelClass}>
            {t("field.explorer.creatives.filter.verification")}
          </label>
          <select
            id="field-creative-verified"
            name="verified"
            defaultValue={verified === "verified" ? "1" : ""}
            className={selectClass}
          >
            <option value="">{t("field.explorer.creatives.filter.allCreatives")}</option>
            <option value="1">{t("field.explorer.creatives.filter.verifiedOnly")}</option>
          </select>
          <p className="mt-2 text-xs text-neutral-500">
            {t("field.explorer.creatives.filter.verifiedHint")}
          </p>
        </div>

        <div className="lg:col-span-3">
          <label htmlFor="field-creative-sort" className={labelClass}>
            {t("field.explorer.creatives.filter.sort")}
          </label>
          <select
            id="field-creative-sort"
            name="sort"
            defaultValue={sort}
            className={selectClass}
          >
            <option value="name_asc">{t("field.explorer.creatives.sort.nameAsc")}</option>
            <option value="name_desc">{t("field.explorer.creatives.sort.nameDesc")}</option>
            <option value="recent">{t("field.explorer.creatives.sort.recent")}</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          className="rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          {t("field.explorer.creatives.filter.apply")}
        </button>
      </div>
    </form>
  );
}
