import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";
import { PageNav } from "@/components/ui/PageNav";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ registry_id: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { registry_id } = await params;
  const cleanId = registry_id.trim();

  const headersList = await headers();
  const referer = headersList.get("referer") || "";
  let backHref: string | undefined =
    `/registry/${encodeURIComponent(cleanId)}`;
  let crumbsRoot: { label: string; href: string } = {
    label: "Registry",
    href: `/registry/${encodeURIComponent(cleanId)}`,
  };

  try {
    const url = new URL(referer);
    const path = url.pathname;
    const full = `${url.pathname}${url.search || ""}`;
    if (path.startsWith("/registry")) {
      backHref = full;
      crumbsRoot = { label: "Registry", href: full };
    } else if (path.startsWith("/certificate")) {
      backHref = full;
      crumbsRoot = { label: "Certificate", href: full };
    }
  } catch {
    // Fallbacks already set.
  }

  const { data: artwork, error: artworkError } = await supabase
  .from("artworks")
    .select("id, title, registry_id, verification_status, created_at, artist_id")
    .eq("registry_id", cleanId)
  .maybeSingle();

  if (artworkError) warnSupabaseRpc("verify page artwork", artworkError);
  if (!artwork) {
  notFound();
}

  const isVerified = artwork.verification_status === "verified";

  const { data: artist } = await supabase
    .from("artists")
    .select("display_name, full_name")
    .eq("id", artwork.artist_id)
    .maybeSingle();

  const publicName =
    artist?.display_name?.trim() ||
    artist?.full_name?.trim() ||
    null;

  type CertPublic = {
    has_certificate: boolean;
    revoked: boolean;
    revoked_reason: string | null;
  };
  let certificate: CertPublic | undefined;
  let isRevoked = false;

  if (isVerified) {
    const { data: certRows, error: certRpcError } = await supabase.rpc(
      "get_certificate_public_status_single",
      { p_artwork_id: artwork.id }
    );
    if (certRpcError) warnSupabaseRpc("verify cert RPC", certRpcError);
    certificate = certRows?.[0] as CertPublic | undefined;
    isRevoked = Boolean(certificate?.revoked);
  }

  return (
    <div className="ds-page-environment relative flex min-h-screen items-center justify-center px-6 py-24 pt-28">
      <div className="absolute left-0 right-0 top-24 mx-auto max-w-4xl px-6">
        <PageNav
          backHref={backHref}
          crumbs={[
            crumbsRoot,
            { label: "Verify", href: `/verify/${encodeURIComponent(artwork.registry_id)}` },
            { label: artwork.registry_id },
          ]}
          className="mb-6"
        />
      </div>
      {isRevoked && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rotate-[-20deg] text-[120px] font-bold tracking-widest text-red-600 opacity-10">
            REVOKED
          </div>
        </div>
      )}

      <div className="liquid-glass-tile relative z-10 w-full max-w-xl overflow-hidden p-12 md:p-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[var(--rrowm-base-deep)]/35 blur-3xl" />
        <div className="relative">
        <h1 className="font-serif text-4xl font-normal leading-[1.1] tracking-tight text-neutral-950 md:text-5xl">
          {artwork.title}
        </h1>

        {publicName && (
          <p className="mt-4 text-lg text-neutral-700">{publicName}</p>
        )}

        {!isVerified && (
          <div className="liquid-glass-inset mt-8 bg-amber-50/75 px-4 py-3 text-sm text-amber-950 backdrop-blur-md">
            <p className="font-medium">Not yet verified</p>
            <p className="mt-1 text-amber-900/80">
              This work is registered on RROWM. Certificate verification applies
              after the record is verified. See the full registry entry for
              details.
            </p>
            <Link
              href={`/registry/${encodeURIComponent(artwork.registry_id)}`}
              className="mt-3 inline-block text-sm font-medium text-amber-950 underline underline-offset-2"
            >
              View registry record
            </Link>
          </div>
        )}

        <div className="mt-10 space-y-4 text-sm text-neutral-600">
          <div>
            <span className="text-sm text-neutral-400">
              Registry ID
            </span>
            <p className="mt-1 font-mono text-xs">{artwork.registry_id}</p>
          </div>

          <div>
            <span className="text-sm text-neutral-400">
              Certificate status
            </span>
            <p className="mt-1 capitalize">
              {!isVerified
                ? "Pending verification"
                : !certificate?.has_certificate
                  ? "Certificate not recorded"
                  : isRevoked
                    ? "Revoked"
                    : "Certificate recorded"}
            </p>
          </div>

          <div>
            <span className="text-sm text-neutral-400">
              Verification
            </span>
            <p className="mt-1 capitalize">{artwork.verification_status}</p>
          </div>

          <div>
            <span className="text-sm text-neutral-400">
              Recorded
            </span>
            <p className="mt-1">
              {new Date(artwork.created_at).toLocaleDateString()}
            </p>
          </div>

          {isVerified && isRevoked && certificate?.revoked_reason && (
            <div className="liquid-glass-inset mt-6 bg-red-50/85 p-4 text-sm text-red-700">
              <p className="mb-2 text-xs font-medium">
                Revocation reason
              </p>
              <p>{certificate.revoked_reason}</p>
            </div>
          )}
        </div>

        {isVerified ? (
          <p className="mt-8 text-xs text-neutral-500">
            Full certificate document requires sign-in.{" "}
            <a
              href={`/login?next=${encodeURIComponent(`/certificate/${encodeURIComponent(artwork.registry_id)}`)}`}
              className="font-medium text-neutral-800 underline underline-offset-2"
            >
              View certificate (login required)
            </a>
          </p>
        ) : null}
        </div>
      </div>
    </div>
  );
}
