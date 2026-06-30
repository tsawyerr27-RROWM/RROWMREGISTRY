import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About · RROWM",
  description:
    "Institutional record of RROWM: cultural infrastructure for authorship, stewardship, chronology, and the Studio · Registry · Field ecosystem.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
