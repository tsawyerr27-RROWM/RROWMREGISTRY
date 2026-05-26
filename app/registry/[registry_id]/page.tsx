import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";
import { ShareRecordButton } from "@/components/Registry/ShareRecordButton";
import { PublicClaimOwnership } from "@/components/Registry/PublicClaimOwnership";
import { RegistryTechnicalDetails } from "@/components/Registry/RegistryTechnicalDetails";
import { ArchivalProvenanceTimeline } from "@/components/provenance/ArchivalProvenanceTimeline";
import { getArchivalProvenanceBundle } from "@/lib/provenance-timeline";
import { getProvenanceInsights } from "@/lib/provenance-insights";
import {
  formatOwnershipTransferTypeLabel,
  formatValueEventLabel,
} from "@/lib/format-registry-labels";
import {
  latestOwnershipSystemStatus,
  ownershipStatusBadge,
} from "@/lib/ownership-ledger";
import {
  formatHeldByLine,
  getCurrentOwner,
  heldByCredibilityClass,
} from "@/lib/get-current-owner";
import { RegistryCertificateOverviewButton } from "@/components/certificate/RegistryCertificateOverviewButton";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

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

function getTrustState(args: {
  verificationStatus: string | null | undefined;
  certRevoked: boolean;
  hasCertificate: boolean;
  isLocked: boolean | null | undefined;
}) {
  const { verificationStatus, certRevoked, hasCertificate, isLocked } = args;
  if (certRevoked) {
    return {
      tone: "red" as const,
      headline: "Certificate revoked",
      sub: "This record is flagged. Do not treat as verified.",
    };
  }
  const verified = verificationStatus === "verified";
  return {
    tone: verified ? ("green" as const) : ("amber" as const),
    headline: verified ? "Verified record" : "Registry record",
    sub: verified
      ? hasCertificate
        ? "Certificate on file. Full document available to authorised users."
        : "Recorded in the registry; no certificate issued yet."
      : "This work is registered but not yet verified.",
  };
}

