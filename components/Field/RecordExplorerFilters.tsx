"use client";

import { PRACTICE_TYPES } from "@/lib/practice-types";
import type {
  RecordExplorerCertificateFilter,
  RecordExplorerSort,
  RecordExplorerVerifiedFilter,
} from "@/lib/field-record-explorer-params";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  action: string;
  q: string;
  sort: RecordExplorerSort;
  creative: string;
  organisation: string;
  practice: string;
  verified: RecordExplorerVerifiedFilter;
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
  verified,
  certificate,
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
          <label htmlFor="field-record-verified" className={labelClass}>
            {t("field.explorer.records.filter.verification")}
          </label>
          <select
            id="field-record-verified"
            name="verified"
            defaultValue={verified === "verified" ? "1" : ""}
            className={selectClass}
          >
            <option value="">{t("field.explorer.records.filter.allRecords")}</option>
            <option value="1">{t("field.explorer.records.filter.verifiedOnly")}</option>
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
