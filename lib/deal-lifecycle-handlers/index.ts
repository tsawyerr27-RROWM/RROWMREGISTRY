import { dealExecutionKind } from "@/lib/deal-execution";
import type { DealRow } from "@/lib/deals";

import { acquisitionHandler } from "./acquisition";
import { exhibitionHandler } from "./exhibition";
import { licensingHandler } from "./licensing";
import { representationHandler } from "./representation";
import type { DealLifecycleHandler } from "./types";

export const dealLifecycleHandlers: Record<string, DealLifecycleHandler> = {
  acquisition: acquisitionHandler,
  exhibition: exhibitionHandler,
  representation: representationHandler,
  licensing: licensingHandler,
};

export function resolveDealLifecycleHandler(deal: DealRow): DealLifecycleHandler | null {
  const kind = dealExecutionKind(deal);
  if (!kind) return null;
  return dealLifecycleHandlers[kind] ?? null;
}

export { acquisitionHandler, exhibitionHandler, representationHandler, licensingHandler };
