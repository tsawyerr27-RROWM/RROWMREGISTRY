import { NextResponse } from "next/server";

import { escapeHtml } from "@/lib/html-escape";
import { readResendApiKey } from "@/lib/resend-env";

const MAX_MESSAGE = 8000;
const MAX_NAME = 200;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { name, email, subject, message, _hp } = body as Record<
    string,
    unknown
  >;

  if (typeof _hp === "string" && _hp.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const nameStr = typeof name === "string" ? name.trim() : "";
  const emailStr = typeof email === "string" ? email.trim() : "";
  const messageStr = typeof message === "string" ? message.trim() : "";
  const subjectStr =
    typeof subject === "string" ? subject.trim().slice(0, 200) : "";

  if (!nameStr || nameStr.length > MAX_NAME) {
    return NextResponse.json(
      { error: "Please provide a valid name." },
      { status: 400 }
    );
  }

  if (!emailStr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  if (!messageStr || messageStr.length > MAX_MESSAGE) {
    return NextResponse.json(
      { error: "Please enter a message." },
      { status: 400 }
    );
  }

  const to = process.env.CONTACT_EMAIL_TO;
  const resendKey = readResendApiKey();
  const from = process.env.CONTACT_EMAIL_FROM;

  if (resendKey && from && to) {
    const subjectLine = subjectStr
      ? `[RROWM] ${subjectStr}`
      : `[RROWM] Contact from ${nameStr}`;
    const html = `
      <p><strong>Name:</strong> ${escapeHtml(nameStr)}</p>
      <p><strong>Email:</strong> ${escapeHtml(emailStr)}</p>
      ${subjectStr ? `<p><strong>Subject:</strong> ${escapeHtml(subjectStr)}</p>` : ""}
      <p><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(messageStr)}</pre>
    `;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: emailStr,
        subject: subjectLine,
        html,
      }),
    });
    if (!resendResOk(res)) {
      console.error("[contact] Resend error", await res.text());
      return NextResponse.json(
        { error: "Unable to send message. Please try again later." },
        { status: 502 }
      );
    }
  } else {
    console.info("[contact] Message received (email not configured)", {
      name: nameStr,
      email: emailStr,
      subject: subjectStr || null,
      messageLength: messageStr.length,
    });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

function resendResOk(res: Response) {
  return res.ok;
}
