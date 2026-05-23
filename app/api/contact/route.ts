import { NextResponse } from "next/server";

import {
  buildRrowmEmailHtml,
  rrowmEmailInnerFromOpts,
} from "@/lib/emails/rrowm-email-layout";
import { sendResendEmail } from "@/lib/emails/send-email";
import { escapeHtml } from "@/lib/html-escape";

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

  const to = process.env.CONTACT_EMAIL_TO?.trim();

  const subjectLine = subjectStr
    ? `[RROWM] ${subjectStr}`
    : `[RROWM] Contact from ${nameStr}`;

  const inner = rrowmEmailInnerFromOpts({
    preheader: "Website contact form",
    blocks: [
      { type: "kicker", text: "Inquiry" },
      {
        type: "p",
        html: `<strong>Name</strong><br/>${escapeHtml(nameStr)}`,
      },
      {
        type: "p",
        html: `<strong>Reply address</strong><br/>${escapeHtml(emailStr)}`,
      },
      ...(subjectStr
        ? [
            {
              type: "p" as const,
              html: `<strong>Subject</strong><br/>${escapeHtml(subjectStr)}`,
            },
          ]
        : []),
      { type: "hr" },
      {
        type: "p",
        html: `<strong>Message</strong>`,
      },
      {
        type: "p",
        html: `<span style="white-space:pre-wrap;">${escapeHtml(messageStr)}</span>`,
      },
    ],
  });
  const html = buildRrowmEmailHtml(inner, "Website contact form");
  const text = [
    subjectLine,
    "",
    `Name: ${nameStr}`,
    `Email: ${emailStr}`,
    subjectStr ? `Subject: ${subjectStr}` : "",
    "",
    messageStr,
  ]
    .filter(Boolean)
    .join("\n");

  if (to) {
    const sent = await sendResendEmail({
      kind: "transactional",
      to,
      subject: subjectLine,
      html,
      text,
      replyTo: emailStr,
    });
    if (!sent.ok) {
      if (sent.message.includes("RESEND_API_KEY")) {
        console.info("[contact] Message received (email not configured)", {
          name: nameStr,
          email: emailStr,
          subject: subjectStr || null,
          messageLength: messageStr.length,
        });
      } else {
        console.error("[contact] Resend error", sent.status, sent.message);
        return NextResponse.json(
          { error: "Unable to send message. Please try again later." },
          { status: 502 }
        );
      }
    }
  } else {
    console.info("[contact] Message received (CONTACT_EMAIL_TO not set)", {
      name: nameStr,
      email: emailStr,
      subject: subjectStr || null,
      messageLength: messageStr.length,
    });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
