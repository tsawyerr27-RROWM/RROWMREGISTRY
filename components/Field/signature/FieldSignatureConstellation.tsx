"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { translate, type MessageKey } from "@/lib/locale-messages";
import {
  fieldExplorerCreativesHref,
  fieldExplorerOrganisationsHref,
  fieldExplorerRecordsHref,
  fieldOpportunitiesHref,
} from "@/lib/field-nav";
import { useConstellationPulseSync } from "@/hooks/useConstellationPulseSync";
import { useFieldConstellationBoot } from "@/hooks/useFieldConstellationBoot";
import { useFieldConstellationIdle } from "@/hooks/useFieldConstellationIdle";
import { useFieldIntelligence } from "@/hooks/useFieldIntelligence";
import { useFieldMotion } from "@/hooks/useFieldMotion";
import type { FieldClusterIntel } from "@/lib/fetch-field-cultural-signals";
import { clusterIntelLines } from "@/lib/field-cluster-intel-copy";
import { emitFieldIntelEvent } from "@/lib/field-intelligence-events";
import { fieldSignature } from "@/styles/field-signature";

import { FieldConstellationNetwork } from "./FieldConstellationNetwork";
import { CONSTELLATION_STAGGER_MS } from "./field-constellation-network";
import type { ClusterId } from "./field-constellation-types";

type ClusterConfig = {
  id: ClusterId;
  href: string;
  signal: string;
  placement: string;
  bloomClass: string;
  railKey: `field.signature.cluster.${ClusterId}.rail`;
  titleKey: `field.signature.cluster.${ClusterId}.title`;
  descriptorKey: `field.signature.cluster.${ClusterId}.descriptor`;
  classificationKey: `field.signature.cluster.${ClusterId}.classification`;
  statusKey: `field.signature.cluster.${ClusterId}.status`;
  indexKey: `field.signature.cluster.${ClusterId}.index`;
};

const CLUSTERS: ClusterConfig[] = [
  {
    id: "records",
    href: fieldExplorerRecordsHref(),
    signal: fieldSignature.signals.records,
    placement: "field-signature-constellation__cell--records",
    bloomClass: "field-signature-constellation__bloom--records",
    railKey: "field.signature.cluster.records.rail",
    titleKey: "field.signature.cluster.records.title",
    descriptorKey: "field.signature.cluster.records.descriptor",
    classificationKey: "field.signature.cluster.records.classification",
    statusKey: "field.signature.cluster.records.status",
    indexKey: "field.signature.cluster.records.index",
  },
  {
    id: "creatives",
    href: fieldExplorerCreativesHref(),
    signal: fieldSignature.signals.creatives,
    placement: "field-signature-constellation__cell--creatives",
    bloomClass: "field-signature-constellation__bloom--creatives",
    railKey: "field.signature.cluster.creatives.rail",
    titleKey: "field.signature.cluster.creatives.title",
    descriptorKey: "field.signature.cluster.creatives.descriptor",
    classificationKey: "field.signature.cluster.creatives.classification",
    statusKey: "field.signature.cluster.creatives.status",
    indexKey: "field.signature.cluster.creatives.index",
  },
  {
    id: "organisations",
    href: fieldExplorerOrganisationsHref(),
    signal: fieldSignature.signals.organisations,
    placement: "field-signature-constellation__cell--organisations",
    bloomClass: "field-signature-constellation__bloom--organisations",
    railKey: "field.signature.cluster.organisations.rail",
    titleKey: "field.signature.cluster.organisations.title",
    descriptorKey: "field.signature.cluster.organisations.descriptor",
    classificationKey: "field.signature.cluster.organisations.classification",
    statusKey: "field.signature.cluster.organisations.status",
    indexKey: "field.signature.cluster.organisations.index",
  },
  {
    id: "opportunities",
    href: fieldOpportunitiesHref(),
    signal: fieldSignature.signals.opportunities,
    placement: "field-signature-constellation__cell--opportunities",
    bloomClass: "field-signature-constellation__bloom--opportunities",
    railKey: "field.signature.cluster.opportunities.rail",
    titleKey: "field.signature.cluster.opportunities.title",
    descriptorKey: "field.signature.cluster.opportunities.descriptor",
    classificationKey: "field.signature.cluster.opportunities.classification",
    statusKey: "field.signature.cluster.opportunities.status",
    indexKey: "field.signature.cluster.opportunities.index",
  },
];

