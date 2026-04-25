import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact — RROWM Registry",
  description: "Contact the RROWM registry for general enquiries, partnerships, and institutional matters.",
};

export default function ContactPage() {
  return (
    <div className="ds-page-environment min-h-screen pt-24 pb-28 text-neutral-900 md:pt-32 md:pb-36">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <header className="max-w-2xl">
          <h1 className="font-serif text-[2.25rem] font-normal leading-[1.1] tracking-tight text-neutral-950 md:text-[2.75rem] md:leading-[1.06]">
            Contact
          </h1>
          <p className="mt-6 text-lg font-normal leading-relaxed text-neutral-600 md:text-xl">
            Contact the registry
          </p>
        </header>

        <div className="mt-16 flex flex-col gap-14 lg:mt-20 lg:flex-row lg:items-start lg:gap-20 xl:gap-28">
          <div className="max-w-md flex-1">
            <p className="text-[15px] leading-[1.85] text-neutral-600 md:text-base md:leading-[1.8]">
              For general enquiries, partnerships, or institutional matters.
            </p>
            <p className="mt-8 text-sm leading-relaxed text-neutral-500">
              We read every message; response times depend on volume and nature of
              the request.
            </p>
            <Link
              href="/"
              className="mt-12 inline-flex items-center text-sm font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-[0.35em] transition hover:text-neutral-950 hover:decoration-neutral-500"
            >
              ← Back to home
            </Link>
          </div>

          <div className="w-full min-w-0 flex-1 lg:max-w-xl">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
