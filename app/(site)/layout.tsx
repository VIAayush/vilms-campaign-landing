import type { Viewport } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import { Footer } from "@/components/landing/Footer";
import { MobileCta } from "@/components/landing/MobileCta";
import { Navbar } from "@/components/landing/Navbar";
import { SiteProviders } from "@/components/site/SiteProviders";
import { ThirdPartyAnalytics } from "@/components/site/ThirdPartyAnalytics";
import { getSiteAnalyticsIds } from "@/lib/integrations/dispatch";
import "@/components/landing/landing.css";

// The public site's own type system. Same CSS variable names as the root
// layout, redefined here, so the CRM keeps its fonts.
const display = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const viewport: Viewport = { themeColor: "#070B1A" };

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // GA4 / Meta Pixel IDs from enabled CRM integrations (cached 5 minutes).
  const analytics = await getSiteAnalyticsIds();
  return (
    <div className={`v2 min-h-screen font-sans antialiased ${display.variable} ${sans.variable} ${mono.variable}`}>
      <SiteProviders>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-sun focus:px-4 focus:py-2 focus:font-semibold focus:text-night"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <MobileCta />
        <ThirdPartyAnalytics ga4Id={analytics.ga4} pixelId={analytics.pixel} />
      </SiteProviders>
    </div>
  );
}
