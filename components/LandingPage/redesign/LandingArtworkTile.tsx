import type { MessageKey } from "@/lib/locale-messages";
import { landingType } from "@/styles/landing-redesign";

import {
  LandingInstallationVisual,
  type InstallationVariant,
} from "./LandingInstallationVisual";

export function LandingArtworkTile({
  variant,
  title,
  className = "",
  aspect = "4/5",
}: {
  variant: InstallationVariant;
  title: string;
  className?: string;
  aspect?: "4/5" | "3/4" | "1/1";
}) {
  const aspectClass =
    aspect === "3/4" ? "aspect-[3/4]" : aspect === "1/1" ? "aspect-square" : "aspect-[4/5]";

  return (
    <figure className={`m-0 ${className}`}>
      <div className={`landing-art-crop relative w-full overflow-hidden ${aspectClass}`}>
        <LandingInstallationVisual variant={variant} className="h-full w-full" />
      </div>
      <figcaption
        className={`${landingType.meta} mt-2.5 normal-case tracking-[0.04em] text-[var(--landing-charcoal-soft)]`}
      >
        {title}
      </figcaption>
    </figure>
  );
}

export const LANDING_ARTWORK_TITLE_KEYS = {
  ember: "landing.v2.visual.artworkEmber",
  cobalt: "landing.v2.visual.artworkCobalt",
  lime: "landing.v2.visual.artworkLime",
} as const satisfies Record<InstallationVariant, MessageKey>;
