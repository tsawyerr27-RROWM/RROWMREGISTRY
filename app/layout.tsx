import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Suspense } from "react";

import EnvironmentLayer from "@/components/EnvironmentLayer";
import Header from "@/components/Header";
import { Footer } from "@/components/LandingPage/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { LocalePreferencesProvider } from "@/components/providers/LocalePreferencesProvider";
import NavigationHistory from "@/components/navigation/NavigationHistory";
import { parseRegionId, REGION_STORAGE_KEY } from "@/lib/regions";
import { rrowmV2Scope } from "@/styles/rrowm-v2";

export const dynamic = "force-dynamic";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-landing-display",
  display: "swap",
});

const uiFont = Inter({
  subsets: ["latin"],
  variable: "--font-landing-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RROWM Registry",
  description: "Cultural registry infrastructure",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const initialRegionId =
    parseRegionId(cookieStore.get(REGION_STORAGE_KEY)?.value) ?? "gb";

  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${displayFont.variable} ${uiFont.variable} v2-type-body antialiased min-h-[100dvh] overflow-x-clip`}
      >
        <Suspense fallback={null}>
          <NavigationHistory />
        </Suspense>

        <EnvironmentLayer />

        <LocalePreferencesProvider initialRegionId={initialRegionId}>
          <div
            className={`${rrowmV2Scope} ds-z-content relative flex min-h-screen flex-col print:min-h-0`}
          >
            <Header />
            <main className="flex-1 print:min-h-0">{children}</main>
            <Footer />
            <CookieBanner />
          </div>
        </LocalePreferencesProvider>
      </body>
    </html>
  );
}
