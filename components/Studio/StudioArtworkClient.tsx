"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deferredRouterRefresh,
  deferredRouterReplace,
} from "@/lib/deferred-app-router";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { PageNav } from "@/components/ui/PageNav";
import { OwnershipVerificationControls } from "@/components/Registry/OwnershipVerificationControls";
import { StudioSaleTransferModal } from "@/components/Studio/StudioSaleTransferModal";
import {
  formatOwnershipOwnerPrimary,
  latestOwnershipSystemStatus,
  ownershipStatusBadge,
} from "@/lib/ownership-ledger";
import { formatValueEventLabel } from "@/lib/format-registry-labels";
import { resolveArtworkOwnerId } from "@/lib/resolve-artwork-owner-id";
import { getCollectorOwnedArtworkIds } from "@/lib/collector-portfolio";

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
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

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
  const [toast, setToast] = useState<string | null>(null);
  const refresh = useCallback(async (): Promise<string | null> => {
    const { data: a } = await supabase
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
    const { data: artist } = await supabase
      .from("artists")
      .select("display_name, full_name")
      .eq("id", a.artist_id)
      .maybeSingle();
    setArtistName(
      artist?.display_name?.trim() ||
        artist?.full_name?.trim() ||
        "Artist"
    );

    const { data: own } = await supabase
      .from("ownership_events")
      .select("*")
      .eq("artwork_id", a.id)
      .order("created_at", { ascending: true });
    setOwnershipRows((own || []) as Record<string, unknown>[]);

    const { data: val } = await supabase
      .from("value_events")
      .select("*")
      .eq("artwork_id", a.id)
      .order("created_at", { ascending: true });
    setValueRows((val || []) as Record<string, unknown>[]);

    const { data: certRows } = await supabase.rpc(
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
  }, [cleanId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        deferredRouterReplace(
          router,
          `/login?next=${encodeURIComponent(`/collector-studio/artwork/${encodeURIComponent(cleanId)}`)}`
        );
        return;
      }
      const uid = sessionData.session.user.id;
      if (cancelled) return;
      setUser({ id: uid });

      const { data: actor } = await supabase
        .from("actor_profiles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();
      if (actor?.role && actor.role !== "collector") {
        deferredRouterReplace(router, "/studio");
        return;
      }

      const { data: adminRow } = await supabase
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
      const owned = await getCollectorOwnedArtworkIds(supabase, uid);
      setIsOwner(owned.includes(artId));

      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [cleanId, router, refresh]);

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

  const latest = ownershipRows[ownershipRows.length - 1];
  const latestOwnershipStatus = latestOwnershipSystemStatus(latest ?? null);
  const ownerBadge = ownershipStatusBadge(latestOwnershipStatus, "light");

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-neutral-500">
        Loading…
      </div>
    );
  }

  if (notFound || !artwork) {
    return (
      <div className="min-h-screen rrowm-bg-page pt-24 text-center">
        <p className="text-neutral-600">Record not found.</p>
        <Link href="/collector-studio" className="mt-4 inline-block text-sm underline">
          Back to collection
        </Link>
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
    <div className="min-h-screen rrowm-bg-page pt-20 pb-16 text-neutral-900">
      {toast ? (
        <div className="fixed right-6 top-24 z-[120] rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-sm text-neutral-800 shadow-lg">
          {toast}
        </div>
      ) : null}

      <main className="mx-auto max-w-4xl px-5 md:px-8">
        <PageNav
          backHref="/collector-studio"
          crumbs={[
            { label: "Collector studio", href: "/collector-studio" },
            { label: title },
          ]}
        />

        {!isOwner ? (
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm text-amber-950">
            This work isn’t in your collection as current owner.{" "}
            <Link
              href={`/registry/${encodeURIComponent(cleanId)}`}
              className="font-medium underline decoration-amber-400 underline-offset-4"
            >
              View the public registry record
            </Link>
            .
          </div>
        ) : null}

        <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-start">
          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="aspect-[4/3] bg-neutral-100">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                  No image
                </div>
              )}
            </div>
            <div className="space-y-3 px-5 py-5">
              <h1 className="font-serif text-3xl font-normal leading-tight tracking-tight text-neutral-950 md:text-4xl">
                {title}
              </h1>
              <p className="text-sm text-neutral-600">{artistName}</p>
              <p className="font-mono text-[11px] text-neutral-400">{cleanId}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span
                  className={
                    verificationStatus === "verified"
                      ? "rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200/80"
                      : "rounded-full bg-neutral-100 px-2.5 py-0.5 text-sm font-medium text-neutral-600 ring-1 ring-black/[0.06]"
                  }
                >
                  {verificationStatus === "verified"
                    ? "Verified"
                    : "Verification not recorded"}
                </span>
                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-medium text-neutral-600 ring-1 ring-black/[0.06]">
                  {certLabel}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${ownerBadge.className}`}>
                  Ownership · {ownerBadge.label}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-black/[0.06] bg-white/60 px-5 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h2 className="text-base font-semibold text-neutral-900">
                Actions
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {isOwner && saleContext.unresolved && saleContext.sale ? (
                  <button
                    type="button"
                    onClick={() => setSaleModalOpen(true)}
                    className="rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Record sale transfer
                  </button>
                ) : null}
                <Link
                  href={`/registry/${encodeURIComponent(cleanId)}`}
                  className="rounded-2xl border border-black/[0.08] bg-white/80 px-4 py-3 text-center text-sm font-medium text-neutral-800 transition hover:bg-white"
                >
                  Open public registry record
                </Link>
                {String(artwork.verification_status) === "verified" ? (
                  <Link
                    href={`/certificate/${encodeURIComponent(cleanId)}`}
                    className="rounded-2xl border border-black/[0.08] bg-white/80 px-4 py-3 text-center text-sm font-medium text-neutral-800 transition hover:bg-white"
                  >
                    Certificate (sign-in required)
                  </Link>
                ) : (
                  <p className="text-xs leading-relaxed text-neutral-500">
                    Certificates are available once the work is verified.
                  </p>
                )}
              </div>
            </div>

            {latest && isOwner ? (
              <div className="rounded-2xl border border-black/[0.06] bg-white/60 px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h2 className="text-base font-semibold text-neutral-900">
                  Verification
                </h2>
                <div className="group mt-3">
                  <OwnershipVerificationControls
                    eventId={String((latest as { id?: string }).id)}
                    isLatest
                    verificationStatus={(latest as { verification_status?: unknown }).verification_status}
                    hasSession={Boolean(user)}
                    userIsAdmin={Boolean(profile?.is_admin)}
                    loginNextPath={`/collector-studio/artwork/${encodeURIComponent(cleanId)}`}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <section className="mt-14 space-y-4">
          <h2 className="font-serif text-xl font-normal text-neutral-950">
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
                  className="rounded-2xl border border-black/[0.06] bg-white/60 px-4 py-3 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-medium text-neutral-900">
                      {formatOwnershipOwnerPrimary(ev, {
                        viewerUserId: user?.id,
                        artworkArtistId: String(artwork.artist_id || ""),
                        artistDisplayName: artistName,
                      })}
                    </span>
                    <span className={b.className}>{b.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
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
          <h2 className="font-serif text-xl font-normal text-neutral-950">
            Value history
          </h2>
          {publicValues.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No public or certificate-visible value events.
            </p>
          ) : (
            <ul className="space-y-2">
              {publicValues.map((v) => (
                <li
                  key={String(v.id)}
                  className="rounded-2xl border border-black/[0.06] bg-white/60 px-4 py-3 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                >
                  <span className="text-neutral-800">
                    {formatValueEventLabel(String(v.value_type || ""))}
                    {v.declared_value != null && v.declared_value !== ""
                      ? ` · ${new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: String(v.currency || "USD"),
                          maximumFractionDigits: 0,
                        }).format(Number(v.declared_value))}`
                      : ""}
                  </span>
                  <span className="ml-2 text-xs text-neutral-400">
                    {v.created_at
                      ? new Date(String(v.created_at)).toLocaleDateString()
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs leading-relaxed text-neutral-500">
            Transaction infrastructure expanding soon
          </p>
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
            resolveArtworkOwnerId(artwork) ||
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
            setToast(message);
            setTimeout(() => setToast(null), 3200);
            if (kind === "error") {
              /* keep */
            }
          }}
        />
      ) : null}
    </div>
  );
}
