import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";
import { formatValueEventLabel } from "@/lib/format-registry-labels";
import {
  latestOwnershipSystemStatus,
  ownershipStatusBadge,
} from "@/lib/ownership-ledger";
import { ArchivalProvenanceTimeline } from "@/components/provenance/ArchivalProvenanceTimeline";
import { getArchivalProvenanceBundle } from "@/lib/provenance-timeline";
import { getArtworkIdentity } from "@/lib/artwork-identity";
import {
  formatHeldByLine,
  getCurrentOwner,
  heldByCredibilityClass,
} from "@/lib/get-current-owner";
import { PageNav } from "@/components/ui/PageNav";
import { ParticipationLayersStrip } from "@/components/Registry/ParticipationLayersStrip";
import { getArtworkParticipationLayers } from "@/lib/get-artwork-participation-layers";

export const dynamic = "force-dynamic";

function formatEditionLine(extras: {
  edition_number?: number | null;
  edition_total?: number | null;
  is_unique?: boolean | null;
} | null) {
  if (!extras) return null;
  if (extras.is_unique === true) return "Unique work";
  const n = extras.edition_number;
  const t = extras.edition_total;
  if (n != null && t != null) return `Edition ${n} of ${t}`;
  if (n != null) return `Edition ${n}`;
  if (t != null) return `Edition of ${t}`;
  return null;
}

