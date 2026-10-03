import type { Metadata } from "next";
import { Check } from "lucide-react";
import { LeadForm } from "@/components/site/LeadForm";
import { finalCta, hero } from "@/lib/content";
import type { Interest } from "@/lib/lead-options";

export const metadata: Metadata = {
  title: "Book a VILMS demo",
  description:
    "Book a 30-minute VILMS demo. We'll walk through your current setup and show exactly what moves over — courses, students and all.",
  alternates: { canonical: "/demo" },
};

// A direct landing page for ad campaigns that should open straight onto the
// form: /demo?utm_source=google&utm_medium=cpc&... (and ?intent=trial).
export default async function DemoPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const interest: Interest = sp.intent === "trial" ? "free_trial" : "book_demo";

  return (
    <section className="bg-paper py-12 sm:py-20">
      <div className="container-x grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <p className="eyebrow">{interest === "free_trial" ? "Start your 14-day trial" : finalCta.demo.kicker}</p>
          <h1 className="mt-3 text-[38px] font-extrabold leading-[1.02] sm:text-[52px]">
            {interest === "free_trial" ? "Get your institute online." : "See VILMS on your institute's setup."}
          </h1>
          <p className="lede mt-4">{finalCta.demo.text}</p>
          <ul className="mt-8 space-y-3">
            {[
              "Courses, live classes, tests and answer evaluation in one place",
              "Fees straight to your own Razorpay — 0% revenue share",
              "Your brand, your domain — students never see VILMS",
              "Plans from ₹499/month · 14-day free trial, no card",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[15.5px] text-ink">
                <Check aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ok" /> {t}
              </li>
            ))}
          </ul>
          <p className="mt-10 font-display text-[22px] font-bold text-ink">
            {hero.titleTop} <span className="text-brass-text">{hero.titleBottom}</span>
          </p>
        </div>

        <div className="card p-5 sm:p-8">
          <LeadForm interest={interest} location={interest === "free_trial" ? "demo_page_trial" : "demo_page"} />
        </div>
      </div>
    </section>
  );
}