type SlabProps = {
  cluster: ClusterConfig;
  booted: boolean;
  motionEnabled: boolean;
  isActive: boolean;
  isIdleBright: boolean;
  isIdleFlicker: boolean;
  intelLines: string[];
  onActivate: (id: ClusterId | null) => void;
};

function ConstellationSlab({
  cluster,
  booted,
  motionEnabled,
  isActive,
  isIdleBright,
  isIdleFlicker,
  intelLines,
  onActivate,
}: SlabProps) {
  const { region } = useLocalePreferences();
  const copy = (key: MessageKey) => translate(key, region.lang);
  const stagger = CONSTELLATION_STAGGER_MS[cluster.id];

  return (
    <div
      className={`field-signature-constellation__cell ${cluster.placement}${isActive ? " field-signature-constellation__cell--active" : ""}${isIdleBright ? " field-signature-constellation__cell--idle-bright" : ""}${booted && motionEnabled ? " field-signature-constellation__cell--booted" : ""}`}
      data-cluster={cluster.id}
      style={
        booted && motionEnabled
          ? ({ "--constellation-stagger": `${stagger}ms` } as CSSProperties)
          : undefined
      }
      onMouseEnter={() => onActivate(cluster.id)}
      onMouseLeave={() => onActivate(null)}
      onFocus={() => onActivate(cluster.id)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          onActivate(null);
        }
      }}
    >
      <span
        className={`field-signature-constellation__regional-bloom ${cluster.bloomClass}`}
        aria-hidden
      />

      <Link
        href={cluster.href}
        className={`${fieldSignature.surfaces.clusterSlab} field-signature-slab field-signature-cluster-slab--live group block h-full ${cluster.signal}`}
      >
        <div className="field-signature-cluster-intel">
          {intelLines.map((line, lineIndex) => (
            <p key={`${cluster.id}-${lineIndex}`} className="field-signature-cluster-intel__line">
              {line}
            </p>
          ))}
        </div>

        <span className="field-signature-slab__signal-rail" aria-hidden />
        <span className="field-signature-cluster-slab__illumination" aria-hidden />
        {booted && motionEnabled ? (
          <span className="field-signature-cluster-slab__trace" aria-hidden />
        ) : null}

        <span className="field-signature-slab-mark field-signature-slab-mark--tl" aria-hidden />
        <span className="field-signature-slab-mark field-signature-slab-mark--tr" aria-hidden />
        <span className="field-signature-slab-mark field-signature-slab-mark--bl" aria-hidden />
        <span className="field-signature-slab-mark field-signature-slab-mark--br" aria-hidden />
        <span className="field-signature-slab-filing field-signature-slab-filing--index" aria-hidden />

        <div className="field-signature-cluster-slab__content">
          <div
            className={`${fieldSignature.type.slabClassificationRail} field-signature-slab-classification${isIdleFlicker ? " field-signature-slab-classification--idle-flicker" : ""}`}
          >
            <span>{copy(cluster.classificationKey)}</span>
            <span className="field-signature-slab-classification__sep" aria-hidden />
            <span>{copy(cluster.statusKey)}</span>
          </div>

          <div className="field-signature-slab-index-line" aria-hidden />

          <p className={`${fieldSignature.type.slabMeta} mt-3`}>{copy(cluster.railKey)}</p>
          <h2 className={`${fieldSignature.type.slabTitle} mt-2`}>{copy(cluster.titleKey)}</h2>
          <p className={fieldSignature.type.slabDescriptor}>{copy(cluster.descriptorKey)}</p>

          <div className="mt-5 flex items-end justify-between gap-3">
            <div className={`${fieldSignature.surfaces.signalLine} field-signature-cluster-slab__spine`} aria-hidden />
            <span className={fieldSignature.type.slabIndex}>{copy(cluster.indexKey)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function FieldSignatureConstellation({
  clusterIntel,
}: {
  clusterIntel: FieldClusterIntel;
}) {
  const { t, region } = useLocalePreferences();
  const { motionEnabled } = useFieldMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const booted = useFieldConstellationBoot(motionEnabled, sectionRef);
  const idleEvent = useFieldConstellationIdle(motionEnabled && booted, booted);
  const { activeCluster, searchFocus } = useFieldIntelligence();

  useConstellationPulseSync(motionEnabled && booted, booted);

  useEffect(() => {
    if (!idleEvent) return;
    if (idleEvent.type === "signal-packet" || idleEvent.type === "edge-pulse") {
      emitFieldIntelEvent({ type: "idle_packet", edgeId: idleEvent.edgeId });
    }
  }, [idleEvent]);

  const onActivate = (id: ClusterId | null) => {
    emitFieldIntelEvent({ type: "node_activation", clusterId: id });
  };

  return (
    <section
      ref={sectionRef}
      className={`field-signature-constellation relative px-4 py-14 sm:px-6 md:py-20 lg:px-8${booted && motionEnabled ? " field-signature-constellation--boot" : ""}${motionEnabled && !booted ? " field-signature-constellation--pending" : ""}${searchFocus ? " field-signature-constellation--query" : ""}`}
      aria-label={t("field.signature.constellation.aria")}
      data-active-cluster={activeCluster ?? undefined}
      data-idle-event={idleEvent ? `${idleEvent.type}:${"edgeId" in idleEvent ? idleEvent.edgeId : idleEvent.clusterId}` : undefined}
    >
      <div className="field-signature-constellation__atmosphere" aria-hidden>
        <div className="field-signature-constellation__fog" />
        <div className="field-signature-constellation__fog-bleed field-signature-constellation__fog-bleed--records" />
        <div className="field-signature-constellation__fog-bleed field-signature-constellation__fog-bleed--creatives" />
        <div className="field-signature-constellation__fog-bleed field-signature-constellation__fog-bleed--organisations" />
        <div className="field-signature-constellation__fog-bleed field-signature-constellation__fog-bleed--opportunities" />
        <div className="field-signature-constellation__foreground-texture">
          <div className="field-signature-constellation__grain" />
          <div className="field-signature-constellation__halftone" />
          <div className="field-signature-constellation__scan" />
          <div className="field-signature-constellation__scratches" />
          <div className="field-signature-constellation__markers" />
        </div>
      </div>

      <FieldConstellationNetwork
        activeCluster={activeCluster}
        motionEnabled={motionEnabled && booted}
        booted={booted}
        idleEvent={idleEvent}
      />

      <div className="field-signature-constellation__grid relative z-10 mx-auto max-w-[min(100%,72rem)]">
        {CLUSTERS.map((cluster) => (
          <ConstellationSlab
            key={cluster.id}
            cluster={cluster}
            booted={booted}
            motionEnabled={motionEnabled}
            isActive={activeCluster === cluster.id}
            intelLines={clusterIntelLines(
              cluster.id,
              clusterIntel,
              (key) => t(key),
              region.locale
            )}
            isIdleBright={
              idleEvent?.type === "node-brighten" && idleEvent.clusterId === cluster.id
            }
            isIdleFlicker={
              idleEvent?.type === "rail-flicker" && idleEvent.clusterId === cluster.id
            }
            onActivate={onActivate}
          />
        ))}
      </div>
    </section>
  );
}
