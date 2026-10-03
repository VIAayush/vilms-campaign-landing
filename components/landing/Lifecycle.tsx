"use client";

import { useEffect, useRef, useState } from "react";
import { lifecycle } from "@/lib/landing";
import { useReducedMotion, useScrollProgress } from "./hooks";
import {
  AppWindow,
  CertificateScreen,
  CourseBuilderScreen,
  LeadScreen,
  LiveClassScreen,
  PaymentScreen,
  RenewalScreen,
  StudentScreen,
  TestScreen,
} from "./screens";

function CourseStage() {
  return <CourseBuilderScreen compact />;
}
function CertificateStage() {
  return <CertificateScreen />;
}
const SCREENS = [LeadScreen, StudentScreen, CourseStage, LiveClassScreen, TestScreen, PaymentScreen, CertificateStage, RenewalScreen];
const URLS = ["leads", "students/rahul-kumar", "courses/prelims-foundation", "live-classes", "evaluations/q3", "payments/2041", "certificates", "batches/next"];
const COUNT = lifecycle.stages.length;

export function Lifecycle() {
  const section = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useScrollProgress(section, scene, (p) => setActive(Math.min(COUNT - 1, Math.floor(p * COUNT * 0.999))), !reduced);

  // Keep the active chip visible in the phone stepper.
  useEffect(() => {
    const list = chips.current;
    const el = list?.children[active] as HTMLElement | undefined;
    if (list && el) list.scrollTo({ left: el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2, behavior: reduced ? "auto" : "smooth" });
  }, [active, reduced]);

  const go = (i: number) => {
    if (reduced || !section.current) return setActive(i);
    const el = section.current;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / COUNT) * range, behavior: "smooth" });
  };

  const stage = lifecycle.stages[active];

  const body = (
    <div ref={scene} className={`${reduced ? "py-24" : "sticky top-0 flex h-[100svh] items-center overflow-hidden py-20"}`} style={{ "--p": 0 } as React.CSSProperties}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow -left-40 top-1/4 h-[480px] w-[480px] bg-iris/30" />
        <div className="glow -right-40 bottom-0 h-[420px] w-[420px] bg-aqua/15" />
      </div>
      <div className="wrap grid w-full items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <p className="kicker on-dark">{lifecycle.kicker}</p>
          <h2 className="h2 mt-4 max-w-[560px] !text-[clamp(30px,4.2vw,56px)]">{lifecycle.title}</h2>
          <p className="lead-text mt-4 max-w-[480px]">{lifecycle.sub}</p>

          {/* Desktop: vertical stepper */}
          <ol className="relative mt-9 hidden lg:block" aria-label="Lifecycle stages">
            <span aria-hidden className="absolute bottom-3 left-[11px] top-3 w-px bg-white/10" />
            <span
              aria-hidden
              className="absolute left-[11px] top-3 w-px origin-top bg-gradient-to-b from-iris via-violet to-aqua transition-[height] duration-500"
              style={{ height: `calc((100% - 24px) * ${active / (COUNT - 1)})` }}
            />
            {lifecycle.stages.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === active ? "step" : undefined}
                  className="group relative flex w-full items-center gap-4 py-[7px] text-left"
                >
                  <span
                    className={`relative z-[1] grid h-[23px] w-[23px] place-items-center rounded-full border font-mono text-[10px] transition-all duration-300 ${
                      i === active ? "border-aqua bg-aqua text-night shadow-[0_0_20px_rgba(34,211,238,.6)]" : i < active ? "border-iris bg-iris text-white" : "border-white/20 bg-night text-white/40"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`font-display text-[17px] font-medium tracking-tight transition-colors ${i === active ? "text-white" : "text-white/40 group-hover:text-white/70"}`}>
                    {s.label}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div>
          {/* Phones: horizontal stepper */}
          <ol ref={chips} className="no-bar -mx-5 mb-5 flex gap-2 overflow-x-auto px-5 lg:hidden" aria-label="Lifecycle stages">
            {lifecycle.stages.map((s, i) => (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === active ? "step" : undefined}
                  className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition ${
                    i === active ? "border-aqua bg-aqua/10 text-aqua" : "border-white/10 text-white/45"
                  }`}
                >
                  {i + 1} · {s.label}
                </button>
              </li>
            ))}
          </ol>

          <div className="relative">
            <AppWindow url={`yourinstitute.vilms.in/${URLS[active]}`} className="relative" bodyClass="relative h-[300px] sm:h-[340px]">
              {SCREENS.map((Screen, i) => (
                <div
                  key={i}
                  aria-hidden={i !== active}
                  className="absolute inset-0 bg-[#F7F8FC] transition-all duration-500 ease-out"
                  style={{ opacity: i === active ? 1 : 0, transform: i === active ? "none" : `translateY(${i < active ? -14 : 14}px) scale(.98)` }}
                >
                  <Screen />
                </div>
              ))}
            </AppWindow>
            <div className="mt-5 flex items-start gap-4" aria-live="polite">
              <span className="font-mono text-[12px] text-aqua">{String(active + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-display text-[20px] font-semibold tracking-tight">{stage.title}</p>
                <p className="mt-1 max-w-[520px] text-[15px] text-white/60">{stage.text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="lifecycle" aria-label={lifecycle.title} className="sec-dark noise">
      {reduced ? body : <div ref={section} className="h-[460vh]">{body}</div>}
    </section>
  );
}
