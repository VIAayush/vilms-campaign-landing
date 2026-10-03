import {
  ArrowRight,
  Check,
  ClipboardList,
  FileSpreadsheet,
  IndianRupee,
  MessageCircle,
  MousePointerClick,
  Puzzle,
  Video,
} from "lucide-react";
import { problem } from "@/lib/content";

const icons = [MessageCircle, Video, ClipboardList, FileSpreadsheet, IndianRupee, MousePointerClick];

export function Problem() {
  return (
    <section id="problem" className="bg-paper py-20 sm:py-28" aria-labelledby="problem-title">
      <div className="container-x">
        <div className="max-w-3xl" data-reveal>
          <p className="eyebrow">02 — {problem.eyebrow}</p>
          <h2 id="problem-title" className="h-section mt-3">{problem.title}</h2>
          <p className="lede mt-4">{problem.sub}</p>
        </div>

        {/* Fragmented tools -> one platform */}
        <div className="mt-12 grid items-center gap-6 rounded-xl2 border border-line bg-surface p-5 shadow-card sm:p-8 lg:grid-cols-[1.3fr_auto_1fr]" data-reveal>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Today</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {problem.tools.map((t, i) => (
                <li
                  key={t}
                  className="rounded-lg border border-dashed border-err/30 bg-err-bg/50 px-3 py-2 text-[13.5px] font-semibold text-ink"
                  style={{ transform: `rotate(${[-1.5, 1, -0.5, 1.5, -1, 0.5, -1.2][i % 7]}deg)` }}
                >
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] text-muted">Seven places to check. Nothing connected.</p>
          </div>
          <div className="flex justify-center" aria-hidden>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brass text-ink lg:rotate-0">
              <ArrowRight className="h-5 w-5 rotate-90 lg:rotate-0" />
            </span>
          </div>
          <div className="rounded-xl bg-ink p-6 text-center text-white">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-paper font-display text-[22px] font-extrabold text-ink">V</span>
            <p className="mt-3 font-display text-[24px] font-bold leading-tight text-white">One platform.<br />One database.</p>
            <p className="mt-2 text-[13.5px] text-white/65">From first enquiry to certificate.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problem.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <article key={item.n} className="card flex flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lift" data-reveal>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-err-bg text-err">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <h3 className="flex-1 font-display text-[18px] font-bold leading-snug">{item.title}</h3>
                  <span className="font-mono text-[11px] text-faint">{item.n}</span>
                </div>
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{item.pain}</p>
                <p className="mt-auto flex gap-2 border-t border-dashed border-line pt-3 text-[14px] leading-snug text-ink">
                  <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                  <span><strong className="font-semibold">With VILMS:</strong> {item.fix}</span>
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex items-start gap-4 rounded-xl2 bg-ink p-6 text-white sm:items-center sm:p-8" data-reveal>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brass/15 text-brass">
            <Puzzle aria-hidden className="h-5 w-5" />
          </span>
          <p className="font-display text-[19px] font-semibold leading-snug sm:text-[22px]">{problem.closing}</p>
        </div>
      </div>
    </section>
  );
}
