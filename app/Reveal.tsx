"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scroll-triggered reveal, vanilla IntersectionObserver — no animation library.
 * Under prefers-reduced-motion, starts (and stays) visible via lazy initial
 * state rather than a setState call inside the effect body, which the
 * main repo's react-hooks/set-state-in-effect rule flags as a render cascade.
 */
export function Reveal({
  children, className, as: Tag = "div", delay = 0,
}: { children: ReactNode; className?: string; as?: "div" | "section"; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(prefersReducedMotion);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.12 },
    );
    io.observe(el);
    // Fail safe: a reveal that never fires (a missed observer callback, an
    // element that's technically visible but never crosses the threshold)
    // must not leave marketing copy permanently invisible.
    const fallback = window.setTimeout(() => setVisible(true), 2500);
    return () => { io.disconnect(); window.clearTimeout(fallback); };
  }, [visible]);

  const Comp = Tag;
  return (
    <Comp
      ref={ref as never}
      className={className}
      data-reveal
      data-visible={visible ? "true" : "false"}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Comp>
  );
}

/** Counts up to `value` once visible. Renders the final value immediately under reduced motion. */
export function CountUp({ value, prefix = "", suffix = "", decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useState(prefersReducedMotion)[0];
  const [display, setDisplay] = useState(() => (reduced ? value : 0));
  const [done, setDone] = useState(reduced);

  useEffect(() => {
    const el = ref.current;
    if (!el || done) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const duration = 900;
        function tick(now: number) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(value * eased);
          if (t < 1) requestAnimationFrame(tick);
          else setDone(true);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, done]);

  const shown = done ? value : display;
  return (
    <span ref={ref}>
      {prefix}{decimals ? shown.toFixed(decimals) : Math.round(shown).toLocaleString("en-IN")}{suffix}
    </span>
  );
}
