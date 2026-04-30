/**
 * Full certificate document — requires an authenticated session (see redirect below).
 * Future: support `?token=` (or similar) for QR / controlled deep links; validate server-side before rendering.
 */
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";
import { PageNav } from "@/components/ui/PageNav";
import { CertificateArtistActions } from "@/components/certificate/CertificateArtistActions";
import { StudioCertificateAckEffect } from "@/components/Studio/StudioCertificateAckEffect";
import * as QRCode from "qrcode";

export const dynamic = "force-dynamic";

type Certificate = {
  certificate_number: string;
  issued_at: string;
  revoked: boolean;
  revoked_reason: string | null;
  certificate_hash: string | null;
};

type ArtworkRow = {
  id: string;
  title: string;
  registry_id: string;
  verification_status: string;
  verification_hash: string;
  timeline_hash: string | null;
  created_at: string;
  artist_id: string;
};

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ registry_id: string }>;
}) {
  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

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
    } else if (path.startsWith("/verify")) {
      backHref = full;
      crumbsRoot = { label: "Verify", href: full };
    }
  } catch {
    // Fallbacks already set.
  }

  const nextPath = `/certificate/${encodeURIComponent(cleanId)}`;
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select(
      `
      id,
      title,
      registry_id,
      verification_status,
      verification_hash,
      timeline_hash,
      created_at,
      artist_id
    `
    )
    .eq("registry_id", cleanId)
    .maybeSingle<ArtworkRow>();

  if (artworkError) warnSupabaseRpc("certificate page artwork", artworkError);
  if (!artwork) {
    notFound();
  }

  const { error: certOwnErr } = await supabase.rpc(
    "ownership_certificate_verify",
    { p_artwork_id: artwork.id }
  );
  if (certOwnErr) {
    warnSupabaseRpc("ownership_certificate_verify", certOwnErr);
  }

  if (artwork.verification_status !== "verified") {
    notFound();
  }

  const { data: artist } = await supabase
    .from("artists")
    .select("display_name, full_name")
    .eq("id", artwork.artist_id)
    .maybeSingle();

  const publicName =
    artist?.display_name?.trim() || artist?.full_name?.trim() || null;

  const { data: certificate } = await supabase
    .from("certificates")
    .select(
      `
      certificate_number,
      issued_at,
      revoked,
      revoked_reason,
      certificate_hash
    `
    )
    .eq("artwork_id", artwork.id)
    .maybeSingle<Certificate>();

  if (!certificate) {
    return (
      <div className="ds-page-environment min-h-screen px-6 py-24 text-neutral-900">
        <div className="liquid-glass-tile mx-auto max-w-lg overflow-hidden">
          <div className="liquid-glass-inset px-10 py-8">
            <Link href="/" className="inline-block">
              <Image
                src="/rrowm.svg"
                alt="RROWM"
                width={140}
                height={56}
                className="h-10 w-auto max-w-[150px] object-contain object-left opacity-90"
              />
            </Link>
          </div>
          <div className="px-10 py-10">
            <PageNav
              backHref={backHref}
              crumbs={[
                crumbsRoot,
                { label: "Certificate", href: `/certificate/${encodeURIComponent(artwork.registry_id)}` },
                { label: artwork.registry_id },
              ]}
              className="!mb-0"
            />
            <h1 className="mt-8 font-serif text-2xl font-medium tracking-tight text-neutral-900">
              No certificate on file
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            A certificate has not been issued for this registry record yet.
          </p>
          <Link
            href={`/registry/${encodeURIComponent(artwork.registry_id)}`}
              className="mt-10 inline-flex rounded-xl bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            View registry record
          </Link>
          </div>
        </div>
      </div>
    );
  }

  const isArtistOwner = user.id === artwork.artist_id;

  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/registry/${artwork.registry_id}`;
  const qrCode = await QRCode.toDataURL(verificationUrl);
  const isRevoked = certificate.revoked;

  const issuedDate = new Date(certificate.issued_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  /** Screen unchanged; print uses A4 page with 10mm margins → 190×277mm usable. Box is 190mm wide × (210/297) aspect ≈268.6mm tall. */
  const labelClass =
    "text-sm font-medium text-neutral-600 print:text-[8.5px]";
  const hashBoxClass =
    "mt-3 rounded-md border border-neutral-200/90 bg-white/90 px-3.5 py-3 font-mono text-[10px] leading-relaxed tracking-[0.06em] text-neutral-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] print:mt-2 print:px-2.5 print:py-2 print:text-[9px] print:leading-snug";

  return (
    <div className="ds-page-environment relative flex min-h-screen items-center justify-center px-4 py-16 pt-24 md:px-8 print:box-border print:bg-white print:px-4 print:py-3">
      <StudioCertificateAckEffect registryId={artwork.registry_id} />
      {/* Matches A4 (210×297mm) with 10mm margins so the 190mm-wide box aligns to the printable width. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print { @page { size: A4 portrait; margin: 10mm; } }`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply print:hidden"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.18) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none print:hidden">
        <div className="text-[min(22vw,200px)] font-light tracking-[0.45em] text-neutral-900/[0.04]">
          RROWM
        </div>
      </div>

      {isRevoked ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center print:hidden">
          <div className="rotate-[-14deg] text-[min(20vw,180px)] font-semibold tracking-[0.2em] text-red-900/[0.06]">
            REVOKED
          </div>
        </div>
      ) : null}

      <article className="certificate-print-sheet relative z-10 mx-auto w-full max-w-[800px] print:mx-auto print:max-w-none print:w-full">
        <div className="print:box-border print:mx-auto print:flex print:h-auto print:w-[190mm] print:max-w-[190mm] print:shrink-0 print:flex-col print:overflow-hidden print:aspect-[210/297]">
          <div className="rounded-none border-0 bg-white shadow-[0_36px_88px_-36px_rgba(15,23,42,0.12)] print:flex print:h-full print:min-h-0 print:flex-1 print:flex-col print:rounded-sm print:border print:border-neutral-300/70 print:shadow-none">
            <div className="m-[10px] border-0 print:m-1.5 print:flex print:min-h-0 print:flex-1 print:flex-col print:border print:border-neutral-300/50">
              <div className="flex min-h-0 flex-1 flex-col justify-between gap-0 px-8 py-12 sm:px-12 sm:py-14 md:px-16 md:py-16 print:box-border print:min-h-0 print:flex-1 print:gap-0 print:px-3 print:py-2">
              <div className="mb-8 print:hidden">
                <PageNav
                  backHref={backHref}
                  crumbs={[
                    crumbsRoot,
                    {
                      label: "Certificate",
                      href: `/certificate/${encodeURIComponent(artwork.registry_id)}`,
                    },
                    { label: artwork.registry_id },
                  ]}
                />
              </div>

              {isArtistOwner ? (
                <CertificateArtistActions registryId={artwork.registry_id} />
              ) : null}

              {isRevoked ? (
                <div className="mb-10 shrink-0 break-inside-avoid bg-red-500/10 px-5 py-4 text-sm text-red-950 shadow-[0_20px_48px_-28px_rgba(127,29,29,0.2)] backdrop-blur-md print:mb-2 print:border print:border-red-200/90 print:bg-gradient-to-b print:from-red-50/95 print:to-red-50/60 print:px-3 print:py-2 print:text-xs print:shadow-none">
                  <p className="text-sm font-semibold text-red-900/90">
                    Certificate revoked
                  </p>
                  <p className="mt-2 leading-relaxed text-red-900/85">
                    This certificate is no longer valid. Do not rely on it for authenticity.
                  </p>
                  {certificate.revoked_reason ? (
                    <p className="mt-4 bg-red-500/5 px-3 py-2 text-red-800/95 print:mt-3 print:border-t print:border-red-200/70 print:bg-transparent print:px-0 print:py-0 print:pt-3">
                      {certificate.revoked_reason}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <header className="flex shrink-0 flex-col gap-8 pb-10 shadow-[inset_0_-1px_0_0_rgba(15,23,42,0.06)] sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pb-9 print:flex-row print:items-end print:justify-between print:gap-2 print:border-b print:border-neutral-200/90 print:pb-2 print:shadow-none">
                <div className="min-w-0">
                  <Link href="/" className="inline-block print:block">
                    <Image
                      src="/rrowm.svg"
                      alt="RROWM"
                      width={136}
                      height={52}
                      className="h-9 w-auto max-w-[148px] object-contain object-left opacity-95 sm:h-10 sm:max-w-[156px] print:h-8 print:max-w-[128px]"
                    />
                  </Link>
                  <p className="mt-5 text-sm text-neutral-500 print:mt-1.5">
              RROWM Registry
            </p>
                  <p className={`${labelClass} mt-2 text-neutral-500 print:mt-1`}>
                    Archival certificate of registration
            </p>
          </div>
                <div className="shrink-0 sm:text-right print:text-right">
                  <p className={labelClass}>Registry identifier</p>
                  <p className="mt-2 max-w-[100%] break-all font-mono text-[13px] font-medium tracking-[0.08em] text-neutral-900 print:text-[11px]">
              {artwork.registry_id}
            </p>
          </div>
              </header>

              <section className="min-w-0 py-12 sm:py-14 md:py-16 print:flex print:min-h-0 print:flex-1 print:flex-col print:justify-center print:py-1">
                <p className="text-center text-sm text-neutral-600 print:text-sm">
                  Registered work
                </p>
                <div className="mx-auto mt-6 flex max-w-2xl justify-center print:mt-2">
                  <div
                    className="h-px w-12 bg-gradient-to-r from-transparent via-neutral-300 to-transparent"
                    aria-hidden
                  />
                </div>
                <h1 className="mx-auto mt-8 max-w-full text-balance break-words px-1 text-center font-serif text-[2rem] leading-[1.18] tracking-tight text-neutral-950 sm:text-[2.65rem] sm:leading-[1.12] md:max-w-3xl md:text-[2.85rem] print:mt-2 print:px-0 print:text-[clamp(1.125rem,1.45rem,1.95rem)] print:leading-[1.12]">
            {artwork.title}
          </h1>
                {publicName ? (
                  <div className="mx-auto mt-10 max-w-xl px-1 text-center print:mt-2 print:max-w-full">
                    <p className={labelClass}>Attributed creator</p>
                    <p className="mt-3 text-balance break-words font-serif text-xl font-normal tracking-wide text-neutral-800 sm:text-2xl print:mt-1.5 print:text-lg">
              {publicName}
            </p>
        </div>
                ) : null}
              </section>

              <section className="grid shrink-0 grid-cols-1 gap-10 border-0 sm:grid-cols-3 sm:gap-12 print:grid-cols-3 print:gap-2 print:border-y print:border-neutral-200/90">
                <div className="min-w-0 px-1 py-2 sm:px-4 md:px-5 print:border-b-0 print:border-r print:border-neutral-200/80 print:px-2 print:py-2">
                  <p className={labelClass}>Certificate number</p>
                  <p className="mt-3 break-words text-[15px] font-medium tracking-[0.12em] text-neutral-900 print:mt-1.5 print:text-sm">
                {certificate.certificate_number}
              </p>
            </div>
                <div className="min-w-0 px-1 py-2 sm:px-4 md:px-5 print:border-b-0 print:border-r print:border-neutral-200/80 print:px-2 print:py-2">
                  <p className={labelClass}>Date issued</p>
                  <p className="mt-3 break-words text-[15px] font-normal tabular-nums text-neutral-900 print:mt-1.5 print:text-sm">
                    {issuedDate}
                  </p>
                </div>
                <div className="min-w-0 px-1 py-2 sm:px-4 md:px-5 print:px-2 print:py-2">
                  <p className={labelClass}>Verification</p>
                  <p className="mt-3 text-sm leading-snug text-neutral-700 print:mt-1.5 print:text-xs">
                    Scan the code below to open the public registry record.
              </p>
            </div>
              </section>

              <section className="liquid-glass-inset mt-10 shrink-0 break-inside-avoid px-6 py-8 sm:px-8 print:mt-2 print:border print:border-neutral-200/80 print:bg-gradient-to-b print:from-neutral-50/90 print:to-neutral-50/40 print:px-3 print:py-2 print:shadow-none">
                <div className="flex flex-wrap items-baseline justify-between gap-3 print:gap-1">
                  <p className="text-sm font-semibold text-neutral-500 print:text-sm">
                    Cryptographic attestation
                  </p>
                  <span className="text-[10px] text-neutral-600 print:text-[8.5px]">
                    Immutable record references
                  </span>
                </div>
                <div className="mt-8 space-y-8 print:mt-2 print:space-y-2">
                  <div className="min-w-0 break-inside-avoid">
                    <p className={labelClass}>Certificate fingerprint</p>
                    <p className={`${hashBoxClass} [overflow-wrap:anywhere]`}>
                      {certificate.certificate_hash || "No certificate hash recorded"}
            </p>
          </div>
                  <div className="min-w-0 break-inside-avoid">
                    <p className={labelClass}>Cryptographic record</p>
                    <p className={`${hashBoxClass} [overflow-wrap:anywhere]`}>{artwork.verification_hash}</p>
                  </div>
                  <div className="min-w-0 break-inside-avoid">
                    <p className={labelClass}>Event timeline fingerprint</p>
                    <p className={`${hashBoxClass} [overflow-wrap:anywhere]`}>
              {artwork.timeline_hash || "No timeline data recorded"}
            </p>
          </div>
                </div>
              </section>

              <footer className="mt-12 flex shrink-0 flex-col items-center gap-12 pt-12 sm:flex-row sm:items-end sm:justify-between sm:gap-10 sm:pt-11 print:mt-2 print:flex-row print:items-end print:justify-between print:gap-4 print:border-t print:border-neutral-200/90 print:pt-2">
                <div className="flex min-w-0 flex-col items-center sm:items-start print:items-start">
                  <div className="relative box-border flex h-[7.5rem] w-[7.5rem] max-h-[7.5rem] max-w-full shrink-0 items-center justify-center print:h-[4.75rem] print:w-[4.75rem] print:max-h-[4.75rem] print:max-w-[4.75rem]">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white to-neutral-100/60 shadow-[0_12px_28px_-10px_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,0.9)] print:border print:border-neutral-300/90 print:shadow-[inset_0_0_12px_rgba(0,0,0,0.06)]" />
                    <div className="absolute inset-[10%] rounded-full opacity-50 shadow-[inset_0_0_0_1px_rgba(163,163,163,0.3)] print:border print:border-dotted print:border-neutral-300/80 print:opacity-100 print:shadow-none" />
                    <div className="absolute inset-[22%] rounded-full shadow-[inset_0_0_0_1px_rgba(212,212,212,0.5)] print:border print:border-neutral-200/90 print:shadow-none" />
                    <div className="relative text-center text-[8px] font-medium leading-relaxed text-neutral-600 print:text-[7px]">
                RROWM
                <br />
                      <span className="text-neutral-500">Registry</span>
                    </div>
                  </div>
                  <p className="mt-4 max-w-[11rem] text-center text-sm text-neutral-400 sm:text-left print:mt-1 print:text-left print:text-[8px]">
                    Digital seal
                  </p>
                </div>
                <div className="flex min-w-0 flex-col items-center sm:items-end print:items-end">
                  <div className="liquid-glass-inset box-border p-3 print:border print:border-neutral-200/90 print:bg-white print:p-2 print:shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCode}
                      alt=""
                      className="box-border h-[5.5rem] w-[5.5rem] max-h-[5.5rem] max-w-full object-contain print:h-16 print:w-16 print:max-h-16 print:max-w-16"
                      width={88}
                      height={88}
                    />
                  </div>
                  <p className="mt-4 max-w-[14rem] text-center text-[10px] leading-relaxed text-neutral-500 sm:text-right print:mt-1 print:text-right print:text-[9px]">
                    Scan to verify this registry record
                  </p>
                </div>
              </footer>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
