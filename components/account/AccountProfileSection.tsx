"use client";

import {
  AccountFieldLabel,
  AccountPanel,
  AccountReadOnlyValue,
  AccountSubsection,
  accountFieldClass,
  accountTextareaClass,
  roleLabel,
} from "@/components/account/account-ui";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Role = "artist" | "collector" | "gallery";

type Props = {
  role: Role;
  displayName: string;
  onDisplayNameChange: (v: string) => void;
  email: string | null;
  artistBio: string;
  onArtistBioChange: (v: string) => void;
  artistWebsite: string;
  onArtistWebsiteChange: (v: string) => void;
  artistInstagram: string;
  onArtistInstagramChange: (v: string) => void;
  collectorLocation: string;
  onCollectorLocationChange: (v: string) => void;
  collectorBio: string;
  onCollectorBioChange: (v: string) => void;
  galleryLocation: string;
  onGalleryLocationChange: (v: string) => void;
  galleryWebsite: string;
  onGalleryWebsiteChange: (v: string) => void;
  galleryDescription: string;
  onGalleryDescriptionChange: (v: string) => void;
};

export function AccountProfileSection(props: Props) {
  const { role } = props;
  const { t } = useLocalePreferences();

  const profileDescription =
    role === "artist"
      ? t("account.profile.publicProfileHint")
      : role === "collector"
        ? "Location and note shown on your collector page."
        : "Organisation details shown on your public catalogue page.";

  const profileTitle =
    role === "gallery"
      ? t("account.profile.organisationProfile")
      : "Public profile";

  return (
    <AccountPanel
      id="account-profile"
      title="Profile"
      description="Account identity and the information visitors see when your profile is public."
    >
      <div className="flex flex-col gap-10 lg:gap-12">
        <AccountSubsection
          title="Account identity"
          description="Sign-in details and how your name appears across RROWM."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <AccountFieldLabel htmlFor="account-display-name">
                Display name
              </AccountFieldLabel>
              <input
                id="account-display-name"
                value={props.displayName}
                onChange={(e) => props.onDisplayNameChange(e.target.value)}
                className={accountFieldClass}
              />
            </div>
            <div>
              <AccountFieldLabel>Email</AccountFieldLabel>
              <AccountReadOnlyValue muted>
                {props.email || "—"}
              </AccountReadOnlyValue>
              <p className="mt-2 text-xs text-neutral-500">
                Managed through your sign-in provider.
              </p>
            </div>
            <div>
              <AccountFieldLabel>Account type</AccountFieldLabel>
              <AccountReadOnlyValue>{roleLabel(role, t)}</AccountReadOnlyValue>
            </div>
          </div>
        </AccountSubsection>

        <div className="border-t border-neutral-900/[0.06] pt-10 lg:pt-12">
          <AccountSubsection title={profileTitle} description={profileDescription}>
            {role === "artist" ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <AccountFieldLabel htmlFor="artist-bio">Biography</AccountFieldLabel>
                  <textarea
                    id="artist-bio"
                    value={props.artistBio}
                    onChange={(e) => props.onArtistBioChange(e.target.value)}
                    rows={5}
                    className={accountTextareaClass}
                  />
                </div>
                <div>
                  <AccountFieldLabel htmlFor="artist-website">Website</AccountFieldLabel>
                  <input
                    id="artist-website"
                    type="text"
                    inputMode="url"
                    value={props.artistWebsite}
                    onChange={(e) => props.onArtistWebsiteChange(e.target.value)}
                    className={accountFieldClass}
                    placeholder="https://"
                  />
                </div>
                <div>
                  <AccountFieldLabel htmlFor="artist-instagram">Instagram</AccountFieldLabel>
                  <input
                    id="artist-instagram"
                    value={props.artistInstagram}
                    onChange={(e) => props.onArtistInstagramChange(e.target.value)}
                    className={accountFieldClass}
                    placeholder="@handle"
                  />
                </div>
              </div>
            ) : null}

            {role === "collector" ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <AccountFieldLabel htmlFor="collector-location">Location</AccountFieldLabel>
                  <input
                    id="collector-location"
                    value={props.collectorLocation}
                    onChange={(e) => props.onCollectorLocationChange(e.target.value)}
                    className={accountFieldClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <AccountFieldLabel htmlFor="collector-note">Note</AccountFieldLabel>
                  <textarea
                    id="collector-note"
                    value={props.collectorBio}
                    onChange={(e) => props.onCollectorBioChange(e.target.value)}
                    rows={4}
                    className={accountTextareaClass}
                  />
                </div>
              </div>
            ) : null}

            {role === "gallery" ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <AccountFieldLabel htmlFor="gallery-location">Location</AccountFieldLabel>
                  <input
                    id="gallery-location"
                    value={props.galleryLocation}
                    onChange={(e) => props.onGalleryLocationChange(e.target.value)}
                    className={accountFieldClass}
                  />
                </div>
                <div>
                  <AccountFieldLabel htmlFor="gallery-website">Website</AccountFieldLabel>
                  <input
                    id="gallery-website"
                    type="text"
                    inputMode="url"
                    value={props.galleryWebsite}
                    onChange={(e) => props.onGalleryWebsiteChange(e.target.value)}
                    className={accountFieldClass}
                    placeholder="https://"
                  />
                </div>
                <div className="lg:col-span-2">
                  <AccountFieldLabel htmlFor="gallery-description">
                    Description
                  </AccountFieldLabel>
                  <textarea
                    id="gallery-description"
                    value={props.galleryDescription}
                    onChange={(e) => props.onGalleryDescriptionChange(e.target.value)}
                    rows={5}
                    className={accountTextareaClass}
                  />
                </div>
              </div>
            ) : null}
          </AccountSubsection>
        </div>
      </div>
    </AccountPanel>
  );
}
