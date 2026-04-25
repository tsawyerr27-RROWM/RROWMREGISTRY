import type { SupabaseClient } from "@supabase/supabase-js";
import { formatValueEventLabel, formatOwnershipTransferTypeLabel } from "@/lib/format-registry-labels";
import { formatOwnershipParty, normalizeVerificationStatus } from "@/lib/ownership-ledger";

export type ProvenanceTimelineEvent =
  | {
      type: "creation";
      date: string;
      title: string;
      subtitle?: string | null;
      tone: "neutral";
    }
  | {
      type: "verification";
      date: string;
      title: string;
      subtitle?: string | null;
      tone: "verification";
      source: "artist" | "gallery" | "certificate" | "system";
      source_name?: string | null;
    }
  | {
      type: "certificate";
      date: string;
      title: string;
      subtitle?: string | null;
      tone: "certificate";
    }
  | {
      type: "ownership";
      date: string;
      title: string;
      subtitle?: string | null;
      tone: "neutral";
      status: "recorded" | "claimed" | "verified";
    }
  | {
      type: "value";
      date: string;
      title: string;
      subtitle?: string | null;
      tone: "value";
    };

function safeDate(d: unknown, fallback: string): string {
  const s = typeof d === "string" ? d : "";
  if (s && !Number.isNaN(new Date(s).getTime())) return s;
  return fallback;
}

function currencyLabel(value: number, currency: string | null | undefined): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} ${currency || ""}`.trim();
  }
}

export async function getProvenanceTimeline(args: {
  supabase: SupabaseClient;
  artwork: {
    id: string;
    registry_id: string | null;
    title: string | null;
    artist_id: string | null;
    created_at: string;
  };
  artistName?: string | null;
}): Promise<ProvenanceTimelineEvent[]> {
  const { supabase, artwork, artistName } = args;

  const createdAt = safeDate(artwork.created_at, new Date().toISOString());
  const out: ProvenanceTimelineEvent[] = [
    {
      type: "creation",
      date: createdAt,
      title: "Record created",
      subtitle: artistName?.trim() ? `Attributed to ${artistName.trim()}` : "Attributed to artist",
      tone: "neutral",
    },
  ];

  const [{ data: vRows }, { data: cert }, { data: ownRows }, { data: valRows }] =
    await Promise.all([
      supabase
        .from("verification_events")
        .select("*")
        .eq("artwork_id", artwork.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("certificates")
        .select("issued_at, revoked, revoked_reason")
        .eq("artwork_id", artwork.id)
        .order("issued_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("ownership_events")
        .select("*")
        .eq("artwork_id", artwork.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("value_events")
        .select("declared_value, currency, value_type, created_at, visibility_level")
        .eq("artwork_id", artwork.id)
        .order("created_at", { ascending: true }),
    ]);

  // Verification events (multi-source), subtle and non-badged
  for (const r of (vRows || []) as any[]) {
    const source = String(r.source || r.verification_method || "system")
      .toLowerCase()
      .trim();
    const status = String(r.status || "").toLowerCase().trim();
    if (status && status !== "confirmed") continue;

    let src: "artist" | "gallery" | "certificate" | "system" = "system";
    if (source === "artist" || source === "gallery" || source === "certificate" || source === "system") {
      src = source;
    }

    let sourceName: string | null = null;
    if (src === "gallery") {
      const gid = (r.source_id || r.verified_by_gallery_id) as string | null | undefined;
      if (gid) {
        const { data: g } = await supabase
          .from("galleries")
          .select("name")
          .eq("id", gid)
          .maybeSingle();
        sourceName = g?.name?.trim() || null;
      }
    }

    const date = safeDate(r.created_at, createdAt);
    out.push({
      type: "verification",
      date,
      source: src,
      source_name: sourceName,
      title:
        src === "gallery"
          ? `Verified by ${sourceName || "Gallery"}`
          : src === "artist"
            ? "Artist confirmation recorded"
            : src === "certificate"
              ? "Certificate verification recorded"
              : "Verification recorded",
      subtitle: null,
      tone: "verification",
    });
  }

  // Certificate issuance (distinct moment)
  if (cert?.issued_at && !cert.revoked) {
    out.push({
      type: "certificate",
      date: safeDate(cert.issued_at, createdAt),
      title: "Certificate issued",
      subtitle: null,
      tone: "certificate",
    });
  }

  // Ownership ledger
  for (const ev of (ownRows || []) as Record<string, unknown>[]) {
    const date = safeDate((ev as any).created_at, createdAt);
    const transferType = String((ev as any).transfer_type || "transfer");
    const from = formatOwnershipParty(ev as any, "from");
    const to = formatOwnershipParty(ev as any, "to");
    const st = normalizeVerificationStatus((ev as any).verification_status);
    out.push({
      type: "ownership",
      date,
      title: formatOwnershipTransferTypeLabel(transferType),
      subtitle: `Transferred from ${from} to ${to}`,
      tone: "neutral",
      status: st,
    });
  }

  // Value events (muted amber)
  for (const v of (valRows || []) as any[]) {
    const value = v.declared_value;
    if (value == null || value === "" || Number.isNaN(Number(value))) continue;
    const date = safeDate(v.created_at, createdAt);
    const label = formatValueEventLabel(String(v.value_type || ""));
    const amount = currencyLabel(Number(value), String(v.currency || "USD"));
    out.push({
      type: "value",
      date,
      title: `${label} — ${amount}`,
      subtitle: null,
      tone: "value",
    });
  }

  out.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return out;
}