function isPublicSurfaceValueVisibility(visibility: string | null | undefined) {
  return (
    visibility == null ||
    visibility === "" ||
    visibility === "public" ||
    visibility === "certificate"
  );
}

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ registry_id: string }>;
}) {
  const { registry_id } = await params;
  const cleanId = registry_id.trim();

  const headersList = await headers();
  const referer = headersList.get("referer") || "";
  let backHref: string | undefined;
  let crumbsBase: { label: string; href: string } | null = null;

  try {
    const url = new URL(referer);
    const path = url.pathname;
    if (path.startsWith("/registry")) {
      backHref = `${url.pathname}${url.search || ""}`;
      crumbsBase = { label: "Registry", href: backHref };
    } else {
      backHref = `/registry/${encodeURIComponent(cleanId)}`;
      crumbsBase = {
        label: "Registry",
        href: `/registry/${encodeURIComponent(cleanId)}`,
      };
    }
  } catch {
    backHref = `/registry/${encodeURIComponent(cleanId)}`;
    crumbsBase = {
      label: "Registry",
      href: `/registry/${encodeURIComponent(cleanId)}`,
    };
  }

  const supabase = await createSupabaseServerClient();

  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select(
      `
      id,
      artist_id,
      catalogue_artist_name,
      filing_gallery_id,
      title,
      registry_id,
      verification_status,
      approved_by,
      approved_at,
      image_url,
      description,
      year,
      medium,
      created_at
    `
    )
    .eq("registry_id", cleanId)
    .maybeSingle();

  if (artworkError) warnSupabaseRpc("artwork page", artworkError);
  if (!artwork) {
    notFound();
  }

  type GalleryRow = { name: string; verified: boolean | null };

  type ArtistRow = {
    display_name: string | null;
    slug: string | null;
    gallery_id: string | null;
  };

  let artistRow: ArtistRow | null = null;
  if (artwork.artist_id) {
    const { data: a, error: artistError } = await supabase
      .from("artists")
      .select("display_name, slug, gallery_id")
      .eq("id", artwork.artist_id)
      .maybeSingle();

    if (artistError) warnSupabaseRpc("artwork page artist", artistError);
    artistRow = a;
  }

  const institutionGalleryId =
    artistRow?.gallery_id ??
    ((artwork as { filing_gallery_id?: string | null }).filing_gallery_id ?? null);

  const galleryFetch = institutionGalleryId
    ? await supabase
        .from("galleries")
        .select("name, verified")
        .eq("id", institutionGalleryId)
        .maybeSingle()
    : { data: null as GalleryRow | null, error: null };

  if (galleryFetch.error) {
    warnSupabaseRpc("artwork page gallery", galleryFetch.error);
  }
  const gallery: GalleryRow | null = galleryFetch.data;

  const isVerified = artwork.verification_status === "verified";

  const { data: extras, error: extrasError } = await supabase
    .from("artworks")
    .select("edition_number, edition_total, is_unique")
    .eq("id", artwork.id)
    .maybeSingle();
  if (extrasError) warnSupabaseRpc("artwork extras", extrasError);

  const { data: certRows, error: certRpcError } = await supabase.rpc(
    "get_certificate_public_status_single",
    { p_artwork_id: artwork.id }
  );
  if (certRpcError) warnSupabaseRpc("artwork cert RPC", certRpcError);

  type CertPublic = {
    has_certificate: boolean;
    revoked: boolean;
    revoked_reason: string | null;
  };
  const cert = (certRows?.[0] ?? null) as CertPublic | null;

  const { data: valueRows } = await supabase
    .from("value_events")
    .select(
      "declared_value, currency, value_type, visibility_level, created_at"
    )
    .eq("artwork_id", artwork.id)
    .order("created_at", { ascending: false });

  const visibleValues = (valueRows || []).filter((v) =>
    isPublicSurfaceValueVisibility(v.visibility_level)
  );
  const latestValue = visibleValues[0];

  const currentOwner = await getCurrentOwner(supabase, artwork.id);
  const ownershipHeroBadge = ownershipStatusBadge(
    latestOwnershipSystemStatus(
      { to_user_id: currentOwner.user_id, verification_status: currentOwner.verification_status } as Record<string, unknown>
    ),
    "light"
  );
  const heldByLine = formatHeldByLine({ owner: currentOwner });
  const heldByTone = heldByCredibilityClass(currentOwner);

  const artist = artistRow;

  const editionLine = !extrasError ? formatEditionLine(extras ?? null) : null;
  const yearMedium = [artwork.year, artwork.medium].filter(Boolean).join(" · ");

  const certLoginNext = `/login?next=${encodeURIComponent(`/certificate/${encodeURIComponent(artwork.registry_id)}`)}`;

  // Verification source: prefer tagged verification_events (gallery/admin/certificate), fall back to gallery representation.
  let verifiedByGalleryName: string | null = null;
  try {
    const { data: vrows } = await supabase
      .from("verification_events")
      .select("*")
      .eq("artwork_id", artwork.id)
      .order("created_at", { ascending: false })
      .limit(6);
    for (const r of vrows || []) {
      const method = String((r as any).verification_method || "").toLowerCase().trim();
      const gid = (r as any).verified_by_gallery_id as string | null | undefined;
      if (method === "gallery" && gid) {
        const { data: g } = await supabase
          .from("galleries")
          .select("name")
          .eq("id", gid)
          .maybeSingle<{ name: string | null }>();
        const nm = g?.name?.trim() || null;
        if (nm) verifiedByGalleryName = nm;
        break;
      }
    }
  } catch {
    // ignore
  }

  const provenanceBundle = await getArchivalProvenanceBundle({
    supabase,
    artwork: {
      id: artwork.id,
      registry_id: artwork.registry_id,
      title: artwork.title,
      artist_id: artwork.artist_id,
      created_at: artwork.created_at,
    },
    artistName:
      artist?.display_name ||
      (artwork as { catalogue_artist_name?: string | null }).catalogue_artist_name ||
      null,
  });

  const identity = await getArtworkIdentity({
    supabase,
    artworkId: artwork.id,
  });

  const participationLayers = await getArtworkParticipationLayers(supabase, {
    artworkId: artwork.id,
    artistId: artwork.artist_id,
    galleryId: institutionGalleryId,
    artworkVerified: isVerified,
    hasLiveCertificate: Boolean(cert?.has_certificate && !cert?.revoked),
  });

  return (
    <div className="min-h-screen rrowm-bg-page pt-20 text-neutral-900">
      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <PageNav backHref={backHref} />
        {/* Hero */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14 lg:items-start">
          <div className="lg:col-span-7">
            <div className="liquid-glass-tile overflow-hidden">
              {artwork.image_url ? (
                <div className="relative aspect-[4/5] w-full bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artwork.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-neutral-100 text-sm text-neutral-400">
                  No image on file
                </div>
              )}
            </div>
              </div>

          <div className="flex flex-col gap-8 lg:col-span-5">
            <div>
              <h1 className="font-serif text-4xl font-normal leading-[1.1] tracking-tight text-neutral-950 md:text-5xl">
                {artwork.title}
              </h1>
              <p className="mt-4 text-base text-neutral-800">
                {identity.status_line}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                {identity.context.verified_by ? (
                  <span>
                    Institution filing by{" "}
                    <span className="font-medium text-neutral-700">
                      {identity.context.verified_by}
                    </span>
                  </span>
                ) : null}
                {identity.context.held_since ? (
                  <span>
                    Held since{" "}
                    {new Date(identity.context.held_since).toLocaleDateString()}
                  </span>
                ) : null}
                {typeof identity.context.last_sale === "number" ? (
                  <span>
                    Last sale{" "}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: latestValue?.currency || "USD",
                      maximumFractionDigits: 0,
                    }).format(identity.context.last_sale)}
                    {identity.context.last_sale_date ? (
                      <span className="text-neutral-400">
                        {" "}
                        ·{" "}
                        {new Date(
                          identity.context.last_sale_date
                        ).toLocaleDateString()}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </div>
              <div className="mt-6 text-xl text-neutral-800">
                {artist?.slug ? (
                  <Link
                    href={`/artist/${artist.slug}`}
                    className="transition hover:text-neutral-600 hover:underline"
                  >
                    {artist.display_name}
                  </Link>
                ) : (
                  <span>
                    {artist?.display_name ||
                      (artwork as { catalogue_artist_name?: string | null })
                        .catalogue_artist_name ||
                      null}
                  </span>
                )}
              </div>
              {yearMedium ? (
                <p className="mt-3 text-base text-neutral-500">{yearMedium}</p>
              ) : null}
              {editionLine ? (
                <p className="mt-2 text-sm text-neutral-500">{editionLine}</p>
              ) : null}
              <div className="mt-6">
                <ParticipationLayersStrip layers={participationLayers} variant="light" />
                {verifiedByGalleryName ? (
                  <p className="mt-3 text-[11px] text-neutral-500">
                    Institution filing attributed to{" "}
                    <span className="font-medium text-neutral-700">
                      {verifiedByGalleryName}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-black/[0.06] bg-gradient-to-br from-neutral-50/95 to-white/90 p-5 shadow-sm md:p-6">
              <p className={ownershipHeroBadge.className}>
                {ownershipHeroBadge.label}
              </p>
              <p className={`mt-3 text-sm ${heldByTone}`}>
                {currentOwner.slug && currentOwner.display_name ? (
                  <>
                    Held by{" "}
                    <Link
                      href={`/collector-studio/${encodeURIComponent(currentOwner.slug)}`}
                      className="underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
                    >
                      {currentOwner.display_name}
                    </Link>
                  </>
                ) : (
                  heldByLine
                )}
              </p>
            </div>

            {/* Record & verification — calm authority, clear CTA ladder */}
            <div className="space-y-4 rounded-2xl border border-black/[0.07] bg-white/70 p-5 shadow-[0_16px_48px_-28px_rgba(15,23,42,0.1)] backdrop-blur-sm md:p-6">
              <Link
                href={`/registry/${encodeURIComponent(artwork.registry_id)}`}
                className="flex w-full items-center justify-center rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800"
              >
                View registry record
              </Link>
              <Link
                href={`/verify/${encodeURIComponent(artwork.registry_id)}`}
                className={`flex w-full items-center justify-center rounded-2xl border px-5 py-3 text-sm font-medium transition ${
                  isVerified
                    ? "border-neutral-300/80 bg-white/80 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
                    : "border-neutral-300/60 bg-white/60 text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50"
                }`}
              >
                {isVerified ? "Verify certificate" : "Check status"}
              </Link>
              <div className="pt-1 text-center">
                <Link
                  href={certLoginNext}
                  className="text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-800 hover:decoration-neutral-500"
                >
                  View certificate (login required)
                </Link>
              </div>
              <div className="flex justify-center border-t border-black/[0.05] pt-4">
                {!cert?.has_certificate ? (
                  <span className="inline-flex items-center gap-2 text-xs text-neutral-600">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-neutral-300"
                      aria-hidden
                    />
                    Certificate not issued
                  </span>
                ) : cert.revoked ? (
                  <span className="inline-flex items-center gap-2 text-xs text-neutral-600">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-red-500"
                      aria-hidden
                    />
                    Certificate revoked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-xs text-neutral-600">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-emerald-500"
                      aria-hidden
                    />
                    Certificate issued
                  </span>
                )}
              </div>
            </div>

            {gallery && (
              <div className="rounded-2xl border border-violet-200/40 bg-gradient-to-br from-violet-50/50 to-white/90 px-5 py-5 md:px-6">
                <p className="text-lg text-neutral-900">
                  Represented by{" "}
                  <span className="font-medium">{gallery.name}</span>
                </p>
                {gallery.verified ? (
                  <p className="mt-2 text-xs text-neutral-500">
                    Verified gallery on RROWM
                  </p>
                ) : null}
              </div>
            )}
          </div>
                  </div>

        {/* Description — editorial, full width */}
        {artwork.description ? (
          <section className="mx-auto mt-20 max-w-3xl">
            <div className="rounded-[1.75rem] border border-black/[0.06] bg-white/70 px-7 py-10 shadow-[0_24px_64px_-36px_rgba(15,23,42,0.12)] backdrop-blur-[2px] md:px-11 md:py-12">
              <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950">
                About this work
              </h2>
              <div className="mt-8 space-y-6 text-lg leading-[1.75] text-neutral-700">
                {artwork.description.split(/\n\n+/).map((para: string, i: number) => (
                  <p key={i} className="whitespace-pre-wrap">
                    {para.trim()}
                  </p>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Provenance — unified narrative */}
        <section className="mx-auto mt-16 max-w-3xl">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-black/[0.07] bg-gradient-to-b from-white to-neutral-50/90 px-7 py-10 shadow-[0_20px_56px_-36px_rgba(15,23,42,0.14)] md:px-10 md:py-12">
            <div
              className="pointer-events-none absolute -left-8 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-sky-400/10 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950">
                Provenance
              </h2>
              <div className="mt-8">
                <ArchivalProvenanceTimeline bundle={provenanceBundle} />
              </div>
              <p className="mt-10 text-center">
                <Link
                  href={`/artwork/${encodeURIComponent(artwork.registry_id)}/provenance`}
                  className="inline-flex items-center justify-center rounded-full border border-neutral-200/90 bg-white/90 px-5 py-2.5 text-sm font-medium text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-white"
                >
                  Full provenance record
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Trust bridge */}
        <section className="mx-auto mt-20 max-w-2xl text-center md:mt-24">
          <div className="rounded-3xl border border-black/[0.06] bg-gradient-to-b from-white/90 to-neutral-50/80 px-6 py-12 shadow-[0_28px_72px_-40px_rgba(15,23,42,0.14)] backdrop-blur-sm md:px-10 md:py-14">
            <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950">
              Registry
            </h2>
            <div className="mt-8 space-y-4 text-base leading-relaxed text-neutral-700">
              {isVerified ? (
                <>
                  <p>This work is recorded on the RROWM registry.</p>
                  <p className="text-neutral-600">
                    The official record, including provenance and verification, is
                    available via the registry.
                  </p>
                </>
              ) : (
                <>
                  <p>This work is recorded on the RROWM registry.</p>
                  <p className="text-neutral-600">
                    The official record is available via the registry; verification
                    will appear once the work is verified.
                  </p>
                </>
              )}
            </div>
            <p className="mt-8 font-mono text-xs text-neutral-500">
              {artwork.registry_id}
            </p>
            <Link
              href={`/registry/${encodeURIComponent(artwork.registry_id)}`}
              className="mt-10 inline-flex rounded-2xl bg-neutral-950 px-8 py-3.5 text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800"
            >
              Open registry record
            </Link>
        </div>
        </section>
      </main>
    </div>
  );
}
