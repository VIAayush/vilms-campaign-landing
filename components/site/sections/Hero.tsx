import { Check, Clock, IndianRupee, Palette, Zap } from "lucide-react";
import { facts, hero } from "@/lib/content";
import { Cta } from "../Cta";
import { HeroMock } from "../mocks";

const factIcons = [IndianRupee, Palette, Zap, Clock];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white" aria-labelledby="hero-title">
      {/* Slow-moving brand glow behind the hero. Decorative. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute -right-32 -top-48 h-[620px] w-[620px] animate-aurora-a rounded-full bg-[radial-gradient(circle,#E8A33D_0%,transparent_70%)] opacity-25 blur-[70px]" />
        <span className="absolute -bottom-56 -left-40 h-[560px] w-[560px] animate-aurora-b rounded-full bg-[radial-gradient(circle,#2A6E59_0%,transparent_70%)] opacity-60 blur-[70px]" />
        <span className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      </div>

      <div className="container-x relative grid items-center gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.02fr_1fr] lg:gap-12 lg:pb-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brass/40 bg-brass/10 px-3.5 py-1.5 text-[13px] font-semibold text-brass-soft">
            <span aria-hidden>◆</span> {hero.eyebrow}
          </span>
          <h1 id="hero-title" className="mt-6 text-[44px] font-extrabold leading-[0.98] text-white sm:text-[60px] lg:text-[68px]">
            {hero.titleTop}
            <br />
            <span className="text-brass">{hero.titleBottom}</span>
          </h1>
          <p className="mt-6 max-w-[560px] text-[17.5px] leading-relaxed text-white/75 sm:text-[19px]">{hero.sub}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Cta intent="demo" location="hero" className="btn-brass px-6 py-3 text-base" arrow>
              Book a Demo
            </Cta>
            <Cta intent="trial" location="hero_trial" className="btn-ghost-dark px-6 py-3 text-base">
              Start 14-Day Free Trial
            </Cta>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-white/65">
            {hero.trust.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check aria-hidden className="h-4 w-4 text-brass" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:pl-4">
          <HeroMock />
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <p className="container-x flex flex-wrap justify-center gap-x-4 gap-y-1 py-5 text-center font-mono text-[11.5px] tracking-[0.2em] text-white/55">
          {hero.strip.map((s, i) => (
            <span key={s} className="uppercase">
              {s}
              {i < hero.strip.length - 1 ? <span aria-hidden className="ml-4 text-brass/60">·</span> : null}
            </span>
          ))}
        </p>
      </div>

      <div className="relative bg-paper text-body">
        <div className="container-x grid grid-cols-2 gap-px overflow-hidden py-0 lg:grid-cols-4">
          {facts.map((f, i) => {
            const Icon = factIcons[i];
            return (
              <div key={f.title} className="flex items-center gap-3 px-2 py-6 sm:px-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-brass">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-display text-[15.5px] font-bold leading-tight text-ink">{f.title}</span>
                  <span className="block text-[13px] text-muted">{f.text}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
