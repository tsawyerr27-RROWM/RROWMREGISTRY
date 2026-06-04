"use client";

import Link from "next/link";
import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { PublicPresence } from "@/lib/public-presence";
import { RegistryCatalogueInfoTooltip } from "@/components/Registry/RegistryCatalogueInfoTooltip";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { productRoleLabel } from "@/lib/studio-terminology";

export type AccountHeroPreviewArtwork = {
  id: string;
  image_url?: string | null;
  title?: string | null;
  registry_id?: string | null;
};

export type AccountProfileSnapshot = {
  bio?: string;
  website?: string;
  instagram?: string;
  location?: string;
  description?: string;
  anonymousOnPublic?: boolean;
  ownedWorkCount?: number;
};

type Role = "artist" | "collector" | "gallery";

function filled(s: string | undefined): boolean {
  return Boolean(s && s.trim().length > 0);
}

function completenessPercent(flags: boolean[]): number {
  if (flags.length === 0) return 0;
  return Math.round((flags.filter(Boolean).length / flags.length) * 100);
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function publicPath(href: string): string {
  try {
    if (href.startsWith("/")) return href;
    const u = new URL(href, "https://rrowm.app");
    return `${u.pathname}${u.search}`;
  } catch {
    return href;
  }
}

function HeroTile({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <li className="flex flex-col rounded-lg bg-white/[0.06] p-4 ring-1 ring-white/10">
      <p className="text-[13px] font-medium text-white">{title}</p>
      <div className="mt-3 flex min-h-[5.5rem] flex-1 flex-col justify-between gap-3">
        {children}
      </div>
      {footer ? (
        <div className="mt-3 border-t border-white/10 pt-3">{footer}</div>
      ) : null}
    </li>
  );
}

function CompletenessMeter({ percent }: { percent: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wide text-white/45">
          Profile completeness
        </span>
        <span className="tabular-nums text-sm font-semibold text-white">{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400/90 to-amber-200/80 transition-[width] duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}

function VisibilityChips({ presence }: { presence: PublicPresence }) {
  const chips: { key: keyof PublicPresence; label: string; title: string }[] = [
    { key: "profile", label: "Profile", title: "Public profile" },
    { key: "location", label: "Location", title: "Location" },
    { key: "ownership", label: "Owner", title: "Ownership context" },
    { key: "values", label: "Values", title: "Declared values" },
  ];
  const onCount = chips.filter((c) => presence[c.key]).length;

  return (
    <div className="space-y-2.5">
      <p className="text-[11px] text-white/45">
        <span className="font-medium text-white/70">{onCount}</span> of {chips.length}{" "}
        signals visible
      </p>
      <div className="grid min-w-0 grid-cols-2 gap-1.5">
        {chips.map((c) => {
          const on = presence[c.key];
          return (
            <span
              key={c.key}
              title={c.title}
              className={`flex min-h-[1.75rem] min-w-0 items-center justify-center rounded-md px-1 py-1 text-center text-[9px] font-medium leading-[1.15] ${
                on
                  ? "bg-emerald-500/20 text-emerald-200/95 ring-1 ring-emerald-400/25"
                  : "bg-white/5 text-white/35 ring-1 ring-white/10"
              }`}
            >
              {c.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function AnchorLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-[12px] font-medium text-amber-200/90 transition hover:text-amber-100"
    >
      {children}
      <span aria-hidden>↓</span>
    </Link>
  );
}

function FieldChecklist({ items }: { items: { label: string; done: boolean }[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-[11px]">
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
              item.done
                ? "bg-emerald-500/25 text-emerald-200"
                : "bg-white/10 text-white/35"
            }`}
            aria-hidden
          >
            {item.done ? "✓" : "·"}
          </span>
          <span className={item.done ? "text-white/70" : "text-white/45"}>
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PreviewRow({
  label,
  on,
}: {
  label: string;
  on: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-4 text-[13px]">
      <span className="text-white/55">{label}</span>
      <span
        className={`tabular-nums text-sm font-semibold ${
          on ? "text-emerald-300/95" : "text-white/35"
        }`}
      >
        {on ? "On" : "Off"}
      </span>
    </li>
  );
}

function ArtistNarrativeTile({
  snapshot,
  displayName,
}: {
  snapshot: AccountProfileSnapshot;
  displayName: string;
}) {
  const flags = [
    filled(displayName),
    filled(snapshot.bio) && (snapshot.bio?.trim().length ?? 0) >= 24,
    filled(snapshot.website),
    filled(snapshot.instagram),
  ];
  const percent = completenessPercent(flags);
  const bio = snapshot.bio?.trim() ?? "";
  const ig = snapshot.instagram?.trim().replace(/^@/, "") ?? "";

  return (
    <HeroTile
      title="Public narrative"
      footer={<AnchorLink href="#account-profile">Edit biography & links</AnchorLink>}
    >
      <CompletenessMeter percent={percent} />
      {bio ? (
        <p className="line-clamp-2 text-[11px] leading-relaxed text-white/55 italic">
          &ldquo;{truncate(bio, 100)}&rdquo;
        </p>
      ) : (
        <p className="text-[11px] leading-relaxed text-white/40">
          No biography yet. Add one to shape how collectors read your practice.
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {filled(snapshot.website) ? (
          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/65">
            Website
          </span>
        ) : null}
        {ig ? (
          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/65">
            @{ig}
          </span>
        ) : null}
        {!filled(snapshot.website) && !ig ? (
          <span className="text-[10px] text-white/35">No links added</span>
        ) : null}
      </div>
    </HeroTile>
  );
}

function VisibilityTile({ presence }: { presence: PublicPresence }) {
  return (
    <HeroTile
      title="Layered visibility"
      footer={<AnchorLink href="#account-visibility">Adjust visibility toggles</AnchorLink>}
    >
      <VisibilityChips presence={presence} />
    </HeroTile>
  );
}

function CanonicalPresenceTile({
  publicPageHref,
  presence,
  roleLabel,
}: {
  publicPageHref: string | null;
  presence: PublicPresence;
  roleLabel: string;
}) {
  const path = publicPageHref ? publicPath(publicPageHref) : null;
  const live = Boolean(path && presence.profile);

  return (
    <HeroTile title="Canonical presence">
      <div className="rounded-md bg-black/35 px-3 py-2.5 ring-1 ring-white/10">
        <p className="text-[9px] uppercase tracking-wider text-white/35">Public URL</p>
        <p
          className={`mt-1 truncate font-mono text-[11px] ${
            live ? "text-emerald-200/90" : "text-white/40"
          }`}
        >
          {path ?? `${roleLabel.toLowerCase()} · not published`}
        </p>
      </div>
      {publicPageHref ? (
        <Link
          href={publicPageHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-md border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-medium text-white transition hover:bg-white/15"
        >
          {live ? "Open live page" : "Preview page (profile off)"}
        </Link>
      ) : (
        <p className="text-[11px] leading-relaxed text-white/45">
          Your public slug appears after studio onboarding.
        </p>
      )}
    </HeroTile>
  );
}

function CollectorPrivacyTile({
  presence,
  anonymousOnPublic,
}: {
  presence: PublicPresence;
  anonymousOnPublic: boolean;
}) {
  return (
    <HeroTile
      title="Privacy first"
      footer={<AnchorLink href="#account-visibility">Privacy & visibility</AnchorLink>}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ring-1 ${
            presence.profile
              ? "bg-emerald-500/15 ring-emerald-400/30"
              : "bg-white/5 ring-white/15"
          }`}
        >
          <span className="text-[9px] uppercase text-white/45">Profile</span>
          <span
            className={`text-sm font-semibold ${
              presence.profile ? "text-emerald-200" : "text-white/40"
            }`}
          >
            {presence.profile ? "On" : "Off"}
          </span>
        </div>
        <div className="min-w-0 space-y-1.5">
          <p className="text-[11px] text-white/55">
            {presence.profile
              ? "A public collector page exists."
              : "No public profile. Fully private."}
          </p>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
              anonymousOnPublic
                ? "bg-violet-500/20 text-violet-200/90"
                : "bg-white/10 text-white/50"
            }`}
          >
            {anonymousOnPublic ? "Anonymous label" : "Name shown"}
          </span>
        </div>
      </div>
    </HeroTile>
  );
}

function CollectorCollectionTile({
  presence,
  ownedWorkCount,
}: {
  presence: PublicPresence;
  ownedWorkCount: number;
}) {
  return (
    <HeroTile
      title="Collection signals"
      footer={<AnchorLink href="#account-visibility">Ownership & value toggles</AnchorLink>}
    >
      <p className="font-serif text-2xl font-normal tabular-nums text-white">
        {ownedWorkCount}
        <span className="ml-1.5 text-sm font-sans font-normal text-white/45">
          registered {ownedWorkCount === 1 ? "work" : "works"}
        </span>
      </p>
      <div className="flex gap-2">
        <span
          className={`flex-1 rounded-md py-1.5 text-center text-[10px] font-medium ${
            presence.ownership
              ? "bg-emerald-500/20 text-emerald-200/90"
              : "bg-white/5 text-white/35"
          }`}
        >
          Ownership {presence.ownership ? "shown" : "hidden"}
        </span>
        <span
          className={`flex-1 rounded-md py-1.5 text-center text-[10px] font-medium ${
            presence.values
              ? "bg-emerald-500/20 text-emerald-200/90"
              : "bg-white/5 text-white/35"
          }`}
        >
          Values {presence.values ? "shown" : "hidden"}
        </span>
      </div>
    </HeroTile>
  );
}

function CollectorAccountTile({
  workspaceHref,
  workspaceLabel,
}: {
  workspaceHref: string;
  workspaceLabel: string;
}) {
  const { t } = useLocalePreferences();

  return (
    <HeroTile title="One account">
      <div className="flex flex-col gap-2">
        <Link
          href={workspaceHref}
          className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-center text-[11px] font-medium text-white transition hover:bg-white/15"
        >
          {workspaceLabel}
        </Link>
        <Link
          href="/registry"
          className="rounded-md border border-white/10 px-3 py-2 text-center text-[11px] font-medium text-white/70 transition hover:border-white/20 hover:text-white"
        >
          {t("studio.shell.browseCatalogue")}
        </Link>
      </div>
    </HeroTile>
  );
}

function GalleryIdentityTile({
  snapshot,
  displayName,
  title,
}: {
  snapshot: AccountProfileSnapshot;
  displayName: string;
  title: string;
}) {
  const items = [
    { label: "Display name", done: filled(displayName) },
    { label: "Location", done: filled(snapshot.location) },
    { label: "Website", done: filled(snapshot.website) },
    { label: "Description", done: filled(snapshot.description) },
  ];
  const percent = completenessPercent(items.map((i) => i.done));

  return (
    <HeroTile
      title="Institutional identity"
      footer={<AnchorLink href="#account-profile">Edit institution details</AnchorLink>}
    >
      <CompletenessMeter percent={percent} />
      <FieldChecklist items={items} />
    </HeroTile>
  );
}

function roleTiles(
  role: Role,
  props: {
    displayName: string;
    publicPageHref: string | null;
    workspaceHref: string;
    workspaceLabel: string;
    presence: PublicPresence;
    snapshot: AccountProfileSnapshot;
    ownedWorkCount: number;
    participantLabel: string;
    organisationIdentityTitle: string;
  }
): React.ReactNode {
  const {
    displayName,
    publicPageHref,
    workspaceHref,
    workspaceLabel,
    presence,
    snapshot,
    ownedWorkCount,
    participantLabel,
    organisationIdentityTitle,
  } = props;

  if (role === "artist") {
    return (
      <>
        <ArtistNarrativeTile snapshot={snapshot} displayName={displayName} />
        <VisibilityTile presence={presence} />
        <CanonicalPresenceTile
          publicPageHref={publicPageHref}
          presence={presence}
          roleLabel={participantLabel}
        />
      </>
    );
  }

  if (role === "collector") {
    return (
      <>
        <CollectorPrivacyTile
          presence={presence}
          anonymousOnPublic={Boolean(snapshot.anonymousOnPublic)}
        />
        <CollectorCollectionTile presence={presence} ownedWorkCount={ownedWorkCount} />
        <CollectorAccountTile workspaceHref={workspaceHref} workspaceLabel={workspaceLabel} />
      </>
    );
  }

  return (
    <>
      <GalleryIdentityTile
        snapshot={snapshot}
        displayName={displayName}
        title={organisationIdentityTitle}
      />
      <VisibilityTile presence={presence} />
    </>
  );
}

type Props = {
  displayName: string;
  role: Role;
  publicPageHref: string | null;
  workspaceHref: string;
  workspaceLabel: string;
  presence: PublicPresence;
  profileSnapshot?: AccountProfileSnapshot;
  collectionPreviewArtworks?: AccountHeroPreviewArtwork[] | null;
};

export function AccountPresenceHero({
  displayName,
  role,
  publicPageHref,
  workspaceHref,
  workspaceLabel,
  presence,
  profileSnapshot = {},
  collectionPreviewArtworks,
}: Props) {
  const { t } = useLocalePreferences();
  const participantLabel = productRoleLabel(role, t);
  const headline = displayName.trim() || "Your account";
  const previewList = collectionPreviewArtworks ?? [];
  const showCollectionPreview = role === "collector" && previewList.length > 0;
  const anyPreviewImage = previewList.some(
    (a) => a.image_url && String(a.image_url).trim() !== ""
  );
  const ownedWorkCount =
    profileSnapshot.ownedWorkCount ?? previewList.length;

  return (
    <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-neutral-950 via-[#151a24] to-neutral-900 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div
        className={`pointer-events-none absolute -right-24 top-0 h-[380px] w-[380px] rounded-full blur-[100px] ${
          role === "collector"
            ? "bg-teal-500/14"
            : role === "gallery"
              ? "bg-violet-500/12"
              : "bg-amber-500/12"
        }`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -left-16 bottom-0 h-[260px] w-[260px] rounded-full blur-[90px] ${
          role === "collector" ? "bg-sky-500/12" : "bg-sky-500/10"
        }`}
        aria-hidden
      />
      <div className="relative grid gap-10 px-6 py-12 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-14 xl:px-14">
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-sm font-medium text-white/85">
                {participantLabel}
              </span>
            </div>
            <InfoTooltip
              text={
                role === "collector"
                  ? "Your public presence on the registry is deliberate. These controls shape what visitors see, not your internal records or studio activity."
                  : "Your public presence on the registry is deliberate. These controls shape what visitors see, not your internal records or workspace activity."
              }
              theme="dark"
            />
            <h1 className="mt-5 font-serif text-[2rem] font-normal leading-[1.05] tracking-tight text-white md:text-[2.65rem] lg:text-[2.85rem]">
              {headline}
            </h1>
          </div>

          <div className="mt-10 space-y-5 lg:mt-12">
            <ul
              className={`grid gap-4 sm:gap-5 ${
                role === "gallery" ? "sm:grid-cols-2" : "sm:grid-cols-3"
              }`}
            >
              {roleTiles(role, {
                displayName,
                publicPageHref,
                workspaceHref,
                workspaceLabel,
                presence,
                snapshot: profileSnapshot,
                ownedWorkCount,
                participantLabel,
                organisationIdentityTitle: t("account.hero.organisationIdentity"),
              })}
            </ul>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-8">
            <Link
              href={workspaceHref}
              className="rounded-lg bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-950 shadow-lg shadow-black/25 transition [transition-timing-function:var(--rrowm-ease-out)] hover:bg-white/90"
            >
              {workspaceLabel}
            </Link>
            {publicPageHref ? (
              <Link
                href={publicPageHref}
                className="rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                View public page
              </Link>
            ) : (
              <span className="rounded-lg border border-white/15 px-5 py-2.5 text-[13px] text-white/40">
                Public page when slug is available
              </span>
            )}
            <div className="ml-auto flex items-center gap-3 text-[12px] text-white/50">
              <RegistryCatalogueInfoTooltip theme="dark" />
              <Link href="/registry" className="transition hover:text-white">
                Registry
              </Link>
            </div>
          </div>
        </div>

        <div className="flex min-h-[260px] flex-col items-center justify-center gap-10 lg:col-span-5 lg:min-h-[320px]">
          {showCollectionPreview ? (
            <div className="relative w-full max-w-[min(100%,340px)]">
              <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-t from-black/40 to-transparent blur-2xl" />
              <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.02] p-6 ring-1 ring-white/10 backdrop-blur-md">
                <div className="flex justify-center">
                  <ArtworksHeroPreview artworks={previewList as any[]} />
                </div>
                {!anyPreviewImage ? (
                  <p className="mt-4 text-center text-xs leading-relaxed text-white/40">
                    Images appear when registered works include artwork images.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="relative w-full max-w-[min(100%,340px)]">
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-t from-black/40 to-transparent blur-2xl" />
            <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.02] p-6 ring-1 ring-white/10 backdrop-blur-md">
              <h3 className="text-center font-serif text-lg font-normal text-white">
                Visibility snapshot
              </h3>
              <p className="mt-2 text-center text-xs text-white/40">
                Updates as you adjust toggles below
              </p>
              <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
                <PreviewRow label="Public profile" on={presence.profile} />
                <PreviewRow label="Location" on={presence.location} />
                <PreviewRow label="Ownership context" on={presence.ownership} />
                <PreviewRow label="Declared values" on={presence.values} />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
