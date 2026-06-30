"use client";

import type {
  OrganisationExplorerRepresentedFilter,
  OrganisationExplorerSort,
  OrganisationExplorerVerifiedFilter,
} from "@/lib/field-organisation-explorer-params";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldV2 } from "@/styles/field-v2";

type Props = {
  action: string;
  q: string;
  sort: OrganisationExplorerSort;
  location: string;
  verified: OrganisationExplorerVerifiedFilter;
  represented: OrganisationExplorerRepresentedFilter;
  formKey: string;
};

export function OrganisationExplorerFilters({
  action,
  q,
  sort,
  location,
  verified,
  represented,
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
          <label htmlFor="field-org-q" className={labelClass}>
            {t("field.explorer.organisations.filter.search")}
          </label>
          <input
            id="field-org-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder={t("field.explorer.organisations.filter.searchPlaceholder")}
            autoComplete="off"
            className={inputClass}
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="field-org-location" className={labelClass}>
            {t("field.explorer.organisations.filter.location")}
          </label>
          <input
            id="field-org-location"
            name="location"
            type="search"
            defaultValue={location}
            placeholder={t("field.explorer.organisations.filter.locationPlaceholder")}
            autoComplete="off"
            className={inputClass}
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="field-org-verified" className={labelClass}>
            {t("field.explorer.organisations.filter.verification")}
          </label>
          <select
            id="field-org-verified"
            name="verified"
            defaultValue={verified === "verified" ? "1" : ""}
            className={selectClass}
          >
            <option value="">
              {t("field.explorer.organisations.filter.allOrganisations")}
            </option>
            <option value="1">
              {t("field.explorer.organisations.filter.verifiedOnly")}
            </option>
          </select>
          <p className="mt-2 text-xs text-neutral-500">
            {t("field.explorer.organisations.filter.verifiedHint")}
          </p>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="field-org-represented" className={labelClass}>
            {t("field.explorer.organisations.filter.representation")}
          </label>
          <select
            id="field-org-represented"
            name="represented"
            defaultValue={represented === "represented" ? "1" : ""}
            className={selectClass}
          >
            <option value="">
              {t("field.explorer.organisations.filter.allParticipation")}
            </option>
            <option value="1">
              {t("field.explorer.organisations.filter.withRepresented")}
            </option>
          </select>
          <p className="mt-2 text-xs text-neutral-500">
            {t("field.explorer.organisations.filter.representationHint")}
          </p>
        </div>

        <div className="lg:col-span-3">
          <label htmlFor="field-org-sort" className={labelClass}>
            {t("field.explorer.organisations.filter.sort")}
          </label>
          <select
            id="field-org-sort"
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
          {t("field.explorer.organisations.filter.apply")}
        </button>
      </div>
    </form>
  );
}
