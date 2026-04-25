/**
 * Artist-selectable accent for the Studio → Artworks grid (left rail + hairline).
 * Persisted on `artists.studio_artworks_accent`.
 */

export const STUDIO_ARTWORKS_ACCENTS = [
  "violet",
  "emerald",
  "blue",
  "amber",
  "rose",
  "slate",
] as const;

export type StudioArtworksAccentId = (typeof STUDIO_ARTWORKS_ACCENTS)[number];

export const STUDIO_ARTWORKS_ACCENT_OPTIONS: {
  id: StudioArtworksAccentId;
  label: string;
  /** Swatch fill for account picker */
  swatchClass: string;
}[] = [
  { id: "violet", label: "Violet", swatchClass: "bg-violet-500" },
  { id: "emerald", label: "Emerald", swatchClass: "bg-emerald-500" },
  { id: "blue", label: "Blue", swatchClass: "bg-blue-600" },
  { id: "amber", label: "Amber", swatchClass: "bg-amber-500" },
  { id: "rose", label: "Rose", swatchClass: "bg-rose-500" },
  { id: "slate", label: "Slate", swatchClass: "bg-slate-600" },
];

const ALLOWED = new Set<string>(STUDIO_ARTWORKS_ACCENTS);

export function parseStudioArtworksAccent(
  raw: unknown
): StudioArtworksAccentId {
  const s = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (ALLOWED.has(s)) return s as StudioArtworksAccentId;
  return "violet";
}

