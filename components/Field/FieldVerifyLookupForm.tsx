"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldVerifyRecordHref } from "@/lib/field-nav";

export function FieldVerifyLookupForm() {
  const router = useRouter();
  const { t } = useLocalePreferences();
  const [registryId, setRegistryId] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-8"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = registryId.trim();
        if (!trimmed) {
          setError(t("field.verify.hub.lookupRequired"));
          return;
        }
        setError(null);
        router.push(fieldVerifyRecordHref(trimmed));
      }}
    >
      <label htmlFor="field-verify-registry-id" className="text-sm font-medium text-neutral-800">
        {t("field.verify.hub.lookupLabel")}
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="field-verify-registry-id"
          name="registry_id"
          type="text"
          value={registryId}
          onChange={(e) => setRegistryId(e.target.value)}
          placeholder={t("field.verify.hub.lookupPlaceholder")}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border border-neutral-900/[0.08] bg-white/90 px-4 py-3.5 font-mono text-sm text-neutral-900 shadow-sm placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-900/12"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-neutral-950 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          {t("field.verify.hub.lookupSubmit")}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-amber-900">{error}</p>
      ) : (
        <p className="mt-2 text-xs text-neutral-500">{t("field.verify.hub.lookupHint")}</p>
      )}
    </form>
  );
}
