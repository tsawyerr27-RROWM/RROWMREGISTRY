/**
 * Full certificate document — requires an authenticated session.
 * Future: support `?token=` for QR / controlled deep links; validate server-side before rendering.
 */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CertificateDocumentView } from "@/components/certificate/CertificateDocumentView";
import { CertificateMissingView } from "@/components/certificate/CertificateMissingView";
import { StudioCertificateAckEffect } from "@/components/Studio/StudioCertificateAckEffect";
import {
  buildCertificateMetadata,
  buildCertificateNotFoundMetadata,
  loadCertificateOgBundle,
} from "@/lib/certificate-og";
import {
  certificateLoginRedirectPath,
  loadCertificatePageData,
} from "@/lib/load-certificate-page";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ registry_id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { registry_id } = await params;
  const supabase = await createSupabaseServerClient();
  const bundle = await loadCertificateOgBundle(supabase, registry_id);

  if (!bundle) {
    return buildCertificateNotFoundMetadata();
  }

  return buildCertificateMetadata(bundle);
}

export default async function CertificatePage({ params }: PageProps) {
  const { registry_id } = await params;
  const result = await loadCertificatePageData(registry_id);

  if (result === "redirect_login") {
    redirect(certificateLoginRedirectPath(registry_id));
  }
  if (result === "not_found") {
    notFound();
  }

  return (
    <>
      <StudioCertificateAckEffect registryId={result.ackRegistryId} />
      {result.kind === "missing" ? (
        <CertificateMissingView registryId={result.registryId} />
      ) : (
        <CertificateDocumentView
          data={result.data}
          isArtistOwner={result.isArtistOwner}
          qrCodeDataUrl={result.qrCodeDataUrl}
        />
      )}
    </>
  );
}
