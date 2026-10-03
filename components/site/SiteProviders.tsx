"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Interest } from "@/lib/lead-options";
import { captureTouch, track } from "@/lib/client/tracking";
import { LeadDialog } from "./LeadDialog";

export type LeadIntent = { interest: Interest; location: string };

const LeadFormContext = createContext<{ openLeadForm: (intent: LeadIntent) => void } | null>(null);

export function useLeadForm() {
  const ctx = useContext(LeadFormContext);
  if (!ctx) throw new Error("useLeadForm must be used inside <SiteProviders>");
  return ctx;
}

// Every CTA on the site opens this one form — one consistent lead flow.
export function SiteProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [intent, setIntent] = useState<LeadIntent | null>(null);
  const lastViewed = useRef<string | null>(null);

  useEffect(() => {
    // One page_view per navigation, even when React re-runs effects.
    if (lastViewed.current === pathname) return;
    lastViewed.current = pathname;
    captureTouch();
    track("page_view");
  }, [pathname]);

  useEffect(() => armReveal(), [pathname]);

  // demo_form_open is recorded by the form itself when it mounts, so the
  // dialog and the /demo page count the same way.
  const openLeadForm = useCallback((next: LeadIntent) => setIntent(next), []);

  const value = useMemo(() => ({ openLeadForm }), [openLeadForm]);

  return (
    <LeadFormContext.Provider value={value}>
      {children}
      <LeadDialog intent={intent} onClose={() => setIntent(null)} />
    </LeadFormContext.Provider>
  );
}

// Fades sections in on scroll. Anything already on screen is marked shown
// before the hidden state is armed (no flash). As a safety net, a timer shows
// whatever is on or above the screen after 3s even if the observer never
// fired, so readable content can't get stuck invisible, while content further
// down still reveals as it's reached.
function armReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  const vh = window.innerHeight;
  els.forEach((el) => {
    if (el.getBoundingClientRect().top < vh * 0.95) el.dataset.shown = "true";
  });
  document.documentElement.classList.add("reveal-armed");

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).dataset.shown = "true";
          io.unobserve(e.target);
        }
      }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );
  els.filter((el) => el.dataset.shown !== "true").forEach((el) => io.observe(el));
  const safety = window.setTimeout(() => {
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.dataset.shown = "true";
    });
  }, 3000);
  return () => {
    io.disconnect();
    window.clearTimeout(safety);
  };
}
