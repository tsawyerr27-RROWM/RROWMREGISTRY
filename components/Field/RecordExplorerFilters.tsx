"use client";

import { PRACTICE_TYPES } from "@/lib/practice-types";
import {
  RECORD_EXPLORER_TRUST_FILTERS,
  type RecordExplorerCertificateFilter,
  type RecordExplorerSort,
  type RecordExplorerTrustFilter,
} from "@/lib/field-record-explorer-params";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldV2 } from "@/styles/field-v2";

type Props = {
  action: string;
  q: string;
  sort: RecordExplorerSort;
  creative: string;
  organisation: string;
  practice: string;
  trust: RecordExplorerTrustFilter;
  certificate: RecordExplorerCertificateFilter;
  formKey: string;
};

export function RecordExplorerFilters({
  action,
  q,
  sort,
  creative,
  organisation,
  practice,
  trust,
  certificate,
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
          <label htmlFor="field-record-q" className={labelClass}>
            {t("field.explorer.records.filter.search")}
          </label>
          <input
            id="field-record-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder={t("field.explorer.records.filter.searchPlaceholder")}
            autoComplete="off"
            className={inputClass}
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="field-record-creative" className={labelClass}>
            {t("field.explorer.records.filter.creative")}
          </label>
          <input
            id="field-record-creative"
            name="creative"
            type="text"
            defaultValue={creative}
            placeholder={t("field.explorer.records.filter.creativePlaceholder")}
            autoComplete="off"
            className={inputClass}
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="field-record-organisation" className={labelClass}>
            {t("field.explorer.records.filter.organisation")}
          </label>
          <input
            id="field-record-organisation"
            name="organisation"
            type="text"
            defaultValue={organisation}
            placeholder={t("field.explorer.records.filter.organisationPlaceholder")}
            autoComplete="off"
            className={inputClass}
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="field-record-practice" className={labelClass}>
            {t("field.explorer.records.filter.practice")}
          </label>
          <select
            id="field-record-practice"
            name="practice"
            defaultValue={practice}
            className={selectClass}
          >
            <option value="">{t("field.explorer.records.filter.allPractices")}</option>
            {PRACTICE_TYPES.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-3">
          <label htmlFor="field-record-sort" className={labelClass}>
            {t("field.explorer.records.filter.sort")}
          </label>
          <select
            id="field-record-sort"
            name="sort"
            defaultValue={sort}
            className={selectClass}
          >
            <option value="recent">{t("field.explorer.records.sort.recent")}</option>
            <option value="title_asc">{t("field.explorer.creatives.sort.nameAsc")}</option>
            <option value="title_desc">{t("field.explorer.creatives.sort.nameDesc")}</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="field-record-trust" className={labelClass}>
            {t("field.explorer.records.filter.trust")}
          </label>
          <select
            id="field-record-trust"
            name="trust"
            defaultValue={trust}
            className={selectClass}
          >
            {RECORD_EXPLORER_TRUST_FILTERS.map((tier) => (
              <option key={tier} value={tier}>
                {t(`field.explorer.records.filter.trust.${tier}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="field-record-certificate" className={labelClass}>
            {t("field.explorer.records.filter.certificate")}
          </label>
          <select
            id="field-record-certificate"
            name="certificate"
            defaultValue={certificate === "present" ? "1" : ""}
            className={selectClass}
          >
            <option value="">{t("field.explorer.records.filter.allCertificates")}</option>
            <option value="1">{t("field.explorer.records.filter.certificateOnly")}</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          className="rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          {t("field.explorer.records.filter.apply")}
        </button>
      </div>
    </form>
  );
}
