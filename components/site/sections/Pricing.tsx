import { Check, Users } from "lucide-react";
import { brand, pricing } from "@/lib/content";
import { Cta } from "../Cta";
import { TrackView } from "../TrackView";

export function Pricing() {
  const perStudent = pricing.plans.map((p) => ({ name: p.name, value: Number(p.perStudent.replace(/[^\d.]/g, "")), label: p.perStudent }));
  const maxPer = Math.max(...perStudent.map((p) => p.value));

  return (
    <section id="pricing" className="bg-paper py-20 sm:py-28" aria-labelledby="pricing-title">
      <TrackView name="pricing_view" />
      <div className="container-x">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-reveal>
          <div className="max-w-2xl">
            <p className="eyebrow">08 — {pricing.eyebrow}</p>
            <h2 id="pricing-title" className="h-section mt-3">{pricing.title}</h2>
          </div>
          <ul className="flex flex-wrap gap-2">
            {pricing.trialNote.map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-white">
                <Check aria-hidden className="h-3.5 w-3.5 text-brass" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
          {pricing.plans.map((p) => {
            const dark = Boolean(p.featured);
            return (
              <article
                key={p.id}
                data-reveal
                className={`relative flex flex-col rounded-xl2 p-6 ${
                  dark ? "bg-ink text-white shadow-float lg:-my-3 lg:py-9" : "border border-line bg-surface shadow-card"
                }`}
              >
                <p className={`font-mono text-[11px] uppercase tracking-[0.14em] ${dark ? "text-brass-soft" : "text-faint"}`}>{p.stage}</p>
                <h3 className={`mt-2 font-display text-[24px] font-bold ${dark ? "text-white" : ""}`}>{p.name}</h3>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className={`font-display text-[40px] font-extrabold leading-none ${dark ? "text-white" : "text-ink"}`}>{p.price}</span>
                  <span className={`text-[14px] ${dark ? "text-white/60" : "text-muted"}`}>/mo</span>
                </p>
                <p className={`mt-1 text-[14px] font-semibold ${dark ? "text-white" : "text-ink"}`}>{p.students}</p>
                <p className={`text-[13px] font-semibold ${dark ? "text-brass" : "text-brass-text"}`}>{p.perStudent} per student / month</p>

                <p className={`mt-4 border-t pt-4 text-[14px] leading-relaxed ${dark ? "border-white/15 text-white/75" : "border-line text-muted"}`}>
                  {p.blurb}
                </p>
                <ul className="mt-4 space-y-2">
                  {p.points.map((pt) => (
                    <li key={pt} className={`flex items-start gap-2 text-[14px] ${dark ? "text-white/85" : "text-ink"}`}>
                      <Check aria-hidden className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? "text-brass" : "text-ok"}`} /> {pt}
                    </li>
                  ))}
                </ul>
                <div className={`mt-5 rounded-xl p-3 text-[13px] ${dark ? "bg-white/[0.07] text-white/80" : "bg-paper text-muted"}`}>
                  <p className={`flex items-center gap-1.5 font-semibold ${dark ? "text-white" : "text-ink"}`}>
                    <Users aria-hidden className="h-3.5 w-3.5" /> Onboarding:
                  </p>
                  <p className="mt-0.5">{p.onboarding}</p>
                </div>
                <div className="mt-auto pt-6">
                  <Cta intent="trial" location={`pricing_${p.id}`} className={`${dark ? "btn-brass" : "btn-ghost"} w-full`}>
                    Start on {p.name}
                  </Cta>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 rounded-xl2 bg-ink p-6 text-white sm:p-8 lg:grid-cols-[1fr_1.4fr] lg:items-end" data-reveal>
          <div>
            <p className="eyebrow-dark">What it costs per student</p>
            <p className="mt-2 font-display text-[24px] font-bold leading-tight text-white">The bigger you are, the cheaper it gets.</p>
            <p className="mt-2 text-[13.5px] text-white/60">Rupees per student, per month, at each plan&apos;s own student limit.</p>
          </div>
          <div className="flex h-40 items-end gap-3 sm:gap-6">
            {perStudent.map((p, i) => (
              <div key={p.name} className="flex flex-1 flex-col items-center justify-end gap-2">
                <span className="font-display text-[16px] font-bold text-white sm:text-[20px]">{p.label}</span>
                <span
                  className={`block w-full max-w-[72px] rounded-t-lg ${i === perStudent.length - 1 ? "bg-brass" : "bg-white/25"}`}
                  style={{ height: `${Math.max(10, (p.value / maxPer) * 88)}px` }}
                />
                <span className="font-mono text-[11px] text-white/60">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl2 border border-line bg-surface p-6 sm:p-8" data-reveal>
          <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-faint">On every plan</p>
          <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            {pricing.everyPlan.map((e) => (
              <li key={e} className="flex items-start gap-2 text-[14.5px] text-ink">
                <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ok" /> {e}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-5 text-[13px] leading-relaxed text-muted">
          {pricing.footnote} Teaching more than 15,000 students? Write to{" "}
          <a href={`mailto:${brand.emails.general}`} className="font-semibold text-ink underline underline-offset-2">{brand.emails.general}</a> for a quote.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl2 border border-dashed border-line-strong p-6 text-center sm:flex-row sm:justify-between sm:text-left" data-reveal>
          <p className="font-display text-[19px] font-bold text-ink">Not sure which plan fits your institute?</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Cta intent="demo" location="pricing_footer" className="btn-ink" arrow>
              Book a Demo
            </Cta>
            <Cta intent="trial" location="pricing_footer_trial" className="btn-ghost">
              Start Free Trial
            </Cta>
          </div>
        </div>
      </div>
    </section>
  );
}
