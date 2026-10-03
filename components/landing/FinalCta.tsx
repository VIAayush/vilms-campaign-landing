import { CalendarCheck, Mail, Rocket } from "lucide-react";
import { Cta } from "@/components/site/Cta";
import { brand, finalCta } from "@/lib/content";
import { Magnetic } from "./Magnetic";

export function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="sec-dark noise overflow-hidden py-28 sm:py-40">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow left-1/2 top-1/2 h-[620px] w-[980px] -translate-x-1/2 -translate-y-1/2 animate-drift-a" style={{ background: "radial-gradient(closest-side, rgba(91,91,246,.55), rgba(139,92,246,.25), transparent)" }} />
        <div className="grid-bg absolute inset-0" />
      </div>
      <div className="wrap text-center">
        <p className="kicker on-dark justify-center" data-reveal>
          {finalCta.eyebrow}
        </p>
        <h2 id="final-title" className="display mx-auto mt-6 max-w-[1000px] text-[clamp(40px,6.6vw,92px)]" data-reveal="blur" data-delay="1">
          Ready to bring your institute onto <span className="grad-text">one platform?</span>
        </h2>
        <p className="lead-text mx-auto mt-6 max-w-[620px]" data-reveal data-delay="2">
          {finalCta.sub}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row" data-reveal data-delay="3">
          <Magnetic>
            <Cta intent="demo" location="final_cta" className="b b-cta h-[56px] px-8 text-[16px]" arrow>
              Book a Demo
            </Cta>
          </Magnetic>
          <Cta intent="trial" location="final_cta_trial" className="b b-glass h-[56px] px-8 text-[16px]">
            Start 14-Day Free Trial
          </Cta>
        </div>

        <ul className="mx-auto mt-16 grid max-w-[980px] gap-px overflow-hidden rounded-[24px] bg-white/10 text-left sm:grid-cols-3">
          <li className="bg-night p-6" data-reveal data-delay="1">
            <CalendarCheck className="h-5 w-5 text-aqua" aria-hidden />
            <p className="mt-3 font-display text-[17px] font-semibold tracking-tight">{finalCta.demo.title}</p>
            <p className="mt-1 text-[14px] text-white/55">{finalCta.demo.text}</p>
          </li>
          <li className="bg-night p-6" data-reveal data-delay="2">
            <Rocket className="h-5 w-5 text-sun" aria-hidden />
            <p className="mt-3 font-display text-[17px] font-semibold tracking-tight">{finalCta.trial.title}</p>
            <p className="mt-1 text-[14px] text-white/55">{finalCta.trial.text}</p>
          </li>
          <li className="bg-night p-6" data-reveal data-delay="3">
            <Mail className="h-5 w-5 text-iris-300" aria-hidden />
            <p className="mt-3 font-display text-[17px] font-semibold tracking-tight">{finalCta.quote.title}</p>
            <p className="mt-1 text-[14px] text-white/55">
              {finalCta.quote.text}{" "}
              <a href={`mailto:${brand.emails.general}`} className="text-white underline underline-offset-2">
                {brand.emails.general}
              </a>
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
