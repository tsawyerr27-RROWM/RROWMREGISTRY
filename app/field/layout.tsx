import type { Metadata } from "next";

import { FieldLayoutChrome } from "@/components/Field/FieldLayoutChrome";

export const metadata: Metadata = {
  title: "The Field · RROWM",
  description:
    "Public discovery and presence on RROWM — browse Creatives, Organisations, and Registry records.",
};

export default function FieldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FieldLayoutChrome>{children}</FieldLayoutChrome>;
}
