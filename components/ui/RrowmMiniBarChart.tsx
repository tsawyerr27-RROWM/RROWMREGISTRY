/**
 * Shared miniature vertical bar sparkline — same gradient treatment site-wide
 * (landing portfolio deck, gallery catalogue intelligence, etc.).
 */
export function RrowmMiniBarChart({
  heightsPercent,
  className = "",
  trackClassName = "h-14",
  minHeightPercent = 12,
}: {
  /** Bar heights as percent of the track (0–100). */
  heightsPercent: number[];
  className?: string;
  /** Tailwind height class for the bar area, e.g. `h-12` or `h-14`. */
  trackClassName?: string;
  /** Floor so empty months / low values still read in the chart. */
  minHeightPercent?: number;
}) {
  if (heightsPercent.length === 0) return null;

  return (
    <div
      className={`flex items-end gap-1 ${trackClassName} ${className}`.trim()}
      role="img"
      aria-hidden
    >
      {heightsPercent.map((raw, i) => {
        const pct = Math.min(100, Math.max(minHeightPercent, raw));
        return (
          <div
            key={i}
            className="flex min-h-0 min-w-[5px] flex-1 flex-col justify-end"
          >
            <div
              className="w-full rounded-t bg-gradient-to-t from-neutral-400/45 via-neutral-300/28 to-neutral-100/35 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:from-neutral-500/50 group-hover:via-neutral-400/32 group-hover:to-neutral-100/40"
              style={{ height: `${pct}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
