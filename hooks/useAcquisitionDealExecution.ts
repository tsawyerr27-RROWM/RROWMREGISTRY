"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { DealExecutionPanelState } from "@/lib/deal-execution";
import { fetchRegistryCsrfToken } from "@/lib/registry-action-security/fetch-csrf";

export function useAcquisitionDealExecution(dealId: string | null, enabled: boolean) {
  const [loadingExecution, setLoadingExecution] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionState, setExecutionState] =
    useState<DealExecutionPanelState | null>(null);

  const generationRef = useRef(0);

  const executionEndpoint = dealId
    ? `/api/deals/${encodeURIComponent(dealId)}/execution`
    : null;

  const loadExecution = useCallback(async () => {
    if (!executionEndpoint) {
      setExecutionState(null);
      setLoadingExecution(false);
      return;
    }

    const generation = generationRef.current;

    setLoadingExecution(true);
    setError(null);
    try {
      const res = await fetch(executionEndpoint, { credentials: "include" });
      const payload = (await res.json().catch(() => ({}))) as DealExecutionPanelState & {
        error?: string;
      };
      if (generation !== generationRef.current) return;

      if (!res.ok) {
        setExecutionState(null);
        setError(payload.error || `Could not load filing state (${res.status}).`);
        return;
      }
      setExecutionState(payload);
    } catch {
      if (generation !== generationRef.current) return;
      setExecutionState(null);
      setError("Could not load filing state.");
    } finally {
      if (generation === generationRef.current) {
        setLoadingExecution(false);
      }
    }
  }, [executionEndpoint]);

  useEffect(() => {
    generationRef.current += 1;

    if (!enabled || !dealId) {
      setExecutionState(null);
      setLoadingExecution(false);
      setBusy(false);
      setError(null);
      return;
    }

    void loadExecution();
  }, [dealId, enabled, loadExecution]);

  const executeAcquisition = useCallback(async () => {
    if (!executionEndpoint) return false;

    const generation = generationRef.current;
    const endpoint = executionEndpoint;

    setBusy(true);
    setError(null);
    try {
      const csrfToken = await fetchRegistryCsrfToken();
      if (generation !== generationRef.current) return false;

      if (!csrfToken) {
        setError("Could not prepare a secure session. Refresh and try again.");
        return false;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({}),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        state?: DealExecutionPanelState;
      };
      if (generation !== generationRef.current) return false;

      if (!res.ok) {
        setError(payload.error || `Could not file transfer (${res.status}).`);
        return false;
      }
      if (payload.state) {
        setExecutionState(payload.state);
      } else {
        await loadExecution();
      }
      if (generation !== generationRef.current) return false;
      return true;
    } catch {
      if (generation !== generationRef.current) return false;
      setError("Could not file transfer.");
      return false;
    } finally {
      if (generation === generationRef.current) {
        setBusy(false);
      }
    }
  }, [executionEndpoint, loadExecution]);

  return {
    executionState,
    loadingExecution,
    busy,
    error,
    loadExecution,
    executeAcquisition,
    setError,
  };
}
