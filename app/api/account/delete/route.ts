import { NextResponse } from "next/server";

/**
 * Legacy endpoint — redirects clients to the scheduled deletion flow.
 * Immediate hard delete is no longer supported.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Immediate account deletion is no longer supported. Use POST /api/account/delete/request for the scheduled deletion flow.",
      migration: "/api/account/delete/request",
    },
    { status: 410 }
  );
}
