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
  /** Which work to surface in the hero frame. */
  pick?: "random" | "latest";
  /** Text contrast when the preview sits on a dark hero band. */
  tone?: "light" | "dark";
};

/**
 * Picks one artwork with an image at random when the catalogue signature changes.
 */
export function ArtworksHeroPreview({
  artworks,
  variant = "tilt",
  pick = "random",
  tone = "light",
}: Props) {
  const signature = useMemo(
    () =>
      (artworks || [])
        .map(
          (a: any) =>
            `${a?.id ?? ""}:${a?.image_url ?? ""}:${a?.created_at ?? ""}`
        )
        .join("|"),
    [artworks],
  );

  const picked = useMemo(() => {
    const list = (artworks || []).filter(
      (a: any) => a?.image_url && String(a.image_url).trim() !== "",
    );
    if (list.length === 0) return null;
    const sorted =
      pick === "latest"
        ? [...list].sort((a, b) => {
            const at = Date.parse(String(a?.created_at ?? "")) || 0;
            const bt = Date.parse(String(b?.created_at ?? "")) || 0;
            return bt - at;
          })
        : list;
    const chosen =
      pick === "latest"
        ? sorted[0]
        : sorted[Math.floor(Math.random() * sorted.length)];
    return chosen as {
      id: string;
      image_url: string;
      title?: string;
      registry_id?: string;
    };
  }, [signature, pick]);

  if (variant === "editorial") {
    const isDark = tone === "dark";
    const emptyText = isDark ? "text-white/55" : "text-neutral-600";
    const titleText = isDark
      ? "text-white transition group-hover:text-white/85"
      : "text-neutral-950 transition group-hover:text-neutral-700";
    const regText = isDark ? "text-white/45" : "text-neutral-400";
    const linkText = isDark ? "text-white/65" : "text-neutral-600";

    if (!picked?.image_url) {
      return (
        <div className="flex w-full max-w-[280px] flex-col justify-center rounded-2xl border border-dashed border-white/25 bg-white/[0.06] px-8 py-12 text-center">
          <p className={`text-sm leading-relaxed ${emptyText}`}>
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
        <p
          className={`mb-3 text-center text-[10px] font-medium uppercase tracking-[0.14em] ${
            isDark ? "text-white/40" : "text-neutral-400"
          }`}
        >
          Highlighted on file
        </p>
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/20 shadow-[0_20px_48px_-24px_rgba(0,0,0,0.55)] ring-1 ring-white/15 transition duration-300 group-hover:border-white/35 group-hover:shadow-[0_24px_56px_-20px_rgba(0,0,0,0.5)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={picked.image_url}
            alt=""
            className="aspect-[4/5] w-full object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
            draggable={false}
          />
        </div>
        {title ? (
          <p
            className={`mt-4 px-0.5 text-center font-serif text-lg font-normal leading-snug ${titleText}`}
          >
            {title}
          </p>
        ) : null}
        {picked.registry_id ? (
          <p
            className={`mt-1.5 px-0.5 text-center font-mono text-[11px] leading-tight tracking-tight ${regText}`}
          >
            {picked.registry_id}
          </p>
        ) : null}
        <p className={`mt-2 px-0.5 text-center text-sm font-medium ${linkText}`}>
          View public record →
        </p>
      </>
    );

    return (
      <div className="flex w-full max-w-[280px] flex-col items-center">
        {href ? (
          <Link
            href={href}
            className="group block w-full"
            aria-label={title ? `Open ${title}` : "Open artwork"}
          >
            {inner}
          </Link>
        ) : (
          <div className="group w-full">{inner}</div>
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
