"use client";

import Link from "next/link";

import { RegistryListFilters } from "@/components/Registry/RegistryListFilters";
import { RegistryListPagination } from "@/components/Registry/RegistryListPagination";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fillMessage } from "@/lib/locale-messages";
import type { RegistrySort } from "@/lib/registry-list-params";
import { REGISTRY_PAGE_SIZE } from "@/lib/registry-list-params";

export type RegistryExplorerArtwork = {
  id: string;
  title: string | null;
  registry_id: string;
  image_url: string | null;
  created_at: string;
  artist_display_name: string | null;
  artist_slug: string | null;
  cert_status: "verified" | "revoked" | "none";
};

type Props = {
  artworks: RegistryExplorerArtwork[];
  total: number;
  q: string;
  sort: RegistrySort;
  page: number;
  formKey: string;
};

export function RegistryExplorerContent({
  artworks,
  total,
  q,
  sort,
  page,
  formKey,
}: Props) {
  const { t, region } = useLocalePreferences();
  const trimmedQ = q.trim();

  function certStatusLabel(status: RegistryExplorerArtwork["cert_status"]) {
    if (status === "revoked") return t("registry.cert.revoked");
    return t("registry.cert.verified");
  }

  function formatAddedDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString(region.locale);
    } catch {
      return iso;
    }
  }

  return (
    <>
      <div className="mt-10">
        <RegistryListFilters
          action="/registry"
          q={q}
          sort={sort}
          formKey={formKey}
          variant="explorer"
        />
      </div>

      {!artworks.length ? (
        <div className="mt-12 rounded-[1.25rem] border border-neutral-900/[0.05] bg-gradient-to-br from-white/80 to-neutral-50/50 px-8 py-14 text-center shadow-[0_16px_40px_-20px_rgba(15,23,42,0.08)] sm:px-10 sm:py-16">
          <p className="text-sm font-semibold text-emerald-800/75">
            {t("registry.empty.label")}
          </p>
          <h2 className="mt-4 font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-neutral-950">
            {t("registry.empty.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.65] text-neutral-600">
            {trimmedQ
              ? t("registry.empty.noSearch")
              : t("registry.empty.noRecords")}
          </p>
          {trimmedQ ? (
            <Link
              href="/registry"
              className="mt-8 inline-flex items-center rounded-full border border-neutral-900/12 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50"
            >
              {t("registry.hero.clearSearch")}
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <section className="mt-14 border-t border-neutral-900/[0.06] pt-14 md:mt-16 md:pt-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <InfoTooltip text="Each entry links to the immutable registry record for this artwork." />
                <h2 className="mt-3 font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-neutral-950 md:text-[1.85rem]">
                  {t("registry.list.title")}
                </h2>
              </div>
              <p className="text-sm text-neutral-600">
                {fillMessage(t("registry.list.page"), { page })}
              </p>
            </div>

            <ul className="mt-10 grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-8">
              {artworks.map((artwork) => {
                const title =
                  (artwork.title || "").trim() || t("registry.card.untitled");

                return (
                  <li key={artwork.id}>
                    <article className="liquid-glass-tile group flex flex-col overflow-hidden transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5">
                      <div className="relative aspect-[4/5] w-full bg-neutral-100/80">
                        {artwork.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={artwork.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                            {t("registry.card.noImage")}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-6 md:p-7">
                        <p className="text-[14px] font-medium text-neutral-600">
                          {t("registry.card.registryId")}
                        </p>
                        <p className="mt-1.5 font-mono text-[11px] tracking-tight text-neutral-600">
                          {artwork.registry_id}
                        </p>
                        <h3 className="mt-4 font-serif text-lg font-normal leading-snug tracking-tight text-neutral-950 transition group-hover:text-neutral-900">
                          {title}
                        </h3>
                        {artwork.artist_slug ? (
                          <Link
                            href={`/artist/${artwork.artist_slug}`}
                            className="mt-2 text-sm text-neutral-600 transition hover:text-neutral-900 hover:underline"
                          >
                            {artwork.artist_display_name}
                          </Link>
                        ) : (
                          <p className="mt-2 text-[15px] text-neutral-600">
                            {artwork.artist_display_name ?? "–"}
                          </p>
                        )}
                        <p className="mt-1 text-[13px] text-neutral-400">
                          {t("registry.card.added")}{" "}
                          {formatAddedDate(artwork.created_at)}
                        </p>
                        <p className="mt-3 text-xs text-neutral-600">
                          <span className="text-neutral-400">
                            {t("registry.card.certStatus")}
                          </span>{" "}
                          <span className="font-medium text-neutral-900">
                            {certStatusLabel(artwork.cert_status)}
                          </span>
                        </p>
                        <div className="mt-6 flex flex-col gap-2">
                          <Link
                            href={`/registry/${encodeURIComponent(artwork.registry_id)}`}
                            className="rounded-xl bg-neutral-950 px-4 py-3 text-center text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800"
                          >
                            {t("registry.card.viewRecord")}
                          </Link>
                          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs">
                            <Link
                              href={`/verify/${encodeURIComponent(artwork.registry_id)}`}
                              className="font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-[0.35em] transition hover:text-neutral-900 hover:decoration-neutral-500"
                            >
                              {t("registry.card.verifyCert")}
                            </Link>
                            <Link
                              href={`/login?next=${encodeURIComponent(`/certificate/${encodeURIComponent(artwork.registry_id)}`)}`}
                              className="text-neutral-600 underline decoration-neutral-300 underline-offset-[0.35em] transition hover:text-neutral-900 hover:decoration-neutral-500"
                            >
                              {t("registry.card.viewCertLogin")}
                            </Link>
                            <Link
                              href={`/artwork/${encodeURIComponent(artwork.registry_id)}`}
                              className="text-neutral-500 underline decoration-neutral-300 underline-offset-[0.35em] transition hover:text-neutral-900 hover:decoration-neutral-500"
                            >
                              {t("registry.card.artworkPage")}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>

          <RegistryListPagination
            basePath="/registry"
            page={page}
            pageSize={REGISTRY_PAGE_SIZE}
            total={total}
            q={q}
            sort={sort}
          />
        </>
      )}
    </>
  );
}
