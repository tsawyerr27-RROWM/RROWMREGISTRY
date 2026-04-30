import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPublicProvenanceByRegistryId,
  PUBLIC_PROVENANCE_UNAVAILABLE,
} from "@/lib/get-public-provenance";
import { ProvenanceTimeline } from "@/components/provenance/ProvenanceTimeline";
import { ProvenanceGalleryVerify } from "@/components/provenance/ProvenanceGalleryVerify";
import { PageNav } from "@/components/ui/PageNav";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function ArtworkProvenancePage({
  params,
}: {
  params: Promise<{ registry_id: string }>;
}) {
  const { registry_id } = await params;
  const clean = registry_id.trim();

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const viewerUserId = authData.user?.id ?? null;

  const result = await getPublicProvenanceByRegistryId(clean, { viewerUserId });
  if (result.kind === "not_found") notFound();

  if (result.kind === "limited") {
    const { header } = result;
    const artworkHref = `/artwork/${encodeURIComponent(header.registryId)}`;
    return (
      <div className="min-h-screen rrowm-bg-page pt-20 text-neutral-900">
        <main className="mx-auto max-w-3xl px-6 py-12 md:py-20">
          <PageNav
            backHref={artworkHref}
            crumbs={[
              { label: "Artwork", href: artworkHref },
              { label: "Provenance" },
            ]}
          />

          <header className="mt-10 border-b border-black/[0.06] pb-12">
            <h1 className="font-serif text-3xl font-normal leading-tight tracking-tight text-neutral-950 md:text-4xl">
              {header.title ?? "Untitled work"}
            </h1>
            <div className="mt-5 text-base text-neutral-800">
              {header.artistSlug ? (
                <Link
                  href={`/artist/${encodeURIComponent(header.artistSlug)}`}
                  className="transition hover:text-neutral-600 hover:underline"
                >
                  {header.artistName ?? "Artist"}
                </Link>
              ) : (
                <span>{header.artistName ?? "Artist"}</span>
              )}
            </div>
            <p className="mt-6 font-mono text-xs text-neutral-500">{header.registryId}</p>
          </header>

          <p className="mt-12 max-w-xl text-sm leading-relaxed text-neutral-600">
            {PUBLIC_PROVENANCE_UNAVAILABLE}
          </p>

          <footer className="mt-20 border-t border-black/[0.06] pt-12 text-center">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              <Link
                href={`/registry/${encodeURIComponent(header.registryId)}`}
                className="text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
              >
                Registry entry
              </Link>
              <Link
                href={artworkHref}
                className="text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
              >
                Artwork overview
              </Link>
            </div>
          </footer>
        </main>
      </div>
    );
  }

  const {
    header,
    integrity,
    timeline,
    state,
    certificate,
    recordedEventCount,
    provenanceActivityEmpty,
    viewContext,
    valueHistory,
    valueLatestByCurrency,
    collectorSurface,
    gallerySurface,
    artworkId,
  } = result.data;
  const artworkHref = `/artwork/${encodeURIComponent(header.registryId)}`;

  const artistRelLabel =
    gallerySurface?.artistRelationship === "represented"
      ? "Represented artist"
      : "Associated artist";

  return (
    <div className="min-h-screen rrowm-bg-page pt-20 text-neutral-900">
      <main className="mx-auto max-w-3xl px-6 py-12 md:py-20">
        <PageNav
          backHref={artworkHref}
          crumbs={[
            { label: "Artwork", href: artworkHref },
            { label: "Provenance" },
          ]}
        />

        <header className="mt-10 border-b border-black/[0.06] pb-12">
          <h1 className="font-serif text-3xl font-normal leading-tight tracking-tight text-neutral-950 md:text-4xl">
            {header.title ?? "Untitled work"}
          </h1>
          <div className="mt-5 text-base text-neutral-800">
            {header.artistSlug ? (
              <Link
                href={`/artist/${encodeURIComponent(header.artistSlug)}`}
                className="transition hover:text-neutral-600 hover:underline"
              >
                {header.artistName ?? "Artist"}
              </Link>
            ) : (
              <span>{header.artistName ?? "Artist"}</span>
            )}
          </div>
          {viewContext === "collector" ? (
            <p className="mt-4 text-sm font-medium text-neutral-800">Owned by you</p>
          ) : null}
          {gallerySurface ? (
            <div className="mt-6 max-w-xl space-y-3 border-t border-black/[0.06] pt-6 text-sm leading-relaxed text-neutral-600">
              <p>{gallerySurface.verificationAuthorityLine}</p>
              <p>
                <span className="font-medium text-neutral-800">
                  {artistRelLabel}
                </span>
                <span className="mt-1 block text-neutral-800">{header.artistName ?? "Artist"}</span>
              </p>
              {gallerySurface.galleryName ? (
                <p className="text-xs text-neutral-500">{gallerySurface.galleryName}</p>
              ) : null}
            </div>
          ) : null}
          <p className="mt-6 font-mono text-xs text-neutral-500">{header.registryId}</p>
          {header.createdAtLabel ? (
            <p className="mt-2 text-sm text-neutral-500">Record established {header.createdAtLabel}</p>
          ) : null}
        </header>

        {gallerySurface?.canMarkVerified ? (
          <section className="mt-10 border-t border-black/[0.06] pt-10">
            <h2 className="font-serif text-lg font-normal text-neutral-950">
              Verification
            </h2>
            <p className="mt-4 max-w-xl text-sm text-neutral-600">
              Record a gallery attestation for this work when you are ready to confirm the registry
              record.
            </p>
            <ProvenanceGalleryVerify
              artworkId={artworkId}
              artworkTitle={header.title ?? ""}
              registryId={header.registryId}
              canMarkVerified={gallerySurface.canMarkVerified}
            />
          </section>
        ) : null}

        <section className="mt-12 border-t border-black/[0.06] pt-10">
          <h2 className="font-serif text-lg font-normal text-neutral-950">
            Record integrity
          </h2>
          <p className="mt-4 font-serif text-xl font-normal tracking-tight text-neutral-950">
            {integrity.levelLabel}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600">{integrity.narrative}</p>
          {integrity.certificateRevoked ? (
            <div className="mt-8 border-t border-black/[0.06] pt-8">
              <p className="text-xs font-medium text-neutral-700">{integrity.certificateRevoked.headline}</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600">
                {integrity.certificateRevoked.body}
              </p>
            </div>
          ) : null}
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-lg font-normal text-neutral-950">
            Provenance
          </h2>
          {collectorSurface?.acquisitionNote ? (
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-neutral-600">
              {collectorSurface.acquisitionNote}
            </p>
          ) : null}
          {provenanceActivityEmpty ? (
            <p className="mt-8 max-w-xl text-sm leading-relaxed text-neutral-600">
              This record has been created, but no provenance activity has been recorded yet.
            </p>
          ) : (
            <>
              <p className="mt-8 text-sm text-neutral-600">
                Provenance history includes {recordedEventCount} recorded{" "}
                {recordedEventCount === 1 ? "event" : "events"}.
              </p>
              <div className="mt-10">
                <ProvenanceTimeline viewContext={viewContext} entries={timeline} />
              </div>
            </>
          )}
        </section>

        {viewContext !== "public" && valueHistory.length > 0 ? (
          <section className="mt-16 border-t border-black/[0.06] pt-12">
            <h2 className="font-serif text-lg font-normal text-neutral-950">
              Value history
            </h2>
            {valueLatestByCurrency.length > 0 ? (
              <ul className="mt-6 space-y-2 text-sm text-neutral-800">
                {valueLatestByCurrency.map((row) => (
                  <li key={row.currencyUpper}>{row.line}</li>
                ))}
              </ul>
            ) : null}
            <ul className="mt-6 space-y-3 text-sm text-neutral-600">
              {valueHistory.map((row, i) => (
                <li key={`${row.currencyUpper}-${i}-${row.whenLabel}`} className="leading-relaxed">
                  <span className="text-neutral-900">{row.amountLabel}</span>
                  {row.visibilityNote ? (
                    <span className="text-neutral-500"> ({row.visibilityNote})</span>
                  ) : null}
                  <span className="mt-0.5 block text-xs text-neutral-500">{row.whenLabel}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-16 border-t border-black/[0.06] pt-12">
          <h2 className="font-serif text-lg font-normal text-neutral-950">
            Current record
          </h2>
          <dl className="mt-8 space-y-6">
            <div>
              <dt className="text-sm font-medium text-neutral-600">Owner</dt>
              <dd className="mt-1 text-base text-neutral-900">{state.ownerLine}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-600">Verification</dt>
              <dd className="mt-1 text-base text-neutral-900">{state.verificationLine}</dd>
            </div>
            <div>
              <dt className="font-serif text-lg font-normal text-neutral-950">Declared value</dt>
              <dd className="mt-1 text-base text-neutral-900">
                {state.valuesLines.length ? (
                  <ul className="space-y-1">
                    {state.valuesLines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-neutral-500">
                    {viewContext === "public"
                      ? "Not declared on the public record"
                      : "Not declared on the registry record"}
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-600">Certificate</dt>
              <dd className="mt-1 text-base text-neutral-900">{state.certificateLine}</dd>
              {gallerySurface?.certificateContextLine ? (
                <p className="mt-2 max-w-xl text-xs text-neutral-500">
                  {gallerySurface.certificateContextLine}
                </p>
              ) : null}
            </div>
          </dl>
        </section>

        {certificate.showRow ? (
          <section className="mt-14 border-t border-black/[0.06] pt-12">
            <h2 className="font-serif text-lg font-normal text-neutral-950">
              Certificate
            </h2>
            <p className="mt-5 text-sm text-neutral-700">{certificate.label}</p>
            <div className="mt-6">
              <Link
                href={certificate.loginNextHref}
                className={`inline-flex rounded-xl border px-5 py-2.5 text-sm font-medium transition ${
                  viewContext === "collector"
                    ? "border-neutral-900 bg-neutral-950 text-white hover:bg-neutral-800"
                    : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400 hover:bg-neutral-50"
                }`}
              >
                View certificate
              </Link>
              <p className="mt-3 text-xs text-neutral-500">Sign in may be required to open the document.</p>
            </div>
          </section>
        ) : null}

        <footer className="mt-20 border-t border-black/[0.06] pt-12 text-center">
          <p className="mx-auto max-w-md text-sm leading-relaxed text-neutral-600">
            This record is maintained on the RROWM registry. All changes are recorded as part of a
            permanent, auditable history.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href={`/registry/${encodeURIComponent(header.registryId)}`}
              className="text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
            >
              Registry entry
            </Link>
            <Link
              href={artworkHref}
              className="text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
            >
              Artwork overview
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
