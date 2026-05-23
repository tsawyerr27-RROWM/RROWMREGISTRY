import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalH2,
  LegalH3,
  LegalP,
  LegalPageShell,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy · RROWM Registry",
  description:
    "How RROWM handles account, ownership, value, and visibility data.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="3 April 2026">
      <section className="flex flex-col gap-4">
        <LegalH2>Introduction</LegalH2>
        <LegalP>
          RROWM Registry (“RROWM”, “we”, “us”) provides infrastructure for
          recording and verifying information about artworks. This policy
          describes how we collect, use, and protect personal and registry data
          when you use our platform as an artist, collector, gallery, or
          visitor.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Who we serve</LegalH2>
        <LegalP>
          Accounts may be associated with different roles (artists, collectors, and
          galleries), each with distinct permissions and profile surfaces. We process the
          information needed to operate accounts, registry records, and optional public
          presence you choose to enable.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Data we process</LegalH2>
        <LegalH3>Accounts and identity</LegalH3>
        <LegalP>
          We process identifiers and profile data you provide (such as name,
          email, and role-related fields) to authenticate you, display agreed
          profile information, and communicate about your account and the
          service.
        </LegalP>
        <LegalH3>Ownership and provenance</LegalH3>
        <LegalP>
          The registry may store ownership-related events, transfers, and
          claims submitted by authorised parties. This information supports the
          provenance record; it is not a substitute for legal title and may be
          subject to verification rules and visibility settings.
        </LegalP>
        <LegalH3>Value and financial metadata</LegalH3>
        <LegalP>
          Declared values, currencies, and related events may be stored where
          you or your collaborators submit them. Visibility can be constrained
          by record type and your choices; some aggregates may appear in
          product surfaces without exposing underlying line items.
        </LegalP>
        <LegalH3>Registry and artwork records</LegalH3>
        <LegalP>
          We process titles, identifiers, media references, verification
          status, certificates, and similar fields needed to operate the
          registry and linked public pages.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Visibility: public vs private</LegalH2>
        <LegalP>
          Certain information may appear on public registry or profile surfaces
          when you publish or verify content. Other data remains visible only to
          you, to counterparties where the product allows, or to
          administrators for security and compliance. Specific controls depend
          on feature design and your settings at the time of submission.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Cookies and similar technologies</LegalH2>
        <LegalP>
          We use cookies and local storage as needed for core functionality
          (such as session continuity, security, and preferences). Where we rely
          on non-essential cookies or measurement, we will ask for your consent
          where required before activating those features.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Analytics</LegalH2>
        <LegalP>
          We may use privacy-conscious analytics to understand how the product
          is used. Non-essential measurement is gated behind your cookie
          preference where applicable.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Third-party services</LegalH2>
        <LegalP>
          We use infrastructure and service providers to host the platform,
          process authentication, deliver email, and handle payments where
          applicable. For example, payment processing may be provided by
          services such as Stripe; their use is subject to their own terms and
          privacy notices. We share only what is needed for the service you
          request.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Retention and security</LegalH2>
        <LegalP>
          We retain information for as long as needed to provide the service,
          meet legal obligations, resolve disputes, and enforce our
          agreements. We apply administrative, technical, and organisational
          measures appropriate to the nature of the data and risk.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Your rights</LegalH2>
        <LegalP>
          Depending on where you live, you may have rights to access, correct,
          delete, or export certain personal data, or to object to or restrict
          certain processing. Contact us using the details on our contact page
          to make a request. We may need to verify your identity before
          responding.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>International transfers</LegalH2>
        <LegalP>
          If we process data across borders, we take steps designed to ensure
          appropriate safeguards in line with applicable law.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Changes</LegalH2>
        <LegalP>
          We may update this policy from time to time. Material changes will be
          indicated by revising the date above and, where appropriate, through
          additional notice in the product.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Contact</LegalH2>
        <LegalP>
          For privacy-related questions, please use the{" "}
          <Link
            href="/contact"
            className="text-neutral-900 underline decoration-neutral-300 underline-offset-[0.25em] transition hover:decoration-neutral-500"
          >
            contact form
          </Link>
          .
        </LegalP>
      </section>
    </LegalPageShell>
  );
}
