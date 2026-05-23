"use client";

import { useState } from "react";

const SUBJECTS = [
  { value: "", label: "General (optional)" },
  { value: "partnership", label: "Partnership or collaboration" },
  { value: "institutional", label: "Institutional enquiry" },
  { value: "press", label: "Press or media" },
  { value: "support", label: "Product support" },
  { value: "other", label: "Other" },
];

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          _hp: hp,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong.");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-black/[0.06] bg-white/70 px-6 py-10 backdrop-blur-md md:px-8 md:py-12">
        <p className="font-serif text-xl font-normal tracking-tight text-neutral-950 md:text-2xl">
          Message received
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
          Thank you. We will respond when we can.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 text-sm font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-[0.35em] transition hover:text-neutral-950 hover:decoration-neutral-500"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-black/[0.06] bg-white/60 px-6 py-8 backdrop-blur-md md:px-8 md:py-10"
    >
      <p className="sr-only">Leave blank</p>
      <input
        type="text"
        name="website"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

      <div className="flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-neutral-500">
            Name
          </span>
          <input
            required
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="border-0 border-b border-black/[0.1] bg-transparent px-0 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900/30 focus:outline-none focus:ring-0"
            placeholder="Your name"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-neutral-500">
            Email
          </span>
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="border-0 border-b border-black/[0.1] bg-transparent px-0 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900/30 focus:outline-none focus:ring-0"
            placeholder="you@example.com"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-neutral-500">
            Subject <span className="font-normal text-neutral-400">(optional)</span>
          </span>
          <select
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="cursor-pointer border-0 border-b border-black/[0.1] bg-transparent px-0 py-2.5 text-[15px] text-neutral-900 focus:border-neutral-900/30 focus:outline-none focus:ring-0"
          >
            {SUBJECTS.map((o) => (
              <option key={o.value || "general"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-neutral-500">
            Message
          </span>
          <textarea
            required
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="resize-y border border-black/[0.08] bg-white/40 px-4 py-3 text-[15px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900/20 focus:outline-none focus:ring-1 focus:ring-neutral-900/10"
            placeholder="Your message"
          />
        </label>
      </div>

      {status === "error" ? (
        <p className="mt-4 text-sm text-red-800/90" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-8 rounded-lg bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
