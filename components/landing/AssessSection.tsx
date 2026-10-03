"use client";

import { useRef, useState } from "react";
import { BadgeCheck, CheckCircle2, KeyRound, MousePointer2, ShieldCheck, Smartphone, Sparkles, UserCheck } from "lucide-react";
import { Cta } from "@/components/site/Cta";
import { assess } from "@/lib/landing";
import { useInView, useReducedMotion, useTicker } from "./hooks";
import { AnswerSheet } from "./screens";

const RUBRIC = [
  { k: "Content", ai: "6", mentor: "6", max: "8" },
  { k: "Structure", ai: "3", mentor: "3", max: "4" },
  { k: "Examples", ai: "2", mentor: "3", max: "4" },
  { k: "Language", ai: "3", mentor: "3", max: "4" },
];
const FACT_ICONS = [KeyRound, UserCheck, ShieldCheck];

function Rubric({ step }: { step: number }) {
  return (
    <div className="space-y-1.5">
      {RUBRIC.map((r, i) => {
        const edited = step >= 2 && r.ai !== r.mentor;
        return (
          <div
            key={r.k}
            className={`pop flex items-center justify-between rounded-xl border px-3 py-2 text-[12.5px] transition-colors ${
              edited ? "border-aqua/50 bg-aqua-50" : "border-slate-200/80 bg-white"
            }`}
            style={{ animationDelay: step === 1 ? `${i * 0.18}s` : "0s" }}
          >
            <span className="text-slate-600">{r.k}</span>
            <span className="flex items-center gap-2 font-semibold">
              {edited ? (
                <>
                  <span className="text-slate-400 line-through">{r.ai}</span>
                  <span className="text-aqua-600">{r.mentor}</span>
                </>
              ) : (
                r.ai
              )}
              <span className="font-normal text-slate-400">/ {r.max}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RightPanel({ step }: { step: number }) {
  if (step === 0)
    return (
      <div key="s0" className="pop space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Submission</p>
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
          <p className="text-[13px] font-semibold">Rahul Kumar · Q3</p>
          <p className="text-[11.5px] text-slate-500">Long-form answer · 20 marks</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-iris to-aqua" style={{ animation: "sc-progress 2.6s ease-out both" }} />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Smartphone className="h-3.5 w-3.5" aria-hidden /> Photo uploaded from phone · 2 pages
          </p>
        </div>
      </div>
    );
  if (step === 1)
    return (
      <div key="s1" className="pop space-y-3">
        <span className="chip-ui bg-violet/10 text-violet">
          <Sparkles className="h-3 w-3" /> AI draft · not visible to student
        </span>
        <Rubric step={step} />
        <p className="rounded-xl bg-violet/5 px-3 py-2.5 text-[12px] leading-relaxed text-slate-600">
          <span className="caret">Clear introduction. Add one example to support the second point.</span>
        </p>
      </div>
    );
  if (step === 2)
    return (
      <div key="s2" className="pop relative space-y-3">
        <span className="chip-ui bg-aqua-50 text-aqua-600">
          <UserCheck className="h-3 w-3" /> Mentor reviewing
        </span>
        <Rubric step={step} />
        <MousePointer2 className="absolute right-6 top-[118px] h-5 w-5 fill-night text-white drop-shadow" aria-hidden />
        <p className="text-[11.5px] text-slate-500">Examples raised from 2 to 3 · edited by mentor</p>
      </div>
    );
  if (step === 3)
    return (
      <div key="s3" className="pop flex h-full flex-col justify-center space-y-4 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 pulse-ring">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </div>
        <p className="font-display text-[19px] font-semibold tracking-tight">Approved by mentor</p>
        <p className="mx-auto max-w-[260px] text-[12.5px] text-slate-500">Nothing reaches the student until a mentor approves it.</p>
        <span className="b b-sm mx-auto !min-h-[36px] bg-emerald-600 !px-4 !text-[12px] text-white">Release to student</span>
      </div>
    );
  return (
    <div key="s4" className="pop space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative grid h-[72px] w-[72px] place-items-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E2E8F0" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="url(#ring)" strokeWidth="3" strokeLinecap="round" pathLength={100} strokeDasharray="75 100" />
            <defs>
              <linearGradient id="ring">
                <stop offset="0" stopColor="#5B5BF6" />
                <stop offset="1" stopColor="#22D3EE" />
              </linearGradient>
            </defs>
          </svg>
          <span className="font-display text-[17px] font-semibold">15<span className="text-[11px] text-slate-400">/20</span></span>
        </div>
        <div>
          <p className="font-display text-[16px] font-semibold tracking-tight">Evaluated copy</p>
          <p className="text-[11.5px] text-slate-500">Marks, comments and rubric in one view</p>
        </div>
      </div>
      <Rubric step={4} />
      <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-emerald-600">
        <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Saved to Rahul&apos;s student profile
      </p>
    </div>
  );
}

export function AssessSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const reduced = useReducedMotion();
  const [manual, setManual] = useState<number | null>(null);
  const [tick] = useTicker(inView && !reduced && manual === null, 3400, assess.steps.length);
  const step = manual ?? (reduced ? assess.steps.length - 1 : tick);

  return (
    <section id="ai" aria-labelledby="ai-title" className="sec-dark noise overflow-hidden py-24 max-sm:py-20 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow left-1/2 top-[30%] h-[600px] w-[900px] -translate-x-1/2 bg-violet/25" />
        <div className="glow -left-40 bottom-0 h-[400px] w-[400px] bg-aqua/15" />
        <div className="grid-bg absolute inset-0 opacity-60" />
      </div>
      <div className="wrap">
        <div className="mx-auto max-w-[860px] text-center">
          <p className="kicker on-dark justify-center" data-reveal>
            {assess.kicker}
          </p>
          <h2 id="ai-title" className="h2 mt-4" data-reveal="blur" data-delay="1">
            {assess.titleTop}
            <br />
            <span className="grad-text">{assess.titleBottom}</span>
          </h2>
          <p className="lead-text mx-auto mt-5 max-w-[640px]" data-reveal data-delay="2">
            {assess.sub}
          </p>
        </div>

        <div ref={ref} className="glass mx-auto mt-14 max-w-[1080px] rounded-[30px] p-3 sm:p-5" data-reveal="scale">
          {/* Workflow steps */}
          <ol className="no-bar flex gap-1.5 overflow-x-auto pb-1" aria-label="Evaluation workflow">
            {assess.steps.map((s, i) => (
              <li key={s.id} className={`flex-1 max-sm:min-w-0 sm:min-w-[150px] ${i === step ? "max-sm:flex-[3]" : ""}`}>
                <button
                  type="button"
                  onClick={() => setManual(i)}
                  aria-current={i === step ? "step" : undefined}
                  aria-label={s.label}
                  className={`w-full rounded-2xl px-3.5 py-3 text-left transition max-sm:min-h-[48px] max-sm:px-2 ${i === step ? "bg-white/[0.1]" : "hover:bg-white/[0.04]"}`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full font-mono text-[10.5px] transition ${
                        i < step ? "bg-iris text-white" : i === step ? "bg-aqua text-night" : "bg-white/10 text-white/50"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`truncate text-[13.5px] font-semibold ${i === step ? "text-white" : "text-white/55 max-sm:hidden"}`}>{s.label}</span>
                  </span>
                  <span className="mt-2 block h-[2px] overflow-hidden rounded-full bg-white/10">
                    <span
                      key={`${i}-${step}-${manual}`}
                      className="block h-full bg-gradient-to-r from-iris to-aqua"
                      style={
                        i === step && manual === null && !reduced
                          ? { animation: "sc-progress 3.4s linear both" }
                          : { width: i <= step ? "100%" : "0%" }
                      }
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-3 grid gap-3 rounded-[22px] bg-[#F4F5FA] p-3 text-night sm:p-5 md:grid-cols-[1fr_1fr] md:gap-5">
            <div className="relative min-h-[260px] max-md:max-h-[200px] max-md:min-h-0 max-md:overflow-hidden max-md:rounded-xl">
              <AnswerSheet scanning={step === 1} />
              {step >= 3 && (
                <span className="pop absolute right-4 top-12 rotate-[-8deg] rounded-lg border-2 border-emerald-500 px-2 py-1 font-mono text-[12px] font-bold uppercase text-emerald-600">
                  Approved
                </span>
              )}
            </div>
            <div className="min-h-[300px] rounded-[18px] bg-white/60 p-3 max-md:min-h-[270px] sm:p-4" aria-live="polite">
              <RightPanel step={step} />
            </div>
          </div>
          <p className="px-2 pt-3 text-[13.5px] text-white/60">
            <span className="font-semibold text-white">{assess.steps[step].label}.</span> {assess.steps[step].text}
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-[1080px] gap-px overflow-hidden rounded-[24px] bg-white/10 sm:grid-cols-3">
          {assess.facts.map((f, i) => {
            const Icon = FACT_ICONS[i];
            return (
              <div key={f.title} className="bg-night p-6" data-reveal data-delay={String(i + 1)}>
                <Icon className="h-5 w-5 text-aqua" aria-hidden />
                <p className="mt-4 font-display text-[18px] font-semibold tracking-tight">{f.title}</p>
                <p className="mt-1.5 text-[14.5px] text-white/60">{f.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-10 flex max-w-[1080px] flex-col items-center justify-between gap-6 lg:flex-row">
          <ul className="flex flex-wrap justify-center gap-2 lg:justify-start">
            {assess.tests.map((t) => (
              <li key={t} className="rounded-full border border-white/10 px-3 py-1.5 text-[13px] text-white/70">
                {t}
              </li>
            ))}
          </ul>
          <Cta intent="demo" location="ai_evaluation" className="b b-cta shrink-0 max-sm:w-full" arrow>
            See evaluation in a demo
          </Cta>
        </div>
      </div>
    </section>
  );
}
