"use client";

import Link from "next/link";
import { useMemo } from "react";

type Props = {
  artworks: any[];
  /**
   * `tilt` = legacy angled frame (account, gallery, collector workspace).
   * `editorial` = flat card aligned with public registry / collection heroes.
   */
  variant?: "tilt" | "editorial";
};

/**
 * Picks one artwork with an image at random when the catalogue signature changes.
 */
export function ArtworksHeroPreview({
  artworks,
  variant = "tilt",
}: Props) {
  const signature = useMemo(
    () =>
      (artworks || [])
        .map((a: any) => `${a?.id ?? ""}:${a?.image_url ?? ""}`)
        .join("|"),
    [artworks],
  );

  const picked = useMemo(() => {
    const list = (artworks || []).filter(
      (a: any) => a?.image_url && String(a.image_url).trim() !== "",
    );
    if (list.length === 0) return null;
    const idx = Math.floor(Math.random() * list.length);
    return list[idx] as {
      id: string;
      image_url: string;
      title?: string;
      registry_id?: string;
    };
    // Randomizes when catalogue signature changes (page load / fetch), not on unrelated re-renders.
  }, [signature]);

  if (variant === "editorial") {
    if (!picked?.image_url) {
      return (
        <div className="flex w-full max-w-[min(100%,280px)] flex-col justify-center rounded-2xl border border-dashed border-white/45 bg-white/20 px-8 py-12 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] backdrop-blur-md lg:ml-auto">
          <p className="text-sm leading-relaxed text-neutral-600">
            A work from your catalogue will appear here when records include images.
          </p>
        </div>
      );
    }

    const href = picked.registry_id
      ? `/artwork/${encodeURIComponent(picked.registry_id)}`
      : undefined;
    const title = (picked.title || "").trim();

    const inner = (
      <>
        <div className="overflow-hidden rounded-2xl border border-white/45 bg-white/15 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.2),inset_0_1px_0_0_rgba(255,255,255,0.6)] ring-1 ring-neutral-200/30 backdrop-blur-sm transition duration-300 group-hover:border-white/60 group-hover:shadow-[0_22px_48px_-20px_rgba(15,23,42,0.22)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={picked.image_url}
            alt=""
            className="aspect-[3/4] w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
            draggable={false}
          />
        </div>
        {title ? (
          <p className="mt-4 px-0.5 font-serif text-lg font-normal leading-snug text-neutral-950 transition group-hover:text-neutral-700">
            {title}
          </p>
        ) : null}
        {picked.registry_id ? (
          <p className="mt-1.5 px-0.5 font-mono text-[11px] leading-tight tracking-tight text-neutral-400">
            {picked.registry_id}
          </p>
        ) : null}
        <p className="mt-2 px-0.5 text-sm font-medium text-neutral-600">
          View artwork →
        </p>
      </>
    );

    return (
      <div className="flex w-full justify-center lg:max-w-[min(100%,280px)] lg:justify-end">
        {href ? (
          <Link
            href={href}
            className="group block w-full max-w-[280px]"
            aria-label={title ? `Open ${title}` : "Open artwork"}
          >
            {inner}
          </Link>
        ) : (
          <div className="group w-full max-w-[280px]">{inner}</div>
        )}
      </div>
    );
  }

  if (!picked?.image_url) return null;

  const href = picked.registry_id
    ? `/artwork/${encodeURIComponent(picked.registry_id)}`
    : undefined;

  const frame = (
    <div
      className="relative w-[200px] sm:w-[220px] lg:w-[240px]"
      style={{ perspective: "920px" }}
    >
      <div
        className="origin-center will-change-transform"
        style={{
          transform:
            "rotateY(-13deg) rotateX(5deg) rotateZ(-2deg) translateZ(0)",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="overflow-hidden rounded-[10px] border border-black/[0.1] bg-neutral-100 shadow-[0_28px_56px_-18px_rgba(0,0,0,0.45),0_12px_28px_-12px_rgba(0,0,0,0.28),inset_0_1px_0_0_rgba(255,255,255,0.35)]"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={picked.image_url}
            alt=""
            className="aspect-[3/4] w-full object-cover"
            draggable={false}
          />
        </div>
        <div
          className="pointer-events-none absolute -bottom-3 left-[10%] right-[10%] h-6 rounded-[50%] bg-black/[0.14] blur-md"
          aria-hidden
        />
      </div>
    </div>
  );

  return (
    <div className="flex shrink-0 justify-center lg:justify-end lg:-translate-x-24 xl:-translate-x-32 2xl:-translate-x-40">
      {href ? (
        <Link
          href={href}
          className="group block transition-transform duration-300 hover:scale-[1.02]"
          aria-label={picked.title ? `Open ${picked.title}` : "Open artwork"}
        >
          {frame}
        </Link>
      ) : (
        frame
      )}
    </div>
  );
}
