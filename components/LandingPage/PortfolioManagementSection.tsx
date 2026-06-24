"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";

import {
  narrativeLayout,
} from "@/styles/narrative-layout";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

const ease = [0.22, 1, 0.36, 1] as const;

type RoleId = "artist" | "gallery" | "collector";

type Capability = {
  title: string;
  detail: string;
  preview: string;
};

type RoleConfig = {
  id: RoleId;
  label: string;
  workspace: string;
  accentVar: string;
  capabilities: Capability[];
};

const ROLES: RoleConfig[] = [
  {
    id: "artist",
    label: "Artist studio",
    workspace: "Studio",
    accentVar: "--rrowm-accent-artist",
    capabilities: [
      {
        title: "Portfolio roster",
        detail: "Every represented work in one view, linked to its public catalogue entry.",
        preview: "12 works on file · 3 awaiting certificate",
      },
      {
        title: "Certificate issuance",
        detail: "Issue and track authenticity documents against the same registry identity.",
        preview: "Certificate tied to registry row",
      },
      {
        title: "Chronology actions",
        detail: "File milestones and custody steps as continuity grows over time.",
        preview: "Ownership transfer filed · 2d ago",
      },
      {
        title: "Visibility controls",
        detail: "Public catalogue layer plus authenticated depth where you choose.",
        preview: "Public listing · Private notes on file",
      },
    ],
  },
  {
    id: "gallery",
    label: "Gallery desk",
    workspace: "Institutional studio",
    accentVar: "--rrowm-accent-gallery",
    capabilities: [
      {
        title: "Artist roster",
        detail: "Associated artists and represented works in one institutional portfolio.",
        preview: "8 artists · 34 works represented",
      },
      {
        title: "Invitations & verification",
        detail: "Invite artists, track acceptance, and surface readiness before listings go public.",
        preview: "2 invites pending · 1 verified this week",
      },
      {
        title: "Record completeness",
        detail: "See which works need certificates, chronology, or participant confirmation.",
        preview: "4 works need certificate on file",
      },
      {
        title: "Institutional association",
        detail: "Gallery filings appear on the chronology where participants confirm them.",
        preview: "Exhibition association filed",
      },
    ],
  },
  {
    id: "collector",
    label: "Collector studio",
    workspace: "Collector studio",
    accentVar: "--rrowm-accent-collector",
    capabilities: [
      {
        title: "Holdings ledger",
        detail: "Verified ownership, transfers, and claims structured for your studio.",
        preview: "6 holdings · 2 transfers on file",
      },
      {
        title: "Private vault",
        detail: "Condition notes, documents, and supporting material behind sign-in.",
        preview: "Vault item · Invoice on file",
      },
      {
        title: "Provenance continuation",
        detail: "Accept custody invitations and extend the chronology when works change hands.",
        preview: "Provenance invite · Awaiting acceptance",
      },
      {
        title: "Value & activity",
        detail: "Declared value events and ownership activity alongside each work.",
        preview: "Value event filed · Q1 2026",
      },
    ],
  },
];

