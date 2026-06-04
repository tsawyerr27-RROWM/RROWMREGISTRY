"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AccountPageContent } from "@/components/account/AccountPageContent";
import { normalizeOptionalWebsite } from "@/components/account/account-ui";
import type {
  AccountHeroPreviewArtwork,
  AccountProfileSnapshot,
} from "@/components/account/AccountPresenceHero";
import { ArtistWorkspaceShellLayout } from "@/components/Studio/ArtistWorkspaceShellLayout";
import { CollectorWorkspaceShellLayout } from "@/components/Studio/CollectorWorkspaceShellLayout";
import { GalleryWorkspaceShellLayout } from "@/components/Studio/GalleryWorkspaceShellLayout";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { getCollectorOwnedArtworkIds } from "@/lib/collector-portfolio";
import {
  DEFAULT_PUBLIC_PRESENCE,
  parsePublicPresence,
  toPublicPresenceJson,
  type PublicPresence,
} from "@/lib/public-presence";
import { parseArtistRepresentationState } from "@/lib/artwork-representation";
import {
  parseStudioArtworksAccent,
  type StudioArtworksAccentId,
} from "@/lib/studio-artworks-accent";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { productWorkspaceLabel } from "@/lib/studio-terminology";

type Role = "artist" | "collector" | "gallery";

