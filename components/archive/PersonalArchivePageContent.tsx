"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { ArchivedArtworkRow } from "@/lib/personal-archive";
import { fillMessage } from "@/lib/locale-messages";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";

function recordStatusLabel(status: string, t: (k: import("@/lib/locale-messages").MessageKey) => string) {
  const s = status.toLowerCase();
  if (s === "verified") return t("archive.card.statusVerified");
  return t("archive.card.statusRecorded");
}

export function PersonalArchivePageContent() {
  const { t, region } = useLocalePreferences();
  const [items, setItems] = useState<ArchivedArtworkRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/personal-archive/list", {
        credentials: "include",
      });
      const body = (await res.json().catch(() => ({}))) as {
        items?: ArchivedArtworkRow[];
        error?: string;
        schemaUnavailable?: boolean;
      };
      if (!res.ok) {
        setLoadError(
          typeof body.error === "string" && body.error.trim()
            ? body.error.trim()
            : t("archive.error.generic")
        );
        setItems([]);
        return;
      }
      setItems(Array.isArray(body.items) ? body.items : []);
    } catch {
      setLoadError(t("archive.error.generic"));
      setItems([]);
    }
  }, [t]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(t);
  }, [load]);

  if (items === null) {
    return (
      <p className="text-sm text-neutral-500">{t("archive.loading")}</p>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-black/[0.06] bg-white/80 px-8 py-12 text-center">
        <p className="text-sm text-red-800/90">{loadError}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-black/[0.06] bg-gradient-to-br from-white/90 to-neutral-50/60 px-8 py-14 text-center shadow-sm md:px-12">
        <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950">
          {t("archive.empty.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-neutral-600">
          {t("archive.empty.body")}
        </p>
        <Link
          href={fieldExplorerRecordsHref()}
          className="mt-8 inline-flex rounded-full border border-neutral-900/12 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50"
        >
          {t("archive.empty.cta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <h1 className="font-serif text-[2rem] font-normal tracking-tight text-neutral-950 md:text-[2.35rem]">
          {t("archive.page.title")}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
          {t("archive.page.lede")}
        </p>
      </header>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const artworkHref = `/artwork/${encodeURIComponent(item.registryId)}`;
          const registryHref = `/registry/${encodeURIComponent(item.registryId)}`;
          let archivedDate = "";
          try {
            archivedDate = new Date(item.archivedAt).toLocaleDateString(
              region.locale
            );
          } catch {
            archivedDate = item.archivedAt;
          }

          return (
            <li key={item.archiveId}>
              <article className="flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-black/[0.06] bg-white/90 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.1)]">
                <Link href={artworkHref} className="relative block aspect-[4/5] bg-neutral-100">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                      {t("archive.card.noImage")}
                    </div>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-neutral-400">
                    {item.registryId}
                  </p>
                  <h2 className="mt-2 font-serif text-lg font-normal text-neutral-950">
                    <Link href={artworkHref} className="hover:underline">
                      {item.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-neutral-600">{item.artistName}</p>
                  <p className="mt-3 text-xs text-neutral-500">
                    {recordStatusLabel(item.verificationStatus, t)}
                  </p>
                  {item.continuitySummary ? (
                    <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                      {item.continuitySummary}
                    </p>
                  ) : null}
                  <p className="mt-4 text-[10px] text-neutral-400">
                    {fillMessage(t("archive.card.archivedOn"), { date: archivedDate })}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-3 pt-5 text-xs font-medium text-neutral-600">
                    <Link
                      href={registryHref}
                      className="underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900"
                    >
                      {t("archive.card.currentRecord")}
                    </Link>
                    <Link
                      href={artworkHref}
                      className="underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900"
                    >
                      {t("archive.card.viewWork")}
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
