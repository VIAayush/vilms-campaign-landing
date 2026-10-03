"use client";

import { useRef } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileText,
  IndianRupee,
  MessageCircle,
  PhoneCall,
  Radio,
  Sheet,
  Users,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { problem } from "@/lib/content";
import { oldWay } from "@/lib/landing";
import { useMediaQuery, useReducedMotion, useScrollProgress } from "./hooks";
import { LogoMark } from "./screens";

const TOOL_ICONS: LucideIcon[] = [MessageCircle, Video, ClipboardList, Sheet, CreditCard, BookOpen, PhoneCall];
const MODULE_ICONS: LucideIcon[] = [BookOpen, Radio, ClipboardCheck, FileText, IndianRupee, Users, Award];

// Scattered positions (% of the stage) for the seven tools.
const SCATTER = [
  [16, 18],
  [47, 9],
  [83, 20],
  [27, 52],
  [72, 50],
  [86, 84],
  [15, 84],
] as const;
const LINKS = [
  [0, 1],
  [1, 2],
  [0, 3],
  [3, 4],
  [2, 4],
  [4, 5],
  [3, 6],
  [6, 5],
] as const;

// 0→1 ramp of the scene progress between a and b, as a CSS expression.
const k = (a: number, b: number) => `clamp(0, calc((var(--p) - ${a}) / ${b - a}), 1)`;

function Scene({ fixed, narrow = false }: { fixed?: number; narrow?: boolean }) {
  // Phones pull everything toward the centre so edge chips aren't clipped.
  const R = narrow ? { x: 30, y: 38 } : { x: 37, y: 38 };
  const pos = (i: number) => (narrow ? ([50 + (SCATTER[i][0] - 50) * 0.72, SCATTER[i][1]] as const) : SCATTER[i]);
  const mods = oldWay.modules.map((label, i) => {
    const a = (-90 + (i * 360) / oldWay.modules.length) * (Math.PI / 180);
    return { label, x: Math.cos(a) * R.x, y: Math.sin(a) * R.y, a: 0.66 + i * 0.025 };
  });
  const converge = k(0.34, 0.6);

  return (
    <div className="relative h-full w-full" style={fixed !== undefined ? ({ "--p": fixed } as React.CSSProperties) : undefined}>
      {/* Broken connections between the tools */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden style={{ opacity: `calc(1 - ${k(0.26, 0.4)})` }}>
        {LINKS.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={pos(a)[0]}
            y1={pos(a)[1]}
            x2={pos(b)[0]}
            y2={pos(b)[1]}
            stroke="#94A3B8"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
            className="dash-flow"
          />
        ))}
      </svg>
      {LINKS.map(([a, b]) => (
        <span
          key={`x-${a}-${b}`}
          aria-hidden
          className="absolute grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-rose-50 text-rose-500 ring-1 ring-rose-200"
          style={{ left: `${(pos(a)[0] + pos(b)[0]) / 2}%`, top: `${(pos(a)[1] + pos(b)[1]) / 2}%`, opacity: `calc(1 - ${k(0.22, 0.36)})` }}
        >
          <X className="h-3 w-3" strokeWidth={3} />
        </span>
      ))}

      {/* VILMS spokes */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="spoke" x1="0" x2="1">
            <stop offset="0" stopColor="#5B5BF6" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        {mods.map((m) => (
          <line
            key={m.label}
            x1="50"
            y1="50"
            x2={50 + m.x}
            y2={50 + m.y}
            stroke="url(#spoke)"
            strokeWidth="1.6"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: k(m.a - 0.04, m.a + 0.1) }}
          />
        ))}
      </svg>

      {/* The seven tools, converging */}
      {oldWay.tools.map((t, i) => {
        const Icon = TOOL_ICONS[i];
        const [x, y] = pos(i);
        return (
          <div
            key={t.label}
            className="absolute z-[1] flex flex-col items-center"
            style={{
              left: `calc(${x}% + (50% - ${x}%) * ${converge})`,
              top: `calc(${y}% + (50% - ${y}%) * ${converge})`,
              transform: `translate(-50%, -50%) scale(calc(1 - 0.5 * ${converge}))`,
              opacity: `calc(1 - ${k(0.54, 0.64)})`,
            }}
          >
            <span className="flex items-center gap-2 whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-700 shadow-[0_10px_30px_-18px_rgba(11,16,32,.5)] sm:px-3.5 sm:text-[14px]">
              <Icon className="h-4 w-4 text-slate-500" aria-hidden /> {t.label}
            </span>
            <span className="mt-1.5 hidden whitespace-nowrap text-[11.5px] font-medium text-rose-500 sm:block" style={{ opacity: `calc(1 - ${k(0.18, 0.32)})` }}>
              {t.pain}
            </span>
          </div>
        );
      })}

      {/* VILMS core */}
      <div
        className="absolute left-1/2 top-1/2 z-[2]"
        style={{ opacity: k(0.5, 0.6), transform: `translate(-50%, -50%) scale(calc(0.45 + 0.55 * ${k(0.5, 0.66)}))` }}
      >
        <span aria-hidden className="absolute inset-[-40%] rounded-full opacity-60 blur-2xl" style={{ background: "radial-gradient(circle, rgba(91,91,246,.6), transparent 70%)" }} />
        <span className="relative grid place-items-center rounded-[28px] bg-night p-3 shadow-[0_30px_60px_-20px_rgba(91,91,246,.7)] ring-1 ring-white/10 sm:p-4">
          <LogoMark className="h-14 w-14 rounded-2xl sm:h-[72px] sm:w-[72px]" />
          <span className="mt-2 font-display text-[13px] font-semibold tracking-tight text-white">VILMS</span>
        </span>
      </div>

      {/* Modules around the core */}
      {mods.map((m, i) => {
        const Icon = MODULE_ICONS[i];
        const c = k(m.a, m.a + 0.12);
        return (
          <span
            key={m.label}
            className="absolute z-[1] flex items-center gap-1.5 whitespace-nowrap rounded-full border border-iris-100 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-night shadow-[0_12px_30px_-16px_rgba(91,91,246,.6)] sm:px-3 sm:text-[13.5px]"
            style={{
              left: `calc(50% + ${m.x}% * ${c})`,
              top: `calc(50% + ${m.y}% * ${c})`,
              transform: "translate(-50%, -50%)",
              opacity: c,
            }}
          >
            <Icon className="h-3.5 w-3.5 text-iris" aria-hidden /> {m.label}
          </span>
        );
      })}
    </div>
  );
}

