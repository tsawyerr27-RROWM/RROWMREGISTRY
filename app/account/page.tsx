"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";
import { getOnboardingRedirectPath } from "@/lib/onboarding";
import { PageNav } from "@/components/ui/PageNav";
import { AccountPresenceHero } from "@/components/account/AccountPresenceHero";
import {
  DEFAULT_PUBLIC_PRESENCE,
  parsePublicPresence,
  type PublicPresence,
  toPublicPresenceJson,
} from "@/lib/public-presence";
import { getCollectorOwnedArtworkIds } from "@/lib/collector-portfolio";
import type { AccountHeroPreviewArtwork } from "@/components/account/AccountPresenceHero";
import {
  STUDIO_ARTWORKS_ACCENT_OPTIONS,
  parseStudioArtworksAccent,
  type StudioArtworksAccentId,
} from "@/lib/studio-artworks-accent";
import { deferredRouterReplace } from "@/lib/deferred-app-router";

type Role = "artist" | "collector" | "gallery";

const accountFieldClass =
  "liquid-glass-inset mt-3 w-full border-0 px-4 py-3.5 text-[15px] text-neutral-900 shadow-none placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900/15";
const accountTextareaClass = `${accountFieldClass} resize-none leading-relaxed`;

function normalizeOptionalWebsite(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function roleLabel(r: Role): string {
  switch (r) {
    case "artist":
      return "Artist";
    case "collector":
      return "Collector";
    case "gallery":
      return "Gallery";
    default:
      return r;
  }
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <label htmlFor={id} className="text-[15px] font-medium text-neutral-900">
          {label}
        </label>
        {hint ? (
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{hint}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-[background-color] duration-200 ease-out ${
          checked ? "bg-neutral-950" : "bg-neutral-200/90"
        } disabled:opacity-45`}
      >
        <span
          className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function AccountPanel({
  title,
  description,
  children,
}: {
  title: string;
  /** Optional one-line context under the title */
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-900/[0.06] bg-white/45 p-6 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:p-7">
      <h2 className="font-serif text-xl font-normal leading-snug tracking-tight text-neutral-950 md:text-2xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
          {description}
        </p>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

/** Groups toggles inside a panel (spacing only; no section label). */
function AccountSubsection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-8">{children}</div>;
}

export default function AccountPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
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

  const load = useCallback(async () => {
    setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      deferredRouterReplace(
        router,
        `/login?next=${encodeURIComponent("/account")}`
      );
      return;
    }
    const uid = sessionData.session.user.id;
    setUserId(uid);
    setEmail(sessionData.session.user.email ?? null);

    await supabase.auth.refreshSession();

    const needOnboarding = await getOnboardingRedirectPath(supabase, uid);
    if (needOnboarding) {
      deferredRouterReplace(router, needOnboarding);
      return;
    }

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
        const rows = (aw || []) as AccountHeroPreviewArtwork[];
        setCollectorPreviewArtworks(rows);
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
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!userId || !role) return;
    setSaving(true);
    setError(null);
    setSavedAt(null);

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
      ? "/studio"
      : role === "collector"
        ? "/collector-studio"
        : "/institutional-studio-dashboard";
  const workspaceLabel =
    role === "artist"
      ? "Studio"
      : role === "collector"
        ? "Collector studio"
        : "Institutional studio";

  return (
    <div className="ds-page-environment relative min-h-screen pb-28 pt-10 text-neutral-900 sm:pt-12">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-900/10 to-transparent"
        aria-hidden
      />
      <main className="relative mx-auto max-w-[min(100%,88rem)] px-4 sm:px-6 lg:px-8">
        <PageNav backHref="/registry" crumbs={[{ label: "My account" }]} />

        <div className="mt-6">
          <AccountPresenceHero
            displayName={displayName}
            role={role}
            publicPageHref={publicPageHref}
            workspaceHref={workspaceHref}
            workspaceLabel={workspaceLabel}
            presence={presence}
            collectionPreviewArtworks={
              role === "collector" ? collectorPreviewArtworks : null
            }
          />
        </div>

        <div className="mt-12 space-y-10 xl:max-w-5xl xl:mx-auto">
          {/* 1 · Account basics + what you publish (side by side on large screens) */}
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-8">
            <AccountPanel
              title="Identity"
              description="Core sign-in details and how you appear by name."
            >
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-neutral-700">
                    Display name
                  </label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={accountFieldClass}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">
                    Email
                  </label>
                  <p className="mt-3 rounded-2xl border border-neutral-900/[0.06] bg-black/[0.03] px-4 py-3.5 text-[15px] text-neutral-600">
                    {email || "—"}
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">
                    Managed through your sign-in provider.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">
                    Role
                  </label>
                  <p className="mt-3 text-[15px] font-medium text-neutral-900">
                    {roleLabel(role)}
                  </p>
                </div>
              </div>
            </AccountPanel>

            {role === "artist" ? (
              <AccountPanel
                title="Profile content"
                description="Shown on your artist page when visibility is on."
              >
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">
                      Biography
                    </label>
                    <textarea
                      value={artistBio}
                      onChange={(e) => setArtistBio(e.target.value)}
                      rows={5}
                      className={accountTextareaClass}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">
                      Website
                    </label>
                    <input
                      type="text"
                      inputMode="url"
                      value={artistWebsite}
                      onChange={(e) => setArtistWebsite(e.target.value)}
                      className={accountFieldClass}
                      placeholder="https://"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">
                      Instagram
                    </label>
                    <input
                      value={artistInstagram}
                      onChange={(e) => setArtistInstagram(e.target.value)}
                      className={accountFieldClass}
                      placeholder="@handle or handle"
                    />
                  </div>
                </div>
              </AccountPanel>
            ) : null}

            {role === "collector" ? (
              <AccountPanel
                title="Profile content"
                description="Shown on your collector page when visibility is on."
              >
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">
                      Location
                    </label>
                    <input
                      value={collectorLocation}
                      onChange={(e) => setCollectorLocation(e.target.value)}
                      className={accountFieldClass}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">
                      Note
                    </label>
                    <textarea
                      value={collectorBio}
                      onChange={(e) => setCollectorBio(e.target.value)}
                      rows={4}
                      className={accountTextareaClass}
                    />
                  </div>
                </div>
              </AccountPanel>
            ) : null}

            {role === "gallery" ? (
              <AccountPanel
                title="Institution"
                description="How your gallery reads on its public page."
              >
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">
                      Location
                    </label>
                    <input
                      value={galleryLocation}
                      onChange={(e) => setGalleryLocation(e.target.value)}
                      className={accountFieldClass}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">
                      Website
                    </label>
                    <input
                      type="text"
                      inputMode="url"
                      value={galleryWebsite}
                      onChange={(e) => setGalleryWebsite(e.target.value)}
                      className={accountFieldClass}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">
                      Description
                    </label>
                    <textarea
                      value={galleryDescription}
                      onChange={(e) => setGalleryDescription(e.target.value)}
                      rows={5}
                      className={accountTextareaClass}
                    />
                  </div>
                </div>
              </AccountPanel>
            ) : null}
          </div>

          {/* 2 · All visibility in one place */}
          <AccountPanel
            title="Privacy & visibility"
            description="Control whether your profile and registry details are visible to visitors."
          >
            <div className="liquid-glass-tile flex flex-col gap-10 px-4 py-6 md:px-6">
              <AccountSubsection>
                <ToggleRow
                  id="toggle-profile"
                  label="Show profile publicly"
                  hint="When off, your public profile page is not shown to visitors."
                  checked={presence.profile}
                  onChange={(v) => setPresence((p) => ({ ...p, profile: v }))}
                  disabled={saving}
                />
                <ToggleRow
                  id="toggle-location-p"
                  label="Show location"
                  hint="City or region visible on your public profile."
                  checked={presence.location}
                  onChange={(v) => setPresence((p) => ({ ...p, location: v }))}
                  disabled={saving}
                />
                {role === "collector" ? (
                  <div className="rounded-xl border border-neutral-900/[0.06] bg-white/35 px-4 py-5 md:px-5">
                    <ToggleRow
                      id="toggle-anon"
                      label="Prefer anonymity on public pages"
                      hint="Visitors see a neutral label instead of your name."
                      checked={collectorAnonymous}
                      onChange={setCollectorAnonymous}
                      disabled={saving}
                    />
                  </div>
                ) : null}
              </AccountSubsection>

              <div className="border-t border-neutral-900/[0.06] pt-10">
                <AccountSubsection>
                  <ToggleRow
                    id="toggle-ownership"
                    label="Show ownership publicly"
                    hint="Ownership context visible to visitors where applicable."
                    checked={presence.ownership}
                    onChange={(v) =>
                      setPresence((p) => ({ ...p, ownership: v }))
                    }
                    disabled={saving}
                  />
                  <ToggleRow
                    id="toggle-values"
                    label="Show values publicly"
                    hint="Declared values shown on your public collection where applicable."
                    checked={presence.values}
                    onChange={(v) => setPresence((p) => ({ ...p, values: v }))}
                    disabled={saving}
                  />
                </AccountSubsection>
              </div>
            </div>
          </AccountPanel>

          {/* 3 · Private workspace preference (artists) */}
          {role === "artist" ? (
            <AccountPanel
              title="Artworks appearance"
              description="Only affects your Studio — not public pages. Accent on the Artworks grid cards."
            >
              <div
                className="flex flex-wrap gap-3"
                role="radiogroup"
                aria-label="Studio Artworks accent color"
              >
                {STUDIO_ARTWORKS_ACCENT_OPTIONS.map((opt) => {
                  const selected = studioArtworksAccent === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={saving}
                      onClick={() => setStudioArtworksAccent(opt.id)}
                      className={`group flex min-w-[7.5rem] flex-col items-center gap-2 rounded-xl border px-3 py-3 text-left transition ${
                        selected
                          ? "border-neutral-900/25 bg-white/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]"
                          : "border-neutral-900/[0.08] bg-white/40 hover:border-neutral-900/15"
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ${opt.swatchClass} ${
                          selected
                            ? "ring-neutral-900/30 ring-offset-white"
                            : "ring-transparent ring-offset-transparent group-hover:ring-neutral-900/15"
                        }`}
                        aria-hidden
                      />
                      <span className="text-[13px] font-medium text-neutral-900">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </AccountPanel>
          ) : null}

          {error ? (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-4 rounded-2xl border border-neutral-900/[0.06] bg-white/35 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="rounded-xl bg-neutral-950 px-8 py-3.5 text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {savedAt ? (
              <p className="text-sm text-neutral-500" aria-live="polite">
                Saved
              </p>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
