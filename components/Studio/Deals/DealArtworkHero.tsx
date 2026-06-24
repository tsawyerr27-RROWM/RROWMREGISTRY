"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { registryLedgerHref } from "@/lib/registry-nav";
import { rrowmFieldCard } from "@/styles/rrowm-theme";
import { readAcquisitionLifecycle } from "@/lib/acquisition-lifecycle";
import type { DealRow } from "@/lib/deals";

type ArtworkPreview = {
  title: string | null;
  registry_id: string | null;
  image_url: string | null;
  medium: string | null;
  year: string | number | null;
};

type Props = {
  deal: DealRow;
};

export function DealArtworkHero({ deal }: Props) {
  const sb = useSupabaseBrowserLazy();
  const artworkId = String(deal.artwork_id ?? "").trim();
  const [artwork, setArtwork] = useState<ArtworkPreview | null>(null);

  useEffect(() => {
    if (!artworkId) {
      setArtwork(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      const { data } = await sb()
        .from("artworks")
        .select("title, registry_id, image_url, medium, year")
        .eq("id", artworkId)
        .maybeSingle();

      if (!cancelled && data) {
        setArtwork(data as ArtworkPreview);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [artworkId, sb]);

  if (!artworkId) return null;

  const title =
    String(artwork?.title ?? "").trim() ||
    String(deal.title ?? "").trim() ||
    "Linked work";
  const registryId = String(artwork?.registry_id ?? "").trim();
  const ledgerHref = registryId ? registryLedgerHref(registryId) : null;
  const lifecycle = readAcquisitionLifecycle(
    deal.terms as Record<string, unknown> | null | undefined
  );
  const lifecycleLabel = lifecycle?.state
    ? lifecycle.state.replace(/_/g, " ")
    : null;

  return (
    <div className={`${rrowmFieldCard.portfolio} overflow-hidden`}>
      <div className="grid gap-0 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]">
        <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200/80 sm:aspect-auto sm:min-h-[9rem]">
          {artwork?.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artwork.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[9rem] items-center justify-center text-[12px] text-neutral-500">
              No preview
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-2 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Linked artwork
          </p>
          <h3 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
            {title}
          </h3>
          {registryId ? (
            <p className="font-mono text-[12px] text-neutral-500">{registryId}</p>
          ) : null}
          {(artwork?.medium || artwork?.year) && (
            <p className="text-[13px] text-neutral-600">
              {[artwork?.medium, artwork?.year].filter(Boolean).join(" · ")}
            </p>
          )}
          {lifecycleLabel ? (
            <p className="mt-1 inline-flex w-fit rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-700">
              {lifecycleLabel}
            </p>
          ) : null}
          {ledgerHref ? (
            <Link
              href={ledgerHref}
              className="mt-1 inline-flex text-[13px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
            >
              View registry ledger
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