/** Tailwind class fragments for ArtworksSection — keep in sync with design tokens */
export function studioArtworksAccentTheme(id: StudioArtworksAccentId) {
  switch (id) {
    case "emerald":
      return {
        borderLeft: "border-l-emerald-500/55",
        hairline: "via-emerald-400/45",
        cardGradientTo: "to-emerald-50/25",
        hoverShadow: "hover:shadow-[0_24px_56px_-28px_rgba(16,185,129,0.14)]",
        hoverRing: "hover:ring-emerald-200/45",
        placeholderRadial:
          "bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.14),transparent_55%)]",
        placeholderIcon: "text-emerald-300/75",
        titleHover:
          "hover:text-emerald-950 hover:underline decoration-emerald-400/45 underline-offset-4",
        recordBtn:
          "bg-emerald-900 px-3 py-2 text-[11px] font-semibold text-white shadow-sm ring-1 ring-emerald-800/30 transition hover:bg-emerald-800",
        noMatchTo: "to-emerald-50/45",
        emptyVia: "via-emerald-50/40",
        emptyHairline: "via-emerald-400/50",
        emptyLabel: "text-emerald-700/85",
        markWrap:
          "from-emerald-500/15 via-emerald-600/10 to-neutral-900/5 ring-emerald-400/25",
        markIcon: "text-emerald-700/85",
      };
    case "blue":
      return {
        borderLeft: "border-l-blue-600/55",
        hairline: "via-blue-400/45",
        cardGradientTo: "to-sky-50/35",
        hoverShadow: "hover:shadow-[0_24px_56px_-28px_rgba(37,99,235,0.14)]",
        hoverRing: "hover:ring-blue-200/45",
        placeholderRadial:
          "bg-[radial-gradient(ellipse_at_50%_0%,rgba(59,130,246,0.14),transparent_55%)]",
        placeholderIcon: "text-blue-300/75",
        titleHover:
          "hover:text-blue-950 hover:underline decoration-blue-400/45 underline-offset-4",
        recordBtn:
          "bg-blue-950 px-3 py-2 text-[11px] font-semibold text-white shadow-sm ring-1 ring-blue-900/25 transition hover:bg-blue-900",
        noMatchTo: "to-sky-50/50",
        emptyVia: "via-sky-50/45",
        emptyHairline: "via-blue-400/50",
        emptyLabel: "text-blue-700/85",
        markWrap:
          "from-blue-500/15 via-blue-600/10 to-neutral-900/5 ring-blue-400/25",
        markIcon: "text-blue-700/85",
      };
    case "amber":
      return {
        borderLeft: "border-l-amber-500/60",
        hairline: "via-amber-400/50",
        cardGradientTo: "to-amber-50/30",
        hoverShadow: "hover:shadow-[0_24px_56px_-28px_rgba(245,158,11,0.16)]",
        hoverRing: "hover:ring-amber-200/55",
        placeholderRadial:
          "bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.16),transparent_55%)]",
        placeholderIcon: "text-amber-400/80",
        titleHover:
          "hover:text-amber-950 hover:underline decoration-amber-500/45 underline-offset-4",
        recordBtn:
          "bg-amber-800 px-3 py-2 text-[11px] font-semibold text-white shadow-sm ring-1 ring-amber-900/25 transition hover:bg-amber-700",
        noMatchTo: "to-amber-50/45",
        emptyVia: "via-amber-50/40",
        emptyHairline: "via-amber-400/55",
        emptyLabel: "text-amber-800/90",
        markWrap:
          "from-amber-500/18 via-amber-600/12 to-neutral-900/5 ring-amber-400/30",
        markIcon: "text-amber-800/85",
      };
    case "rose":
      return {
        borderLeft: "border-l-rose-500/55",
        hairline: "via-rose-400/45",
        cardGradientTo: "to-rose-50/30",
        hoverShadow: "hover:shadow-[0_24px_56px_-28px_rgba(244,63,94,0.13)]",
        hoverRing: "hover:ring-rose-200/45",
        placeholderRadial:
          "bg-[radial-gradient(ellipse_at_50%_0%,rgba(244,63,94,0.13),transparent_55%)]",
        placeholderIcon: "text-rose-300/75",
        titleHover:
          "hover:text-rose-950 hover:underline decoration-rose-400/45 underline-offset-4",
        recordBtn:
          "bg-rose-900 px-3 py-2 text-[11px] font-semibold text-white shadow-sm ring-1 ring-rose-800/25 transition hover:bg-rose-800",
        noMatchTo: "to-rose-50/45",
        emptyVia: "via-rose-50/40",
        emptyHairline: "via-rose-400/50",
        emptyLabel: "text-rose-700/85",
        markWrap:
          "from-rose-500/15 via-rose-600/10 to-neutral-900/5 ring-rose-400/25",
        markIcon: "text-rose-700/85",
      };
    case "slate":
      return {
        borderLeft: "border-l-slate-600/70",
        hairline: "via-slate-400/40",
        cardGradientTo: "to-slate-100/50",
        hoverShadow: "hover:shadow-[0_24px_56px_-28px_rgba(71,85,105,0.12)]",
        hoverRing: "hover:ring-slate-300/55",
        placeholderRadial:
          "bg-[radial-gradient(ellipse_at_50%_0%,rgba(100,116,139,0.14),transparent_55%)]",
        placeholderIcon: "text-slate-400/80",
        titleHover:
          "hover:text-slate-950 hover:underline decoration-slate-400/50 underline-offset-4",
        recordBtn:
          "bg-slate-800 px-3 py-2 text-[11px] font-semibold text-white shadow-sm ring-1 ring-slate-700/30 transition hover:bg-slate-700",
        noMatchTo: "to-slate-100/60",
        emptyVia: "via-slate-100/50",
        emptyHairline: "via-slate-400/45",
        emptyLabel: "text-slate-700/90",
        markWrap:
          "from-slate-500/15 via-slate-600/10 to-neutral-900/5 ring-slate-400/25",
        markIcon: "text-slate-700/85",
      };
    case "violet":
    default:
      return {
        borderLeft: "border-l-violet-500/55",
        hairline: "via-violet-400/45",
        cardGradientTo: "to-violet-50/25",
        hoverShadow:
          "hover:shadow-[0_24px_56px_-28px_rgba(91,33,182,0.12)]",
        hoverRing: "hover:ring-violet-200/40",
        placeholderRadial:
          "bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.12),transparent_55%)]",
        placeholderIcon: "text-violet-300/70",
        titleHover:
          "hover:text-violet-900 hover:underline decoration-violet-400/50 underline-offset-4",
        recordBtn:
          "bg-violet-950 px-3 py-2 text-[11px] font-semibold text-white shadow-sm ring-1 ring-violet-900/20 transition hover:bg-violet-900",
        noMatchTo: "to-violet-50/40",
        emptyVia: "via-violet-50/40",
        emptyHairline: "via-violet-400/50",
        emptyLabel: "text-violet-600/80",
        markWrap:
          "from-violet-500/15 via-violet-600/10 to-neutral-900/5 ring-violet-400/25",
        markIcon: "text-violet-700/80",
      };
  }
}
