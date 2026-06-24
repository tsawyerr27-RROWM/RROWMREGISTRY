import type { SupabaseClient } from "@supabase/supabase-js";

import type { DealExecutionRecord } from "@/lib/deal-execution";
import { dealExecutionKind } from "@/lib/deal-execution";
import { mapDealRow, type DealRow } from "@/lib/deals";

import { resolveDealLifecycleHandler } from "./deal-lifecycle-handlers";

export type DealLifecycleEngineClients = {
  service: SupabaseClient;
  user?: SupabaseClient;
};

function handlerForDeal(deal: DealRow) {
  const handler = resolveDealLifecycleHandler(deal);
  if (!handler) {
    console.warn("[deal-lifecycle-engine] no handler for deal type", deal.type);
    return null;
  }
  return handler;
}

export async function onDealAccepted(args: {
  deal: DealRow | Record<string, unknown>;
  actorUserId: string;
  fromStatus: string;
  clients: DealLifecycleEngineClients;
}): Promise<void> {
  const deal = "terms" in args.deal && typeof args.deal.terms === "object"
    ? (args.deal as DealRow)
    : mapDealRow(args.deal as Record<string, unknown>);

  const handler = handlerForDeal(deal);
  if (!handler) return;

  await handler.onAccepted({
    deal,
    actorUserId: args.actorUserId,
    fromStatus: args.fromStatus,
    clients: args.clients,
  });
}

export async function onDealExecuted(args: {
  deal: DealRow | Record<string, unknown>;
  actorUserId: string;
  execution: DealExecutionRecord;
  clients: DealLifecycleEngineClients;
}): Promise<void> {
  const deal = "terms" in args.deal && typeof args.deal.terms === "object"
    ? (args.deal as DealRow)
    : mapDealRow(args.deal as Record<string, unknown>);

  const kind = dealExecutionKind(deal);
  if (kind && kind !== args.execution.type && "type" in args.execution) {
    console.warn("[deal-lifecycle-engine] execution type mismatch", kind, args.execution);
  }

  const handler = handlerForDeal(deal);
  if (!handler) return;

  await handler.onExecuted({
    deal,
    actorUserId: args.actorUserId,
    execution: args.execution,
    clients: args.clients,
  });
}

export async function onDealCompleted(args: {
  deal: DealRow | Record<string, unknown>;
  actorUserId: string;
  execution: DealExecutionRecord;
  ownershipEventId?: string | null;
  clients: DealLifecycleEngineClients;
}): Promise<void> {
  const deal = "terms" in args.deal && typeof args.deal.terms === "object"
    ? (args.deal as DealRow)
    : mapDealRow(args.deal as Record<string, unknown>);

  const handler = handlerForDeal(deal);
  if (!handler) return;

  await handler.onCompleted({
    deal,
    actorUserId: args.actorUserId,
    execution: args.execution,
    ownershipEventId: args.ownershipEventId ?? null,
    clients: args.clients,
  });
}

export async function onDealCancelled(args: {
  deal: DealRow | Record<string, unknown>;
  actorUserId: string;
  fromStatus: string;
  clients: DealLifecycleEngineClients;
}): Promise<void> {
  const deal = "terms" in args.deal && typeof args.deal.terms === "object"
    ? (args.deal as DealRow)
    : mapDealRow(args.deal as Record<string, unknown>);

  const handler = handlerForDeal(deal);
  if (!handler) return;

  await handler.onCancelled({
    deal,
    actorUserId: args.actorUserId,
    fromStatus: args.fromStatus,
    clients: args.clients,
  });
}
