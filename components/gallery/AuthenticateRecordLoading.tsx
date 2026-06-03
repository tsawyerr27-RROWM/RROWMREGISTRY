"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

export function AuthenticateRecordLoading() {
  const { t } = useLocalePreferences();
  return (
    <p className="text-center text-sm text-neutral-500" role="status">
      {t("gallery.artworkAuth.review.loading")}
    </p>
  );
}
