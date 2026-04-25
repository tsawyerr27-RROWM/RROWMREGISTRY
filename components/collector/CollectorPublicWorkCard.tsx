import Link from "next/link";

type Props = {
  href: string;
  title: string;
  imageUrl: string | null;
  registryId: string | null;
  artistLabel: string | null;
  latestValueLine: string | null;
  ownershipLabel: string;
  ownershipClassName: string;
  heldLine: string | null;
  certLabel: string | null;
};

export function CollectorPublicWorkCard({
  href,
  title,
  imageUrl,
  registryId,
  artistLabel,
  latestValueLine,
  ownershipLabel,
  ownershipClassName,
  heldLine,
  certLabel,
}: Props) {
  return (
    <li className="group relative">
      <div className="absolute -inset-px rounded-[1.15rem] bg-gradient-to-b from-white/80 to-neutral-50/30 opacity-0 blur-sm transition duration-300 group-hover:opacity-100" />
      <article className="relative overflow-hidden rounded-2xl border border-neutral-900/[0.06] bg-white/55 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-[8px] transition duration-200 group-hover:border-neutral-900/10 group-hover:bg-white/75 group-hover:shadow-[0_12px_40px_-24px_rgba(15,23,42,0.15)]">
        <Link
          href={href}
          className="block outline-none focus-visible:ring-2 focus-visible:ring-teal-900/20 focus-visible:ring-offset-2"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200/60">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-xs text-neutral-400">No image</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/25 to-transparent opacity-60" />
          </div>
          <div className="space-y-2.5 p-5 md:p-6">
            <h3 className="font-serif text-[1.125rem] font-normal leading-snug tracking-tight text-neutral-950 md:text-xl group-hover:text-teal-950">
              {title}
            </h3>
            {artistLabel ? (
              <p className="text-sm text-neutral-500">{artistLabel}</p>
            ) : null}
            {registryId ? (
              <p className="inline-block rounded-md border border-neutral-900/[0.06] bg-neutral-50/80 px-2 py-0.5 font-mono text-[10px] tracking-tight text-neutral-500">
                {registryId}
              </p>
            ) : null}
            {latestValueLine ? (
              <p className="text-xs tabular-nums text-neutral-600">{latestValueLine}</p>
            ) : null}
            <p className={`text-[11px] font-medium leading-snug ${ownershipClassName}`}>
              {ownershipLabel}
            </p>
            {heldLine ? (
              <p className="text-[11px] leading-snug text-neutral-500">{heldLine}</p>
            ) : null}
            {certLabel ? (
              <p className="pt-1 text-sm font-semibold text-teal-800/70">
                {certLabel}
              </p>
            ) : null}
          </div>
        </Link>
      </article>
    </li>
  );
}
