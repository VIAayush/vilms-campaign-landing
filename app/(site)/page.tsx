import { AssessSection } from "@/components/landing/AssessSection";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { Benefits } from "@/components/landing/Benefits";
import { BrandSection } from "@/components/landing/BrandSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { GrowSection } from "@/components/landing/GrowSection";
import { Hero } from "@/components/landing/Hero";
import { Lifecycle } from "@/components/landing/Lifecycle";
import { OldWay } from "@/components/landing/OldWay";
import { PricingSection } from "@/components/landing/PricingSection";
import { RevenueSection } from "@/components/landing/RevenueSection";
import { Showcase } from "@/components/landing/Showcase";
import { TeachSection } from "@/components/landing/TeachSection";
import { pricing } from "@/lib/content";
import { SITE_URL } from "@/lib/env";

// Structured data from the published price list — no ratings or reviews.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "VILMS",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web, Android, iOS",
  url: SITE_URL,
  description:
    "All-in-one learning platform for coaching institutes — courses, live classes, answer evaluation, payments and leads, under your own brand, with 0% revenue share.",
  offers: pricing.plans.map((p) => ({
    "@type": "Offer",
    name: p.name,
    price: p.price.replace(/[^\d]/g, ""),
    priceCurrency: "INR",
    description: `${p.students}. Price per month, excluding GST.`,
  })),
};

// The story: discover → understand → visualise → interact → trust → convert.
export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero />
      <OldWay />
      <Lifecycle />
      <Showcase />
      <TeachSection />
      <AssessSection />
      <GrowSection />
      <RevenueSection />
      <BrandSection />
      <AudienceSection />
      <Benefits />
      <PricingSection />
      <FinalCta />
    </>
  );
}
