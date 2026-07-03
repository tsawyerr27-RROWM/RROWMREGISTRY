"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { deferredRouterPush } from "@/lib/deferred-app-router";

type AnalyticsPayload = {
  generated_at: string;
  signups_today: number;
  active_users_7d: number;
  top_events: { event_name: string; count: number }[];
  funnel: {
    signup_started: number;
    signup_completed: number;
    artwork_registered: number;
    artwork_self_attested: number;
    verification_completed: number;
  };
  registry_health: {
    filed: number;
    self_attested: number;
    verified: number;
    pending_verification: number;
  };
  field_usage: {
    searches: number;
    records_viewed: number;
    opportunities_viewed: number;
    applications: number;
  };
  deals: {
    open: number;
    transfers_active: number;
    claims_pending: number;
  };
  errors: {
    count_7d: number;
    recent: {
      id: string;
      created_at: string;
      surface: string | null;
      route: string | null;
      error_name: string | null;
      message: string;
    }[];
  };
};

type BootPhase = "loading" | "ready" | "error";

function MetricTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-[var(--v2-border)] bg-white/90 px-4 py-3">
      <p className="v2-type-mono text-[9px] uppercase tracking-[0.2em] text-[var(--v2-cool-grey)]">
        {label}
      </p>
      <p className="mt-1 font-serif text-2xl text-[var(--v2-ink)]">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--v2-border)] bg-[var(--v2-surface-paper)] p-5 sm:p-6">
      <h2 className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-cool-grey)]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function InternalAnalyticsPage() {
  const router = useRouter();
  const [bootPhase, setBootPhase] = useState<BootPhase>("loading");
  const [data, setData] = useState<AnalyticsPayload | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const adminRes = await fetch("/api/admin/check", { credentials: "include" });
        if (!adminRes.ok) {
          if (!cancelled) deferredRouterPush(router, "/admin");
          return;
        }
        const adminBody = (await adminRes.json()) as { isAdmin?: boolean };
        if (!adminBody?.isAdmin) {
          if (!cancelled) deferredRouterPush(router, "/admin");
          return;
        }

        const res = await fetch("/api/internal/analytics", { credentials: "include" });
        if (!res.ok) throw new Error("analytics fetch failed");
        const payload = (await res.json()) as AnalyticsPayload;
        if (cancelled) return;
        setData(payload);
        setBootPhase("ready");
      } catch {
        if (!cancelled) setBootPhase("error");
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (bootPhase === "loading") {
    return (
      <main className="ds-page-environment flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-neutral-500">Loading operational analytics…</p>
      </main>
    );
  }

  if (bootPhase === "error" || !data) {
    return (
      <main className="ds-page-environment flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-red-800">
          Could not load analytics. Check admin session and migrations.
        </p>
      </main>
    );
  }

  return (
    <main className="ds-page-environment min-h-screen px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="border-b border-black/[0.06] pb-6">
          <p className="v2-type-mono text-[10px] uppercase tracking-[0.2em] text-[var(--v2-cool-grey)]">
            Internal · Operations
          </p>
          <h1 className="mt-2 font-serif text-3xl text-[var(--v2-ink)]">
            Analytics command center
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Generated {new Date(data.generated_at).toLocaleString()} · 7-day window unless noted
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile label="Signups today" value={data.signups_today} />
          <MetricTile label="Active users (7d)" value={data.active_users_7d} />
          <MetricTile label="Runtime errors (7d)" value={data.errors.count_7d} />
          <MetricTile
            label="Pending verification"
            value={data.registry_health.pending_verification}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="User funnel (7d)">
            <ul className="space-y-2 text-sm text-neutral-800">
              <li>signup_started → {data.funnel.signup_started}</li>
              <li>signup_completed → {data.funnel.signup_completed}</li>
              <li>artwork_registered → {data.funnel.artwork_registered}</li>
              <li>artwork_self_attested → {data.funnel.artwork_self_attested}</li>
              <li>verification_completed → {data.funnel.verification_completed}</li>
            </ul>
          </Panel>

          <Panel title="Registry health">
            <ul className="space-y-2 text-sm text-neutral-800">
              <li>Filed → {data.registry_health.filed}</li>
              <li>Self-attested → {data.registry_health.self_attested}</li>
              <li>Verified → {data.registry_health.verified}</li>
            </ul>
          </Panel>

          <Panel title="Field usage (7d)">
            <ul className="space-y-2 text-sm text-neutral-800">
              <li>Searches → {data.field_usage.searches}</li>
              <li>Records viewed → {data.field_usage.records_viewed}</li>
              <li>Opportunities viewed → {data.field_usage.opportunities_viewed}</li>
              <li>Applications → {data.field_usage.applications}</li>
            </ul>
          </Panel>

          <Panel title="Deals & ownership">
            <ul className="space-y-2 text-sm text-neutral-800">
              <li>Deals open → {data.deals.open}</li>
              <li>Transfers active → {data.deals.transfers_active}</li>
              <li>Claims pending → {data.deals.claims_pending}</li>
            </ul>
          </Panel>
        </div>

        <Panel title="Top events (7d)">
          {data.top_events.length === 0 ? (
            <p className="text-sm text-neutral-500">No telemetry events recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] text-[11px] uppercase tracking-wide text-neutral-500">
                    <th className="py-2 pr-4">Event</th>
                    <th className="py-2">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_events.map((row) => (
                    <tr key={row.event_name} className="border-b border-black/[0.04]">
                      <td className="py-2 pr-4 font-mono text-[12px]">{row.event_name}</td>
                      <td className="py-2">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Latest runtime failures">
          {data.errors.recent.length === 0 ? (
            <p className="text-sm text-neutral-500">No runtime errors in the last period.</p>
          ) : (
            <ul className="space-y-3">
              {data.errors.recent.map((err) => (
                <li
                  key={err.id}
                  className="rounded-lg border border-amber-200/60 bg-amber-50/40 px-3 py-2.5"
                >
                  <p className="font-mono text-[11px] text-neutral-500">
                    {new Date(err.created_at).toLocaleString()} · {err.surface ?? "unknown"} ·{" "}
                    {err.route ?? "-"}
                  </p>
                  <p className="mt-1 text-sm text-neutral-900">
                    {err.error_name ? `${err.error_name}: ` : ""}
                    {err.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </main>
  );
}
