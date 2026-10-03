"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Cta } from "@/components/site/Cta";
import { TrackView } from "@/components/site/TrackView";
import { track } from "@/lib/client/tracking";
import { showcase, type ShowcaseTabId } from "@/lib/landing";
import { useInView, useReducedMotion } from "./hooks";
import { AppWindow, BrandModule, CheckItem, CourseBuilderScreen, GrowModule, ManageModule, PaymentScreen, TestScreen } from "./screens";

const SCREENS: Record<ShowcaseTabId, () => React.ReactNode> = {
  teach: () => <CourseBuilderScreen />,
  assess: () => <TestScreen />,
  grow: () => <GrowModule />,
  payments: () => <PaymentScreen />,
  brand: () => <BrandModule />,
  manage: () => <ManageModule />,
};
const URLS: Record<ShowcaseTabId, string> = {
  teach: "admin/courses",
  assess: "admin/evaluations",
  grow: "admin/leads",
  payments: "admin/payments",
  brand: "admin/branding",
  manage: "admin/team",
};
const AUTOPLAY_MS = 6500;

export function Showcase() {
  const tabs = showcase.tabs;
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduced = useReducedMotion();
  const playing = auto && !paused && inView && !reduced;
  const swipe = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setI((v) => (v + 1) % tabs.length), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [playing, i, tabs.length]);

  // The nav's Product menu opens a specific module.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const idx = tabs.findIndex((t) => t.id === (e as CustomEvent<string>).detail);
      if (idx >= 0) {
        setI(idx);
        setAuto(false);
      }
    };
    window.addEventListener("vilms:showcase", onOpen);
    return () => window.removeEventListener("vilms:showcase", onOpen);
  }, [tabs]);

  const choose = (idx: number) => {
    setI(idx);
    setAuto(false);
    track("feature_view", tabs[idx].id);
  };

  const tab = tabs[i];

  return (
    <section id="product" ref={ref} aria-labelledby="showcase-title" className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[520px]" style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(91,91,246,.10), transparent 70%)" }} />
      <TrackView name="feature_view" label="showcase" />
      <div className="wrap relative">
        <div className="mx-auto max-w-[820px] text-center">
          <p className="kicker justify-center" data-reveal>
            {showcase.kicker}
          </p>
          <h2 id="showcase-title" className="h2 mt-4" data-reveal="blur" data-delay="1">
            {showcase.title}
          </h2>
          <p className="lead-text mx-auto mt-4 max-w-[600px]" data-reveal data-delay="2">
            {showcase.sub}
          </p>
        </div>

        {/* Module switcher */}
        <div className="sticky top-[76px] z-20 mt-12 flex justify-center lg:static">
          <div role="tablist" aria-label="VILMS modules" className="no-bar flex max-w-full gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-[0_12px_40px_-24px_rgba(11,16,32,.5)] backdrop-blur">
            {tabs.map((t, idx) => (
              <button
                key={t.id}
                id={`sc-tab-${t.id}`}
                role="tab"
                type="button"
                aria-selected={idx === i}
                aria-controls="sc-panel"
                tabIndex={idx === i ? 0 : -1}
                onClick={() => choose(idx)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const n = (idx + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
                    choose(n);
                    document.getElementById(`sc-tab-${tabs[n].id}`)?.focus();
                  }
                }}
                className={`relative shrink-0 overflow-hidden rounded-full px-4 py-2 text-[14px] font-semibold transition-colors sm:px-5 ${
                  idx === i ? "bg-night text-white" : "text-slate-500 hover:text-night"
                }`}
              >
                {t.label}
                {idx === i && playing ? (
                  <span
                    key={`p-${i}`}
                    aria-hidden
                    className="absolute bottom-0 left-0 h-[2px] bg-aqua"
                    style={{ animation: `sc-progress ${AUTOPLAY_MS}ms linear both` }}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div
          id="sc-panel"
          role="tabpanel"
          aria-labelledby={`sc-tab-${tab.id}`}
          className="mt-10 grid items-center gap-10 lg:mt-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div key={tab.id} className="pop order-2 lg:order-1">
            <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-iris">
              {String(i + 1).padStart(2, "0")} / {String(tabs.length).padStart(2, "0")} · {tab.label}
            </p>
            <h3 className="mt-3 font-display text-[clamp(26px,3vw,40px)] font-semibold leading-[1.08] tracking-tight">{tab.title}</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-slate-600">{tab.text}</p>
            <ul className="mt-6 space-y-2.5">
              {tab.points.map((p) => (
                <CheckItem key={p}>{p}</CheckItem>
              ))}
            </ul>
            <Cta intent="demo" location={`showcase_${tab.id}`} className="b b-dark mt-8">
              See it in a demo <ArrowRight className="h-4 w-4" aria-hidden />
            </Cta>
          </div>

          <div
            className="order-1 touch-pan-y lg:order-2"
            onPointerDown={(e) => (swipe.current = e.clientX)}
            onPointerUp={(e) => {
              if (swipe.current === null) return;
              const dx = e.clientX - swipe.current;
              swipe.current = null;
              if (Math.abs(dx) > 50) choose((i + (dx < 0 ? 1 : -1) + tabs.length) % tabs.length);
            }}
          >
            <div className="relative">
              <div aria-hidden className="absolute -inset-6 rounded-[36px] opacity-60 blur-2xl" style={{ background: "conic-gradient(from 180deg at 50% 50%, rgba(91,91,246,.25), rgba(34,211,238,.2), rgba(139,92,246,.25), rgba(91,91,246,.25))" }} />
              <AppWindow url={`yourinstitute.vilms.in/${URLS[tab.id]}`} className="relative" bodyClass="relative h-[340px] sm:h-[380px]">
                {tabs.map((t, idx) => (
                  <div
                    key={t.id}
                    aria-hidden={idx !== i}
                    className="absolute inset-0 bg-[#F7F8FC] transition-all duration-500 ease-out"
                    style={{
                      opacity: idx === i ? 1 : 0,
                      transform: idx === i ? "none" : `translateX(${idx < i ? -24 : 24}px)`,
                      filter: idx === i ? "none" : "blur(4px)",
                      pointerEvents: idx === i ? "auto" : "none",
                    }}
                  >
                    {SCREENS[t.id]()}
                  </div>
                ))}
              </AppWindow>
            </div>
            <p className="mt-3 text-center text-[12px] text-slate-400 lg:hidden">Swipe to see the next module</p>
          </div>
        </div>
      </div>
    </section>
  );
}
