"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { OpportunityEditorWorkspace } from "@/components/Studio/Opportunities/OpportunityEditorWorkspace";
import { OpportunityListPanel } from "@/components/Studio/Opportunities/OpportunityListPanel";
import {
  buildOpportunitySavePayload,
  briefToEditorForm,
  EMPTY_OPPORTUNITY_FORM,
  type OpportunityBriefRow,
  type OpportunityEditorForm,
} from "@/lib/opportunity-editor";
import type {
  OrganisationOpportunityApplicationListItem,
  OpportunityApplicationStatus,
} from "@/lib/field-opportunity-applications";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  galleryId: string;
  galleryVerified: boolean;
  gallerySlug: string;
};

type EditorMode = null | "create" | "edit" | "applications";

export function OrganisationOpportunitiesSection({
  galleryId,
  galleryVerified,
}: Props) {
  const { t } = useLocalePreferences();
  const [briefs, setBriefs] = useState<OpportunityBriefRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OpportunityEditorForm>(EMPTY_OPPORTUNITY_FORM);
  const [busy, setBusy] = useState(false);
  const [applications, setApplications] = useState<
    OrganisationOpportunityApplicationListItem[]
  >([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationStatusBusyId, setApplicationStatusBusyId] = useState<
    string | null
  >(null);

  const loadBriefs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/studio/opportunities/briefs?gallery_id=${encodeURIComponent(galleryId)}`
      );
      const json = (await res.json()) as {
        briefs?: OpportunityBriefRow[];
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || "Failed to load opportunities.");
      setBriefs(json.briefs ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load opportunities.");
    } finally {
      setLoading(false);
    }
  }, [galleryId]);

  const loadApplications = useCallback(async (briefId: string) => {
    setApplicationsLoading(true);
    try {
      const res = await fetch(
        `/api/studio/opportunities/briefs/${encodeURIComponent(briefId)}/applications`
      );
      const json = (await res.json()) as {
        applications?: OrganisationOpportunityApplicationListItem[];
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || "Failed to load applications.");
      setApplications(json.applications ?? []);
    } catch {
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  const updateApplicationStatus = useCallback(
    async (applicationId: string, status: OpportunityApplicationStatus) => {
      setApplicationStatusBusyId(applicationId);
      setError(null);
      try {
        const res = await fetch(
          `/api/studio/opportunities/applications/${encodeURIComponent(applicationId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }
        );
        const json = (await res.json()) as {
          application?: {
            id: string;
            status: OpportunityApplicationStatus;
            reviewed_at: string | null;
            reviewed_by: string | null;
          };
          error?: string;
        };
        if (!res.ok) {
          throw new Error(json.error || "Could not update application status.");
        }
        if (json.application) {
          setApplications((prev) =>
            prev.map((row) =>
              row.id === applicationId
                ? {
                    ...row,
                    status: json.application!.status,
                    reviewed_at: json.application!.reviewed_at,
                    reviewed_by: json.application!.reviewed_by,
                  }
                : row
            )
          );
        } else if (editingId) {
          await loadApplications(editingId);
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Could not update application status."
        );
      } finally {
        setApplicationStatusBusyId(null);
      }
    },
    [editingId, loadApplications]
  );

  useEffect(() => {
    void loadBriefs();
  }, [loadBriefs]);

  useEffect(() => {
    if (!editingId || (editorMode !== "edit" && editorMode !== "applications")) {
      setApplications([]);
      return;
    }
    void loadApplications(editingId);
  }, [editingId, editorMode, loadApplications]);

  const editingBrief = useMemo(
    () => briefs.find((b) => b.id === editingId) ?? null,
    [briefs, editingId]
  );

  const editorOpen = editorMode !== null;
  const workspaceFocus = editorMode === "applications" ? "applications" : "full";

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_OPPORTUNITY_FORM);
    setApplications([]);
    setEditorMode("create");
  }

  function openEdit(brief: OpportunityBriefRow) {
    setEditingId(brief.id);
    setForm(briefToEditorForm(brief));
    setEditorMode("edit");
  }

  function openApplicationsReview(brief: OpportunityBriefRow) {
    setEditingId(brief.id);
    setForm(briefToEditorForm(brief));
    setEditorMode("applications");
  }

  function switchToEditMode() {
    if (!editingId) return;
    setEditorMode("edit");
  }

  function closeEditor() {
    if (busy) return;
    setEditorMode(null);
    setEditingId(null);
    setForm(EMPTY_OPPORTUNITY_FORM);
    setApplications([]);
  }

  async function saveBrief() {
    setBusy(true);
    setError(null);
    try {
      const payload = buildOpportunitySavePayload(form, galleryId);

      const res = editingId
        ? await fetch(`/api/studio/opportunities/briefs/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/studio/opportunities/briefs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const json = (await res.json()) as {
        brief?: OpportunityBriefRow;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || "Save failed.");

      if (json.brief) {
        setEditingId(json.brief.id);
        setEditorMode("edit");
        setForm(briefToEditorForm(json.brief));
      }

      await loadBriefs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function publishBrief() {
    if (!editingId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/studio/opportunities/briefs/${editingId}/publish`, {
        method: "POST",
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Publish failed.");
      await loadBriefs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed.");
    } finally {
      setBusy(false);
    }
  }

  async function unpublishBrief() {
    if (!editingId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/studio/opportunities/briefs/${editingId}/unpublish`, {
        method: "POST",
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Unpublish failed.");
      await loadBriefs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unpublish failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8">
      {!galleryVerified ? (
        <p className="mb-6 text-sm text-amber-900/90">
          {t("studio.opportunities.verificationRequired")}
        </p>
      ) : null}

      {error ? (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      <div
        className={
          editorOpen
            ? "grid gap-8 lg:grid-cols-[minmax(280px,22rem)_minmax(0,1fr)] lg:items-start"
            : ""
        }
      >
        <div className={editorOpen ? "hidden lg:block" : ""}>
          <OpportunityListPanel
            briefs={briefs}
            loading={loading}
            selectedId={editorMode === "edit" ? editingId : null}
            reviewModeId={editorMode === "applications" ? editingId : null}
            isCreating={editorMode === "create"}
            busy={busy}
            onCreate={openCreate}
            onSelect={openEdit}
            onReviewApplications={openApplicationsReview}
            onDuplicate={() => undefined}
            onDelete={() => undefined}
          />
        </div>

        {editorOpen ? (
          <OpportunityEditorWorkspace
            mode={editorMode === "create" ? "create" : "edit"}
            focus={workspaceFocus}
            brief={editingBrief}
            form={form}
            busy={busy}
            galleryVerified={galleryVerified}
            applications={applications}
            applicationsLoading={applicationsLoading}
            applicationStatusBusyId={applicationStatusBusyId}
            onFormChange={setForm}
            onBack={closeEditor}
            onSwitchToEdit={switchToEditMode}
            onSave={() => void saveBrief()}
            onPublish={() => void publishBrief()}
            onUnpublish={() => void unpublishBrief()}
            onUpdateApplicationStatus={(id, status) =>
              void updateApplicationStatus(id, status)
            }
          />
        ) : null}
      </div>
    </section>
  );
}
