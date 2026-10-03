import { Check } from "lucide-react";
import { Cta } from "@/components/site/Cta";
import { hero } from "@/lib/content";
import { HeroStage } from "./HeroStage";
import { Magnetic } from "./Magnetic";

export function Hero() {
  return (
    <section className="sec-dark noise overflow-hidden pb-24 pt-[120px] sm:pb-28 sm:pt-[150px]" aria-labelledby="hero-title">
      {/* Background: drifting light, a fading grid, passing streaks */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow left-[-10%] top-[-20%] h-[640px] w-[640px] animate-drift-a bg-iris/45" />
        <div className="glow right-[-12%] top-[5%] h-[560px] w-[560px] animate-drift-b bg-violet/35" />
        <div className="glow bottom-[10%] left-[30%] h-[420px] w-[520px] animate-drift-a bg-aqua/20" />
        <div className="grid-bg absolute inset-0" />
        <span className="streak left-0 top-[22%]" />
        <span className="streak left-0 top-[58%]" style={{ animationDelay: "4.5s" }} />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night" />
      </div>

      <div className="wrap text-center">
        <p className="in-1 mx-auto inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-[13px] font-medium text-white/80 backdrop-blur">
          <span className="relative grid h-2 w-2 place-items-center rounded-full bg-aqua text-aqua pulse-ring" />
          {hero.eyebrow}
        </p>

        <h1 id="hero-title" className="display mx-auto mt-7 max-w-[1240px] text-balance text-[clamp(44px,7.3vw,112px)]">
          <span className="in-2 block">{hero.titleTop}</span>
          <span className="in-3 block grad-text pb-[0.08em]">{hero.titleBottom}</span>
        </h1>

        <p className="in-3 lead-text mx-auto mt-7 max-w-[680px] !text-white/70">{hero.sub}</p>

        <div className="in-4 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Magnetic>
            <Cta intent="demo" location="hero" className="b b-cta h-[54px] px-7 text-[16px]" arrow>
              Book a Demo
            </Cta>
          </Magnetic>
          <Cta intent="trial" location="hero_trial" className="b b-glass h-[54px] px-7 text-[16px]">
            Start 14-Day Free Trial
          </Cta>
        </div>

        <ul className="in-4 mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13.5px] text-white/60">
          {hero.trust.map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-aqua" aria-hidden /> {t}
            </li>
          ))}
        </ul>

        <HeroStage />
      </div>
    </section>
  );
}
