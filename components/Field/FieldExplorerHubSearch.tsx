"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldV2 } from "@/styles/field-v2";
import {
  FIELD_SEARCH_QUERY_PARAM,
  resolveFieldHubSearchRoute,
} from "@/lib/field-search-contract";

type Props = {
  initialQuery?: string;
};

export function FieldExplorerHubSearch({ initialQuery = "" }: Props) {
  const router = useRouter();
  const { t } = useLocalePreferences();
  const [query, setQuery] = useState(initialQuery);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <form
      className="max-w-2xl"
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
          className="v2-cta-primary inline-flex min-h-[44px] shrink-0 items-center px-6 py-3 text-sm"
        >
          {t("field.explorer.hub.searchSubmit")}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-amber-900">{error}</p> : null}
    </form>
  );
}
