"use client";

import type { RefObject } from "react";
import { useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { ArtworkAuthenticationInviteRow } from "@/lib/artwork-authentication-invite";
import {
  GalleryInvitationsSection,
  type GalleryInviteRow,
} from "@/components/gallery/GalleryInvitationsSection";
import { GalleryArtworkAuthenticationInvitesSection } from "@/components/gallery/GalleryArtworkAuthenticationInvitesSection";
import { workspace } from "@/styles/workspace-design";

type Tab = "representation" | "artwork";

type Props = {
  galleryName: string;
  registrySiteUrl: string;
  representationInvites: GalleryInviteRow[];
  artworkAuthInvites: ArtworkAuthenticationInviteRow[];
  isAdmin: boolean;
  inviteEmail: string;
  onInviteEmailChange: (v: string) => void;
  inviting: boolean;
  onSendRepresentationInvite: () => void;
  resendingRepresentationId: string | null;
  onResendRepresentationInvite: (id: string) => void;
  resendingArtworkAuthId: string | null;
  onResendArtworkAuthInvite: (id: string) => void;
  inviteError: string | null;
  inviteMessage: string | null;
  artworkInviteMessage: string | null;
  artworkInviteError: string | null;
  duplicateInviteActive: boolean;
  duplicateResendInviteId: string | null;
  manualDraft: string;
  manualDraftCopyDone: boolean;
  onCopyManualDraft: () => void;
  sectionRef?: RefObject<HTMLDivElement | null>;
  publishingPublicInviteId?: string | null;
  onMakeInvitePublic?: (id: string) => void | Promise<void>;
  invitePublishError?: string | null;
};

export function GalleryInvitationsHub(props: Props) {
  const { t } = useLocalePreferences();
  const [tab, setTab] = useState<Tab>("representation");

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-[13px] font-medium transition ${
      active
        ? "bg-neutral-950 text-white shadow-sm"
        : "text-neutral-600 hover:bg-neutral-900/[0.04] hover:text-neutral-900"
    }`;

  return (
    <div
      ref={props.sectionRef}
      id="gallery-invitations"
      className="scroll-mt-20 space-y-8 text-neutral-900"
    >
      <header className={`max-w-2xl ${workspace.panel.shell} !p-6 md:!p-8`}>
        <h1 className={workspace.panel.title}>{t("gallery.nav.invitations")}</h1>
        <p className={workspace.panel.description}>
          {t("gallery.invitations.hubDesc")}
        </p>
        <div
          className="mt-6 flex flex-wrap gap-2"
          role="tablist"
          aria-label={t("gallery.invitations.tabListLabel")}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "representation"}
            className={tabClass(tab === "representation")}
            onClick={() => setTab("representation")}
          >
            {t("gallery.invitations.tabRepresentation")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "artwork"}
            className={tabClass(tab === "artwork")}
            onClick={() => setTab("artwork")}
          >
            {t("gallery.invitations.tabArtworkAuth")}
            {props.artworkAuthInvites.length > 0 ? (
              <span className="ml-1.5 tabular-nums opacity-80">
                ({props.artworkAuthInvites.length})
              </span>
            ) : null}
          </button>
        </div>
      </header>

      {tab === "representation" ? (
        <GalleryInvitationsSection
          galleryName={props.galleryName}
          registrySiteUrl={props.registrySiteUrl}
          invites={props.representationInvites}
          isAdmin={props.isAdmin}
          inviteEmail={props.inviteEmail}
          onInviteEmailChange={props.onInviteEmailChange}
          inviting={props.inviting}
          onSendInvite={props.onSendRepresentationInvite}
          resendingInviteId={props.resendingRepresentationId}
          onResendInvite={props.onResendRepresentationInvite}
          inviteError={props.inviteError}
          inviteMessage={props.inviteMessage}
          duplicateInviteActive={props.duplicateInviteActive}
          duplicateResendInviteId={props.duplicateResendInviteId}
          manualDraft={props.manualDraft}
          manualDraftCopyDone={props.manualDraftCopyDone}
          onCopyManualDraft={props.onCopyManualDraft}
          publishingPublicInviteId={props.publishingPublicInviteId}
          onMakeInvitePublic={props.onMakeInvitePublic}
          invitePublishError={props.invitePublishError}
          hidePageHeader
          sectionEyebrow={t("gallery.invitations.representationSectionTitle")}
          sectionDescription={t("gallery.invitations.representationSectionDesc")}
        />
      ) : (
        <GalleryArtworkAuthenticationInvitesSection
          invites={props.artworkAuthInvites}
          registrySiteUrl={props.registrySiteUrl}
          isAdmin={props.isAdmin}
          resendingId={props.resendingArtworkAuthId}
          onResend={props.onResendArtworkAuthInvite}
          message={props.artworkInviteMessage}
          error={props.artworkInviteError}
        />
      )}
    </div>
  );
}
