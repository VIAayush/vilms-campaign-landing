"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Check, CreditCard, IndianRupee, Smartphone } from "lucide-react";
import { Cta } from "@/components/site/Cta";
import { whyVilms } from "@/lib/content";
import { payments } from "@/lib/landing";
import { useInView, useReducedMotion } from "./hooks";

const inr = new Intl.NumberFormat("en-IN");

function useCountUp(target: number, run: boolean, ms = 1800) {
  const [v, setV] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!run) return;
    if (reduced) {
      const id = requestAnimationFrame(() => setV(target));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let t0 = -1;
    const loop = (t: number) => {
      if (t0 < 0) t0 = t;
      const k = Math.min(1, Math.max(0, (t - t0) / ms));
      setV(Math.round(target * (1 - Math.pow(1 - k, 4))));
      if (k < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [run, target, ms, reduced]);
  return v;
}

function Flow() {
  const reduced = useReducedMotion();
  const nodes = [
    { icon: Smartphone, title: "Student pays", text: "Checkout on your site" },
    { icon: CreditCard, title: "Your Razorpay", text: "UPI · cards · bank" },
    { icon: Building2, title: "Your account", text: "Fees land with you" },
  ];
  return (
    <div className="relative">
      <svg viewBox="0 0 600 120" className="absolute inset-x-0 top-[-22px] hidden h-[120px] w-full sm:block" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="flow" x1="0" x2="1">
            <stop offset="0" stopColor="#5B5BF6" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <path id="flowPath" d="M100 60 C 200 10, 250 10, 300 60 S 400 110, 500 60" fill="none" stroke="url(#flow)" strokeWidth="2" strokeDasharray="5 7" vectorEffect="non-scaling-stroke" />
        {!reduced && (
          <circle r="7" fill="#FFB547">
            <animateMotion dur="2.8s" repeatCount="indefinite" rotate="auto">
              <mpath href="#flowPath" />
            </animateMotion>
          </circle>
        )}
      </svg>
      <ol className="relative grid gap-4 sm:grid-cols-3">
        {nodes.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="flex flex-col items-center text-center" data-reveal data-delay={String(i + 1)}>
            <span className={`grid h-[76px] w-[76px] place-items-center rounded-[24px] ring-1 ${i === 2 ? "bg-emerald-400/15 text-emerald-300 ring-emerald-300/30" : "bg-white/[0.06] text-iris-300 ring-white/10"}`}>
              <Icon className="h-8 w-8" aria-hidden />
            </span>
            <p className="mt-4 font-display text-[17px] font-semibold tracking-tight">{title}</p>
            <p className="text-[13.5px] text-white/55">{text}</p>
          </li>
        ))}
      </ol>
      <div className="toast mx-auto mt-8 flex w-fit items-center gap-3 px-4 py-3" data-reveal="scale">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <IndianRupee className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <span>
          <span className="block text-[14px] font-semibold">₹15,000 received</span>
          <span className="block text-[12px] text-slate-500">VILMS commission: ₹0</span>
        </span>
      </div>
    </div>
  );
}

export function RevenueSection() {
  const numRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const numIn = useInView(numRef, { once: true, margin: "-20% 0px" });
  const barsIn = useInView(barsRef, { once: true, margin: "-15% 0px" });
  const fees = useCountUp(3000000, numIn);
  const max = Math.max(...whyVilms.rows.map((r) => r.value));

  return (
    <section id="why" aria-labelledby="why-title" className="sec-dark noise overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow -left-40 top-20 h-[500px] w-[500px] bg-iris/30" />
        <div className="glow -right-20 top-[45%] h-[600px] w-[600px] bg-sun/10" />
      </div>

      {/* Payments */}
      <div className="wrap grid items-center gap-14 py-24 sm:py-32 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="kicker on-dark" data-reveal>
            {payments.kicker}
          </p>
          <h2 className="h2 mt-4" data-reveal="blur" data-delay="1">
            {payments.title}
          </h2>
          <p className="lead-text mt-4 max-w-[520px]" data-reveal data-delay="2">
            {payments.sub}
          </p>
          <ul className="mt-7 flex flex-wrap gap-2">
            {payments.points.map((p) => (
              <li key={p} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[13px] text-white/75">
                <Check className="h-3.5 w-3.5 text-aqua" aria-hidden /> {p}
              </li>
            ))}
          </ul>
        </div>
        <Flow />
      </div>

      {/* 0% revenue share */}
      <div className="relative border-t border-white/10 py-24 sm:py-32">
        <div className="wrap text-center">
          <p className="kicker on-dark justify-center" data-reveal>
            0% revenue share — always
          </p>
          <div ref={numRef} className="mt-8">
            <p className="text-[15px] text-white/55">200 students × ₹15,000 a year in student fees</p>
            <p className="display mt-3 text-[clamp(52px,10vw,148px)] tabular-nums" aria-label="₹30,00,000">
              ₹{inr.format(fees)}
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-[760px] gap-px overflow-hidden rounded-[24px] bg-white/10 sm:grid-cols-2">
            <div className="bg-night-2 p-7 text-left" data-reveal data-delay="1">
              <p className="text-[13.5px] text-white/55">A 10%-commission platform keeps</p>
              <p className="mt-2 font-display text-[40px] font-semibold tracking-tight text-rose-300">−₹3,00,000</p>
            </div>
            <div className="bg-night-2 p-7 text-left" data-reveal data-delay="2">
              <p className="text-[13.5px] text-white/55">VILMS commission</p>
              <p className="mt-2 font-display text-[40px] font-semibold tracking-tight">
                <span className="warm-text">₹0</span>
              </p>
            </div>
          </div>
          <h2 id="why-title" className="h2 mx-auto mt-14 max-w-[820px]" data-reveal="blur">
            Keep <span className="warm-text">100%</span> of your student fee income.
          </h2>
          <p className="lead-text mx-auto mt-4 max-w-[600px]" data-reveal>
            {whyVilms.sub}
          </p>
        </div>

        {/* Year-one cost, from the brochure's worked example */}
        <div ref={barsRef} className="wrap mt-16">
          <div className="mx-auto max-w-[980px] rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">Total cost in year one · same institute</p>
            <ul className="mt-6 space-y-5">
              {whyVilms.rows.map((r, i) => (
                <li key={r.plan}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className={`text-[15px] font-semibold ${r.us ? "text-white" : "text-white/75"}`}>
                      {r.plan} <span className="ml-1 text-[12.5px] font-normal text-white/40">{r.note}</span>
                    </p>
                    <p className={`font-display text-[20px] font-semibold tabular-nums tracking-tight ${r.us ? "warm-text" : "text-white/80"}`}>{r.total}</p>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full transition-[width] duration-[1400ms] ease-out ${r.us ? "bg-gradient-to-r from-sun to-sun-600" : "bg-gradient-to-r from-iris/70 to-violet/70"}`}
                      style={{ width: barsIn ? `${Math.max(2, (r.value / max) * 100)}%` : "0%", transitionDelay: `${i * 140}ms` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
              <p className="max-w-[560px] text-[15px] text-white/70">
                <span className="font-display text-[26px] font-semibold text-white">{whyVilms.saving}</span> {whyVilms.savingText}
              </p>
              <Cta intent="demo" location="revenue_share" className="b b-cta shrink-0" arrow>
                Talk to a VILMS expert
              </Cta>
            </div>
            <p className="mt-6 text-[12px] leading-relaxed text-white/35">{whyVilms.footnote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
