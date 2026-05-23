import type { Metadata, Viewport } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import EnvironmentLayer from "@/components/EnvironmentLayer";
import Header from "@/components/Header";
import { Footer } from "@/components/LandingPage/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { LocalePreferencesProvider } from "@/components/providers/LocalePreferencesProvider";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RROWM Registry",
  description: "Cultural registry infrastructure",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">

      <body
        className={`${raleway.variable} font-sans antialiased min-h-[100dvh] overflow-x-clip`}
      >
        {/* Global Environment Background */}
        <EnvironmentLayer />

        {/* Application Layer */}
        <LocalePreferencesProvider>
          <div className="ds-z-content relative flex min-h-screen flex-col print:min-h-0">
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
