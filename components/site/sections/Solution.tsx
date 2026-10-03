import { ArrowRight, Award, BookOpen, Building2, GraduationCap, Magnet, PencilLine, PlayCircle, RefreshCw, UserCheck } from "lucide-react";
import { solution } from "@/lib/content";

const stepIcons = [Magnet, UserCheck, PlayCircle, PencilLine, Award, RefreshCw];

export function Solution() {
  return (
    <section id="solution" className="bg-surface py-20 sm:py-28" aria-labelledby="solution-title">
      <div className="container-x">
        <div className="max-w-3xl" data-reveal>
          <p className="eyebrow">03 — {solution.eyebrow}</p>
          <h2 id="solution-title" className="h-section mt-3">{solution.title}</h2>
          <p className="lede mt-4">{solution.sub}</p>
        </div>

        <ol className="relative mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6" data-reveal>
          <svg aria-hidden className="pointer-events-none absolute left-[8%] right-[8%] top-7 hidden h-1 lg:block" preserveAspectRatio="none" viewBox="0 0 100 2">
            <line x1="0" y1="1" x2="100" y2="1" stroke="#DDD9CE" strokeWidth="2" strokeDasharray="3 3" className="animate-dash-flow" vectorEffect="non-scaling-stroke" />
          </svg>
          {solution.steps.map((s, i) => {
            const Icon = stepIcons[i];
            const last = i === solution.steps.length - 1;
            return (
              <li key={s.title} className="relative text-center">
                <span
                  className={`relative mx-auto grid h-14 w-14 place-items-center rounded-full ring-8 ring-surface ${
                    last ? "bg-brass text-ink" : "bg-ink text-white"
                  }`}
                >
                  <Icon aria-hidden className="h-6 w-6" />
                </span>
                <p className="mt-3 font-mono text-[11px] text-faint">0{i + 1}</p>
                <p className="mt-1 font-display text-[16px] font-bold leading-tight text-ink">{s.title}</p>
                <p className="mt-1 text-[13px] text-muted">{s.text}</p>
              </li>
            );
          })}
        </ol>

        <p className="mt-16 font-mono text-[11.5px] uppercase tracking-[0.16em] text-faint">How it fits your institute</p>
        <div className="mt-4 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1.3fr_auto_1fr]" data-reveal>
          <div className="card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-50 text-ink-600"><Building2 aria-hidden className="h-5 w-5" /></span>
            <p className="mt-4 font-display text-[19px] font-bold text-ink">{solution.institute.title}</p>
            <p className="mt-1 text-[14px] text-muted">{solution.institute.text}</p>
          </div>
          <Arrow />
          <div className="rounded-xl2 bg-ink p-6 text-white shadow-lift">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-paper font-display text-[15px] font-extrabold text-ink">V</span>
              <span className="font-display text-[18px] font-bold">VILMS</span>
              <span className="ml-auto font-mono text-[11px] tracking-[0.16em] text-brass">ONE DATABASE</span>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2">
              {solution.database.map((d) => (
                <li key={d} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[13px] text-white/85">{d}</li>
              ))}
            </ul>
          </div>
          <Arrow />
          <div className="rounded-xl2 border border-brass/30 bg-brass-tint p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface text-brass-text"><GraduationCap aria-hidden className="h-5 w-5" /></span>
            <p className="mt-4 font-display text-[19px] font-bold text-ink">{solution.students.title}</p>
            <p className="mt-1 text-[14px] text-muted">{solution.students.text}</p>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div data-reveal>
            <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-faint">Your team — each role sees only what it should</p>
            <ul className="mt-4 space-y-3">
              {solution.roles.map((r) => (
                <li key={r.title} className="flex gap-3 rounded-xl border border-line p-4">
                  <BookOpen aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ink-600" />
                  <span>
                    <span className="block font-semibold text-ink">{r.title}</span>
                    <span className="block text-[14px] text-muted">{r.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal>
            <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-faint">Bring your own accounts — connected when you&apos;re ready</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {solution.integrations.map((i) => (
                <li key={i} className="chip px-3.5 py-2 text-[13.5px]">{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <div className="flex items-center justify-center text-line-strong" aria-hidden>
      <ArrowRight className="h-6 w-6 rotate-90 lg:rotate-0" />
    </div>
  );
}
