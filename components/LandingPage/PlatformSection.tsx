"use client";

import { motion, useReducedMotion } from "framer-motion";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

const PLATFORM_FEATURES = [
  {
    title: "Artwork Registry",
    description:
      "Verified artworks recorded with unique registry identifiers and immutable timestamps.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
  },
  {
    title: "Cryptographic Certificates",
    description:
      "Blockchain-grade certificates issued for verified works with tamper-proof verification.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
  {
    title: "Provenance Ledger",
    description:
      "Complete ownership and provenance history recorded permanently and transparently.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
];

export function PlatformSection() {
  const reduce = useReducedMotion();

  return (
    <section className="py-24 md:py-32">
      <Container>
        <PageHeader
          title="A permanent registry for cultural works"
          description="RROWM provides artists and galleries with a permanent registry record for artworks, including certificates, provenance history, and cryptographic verification."
        />

        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px", amount: 0.2 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: reduce ? 0 : 0.1,
                delayChildren: reduce ? 0 : 0.06,
              },
            },
          }}
        >
          {PLATFORM_FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: reduce ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
            <Card>
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
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}


