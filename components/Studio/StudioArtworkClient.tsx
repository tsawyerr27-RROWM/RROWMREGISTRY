"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { RouteLoadingShell } from "@/components/ui/RouteLoadingShell";
import { ArtworkTrustBadge } from "@/components/Registry/ArtworkTrustBadge";
import {
  deferredRouterRefresh,
  deferredRouterReplace,
} from "@/lib/deferred-app-router";
import { fieldRecordHref } from "@/lib/field-nav";
import { studioCollectorArtworkHref } from "@/lib/studio-nav";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { OwnershipVerificationControls } from "@/components/Registry/OwnershipVerificationControls";
import { StudioSaleTransferModal } from "@/components/Studio/StudioSaleTransferModal";
import { SemanticToast } from "@/components/motion/SemanticToast";
import type { RegistrySemanticEvent } from "@/lib/registry-semantic-signals";
import { triggerConsequenceFeedback } from "@/lib/consequence-feedback-runtime";
import {
  formatOwnershipOwnerPrimary,
  latestOwnershipSystemStatus,
  ownershipStatusBadge,
} from "@/lib/ownership-ledger";
import {
  pickLatestOwnershipEvent,
  resolveHolderUserIdFromEvent,
} from "@/lib/ownership-canonical";
import { formatValueEventLabel } from "@/lib/format-registry-labels";
import { getCollectorOwnedArtworkIds } from "@/lib/collector-portfolio";
import {
  semanticAccentBorderClass,
  semanticDotClass,
} from "@/lib/registry-semantic-signals";
import { studioV2 } from "@/styles/studio-v2";

function isPublicSurfaceValueVisibility(visibility: string | null | undefined) {
  return (
    visibility == null ||
    visibility === "" ||
    visibility === "public" ||
    visibility === "certificate"
  );
}

function isSaleLikeValueType(valueType: string | null | undefined) {
  const v = String(valueType || "")
    .toLowerCase()
    .trim()
    .replaceAll("_", " ");
  return (
    v === "sale" ||
    v === "auction" ||
    v === "primary sale" ||
    v === "secondary sale"
  );
}

type Props = {
  registryId: string;
};

