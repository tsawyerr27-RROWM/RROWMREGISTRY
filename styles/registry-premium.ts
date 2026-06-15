/**
 * Registry premium surfaces — certificate, trust seals, provenance evidence.
 * Visual tokens only; pairs with `registry-*` utilities in globals.css where noted.
 */

export const registryPremium = {
  paper: {
    screen: "bg-[#f7f4ef]",
    panel: "bg-[#fafaf8]",
    gradient:
      "bg-gradient-to-br from-[#f7f4ef] via-[#fafaf8] to-[#f0ebe3]",
  },
  ink: {
    primary: "text-neutral-950",
    secondary: "text-neutral-700",
    muted: "text-neutral-500",
    mono: "font-mono tracking-[0.06em] text-neutral-800",
  },
  frame: {
    outer:
      "rounded-sm border border-neutral-300/70 bg-white shadow-[0_36px_88px_-36px_rgba(15,23,42,0.12)] print:shadow-none",
    inner: "border border-neutral-300/50",
    ornament: "registry-document-ornament",
  },
  seal: {
    ringRegistered: "stroke-neutral-400/70",
    ringVerified: "stroke-neutral-700/85",
    ringDocumented: "stroke-neutral-800/90",
    ringLayered: "stroke-emerald-900/75",
    ringRevoked: "stroke-red-800/60",
    fillRegistered: "fill-neutral-50/80",
    fillVerified: "fill-neutral-50/90",
    fillDocumented: "fill-[#f7f4ef]/95",
    fillLayered: "fill-emerald-950/[0.03]",
    fillRevoked: "fill-red-50/40",
  },
  document: {
    sheet: "certificate-print-sheet registry-print-sheet",
    label:
      "text-sm font-medium text-neutral-600 print:text-[8.5px]",
    hashBox:
      "mt-3 rounded-md border border-neutral-200/90 bg-white/90 px-3.5 py-3 font-mono text-[10px] leading-relaxed tracking-[0.06em] text-neutral-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] print:mt-2 print:px-2.5 print:py-2 print:text-[9px] print:leading-snug",
    title:
      "font-serif font-normal tracking-tight text-neutral-950",
  },
  print: {
    pageClass: "registry-print-page",
    a4Width: "print:w-[190mm] print:max-w-[190mm]",
    a4Aspect: "print:aspect-[210/297]",
  },
  /** Route-native OG cards (`opengraph-image.tsx`) — inline styles only. */
  og: {
    width: 1200,
    height: 630,
    paper: {
      top: "#f7f4ef",
      mid: "#fafaf8",
      bottom: "#f0ebe3",
    },
    ink: {
      primary: "#0a0a0a",
      secondary: "#404040",
      muted: "#737373",
      faint: "#a3a3a3",
    },
    frame: {
      outer: "#d4d4d4",
      inner: "#e5e5e5",
    },
    seal: {
      fillRegistered: "#fafaf8",
      fillVerified: "#f7f4ef",
      fillEstablished: "#f2f7f4",
      ringRegistered: "rgba(163, 163, 163, 0.85)",
      ringVerified: "rgba(64, 64, 64, 0.85)",
      ringEstablished: "rgba(23, 64, 53, 0.78)",
    },
    wordmark: "RROWM",
  },
} as const;

export type RegistryPremiumToken = typeof registryPremium;
