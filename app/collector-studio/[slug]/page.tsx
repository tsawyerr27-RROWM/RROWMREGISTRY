import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { PageNav } from "@/components/ui/PageNav";
import {
  getCollectorOwnedArtworkIds,
  sortPortfolioRows,
} from "@/lib/collector-portfolio";
import {
  latestOwnershipSystemStatus,
  ownershipStatusBadge,
} from "@/lib/ownership-ledger";
import {
  formatHeldByLine,
  getCurrentOwnersByArtworkId,
} from "@/lib/get-current-owner";
import { getCollectorStats } from "@/lib/collector-stats";
import { parsePublicPresence } from "@/lib/public-presence";
import { CollectorPublicHero } from "@/components/collector/CollectorPublicHero";
import { CollectorPublicWorkCard } from "@/components/collector/CollectorPublicWorkCard";
import {
  certificateStatusMapToCollectorRecord,
  fetchCertificatePublicStatusByArtworkIds,
} from "@/lib/fetch-certificate-public-status-map";

type CollectorProfileRow = {
  user_id: string;
  display_name: string | null;
  slug: string;
  location: string | null;
  bio: string | null;
  is_public: boolean;
  public_presence?: unknown;
  anonymous_on_public?: boolean;
};

type ArtworkReadRow = {
  id: string;
  title: string | null;
  registry_id: string | null;
  image_url: string | null;
  artist_id: string | null;
  verification_status: string | null;
  latest_value: number | null;
  latest_currency: string | null;
  latest_transfer_at: string | null;
  created_at: string | null;
};

function CollectorPublicLayout({
  crumbs,
  children,
}: {
  crumbs: { label: string; href?: string }[];
  children: ReactNode;
}) {
  return (
    <div className="ds-page-environment relative min-h-screen pb-28 pt-16 text-neutral-900 sm:pt-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-900/10 to-transparent"
        aria-hidden
      />
      <main className="relative mx-auto max-w-[min(100%,88rem)] px-4 sm:px-6 lg:px-8">
        <PageNav crumbs={crumbs} />
        {children}
      </main>
    </div>
  );
}

function EmptyWorksPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-12 rounded-[1.25rem] border border-neutral-900/[0.07] bg-gradient-to-br from-white/80 to-neutral-50/40 px-8 py-14 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.14)] sm:px-10 sm:py-16">
      <p className="text-sm font-semibold text-teal-800/70">
        Collection
      </p>
      <h2 className="mt-4 font-serif text-2xl font-normal tracking-tight text-neutral-950">
        {title}
      </h2>
      <p className="mt-4 max-w-lg text-[15px] leading-[1.65] text-neutral-600">{body}</p>
    </div>
  );
}