export default function AccountPage() {
  const { t } = useLocalePreferences();
  const sb = useSupabaseBrowserLazy();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [presence, setPresence] = useState<PublicPresence>({
    ...DEFAULT_PUBLIC_PRESENCE,
  });
  const [artistBio, setArtistBio] = useState("");
  const [artistWebsite, setArtistWebsite] = useState("");
  const [artistInstagram, setArtistInstagram] = useState("");
  const [collectorLocation, setCollectorLocation] = useState("");
  const [collectorBio, setCollectorBio] = useState("");
  const [collectorAnonymous, setCollectorAnonymous] = useState(false);
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const [gallerySlug, setGallerySlug] = useState<string | null>(null);
  const [galleryLocation, setGalleryLocation] = useState("");
  const [galleryWebsite, setGalleryWebsite] = useState("");
  const [galleryDescription, setGalleryDescription] = useState("");
  const [artistSlug, setArtistSlug] = useState<string | null>(null);
  const [studioArtworksAccent, setStudioArtworksAccent] =
    useState<StudioArtworksAccentId>("violet");
  const [collectorSlug, setCollectorSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [collectorPreviewArtworks, setCollectorPreviewArtworks] = useState<
    AccountHeroPreviewArtwork[]
  >([]);
  const [artistRepHistorical, setArtistRepHistorical] = useState(false);
  const [accountStatus, setAccountStatus] = useState<
    "active" | "deactivated" | "pending_deletion" | "deleted"
  >("active");
  const [deletionScheduledAt, setDeletionScheduledAt] = useState<string | null>(null);
  const [authProvider, setAuthProvider] = useState("email");

  const refreshAccountStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/account/status", { credentials: "include" });
      if (!res.ok) return;
      const j = (await res.json()) as {
        accountStatus?: typeof accountStatus;
        deletionScheduledAt?: string | null;
        authProvider?: string;
      };
      if (j.accountStatus) setAccountStatus(j.accountStatus);
      setDeletionScheduledAt(j.deletionScheduledAt ?? null);
      if (j.authProvider) setAuthProvider(j.authProvider);
    } catch {
      /* ignore */
    }
  }, []);

  const load = useCallback(async () => {
    setError(null);
    const supabase = sb();
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id;
    if (!uid) return;

    setUserId(uid);
    setEmail(sessionData?.session?.user?.email ?? null);

    await supabase.auth.refreshSession();

    const { data: actor, error: actorErr } = await supabase
      .from("actor_profiles")
      .select("role, display_name, public_presence")
      .eq("user_id", uid)
      .maybeSingle();
    if (actorErr || !actor?.role) {
      setError(summarizeRpcError(actorErr) || "Could not load account.");
      setLoading(false);
      return;
    }

    const r = actor.role as Role;
    if (r !== "artist" && r !== "collector" && r !== "gallery") {
      setError("Unsupported role.");
      setLoading(false);
      return;
    }

    setRole(r);
    setCollectorPreviewArtworks([]);
    setArtistRepHistorical(false);
    setDisplayName(
      String((actor as { display_name?: string | null }).display_name || "").trim()
    );
    let nextPresence = parsePublicPresence(
      (actor as { public_presence?: unknown }).public_presence
    );

    if (r === "artist") {
      const { data: ar } = await supabase
        .from("artists")
        .select(
          "display_name, bio, website, instagram, slug, public_presence, studio_artworks_accent"
        )
        .eq("id", uid)
        .maybeSingle();
      if (ar) {
        setDisplayName(
          String(ar.display_name || (actor as { display_name?: string }).display_name || "").trim()
        );
        setArtistBio(String(ar.bio || "").trim());
        setArtistWebsite(String(ar.website || "").trim());
        setArtistInstagram(String(ar.instagram || "").trim());
        setArtistSlug(ar.slug ? String(ar.slug) : null);
        setStudioArtworksAccent(
          parseStudioArtworksAccent(
            (ar as { studio_artworks_accent?: unknown }).studio_artworks_accent
          )
        );
        nextPresence = parsePublicPresence(
          (ar as { public_presence?: unknown }).public_presence
        );
      }

      const { data: repRaw } = await supabase.rpc(
        "get_artist_representation_state",
        { p_artist_id: uid }
      );
      const rep = parseArtistRepresentationState(repRaw);
      setArtistRepHistorical(rep.historical && !rep.active);
    }

    if (r === "collector") {
      const { data: cp } = await supabase
        .from("collector_profiles")
        .select(
          "display_name, location, bio, is_public, anonymous_on_public, slug, public_presence"
        )
        .eq("user_id", uid)
        .maybeSingle();
      if (cp) {
        setDisplayName(String(cp.display_name || "").trim());
        setCollectorLocation(String(cp.location || "").trim());
        setCollectorBio(String(cp.bio || "").trim());
        setCollectorAnonymous(Boolean(cp.anonymous_on_public));
        setCollectorSlug(cp.slug ? String(cp.slug) : null);
        nextPresence = {
          ...parsePublicPresence(
            (cp as { public_presence?: unknown }).public_presence
          ),
          profile: Boolean(cp.is_public),
        };
      }

      const ownedIds = await getCollectorOwnedArtworkIds(supabase, uid);
      if (ownedIds.length > 0) {
        const { data: aw } = await supabase
          .from("artwork_read_model")
          .select("id, title, registry_id, image_url")
          .in("id", ownedIds)
          .limit(48);
        setCollectorPreviewArtworks((aw || []) as AccountHeroPreviewArtwork[]);
      }
    }

    if (r === "gallery") {
      const { data: mem } = await supabase
        .from("gallery_users")
        .select(
          `
          gallery_id,
          galleries (
            id,
            slug,
            location,
            website_url,
            description,
            public_presence
          )
        `
        )
        .eq("user_id", uid)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      const gRaw = mem?.galleries as
        | {
            id: string;
            slug: string;
            location: string | null;
            website_url: string | null;
            description: string | null;
            public_presence?: unknown;
          }
        | {
            id: string;
            slug: string;
            location: string | null;
            website_url: string | null;
            description: string | null;
            public_presence?: unknown;
          }[]
        | null
        | undefined;
      const g = Array.isArray(gRaw) ? gRaw[0] : gRaw;
      if (g?.id) {
        setGalleryId(g.id);
        setGallerySlug(g.slug || null);
        setGalleryLocation(String(g.location || "").trim());
        setGalleryWebsite(String(g.website_url || "").trim());
        setGalleryDescription(String(g.description || "").trim());
        nextPresence = parsePublicPresence(g.public_presence);
      }
    }

    setPresence(nextPresence);
    setLoading(false);
  }, [sb]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!loading && userId) void refreshAccountStatus();
  }, [loading, userId, refreshAccountStatus]);

  const save = async () => {
    if (!userId || !role) return;
    setSaving(true);
    setError(null);
    setSavedAt(null);

    const supabase = sb();
    const json = toPublicPresenceJson(presence);
    let actorDisplay = displayName.trim();
    if (!actorDisplay && role === "gallery") {
      actorDisplay = "Gallery";
    }

    const { error: apErr } = await supabase
      .from("actor_profiles")
      .update({
        display_name: actorDisplay || null,
        public_presence: json,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (apErr) {
      setSaving(false);
      setError(summarizeRpcError(apErr) || "Could not save.");
      return;
    }

    if (role === "artist") {
      const { error: arErr } = await supabase
        .from("artists")
        .update({
          display_name: displayName.trim() || null,
          bio: artistBio.trim() || null,
          website: normalizeOptionalWebsite(artistWebsite),
          instagram: artistInstagram.trim().replace(/^@/, "") || null,
          public_presence: json,
          studio_artworks_accent: studioArtworksAccent,
        })
        .eq("id", userId);
      if (arErr) {
        setSaving(false);
        setError(arErr.message || "Could not save artist profile.");
        return;
      }
    }

    if (role === "collector") {
      const { error: cpErr } = await supabase
        .from("collector_profiles")
        .update({
          display_name: displayName.trim() || null,
          location: collectorLocation.trim() || null,
          bio: collectorBio.trim() || null,
          is_public: presence.profile,
          anonymous_on_public: collectorAnonymous,
          public_presence: json,
        })
        .eq("user_id", userId);
      if (cpErr) {
        setSaving(false);
        setError(cpErr.message || "Could not save collector profile.");
        return;
      }
    }

    if (role === "gallery" && galleryId) {
      const { error: gErr } = await supabase
        .from("galleries")
        .update({
          location: galleryLocation.trim() || null,
          website_url: normalizeOptionalWebsite(galleryWebsite),
          description: galleryDescription.trim() || null,
          public_presence: json,
        })
        .eq("id", galleryId);
      if (gErr) {
        setSaving(false);
        setError(gErr.message || "Could not save gallery.");
        return;
      }
    }

    setSaving(false);
    setSavedAt(Date.now());
    await load();
  };

  const publicPageHref = useMemo(() => {
    if (!role) return null;
    if (role === "gallery" && gallerySlug)
      return `/institutional-studio/${encodeURIComponent(gallerySlug)}`;
    if (role === "artist" && artistSlug)
      return `/artist/${encodeURIComponent(artistSlug)}`;
    if (role === "collector" && collectorSlug)
      return `/collector-studio/${encodeURIComponent(collectorSlug)}`;
    return null;
  }, [role, gallerySlug, artistSlug, collectorSlug]);

  const profileSnapshot = useMemo((): AccountProfileSnapshot => {
    if (role === "artist") {
      return {
        bio: artistBio,
        website: artistWebsite,
        instagram: artistInstagram,
      };
    }
    if (role === "collector") {
      return {
        location: collectorLocation,
        bio: collectorBio,
        anonymousOnPublic: collectorAnonymous,
        ownedWorkCount: collectorPreviewArtworks.length,
      };
    }
    if (role === "gallery") {
      return {
        location: galleryLocation,
        website: galleryWebsite,
        description: galleryDescription,
      };
    }
    return {};
  }, [
    role,
    artistBio,
    artistWebsite,
    artistInstagram,
    collectorLocation,
    collectorBio,
    collectorAnonymous,
    collectorPreviewArtworks.length,
    galleryLocation,
    galleryWebsite,
    galleryDescription,
  ]);

  if (loading) {
    return (
      <div className="ds-page-environment min-h-screen pt-28 text-center text-sm text-neutral-500">
        Loading…
      </div>
    );
  }

  if (!role) {
    return (
      <div className="ds-page-environment min-h-screen px-6 pt-28 text-neutral-800">
        <main className="mx-auto max-w-lg">
          <p className="font-serif text-xl text-neutral-950">Account</p>
          {error ? (
            <p className="mt-4 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
        </main>
      </div>
    );
  }

  const workspaceHref =
    role === "artist"
      ? "/studio/creative"
      : role === "collector"
        ? "/studio/collector"
        : "/studio/organisation";
  const workspaceLabel =
    role === "artist" || role === "collector" || role === "gallery"
      ? productWorkspaceLabel(role, t)
      : "Studio";

  const content = (
    <AccountPageContent
      role={role}
      email={email}
      displayName={displayName}
      onDisplayNameChange={setDisplayName}
      presence={presence}
      onPresenceChange={setPresence}
      artistBio={artistBio}
      onArtistBioChange={setArtistBio}
      artistWebsite={artistWebsite}
      onArtistWebsiteChange={setArtistWebsite}
      artistInstagram={artistInstagram}
      onArtistInstagramChange={setArtistInstagram}
      collectorLocation={collectorLocation}
      onCollectorLocationChange={setCollectorLocation}
      collectorBio={collectorBio}
      onCollectorBioChange={setCollectorBio}
      collectorAnonymous={collectorAnonymous}
      onCollectorAnonymousChange={setCollectorAnonymous}
      galleryLocation={galleryLocation}
      onGalleryLocationChange={setGalleryLocation}
      galleryWebsite={galleryWebsite}
      onGalleryWebsiteChange={setGalleryWebsite}
      galleryDescription={galleryDescription}
      onGalleryDescriptionChange={setGalleryDescription}
      studioArtworksAccent={studioArtworksAccent}
      onStudioArtworksAccentChange={setStudioArtworksAccent}
      publicPageHref={publicPageHref}
      workspaceHref={workspaceHref}
      workspaceLabel={workspaceLabel}
      profileSnapshot={profileSnapshot}
      collectorPreviewArtworks={
        role === "collector" ? collectorPreviewArtworks : null
      }
      artistRepHistorical={artistRepHistorical}
      accountStatus={accountStatus}
      deletionScheduledAt={deletionScheduledAt}
      authProvider={authProvider}
      onRefreshAccountStatus={refreshAccountStatus}
      saving={saving}
      savedAt={savedAt}
      error={error}
      onSave={() => void save()}
    />
  );

  if (role === "artist" && userId) {
    return (
      <ArtistWorkspaceShellLayout userId={userId} accountActive>
        {content}
      </ArtistWorkspaceShellLayout>
    );
  }

  if (role === "collector" && userId) {
    return (
      <CollectorWorkspaceShellLayout userId={userId} accountActive>
        {content}
      </CollectorWorkspaceShellLayout>
    );
  }

  if (role === "gallery" && userId) {
    return (
      <GalleryWorkspaceShellLayout userId={userId} accountActive>
        {content}
      </GalleryWorkspaceShellLayout>
    );
  }

  return (
    <div className="ds-page-environment relative min-h-screen pb-28 pt-10 text-neutral-900 sm:pt-12">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-900/10 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[min(100%,88rem)] px-4 sm:px-6 lg:px-8">
        {content}
      </div>
    </div>
  );
}
