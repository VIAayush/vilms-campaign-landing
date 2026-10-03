"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { LeadForm } from "./LeadForm";
import type { LeadIntent } from "./SiteProviders";

// Native <dialog>: focus trapping, Esc to close and the top layer come from
// the browser, not from hand-rolled code.
export function LeadDialog({ intent, onClose }: { intent: LeadIntent | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (intent && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    }
    if (!intent && dialog.open) dialog.close();
  }, [intent]);

  const isTrial = intent?.interest === "free_trial";

  return (
    <dialog
      ref={ref}
      aria-labelledby="lead-dialog-title"
      onClose={() => {
        document.body.style.overflow = "";
        onClose();
      }}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes it.
        if (e.target === ref.current) ref.current?.close();
      }}
      className="m-auto max-h-[92dvh] w-[min(640px,calc(100vw-24px))] overflow-y-auto rounded-2xl bg-paper p-0 text-body shadow-float"
    >
      {intent ? (
        <div className="relative p-5 sm:p-8">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full text-muted transition hover:bg-paper-2 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="eyebrow">{isTrial ? "Start your 14-day trial" : "Book a VILMS demo · 30 minutes"}</p>
          <h2 id="lead-dialog-title" className="mt-2 pr-10 text-[26px] font-bold leading-tight sm:text-[30px]">
            {isTrial ? "Tell us about your institute" : "See how VILMS fits your institute"}
          </h2>
          <p className="mt-2 text-[14.5px] text-muted">
            {isTrial
              ? "Free for 14 days, no card needed. Plans from ₹499/month after."
              : "We'll walk through your current setup and show exactly what moves over — courses, students and all."}
          </p>
          <div className="mt-6">
            {/* Remounted per open so every attempt gets a fresh submission id. */}
            <LeadForm key={`${intent.location}-${intent.interest}`} interest={intent.interest} location={intent.location} onClose={() => ref.current?.close()} />
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
