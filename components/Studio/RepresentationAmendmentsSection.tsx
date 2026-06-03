"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import ModalShell from "@/components/ui/ModalShell";
import { GovernanceSectionShell } from "@/components/Studio/GovernanceSectionShell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fillMessage } from "@/lib/locale-messages";
import { translateRepresentationPhrase } from "@/lib/representation-i18n";
import type { RepresentationAmendmentListItem } from "@/lib/representation-amendments";
import {
  buildProposedChangesPayload,
  proposedChangeFieldLabel,
} from "@/lib/representation-amendments";
import { workspace } from "@/styles/workspace-design";

export type AmendmentArtworkOption = {
  id: string;
  title: string | null;
  registry_id: string | null;
};

type Props = {
  viewer: "artist" | "gallery";
  items: RepresentationAmendmentListItem[];
  artworkOptions: AmendmentArtworkOption[];
  showRequestButton: boolean;
  busyAmendmentId: string | null;
  onRequest: (payload: {
    artwork_id: string;
    notes: string;
    proposed_changes: ReturnType<typeof buildProposedChangesPayload>;
  }) => void | Promise<void>;
  onResolve: (
    amendmentId: string,
    accept: boolean,
    resolutionNotes: string | null
  ) => void | Promise<void>;
  onWithdraw: (amendmentId: string) => void | Promise<void>;
  artistNamesById?: Record<string, string>;
  anchorId?: string;
};

