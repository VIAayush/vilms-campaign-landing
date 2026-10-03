import { BriefcaseBusiness, Building2, Check, GraduationCap, Mic, Target, Wrench } from "lucide-react";
import { audience } from "@/lib/content";

const icons = [Building2, Target, Wrench, BriefcaseBusiness, GraduationCap, Mic];

export function Audience() {
  return (
    <section id="who-its-for" className="bg-paper py-20 sm:py-28" aria-labelledby="audience-title">
      <div className="container-x">
        <div className="max-w-3xl" data-reveal>
          <p className="eyebrow">06 — {audience.eyebrow}</p>
          <h2 id="audience-title" className="h-section mt-3">{audience.title}</h2>
          <p className="lede mt-4">{audience.sub}</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {audience.items.map((a, i) => {
            const Icon = icons[i];
            return (
              <article
                key={a.title}
                data-reveal
                className={`flex flex-col rounded-xl2 border bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift ${
                  a.core ? "border-ink ring-1 ring-ink" : "border-line"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${a.core ? "bg-ink text-brass" : "bg-ink-50 text-ink-600"}`}>
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  {a.core ? (
                    <span className="rounded-full bg-brass-tint px-2.5 py-1 font-mono text-[10.5px] tracking-wider text-brass-text">CORE FIT</span>
                  ) : null}
                </div>
                <h3 className="mt-4 font-display text-[19px] font-bold leading-snug">{a.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{a.text}</p>
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
                  {a.tags.map((t) => (
                    <li key={t} className="chip">{t}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl2 bg-ink p-6 text-white sm:p-8" data-reveal>
          <p className="font-display text-[20px] font-bold text-white">VILMS is a strong fit if…</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {audience.fit.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[15px] text-white/85">
                <Check aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-brass" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
