"use client";

import { useEffect, useState } from "react";
import { Cta } from "./Cta";

// Keeps the main action within thumb reach on phones once the hero's own
// buttons have scrolled away.
export function MobileCtaBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Cta intent="demo" location="mobile_sticky" className="btn-brass w-full" arrow>
          Book a Demo
        </Cta>
        <Cta intent="trial" location="mobile_sticky_trial" className="btn-ghost-dark px-4">
          Free trial
        </Cta>
      </div>
    </div>
  );
}
