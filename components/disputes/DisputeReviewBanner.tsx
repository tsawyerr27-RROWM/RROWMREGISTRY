type Props = {
  className?: string;
};

/** Non-identifying notice shown when an open dispute exists on a public record. */
export function DisputeReviewBanner({ className = "" }: Props) {
  return (
    <div
      role="status"
      className={`rounded-xl border border-neutral-400/35 bg-neutral-100/80 px-4 py-3 text-sm leading-relaxed text-neutral-800 ${className}`.trim()}
    >
      <p className="font-medium text-neutral-950">
        This record is currently under review
      </p>
      <p className="mt-1 text-[13px] text-neutral-600">
        A formal challenge is open. Registry staff may update verification or listing
        information while the matter is assessed.
      </p>
    </div>
  );
}
