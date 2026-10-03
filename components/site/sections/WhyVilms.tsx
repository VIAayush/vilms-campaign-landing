import { IndianRupee, Landmark, Layers, Palette, Smartphone, TrendingDown } from "lucide-react";
import { whyVilms } from "@/lib/content";
import { Cta } from "../Cta";

const reasonIcons = [IndianRupee, Landmark, Smartphone, Palette, TrendingDown, Layers];
const max = Math.max(...whyVilms.rows.map((r) => r.value));

export function WhyVilms() {
  return (
    <section id="why-vilms" className="relative overflow-hidden bg-ink py-20 text-white sm:py-28" aria-labelledby="why-title">
      <span aria-hidden className="pointer-events-none absolute -right-40 top-10 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,#E8A33D_0%,transparent_70%)] opacity-15 blur-[80px]" />
      <div className="container-x relative">
        <div className="max-w-3xl" data-reveal>
          <p className="eyebrow-dark">05 — {whyVilms.eyebrow}</p>
          <h2 id="why-title" className="h-section mt-3 text-white">{whyVilms.title}</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-white/70">{whyVilms.sub}</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-xl2 border border-white/10 bg-white/[0.03]" data-reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <caption className="sr-only">Year-one cost comparison for an institute with 200 students paying ₹15,000 a year</caption>
              <thead>
                <tr className="border-b border-white/10 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/50">
                  <th scope="col" className="px-5 py-4 font-medium">Plan type</th>
                  <th scope="col" className="px-3 py-4 text-right font-medium">Platform fee</th>
                  <th scope="col" className="px-3 py-4 text-right font-medium">Commission</th>
                  <th scope="col" className="hidden px-3 py-4 font-medium md:table-cell"><span className="sr-only">Relative cost</span></th>
                  <th scope="col" className="px-5 py-4 text-right font-medium">Total, year one</th>
                </tr>
              </thead>
              <tbody>
                {whyVilms.rows.map((r) => (
                  <tr key={r.plan} className={`border-b border-white/10 last:border-0 ${r.us ? "bg-brass/10" : ""}`}>
                    <th scope="row" className="px-5 py-4 font-normal">
                      <span className={`block font-semibold ${r.us ? "text-brass" : "text-white"}`}>{r.plan}</span>
                      <span className="block text-[12.5px] text-white/50">{r.note}</span>
                    </th>
                    <td className="px-3 py-4 text-right font-mono text-[13.5px] text-white/80">{r.fee}</td>
                    <td className="px-3 py-4 text-right font-mono text-[13.5px] text-white/80">{r.commission}</td>
                    <td className="hidden w-[30%] px-3 py-4 md:table-cell">
                      <span className="block h-2 overflow-hidden rounded-full bg-white/10">
                        <span
                          className={`block h-full rounded-full ${r.us ? "bg-brass" : "bg-white/40"}`}
                          style={{ width: `${Math.max(3, (r.value / max) * 100)}%` }}
                        />
                      </span>
                    </td>
                    <td className={`px-5 py-4 text-right font-display text-[17px] font-bold ${r.us ? "text-brass" : "text-white"}`}>{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6" data-reveal>
          <p className="font-display text-[48px] font-extrabold leading-none text-brass sm:text-[64px]">{whyVilms.saving}</p>
          <p className="max-w-xl text-[16px] leading-relaxed text-white/80">{whyVilms.savingText}</p>
        </div>
        <p className="mt-4 max-w-4xl text-[12.5px] leading-relaxed text-white/45">{whyVilms.footnote}</p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {whyVilms.reasons.map((r, i) => {
            const Icon = reasonIcons[i];
            return (
              <div key={r.title} className="rounded-xl2 border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.07]" data-reveal>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brass text-ink"><Icon aria-hidden className="h-5 w-5" /></span>
                <p className="mt-4 font-display text-[18px] font-bold text-white">{r.title}</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/65">{r.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center" data-reveal>
          <Cta intent="demo" location="why_vilms" className="btn-brass" arrow>
            Talk to a VILMS expert
          </Cta>
          <p className="text-[14px] text-white/60">See what your institute would keep at your own numbers.</p>
        </div>
      </div>
    </section>
  );
}
