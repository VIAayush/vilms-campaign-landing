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
    <section className="sec-dark noise overflow-hidden pb-20 pt-[120px] sm:pb-28 sm:pt-[150px]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow -left-32 top-0 h-[520px] w-[520px] bg-iris/40" />
        <div className="glow -right-32 bottom-0 h-[460px] w-[460px] bg-aqua/15" />
        <div className="grid-bg absolute inset-0" />
      </div>
      <div className="wrap grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <p className="kicker on-dark">{interest === "free_trial" ? "Start your 14-day trial" : finalCta.demo.kicker}</p>
          <h1 className="display mt-5 text-balance text-[clamp(38px,4.6vw,64px)]">
            {interest === "free_trial" ? "Get your institute online." : (
              <>
                See VILMS on your <span className="grad-text">institute&apos;s setup.</span>
              </>
            )}
          </h1>
          <p className="lead-text mt-5 max-w-[520px]">{finalCta.demo.text}</p>
          <ul className="mt-8 space-y-3">
            {[
              "Courses, live classes, tests and answer evaluation in one place",
              "Fees straight to your own Razorpay — 0% revenue share",
              "Your brand, your domain — students never see VILMS",
              "Plans from ₹499/month · 14-day free trial, no card",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[15.5px] text-white/80">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-aqua/15 text-aqua">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-10 font-display text-[22px] font-semibold tracking-tight">
            {hero.titleTop} <span className="warm-text">{hero.titleBottom}</span>
          </p>
        </div>

        <div className="rounded-[28px] bg-white p-5 text-night shadow-[0_50px_120px_-40px_rgba(0,0,0,.8)] sm:p-8">
          <LeadForm interest={interest} location={interest === "free_trial" ? "demo_page_trial" : "demo_page"} />
        </div>
      </div>
    </section>
  );
}
