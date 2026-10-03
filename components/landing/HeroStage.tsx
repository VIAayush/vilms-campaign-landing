"use client";

import { useRef, useState } from "react";
import { Award, CalendarCheck, GraduationCap, IndianRupee, Radio, ShoppingBag, Sparkles, UserPlus } from "lucide-react";
import { heroEvents, lifecycleChain, type HeroEvent } from "@/lib/landing";
import { useInView, useReducedMotion, useScrollFrame, useTicker } from "./hooks";
import { AppWindow, DashboardScreen } from "./screens";

const ICON = { lead: UserPlus, enrol: GraduationCap, cart: ShoppingBag, live: Radio, eval: Sparkles, pay: IndianRupee, cert: Award, webinar: CalendarCheck } as const;
const TONE: Record<HeroEvent["tone"], string> = {
  iris: "bg-iris-50 text-iris-600",
  aqua: "bg-aqua-50 text-aqua-600",
  violet: "bg-violet/10 text-violet",
  rose: "bg-rose-50 text-rose-600",
  emerald: "bg-emerald-50 text-emerald-600",
  sun: "bg-sun-50 text-amber-600",
};
// Which lifecycle step each event belongs to.
const STEP: Record<HeroEvent["id"], number> = { lead: 0, enrol: 1, purchase: 2, live: 3, eval: 4, pay: 5, cert: 6, webinar: 0 };

const N = heroEvents.length;

function Toast({ ev, className = "", style }: { ev: HeroEvent; className?: string; style?: React.CSSProperties }) {
  const Icon = ICON[ev.icon];
  return (
    <div className={`toast pop flex w-[248px] items-center gap-3 p-3 ${className}`} style={style}>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${TONE[ev.tone]}`}>
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold tracking-tight">{ev.title}</span>
        <span className="block truncate text-[11.5px] text-slate-500">{ev.meta}</span>
      </span>
      <span className="ml-auto self-start text-[10px] text-slate-400">now</span>
    </div>
  );
}

// Where the floating notifications sit around the window (desktop).
const SLOTS = [
  "left-[-5%] top-[16%] hidden lg:flex",
  "right-[-4%] top-[6%] hidden md:flex",
  "right-[-6%] bottom-[22%] hidden lg:flex",
  "left-[-3%] bottom-[8%] hidden md:flex",
];

export function HeroStage() {
  const wrap = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(wrap);
  const [tick] = useTicker(inView && !reduced, 2600, 10_000);

  // Slot k shows the event that most recently landed in it.
  const slotEvent = (k: number) => {
    const last = tick - ((((tick - k) % SLOTS.length) + SLOTS.length) % SLOTS.length);
    return { ev: heroEvents[((last % N) + N) % N], key: last };
  };
  const current = heroEvents[tick % N];
  const feed = Array.from({ length: 4 }, (_, i) => heroEvents[(((tick - i) % N) + N) % N]);
  const [hover, setHover] = useState(false);

  // The product "lands" as it scrolls into view: tilt flattens, scale settles.
  useScrollFrame(() => {
    const el = wrap.current;
    const t = tilt.current;
    if (!el || !t) return;
    const r = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight * 0.95)));
    t.style.transform = `perspective(1800px) rotateX(${(1 - p) * 14}deg) scale(${0.93 + p * 0.07})`;
  }, !reduced);

  return (
    <div ref={wrap} className="in-stage relative mx-auto mt-14 w-full max-w-[1120px] text-left sm:mt-16">
      {/* glow under the product */}
      <div aria-hidden className="absolute inset-x-[8%] -top-10 bottom-10 rounded-[40px] opacity-70 blur-3xl" style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(91,91,246,.55), transparent 70%)" }} />

      <div ref={tilt} className="relative origin-top will-change-transform" style={{ transform: reduced ? undefined : "perspective(1800px) rotateX(14deg) scale(.93)" }}>
        <AppWindow url="yourinstitute.vilms.in/admin" className="relative">
          <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <DashboardScreen
              feed={
                <ul className="space-y-1.5" aria-live="off">
                  {feed.map((ev, i) => {
                    const Icon = ICON[ev.icon];
                    return (
                      <li
                        key={`${ev.id}-${tick - i}`}
                        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${i === 0 ? "pop bg-slate-50" : ""} ${hover && i === 0 ? "ring-1 ring-iris-100" : ""}`}
                      >
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${TONE[ev.tone]}`}>
                          <Icon className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11.5px] font-semibold">{ev.title}</span>
                          <span className="block truncate text-[10px] text-slate-400">{ev.meta}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              }
            />
          </div>
        </AppWindow>

        {SLOTS.map((pos, k) => {
          const { ev, key } = slotEvent(k);
          return <Toast key={`${k}-${key}`} ev={ev} className={`absolute z-10 ${pos}`} style={{ animationDelay: tick === 0 ? `${1.1 + k * 0.25}s` : undefined }} />;
        })}
        {/* Phones: one notification over the bottom edge */}
        <div className="absolute inset-x-0 -bottom-7 z-10 flex justify-center md:hidden">
          <Toast key={`m-${tick}`} ev={current} />
        </div>
      </div>

      {/* The lifecycle the notifications walk through */}
      <ol className="relative mx-auto mt-12 flex max-w-[980px] items-center justify-between gap-1 overflow-x-auto px-1 no-bar sm:mt-14" aria-label="Student lifecycle">
        <span aria-hidden className="absolute left-4 right-4 top-1/2 h-px -translate-y-1/2 bg-white/10" />
        {lifecycleChain.map((s, i) => {
          const on = STEP[current.id] === i;
          return (
            <li
              key={s}
              className={`relative z-[1] shrink-0 rounded-full border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-all duration-500 ${
                on ? "border-aqua/60 bg-night-3 text-aqua shadow-[0_0_24px_-4px_rgba(34,211,238,.6)]" : "border-white/10 bg-night text-white/40"
              }`}
            >
              {s}
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-center text-[11.5px] text-white/35">Illustrative interface · sample data</p>
    </div>
  );
}
