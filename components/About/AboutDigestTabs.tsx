"use client";

import { useId, useState } from "react";

import { AboutAudience } from "@/components/About/AboutAudience";
import { AboutHowItWorks } from "@/components/About/AboutHowItWorks";
import { PublicVsPrivate } from "@/components/About/PublicVsPrivate";
import { SystemProperties } from "@/components/About/SystemProperties";
import { WhatRegistryIs } from "@/components/About/WhatRegistryIs";

const TABS = [
  { id: "what", label: "What it is" },
  { id: "how", label: "How it works" },
  { id: "visibility", label: "Visibility" },
  { id: "properties", label: "Properties" },
  { id: "who", label: "Who it is for" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AboutDigestTabs() {
  const baseId = useId();
  const [active, setActive] = useState<TabId>("what");

  return (
    <div
      className="rrowm-atmo-section--reflective relative overflow-hidden rounded-[1.75rem] border border-[color:var(--rrowm-atmo-rim)] shadow-[0_32px_90px_-58px_rgba(15,23,42,0.2)] backdrop-blur-md transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hover:border-[color:color-mix(in_srgb,var(--rrowm-atmo-rim)_82%,rgb(75_72_88))] md:hover:shadow-[0_34px_92px_-56px_rgba(15,23,42,0.21)]"
      aria-label="About the registry"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.32]"
        aria-hidden
      >
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-gradient-to-bl from-stone-200/18 via-transparent to-transparent blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-gradient-to-tr from-slate-200/12 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative border-b border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_65%,transparent)] px-4 py-4 md:px-6 md:py-5">
        <div
          className="flex flex-wrap gap-2 md:gap-2.5"
          role="tablist"
          aria-label="Sections"
        >
          {TABS.map((tab) => {
            const selected = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${baseId}-${tab.id}-tab`}
                aria-selected={selected}
                aria-controls={`${baseId}-${tab.id}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tab.id)}
                className={`rounded-full px-3.5 py-2 text-left text-[13px] font-medium transition-[transform,opacity,background-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:px-4 md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rrowm-base-soft)] ${
                  selected
                    ? "bg-neutral-900 text-white shadow-[0_10px_36px_-28px_rgba(0,0,0,0.45)]"
                    : "border border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel)_78%,transparent)] text-neutral-700 hover:bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-raise)_82%,transparent)] hover:text-neutral-950 active:scale-[0.99]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative px-4 py-9 md:px-8 md:py-11 lg:px-10 lg:py-12">
        <div
          id={`${baseId}-what-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-what-tab`}
          hidden={active !== "what"}
          className={active === "what" ? "block" : "hidden"}
        >
          <WhatRegistryIs density="digest" />
        </div>
        <div
          id={`${baseId}-how-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-how-tab`}
          hidden={active !== "how"}
          className={active === "how" ? "block" : "hidden"}
        >
          <AboutHowItWorks density="digest" />
        </div>
        <div
          id={`${baseId}-visibility-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-visibility-tab`}
          hidden={active !== "visibility"}
          className={active === "visibility" ? "block" : "hidden"}
        >
          <PublicVsPrivate density="digest" />
        </div>
        <div
          id={`${baseId}-properties-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-properties-tab`}
          hidden={active !== "properties"}
          className={active === "properties" ? "block" : "hidden"}
        >
          <SystemProperties density="digest" />
        </div>
        <div
          id={`${baseId}-who-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-who-tab`}
          hidden={active !== "who"}
          className={active === "who" ? "block" : "hidden"}
        >
          <AboutAudience density="digest" />
        </div>
      </div>
    </div>
  );
}
