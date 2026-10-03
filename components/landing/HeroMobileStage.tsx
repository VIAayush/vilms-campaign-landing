"use client";

import { useRef } from "react";
import { heroEvents, lifecycleChain } from "@/lib/landing";
import { ICON, STEP, TONE } from "./HeroStage";
import { useInView, useReducedMotion, useTicker } from "./hooks";

const N = heroEvents.length;

// Phones get a purpose-built product card instead of the desktop dashboard
// shrunk until unreadable: big numbers, a short live feed, one lifecycle line.
export function HeroMobileStage() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const [tick] = useTicker(inView && !reduced, 2800, 10_000);
  const feed = Array.from({ length: 3 }, (_, i) => heroEvents[(((tick - i) % N) + N) % N]);
  const step = STEP[feed[0].id];

  return (
    <div ref={ref} className="in-stage relative mx-auto mt-10 w-full max-w-[420px] text-left md:hidden">
      <div aria-hidden className="absolute inset-x-6 -top-6 bottom-6 rounded-[32px] opacity-70 blur-2xl" style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(91,91,246,.55), transparent 70%)" }} />
      <div className="app relative">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <span className="flex min-w-0 items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-iris text-[11px] font-bold text-white">YI</span>
            <span className="truncate text-[13.5px] font-semibold">Your Institute</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3">
          {[
            { k: "New leads", v: "38", c: "text-iris-600" },
            { k: "Fees collected", v: "₹3.1L", c: "text-emerald-600" },
            { k: "Enrolments", v: "21", c: "text-aqua-600" },
            { k: "To evaluate", v: "14", c: "text-violet" },
          ].map((s) => (
            <div key={s.k} className="rounded-xl bg-slate-50 px-3 py-2.5">
              <p className="text-[11.5px] text-slate-500">{s.k}</p>
              <p className={`font-display text-[22px] font-semibold leading-tight tracking-tight ${s.c}`}>{s.v}</p>
            </div>
          ))}
        </div>
        <ul className="space-y-1.5 px-3 pb-3" aria-hidden>
          {feed.map((ev, i) => {
            const Icon = ICON[ev.icon];
            return (
              <li key={`${ev.id}-${tick - i}`} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${i === 0 ? "pop bg-iris-50/70 ring-1 ring-iris-100" : "bg-white ring-1 ring-slate-100"}`}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${TONE[ev.tone]}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-semibold">{ev.title}</span>
                  <span className="block truncate text-[12px] text-slate-500">{ev.meta}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 px-1">
        <div className="flex gap-1" aria-hidden>
          {lifecycleChain.map((s, i) => (
            <span key={s} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-aqua" : "bg-white/15"}`} />
          ))}
        </div>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-white/50">
          Step {step + 1} of {lifecycleChain.length} · <span className="text-aqua">{lifecycleChain[step]}</span>
        </p>
      </div>
      <p className="mt-3 text-[11px] text-white/35">Illustrative interface · sample data</p>
    </div>
  );
}
