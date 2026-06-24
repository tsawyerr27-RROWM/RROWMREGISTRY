"use client";

import { StudioContentSlab, StudioMetricTile } from "@/components/Studio/StudioContentSlab";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fillMessage } from "@/lib/locale-messages";

export type CollectorOverviewSnapshot = {
  held: number;
  verifiedOwnership: number;
  pendingVerification: number;
  pendingTransfer: number;
  ownershipClaims: number;
  certificatesAvailable: number;
  attentionCount: number;
};

type Props = {
  snapshot: CollectorOverviewSnapshot | null;
};

export function CollectorWorkspaceOverview({ snapshot }: Props) {
  const { t } = useLocalePreferences();

  if (!snapshot || snapshot.held === 0) {
    return (
      <StudioContentSlab
        title={t("collector.overview.srOnly")}
        subtitle={t("collector.hero.tooltip")}
      >
        <p className="max-w-2xl text-[15px] leading-relaxed text-neutral-600">
          {t("collector.overview.empty")}
        </p>
      </StudioContentSlab>
    );
  }

  const verifiedPct =
    snapshot.held > 0
      ? Math.round((snapshot.verifiedOwnership / snapshot.held) * 100)
      : 0;

  const notes: string[] = [];

  if (snapshot.pendingTransfer > 0) {
    notes.push(
      fillMessage(t("collector.overview.pendingTransfer"), {
        count: String(snapshot.pendingTransfer),
        units:
          snapshot.pendingTransfer === 1
            ? t("collector.word.transfer")
            : t("collector.word.transfers"),
      })
    );
  }
  if (
    snapshot.pendingVerification > 0 &&
    snapshot.verifiedOwnership < snapshot.held
  ) {
    notes.push(
      fillMessage(t("collector.overview.notVerified"), {
        count: String(snapshot.pendingVerification),
        units:
          snapshot.pendingVerification === 1
            ? t("collector.word.record")
            : t("collector.word.records"),
      })
    );
  }
  if (snapshot.ownershipClaims > 0) {
    notes.push(
      fillMessage(t("collector.overview.openClaims"), {
        count: String(snapshot.ownershipClaims),
        units:
          snapshot.ownershipClaims === 1
            ? t("collector.word.claim")
            : t("collector.word.claims"),
      })
    );
  }
  if (snapshot.certificatesAvailable > 0) {
    notes.push(
      fillMessage(t("collector.overview.withCertificate"), {
        count: String(snapshot.certificatesAvailable),
        units:
          snapshot.certificatesAvailable === 1
            ? t("collector.word.work")
            : t("collector.word.works"),
      })
    );
  }

  return (
    <StudioContentSlab
      title={t("collector.overview.srOnly")}
      subtitle={t("collector.hero.tooltip")}
    >
      <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        <StudioMetricTile
          label={t("collector.hero.ownershipOnRecord")}
          value={snapshot.held}
          hint={fillMessage(t("collector.overview.held"), {
            count: String(snapshot.held),
            units:
              snapshot.held === 1
                ? t("collector.word.work")
                : t("collector.word.works"),
          })}
        />
        <StudioMetricTile
          label={t("collector.hero.verifiedOwnership")}
          value={`${verifiedPct}%`}
          hint={
            snapshot.verifiedOwnership > 0
              ? fillMessage(t("collector.overview.verifiedOwnership"), {
                  count: String(snapshot.verifiedOwnership),
                  units:
                    snapshot.verifiedOwnership === 1
                      ? t("collector.word.record")
                      : t("collector.word.records"),
                })
              : undefined
          }
        />
        <StudioMetricTile
          label={t("collector.hero.continuity")}
          value={snapshot.attentionCount}
          hint={
            snapshot.attentionCount > 0
              ? t("collector.hero.actionSuggested")
              : t("collector.hero.allClear")
          }
        />
      </div>
      {notes.length > 0 ? (
        <ul className="mt-8 space-y-2 border-t border-neutral-900/[0.06] pt-8">
          {notes.map((line) => (
            <li key={line} className="text-[15px] leading-relaxed text-neutral-600">
              {line}
            </li>
          ))}
        </ul>
      ) : null}
    </StudioContentSlab>
  );
}
