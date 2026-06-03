"use client";

import type { PublicPresence } from "@/lib/public-presence";
import {
  AccountPanel,
  AccountSubsection,
  ToggleRow,
} from "@/components/account/account-ui";

type Role = "artist" | "collector" | "gallery";

type Props = {
  role: Role;
  presence: PublicPresence;
  onPresenceChange: (next: PublicPresence) => void;
  collectorAnonymous: boolean;
  onCollectorAnonymousChange: (v: boolean) => void;
  saving: boolean;
};

export function AccountVisibilitySection({
  role,
  presence,
  onPresenceChange,
  collectorAnonymous,
  onCollectorAnonymousChange,
  saving,
}: Props) {
  const set = (key: keyof PublicPresence, value: boolean) => {
    onPresenceChange({ ...presence, [key]: value });
  };

  return (
    <AccountPanel
      id="account-visibility"
      title="Public visibility"
      description="Control what visitors can see on your public profile and linked registry surfaces."
    >
      <div className="liquid-glass-tile flex flex-col gap-10 px-4 py-6 md:px-6">
        <AccountSubsection
          title="Profile signals"
          description="Whether your page and contextual details appear to the public."
        >
          <ToggleRow
            id="toggle-profile"
            label="Show profile publicly"
            hint="When off, your public profile page is not shown to visitors."
            checked={presence.profile}
            onChange={(v) => set("profile", v)}
            disabled={saving}
          />
          <ToggleRow
            id="toggle-location-p"
            label="Show location"
            hint="City or region visible on your public profile."
            checked={presence.location}
            onChange={(v) => set("location", v)}
            disabled={saving}
          />
          {role === "collector" ? (
            <div className="rounded-xl border border-neutral-900/[0.06] bg-white/35 px-4 py-5 md:px-5">
              <ToggleRow
                id="toggle-anon"
                label="Prefer anonymity on public pages"
                hint="Visitors see a neutral label instead of your name."
                checked={collectorAnonymous}
                onChange={onCollectorAnonymousChange}
                disabled={saving}
              />
            </div>
          ) : null}
        </AccountSubsection>

        <div className="border-t border-neutral-900/[0.06] pt-10">
          <AccountSubsection
            title="Registry context"
            description="Ownership and declared value visibility on public collection surfaces."
          >
            <ToggleRow
              id="toggle-ownership"
              label="Show ownership publicly"
              hint="Ownership context visible to visitors where applicable."
              checked={presence.ownership}
              onChange={(v) => set("ownership", v)}
              disabled={saving}
            />
            <ToggleRow
              id="toggle-values"
              label="Show values publicly"
              hint="Declared values shown on your public collection where applicable."
              checked={presence.values}
              onChange={(v) => set("values", v)}
              disabled={saving}
            />
          </AccountSubsection>
        </div>
      </div>
    </AccountPanel>
  );
}