export default async function PublicRegistryPage({
  params,
}: {
  params: Promise<{ registry_id: string }>;
}) {
  const { registry_id } = await params;
  const cleanId = registry_id.trim();

  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  const sessionUser = authData?.user ?? null;
  let userIsAdmin = false;
  if (sessionUser?.id) {
    const { data: adminRow } = await supabase
      .from("artists")
      .select("is_admin")
      .eq("id", sessionUser.id)
      .maybeSingle();
    userIsAdmin = Boolean(adminRow?.is_admin);
  }

  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select(
      `
    id,
    title,
    registry_id,
      year,
      medium,
      dimensions,
      description,
      image_url,
    verification_status,
    timeline_hash,
      verification_hash,
      artist_id,
      is_locked,
      created_at
    `
    )
  .eq("registry_id", cleanId)
  .maybeSingle();

  if (artworkError) warnSupabaseRpc("registry artwork", artworkError);
  if (!artwork) notFound();

  const registryId = artwork.registry_id;

  const { data: extras, error: extrasError } = await supabase
    .from("artworks")
    .select("edition_number, edition_total, is_unique")
    .eq("id", artwork.id)
    .maybeSingle();
  if (extrasError) warnSupabaseRpc("registry extras", extrasError);

  const { data: artist } = await supabase
    .from("artists")
    .select("id, display_name, full_name, slug")
    .eq("id", artwork.artist_id)
    .maybeSingle();

  const artistName =
    artist?.display_name?.trim() ||
    artist?.full_name?.trim() ||
    "Registered artist";

  const { data: certRows, error: certRpcError } = await supabase.rpc(
    "get_certificate_public_status_single",
    { p_artwork_id: artwork.id }
  );
  if (certRpcError) warnSupabaseRpc("registry cert RPC", certRpcError);

  type CertPublic = {
    has_certificate: boolean;
    revoked: boolean;
    revoked_reason: string | null;
  };
  const certificate = (certRows?.[0] ?? null) as CertPublic | null;

  const { data: ownershipRows } = await supabase
    .from("ownership_events")
    .select("*")
    .eq("artwork_id", artwork.id)
    .order("created_at", { ascending: true });

  const latestOwnershipRow =
    ownershipRows && ownershipRows.length > 0
      ? (ownershipRows[ownershipRows.length - 1] as Record<string, unknown>)
  : null;
  const latestOwnershipStatus = latestOwnershipSystemStatus(latestOwnershipRow);
  const currentOwner = await getCurrentOwner(supabase, artwork.id);
  const heldByLine = formatHeldByLine({ owner: currentOwner });
  const heldByTone = heldByCredibilityClass(currentOwner);

  const { data: valueRows } = await supabase
    .from("value_events")
    .select("*")
    .eq("artwork_id", artwork.id)
    .order("created_at", { ascending: true });

  const publicValues =
    (valueRows || []).filter((v: { visibility_level?: string | null }) =>
      isPublicSurfaceValueVisibility(v.visibility_level)
    ) ?? [];

  let verificationRows: Record<string, unknown>[] = [];
  const { data: verData, error: verErr } = await supabase
    .from("verification_events")
    .select("*")
    .eq("artwork_id", artwork.id)
    .order("created_at", { ascending: true });
  if (!verErr && verData) verificationRows = verData;

  // Verification source (optional tagging): show gallery name when method=gallery.
  let verificationSourceLine: string | null = null;
  try {
    const latest = [...verificationRows].reverse().find((r) => {
      const m = String((r as any).verification_method || "").toLowerCase().trim();
      return m === "gallery" && Boolean((r as any).verified_by_gallery_id);
    });
    const gid = latest ? ((latest as any).verified_by_gallery_id as string | null) : null;
    if (gid) {
      const { data: g } = await supabase
        .from("galleries")
        .select("name")
        .eq("id", gid)
        .maybeSingle<{ name: string | null }>();
      const nm = g?.name?.trim() || null;
      if (nm) verificationSourceLine = `Verification recorded by ${nm}`;
    }
  } catch {
    // ignore
  }

  const certRevoked = Boolean(certificate?.revoked);
  const hasCertificate = Boolean(certificate?.has_certificate);
  const trust = getTrustState({
    verificationStatus: artwork.verification_status,
    certRevoked,
    hasCertificate,
    isLocked: artwork.is_locked,
  });

  const registryProvenanceLoginNext = `/registry/${encodeURIComponent(
    artwork.registry_id
  )}`;

  const siteBase =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  const shareUrl = `${siteBase}/registry/${encodeURIComponent(artwork.registry_id)}`;

  const trustBarToneClass =
    trust.tone === "red"
      ? "border-red-200/60 bg-red-50/40 text-red-950"
      : trust.tone === "green"
        ? "border-emerald-200/35 bg-emerald-50/20 text-neutral-800"
        : "border-amber-200/45 bg-amber-50/30 text-amber-950";

  const editionLine = !extrasError ? formatEditionLine(extras ?? null) : null;
  const claimReturnPath = `/registry/${encodeURIComponent(artwork.registry_id)}`;

  const provenanceBundle = await getArchivalProvenanceBundle({
    supabase,
    artwork: {
      id: artwork.id,
      registry_id: artwork.registry_id,
      title: artwork.title,
      artist_id: artwork.artist_id,
      created_at: artwork.created_at,
    },
    artistName,
  });

  const provenanceInsights = await getProvenanceInsights({
    supabase,
    artworkId: artwork.id,
    artworkCreatedAt: artwork.created_at,
  });

return (
    <div className="ds-page-environment min-h-screen pt-20 text-neutral-900">
      <main className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(52vh,28rem)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.07),transparent_58%),radial-gradient(ellipse_55%_45%_at_100%_0%,rgba(14,165,233,0.06),transparent_50%)]"
          aria-hidden
        />
        {/* Trust bar — compact status strip */}
        <div
          className={`mb-8 rounded-lg border px-3.5 py-2 shadow-sm md:px-4 md:py-2.5 ${trustBarToneClass}`}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="min-w-0">
              <p
                className={
                  trust.tone === "green"
                    ? "text-[13px] font-medium leading-tight text-emerald-900/85"
                    : "text-[13px] font-medium leading-tight"
                }
              >
                {trust.headline}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-neutral-600">
                {trust.sub}
              </p>
              {verificationSourceLine ? (
                <p className="mt-1 text-[10px] leading-snug text-neutral-500">
                  {verificationSourceLine}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5 md:justify-end">
              {artwork.verification_status === "verified" && !certRevoked && (
                <span className="rounded border border-emerald-200/70 bg-white/65 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-emerald-900/90">
                  Verified
                </span>
              )}
              {hasCertificate && !certRevoked && (
                <span className="rounded border border-neutral-200/80 bg-white/60 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700">
                  Certificate
                </span>
              )}
              {hasCertificate && certRevoked && (
                <span className="rounded border border-red-200/80 bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-red-900">
                  Revoked
                </span>
              )}
              {!hasCertificate && (
                <span className="rounded border border-neutral-200/70 bg-white/50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                  No certificate
                </span>
              )}
              {artwork.is_locked && (
                <span className="rounded border border-neutral-200/70 bg-white/50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                  Locked
                </span>
              )}
            </div>
      </div>
        </div>

        {/* Hero: identity */}
        <div className="mb-16 grid gap-10 lg:grid-cols-12 lg:gap-14 lg:items-start">
          <div className="lg:col-span-7">
            <div className="liquid-glass-tile overflow-hidden rounded-[1.65rem] shadow-[0_28px_72px_-32px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.06]">
              {artwork.image_url ? (
                <div className="relative aspect-[4/5] w-full bg-gradient-to-br from-neutral-100 to-neutral-200/80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artwork.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200/60 text-sm text-neutral-500">
                  No image on file
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-5 lg:pt-1">
            <div className="rounded-2xl border border-black/[0.06] bg-white/75 px-5 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] backdrop-blur-sm md:px-6 md:py-6">
              <p className="font-mono text-[11px] leading-relaxed tracking-tight text-neutral-500">
                {artwork.registry_id}
              </p>
              <h1 className="mt-3 font-serif text-4xl font-normal leading-[1.08] tracking-tight text-neutral-950 md:text-[2.75rem] md:leading-[1.06]">
            {artwork.title}
              </h1>
              <p className="mt-4 text-lg text-neutral-700">
                {artist?.slug ? (
                  <Link
                    href={`/artist/${artist.slug}`}
                    className="transition hover:text-neutral-900 hover:underline"
                  >
                    {artistName}
                  </Link>
                ) : (
                  artistName
                )}
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                {[artwork.year, artwork.medium].filter(Boolean).join(" · ") ||
                  "–"}
          </p>
        </div>
            {(() => {
              const sys = latestOwnershipStatus;
              const ownBadge = ownershipStatusBadge(
                sys,
                "light"
              );
              return (
                <div className="rounded-2xl border border-black/[0.05] bg-gradient-to-br from-neutral-50/95 to-white/80 px-5 py-5 md:px-6">
                  <p className={ownBadge.className}>
                    {ownBadge.label}
                  </p>
                  {currentOwner.slug && currentOwner.display_name ? (
                    <p className={`mt-2 text-sm ${heldByTone}`}>
                      Held by{" "}
                      <Link
                        href={`/collector-studio/${encodeURIComponent(currentOwner.slug)}`}
                        className="underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
                      >
                        {currentOwner.display_name}
                      </Link>
                    </p>
                  ) : (
                    <p className={`mt-2 text-sm ${heldByTone}`}>{heldByLine}</p>
                  )}
    </div>
              );
            })()}
            {artwork.description ? (
              <section className="rounded-2xl border border-black/[0.06] bg-white/60 px-5 py-6 shadow-sm md:px-6 md:py-7">
                <h2 className="font-serif text-lg font-normal text-neutral-950">
                  About this work
                </h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
                  {artwork.description}
                </p>
              </section>
            ) : null}
  </div>
        </div>

        {/* Primary grid */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="space-y-10 lg:col-span-7">
            <section className="liquid-glass-tile rounded-2xl p-6 md:p-8">
              <h2 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
                Specifications
              </h2>
              <dl className="mt-6 divide-y divide-black/[0.06] text-sm">
                <div className="flex justify-between gap-6 py-4 first:pt-0">
                  <dt className="text-neutral-500">Medium</dt>
                  <dd className="max-w-[60%] text-right text-neutral-900">
                    {artwork.medium || "–"}
                  </dd>
                </div>
                <div className="flex justify-between gap-6 py-4">
                  <dt className="text-neutral-500">Dimensions</dt>
                  <dd className="max-w-[60%] text-right text-neutral-900">
                    {artwork.dimensions || "–"}
                  </dd>
                </div>
                <div className="flex justify-between gap-6 py-4">
                  <dt className="text-neutral-500">Year</dt>
                  <dd className="text-right text-neutral-900">
                    {artwork.year || "–"}
                  </dd>
                </div>
                {editionLine ? (
                  <div className="flex justify-between gap-6 py-4">
                    <dt className="text-neutral-500">Edition</dt>
                    <dd className="text-right text-neutral-900">{editionLine}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className="relative overflow-hidden rounded-2xl border border-black/[0.07] bg-gradient-to-b from-white via-white to-neutral-50/90 p-6 shadow-[0_20px_56px_-36px_rgba(15,23,42,0.14)] md:p-9">
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl"
                aria-hidden
              />
              <div className="relative">
                <div className="flex flex-col gap-3 border-b border-black/[0.06] pb-6">
                  <InfoTooltip text="A unified timeline of creation, verification, certification, ownership, and recorded values." />
                  <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950">
                    Provenance
                  </h2>
                </div>
                {provenanceInsights.length > 0 ? (
                  <div className="mt-8">
                    <h3 className="text-base font-medium text-neutral-900">
                      Record insights
                    </h3>
                    <div className="mt-4 space-y-3">
                      {provenanceInsights.map((ins, i) => (
                        <div
                          key={`${ins.type}-${ins.priority}-${i}`}
                          className="rounded-xl border border-emerald-900/[0.08] bg-emerald-50/35 px-5 py-4 text-sm text-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]"
                        >
                          {ins.message}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="mt-8">
                  <ArchivalProvenanceTimeline bundle={provenanceBundle} />
                </div>
              </div>
            </section>
        </div>

          {/* Right column: trust panel */}
          <aside className="space-y-6 lg:col-span-5">
            <div className="liquid-glass-tile rounded-2xl p-8 md:p-9">
              <h2 className="font-serif text-lg font-normal text-neutral-950">
                Certificate status
              </h2>
              <div className="mt-6 space-y-3 text-sm">
                {!hasCertificate ? (
                  <p className="font-medium text-neutral-900">
                    Certificate not recorded
                  </p>
                ) : certRevoked ? (
                  <div className="space-y-2">
                    <p className="font-medium text-red-800">✕ Revoked</p>
                    {certificate?.revoked_reason ? (
                      <p className="text-red-700/90">{certificate.revoked_reason}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="font-medium text-emerald-900">✓ Certificate recorded</p>
                )}

                <div className="mt-6">
                  <RegistryCertificateOverviewButton
                    registryId={artwork.registry_id}
                  />
                </div>

                <p className="text-xs text-neutral-500">
                  Numbers and fingerprints are not shown here. Sign in to view
                  the full certificate document.
                </p>
                <Link
                  href={`/login?next=${encodeURIComponent(`/certificate/${artwork.registry_id}`)}`}
                  className="liquid-glass-inset mt-4 block px-4 py-3 text-center text-sm font-medium text-neutral-800 transition hover:bg-white/80"
                >
                  View certificate (login required)
                </Link>
              </div>
            </div>

            <RegistryTechnicalDetails
              registryId={artwork.registry_id}
              verificationHash={artwork.verification_hash}
              timelineHash={artwork.timeline_hash}
            />

            <div className="liquid-glass-tile rounded-2xl p-8">
              <h2 className="font-serif text-lg font-normal text-neutral-950">
                Verification
              </h2>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={`/verify/${encodeURIComponent(artwork.registry_id)}`}
                  className="rounded-xl bg-neutral-950 px-4 py-3 text-center text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800"
                >
                  Verify certificate
                </Link>
                <PublicClaimOwnership
                  artworkId={artwork.id}
                  registryId={artwork.registry_id}
                  loginNextPath={claimReturnPath}
                />
                <ShareRecordButton url={shareUrl} />
              </div>
            </div>
          </aside>
        </div>
      </main>
  </div>
);
}
