import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MobileCtaBar } from "@/components/site/MobileCtaBar";
import { SiteProviders } from "@/components/site/SiteProviders";
import { ThirdPartyAnalytics } from "@/components/site/ThirdPartyAnalytics";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteProviders>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brass focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <MobileCtaBar />
      <ThirdPartyAnalytics />
    </SiteProviders>
  );
}
