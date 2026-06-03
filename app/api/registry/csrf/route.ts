import { NextResponse } from "next/server";

import { issueRegistryCsrfToken } from "@/lib/registry-action-security/csrf";

export const runtime = "nodejs";

export async function GET() {
  const csrfToken = await issueRegistryCsrfToken();
  return NextResponse.json({ csrfToken });
}