export default async function CollectorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cleanSlug = slug.trim();
  if (!cleanSlug) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const viewerId = authData.user?.id ?? null;

  const { data: profile } = await supabase
    .from("collector_profiles")
    .select(
      "user_id, display_name, slug, location, bio, is_public, public_presence, anonymous_on_public"
    )
    .eq("slug", cleanSlug)
    .maybeSingle<CollectorProfileRow>();

  if (!profile) notFound();

  const isOwner = viewerId != null && viewerId === profile.user_id;
  if (!profile.is_public && !isOwner) notFound();

  const presence = parsePublicPresence(profile.public_presence);
  if (!presence.profile && !isOwner) notFound();

  const anonymousPublic =
    Boolean(profile.anonymous_on_public) && !isOwner;
  const publicTitle = anonymousPublic
    ? "Private collector"
    : profile.display_name?.trim() || "Collector";

  const stats = await getCollectorStats(supabase, profile.user_id);

  const locationLine =
    presence.location && profile.location?.trim() && !anonymousPublic
      ? profile.location.trim()
      : null;

  const bioNode: ReactNode =
    profile.bio?.trim() && !anonymousPublic ? (
      <p className="whitespace-pre-wrap">{profile.bio.trim()}</p>
    ) : null;

  const ownerTools = isOwner ? (
    <div className="flex flex-col gap-4 border-t border-neutral-900/[0.06] pt-8">
      {!profile.is_public ? (
        <p className="text-[14px] leading-relaxed text-amber-900/85">
          This page is a private preview. Visitors only see a public collection when
          you enable it in{" "}
          <Link
            href="/account"
            className="font-semibold text-amber-950 underline decoration-amber-900/25 underline-offset-[4px] hover:decoration-amber-900/50"
          >
            Account
          </Link>
          .
        </p>
      ) : (
        <p className="text-[13px] text-neutral-500">
          You’re viewing this collection as it appears to the public.
        </p>
      )}
      <div className="flex flex-wrap gap-2.5">
        <Link
          href="/collector-studio"
          className="inline-flex items-center rounded-full border border-neutral-900/12 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-neutral-900/18 hover:bg-neutral-50"
        >
          Collector studio
        </Link>
        <Link
          href="/account"
          className="inline-flex items-center rounded-full border border-transparent bg-neutral-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
        >
          Account
        </Link>
      </div>
    </div>
  ) : null;

  const defaultCrumbs = [
    { label: "Registry", href: "/registry" as const },
    { label: publicTitle },
  ];

  const hero = (
    <CollectorPublicHero
      publicTitle={publicTitle}
      locationLine={locationLine}
      bio={bioNode}
      stats={stats}
      ownerTools={ownerTools}
    />
  );

  const ownedIds = await getCollectorOwnedArtworkIds(supabase, profile.user_id);
  if (ownedIds.length === 0) {
    return (
      <CollectorPublicLayout crumbs={defaultCrumbs}>
        {hero}
        <EmptyWorksPanel
          title="No works on the registry yet"
          body="When this collector registers holdings, verified works can appear here as part of their public presence."
        />
      </CollectorPublicLayout>
    );
  }

  const { data: artRows } = await supabase
    .from("artwork_read_model")
    .select(
      "id, title, registry_id, image_url, artist_id, verification_status, latest_value, latest_currency, latest_transfer_at, created_at"
    )
    .in("id", ownedIds)
    .returns<ArtworkReadRow[]>();

  const list = (artRows || []) as ArtworkReadRow[];

  const artistIds = [
    ...new Set(list.map((r) => r.artist_id).filter(Boolean)),
  ] as string[];
  const nameMap: Record<string, string> = {};
  if (artistIds.length) {
    const { data: artists } = await supabase
      .from("artists")
      .select("id, display_name, full_name")
      .in("id", artistIds);
    for (const a of artists || []) {
      nameMap[String(a.id)] =
        a.display_name?.trim() || a.full_name?.trim() || "Artist";
    }
  }

  const certStatusMap = await fetchCertificatePublicStatusByArtworkIds(
    supabase,
    ownedIds
  );
  const certMap = certificateStatusMapToCollectorRecord(certStatusMap);

  const ownersByArt = await getCurrentOwnersByArtworkId(supabase, ownedIds);
  const visible: ArtworkReadRow[] = [];
  for (const r of list) {
    const owner = ownersByArt[r.id];
    if (!owner?.user_id || owner.user_id !== profile.user_id) continue;
    if (owner.verification_status !== "verified") continue;
    visible.push(r);
  }

  if (!isOwner && visible.length === 0) {
    return (
      <CollectorPublicLayout crumbs={defaultCrumbs}>
        {hero}
        <EmptyWorksPanel
          title="Nothing visible yet"
          body="No verified works are shown on this public page. The collector may still be building their registry presence, or holdings may not yet be verified."
        />
      </CollectorPublicLayout>
    );
  }

  const cards = sortPortfolioRows(isOwner ? list : visible, "activity");

  return (
    <CollectorPublicLayout
      crumbs={[
        { label: "Registry", href: "/registry" },
        ...(isOwner
          ? [{ label: "Collection", href: "/collector-studio" }]
          : []),
        { label: publicTitle },
      ]}
    >
      {hero}

      <section className="mt-16 border-t border-neutral-900/[0.06] pt-14 md:mt-20 md:pt-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950 md:text-[1.75rem]">
              Registered works
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
              Works where this collector holds verified ownership on the RROWM
              registry.
            </p>
          </div>
          <p className="text-sm tabular-nums text-neutral-500">
            {cards.length} {cards.length === 1 ? "work" : "works"}
          </p>
        </div>

        <ul className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:gap-9">
          {cards.map((r) => {
            const cert = certMap[r.id];
            const certLabel = cert?.revoked
              ? "Certificate revoked"
              : cert?.has_certificate
                ? "Certificate on record"
                : null;
            const latestVal =
              r.latest_value != null && !Number.isNaN(Number(r.latest_value))
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: r.latest_currency || "USD",
                    maximumFractionDigits: 0,
                  }).format(Number(r.latest_value))
                : null;
            const latestValueLine =
              (isOwner || presence.values) && latestVal
                ? `${latestVal} declared value`
                : null;
            const artistLabel =
              isOwner || presence.ownership
                ? r.artist_id
                  ? nameMap[r.artist_id] || "Artist"
                  : "Artist"
                : null;
            const ownerRow = ownersByArt[r.id];
            const ownBadge = ownershipStatusBadge(
              latestOwnershipSystemStatus({
                to_user_id: ownerRow?.user_id ?? null,
                verification_status: ownerRow?.verification_status ?? null,
              } as Record<string, unknown>),
              "light"
            );
            const heldLine =
              isOwner || presence.ownership
                ? formatHeldByLine({
                    owner: ownersByArt[r.id],
                    viewerUserId: isOwner ? profile.user_id : null,
                  })
                : null;
            const href = r.registry_id
              ? `/artwork/${encodeURIComponent(r.registry_id)}`
              : "/registry";

            return (
              <CollectorPublicWorkCard
                key={r.id}
                href={href}
                title={(r.title || "").trim() || "Untitled"}
                imageUrl={r.image_url}
                registryId={r.registry_id}
                artistLabel={artistLabel}
                latestValueLine={latestValueLine}
                ownershipLabel={ownBadge.label}
                ownershipClassName={ownBadge.className}
                heldLine={heldLine}
                certLabel={certLabel}
              />
            );
          })}
        </ul>
      </section>
    </CollectorPublicLayout>
  );
}
