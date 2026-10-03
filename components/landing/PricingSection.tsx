"use client";

import { useId, useRef, useState } from "react";
import { Check, Mail, Minus } from "lucide-react";
import { Cta } from "@/components/site/Cta";
import { TrackView } from "@/components/site/TrackView";
import { brand, finalCta, pricing, type Plan } from "@/lib/content";
import { useInView } from "./hooks";

const LIMITS: Record<Plan["id"], number> = { base: 500, growth: 2000, scale: 5000, institute: 15000 };
const PRICES: Record<Plan["id"], number> = { base: 499, growth: 1199, scale: 2499, institute: 4999 };
const plans = pricing.plans as Plan[];
const inr = new Intl.NumberFormat("en-IN");

// Slider runs on a log scale so 50 and 15,000 students both get room.
const MIN = 50;
const MAX = 20000;
const toStudents = (v: number) => Math.round(Math.exp(Math.log(MIN) + (v / 1000) * (Math.log(MAX) - Math.log(MIN))) / 10) * 10;
const toSlider = (n: number) => Math.round(((Math.log(Math.min(MAX, Math.max(MIN, n))) - Math.log(MIN)) / (Math.log(MAX) - Math.log(MIN))) * 1000);

const COMPARE: { label: string; values: [string, string, string, string] }[] = [
  { label: "Students", values: ["Up to 500", "Up to 2,000", "Up to 5,000", "Up to 15,000"] },
  { label: "Price per student / month", values: ["₹1.00", "₹0.60", "₹0.50", "₹0.33"] },
  { label: "Full platform + your own website", values: ["✓", "✓", "✓", "✓"] },
  { label: "Branches", values: ["Single institute", "Multiple", "Multiple", "Multiple"] },
  { label: "Your branded app", values: ["—", "Android", "Android + iOS", "Android + iOS"] },
  { label: "Also included", values: ["—", "—", "Bigger library · priority support", "Unlimited staff · 2 TB library · dedicated manager"] },
  { label: "Onboarding", values: ["Self-serve + guided setup call", "Done-for-you migration", "Done-for-you migration", "Done-for-you migration + faculty training"] },
];

