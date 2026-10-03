import { ArrowRight, Globe, Mail, Receipt, Zap } from "lucide-react";
import { brand, finalCta } from "@/lib/content";
import { Cta } from "../Cta";

export function FinalCta() {
  return (
    <section id="book-demo" className="relative overflow-hidden bg-ink py-20 text-white sm:py-28" aria-labelledby="final-title">
      <span aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,#2A6E59_0%,transparent_70%)] opacity-70 blur-[70px]" />
      <div className="container-x relative">
        <div className="max-w-3xl" data-reveal>
          <p className="eyebrow-dark">{finalCta.eyebrow}</p>
          <h2 id="final-title" className="h-section mt-3 text-white">{finalCta.title}</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-white/70">{finalCta.sub}</p>
        </div>

        <div className="mt-10 rounded-xl2 bg-brass p-7 text-ink sm:p-10" data-reveal>
          <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink/70">{finalCta.demo.kicker}</p>
          <p className="mt-2 font-display text-[30px] font-extrabold leading-tight sm:text-[38px]">{finalCta.demo.title}</p>
          <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-ink/80">{finalCta.demo.text}</p>
          <Cta intent="demo" location="final_cta" className="btn mt-6 bg-ink px-6 py-3 text-base text-white hover:bg-ink-700" arrow>
            Book a VILMS Demo
          </Cta>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl2 border border-white/10 bg-white/[0.04] p-6" data-reveal>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brass/15 text-brass"><Zap aria-hidden className="h-5 w-5" /></span>
            <p className="mt-4 font-display text-[20px] font-bold text-white">{finalCta.trial.title}</p>
            <p className="mt-1.5 text-[14.5px] text-white/65">{finalCta.trial.text}</p>
            <Cta intent="trial" location="final_cta_trial" className="mt-4 inline-flex items-center gap-1.5 font-mono text-[13px] text-brass hover:text-brass-soft">
              Start your 14-day trial <ArrowRight aria-hidden className="h-3.5 w-3.5" />
            </Cta>
          </div>
          <div className="rounded-xl2 border border-white/10 bg-white/[0.04] p-6" data-reveal>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brass/15 text-brass"><Receipt aria-hidden className="h-5 w-5" /></span>
            <p className="mt-4 font-display text-[20px] font-bold text-white">{finalCta.quote.title}</p>
            <p className="mt-1.5 text-[14.5px] text-white/65">{finalCta.quote.text}</p>
            <a href={`mailto:${brand.emails.general}`} className="mt-4 inline-flex items-center gap-1.5 font-mono text-[13px] text-brass hover:text-brass-soft">
              {brand.emails.general} <ArrowRight aria-hidden className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <ul className="mt-10 grid gap-4 border-t border-white/10 pt-8 text-[14px] sm:grid-cols-3">
          <li className="flex items-center gap-3"><Globe aria-hidden className="h-5 w-5 text-brass" /><span><span className="block text-[12px] text-white/50">Website</span>{brand.domain}</span></li>
          <li className="flex items-center gap-3"><Mail aria-hidden className="h-5 w-5 text-brass" /><span><span className="block text-[12px] text-white/50">General &amp; support</span><a href={`mailto:${brand.emails.general}`} className="hover:text-brass-soft">{brand.emails.general}</a></span></li>
          <li className="flex items-center gap-3"><Receipt aria-hidden className="h-5 w-5 text-brass" /><span><span className="block text-[12px] text-white/50">Billing</span><a href={`mailto:${brand.emails.billing}`} className="hover:text-brass-soft">{brand.emails.billing}</a></span></li>
        </ul>
      </div>
    </section>
  );
}
