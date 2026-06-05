import type { Metadata } from "next";

import { FieldVerifyHubContent } from "@/components/Field/FieldVerifyHubContent";

export const metadata: Metadata = {
  title: "Verify · The Field",
  description:
    "Check verification and certificate status for a Registry record by its Registry ID.",
};

export default function FieldVerifyHubPage() {
  return <FieldVerifyHubContent />;
}