function formatWhen(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function statusLabel(
  s: RepresentationAmendmentListItem["status"],
  t: ReturnType<typeof useLocalePreferences>["t"]
): string {
  switch (s) {
    case "pending":
      return translateRepresentationPhrase("amendmentPendingReview", t);
    case "accepted":
      return t("studio.amendments.statusAccepted");
    case "declined":
      return t("studio.amendments.statusDeclined");
    case "withdrawn":
      return t("studio.amendments.statusWithdrawn");
    default:
      return s;
  }
}

function needsViewerResponse(
  viewer: "artist" | "gallery",
  row: RepresentationAmendmentListItem
): boolean {
  if (row.status !== "pending") return false;
  if (row.requester_role === "artist") return viewer === "gallery";
  return viewer === "artist";
}

function viewerIsRequester(
  viewer: "artist" | "gallery",
  row: RepresentationAmendmentListItem
): boolean {
  if (row.status !== "pending") return false;
  if (row.requester_role === "artist") return viewer === "artist";
  return viewer === "gallery";
}

const primaryBtn =
  "rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition enabled:hover:bg-neutral-800 disabled:opacity-50";
const secondaryBtn =
  "rounded-xl border border-neutral-900/[0.1] bg-white/90 px-4 py-2.5 text-xs font-medium text-neutral-800 transition enabled:hover:bg-neutral-50 disabled:opacity-50";

/**
 * Phase D: amendment requests between artist and institution.
 */
export function RepresentationAmendmentsSection({
  viewer,
  items,
  artworkOptions,
  artistNamesById,
  anchorId = "artist-representation-amendments",
  showRequestButton,
  busyAmendmentId,
  onRequest,
  onResolve,
  onWithdraw,
}: Props) {
  const { t } = useLocalePreferences();
  const [requestOpen, setRequestOpen] = useState(false);
  const [artworkId, setArtworkId] = useState("");
  const [notes, setNotes] = useState("");
  const [fTitle, setFTitle] = useState("");
  const [fYear, setFYear] = useState("");
  const [fMedium, setFMedium] = useState("");
  const [fDimensions, setFDimensions] = useState("");
  const [fDescription, setFDescription] = useState("");
  const [requestBusy, setRequestBusy] = useState(false);
  const [requestErr, setRequestErr] = useState<string | null>(null);
  const [resolutionDraft, setResolutionDraft] = useState<Record<string, string>>(
    {}
  );

  const pendingForViewer = useMemo(
    () => items.filter((r) => needsViewerResponse(viewer, r)),
    [items, viewer]
  );

  const openRequestModal = () => {
    setRequestErr(null);
    setNotes("");
    setFTitle("");
    setFYear("");
    setFMedium("");
    setFDimensions("");
    setFDescription("");
    setArtworkId(artworkOptions[0]?.id ?? "");
    setRequestOpen(true);
  };

  const submitRequest = async () => {
    setRequestErr(null);
    if (!artworkId.trim()) {
      setRequestErr(t("studio.amendments.chooseWork"));
      return;
    }
    if (!notes.trim()) {
      setRequestErr(t("studio.amendments.noteRequired"));
      return;
    }
    setRequestBusy(true);
    try {
      await onRequest({
        artwork_id: artworkId.trim(),
        notes: notes.trim(),
        proposed_changes: buildProposedChangesPayload({
          title: fTitle,
          year: fYear,
          medium: fMedium,
          dimensions: fDimensions,
          description: fDescription,
        }),
      });
      setRequestOpen(false);
    } catch {
      setRequestErr(t("studio.amendments.requestFailed"));
    } finally {
      setRequestBusy(false);
    }
  };

  if (!showRequestButton && items.length === 0) return null;

  return (
    <>
      <GovernanceSectionShell
        id={anchorId}
        eyebrow={t("studio.amendments.eyebrow")}
        title={t("studio.amendments.title")}
        description={t("studio.amendments.description")}
        badge={
          pendingForViewer.length > 0 ? (
            <span className={workspace.card.pill}>
              {pendingForViewer.length === 1
                ? t("studio.amendments.responseNeeded")
                : fillMessage(t("studio.amendments.responsesNeeded"), {
                    count: String(pendingForViewer.length),
                  })}
            </span>
          ) : null
        }
        actions={
          showRequestButton && artworkOptions.length > 0 ? (
            <button type="button" onClick={openRequestModal} className={primaryBtn}>
              {t("studio.amendments.newRequest")}
            </button>
          ) : null
        }
      >
        {items.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("studio.amendments.empty")}</p>
        ) : (
          <ul className="space-y-4">
            {items.map((row) => {
              const art = row.artwork;
              const title = art?.title?.trim() || t("studio.amendments.workFallback");
              const reg = art?.registry_id?.trim();
              const gname = row.gallery?.name?.trim() || t("studio.amendments.institution");
              const busy = busyAmendmentId === row.id;
              const resolver = needsViewerResponse(viewer, row);
              const requester = viewerIsRequester(viewer, row);
              const resNote = resolutionDraft[row.id] ?? "";

              const aid = row.artwork?.artist_id ?? null;
              const artistNm =
                viewer === "gallery" && aid && artistNamesById
                  ? artistNamesById[aid] ?? null
                  : null;

              return (
                <li
                  key={row.id}
                  className="rounded-xl border border-neutral-900/[0.06] bg-white/70 p-5 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.12)] backdrop-blur-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium text-neutral-900">
                        {title}
                      </p>
                      {reg ? (
                        <p className={`mt-0.5 ${workspace.type.registryId}`}>
                          {reg}
                        </p>
                      ) : null}
                      <p className={`mt-1.5 ${workspace.type.metaQuiet}`}>
                        {viewer === "artist"
                          ? gname
                          : artistNm || t("studio.amendments.representedArtist")}
                        {" · "}
                        {row.requester_role === "artist"
                          ? t("studio.amendments.roleArtist")
                          : t("studio.amendments.roleInstitution")}{" "}
                        {t("studio.amendments.initiated")} · {formatWhen(row.created_at)}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                        {row.notes}
                      </p>
                      {Object.keys(row.proposed_changes).length > 0 ? (
                        <ul className="mt-3 space-y-1 rounded-lg border border-neutral-900/[0.05] bg-neutral-50/60 px-3 py-2.5 text-sm text-neutral-700">
                          {Object.entries(row.proposed_changes).map(([k, v]) => (
                            <li key={k}>
                              <span className="font-medium text-neutral-900">
                                {proposedChangeFieldLabel(k)}
                              </span>
                              : {String(v)}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-500">
                        {statusLabel(row.status, t)}
                      </p>
                      {row.resolution_notes ? (
                        <p className={`mt-1 ${workspace.type.metaQuiet}`}>
                          {t("studio.amendments.resolution")} {row.resolution_notes}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:items-end sm:min-w-[200px]">
                      {reg ? (
                        <Link
                          href={`/artwork/${encodeURIComponent(reg)}`}
                          className="text-xs font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
                        >
                          {t("studio.amendments.viewPublicRecord")}
                        </Link>
                      ) : null}
                      {row.status === "pending" && resolver ? (
                        <>
                          <label className="block w-full">
                            <span className="sr-only">
                              {t("studio.amendments.responseNote")}
                            </span>
                            <input
                              type="text"
                              value={resNote}
                              placeholder={t("studio.amendments.responsePlaceholder")}
                              onChange={(e) =>
                                setResolutionDraft((d) => ({
                                  ...d,
                                  [row.id]: e.target.value,
                                }))
                              }
                              className={workspace.modal.field}
                            />
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void onResolve(row.id, true, resNote.trim() || null)
                              }
                              className={primaryBtn}
                            >
                              {busy ? "…" : t("studio.amendments.acceptOnFile")}
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void onResolve(row.id, false, resNote.trim() || null)
                              }
                              className={secondaryBtn}
                            >
                              {t("studio.amendments.decline")}
                            </button>
                          </div>
                        </>
                      ) : null}
                      {row.status === "pending" && requester ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void onWithdraw(row.id)}
                          className={secondaryBtn}
                        >
                          {t("studio.amendments.withdrawRequest")}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className={`${workspace.type.metaQuiet} mt-6 border-t border-neutral-900/[0.06] pt-4`}>
          {translateRepresentationPhrase("priorFilingsRemainVisible", t)}
        </p>
      </GovernanceSectionShell>

      <ModalShell
        isOpen={requestOpen}
        onClose={() => !requestBusy && setRequestOpen(false)}
        tone="silver"
      >
        <div className="max-h-[85vh] overflow-y-auto">
          <h3 className="font-serif text-xl font-normal text-neutral-950">
            {t("studio.amendments.modalTitle")}
          </h3>
          {requestErr ? (
            <p className="mt-3 text-sm text-red-800" role="alert">
              {requestErr}
            </p>
          ) : null}
          <label className="mt-5 block">
            <span className={workspace.type.label}>{t("studio.amendments.workFallback")}</span>
            <select
              value={artworkId}
              onChange={(e) => setArtworkId(e.target.value)}
              className={workspace.modal.field}
            >
              {artworkOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {(o.title || t("registry.card.untitled")).slice(0, 80)}
                  {o.registry_id ? ` · ${o.registry_id}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block">
            <span className={workspace.type.label}>
              {t("studio.valueEvent.noteOptional")} *
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={workspace.modal.field}
            />
          </label>
          <div className="mt-5">
            <InfoTooltip text={t("studio.amendments.noteDescribe")} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              placeholder={t("studio.form.title")}
              value={fTitle}
              onChange={(e) => setFTitle(e.target.value)}
              className={workspace.modal.field}
            />
            <input
              placeholder={t("studio.form.year")}
              value={fYear}
              onChange={(e) => setFYear(e.target.value)}
              className={workspace.modal.field}
            />
            <input
              placeholder={t("studio.form.medium")}
              value={fMedium}
              onChange={(e) => setFMedium(e.target.value)}
              className={workspace.modal.field}
            />
            <input
              placeholder={t("studio.form.dimensions")}
              value={fDimensions}
              onChange={(e) => setFDimensions(e.target.value)}
              className={workspace.modal.field}
            />
          </div>
          <textarea
            placeholder={t("studio.form.description")}
            value={fDescription}
            onChange={(e) => setFDescription(e.target.value)}
            rows={2}
            className={`${workspace.modal.field} mt-3`}
          />
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              disabled={requestBusy}
              onClick={() => setRequestOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm text-neutral-600"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={requestBusy}
              onClick={() => void submitRequest()}
              className={primaryBtn}
            >
              {requestBusy ? t("common.sending") : t("studio.amendments.submitRequest")}
            </button>
          </div>
        </div>
      </ModalShell>
    </>
  );
}
