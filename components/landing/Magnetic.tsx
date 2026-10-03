"use client";

import { useRef } from "react";
import { useReducedMotion } from "./hooks";

/** Leans its child a few pixels toward the pointer. Decorative only. */
export function Magnetic({ children, strength = 0.22, className = "" }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  return (
    <span
      ref={ref}
      className={`inline-flex transition-transform duration-300 ease-out ${className}`}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return;
        const r = ref.current!.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * strength;
        const y = (e.clientY - (r.top + r.height / 2)) * strength;
        ref.current!.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      {children}
    </span>
  );
}
