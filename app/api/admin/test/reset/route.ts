import { NextResponse } from "next/server";
import {
  createUserSupabaseClient,
  requireAdminApi,
} from "@/lib/api-admin-auth";

export const runtime = "nodejs";

function testModeOn() {
  return process.env.NEXT_PUBLIC_ENABLE_TEST_MODE === "true";
}

export async function POST(req: Request) {
  if (!testModeOn()) {
    return NextResponse.json(
      { error: "Test mode is disabled" },
      { status: 403 }
    );
  }

  const gate = await requireAdminApi(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const userSb = await createUserSupabaseClient(req);
  if (!userSb) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  const { data: ids, error: rpcErr } = await userSb.rpc(
    "reset_test_environment"
  );
  if (rpcErr) {
    return NextResponse.json(
      { error: rpcErr.message || "reset_test_environment failed" },
      { status: 500 }
    );
  }

  const userIds = Array.isArray(ids) ? (ids as string[]) : [];
  const deletedAuth: string[] = [];
  const authErrors: string[] = [];

  for (const id of userIds) {
    if (!id || typeof id !== "string") continue;
    const { error } = await gate.ctx.service.auth.admin.deleteUser(id);
    if (error) {
      authErrors.push(`${id}: ${error.message}`);
    } else {
      deletedAuth.push(id);
    }
  }

  return NextResponse.json({
    ok: true,
    deletedPublicTestUsers: userIds.length,
    deletedAuthUsers: deletedAuth.length,
    authErrors: authErrors.length ? authErrors : undefined,
  });
}
