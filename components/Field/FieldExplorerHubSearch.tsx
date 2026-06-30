"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldV2 } from "@/styles/field-v2";
import {
  FIELD_SEARCH_QUERY_PARAM,
  resolveFieldHubSearchRoute,
} from "@/lib/field-search-contract";

export function FieldExplorerHubSearch() {
  const router = useRouter();
  const { t } = useLocalePreferences();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-10 max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        const route = resolveFieldHubSearchRoute(query);
        if (!route) {
          setError(t("field.explorer.hub.searchRequired"));
          return;
        }
        setError(null);
        router.push(route.href);
      }}
    >
      <label htmlFor="field-explorer-hub-q" className={fieldV2.form.label}>
        {t("field.explorer.hub.searchLabel")}
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="field-explorer-hub-q"
          name={FIELD_SEARCH_QUERY_PARAM}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("field.explorer.hub.searchPlaceholder")}
          autoComplete="off"
          className={`min-w-0 flex-1 ${fieldV2.form.field} !mt-0`}
        />
        <button
          type="submit"
          className="v2-cta-primary inline-flex shrink-0 !min-h-0 px-6 py-3.5 text-sm"
        >
          {t("field.explorer.hub.searchSubmit")}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-amber-900">{error}</p>
      ) : (
        <p className="mt-2 text-xs text-neutral-500">{t("field.explorer.hub.searchHint")}</p>
      )}
    </form>
  );
}
