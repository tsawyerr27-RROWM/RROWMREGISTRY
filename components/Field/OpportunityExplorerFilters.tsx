"use client";

import { CULTURAL_SECTOR_OPTIONS } from "@/lib/cultural-sectors";
import type {
  FieldOpportunityListParams,
  FieldOpportunitySort,
  FieldOpportunityWindowFilter,
} from "@/lib/field-opportunity-params";
import { BRIEF_TYPES, briefTypeLabel, type BriefType } from "@/lib/opportunity-types";
import { PRACTICE_TYPES } from "@/lib/practice-types";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldV2 } from "@/styles/field-v2";

type Props = {
  action: string;
  q: string;
  sector: string;
  practice: string;
  briefType: BriefType | "";
  window: FieldOpportunityWindowFilter;
  sort: FieldOpportunitySort;
  formKey: string;
};

export function OpportunityExplorerFilters({
  action,
  q,
  sector,
  practice,
  briefType,
  window,
  sort,
  formKey,
}: Props) {
  const { t } = useLocalePreferences();

  const inputClass = fieldV2.form.field;
  const selectClass = inputClass;
  const labelClass = fieldV2.form.label;

  return (
    <form
      key={formKey}
      method="get"
      action={action}
      className="field-v2-filters p-6 md:p-7"
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-3">
          <label htmlFor="field-opp-q" className={labelClass}>
            {t("field.opportunities.filter.search")}
          </label>
          <input
            id="field-opp-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder={t("field.opportunities.filter.searchPlaceholder")}
            autoComplete="off"
            className={inputClass}
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="field-opp-sector" className={labelClass}>
            {t("field.opportunities.filter.sector")}
          </label>
          <select
            id="field-opp-sector"
            name="sector"
            defaultValue={sector}
            className={selectClass}
          >
            <option value="">{t("field.opportunities.filter.allSectors")}</option>
            {CULTURAL_SECTOR_OPTIONS.map((opt) => (
              <option key={opt.slug} value={opt.slug}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="field-opp-practice" className={labelClass}>
            {t("field.opportunities.filter.practice")}
          </label>
          <select
            id="field-opp-practice"
            name="practice"
            defaultValue={practice}
            className={selectClass}
          >
            <option value="">{t("field.opportunities.filter.allPractices")}</option>
            {PRACTICE_TYPES.map((opt) => (
              <option key={opt.slug} value={opt.slug}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="field-opp-type" className={labelClass}>
            {t("field.opportunities.filter.type")}
          </label>
          <select
            id="field-opp-type"
            name="type"
            defaultValue={briefType}
            className={selectClass}
          >
            <option value="">{t("field.opportunities.filter.allTypes")}</option>
            {BRIEF_TYPES.map((type) => (
              <option key={type} value={type}>
                {briefTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-1">
          <label htmlFor="field-opp-window" className={labelClass}>
            {t("field.opportunities.filter.window")}
          </label>
          <select
            id="field-opp-window"
            name="window"
            defaultValue={window}
            className={selectClass}
          >
            <option value="all">{t("field.opportunities.filter.allWindows")}</option>
            <option value="open">{t("field.opportunities.filter.open")}</option>
            <option value="closed">{t("field.opportunities.filter.closed")}</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="field-opp-sort" className={labelClass}>
            {t("field.opportunities.filter.sort")}
          </label>
          <select id="field-opp-sort" name="sort" defaultValue={sort} className={selectClass}>
            <option value="closing">{t("field.opportunities.sort.closing")}</option>
            <option value="published">{t("field.opportunities.sort.published")}</option>
            <option value="title">{t("field.opportunities.sort.title")}</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          className="rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          {t("field.opportunities.filter.apply")}
        </button>
      </div>
    </form>
  );
}
