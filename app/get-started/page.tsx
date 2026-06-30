import type { Metadata } from "next";

import { GetStartedView } from "@/components/get-started/GetStartedView";
import { LandingPageShell } from "@/components/LandingPage/redesign";

export const metadata: Metadata = {
  title: "Take part · RROWM Registry",
  description:
    "Artist, institutional, or collector entry. Each path joins the same catalogue and chronology model.",
};

export default function GetStartedPage() {
  return (
    <LandingPageShell>
      <GetStartedView />
    </LandingPageShell>
  );
}
