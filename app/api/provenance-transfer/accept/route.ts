import { NextResponse } from "next/server";

import { onDealCompleted } from "@/lib/deal-lifecycle-engine";
import { resolveDealExecution } from "@/lib/deal-execution";
import { mapDealRow } from "@/lib/deals";
import {
  loadProvenanceAcceptPostState,
  logProvenanceAccept,
} from "@/lib/provenance-accept-audit";
import {
  assertAcquisitionCompletionInvariants,
  AcquisitionCompletionInvariantError,
} from "@/lib/acquisition-completion-invariants";
import { guardRegistryMutation } from "@/lib/registry-action-security/guards";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const token =
    typeof (body as Record<string, unknown>).token === "string"
      ? String((body as Record<string, unknown>).token).trim()
      : "";
  if (token.length < 32) {
    return NextResponse.json({ error: "Invalid token." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    logProvenanceAccept("auth_failed", {
      token_prefix: token.slice(0, 8),
      auth_error: authError?.message ?? null,
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  logProvenanceAccept("start", {
    buyer_user_id: user.id,
    token_prefix: token.slice(0, 8),
  });

  const blocked = await guardRegistryMutation(req, {
    actionKey: "provenance_accept",
    subjectKey: user.id,
    maxAttempts: 20,
    windowSeconds: 3600,
  });
  if (blocked) return blocked;

  const { data, error } = await supabase.rpc("accept_provenance_transfer", {
    p_token: token,
  });

  if (error) {
    const msg = summarizeRpcError(error);
    const code = String((error as { code?: string }).code ?? "");
    logProvenanceAccept("rpc_failed", {
      buyer_user_id: user.id,
      token_prefix: token.slice(0, 8),
      code,
      message: msg,
    });
    const lower = msg.toLowerCase();
    const status =
      code === "42501" ||
      lower.includes("not authenticated") ||
      lower.includes("sign in with the email") ||
      lower.includes("custodian")
        ? 403
        : lower.includes("not found")
          ? 404
          : 400;
    return NextResponse.json({ error: msg || "Could not accept invitation." }, { status });
  }

  const row =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const artworkId = String(row.artwork_id ?? "");
  const oeId = String(row.ownership_event_id ?? "");

  logProvenanceAccept("rpc_ok", {
    buyer_user_id: user.id,
    artwork_id: artworkId || null,
    ownership_event_id: oeId || null,
    rpc_payload: row,
  });

  if (!artworkId || !oeId) {
    logProvenanceAccept("rpc_incomplete_payload", {
      buyer_user_id: user.id,
      artwork_id: artworkId || null,
      ownership_event_id: oeId || null,
    });
  }

  const service = createSupabaseServiceClient();
  let lifecycleWarnings: string[] = [];

  if (artworkId) {
    const { data: trByOe } = await service
      .from("provenance_transfers")
      .select("id, from_user_id, note, status")
      .eq("ownership_event_id", oeId)
      .maybeSingle();

    let tr = trByOe;
    let transferLookup = trByOe?.id ? "ownership_event_id" : "pending";
    if (!tr?.id) {
      const { data: trByToken } = await service
        .from("provenance_transfers")
        .select("id, from_user_id, note, status")
        .eq("invite_token", token)
        .maybeSingle();
      tr = trByToken;
      transferLookup = trByToken?.id ? "invite_token" : "not_found";
    }
    const fromUserId = tr?.from_user_id ? String(tr.from_user_id) : "";
    const transferId = tr?.id ? String(tr.id) : "";

    let sellerUserId = fromUserId;
    if (!sellerUserId && oeId) {
      const { data: oe } = await service
        .from("ownership_events")
        .select("from_user_id")
        .eq("id", oeId)
        .maybeSingle();
      sellerUserId = oe?.from_user_id ? String(oe.from_user_id) : "";
    }

    console.info("[provenance accept] seller resolution", {
      transfer_from_user_id: fromUserId || null,
      ownership_event_seller_id: sellerUserId || null,
    });

    const dealMatch = String(tr?.note ?? "").match(/deal_id=([0-9a-f-]{36})/i);
    const dealId = dealMatch?.[1] ?? null;

    logProvenanceAccept("transfer_resolved", {
      buyer_user_id: user.id,
      provenance_transfer_id: transferId || null,
      transfer_status: tr?.status ?? null,
      from_user_id: fromUserId || null,
      deal_id: dealId,
      lookup: transferLookup,
    });

    if (dealId) {
      const { data: dealRow, error: dealError } = await service
        .from("deals")
        .select(
          "id, created_at, updated_at, type, status, created_by_user_id, participant_a_user_id, participant_b_user_id, artwork_id, gallery_id, title, terms"
        )
        .eq("id", dealId)
        .maybeSingle();

      if (dealError || !dealRow) {
        logProvenanceAccept("deal_missing", {
          buyer_user_id: user.id,
          deal_id: dealId,
          error: dealError?.message ?? null,
        });
        lifecycleWarnings.push("deal_row_not_found");
      } else {
        const deal = mapDealRow(dealRow as Record<string, unknown>);
        const execution = await resolveDealExecution(service, {
          dealId,
          terms: deal.terms,
        });

        if (!execution || !("provenance_transfer_id" in execution)) {
          logProvenanceAccept("deal_execution_unresolved", {
            buyer_user_id: user.id,
            deal_id: dealId,
            execution: execution ?? null,
          });
          lifecycleWarnings.push("deal_execution_unresolved");
        } else {
          try {
            await onDealCompleted({
              deal,
              actorUserId: user.id,
              execution: {
                type: "acquisition",
                ...execution,
                status: "completed",
                recipient_user_id: user.id,
                recorded_by_user_id:
                  String(execution.recorded_by_user_id ?? "").trim() ||
                  sellerUserId ||
                  execution.recorded_by_user_id,
              },
              ownershipEventId: oeId,
              clients: { service, user: supabase },
            });
            logProvenanceAccept("deal_completed", {
              buyer_user_id: user.id,
              deal_id: dealId,
              provenance_transfer_id: execution.provenance_transfer_id,
              ownership_event_id: oeId,
            });

            await assertAcquisitionCompletionInvariants(service, {
              artworkId,
              buyerUserId: user.id,
              sellerUserId:
                sellerUserId ||
                String(execution.recorded_by_user_id ?? "").trim() ||
                null,
              provenanceTransferId: transferId || execution.provenance_transfer_id,
              ownershipEventId: oeId,
              deal,
            });
          } catch (lifecycleError) {
            const message =
              lifecycleError instanceof Error
                ? lifecycleError.message
                : String(lifecycleError);
            logProvenanceAccept("deal_completed_failed", {
              buyer_user_id: user.id,
              deal_id: dealId,
              ownership_event_id: oeId,
              message,
              issues:
                lifecycleError instanceof AcquisitionCompletionInvariantError
                  ? lifecycleError.issues
                  : undefined,
            });
            if (lifecycleError instanceof AcquisitionCompletionInvariantError) {
              return NextResponse.json(
                {
                  error: "Ownership invariants failed after acceptance.",
                  lifecycle_warnings: lifecycleError.issues.map((i) => i.code),
                },
                { status: 500 }
              );
            }
            lifecycleWarnings.push("deal_completed_failed");
          }
        }
      }
    } else if (sellerUserId) {
      try {
        const { logActivityEvent } = await import("@/lib/log-activity");
        const { notifyRegistryTransferRecorded } = await import(
          "@/lib/notification-hooks/registry"
        );

        const { data: art } = await service
          .from("artworks")
          .select("title, registry_id")
          .eq("id", artworkId)
          .maybeSingle();
        const title = String(art?.title || "").trim() || "Artwork";
        const reg = art?.registry_id ? ` (${art.registry_id})` : "";

        await logActivityEvent({
          userId: user.id,
          type: "provenance_transfer_accepted",
          message: `Accepted continuity transfer: ${title}${reg}`,
          artworkId,
          metadata: {
            registry_id: art?.registry_id ?? null,
            ownership_event_id: oeId,
          },
        });

        await logActivityEvent({
          userId: sellerUserId,
          type: "provenance_transfer_completed",
          message: `Continuity transfer completed: ${title}${reg}`,
          artworkId,
          metadata: {
            registry_id: art?.registry_id ?? null,
            accepted_by: user.id,
          },
        });

        await notifyRegistryTransferRecorded({
          artworkId,
          fromUserId: sellerUserId,
          toUserId: user.id,
        });

        logProvenanceAccept("non_deal_notifications_ok", {
          buyer_user_id: user.id,
          from_user_id: sellerUserId,
          artwork_id: artworkId,
        });
      } catch (notifyError) {
        const message =
          notifyError instanceof Error
            ? notifyError.message
            : String(notifyError);
        logProvenanceAccept("non_deal_notifications_failed", {
          buyer_user_id: user.id,
          artwork_id: artworkId,
          message,
        });
        lifecycleWarnings.push("non_deal_notifications_failed");
      }
    } else {
      logProvenanceAccept("no_deal_no_from_user", {
        buyer_user_id: user.id,
        artwork_id: artworkId,
        ownership_event_id: oeId,
      });
      lifecycleWarnings.push("no_deal_and_no_from_user");
    }

    const postState = await loadProvenanceAcceptPostState(service, {
      artworkId,
      buyerUserId: user.id,
      ownershipEventId: oeId,
      provenanceTransferId: transferId || null,
    });

    logProvenanceAccept("post_state", {
      buyer_user_id: user.id,
      ...postState,
      lifecycle_warnings: lifecycleWarnings,
    });

    if (!postState.ownership_event_to_user_id) {
      lifecycleWarnings.push("ownership_event_missing_or_empty_holder");
    }
    if (postState.ownership_event_to_user_id !== user.id) {
      lifecycleWarnings.push("ownership_event_holder_mismatch");
    }
    if (postState.artwork_current_owner_id !== user.id) {
      lifecycleWarnings.push("artwork_owner_cache_stale");
    }
    if (String(postState.transfer_status ?? "").toLowerCase() !== "completed") {
      lifecycleWarnings.push("transfer_not_completed");
    }
  }

  return NextResponse.json({
    ok: true,
    ownership_event_id: oeId,
    artwork_id: artworkId,
    lifecycle_warnings:
      lifecycleWarnings.length > 0 ? lifecycleWarnings : undefined,
  });
}
