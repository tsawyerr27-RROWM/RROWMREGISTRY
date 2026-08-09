import type { Metadata } from "next";
import { LegalH2, LegalP, LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Important limitations on registry records, data accuracy, and financial information.",
};

export default function DisclaimerPage() {
  return (
    <LegalPageShell title="Disclaimer" updated="3 April 2026">
      <section className="flex flex-col gap-4">
        <LegalH2>Not legal proof of ownership</LegalH2>
        <LegalP>
          RROWM Registry (“RROWM”) provides a structured record of information
          about artworks and related events. Nothing on the platform should be
          read as legal proof of ownership, title, or priority against third
          parties. Rights in rem, contractual arrangements, and statutory
          regimes may govern who holds enforceable title; the registry is an
          informational layer, not a land-title system for art.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Accuracy depends on submissions</LegalH2>
        <LegalP>
          Records reflect data supplied by users, integrations, and internal
          processing. While verification steps may apply in some cases, we do
          not warrant that any record is complete, current, or free from error.
          You should independently confirm facts that matter to you before
          relying on them in high-stakes decisions.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>No financial or investment advice</LegalH2>
        <LegalP>
          Any value figures, trends, or commentary surfaced in or around the
          platform are for informational purposes only. They do not constitute
          financial, investment, tax, or legal advice. You should consult
          qualified professionals before making financial or legal decisions.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>No valuation guarantees</LegalH2>
        <LegalP>
          Declared values and historical value events are not guarantees of
          market price, liquidity, or future performance. Markets, condition,
          provenance disputes, and other factors can cause outcomes to differ
          materially from any figure shown in the registry.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Third parties</LegalH2>
        <LegalP>
          Links or references to external sites, services, or parties do not
          imply endorsement. Your dealings with third parties are solely
          between you and them.
        </LegalP>
      </section>

      <section className="flex flex-col gap-4">
        <LegalH2>Contact</LegalH2>
        <LegalP>
          Questions about these limitations:{" "}
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
