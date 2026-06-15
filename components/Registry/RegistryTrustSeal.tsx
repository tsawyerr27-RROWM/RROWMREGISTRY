"use client";

import type { RegistryTrustLevel } from "@/lib/registry-trust-model";
import { registryPremium } from "@/styles/registry-premium";

export type RegistryTrustSealSize = "sm" | "md" | "lg" | "document";

type Props = {
  level: RegistryTrustLevel;
  size?: RegistryTrustSealSize;
  label?: string;
  sublabel?: string;
  className?: string;
};

const sizeMap: Record<
  RegistryTrustSealSize,
  { box: string; svg: number; label: string; sub: string }
> = {
  sm: { box: "h-11 w-11", svg: 44, label: "text-[8px]", sub: "text-[7px]" },
  md: { box: "h-16 w-16", svg: 64, label: "text-[9px]", sub: "text-[8px]" },
  lg: { box: "h-20 w-20", svg: 80, label: "text-[10px]", sub: "text-[8px]" },
  document: {
    box: "h-[7.5rem] w-[7.5rem] print:h-[4.75rem] print:w-[4.75rem]",
    svg: 120,
    label: "text-[8px] print:text-[7px]",
    sub: "text-[7px] print:text-[6px]",
  },
};

function ringClasses(level: RegistryTrustLevel) {
  const s = registryPremium.seal;
  switch (level) {
    case "revoked":
      return {
        outer: s.ringRevoked,
        mid: s.ringRevoked,
        inner: s.ringRevoked,
        fill: s.fillRevoked,
      };
    case "layered":
      return {
        outer: s.ringLayered,
        mid: s.ringLayered,
        inner: s.ringVerified,
        fill: s.fillLayered,
      };
    case "attested":
      return {
        outer: s.ringDocumented,
        mid: s.ringDocumented,
        inner: s.ringVerified,
        fill: s.fillDocumented,
      };
    case "established":
      return {
        outer: s.ringVerified,
        mid: s.ringVerified,
        inner: s.ringVerified,
        fill: s.fillVerified,
      };
    default:
      return {
        outer: s.ringRegistered,
        mid: s.ringRegistered,
        inner: s.ringRegistered,
        fill: s.fillRegistered,
      };
  }
}

export function RegistryTrustSeal({
  level,
  size = "md",
  label,
  sublabel,
  className = "",
}: Props) {
  const dims = sizeMap[size];
  const rings = ringClasses(level);
  const viewBox = 100;
  const cx = 50;
  const cy = 50;

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div
        className={`relative flex shrink-0 items-center justify-center ${dims.box}`}
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
      >
        <svg
          viewBox={`0 0 ${viewBox} ${viewBox}`}
          className="h-full w-full drop-shadow-[0_8px_20px_-12px_rgba(15,23,42,0.25)] print:drop-shadow-none"
          aria-hidden
        >
          <circle
            cx={cx}
            cy={cy}
            r={46}
            className={`${rings.fill} stroke-none`}
          />
          <circle
            cx={cx}
            cy={cy}
            r={44}
            fill="none"
            strokeWidth={1.2}
            className={rings.outer}
          />
          {(level === "attested" ||
            level === "layered" ||
            level === "established") && (
            <circle
              cx={cx}
              cy={cy}
              r={36}
              fill="none"
              strokeWidth={0.9}
              className={rings.mid}
              strokeDasharray={level === "established" ? "none" : "2 3"}
            />
          )}
          {level === "layered" && (
            <circle
              cx={cx}
              cy={cy}
              r={28}
              fill="none"
              strokeWidth={0.7}
              className={rings.inner}
            />
          )}
          {level === "revoked" && (
            <>
              <line
                x1={32}
                y1={32}
                x2={68}
                y2={68}
                strokeWidth={1.5}
                className={rings.outer}
              />
              <line
                x1={68}
                y1={32}
                x2={32}
                y2={68}
                strokeWidth={1.5}
                className={rings.outer}
              />
            </>
          )}
          <text
            x={cx}
            y={level === "revoked" ? 54 : 48}
            textAnchor="middle"
            className="fill-neutral-700 font-serif text-[11px] print:text-[10px]"
            style={{ fontSize: level === "revoked" ? 9 : 11 }}
          >
            RROWM
          </text>
          {level !== "revoked" ? (
            <text
              x={cx}
              y={58}
              textAnchor="middle"
              className="fill-neutral-500 font-sans text-[6px]"
            >
              Registry
            </text>
          ) : null}
        </svg>
      </div>
      {label ? (
        <p
          className={`mt-2 max-w-[11rem] text-center leading-snug text-neutral-500 ${dims.label}`}
        >
          {label}
          {sublabel ? (
            <span className={`mt-0.5 block text-neutral-400 ${dims.sub}`}>
              {sublabel}
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
