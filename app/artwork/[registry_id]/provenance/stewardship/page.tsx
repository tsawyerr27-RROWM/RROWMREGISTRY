import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPublicProvenanceByRegistryId,
  PUBLIC_PROVENANCE_UNAVAILABLE,
} from "@/lib/get-public-provenance";
import { PageNav } from "@/components/ui/PageNav";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { RecordDisputeForm } from "@/components/disputes/RecordDisputeForm";
import { ProvenanceGalleryVerify } from "@/components/provenance/ProvenanceGalleryVerify";
import { getArtworkDisputeFormContext } from "@/lib/artwork-dispute-context";
import { getArchivalProvenanceBundle } from "@/lib/provenance-timeline";
import { stewardshipContinuityNotesFromBundle } from "@/lib/registry-continuity";
import { maskArtistInviteEmail } from "@/lib/mask-email";

export const dynamic = "force-dynamic";

export default async function ProvenanceStewardshipPage({
  params,
}: {
  params: Promise<{ registry_id: string }>;
}) {
  const { registry_id } = await params;
  const clean = registry_id.trim();

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const viewerUserId = authData.user?.id ?? null;

  const result = await getPublicProvenanceByRegistryId(clean, {
    viewerUserId,
    viewerSupabase: supabase,
  });
  if (result.kind === "not_found") notFound();

  if (result.kind === "limited") {
    const { header } = result;
    const artworkHref = `/artwork/${encodeURIComponent(header.registryId)}`;
    const provenanceHref = `/artwork/${encodeURIComponent(header.registryId)}/provenance`;
    return (
      <div className="min-h-screen rrowm-bg-page pt-20 text-neutral-900">
        <main className="mx-auto max-w-3xl px-6 py-12 md:py-20">
          <PageNav backHref={provenanceHref} />
          <h1 className="mt-10 font-serif text-2xl font-normal text-neutral-950">
            Stewardship actions
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-neutral-600">
            {PUBLIC_PROVENANCE_UNAVAILABLE}
          </p>
          <p className="mt-8">
            <Link
              href={artworkHref}
              className="text-sm text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
            >
              Published work
            </Link>
          </p>
        </main>
      </div>
    );
  }

  const {
    header,
    gallerySurface,
    artworkId,
  } = result.data;
  const artworkHref = `/artwork/${encodeURIComponent(header.registryId)}`;
  const provenanceHref = `/artwork/${encodeURIComponent(header.registryId)}/provenance`;

  const { data: artworkRow } = await supabase
    .from("artworks")
    .select("id, artist_id, title, registry_id, created_at, verification_status")
    .eq("id", artworkId)
    .maybeSingle();

  const archivalBundle =
    artworkRow?.registry_id != null && artworkRow?.created_at
      ? await getArchivalProvenanceBundle({
          supabase,
          artwork: {
            id: artworkRow.id,
            registry_id: artworkRow.registry_id,
            title: artworkRow.title,
            artist_id: artworkRow.artist_id,
            created_at: String(artworkRow.created_at),
            verification_status: artworkRow.verification_status ?? null,
          },
          artistName: header.artistName ?? null,
        })
      : null;
  const stewardshipContinuityLines =
    stewardshipContinuityNotesFromBundle(archivalBundle);

  let pendingContinuationInvitee: string | null = null;
  if (viewerUserId != null && artworkRow) {
    const { data: pendingTransfer } = await supabase
      .from("provenance_transfers")
      .select("recipient_email")
      .eq("artwork_id", artworkRow.id)
      .in("status", ["pending_acceptance", "initiated"])
      .maybeSingle();
    const email =
      pendingTransfer?.recipient_email != null &&
      typeof pendingTransfer.recipient_email === "string"
        ? pendingTransfer.recipient_email.trim()
        : "";
    if (email) pendingContinuationInvitee = maskArtistInviteEmail(email);
  }

  const disputeCtx = artworkRow
    ? await getArtworkDisputeFormContext(supabase, {
        artworkId: artworkRow.id,
        artistId: artworkRow.artist_id,
      })
    : null;

  const artistRelLabel =
    gallerySurface?.artistRelationship === "represented"
      ? "Represented artist"
      : "Associated artist";

  return (
    <div className="min-h-screen rrowm-bg-page pt-20 text-neutral-900">
      <main className="mx-auto max-w-3xl px-6 py-12 md:py-20">
        <PageNav backHref={provenanceHref} />

        <header className="mt-10 border-b border-neutral-200/80 pb-10">
          <h1 className="font-serif text-2xl font-normal tracking-tight text-neutral-950 md:text-3xl">
            Stewardship & verification actions
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-600">
            Forms and attestations for registry governance, separate from the public
            chronology.
          </p>
          <p className="mt-6 font-mono text-xs text-neutral-500">{header.registryId}</p>
          <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link
              href={provenanceHref}
              className="text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
            >
              Chronology
            </Link>
            <Link
              href={artworkHref}
              className="text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
            >
              Published work
            </Link>
          </nav>
        </header>

        {stewardshipContinuityLines.length > 0 || pendingContinuationInvitee ? (
          <section
            className="mt-12 rounded-xl border border-neutral-200/70 bg-white/40 px-5 py-6 md:px-6"
            aria-label="Continuity stewardship"
          >
            <h2 className="font-serif text-lg font-normal text-neutral-950">
              Continuity on this record
            </h2>
            <div className="mt-4 max-w-xl space-y-3 text-[13px] leading-relaxed text-neutral-600">
              {stewardshipContinuityLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              {pendingContinuationInvitee ? (
                <p>
                  A chronology continuation invitation is awaiting response from the
                  invited participant ({pendingContinuationInvitee}).
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {gallerySurface ? (
          <section className="mt-12 border-t border-neutral-200/80 pt-10">
            <h2 className="font-serif text-lg font-normal text-neutral-950">
              Institutional context
            </h2>
            <div className="mt-4 max-w-xl space-y-2 text-sm leading-relaxed text-neutral-600">
              <p>{gallerySurface.verificationAuthorityLine}</p>
              <p>
                <span className="font-medium text-neutral-800">{artistRelLabel}</span>
                <span className="mt-1 block text-neutral-800">
                  {header.artistName ?? "Artist"}
                </span>
              </p>
              {gallerySurface.galleryName ? (
                <p className="text-xs text-neutral-500">{gallerySurface.galleryName}</p>
              ) : null}
            </div>
          </section>
        ) : null}

        {gallerySurface?.canMarkVerified ? (
          <section className="mt-12 border-t border-neutral-200/80 pt-10">
            <h2 className="font-serif text-lg font-normal text-neutral-950">
              Gallery verification
            </h2>
            <p className="mt-4 max-w-xl text-sm text-neutral-600">
              Record a gallery attestation for this work when you are ready to confirm the
              registry record.
            </p>
            <div className="mt-6">
              <ProvenanceGalleryVerify
                artworkId={artworkId}
                artworkTitle={header.title ?? ""}
                registryId={header.registryId}
                canMarkVerified={gallerySurface.canMarkVerified}
              />
            </div>
          </section>
        ) : null}

        <section
          className="mt-12 border-t border-neutral-200/80 pt-10"
          aria-label="Formal review"
        >
          <h2 className="font-serif text-lg font-normal text-neutral-950">
            Formal review · raise a challenge
          </h2>
          <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-neutral-600">
            Sensitive evidence stays in the dispute workflow after submission, not on the
            public chronology.
          </p>
          {disputeCtx && artworkRow ? (
            <div className="mt-8 space-y-8">
              {!disputeCtx.ownershipDisputed && disputeCtx.latestOwnershipEventId ? (
                <RecordDisputeForm
                  targetType="ownership"
                  targetId={disputeCtx.latestOwnershipEventId}
                  contextLabel={`Ownership · ${(header.title || "").trim() || header.registryId}`}
                />
              ) : null}
              {!disputeCtx.artistDisputed && artworkRow.artist_id ? (
                <RecordDisputeForm
                  targetType="artist"
                  targetId={artworkRow.artist_id}
                  contextLabel={`Artist attribution · ${(header.title || "").trim() || header.registryId}`}
                />
              ) : null}
              {!disputeCtx.relationshipDisputed && disputeCtx.invForRegistry?.id ? (
                <RecordDisputeForm
                  targetType="gallery_relationship"
                  targetId={disputeCtx.invForRegistry.id}
                  contextLabel={`Institutional relationship · ${gallerySurface?.galleryName?.trim() || "Representing institution"}`}
                />
              ) : null}
            </div>
          ) : (
            <p className="mt-6 text-sm text-neutral-600">
              Challenge forms could not be loaded for this record.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
