"use client";

import { useCallback, useEffect, useState } from "react";

type PendingRow = {
  user_id: string;
  role: string;
  display_name: string | null;
  account_status: string;
  deletion_scheduled_at: string | null;
  deletion_reason: string | null;
  deletion_notification_email: string | null;
  deactivated_at: string | null;
};

export function AdminAccountLifecyclePanel() {
  const [rows, setRows] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/accounts/pending-deletions", {
        credentials: "include",
      });
      const j = (await res.json()) as { rows?: PendingRow[]; error?: string };
      if (!res.ok) {
        setError(j.error || "Could not load accounts.");
        return;
      }
      setRows(j.rows ?? []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const action = async (userId: string, kind: "restore" | "extend" | "force-delete") => {
    setBusyId(userId);
    try {
      const res = await fetch(`/api/admin/accounts/${userId}/${kind}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: kind === "extend" ? JSON.stringify({ days: 30 }) : JSON.stringify({}),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setError(j.error || "Action failed.");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="liquid-glass-tile-dark col-span-full space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Account lifecycle</h2>
          <p className="mt-1 text-sm text-white/50">
            Pending deletions and deactivated accounts
          </p>
        </div>
        <a
          href="/api/admin/accounts/audit-export"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
        >
          Export audit CSV
        </a>
      </div>

      {loading ? (
        <p className="text-sm text-white/40">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-white/40">No pending or deactivated accounts.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="py-2 pr-4 font-medium">User</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Scheduled</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user_id} className="border-b border-white/[0.06]">
                  <td className="py-3 pr-4 font-mono text-xs text-white/70">
                    {r.user_id.slice(0, 8)}…
                    <span className="ml-2 text-white/40">{r.role}</span>
                  </td>
                  <td className="py-3 pr-4 text-white/80">{r.account_status}</td>
                  <td className="py-3 pr-4 text-white/60">
                    {r.deletion_scheduled_at
                      ? new Date(r.deletion_scheduled_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="py-3 pr-4 text-white/60">
                    {r.deletion_notification_email ?? "—"}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === r.user_id}
                        onClick={() => void action(r.user_id, "restore")}
                        className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/5 disabled:opacity-50"
                      >
                        Restore
                      </button>
                      {r.account_status === "pending_deletion" ? (
                        <>
                          <button
                            type="button"
                            disabled={busyId === r.user_id}
                            onClick={() => void action(r.user_id, "extend")}
                            className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/5 disabled:opacity-50"
                          >
                            Extend 30d
                          </button>
                          <button
                            type="button"
                            disabled={busyId === r.user_id}
                            onClick={() => void action(r.user_id, "force-delete")}
                            className="rounded border border-red-400/30 px-2 py-1 text-xs text-red-300 hover:bg-red-950/30 disabled:opacity-50"
                          >
                            Force delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
