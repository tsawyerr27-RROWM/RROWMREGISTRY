"use client";

import type { ReactNode } from "react";

import { rrowmTab, rrowmTabClass } from "@/styles/rrowm-theme";

export type RrowmTabItem<T extends string> = {
  id: T;
  label: ReactNode;
  count?: number;
};

type Props<T extends string> = {
  items: readonly RrowmTabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  variant?: "tonal" | "dark";
  className?: string;
  ariaLabel?: string;
};

export function RrowmTabs<T extends string>({
  items,
  activeId,
  onChange,
  variant = "tonal",
  className = "",
  ariaLabel = "Tabs",
}: Props<T>) {
  return (
    <div className={`${rrowmTab.list} ${className}`.trim()} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={rrowmTabClass(active, variant)}
          >
            <span>{item.label}</span>
            {item.count != null ? (
              <span
                className={`ml-2 tabular-nums ${
                  active && variant === "dark"
                    ? "text-white/80"
                    : active
                      ? "text-[color:color-mix(in_srgb,var(--rrowm-zone-secondary)_70%,transparent)]"
                      : "text-neutral-500"
                }`}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
