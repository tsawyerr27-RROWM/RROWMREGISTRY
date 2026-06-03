"use client";

import { useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

export function ShareRecordButton({ url }: { url: string }) {
  const { t } = useLocalePreferences();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          window.prompt(t("registry.record.share.prompt"), url);
        }
      }}
      className="liquid-glass-inset w-full border-0 px-4 py-3 text-sm font-medium text-neutral-800 shadow-none transition hover:bg-white/85"
    >
      {done ? t("registry.record.share.copied") : t("registry.record.share.copyLink")}
    </button>
  );
}
