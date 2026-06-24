"use client";

import { useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase";

export type ResolvedDealCounterparty = {
  userId: string;
  label: string;
  galleryId?: string | null;
};

type ProfileRole = "creative" | "organisation" | "collector";

type Props = {
  value: ResolvedDealCounterparty | null;
  onChange: (next: ResolvedDealCounterparty | null) => void;
  excludeUserId?: string;
};

const ROLE_LABELS: Record<ProfileRole, string> = {
  creative: "Creative",
  organisation: "Organisation",
  collector: "Collector",
};

function parseFieldProfileInput(raw: string): { role: ProfileRole; slug: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const pathMatch = trimmed.match(
    /\/field\/(creative|organisation|collector)\/([^/?#]+)/i
  );
  if (pathMatch) {
    return {
      role: pathMatch[1]!.toLowerCase() as ProfileRole,
      slug: decodeURIComponent(pathMatch[2]!.trim()),
    };
  }

  const slugOnly = trimmed.replace(/^\/+/, "");
  if (!slugOnly || slugOnly.includes("/")) return null;
  return null;
}

export function DealCounterpartyPicker({
  value,
  onChange,
  excludeUserId,
}: Props) {
  const [role, setRole] = useState<ProfileRole>("creative");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    return value.label;
  }, [value]);

  const resolve = async () => {
    setError(null);
    const parsed = parseFieldProfileInput(input);
    const slug = parsed?.slug ?? input.trim().replace(/^\/+/, "");
    const resolvedRole = parsed?.role ?? role;

    if (!slug) {
      setError("Enter a Field profile link or slug.");
      return;
    }

    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: rpcError } = await supabase.rpc(
        "resolve_field_deal_counterparty",
        {
          p_role: resolvedRole,
          p_slug: slug,
        }
      );

      if (rpcError) {
        setError("Could not resolve that profile.");
        onChange(null);
        return;
      }

      const row = Array.isArray(data) ? data[0] : data;
      const userId = String((row as { user_id?: string } | null)?.user_id ?? "").trim();
      if (!userId) {
        setError("No public profile found for that slug.");
        onChange(null);
        return;
      }

      if (excludeUserId && userId === excludeUserId) {
        setError("Choose a counterparty other than yourself.");
        onChange(null);
        return;
      }

      onChange({
        userId,
        label:
          String((row as { display_label?: string }).display_label ?? "").trim() ||
          ROLE_LABELS[resolvedRole],
        galleryId: String((row as { gallery_id?: string }).gallery_id ?? "").trim() || null,
      });
    } catch {
      setError("Could not resolve that profile.");
      onChange(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-7">
      <p className="font-serif text-lg font-normal tracking-tight text-neutral-950">
        Counterparty
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">
        Paste a Field profile link or enter a public slug. The proposal is addressed to
        that participant.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(Object.keys(ROLE_LABELS) as ProfileRole[]).map((item) => {
          const active = role === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                active
                  ? "bg-neutral-950 text-white"
                  : "bg-white/70 text-neutral-700 ring-1 ring-black/[0.06] hover:bg-white"
              }`}
            >
              {ROLE_LABELS[item]}
            </button>
          );
        })}
      </div>

      <label className="mt-5 block text-[13px] font-medium text-neutral-700" htmlFor="deal-counterparty-input">
        Profile link or slug
      </label>
      <input
        id="deal-counterparty-input"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setError(null);
        }}
        placeholder="/field/creative/example or example"
        className="mt-2 w-full rounded-xl border border-neutral-900/[0.08] bg-white/90 px-3.5 py-3 text-[15px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
      />

      {selectedLabel ? (
        <p className="mt-4 text-[14px] text-neutral-700">
          Selected: <span className="font-medium text-neutral-950">{selectedLabel}</span>
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 text-[14px] leading-relaxed text-neutral-700">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={() => void resolve()}
        disabled={busy}
        className="mt-5 rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-neutral-900 disabled:opacity-50"
      >
        {busy ? "Resolving…" : "Resolve profile"}
      </button>
    </div>
  );
}
