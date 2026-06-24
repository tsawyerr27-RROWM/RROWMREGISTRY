import type { SupabaseClient } from "@supabase/supabase-js";

import type { DealExecutionRecord } from "@/lib/deal-execution";
import type { DealRow } from "@/lib/deals";

export type DealLifecycleClients = {
  service: SupabaseClient;
  user?: SupabaseClient;
};

export type DealAcceptedContext = {
  deal: DealRow;
  actorUserId: string;
  fromStatus: string;
  clients: DealLifecycleClients;
};

export type DealExecutedContext = {
  deal: DealRow;
  actorUserId: string;
  execution: DealExecutionRecord;
  clients: DealLifecycleClients;
};

export type DealCompletedContext = {
  deal: DealRow;
  actorUserId: string;
  execution: DealExecutionRecord;
  clients: DealLifecycleClients;
  ownershipEventId?: string | null;
};

export type DealCancelledContext = {
  deal: DealRow;
  actorUserId: string;
  fromStatus: string;
  clients: DealLifecycleClients;
};

export type DealLifecycleHandler = {
  onAccepted: (ctx: DealAcceptedContext) => Promise<void>;
  onExecuted: (ctx: DealExecutedContext) => Promise<void>;
  onCompleted: (ctx: DealCompletedContext) => Promise<void>;
  onCancelled: (ctx: DealCancelledContext) => Promise<void>;
};
