import type { Metadata } from "next";
import {
  LegalH2,
  LegalH3,
  LegalP,
  LegalPageShell,
  LegalUl,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Service · RROWM Registry",
  description:
    "Terms governing use of the RROWM registry, verification, and user responsibilities.",
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" updated="3 April 2026">
      <section className="flex flex-col gap-4">
        <LegalH2>Agreement</LegalH2>
        <LegalP>
          By accessing or using RROWM Registry (“RROWM”, “the platform”), you
          agree to these terms. If you do not agree, do not use the service.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>What RROWM is</LegalH2>
        <LegalP>
          RROWM provides a cultural registry layer for recording and checking
          information about artworks, including identifiers, verification status,
          provenance-related events, and optional value metadata. It is not a
          marketplace, auction house, or dealer. Listings, offers, and commercial
          transactions, where they exist, are outside the core registry contract
          unless expressly stated otherwise in a separate agreement.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Accounts and eligibility</LegalH2>
        <LegalP>
          You must provide accurate registration information and keep your
          credentials secure. You are responsible for activity under your
          account except where compromise is attributable solely to our
          systems.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Your responsibilities</LegalH2>
        <LegalUl>
          <li>
            Submit information you are entitled to share and that you believe
            to be accurate to the best of your knowledge.
          </li>
          <li>
            Respect the rights of others, including intellectual property and
            privacy.
          </li>
          <li>
            Not misuse the platform to distribute malware, harass others,
            scrape at unreasonable scale, or attempt to bypass security or
            access controls.
          </li>
          <li>
            Comply with applicable laws and regulations when using registry
            data in external contexts.
          </li>
        </LegalUl>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Ownership records</LegalH2>
        <LegalP>
          Registry entries may reflect ownership-related events and claims as
          submitted and processed through the product. Such records are
          informational and operational within the system; they do not, by
          themselves, constitute legal proof of title or resolve disputes
          between parties. Formal legal rights remain governed by law and
          evidence outside the platform.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Verification</LegalH2>
        <LegalP>
          Verification and certificate features are designed to strengthen
          records using defined criteria. Verification does not guarantee
          completeness, future accuracy, or fitness for any particular purpose.
          We may update processes, criteria, or tooling as the product evolves.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Acceptable use</LegalH2>
        <LegalH3>Prohibited conduct includes:</LegalH3>
        <LegalUl>
          <li>Impersonation or misrepresentation of affiliation or authority.</li>
          <li>
            Uploading unlawful content or content that infringes third-party
            rights.
          </li>
          <li>
            Interfering with or disrupting the service or other users’ access.
          </li>
          <li>
            Reverse engineering or attempting to extract non-public data except
            as permitted by law.
          </li>
        </LegalUl>
        <LegalP>
          We may suspend or terminate access for violations or risk to the
          service or other users.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Intellectual property</LegalH2>
        <LegalP>
          The platform, branding, and software are protected by intellectual
          property laws. You retain rights in content you submit; you grant us
          the licence reasonably required to host, process, and display that
          content in accordance with the product and your visibility settings.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Disclaimers</LegalH2>
        <LegalP>
          The service is provided on an “as is” and “as available” basis to the
          extent permitted by law. See also our{" "}
          <a
            href="/disclaimer"
            className="text-neutral-900 underline decoration-neutral-300 underline-offset-[0.25em] transition hover:decoration-neutral-500"
          >
            Disclaimer
          </a>
          .
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Limitation of liability</LegalH2>
        <LegalP>
          To the maximum extent permitted by applicable law, we are not liable
          for indirect, incidental, special, consequential, or punitive
          damages, or for loss of profits, data, or goodwill, arising from your
          use of the platform. Our aggregate liability for any claim relating
          to the service is limited to the greater of amounts you paid us for
          the service in the twelve months before the claim or a nominal
          minimum where no fees applied, except where liability cannot be
          excluded by law.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Changes</LegalH2>
        <LegalP>
          We may modify these terms. Continued use after changes become
          effective constitutes acceptance of the revised terms where permitted
          by law. We will update the date above when we publish revisions.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Contact</LegalH2>
        <LegalP>
          General enquiries:{" "}
          <a
            href="/contact"
            className="text-neutral-900 underline decoration-neutral-300 underline-offset-[0.25em] transition hover:decoration-neutral-500"
          >
            Contact the registry
          </a>
          .
        </LegalP>
      </section>
    </LegalPageShell>
  );
}
