"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deferredRouterPush } from "@/lib/deferred-app-router";

export default function InternalVerify() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session) {
        deferredRouterPush(
          router,
          "/login?next=" + encodeURIComponent("/internal/verify")
        );
        return;
      }

      const currentUser = sessionData.session.user;
      setUser(currentUser);
      setAccessToken(sessionData.session.access_token ?? null);

      const { data: profileData } = await supabase
        .from("artists")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (!profileData?.is_admin) {
        deferredRouterPush(router, "/studio");
        return;
      }

      setProfile(profileData);

      const { data: unverified } = await supabase
        .from("artworks")
        .select("*")
        .eq("verification_status", "unverified")
        .order("created_at", { ascending: false });

      setArtworks(unverified || []);
    };

    init();
  }, [router]);

  const approveArtwork = async (artwork: any) => {
    if (!user) return;

    // 1. Generate verification hash
    const canonicalString = [
      artwork.title,
      artwork.artist_id,
      artwork.registry_id,
      artwork.created_at,
    ].join("|");

    const encoder = new TextEncoder();
    const data = encoder.encode(canonicalString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // 2. Update artwork
    const { error: updateError } = await supabase
      .from("artworks")
      .update({
        verification_status: "verified",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        verification_hash: hashHex,
      })
      .eq("id", artwork.id);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    const artistId = artwork.artist_id as string | null | undefined;
    if (artistId) {
      const title = artwork.title ?? "Artwork";
      const reg = artwork.registry_id ? ` (${artwork.registry_id})` : "";
      const logRes = await fetch("/api/admin/log-artist-activity", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          artist_user_id: artistId,
          type: "artwork_verified",
          message: `Artwork verified — ${title}${reg}`,
          artwork_id: artwork.id,
          metadata: {
            registry_id: artwork.registry_id ?? null,
            approved_by: user.id,
          },
        }),
      });
      if (!logRes.ok) {
        const errBody = await logRes.json().catch(() => ({}));
        console.error("log artist activity failed:", logRes.status, errBody);
      }
    }

    // Certificate row is created by DB trigger when status becomes verified; this
    // call is idempotent backup (e.g. legacy DB without trigger).
const response = await fetch("/api/issue-certificate", {
  method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artwork_id: artwork.id }),
    });
    let certificateCreated = false;
    if (response.ok) {
      const body = await response.json().catch(() => ({}));
      certificateCreated = Boolean(body.created);
    } else {
      const errBody = await response.json().catch(() => ({}));
      console.error("issue-certificate backup failed:", response.status, errBody);
      // Certificate may already exist from DB trigger; verification is still valid.
    }

    if (certificateCreated && artistId) {
      const title = artwork.title ?? "Artwork";
      const reg = artwork.registry_id ? ` (${artwork.registry_id})` : "";
      const certLog = await fetch("/api/admin/log-artist-activity", {
        method: "POST",
        credentials: "include",
  headers: {
    "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          artist_user_id: artistId,
          type: "certificate_issued",
          message: `Certificate issued — ${title}${reg}`,
          artwork_id: artwork.id,
          metadata: { registry_id: artwork.registry_id ?? null },
        }),
      });
      if (!certLog.ok) {
        const errBody = await certLog.json().catch(() => ({}));
        console.error("log certificate activity failed:", certLog.status, errBody);
      }
    }

    // Remove from UI
    setArtworks((prev) => prev.filter((a) => a.id !== artwork.id));
  };

  if (!user || !profile) {
    return (
      <div className="ds-page-environment flex min-h-screen items-center justify-center">
        <p className="text-sm leading-relaxed text-neutral-500">Loading...</p>
      </div>
    );
  }

  if (!profile.is_admin) {
    return null;
  }

  return (
    <div className="ds-page-environment min-h-screen p-8 py-24">
      <div className="mx-auto max-w-4xl space-y-14">
        <div>
          <p className="text-xs font-medium text-neutral-500">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-900">
        Pending Verifications
      </h1>
        </div>

      {artworks.length === 0 && (
          <p className="text-sm leading-relaxed text-neutral-500">
            No pending works.
          </p>
      )}

        <div className="space-y-8">
        {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="rrowm-surface rrowm-surface-interactive p-8 md:p-10"
            >
              <p className="text-xl font-medium text-neutral-900">
              {artwork.title}
            </p>
              <p className="mt-2 text-sm text-neutral-500">
              {artwork.registry_id || "Pending Registry ID"}
            </p>
            <button
              onClick={() => approveArtwork(artwork)}
                className="mt-6 rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition duration-200 ease-out hover:-translate-y-px hover:bg-neutral-900"
            >
              Approve
            </button>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
