import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";

const FEATURES = [
  {
    title: "Immutable Records",
    description:
      "Once registered, artwork records are cryptographically sealed and cannot be altered, ensuring permanent authenticity.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    ),
  },
  {
    title: "Public Verification",
    description:
      "Anyone can verify the authenticity of registered artworks through our public registry interface.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    ),
  },
  {
    title: "Value History",
    description:
      "Track declared values, appraisals, and sales data with customizable visibility controls.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    ),
  },
  {
    title: "Transfer Tracking",
    description:
      "Complete ownership chain recorded from artist to current owner with timestamped events.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    ),
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <PageHeader
          title="Built for authenticity and transparency"
          description="Industry-leading tools for artwork verification and provenance tracking."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {FEATURES.map((feature, i) => (
            <div key={i} className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-neutral-900"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {feature.icon}
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}


