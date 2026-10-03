"use client";

import { useState } from "react";
import { Cta } from "@/components/site/Cta";
import { useScrollFrame } from "./hooks";

// Keeps the main action within thumb reach on phones once the hero's own
// buttons have scrolled away, and steps aside near the footer.
export function MobileCta() {
  const [show, setShow] = useState(false);
  useScrollFrame(() => {
    const y = window.scrollY;
    const nearEnd = y + window.innerHeight > document.documentElement.scrollHeight - 700;
    setShow(y > 640 && !nearEnd);
  });

  return (
    <div
      inert={!show}
      className={`fixed inset-x-3 bottom-3 z-30 rounded-2xl border border-white/10 bg-night/85 p-2 pb-[calc(8px+env(safe-area-inset-bottom))] shadow-[0_20px_50px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl transition duration-300 md:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[130%] opacity-0"
      }`}
    >
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Cta intent="demo" location="mobile_sticky" className="b b-cta w-full" arrow>
          Book a Demo
        </Cta>
        <Cta intent="trial" location="mobile_sticky_trial" className="b b-glass px-4">
          Free trial
        </Cta>
      </div>
    </div>
  );
}
