import { NextResponse } from "next/server";

import { validateRegistryCsrf } from "@/lib/registry-action-security/csrf";
import { checkRegistryActionRateLimit } from "@/lib/registry-action-security/rate-limit";

export type RegistryMutationGuardOptions = {
  actionKey: string;
  subjectKey: string;
  maxAttempts?: number;
  windowSeconds?: number;
};

/**
 * CSRF + per-subject rate limit for state-changing registry APIs.
 * Returns a NextResponse when blocked; null when the request may proceed.
 */
export async function guardRegistryMutation(
  req: Request,
  opts: RegistryMutationGuardOptions
): Promise<NextResponse | null> {
  if (!(await validateRegistryCsrf(req))) {
    return NextResponse.json(
      { error: "Invalid or missing CSRF token. Refresh the page and try again." },
      { status: 403 }
    );
  }

  const allowed = await checkRegistryActionRateLimit(
    opts.actionKey,
    opts.subjectKey,
    opts.maxAttempts ?? 30,
    opts.windowSeconds ?? 3600
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      { status: 429 }
    );
  }

  return null;
}

export async function guardRegistryPreview(
  req: Request,
  actionKey: string,
  ip: string
): Promise<NextResponse | null> {
  const allowed = await checkRegistryActionRateLimit(
    actionKey,
    ip,
    60,
    60
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many preview requests. Please wait a moment." },
      { status: 429 }
    );
  }
  return null;
}
