import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Link from "next/link";

const INTELLIGENCE_FEATURES = [
  {
    title: "Collection value at a glance",
    description:
      "Declared value across registered works, with value events over time in one place.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    title: "Collection health",
    description:
      "Verification status, certificates, and ownership activity in one view.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    title: "Ownership intelligence",
    description:
      "Transfer counts, ownership requests, and a clear ledger of who has held each work.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    ),
  },
];

export function PortfolioIntelligenceSection() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <PageHeader
          title="Your collection, understood"
          description="Value progression, collection health, and ownership activity alongside the public registry."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INTELLIGENCE_FEATURES.map((feature, i) => (
            <Card key={i}>
              <div className="liquid-glass-inset mb-4 flex h-12 w-12 items-center justify-center">
                <svg
                  className="w-6 h-6 text-neutral-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/get-started"
            className="inline-block rounded-xl bg-neutral-950 px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-black"
          >
            Sign in to your studio
          </Link>
        </div>
      </Container>
    </section>
  );
}