function PlanCard({ plan, match }: { plan: Plan; match: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const fill = (Math.log(LIMITS[plan.id]) / Math.log(15000)) * 100;
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={`group relative flex w-[82vw] max-w-[340px] shrink-0 snap-center flex-col overflow-hidden rounded-[28px] border bg-white p-6 transition duration-300 hover:-translate-y-1 sm:w-auto sm:max-w-none ${
        match ? "border-iris shadow-[0_30px_80px_-30px_rgba(91,91,246,.55)]" : "border-slate-200 shadow-[0_20px_60px_-45px_rgba(11,16,32,.6)] hover:shadow-[0_30px_70px_-40px_rgba(11,16,32,.55)]"
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(320px circle at var(--mx, 50%) var(--my, 0%), rgba(91,91,246,.10), transparent 60%)" }}
      />
      <div className="relative flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">{plan.stage}</p>
        {match && <span className="pop rounded-full bg-iris px-2.5 py-1 text-[11px] font-semibold text-white">Fits your size</span>}
      </div>
      <p className="relative mt-3 font-display text-[24px] font-semibold tracking-tight">{plan.name}</p>
      <p className="relative mt-4 flex flex-wrap items-baseline gap-x-1">
        <span className="font-display text-[44px] font-semibold leading-none tracking-tight lg:text-[clamp(32px,3vw,46px)]">{plan.price}</span>
        <span className="text-[14px] text-slate-500">/month</span>
      </p>
      <p className="relative mt-2 text-[14px] font-medium text-night">{plan.students}</p>
      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
        <div className="h-full rounded-full bg-gradient-to-r from-iris to-aqua" style={{ width: `${fill}%` }} />
      </div>
      <p className="relative mt-2 text-[12.5px] text-slate-500">{plan.perStudent} per student / month</p>
      <p className="relative mt-5 text-[14.5px] leading-relaxed text-slate-600">{plan.blurb}</p>
      <ul className="relative mt-5 space-y-2">
        {plan.points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-[14px] text-slate-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-iris" aria-hidden /> {p}
          </li>
        ))}
      </ul>
      <p className="relative mt-5 border-t border-slate-100 pt-4 text-[12.5px] text-slate-500">
        <span className="font-semibold text-slate-700">Onboarding:</span> {plan.onboarding}
      </p>
      <div className="relative mt-auto pt-6">
        <Cta intent="trial" location={`pricing_${plan.id}`} className={`b w-full ${match ? "b-cta" : "b-dark"}`}>
          Start on {plan.name}
        </Cta>
      </div>
    </div>
  );
}

export function PricingSection() {
  const id = useId();
  const [students, setStudents] = useState(1200);
  const matched = plans.find((p) => students <= LIMITS[p.id]);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartIn = useInView(chartRef, { once: true, margin: "-15% 0px" });

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="relative overflow-hidden bg-white py-24 sm:py-32">
      <TrackView name="pricing_view" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[560px]" style={{ background: "radial-gradient(45% 60% at 50% 0%, rgba(34,211,238,.12), transparent 70%)" }} />
      <div className="wrap relative">
        <div className="mx-auto max-w-[780px] text-center">
          <p className="kicker justify-center" data-reveal>
            {pricing.eyebrow}
          </p>
          <h2 id="pricing-title" className="h2 mt-4" data-reveal="blur" data-delay="1">
            {pricing.title}
          </h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-2" data-reveal data-delay="2">
            {pricing.trialNote.map((t) => (
              <li key={t} className="flex items-center gap-1.5 rounded-full bg-snow px-3.5 py-1.5 text-[13.5px] font-medium text-slate-700 ring-1 ring-slate-200">
                <Check className="h-3.5 w-3.5 text-iris" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Plan finder */}
        <div className="mx-auto mt-12 max-w-[980px] overflow-hidden rounded-[28px] bg-night text-white" data-reveal="scale">
          <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <p className="font-display text-[22px] font-semibold tracking-tight">Find your VILMS plan</p>
              <label htmlFor={`${id}-n`} className="mt-1 block text-[14px] text-white/55">
                How many students do you teach?
              </label>
              <div className="mt-5 flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={toSlider(students)}
                  onChange={(e) => setStudents(toStudents(Number(e.target.value)))}
                  aria-label="Number of students"
                  aria-valuetext={`${inr.format(students)} students`}
                  className="h-2 w-full cursor-pointer accent-aqua"
                />
                <input
                  id={`${id}-n`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={100000}
                  value={students}
                  onChange={(e) => setStudents(Math.max(1, Math.min(100000, Number(e.target.value) || 1)))}
                  className="w-[110px] rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-right font-mono text-[15px] text-white outline-none focus:border-aqua"
                />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10.5px] text-white/35">
                <span>50</span>
                <span>500</span>
                <span>2,000</span>
                <span>5,000</span>
                <span>15,000+</span>
              </div>
            </div>
            <div className="rounded-[20px] bg-white/[0.06] p-5 ring-1 ring-white/10" aria-live="polite">
              {matched ? (
                <div key={matched.id} className="pop">
                  <p className="text-[13px] text-white/55">Recommended plan for {inr.format(students)} students</p>
                  <p className="mt-1 font-display text-[30px] font-semibold tracking-tight">
                    {matched.name} <span className="warm-text">{matched.price}</span>
                    <span className="text-[15px] font-normal text-white/50">/month</span>
                  </p>
                  <p className="mt-1 text-[13px] text-white/55">
                    {matched.students} · about ₹{(PRICES[matched.id] / students).toFixed(2)} per student at your size
                  </p>
                  <Cta intent="trial" location={`plan_finder_${matched.id}`} className="b b-cta b-sm mt-4">
                    Start on {matched.name}
                  </Cta>
                </div>
              ) : (
                <div key="quote" className="pop">
                  <p className="font-display text-[22px] font-semibold tracking-tight">{finalCta.quote.title}</p>
                  <p className="mt-1 text-[13.5px] text-white/60">{finalCta.quote.text}</p>
                  <a href={`mailto:${brand.emails.general}?subject=Custom%20quote%20for%20large%20operations`} className="b b-glass b-sm mt-4">
                    <Mail className="h-4 w-4" aria-hidden /> {brand.emails.general}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="no-bar -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} match={matched?.id === p.id} />
          ))}
        </div>

        {/* Price per student */}
        <div ref={chartRef} className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div data-reveal>
            <p className="font-display text-[28px] font-semibold leading-tight tracking-tight">The bigger you are, the cheaper it gets.</p>
            <p className="mt-2 text-[15px] text-slate-600">Rupees per student, per month, at each plan&apos;s own student limit.</p>
          </div>
          <div className="flex h-[200px] items-end gap-4 sm:gap-8" aria-label="Price per student by plan">
            {plans.map((p, i) => {
              const v = Number(p.perStudent.replace(/[^\d.]/g, ""));
              return (
                <div key={p.id} className="flex flex-1 flex-col items-center gap-2">
                  <span className="font-display text-[18px] font-semibold tracking-tight">{p.perStudent}</span>
                  <div className="flex h-[130px] w-full items-end">
                    <div
                      className="w-full rounded-t-2xl bg-gradient-to-t from-iris to-aqua transition-[height] duration-[1200ms] ease-out"
                      style={{ height: chartIn ? `${v * 100}%` : "0%", transitionDelay: `${i * 120}ms`, opacity: 0.35 + (1 - v) * 0.9 }}
                    />
                  </div>
                  <span className="text-[13px] text-slate-500">{p.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison */}
        <details className="group mt-16 overflow-hidden rounded-[24px] border border-slate-200" data-reveal>
          <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-display text-[18px] font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
            Compare plans side by side
            <span className="grid h-8 w-8 place-items-center rounded-full bg-snow text-[18px] transition group-open:rotate-45">+</span>
          </summary>
          <div className="no-bar overflow-x-auto border-t border-slate-200">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead>
                <tr className="bg-snow">
                  <th scope="col" className="px-6 py-3 font-medium text-slate-500">
                    <span className="sr-only">Feature</span>
                  </th>
                  {plans.map((p) => (
                    <th key={p.id} scope="col" className="px-4 py-3 font-display text-[15px] font-semibold">
                      {p.name} <span className="font-sans text-[13px] font-normal text-slate-500">{p.price}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARE.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="px-6 py-3.5 font-medium text-slate-600">
                      {row.label}
                    </th>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-4 py-3.5 text-slate-700">
                        {v === "✓" ? <Check className="h-4 w-4 text-iris" aria-label="Included" /> : v === "—" ? <Minus className="h-4 w-4 text-slate-300" aria-label="Not included" /> : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        {/* On every plan */}
        <div className="mt-12 rounded-[24px] bg-snow p-6 sm:p-8" data-reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">On every plan</p>
          <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            {pricing.everyPlan.map((e) => (
              <li key={e} className="flex items-start gap-2 text-[14.5px] text-slate-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-iris" aria-hidden /> {e}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-slate-200 pt-5 text-[13px] leading-relaxed text-slate-500">
            {pricing.footnote} {finalCta.quote.title.replace("Teaching", "Teaching more than").replace("15,000+", "15,000")} Write to{" "}
            <a href={`mailto:${brand.emails.general}`} className="font-semibold text-night underline underline-offset-2">
              {brand.emails.general}
            </a>{" "}
            for a quote.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row" data-reveal>
          <p className="text-[15px] text-slate-600">Not sure which plan fits your institute?</p>
          <Cta intent="demo" location="pricing_footer" className="b b-cta" arrow>
            Book a Demo
          </Cta>
          <Cta intent="trial" location="pricing_footer_trial" className="b b-line">
            Start Free Trial
          </Cta>
        </div>
      </div>
    </section>
  );
}
