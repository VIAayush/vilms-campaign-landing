"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/client/tracking";
import type { EventName } from "@/lib/lead-schema";

/** Fires `name` once, the first time this point of the page scrolls into view. */
export function TrackView({ name, label }: { name: EventName; label?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          track(name, label);
          io.disconnect();
        }
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [name, label]);
  return <span ref={ref} aria-hidden className="block h-px w-full" />;
}
