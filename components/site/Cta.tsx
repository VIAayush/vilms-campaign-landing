"use client";

import { ArrowRight } from "lucide-react";
import { track } from "@/lib/client/tracking";
import { useLeadForm } from "./SiteProviders";

type Props = {
  intent: "demo" | "trial";
  location: string;
  className?: string;
  children: React.ReactNode;
  arrow?: boolean;
};

// The one CTA component. Demo and trial both open the same lead form, so the
// sales team always gets the contact details; trial leads are then sent on to
// the signup page from the success screen.
export function Cta({ intent, location, className = "btn-brass", children, arrow }: Props) {
  const { openLeadForm } = useLeadForm();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        track(intent === "trial" ? "trial_click" : "cta_click", location);
        openLeadForm({ interest: intent === "trial" ? "free_trial" : "book_demo", location });
      }}
    >
      {children}
      {arrow ? <ArrowRight aria-hidden className="h-4 w-4" /> : null}
    </button>
  );
}