function Headings({ fixed }: { fixed?: "before" | "after" }) {
  return (
    <div className="relative mx-auto max-w-[900px] text-center">
      <div style={fixed ? undefined : { opacity: `calc(1 - ${k(0.34, 0.45)})`, transform: `translateY(calc(-24px * ${k(0.34, 0.45)}))` }} hidden={fixed === "after"}>
        <p className="kicker justify-center">{oldWay.kicker}</p>
        <h2 className="h2 mt-4">{oldWay.title}</h2>
      </div>
      <div
        className={fixed ? "" : "absolute inset-x-0 top-0"}
        style={fixed ? undefined : { opacity: k(0.46, 0.58), transform: `translateY(calc(24px * (1 - ${k(0.46, 0.58)})))` }}
        hidden={fixed === "before"}
      >
        <p className="kicker justify-center">One platform</p>
        <h2 className="h2 mt-4">
          <span className="grad-text">{oldWay.meet}</span>
        </h2>
        <p className="lead-text mx-auto mt-3 max-w-[560px]">{oldWay.meetSub}</p>
      </div>
    </div>
  );
}

export function OldWay() {
  const section = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const small = useMediaQuery("(max-width: 639px)");
  useScrollProgress(section, scene, undefined, !reduced);

  return (
    <section id="old-way" aria-label="From seven tools to one platform" className="relative bg-snow">
      {reduced ? (
        <div className="wrap py-24">
          <Headings fixed="before" />
          <div className="mx-auto mt-10 aspect-[16/10] max-w-[880px]">
            <Scene fixed={0} narrow={small} />
          </div>
          <div className="my-14 flex justify-center text-iris">
            <ArrowRight className="h-8 w-8 rotate-90" aria-hidden />
          </div>
          <Headings fixed="after" />
          <div className="mx-auto mt-10 aspect-[16/10] max-w-[880px]">
            <Scene fixed={1} narrow={small} />
          </div>
        </div>
      ) : (
        <div ref={section} className={small ? "h-[260vh]" : "h-[300vh]"}>
          <div ref={scene} className="sticky top-0 flex h-[100svh] flex-col overflow-hidden pb-6 pt-24 sm:pt-28" style={{ "--p": 0 } as React.CSSProperties}>
            <div aria-hidden className="grid-bg-light absolute inset-0" />
            <div className="wrap relative">
              <Headings />
            </div>
            <div className="wrap relative mt-6 min-h-0 flex-1 sm:mt-10">
              <div className="relative mx-auto h-full max-w-[920px]">
                <Scene narrow={small} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What each broken link costs, and what replaces it */}
      <div className="wrap pb-24 pt-8 max-sm:pb-16 sm:pb-32">
        <div className="mx-auto max-w-[1040px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_30px_80px_-50px_rgba(11,16,32,.45)]">
          <div className="grid grid-cols-[1fr_1fr] border-b border-slate-100 bg-slate-50/70 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400 max-sm:hidden sm:px-8">
            <span>Before</span>
            <span>With VILMS</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {problem.items.map((it) => (
              <li key={it.n} data-reveal className="grid grid-cols-1 gap-2 px-5 py-5 sm:grid-cols-[1fr_1fr] sm:gap-8 sm:px-8">
                <div>
                  <p className="text-[15px] font-semibold text-slate-400 line-through decoration-rose-300 decoration-2">{it.title}</p>
                  <p className="mt-1 text-[13.5px] text-slate-400">{it.pain}</p>
                </div>
                <span className="-mb-1 mt-1 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-iris sm:hidden">With VILMS</span>
                <p className="flex items-start gap-2.5 text-[15px] font-medium text-night">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-iris" aria-hidden /> {it.fix}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <p data-reveal className="mx-auto mt-8 max-w-[760px] text-center text-[15px] text-slate-500">{problem.closing}</p>
      </div>
    </section>
  );
}
