import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About · RROWM Registry",
  description:
    "How the RROWM registry works: public record, authenticated certificates, ownership privacy, and system properties.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