export function StudioArtworkClient({ registryId }: Props) {
  const router = useRouter();
  const cleanId = registryId.trim();
  const sb = useSupabaseBrowserLazy();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<{ is_admin?: boolean } | null>(null);
  const [artwork, setArtwork] = useState<Record<string, unknown> | null>(null);
  const [artistName, setArtistName] = useState<string>("");
  const [ownershipRows, setOwnershipRows] = useState<Record<string, unknown>[]>(
    []
  );
  const [valueRows, setValueRows] = useState<Record<string, unknown>[]>([]);
  const [cert, setCert] = useState<{
    has_certificate: boolean;
    revoked: boolean;
  } | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    event: RegistrySemanticEvent;
  } | null>(null);
  const refresh = useCallback(async (): Promise<string | null> => {
    const { data: a } = await sb()
      .from("artworks")
      .select("*")
      .eq("registry_id", cleanId)
      .maybeSingle();
    if (!a) {
      setNotFound(true);
      setArtwork(null);
      return null;
    }
    setNotFound(false);
    setArtwork(a as Record<string, unknown>);
    const { data: artist } = await sb()
      .from("artists")
      .select("display_name, full_name")
      .eq("id", a.artist_id)
      .maybeSingle();
    setArtistName(
      artist?.display_name?.trim() ||
        artist?.full_name?.trim() ||
        "Artist"
    );

    const { data: own } = await sb()
      .from("ownership_events")
      .select("*")
      .eq("artwork_id", a.id)
      .order("created_at", { ascending: true });
    setOwnershipRows((own || []) as Record<string, unknown>[]);

    const { data: val } = await sb()
      .from("value_events")
      .select("*")
      .eq("artwork_id", a.id)
      .order("created_at", { ascending: true });
    setValueRows((val || []) as Record<string, unknown>[]);

    const { data: certRows } = await sb().rpc(
      "get_certificate_public_status_single",
      { p_artwork_id: a.id }
    );
    const row = certRows?.[0] as
      | { has_certificate?: boolean; revoked?: boolean }
      | undefined;
    setCert(
      row
        ? {
            has_certificate: Boolean(row.has_certificate),
            revoked: Boolean(row.revoked),
          }
        : { has_certificate: false, revoked: false }
    );

    return String(a.id);
  }, [cleanId, sb]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data: sessionData } = await sb().auth.getSession();
      if (!sessionData?.session) {
        deferredRouterReplace(
          router,
          `/login?next=${encodeURIComponent(studioCollectorArtworkHref(cleanId))}`
        );
        return;
      }
      const uid = sessionData.session.user.id;
      if (cancelled) return;
      setUser({ id: uid });

      const { data: actor } = await sb()
        .from("actor_profiles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();
      if (actor?.role && actor.role !== "collector") {
        deferredRouterReplace(router, "/studio/creative");
        return;
      }

      const { data: adminRow } = await sb()
        .from("artists")
        .select("is_admin")
        .eq("id", uid)
        .maybeSingle();
      setProfile({ is_admin: Boolean(adminRow?.is_admin) });

      const artId = await refresh();
      if (!artId) {
        setLoading(false);
        return;
      }
      const owned = await getCollectorOwnedArtworkIds(sb(), uid);
      setIsOwner(owned.includes(artId));

      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [cleanId, router, refresh, sb]);

  const canonicalOwnerId = useMemo(() => {
    const latest = pickLatestOwnershipEvent(
      ownershipRows as Array<{
        artwork_id?: string | null;
        to_user_id?: string | null;
        created_at?: string | null;
        id?: string | null;
      }>
    );
    return resolveHolderUserIdFromEvent(latest);
  }, [ownershipRows]);

  const saleContext = useMemo(() => {
    if (!artwork?.id) return { unresolved: false as const, sale: null };
    const sales = valueRows.filter((v) =>
      isSaleLikeValueType(String(v.value_type))
    );
    const latestSale = [...sales].sort(
      (a, b) =>
        new Date(String(b.created_at || 0)).getTime() -
        new Date(String(a.created_at || 0)).getTime()
    )[0];
    if (!latestSale) return { unresolved: false as const, sale: null };
    const explicit =
      latestSale.ownership_resolved === true ||
      ownershipRows.some(
        (o) =>
          String((o as { value_event_id?: string }).value_event_id || "") ===
          String(latestSale.id)
      );
    if (explicit) return { unresolved: false as const, sale: null };
    return { unresolved: true as const, sale: latestSale };
  }, [artwork?.id, valueRows, ownershipRows]);

  const publicValues = valueRows.filter((v) =>
    isPublicSurfaceValueVisibility(
      String((v as { visibility_level?: string }).visibility_level || "")
    )
  );

  const latestOwnershipRow = useMemo(
    () =>
      pickLatestOwnershipEvent(
        ownershipRows as Array<{
          artwork_id?: string | null;
          to_user_id?: string | null;
          created_at?: string | null;
          id?: string | null;
          verification_status?: string | null;
        }>
      ),
    [ownershipRows]
  );
  const latestOwnershipStatus = latestOwnershipSystemStatus(
    latestOwnershipRow ?? null
  );
  const ownerBadge = ownershipStatusBadge(latestOwnershipStatus, "light");

  if (loading) {
    return (
      <div className={`${studioV2.scope} ds-page-environment min-h-screen pt-20`}>
        <RouteLoadingShell label="Loading holding…" />
      </div>
    );
  }

  if (notFound || !artwork) {
    return (
      <div className={`${studioV2.scope} ds-page-environment flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center`}>
        <div className={`${studioV2.surface.filingSheet} max-w-md px-8 py-10`}>
          <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
            Archive
          </p>
          <h1 className="v2-type-display mt-3 text-[1.5rem] text-[var(--v2-ink)]">
            Record not found
          </h1>
          <p className="mt-3 text-sm text-[var(--v2-ink-muted)]">
            This holding could not be located on the registry ledger.
          </p>
          <Link
            href="/studio/collector"
            className="v2-cta-secondary mt-8 inline-flex min-h-[44px] items-center px-6 py-2.5 text-xs"
          >
            Return to holdings
          </Link>
        </div>
      </div>
    );
  }

  const title = String(artwork.title || "Untitled");
  const imageUrl =
    typeof artwork.image_url === "string" ? artwork.image_url : null;
  const verificationStatus = String(artwork.verification_status || "");
  const certLabel = cert?.revoked
    ? "Revoked"
    : cert?.has_certificate
      ? "Certificate recorded"
      : "Certificate not recorded";

  return (
    <div className={`${studioV2.scope} ds-page-environment min-h-screen pt-20 pb-16 text-[var(--v2-ink)]`}>
      {toast ? (
        <SemanticToast message={toast.message} event={toast.event} />
      ) : null}

      <main className="mx-auto max-w-4xl px-5 md:px-8">

        {!isOwner ? (
          <div className={`${studioV2.surface.filingSheet} border-l-2 border-[var(--v2-amber-exception)] px-5 py-4 text-sm text-[var(--v2-ink-muted)]`}>
            This work isn’t in your collection as current owner.{" "}
            <Link
              href={fieldRecordHref(cleanId)}
              className="font-medium text-[var(--v2-ink)] underline decoration-[var(--v2-border-strong)] underline-offset-4"
            >
              View the public registry record
            </Link>
            .
          </div>
        ) : null}

        <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-start">
          <div className={`${studioV2.surface.filingSheetMajor} overflow-hidden`}>
            <div className="aspect-[4/3] bg-[var(--v2-paper-sunk,#efe9df)]">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center v2-type-mono text-[10px] uppercase tracking-[0.14em] text-[var(--v2-ink-muted)]">
                  No image on file
                </div>
              )}
            </div>
            <div className="space-y-3 px-5 py-5">
              <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                Holding
              </p>
              <h1 className="v2-type-display text-[1.75rem] leading-[1.08] text-[var(--v2-ink)] md:text-[2rem]">
                {title}
              </h1>
              <p className="text-sm text-[var(--v2-ink-muted)]">{artistName}</p>
              <p className="v2-type-mono text-[11px] tracking-[0.08em] text-[var(--v2-cool-grey)]">{cleanId}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <ArtworkTrustBadge verificationStatus={verificationStatus} />
                <span className="v2-type-mono rounded-md border border-[var(--v2-border)] bg-white/80 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-[var(--v2-ink-muted)]">
                  {certLabel}
                </span>
                <span className={`v2-type-mono rounded-md border border-[var(--v2-border)] bg-white/80 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.1em] ${ownerBadge.className}`}>
                  Ownership · {ownerBadge.label}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className={`${studioV2.surface.filingSheet} px-5 py-5`}>
              <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                Actions
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {isOwner && saleContext.unresolved && saleContext.sale ? (
                  <button
                    type="button"
                    onClick={() => setSaleModalOpen(true)}
                    className="v2-cta-primary min-h-[44px] px-4 py-3 text-xs"
                  >
                    Record sale transfer
                  </button>
                ) : null}
                <Link
                  href={fieldRecordHref(cleanId)}
                  className="v2-cta-secondary inline-flex min-h-[44px] items-center justify-center px-4 py-3 text-xs"
                >
                  Open public registry record
                </Link>
                {String(artwork.verification_status) === "verified" ? (
                  <Link
                    href={`/certificate/${encodeURIComponent(cleanId)}`}
                    className="v2-cta-secondary inline-flex min-h-[44px] items-center justify-center px-4 py-3 text-xs"
                  >
                    Certificate (sign-in required)
                  </Link>
                ) : (
                  <p className="text-xs leading-relaxed text-[var(--v2-ink-muted)]">
                    Certificates are available once the work is verified.
                  </p>
                )}
              </div>
            </div>

            {latestOwnershipRow && isOwner ? (
              <div className={`${studioV2.surface.filingSheet} px-4 py-4`}>
                <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                  Verification
                </p>
                <div className="group mt-3">
                  <OwnershipVerificationControls
                    eventId={String((latestOwnershipRow as { id?: string }).id)}
                    isLatest
                    verificationStatus={(latestOwnershipRow as { verification_status?: unknown }).verification_status}
                    hasSession={Boolean(user)}
                    userIsAdmin={Boolean(profile?.is_admin)}
                    loginNextPath={studioCollectorArtworkHref(cleanId)}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <section className="mt-14 space-y-4">
          <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
            Provenance
          </p>
          <h2 className="v2-type-display text-[1.35rem] text-[var(--v2-ink)]">
            Provenance timeline
          </h2>
          <div className="space-y-3">
            {ownershipRows.map((ev, idx) => {
              const b = ownershipStatusBadge(
                latestOwnershipSystemStatus(ev),
                "light"
              );
              return (
                <div
                  key={String(ev.id ?? idx)}
                  className={`${studioV2.surface.filingSheet} ${semanticAccentBorderClass("transfer")} px-4 py-3 text-sm`}
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-medium text-[var(--v2-ink)]">
                      {formatOwnershipOwnerPrimary(ev, {
                        viewerUserId: user?.id,
                        artworkArtistId: String(artwork.artist_id || ""),
                        artistDisplayName: artistName,
                      })}
                    </span>
                    <span className={b.className}>{b.label}</span>
                  </div>
                  <p className="mt-1 v2-type-mono text-[11px] text-[var(--v2-ink-muted)]">
                    {String((ev as { transfer_type?: string }).transfer_type || "").replaceAll("_", " ")} ·{" "}
                    {ev.created_at
                      ? new Date(String(ev.created_at)).toLocaleString()
                      : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <InfoTooltip text="Transaction infrastructure expanding soon" />
          <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
            Valuation
          </p>
          <h2 className="v2-type-display text-[1.35rem] text-[var(--v2-ink)]">
            Value history
          </h2>
          {publicValues.length === 0 ? (
            <p className="text-sm text-[var(--v2-ink-muted)]">
              No public or certificate-visible value events.
            </p>
          ) : (
            <ul className="relative space-y-2 pl-4">
              <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-px bg-[var(--v2-border-strong)]" />
              {publicValues.map((v) => (
                <li
                  key={String(v.id)}
                  className={`${studioV2.surface.filingSheet} relative px-4 py-3 text-sm`}
                >
                  <span
                    className={`absolute -left-[5px] top-4 h-2 w-2 rounded-full border border-white ${semanticDotClass("valuation")}`}
                    aria-hidden
                  />
                  <span className="text-[var(--v2-ink)]">
                    {formatValueEventLabel(String(v.value_type || ""))}
                    {v.declared_value != null && v.declared_value !== ""
                      ? ` · ${new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: String(v.currency || "USD"),
                          maximumFractionDigits: 0,
                        }).format(Number(v.declared_value))}`
                      : ""}
                  </span>
                  <span className="ml-2 v2-type-mono text-[11px] text-[var(--v2-ink-muted)]">
                    {v.created_at
                      ? new Date(String(v.created_at)).toLocaleDateString()
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {isOwner &&
      user &&
      saleContext.unresolved &&
      saleContext.sale &&
      artwork.id ? (
        <StudioSaleTransferModal
          isOpen={saleModalOpen}
          onClose={() => setSaleModalOpen(false)}
          artworkId={String(artwork.id)}
          userId={user.id}
          sellerId={
            canonicalOwnerId ||
            String(artwork.artist_id || "") ||
            user.id
          }
          saleEvent={{
            id: String(saleContext.sale.id),
            declared_value: saleContext.sale.declared_value as number | null,
            currency: saleContext.sale.currency as string | null,
            created_at: saleContext.sale.created_at as string | null,
            value_type: saleContext.sale.value_type as string | null,
          }}
          onSuccess={async () => {
            await refresh();
            deferredRouterRefresh(router);
          }}
          onToast={(kind, message) => {
            if (kind === "success") {
              triggerConsequenceFeedback("custodyCommit");
            }
            setToast({
              message,
              event: kind === "success" ? "transfer" : "correction",
            });
            setTimeout(() => setToast(null), 3200);
          }}
        />
      ) : null}
    </div>
  );
}
