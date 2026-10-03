"use client";

import { useEffect, useRef, useState } from "react";
import { teach } from "@/lib/landing";
import { useMediaQuery, useReducedMotion, useScrollProgress } from "./hooks";
import { AppWindow, CourseBuilderScreen, LiveClassScreen, MaterialsScreen, VideoScreen, WebinarScreen } from "./screens";

const SCREENS: Record<string, () => React.ReactNode> = {
  builder: () => <CourseBuilderScreen />,
  video: () => <VideoScreen />,
  live: () => <LiveClassScreen />,
  webinar: () => <WebinarScreen />,
  materials: () => <MaterialsScreen />,
};
const URLS: Record<string, string> = {
  builder: "admin/courses/prelims-foundation",
  video: "learn/polity-essentials",
  live: "admin/live-classes",
  webinar: "webinar/first-90-days",
  materials: "admin/materials",
};

function Panel({ p, wide }: { p: (typeof teach.panels)[number]; wide: boolean }) {
  return (
    <article
      className={`shrink-0 snap-center overflow-hidden rounded-[28px] border border-white/70 bg-white/70 shadow-[0_40px_90px_-50px_rgba(11,16,32,.55)] backdrop-blur ${
        wide ? "grid w-[min(1000px,78vw)] grid-cols-[0.8fr_1.2fr] items-center gap-8 p-8" : "w-[86vw] max-w-[520px] p-4 sm:p-6"
      }`}
    >
      <div className={wide ? "" : "order-2 px-2 pb-2 pt-5"}>
        <p className="font-mono text-[12px] text-iris">{p.n}</p>
        <h3 className="mt-2 font-display text-[clamp(22px,2.4vw,32px)] font-semibold leading-tight tracking-tight">{p.title}</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{p.text}</p>
      </div>
      <AppWindow url={`yourinstitute.vilms.in/${URLS[p.id]}`} className="!shadow-[0_30px_60px_-30px_rgba(11,16,32,.45)]" bodyClass="h-[300px] bg-[#F7F8FC]">
        {SCREENS[p.id]()}
      </AppWindow>
    </article>
  );
}

function Heading() {
  return (
    <div className="max-w-[640px]">
      <p className="kicker">{teach.kicker}</p>
      <h2 className="h2 mt-4">{teach.title}</h2>
      <p className="lead-text mt-4 max-w-[540px]">{teach.sub}</p>
    </div>
  );
}

export function TeachSection() {
  const reduced = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const pinned = desktop && !reduced;
  const section = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const trackEl = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const carousel = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const onCarouselScroll = () => {
    const el = carousel.current;
    if (!el) return;
    const w = (el.children[0] as HTMLElement | undefined)?.offsetWidth ?? el.clientWidth;
    setSlide(Math.max(0, Math.min(teach.panels.length - 1, Math.round(el.scrollLeft / (w + 16)))));
  };

  useScrollProgress(section, scene, (p) => bar.current?.style.setProperty("transform", `scaleX(${p})`), pinned);

  // The section is as tall as the horizontal distance the track travels.
  useEffect(() => {
    if (!pinned) return;
    const measure = () => {
      const t = trackEl.current;
      const s = section.current;
      if (!t || !s) return;
      const dist = Math.max(0, t.scrollWidth - document.documentElement.clientWidth);
      scene.current?.style.setProperty("--dist", `${dist}px`);
      s.style.height = `${window.innerHeight + dist}px`;
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackEl.current) ro.observe(trackEl.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  const bg = (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #F1F1FF 0%, #F6F7FB 60%, #EEF9FC 100%)" }} />
      <div className="glow -right-32 top-10 h-[420px] w-[420px] bg-aqua/20" />
      <div className="glow -left-24 bottom-0 h-[380px] w-[380px] bg-iris/15" />
    </div>
  );

  if (!pinned) {
    return (
      <section id="teach" aria-label={teach.title} className="relative isolate overflow-hidden py-24 sm:py-28">
        {bg}
        <div className="wrap">
          <Heading />
        </div>
        <div
          ref={carousel}
          onScroll={onCarouselScroll}
          className="no-bar mt-10 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-6 max-sm:mt-8 sm:scroll-px-8 sm:px-8"
          tabIndex={0}
          aria-label="Teaching features — scroll sideways"
        >
          {teach.panels.map((p) => (
            <Panel key={p.id} p={p} wide={false} />
          ))}
        </div>
        <div className="wrap flex items-center justify-between gap-4">
          <div className="flex gap-1.5" role="group" aria-label="Go to panel">
            {teach.panels.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-label={`${p.title} (${i + 1} of ${teach.panels.length})`}
                aria-current={i === slide ? "true" : undefined}
                onClick={() => {
                  const el = carousel.current?.children[i] as HTMLElement | undefined;
                  carousel.current?.scrollTo({ left: (el?.offsetLeft ?? 0) - 20, behavior: reduced ? "auto" : "smooth" });
                }}
                className="grid h-11 w-7 place-items-center"
              >
                <span className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-6 bg-iris" : "w-1.5 bg-slate-300"}`} />
              </button>
            ))}
          </div>
          <p className="font-mono text-[12px] text-slate-400">
            {slide + 1} / {teach.panels.length} · swipe
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="teach" aria-label={teach.title} className="relative isolate">
      {bg}
      <div ref={section} style={{ height: "400vh" }}>
        <div ref={scene} className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden" style={{ "--p": 0, "--dist": "0px" } as React.CSSProperties}>
          <div className="wrap flex items-end justify-between gap-8 pt-16 [&_.h2]:!text-[clamp(30px,3.6vw,52px)] [&_.lead-text]:!mt-3">
            <Heading />
            <div className="mb-2 hidden w-[220px] lg:block">
              <div className="h-[3px] overflow-hidden rounded-full bg-slate-200">
                <span ref={bar} className="block h-full origin-left bg-gradient-to-r from-iris to-aqua" style={{ transform: "scaleX(0)" }} />
              </div>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">Scroll to explore</p>
            </div>
          </div>
          <div
            ref={trackEl}
            className="mt-10 flex w-max gap-8 pl-[max(32px,calc((100vw_-_1240px)/2_+_32px))] pr-16 will-change-transform"
            style={{ transform: "translate3d(calc(var(--p) * -1 * var(--dist)), 0, 0)" }}
          >
            {teach.panels.map((p) => (
              <Panel key={p.id} p={p} wide />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
