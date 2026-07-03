"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  FIELD_SEARCH_QUERY_PARAM,
  resolveFieldHubSearchRoute,
} from "@/lib/field-search-contract";
import { emitFieldIntelEvent } from "@/lib/field-intelligence-events";
import { fieldSignature } from "@/styles/field-signature";

type Props = {
  initialQuery?: string;
};

export function FieldSignatureHubSearch({ initialQuery = "" }: Props) {
  const router = useRouter();
  const { t } = useLocalePreferences();
  const [query, setQuery] = useState(initialQuery);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <form
      className="field-signature-archive-search max-w-2xl"
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
      <label htmlFor="field-signature-hub-q" className={fieldSignature.type.archiveSearchLabel}>
        {t("field.signature.archive.searchLabel")}
      </label>

      <div className="field-signature-archive-search__row mt-3">
        <span className={fieldSignature.type.archivePrompt} aria-hidden>
          &gt;
        </span>
        <input
          id="field-signature-hub-q"
          name={FIELD_SEARCH_QUERY_PARAM}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => emitFieldIntelEvent({ type: "search_focus", focused: true })}
          onBlur={() => emitFieldIntelEvent({ type: "search_focus", focused: false })}
          placeholder={t("field.signature.archive.searchPlaceholder")}
          autoComplete="off"
          className={fieldSignature.type.archiveSearchInput}
        />
        <button type="submit" className={fieldSignature.type.archiveSearchSubmit}>
          {t("field.signature.archive.searchSubmit")}
        </button>
      </div>

      <p className={`${fieldSignature.type.slabMeta} mt-3 opacity-80`}>
        {t("field.explorer.hub.searchHint")}
      </p>
      {error ? (
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--v2-amber-exception)]">
          {error}
        </p>
      ) : null}
    </form>
  );
}
