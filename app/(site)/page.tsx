import { Hero } from "@/components/site/sections/Hero";
import { Problem } from "@/components/site/sections/Problem";
import { Solution } from "@/components/site/sections/Solution";
import { Features } from "@/components/site/sections/Features";
import { WhyVilms } from "@/components/site/sections/WhyVilms";
import { Audience } from "@/components/site/sections/Audience";
import { Benefits } from "@/components/site/sections/Benefits";
import { Pricing } from "@/components/site/sections/Pricing";
import { FinalCta } from "@/components/site/sections/FinalCta";
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

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <WhyVilms />
      <Audience />
      <Benefits />
      <Pricing />
      <FinalCta />
    </>
  );
}
