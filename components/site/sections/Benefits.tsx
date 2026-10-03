import { Award, Eye, Filter, IndianRupee, Layers, RefreshCw, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { benefits } from "@/lib/content";
import { Cta } from "../Cta";

const icons = [IndianRupee, Layers, Zap, Sparkles, Filter, Users, Eye, Award, TrendingUp];

export function Benefits() {
  return (
    <section id="benefits" className="bg-surface py-20 sm:py-28" aria-labelledby="benefits-title">
      <div className="container-x">
        <div className="max-w-3xl" data-reveal>
          <p className="eyebrow">07 — {benefits.eyebrow}</p>
          <h2 id="benefits-title" className="h-section mt-3">{benefits.title}</h2>
          <p className="lede mt-4">{benefits.sub}</p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl2 border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {benefits.items.map((b, i) => {
            const Icon = icons[i];
            return (
              <div key={b.title} className="group bg-surface p-6 transition hover:bg-paper" data-reveal>
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-50 text-ink-600 transition group-hover:bg-ink group-hover:text-brass">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-[11px] text-faint">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-[18px] font-bold leading-snug">{b.title}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{b.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-6 rounded-xl2 bg-ink p-7 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between" data-reveal>
          <p className="max-w-2xl font-display text-[24px] font-bold leading-snug text-white sm:text-[28px]">
            {benefits.closing[0]} <span className="text-brass">{benefits.closing[1]}</span>
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <RefreshCw aria-hidden className="hidden h-6 w-6 text-brass lg:block" />
            <Cta intent="demo" location="benefits" className="btn-brass" arrow>
              See how VILMS can fit your institute
            </Cta>
          </div>
        </div>
      </div>
    </section>
  );
}
