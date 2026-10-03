"use client";

import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";

/** On phones the filter grid folds away behind a button; on desktop it's always shown. */
export function CollapsibleFilters({ activeCount, children }: { activeCount: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(activeCount > 0);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="lead-filters"
        className="mt-3 flex w-full items-center justify-between rounded-lg border border-line px-3 py-2 text-[13.5px] font-semibold text-ink lg:hidden"
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4" aria-hidden />
          Filters{activeCount ? ` (${activeCount} active)` : ""}
        </span>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      <div id="lead-filters" className={`${open ? "grid" : "hidden"} mt-3 gap-3 sm:grid-cols-2 lg:mt-3 lg:grid lg:grid-cols-4`}>
        {children}
      </div>
    </>
  );
}
