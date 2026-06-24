import {
  badgeTone,
  ownershipSurfaceBadgeLabel,
  type OwnershipSurfaceBadge,
} from "@/lib/ownership-surface-state";

const TONE_CLASS: Record<
  ReturnType<typeof badgeTone>,
  string
> = {
  emerald:
    "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  amber: "bg-amber-50 text-amber-900 ring-amber-200/80",
  rose: "bg-rose-50 text-rose-800 ring-rose-200/80",
  sky: "bg-sky-50 text-sky-800 ring-sky-200/80",
  violet: "bg-violet-50 text-violet-800 ring-violet-200/80",
  neutral: "bg-neutral-100 text-neutral-700 ring-neutral-200/80",
};

type Props = {
  badge: OwnershipSurfaceBadge;
  className?: string;
};

export function OwnershipStateBadge({ badge, className = "" }: Props) {
  const tone = badgeTone(badge);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${TONE_CLASS[tone]} ${className}`}
    >
      {ownershipSurfaceBadgeLabel(badge)}
    </span>
  );
}
