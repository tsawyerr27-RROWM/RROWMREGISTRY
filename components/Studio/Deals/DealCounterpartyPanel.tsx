"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { DEAL_PARTICIPANT_FALLBACK } from "@/lib/deal-participant-labels";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { rrowmDealSurface } from "@/styles/rrowm-theme";

type CounterpartyRole = "artist" | "collector" | "gallery" | "unknown";

type CounterpartyProfile =
  | {
      role: "artist";
      displayName: string;
      slug: string | null;
      verificationStatus: string | null;
      representedBy: { name: string; verified: boolean } | null;
      verifiedWorkCount: number | null;
    }
  | {
      role: "collector";
      displayName: string;
      slug: string | null;
      location: string | null;
      isPublic: boolean | null;
    }
  | {
      role: "gallery";
      displayName: string;
      slug: string | null;
      verified: boolean;
      location: string | null;
      subscriptionStatus: string | null;
    }
  | {
      role: "unknown";
      displayName: string;
    };

type Props = {
  counterpartyUserId: string | null;
};

function fallbackName(): string {
  return DEAL_PARTICIPANT_FALLBACK;
}

function isVerifiedStatus(status: string | null | undefined): boolean {
  return String(status ?? "").toLowerCase().trim() === "verified";
}

export function DealCounterpartyPanel({ counterpartyUserId }: Props) {
  const [loading, setLoading] = useState(Boolean(counterpartyUserId));
  const [profile, setProfile] = useState<CounterpartyProfile | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const uid = String(counterpartyUserId ?? "").trim();
      if (!uid) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const supabase = getSupabaseBrowserClient();

      const { data: actor } = await supabase
        .from("actor_profiles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();

      const roleRaw = String((actor as { role?: string } | null)?.role ?? "")
        .toLowerCase()
        .trim();
      const role: CounterpartyRole =
        roleRaw === "artist" || roleRaw === "collector" || roleRaw === "gallery"
          ? (roleRaw as CounterpartyRole)
          : "unknown";

      if (cancelled) return;

      if (role === "artist") {
        const { data: a } = await supabase
          .from("artists")
          .select(
            "id, display_name, full_name, slug, verification_status, gallery_id, galleries(name, verified)"
          )
          .eq("id", uid)
          .maybeSingle();

        const galleryRaw = Array.isArray((a as any)?.galleries)
          ? (a as any).galleries[0]
          : (a as any)?.galleries;

        let verifiedWorkCount: number | null = null;
        try {
          const { count } = await supabase
            .from("artworks")
            .select("id", { count: "exact", head: true })
            .eq("artist_id", uid)
            .eq("verification_status", "verified");
          verifiedWorkCount = typeof count === "number" ? count : null;
        } catch {
          verifiedWorkCount = null;
        }

        const displayName =
          String((a as any)?.display_name ?? "").trim() ||
          String((a as any)?.full_name ?? "").trim() ||
          fallbackName();

        const representedBy =
          galleryRaw?.name != null
            ? {
                name: String(galleryRaw.name).trim(),
                verified: Boolean(galleryRaw.verified),
              }
            : null;

        if (!cancelled) {
          setProfile({
            role: "artist",
            displayName,
            slug: (a as any)?.slug ? String((a as any).slug) : null,
            verificationStatus:
              (a as any)?.verification_status != null
                ? String((a as any).verification_status)
                : null,
            representedBy,
            verifiedWorkCount,
          });
        }
        setLoading(false);
        return;
      }

      if (role === "collector") {
        const { data: c } = await supabase
          .from("collector_profiles")
          .select("user_id, display_name, slug, location, is_public")
          .eq("user_id", uid)
          .maybeSingle();

        const displayName =
          String((c as any)?.display_name ?? "").trim() || fallbackName();

        if (!cancelled) {
          setProfile({
            role: "collector",
            displayName,
            slug: (c as any)?.slug ? String((c as any).slug) : null,
            location:
              (c as any)?.location != null ? String((c as any).location) : null,
            isPublic:
              (c as any)?.is_public != null ? Boolean((c as any).is_public) : null,
          });
        }
        setLoading(false);
        return;
      }

      if (role === "gallery") {
        const { data: mem } = await supabase
          .from("gallery_users")
          .select(
            "role, galleries(id, name, slug, verified, location, subscription_status)"
          )
          .eq("user_id", uid)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        const gRaw = Array.isArray((mem as any)?.galleries)
          ? (mem as any).galleries[0]
          : (mem as any)?.galleries;

        const displayName = String(gRaw?.name ?? "").trim() || fallbackName();

        if (!cancelled) {
          setProfile({
            role: "gallery",
            displayName,
            slug: gRaw?.slug ? String(gRaw.slug) : null,
            verified: Boolean(gRaw?.verified),
            location: gRaw?.location ? String(gRaw.location) : null,
            subscriptionStatus: gRaw?.subscription_status
              ? String(gRaw.subscription_status)
              : null,
          });
        }
        setLoading(false);
        return;
      }

      if (!cancelled) {
        setProfile({ role: "unknown", displayName: fallbackName() });
        setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [counterpartyUserId]);

  const pills = useMemo(() => {
    if (!profile) return [];

    if (profile.role === "gallery") {
      const out: { label: string; tone?: Parameters<typeof Badge>[0]["tone"] }[] =
        [];
      out.push({ label: profile.verified ? "Verified institution" : "Institution" });
      if (profile.subscriptionStatus) out.push({ label: profile.subscriptionStatus });
      return out;
    }

    if (profile.role === "artist") {
      const out: { label: string; tone?: Parameters<typeof Badge>[0]["tone"] }[] =
        [];
      out.push({ label: isVerifiedStatus(profile.verificationStatus) ? "Verified" : "Artist" });
      if (profile.verifiedWorkCount != null) {
        out.push({ label: `${profile.verifiedWorkCount} verified works` });
      }
      if (profile.representedBy?.verified) out.push({ label: "Represented by verified institution" });
      return out;
    }

    if (profile.role === "collector") {
      const out: { label: string; tone?: Parameters<typeof Badge>[0]["tone"] }[] =
        [];
      out.push({ label: "Collector" });
      if (profile.isPublic) out.push({ label: "Public profile" });
      return out;
    }

    return [{ label: "Participant" }];
  }, [profile]);

  if (!counterpartyUserId) {
    return null;
  }

  return (
    <div className={rrowmDealSurface.sidePanel}>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
        Counterparty
      </p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-serif text-[17px] font-normal tracking-tight text-neutral-950">
            {loading ? "Loading counterparty" : profile?.displayName ?? "Counterparty"}
          </p>
          {profile?.role === "gallery" && profile.location ? (
            <p className="mt-1 text-[13px] text-neutral-500">{profile.location}</p>
          ) : null}
          {profile?.role === "collector" && profile.location ? (
            <p className="mt-1 text-[13px] text-neutral-500">{profile.location}</p>
          ) : null}
          {profile?.role === "artist" && profile.representedBy?.name ? (
            <p className="mt-1 text-[13px] text-neutral-500">
              {profile.representedBy.name}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {pills.map((p) => (
            <Badge key={p.label} tone={p.tone ?? "muted"} className="normal-case">
              {p.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
