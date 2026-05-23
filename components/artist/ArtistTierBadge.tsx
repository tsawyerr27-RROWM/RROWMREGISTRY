import type { ArtistTier } from "@/lib/artist-tier";
import { artistTierBadgeClass, artistTierLabel } from "@/lib/artist-tier";
import { Badge } from "@/components/ui/Badge";

type Props = {
  tier: ArtistTier;
  className?: string;
};

/**
 * Small neutral trust-tier pill derived from invite + artist visibility flags.
 */
export function ArtistTierBadge({ tier, className = "" }: Props) {
  return (
    <Badge
      tone="muted"
      className={`font-medium normal-case tracking-wide ${artistTierBadgeClass(tier)} ${className}`.trim()}
    >
      {artistTierLabel(tier)}
    </Badge>
  );
}
