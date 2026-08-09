import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalH2,
  LegalH3,
  LegalP,
  LegalPageShell,
  LegalUl,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How RROWM handles account, ownership, value, visibility, export, and deletion.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="31 May 2026">
      <section className="flex flex-col gap-4">
        <LegalH2>Introduction</LegalH2>
        <LegalP>
          RROWM Registry (“RROWM”, “we”, “us”) provides infrastructure for
          recording and verifying information about artworks. This policy
          describes how we collect, use, and protect personal and registry data
          when you use our platform as an artist, collector, gallery, or
          visitor.
        </LegalP>
        <LegalP>
          RROWM is designed for cultural institutions, provenance continuity,
          and registry integrity. Where account deletion would compromise the
          integrity of the public record, we may retain certain registry
          artefacts in anonymised or pseudonymised form, as described below.
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
        <LegalH3>Account lifecycle and audit data</LegalH3>
        <LegalP>
          When you manage your account, including deactivation, data export,
          or deletion requests, we process security and audit information
          (such as timestamps, event types, and technical metadata like IP
          address and browser user agent) to protect the service, demonstrate
          compliance, and maintain an immutable record of account lifecycle
          events. This audit data is retained separately from routine activity
          feeds and is not deleted when your sign-in credentials are removed.
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
        <LegalP>
          You can adjust many visibility preferences from{" "}
          <Link
            href="/studio/account#account-visibility"
            className="text-neutral-900 underline decoration-neutral-300 underline-offset-[0.25em] transition hover:decoration-neutral-500"
          >
            My Account
          </Link>
          . Deactivating or deleting your account will hide your public profile
          as described in the account management section below.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Account management and self-service tools</LegalH2>
        <LegalP>
          Signed-in users can manage privacy and account data from{" "}
          <Link
            href="/studio/account#account-privacy-data"
            className="text-neutral-900 underline decoration-neutral-300 underline-offset-[0.25em] transition hover:decoration-neutral-500"
          >
            My Account → Privacy &amp; data
          </Link>
          . The following tools are available subject to your account status and
          applicable law.
        </LegalP>

        <LegalH3>Download my data (right of access / portability)</LegalH3>
        <LegalP>
          You may request a copy of personal data associated with your account,
          including profile information, registry records linked to you,
          certificates, activity history, and related metadata. Exports are
          generated asynchronously and delivered by email when ready. Data is
          provided in structured JSON, with CSV extracts where applicable.
          Download links expire after a limited period for security.
        </LegalP>

        <LegalH3>Deactivate account</LegalH3>
        <LegalP>
          You may temporarily deactivate your account. While deactivated, you
          cannot sign in and your public profile is hidden. Registry ownership
          and records on file are preserved. You may reactivate later by
          signing in and confirming your identity. Deactivation requires password
          confirmation for email/password accounts.
        </LegalP>

        <LegalH3>Delete account</LegalH3>
        <LegalP>
          You may request permanent deletion of your account through a
          multi-step confirmation flow in My Account. Deletion is not immediate:
          after you confirm, your account enters a{" "}
          <strong>30-day recovery period</strong> during which you are signed
          out, access is disabled, and personal profile data is hidden. You will
          receive email confirmation with a link to restore your account before
          the scheduled deletion date.
        </LegalP>
        <LegalP>
          After the recovery period, we permanently remove your sign-in
          credentials and private account data. We send a final confirmation
          email when deletion is complete.
        </LegalP>
        <LegalH3>What may be retained after account deletion</LegalH3>
        <LegalP>
          RROWM is a provenance and registry platform, not a general social
          network. To preserve record integrity, audit history, and the
          continuity of the public registry, the following may remain on file
          after your account is deleted, typically in anonymised or
          pseudonymised form:
        </LegalP>
        <LegalUl>
          <li>
            Provenance and ownership event history required to maintain an
            unbroken chronology
          </li>
          <li>
            Certificates, verification records, and issuance snapshots created
            while you participated in the registry
          </li>
          <li>
            Immutable audit log entries relating to account lifecycle events
          </li>
          <li>
            Registry records where removal would impair the integrity or
            reliability of the public record
          </li>
        </LegalUl>
        <LegalP>
          Where personal identifiers would otherwise appear on retained registry
          artefacts, we replace them with a neutral label (such as “Deleted
          User”) while preserving the underlying record chain. This approach
          reflects our legitimate interests and, where applicable, legal
          obligations to maintain accurate cultural registry records.
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
          agreements. Account lifecycle audit logs may be retained for a longer
          period where required for compliance, security investigations, or
          registry integrity.
        </LegalP>
        <LegalP>
          Data export files are retained only until their expiry date, after
          which they are removed from active systems. We apply administrative,
          technical, and organisational measures appropriate to the nature of
          the data and risk, including re-authentication for sensitive account
          actions, rate limiting, and access controls.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Your rights</LegalH2>
        <LegalP>
          Depending on where you live, including under the UK GDPR, EU GDPR,
          and comparable laws, you may have rights to access, rectify, erase,
          restrict, or object to certain processing, and to data portability.
        </LegalP>
        <LegalH3>How to exercise your rights</LegalH3>
        <LegalUl>
          <li>
            <strong>Access and portability:</strong> use{" "}
            <Link
              href="/studio/account#account-privacy-data"
              className="text-neutral-900 underline decoration-neutral-300 underline-offset-[0.25em] transition hover:decoration-neutral-500"
            >
              Download my data
            </Link>{" "}
            in My Account, or contact us if you cannot access your account
          </li>
          <li>
            <strong>Erasure:</strong> use{" "}
            <Link
              href="/studio/account#account-privacy-data"
              className="text-neutral-900 underline decoration-neutral-300 underline-offset-[0.25em] transition hover:decoration-neutral-500"
            >
              Delete account
            </Link>{" "}
            in My Account (subject to the recovery period and registry
            retention described above)
          </li>
          <li>
            <strong>Correction:</strong> update profile fields in My Account, or
            contact us if you need assistance
          </li>
          <li>
            <strong>Other requests:</strong> contact us using the details below;
            select “Privacy or data rights” where available
          </li>
        </LegalUl>
        <LegalP>
          We may need to verify your identity before responding. We will
          respond within the timeframe required by applicable law. Where we
          cannot fully erase data because of registry integrity requirements, we
          will explain our lawful basis for retention and the measures taken to
          minimise personal data (such as anonymisation).
        </LegalP>
        <LegalP>
          You may lodge a complaint with your local data protection supervisory
          authority. In the United Kingdom, this is the Information
          Commissioner&apos;s Office (ICO).
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
          For privacy-related questions or data rights requests you cannot
          complete in My Account, please use the{" "}
          <Link
            href="/contact"
            className="text-neutral-900 underline decoration-neutral-300 underline-offset-[0.25em] transition hover:decoration-neutral-500"
          >
            contact form
          </Link>{" "}
          and select <strong>Privacy or data rights</strong> as the subject.
        </LegalP>
      </section>
    </LegalPageShell>
  );
}
