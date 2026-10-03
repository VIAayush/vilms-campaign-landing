"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

const mediaSubscribers = new Map<string, (onChange: () => void) => () => void>();
function subscribeMedia(query: string) {
  let sub = mediaSubscribers.get(query);
  if (!sub) {
    sub = (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    };
    mediaSubscribers.set(query, sub);
  }
  return sub;
}

/** Media query as state. Server and first client render agree on `false`. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/** True while (or once, with `once`) the element is on screen. */
export function useInView<T extends Element>(ref: RefObject<T | null>, { once = false, margin = "0px" } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) io.disconnect();
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, margin]);
  return inView;
}

// One shared scroll/resize loop for every scroll-driven scene on the page.
type Listener = () => void;
const listeners = new Set<Listener>();
let ticking = false;
function onScrollFrame() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    listeners.forEach((fn) => fn());
  });
}
function addScrollListener(fn: Listener) {
  if (listeners.size === 0) {
    window.addEventListener("scroll", onScrollFrame, { passive: true });
    window.addEventListener("resize", onScrollFrame);
  }
  listeners.add(fn);
  fn();
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0) {
      window.removeEventListener("scroll", onScrollFrame);
      window.removeEventListener("resize", onScrollFrame);
    }
  };
}

/**
 * Progress (0→1) of a tall section scrolling past a sticky viewport. Written
 * straight to the `--p` CSS variable on `target` (no React re-render per
 * frame); `onProgress` is for the few scenes that need a discrete step.
 */
export function useScrollProgress(
  section: RefObject<HTMLElement | null>,
  target: RefObject<HTMLElement | null>,
  onProgress?: (p: number) => void,
  enabled = true,
) {
  const cb = useRef(onProgress);
  useEffect(() => {
    cb.current = onProgress;
  });
  useEffect(() => {
    if (!enabled) return;
    return addScrollListener(() => {
      const el = section.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const p = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0;
      target.current?.style.setProperty("--p", p.toFixed(4));
      cb.current?.(p);
    });
  }, [section, target, enabled]);
}

/** Calls `fn` on every scroll frame (shared loop). */
export function useScrollFrame(fn: () => void, enabled = true) {
  const cb = useRef(fn);
  useEffect(() => {
    cb.current = fn;
  });
  useEffect(() => {
    if (!enabled) return;
    return addScrollListener(() => cb.current());
  }, [enabled]);
}

/** A step counter that advances every `ms` while `active`. */
export function useTicker(active: boolean, ms: number, count: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % count), ms);
    return () => window.clearInterval(id);
  }, [active, ms, count]);
  return [i, setI] as const;
}
