"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
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
      <label htmlFor="field-explorer-hub-q" className="text-sm font-medium text-neutral-800">
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
          className="min-w-0 flex-1 rounded-xl border border-neutral-900/[0.08] bg-white/90 px-4 py-3.5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-900/12"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-neutral-950 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
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
