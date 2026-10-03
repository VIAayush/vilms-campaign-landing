import { ArrowUpRight } from "lucide-react";
import { benefits } from "@/lib/content";

// Editorial list rather than a card grid: big type, one line each.
export function Benefits() {
  return (
    <section aria-labelledby="benefits-title" className="sec-dark noise overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow -left-32 top-1/3 h-[460px] w-[460px] bg-violet/25" />
      </div>
      <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="kicker on-dark" data-reveal>
            {benefits.eyebrow}
          </p>
          <h2 id="benefits-title" className="h2 mt-4" data-reveal="blur" data-delay="1">
            {benefits.title}
          </h2>
          <p className="lead-text mt-4 max-w-[420px]" data-reveal data-delay="2">
            {benefits.sub}
          </p>
          <p className="mt-10 max-w-[440px] font-display text-[22px] font-medium leading-snug tracking-tight text-white/90" data-reveal>
            {benefits.closing[0]} <span className="grad-text">{benefits.closing[1]}</span>
          </p>
        </div>
        <ol className="border-t border-white/10">
          {benefits.items.map((b, i) => (
            <li key={b.title} className="group border-b border-white/10" data-reveal>
              <div className="flex items-start gap-5 py-6 transition-[padding] duration-300 group-hover:pl-2 sm:gap-8">
                <span className="pt-1.5 font-mono text-[12px] text-white/35 transition-colors group-hover:text-aqua">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[clamp(21px,2.3vw,30px)] font-medium leading-tight tracking-tight">{b.title}</p>
                  <p className="mt-1.5 text-[15px] text-white/55">{b.text}</p>
                </div>
                <ArrowUpRight className="mt-1.5 hidden h-5 w-5 shrink-0 text-white/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-aqua sm:block" aria-hidden />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
