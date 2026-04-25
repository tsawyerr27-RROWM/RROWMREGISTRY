import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-admin-auth";
import { createTestUser } from "@/lib/create-test-user";

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

  let body: { role?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const role = body.role;
  if (
    role !== "artist" &&
    role !== "collector" &&
    role !== "gallery"
  ) {
    return NextResponse.json(
      { error: "role must be artist | collector | gallery" },
      { status: 400 }
    );
  }

  const result = await createTestUser(gate.ctx.service, role);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    role,
    email: result.email,
    password: result.password,
    userId: result.userId,
    message:
      "Credentials are shown once. Sign in at /login with password mode in development.",
  });
}
