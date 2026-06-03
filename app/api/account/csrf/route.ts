import { NextResponse } from "next/server";
import { issueAccountCsrfToken } from "@/lib/account-lifecycle/csrf";

export async function GET() {
  const token = await issueAccountCsrfToken();
  return NextResponse.json({ csrfToken: token });
}