function RolePreview({
  role,
  activeIndex,
  onHoverIndex,
}: {
  role: RoleConfig;
  activeIndex: number;
  onHoverIndex: (index: number | null) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={role.id}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: reduce ? 0 : 0.42, ease }}
      className="relative overflow-hidden rounded-[1.35rem] border border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel)_82%,transparent)] shadow-[0_16px_40px_-20px_rgba(15,23,42,0.1)] backdrop-blur-md"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-12 h-48 w-48 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle, hsl(var(${role.accentVar}) / 0.22), transparent 68%)`,
        }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(214,226,245,0.38),transparent_70%)] blur-3xl"
        aria-hidden
        animate={reduce ? undefined : { x: [0, 8, 0], y: [0, -6, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="flex items-center justify-between gap-3 border-b px-5 py-4"
        style={{
          borderColor: `hsl(var(${role.accentVar}) / 0.18)`,
          backgroundColor: `hsl(var(${role.accentVar}) / 0.06)`,
        }}
        layout
      >
        <span className="text-sm font-medium text-neutral-800">{role.workspace}</span>
        <motion.span
          key={`${role.id}-pulse`}
          className="flex items-center gap-2 text-[11px] font-medium text-neutral-500"
          initial={false}
          animate={{ opacity: [0.72, 1, 0.72] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/30" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600/70" />
          </span>
          Linked to catalogue
        </motion.span>
      </motion.div>

      <motion.div layout className="space-y-3 p-5 md:p-6">
        <AnimatePresence mode="popLayout">
          {role.capabilities.map((cap, i) => {
            const active = activeIndex === i;
            return (
              <motion.button
                key={`${role.id}-${cap.title}`}
                type="button"
                layout
                initial={reduce ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: reduce ? 0 : 0.38,
                  delay: reduce ? 0 : i * 0.05,
                  ease,
                }}
                onMouseEnter={() => onHoverIndex(i)}
                onMouseLeave={() => onHoverIndex(null)}
                onFocus={() => onHoverIndex(i)}
                onBlur={() => onHoverIndex(null)}
                className={`w-full rounded-2xl border px-4 py-3.5 text-left transition-[border-color,background-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  active
                    ? "border-[color:color-mix(in_srgb,var(--rrowm-atmo-rim)_82%,rgb(55_48_43))] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-raise)_78%,transparent)] shadow-[0_16px_44px_-34px_rgba(15,23,42,0.16)] md:scale-[1.01]"
                    : "border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_80%,transparent)] hover:border-[color:color-mix(in_srgb,var(--rrowm-atmo-rim)_78%,rgb(55_48_43))] hover:bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-raise)_74%,transparent)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-medium text-neutral-900">{cap.title}</p>
                    <p className="mt-1.5 text-[15px] leading-[1.68] text-neutral-600">
                      {cap.detail}
                    </p>
                  </div>
                  <motion.span
                    aria-hidden
                    className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400/70"
                    animate={
                      active && !reduce
                        ? { scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }
                        : { scale: 1, opacity: 0.35 }
                    }
                    transition={{ duration: 1.6, repeat: active ? Infinity : 0, ease: "easeInOut" }}
                  />
                </div>
                <AnimatePresence>
                  {active ? (
                    <motion.p
                      initial={reduce ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={reduce ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease }}
                      className="mt-3 overflow-hidden border-t border-[color-mix(in_srgb,var(--rrowm-atmo-rim)_55%,transparent)] pt-3 text-xs font-medium text-neutral-500"
                    >
                      {cap.preview}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function PortfolioManagementSection() {
  const reduce = useReducedMotion();
  const { t } = useLocalePreferences();
  const [activeRoleId, setActiveRoleId] = useState<RoleId>("artist");
  const [hoverIndex, setHoverIndex] = useState<number | null>(0);

  const activeRole = ROLES.find((r) => r.id === activeRoleId) ?? ROLES[0];
  const highlightedIndex = hoverIndex ?? 0;

  const handleRoleChange = useCallback((id: RoleId) => {
    setActiveRoleId(id);
    setHoverIndex(0);
  }, []);

  return (
    <section
      className="rrowm-atmo-section--blend"
      aria-labelledby="landing-portfolio-mgmt-heading"
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-px rrowm-atmo-section__hairline"
        aria-hidden
        initial={false}
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="rrowm-atmo-section__ambient pointer-events-none left-1/2 top-1/3 h-[min(28rem,55vh)] w-[min(70vw,36rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(228,216,238,0.28),transparent_68%)] blur-3xl"
        aria-hidden
        animate={reduce ? undefined : { scale: [1, 1.04, 1], opacity: [0.5, 0.72, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className={`${narrativeLayout.gutter} relative ${narrativeLayout.sectionPadYTight}`}>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-5">
            <h2
              id="landing-portfolio-mgmt-heading"
              className="max-w-[min(100%,28rem)] font-serif text-[clamp(1.6rem,2.8vw,2.35rem)] font-normal leading-[1.16] tracking-tight text-neutral-950"
            >
              {t("landing.portfolio.title")}
            </h2>

            <motion.div
              className="mt-7 flex flex-wrap gap-2.5"
              role="tablist"
              aria-label="Portfolio role"
            >
              {ROLES.map((role) => {
                const selected = role.id === activeRoleId;
                return (
                  <button
                    key={role.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => handleRoleChange(role.id)}
                    className={`relative flex items-center gap-2.5 rounded-full py-2.5 pl-3 pr-4 text-sm font-medium transition-colors duration-300 ${
                      selected ? "text-neutral-950" : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    {selected ? (
                      <motion.span
                        layoutId="portfolio-role-pill"
                        className="absolute inset-0 rounded-full border shadow-[0_12px_36px_-28px_rgba(15,23,42,0.18)]"
                        style={{
                          borderColor: `hsl(var(${role.accentVar}) / 0.28)`,
                          backgroundColor: `hsl(var(${role.accentVar}) / 0.1)`,
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                    <span
                      className="relative z-[1] h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/80"
                      style={{ backgroundColor: `hsl(var(${role.accentVar}))` }}
                      aria-hidden
                    />
                    <span className="relative z-[1]">{role.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <RolePreview
                key={activeRole.id}
                role={activeRole}
                activeIndex={highlightedIndex}
                onHoverIndex={setHoverIndex}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
