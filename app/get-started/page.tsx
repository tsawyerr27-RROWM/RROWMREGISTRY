import type { Metadata } from "next";
import { GetStartedView } from "@/components/get-started/GetStartedView";

export const metadata: Metadata = {
  title: "Get started — RROWM Registry",
  description:
    "Choose artist, gallery, or collector onboarding for the RROWM registry.",
};

export default function GetStartedPage() {
  return <GetStartedView />;
}
